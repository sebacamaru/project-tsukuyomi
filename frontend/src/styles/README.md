# 🎨 Chigui CSS

Micro-framework CSS ultraliviano, mobile-first y altamente configurable.

**Tamaño**: ~10KB minificado | **Filosofía**: Simple, escalable, sin complejidad

---

## 📦 Instalación

```javascript
// En tu main.js o punto de entrada
import './styles/chigui.css';
```

---

## 🎯 Características

✅ **Mobile-first** - Diseñado primero para móviles  
✅ **Variables CSS** - Todo configurable con custom properties  
✅ **Breakpoints configurables** - Ajusta los puntos de quiebre a tu gusto  
✅ **Sin clases complejas** - Nombres simples y claros  
✅ **Dark mode** - Soporte automático para modo oscuro  
✅ **Ultraliviano** - Entre 5-12 KB finales  

---

## 🔧 Configuración de Breakpoints

Los breakpoints están definidos como variables CSS en `variables.css`:

```css
:root {
  --breakpoint-sm: 640px;   /* Móvil grande / Tablet pequeña */
  --breakpoint-md: 768px;   /* Tablet */
  --breakpoint-lg: 1024px;  /* Laptop */
  --breakpoint-xl: 1280px;  /* Desktop */
  --breakpoint-2xl: 1536px; /* Desktop grande */
}
```

### Cambiar breakpoints globalmente

1. Modifica los valores en `variables.css`
2. Actualiza los valores en los archivos correspondientes:
   - `base.css`
   - `layout.css`
   - `components.css`
   - `utilities.css`

**Nota**: CSS no permite usar custom properties en `@media` queries, por lo que los valores deben actualizarse manualmente. Sin embargo, están centralizados como variables para uso en JavaScript y como referencia.

### Usar breakpoints en JavaScript

```javascript
const breakpoints = {
  sm: parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--breakpoint-sm')),
  md: parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--breakpoint-md')),
  // etc...
};

if (window.innerWidth >= breakpoints.md) {
  // Lógica para tablet+
}
```

---

## 📐 Sistema de Espaciados

