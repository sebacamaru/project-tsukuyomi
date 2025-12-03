export function initLazyImages(root = document) {
  const imgs = Array.from(root.querySelectorAll("img.lazy"));

  if (!("IntersectionObserver" in window)) {
    imgs.forEach((img) => (img.src = img.dataset.src));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const img = e.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          io.unobserve(img);
        }
      }
    },
    {
      root,
      rootMargin: "200px",
    }
  );

  imgs.forEach((i) => io.observe(i));
}
