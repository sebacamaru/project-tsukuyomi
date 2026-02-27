/**
 * Slider infinito con swipe para tiras de sprites en background-image.
 * Usa background-repeat: repeat-x + background-position-x para loop seamless.
 *
 * @example
 * const swiper = new SpriteSwiper(element, {
 *   itemWidth: 24,
 *   itemCount: 4,
 *   scaleFn: () => spriteScale,
 *   onSnap: (index) => console.log("Seleccionado:", index),
 *   hitArea: { left: -20, top: -15, width: 64, height: 43 },
 * });
 * // cleanup:
 * swiper.destroy();
 */
export class SpriteSwiper {
  /**
   * @param {HTMLElement} el - Elemento con el background-image a animar
   * @param {Object} opts
   * @param {number} opts.itemWidth - Ancho de un item en px sprite
   * @param {number} opts.itemCount - Cantidad total de items en la tira
   * @param {Function} opts.scaleFn - Retorna el factor de escala CSS actual
   * @param {Function} [opts.onSnap] - Callback con el indice al hacer snap
   * @param {number} [opts.initialIndex=0]
   * @param {{left:number,top:number,width:number,height:number}} [opts.hitArea] - Rect manual del hit area (px sprite)
   */
  constructor(el, { itemWidth, itemCount, scaleFn, onSnap, initialIndex = 0, hitArea }) {
    this._el = el;
    this._hitEl = this._createHitArea(el, hitArea);
    this._itemW = itemWidth;
    this._count = itemCount;
    this._totalW = itemWidth * itemCount;
    this._scaleFn = scaleFn || (() => 1);
    this._onSnap = onSnap || (() => {});

    // Estado de posicion (coordenadas sprite-pixel)
    this._pos = 0;
    this._velocity = 0; // px/ms
    this._dragging = false;
    this._lastX = 0;
    this._lastTime = 0;
    this._rafId = null;

    // Ajustes de fisica
    this._friction = 0.93;
    this._snapSpeed = 0.18;
    this._snapEpsilon = 0.15;
    this._velThreshold = 0.008; // px/ms

    // Bindear handlers al hit area (puede ser distinto al elemento visual)
    this._onDown = (e) => this._pointerDown(e);
    this._onMove = (e) => this._pointerMove(e);
    this._onUp = (e) => this._pointerUp(e);

    this._disabled = false;

    this._hitEl.addEventListener("pointerdown", this._onDown);
    this._hitEl.addEventListener("pointermove", this._onMove);
    this._hitEl.addEventListener("pointerup", this._onUp);
    this._hitEl.addEventListener("pointercancel", this._onUp);

    this.setIndex(initialIndex);
  }

  // -- API publica --

  getCurrentIndex() {
    const wrapped = this._wrap(this._pos);
    const raw = Math.round(wrapped / this._itemW);
    return ((raw % this._count) + this._count) % this._count;
  }

  setIndex(index) {
    this._cancelRaf();
    this._pos = index * this._itemW;
    this._velocity = 0;
    this._apply();
  }

  goToIndex(index) {
    this._cancelRaf();
    this._velocity = 0;
    this._snapTo(index * this._itemW);
  }

  disable() {
    this._disabled = true;
    this._cancelRaf();
    if (this._dragging && this._hitEl) {
      this._dragging = false;
    }
  }

  enable() {
    this._disabled = false;
  }

  destroy() {
    this._cancelRaf();
    if (!this._hitEl) return;
    this._hitEl.removeEventListener("pointerdown", this._onDown);
    this._hitEl.removeEventListener("pointermove", this._onMove);
    this._hitEl.removeEventListener("pointerup", this._onUp);
    this._hitEl.removeEventListener("pointercancel", this._onUp);
    if (this._hitEl !== this._el && this._hitEl.parentNode) {
      this._hitEl.parentNode.removeChild(this._hitEl);
    }
    this._el = null;
    this._hitEl = null;
  }

  // -- Manejo de pointer --

  _pointerDown(e) {
    if (this._disabled || this._dragging) return;
    this._hitEl.setPointerCapture(e.pointerId);
    this._dragging = true;
    this._velocity = 0;
    this._lastX = e.clientX;
    this._lastTime = performance.now();
    this._cancelRaf();
  }

  _pointerMove(e) {
    if (!this._dragging) return;
    const now = performance.now();
    const dt = now - this._lastTime;
    const scale = this._scaleFn();
    const dx = (e.clientX - this._lastX) / scale;

    this._pos -= dx; // negar: swipe derecha → siguiente accion
    if (dt > 0) this._velocity = -dx / dt;

    this._lastX = e.clientX;
    this._lastTime = now;
    this._apply();
  }

  _pointerUp(e) {
    if (!this._dragging) return;
    this._dragging = false;
    this._hitEl.releasePointerCapture(e.pointerId);
    this._startInertia();
  }

  // -- Animacion --

  _startInertia() {
    this._lastFrame = performance.now();
    this._tick();
  }

  _tick() {
    if (this._dragging) return;

    const now = performance.now();
    const dt = now - this._lastFrame;
    this._lastFrame = now;

    this._pos += this._velocity * dt;
    this._velocity *= Math.pow(this._friction, dt / 16.67);

    if (Math.abs(this._velocity) < this._velThreshold) {
      // Velocidad suficientemente baja → snap
      const nearest = Math.round(this._wrap(this._pos) / this._itemW) * this._itemW;
      this._snapTo(nearest);
      return;
    }

    this._apply();
    this._rafId = requestAnimationFrame(() => this._tick());
  }

  _snapTo(target) {
    // Normalizar target relativo a pos actual (camino mas corto)
    let wrapped = this._wrap(this._pos);
    let diff = target - wrapped;
    if (Math.abs(diff) > this._totalW / 2) {
      diff -= Math.sign(diff) * this._totalW;
    }
    // Usar target absoluto para evitar problemas de re-wrap en boundaries
    const absTarget = this._pos + (target - wrapped) + (diff - (target - wrapped));

    const step = () => {
      if (this._dragging) return;

      const remaining = absTarget - this._pos;

      if (Math.abs(remaining) < this._snapEpsilon) {
        this._pos = absTarget;
        this._velocity = 0;
        this._apply();
        this._onSnap(this.getCurrentIndex());
        return;
      }

      this._pos += remaining * this._snapSpeed;
      this._apply();
      this._rafId = requestAnimationFrame(step);
    };

    this._rafId = requestAnimationFrame(step);
  }

  // -- Hit area --

  _createHitArea(el, area) {
    if (!area) return el;
    const hit = document.createElement("div");
    hit.style.cssText = `
      position: absolute;
      left: ${area.left}px;
      top: ${area.top}px;
      width: ${area.width}px;
      height: ${area.height}px;
      touch-action: none;
      cursor: grab;
    `;
    const container = el.parentNode.parentNode || el.parentNode;
    container.appendChild(hit);
    return hit;
  }

  // -- Helpers --

  _wrap(v) {
    return ((v % this._totalW) + this._totalW) % this._totalW;
  }

  _apply() {
    this._pos = this._wrap(this._pos);
    this._el.style.backgroundPositionX = `${-this._pos}px`;
  }

  _cancelRaf() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }
}
