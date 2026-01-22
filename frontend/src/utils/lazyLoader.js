/**
 * Verifica si un elemento está visible en el viewport
 */
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top < window.innerHeight + 200 &&
    rect.bottom > -200 &&
    rect.left < window.innerWidth + 200 &&
    rect.right > -200
  );
}

/**
 * Carga una imagen lazy y remueve la clase cuando termina de cargar
 */
function loadImage(img) {
  const src = img.dataset.src;
  img.src = src;

  // Si la imagen ya está en cache, complete será true inmediatamente
  if (img.complete) {
    img.classList.remove("lazy");
  } else {
    img.onload = () => img.classList.remove("lazy");
    img.onerror = () => img.classList.remove("lazy");
  }
}

export function initLazyImages(root = document) {
  const imgs = Array.from(root.querySelectorAll("img.lazy"));

  if (!("IntersectionObserver" in window)) {
    imgs.forEach(loadImage);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          loadImage(e.target);
          io.unobserve(e.target);
        }
      }
    },
    {
      root: null,
      rootMargin: "200px",
    },
  );

  imgs.forEach((img) => {
    // Si ya está visible, cargar directo sin esperar al observer
    if (isInViewport(img)) {
      loadImage(img);
    } else {
      io.observe(img);
    }
  });
}