Basado en múltiplos de 8px para mantener consistencia:

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.5rem;   /* 24px */
--space-6: 2rem;     /* 32px */
--space-8: 3rem;     /* 48px */
--space-10: 4rem;    /* 64px */
```

---

## 🎨 Colores

### Personalizar colores

```css
:root {
  --primary: #3b82f6;
  --secondary: #8b5cf6;
  --accent: #f59e0b;
  
  /* Semánticos */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

---

## 🧩 Componentes

### Button

```html
<button class="button">Default</button>
<button class="button secondary">Secondary</button>
<button class="button outline">Outline</button>
<button class="button ghost">Ghost</button>
<button class="button small">Small</button>
<button class="button large">Large</button>
```

### Card

```html
<div class="card">
  <h3>Título</h3>
  <p>Contenido de la card</p>
</div>

<div class="card interactive">
  <!-- Card con hover effect -->
</div>
```

### Input

```html
<input type="text" class="input" placeholder="Email">
<input type="text" class="input error" placeholder="Error state">
```

### Badge

```html
<span class="badge">Default</span>
<span class="badge success">Success</span>
<span class="badge warning">Warning</span>
<span class="badge error">Error</span>
<span class="badge neutral">Neutral</span>
```

### Alert

```html
<div class="alert info">Mensaje informativo</div>
<div class="alert success">Operación exitosa</div>
<div class="alert warning">Advertencia importante</div>
<div class="alert error">Ha ocurrido un error</div>
```

### Avatar

```html
<div class="avatar">JD</div>
<div class="avatar small">S</div>
<div class="avatar large">
  <img src="avatar.jpg" alt="User">
</div>
```

### Otros

```html
<!-- Spinner -->
<div class="spinner"></div>

<!-- Divider -->
<hr class="divider">

<!-- Navbar -->
<nav class="navbar">
  <div>Logo</div>
  <div>Menu</div>
</nav>
```

---

## 📦 Layout

### Container

```html
<div class="container">
  <!-- Contenido con max-width y padding responsive -->
</div>

<div class="container container-sm">
  <!-- Container más estrecho (640px) -->
</div>
```

### Flex

```html
<div class="flex items-center justify-between gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<div class="flex-col gap-3">
  <div>Stack vertical</div>
  <div>con gap</div>
</div>
```

### Grid

```html
<!-- Grid responsive 2 columnas -->
<div class="grid-2">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Grid responsive 3 columnas -->
<div class="grid-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Grid responsive 4 columnas -->
<div class="grid-4">
  <!-- Items... -->
</div>
```

### Stack

```html
<!-- Stack con separación automática -->
<div class="stack">
  <p>Párrafo 1</p>
  <p>Párrafo 2</p>
  <p>Párrafo 3</p>
</div>
```

---

## 🛠️ Utilidades

### Spacing

```html
<div class="m-4">Margin en todos los lados</div>
<div class="mt-3 mb-5">Margin top y bottom</div>
<div class="p-4">Padding en todos los lados</div>
<div class="mx-auto">Centrado horizontal</div>
```

### Tipografía

```html
<p class="text-sm">Texto pequeño</p>
<p class="text-lg font-bold">Texto grande y negrita</p>
<p class="text-center text-primary">Centrado y color primario</p>
<p class="truncate">Texto que se corta con ellipsis...</p>
```

### Colores

```html
<div class="text-primary">Texto primario</div>
<div class="bg-surface">Fondo superficie</div>
<span class="text-error">Error</span>
<span class="text-success">Éxito</span>
```

### Bordes y Sombras

```html
<div class="border rounded-lg">Con borde y esquinas redondeadas</div>
<div class="shadow-md">Con sombra media</div>
<div class="rounded-full">Completamente redondeado</div>
```

### Visibilidad Responsive

```html
<div class="hide-mobile">Oculto en móvil</div>
<div class="show-desktop">Solo visible en desktop</div>
<div class="hide-tablet">Oculto en tablets</div>
```

---

## 🌙 Dark Mode

El framework incluye soporte automático para dark mode usando `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg: var(--neutral-900);
    --text: var(--neutral-50);
    /* Colores ajustados automáticamente */
  }
}
```

---

## 📝 Ejemplo Completo

```html
<div class="container">
  <section class="section">
    <h1 class="text-center mb-6">Bienvenido a Chigui</h1>
    
    <div class="grid-2 gap-4">
      <div class="card interactive">
        <h3 class="mb-3">Card Interactiva</h3>
        <p class="text-muted mb-4">
          Esta card tiene efecto hover
        </p>
        <div class="flex gap-2">
          <button class="button">Acción</button>
          <button class="button outline">Cancelar</button>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between mb-3">
          <h3>Status</h3>
          <span class="badge success">Activo</span>
        </div>
        <p class="text-muted">Todo funcionando correctamente</p>
      </div>
    </div>
    
    <div class="alert info mt-6">
      Este es un mensaje informativo con el framework Chigui CSS
    </div>
  </section>
</div>
```

---

## 📂 Estructura de Archivos

```
styles/
├── chigui.css       # Punto de entrada (importa todos)
├── reset.css        # Reset CSS moderno
├── variables.css    # Variables y configuración
├── base.css         # Estilos base (tipografía, forms)
├── layout.css       # Sistema de layouts (flex, grid)
├── components.css   # Componentes (buttons, cards, etc)
└── utilities.css    # Clases utilitarias
```

---

## 🎯 Guidelines del Framework

1. **Mobile-first SIEMPRE** - Los estilos base son para móvil, luego se expanden con media queries
2. **Variables para TODO** - Colores, espaciados, bordes... todo configurable
3. **No mezclar componentes con utilidades** - Mantén separados `.card` de `.mt-3`
4. **Sin clases complejas** - Nombres simples: `.button`, `.card`, `.grid-2`
5. **Mantener entre 5-12 KB** - Ultraliviano y performante

---

## 🚀 Performance

- Sin dependencias
- Sin JavaScript requerido
- Carga rápida
- CSS puro y optimizable
- Compatible con tree-shaking al usar módulos

---

## 💡 Tips

- Usa las variables CSS para mantener consistencia
- Combina componentes con utilidades para máxima flexibilidad
- Extiende el framework según tus necesidades
- Los breakpoints son configurables pero requieren actualización manual en media queries

---

¡Disfruta construyendo con Chigui CSS! 🎉
