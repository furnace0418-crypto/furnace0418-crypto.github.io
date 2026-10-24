(() => {
  const hero = document.getElementById("hero");
  const work = document.getElementById("work");
  if (!hero || !work) {
    const observer = new MutationObserver(() => {
      if (!document.getElementById("hero") || !document.getElementById("work")) return;
      observer.disconnect();
      const retry = document.createElement("script");
      retry.src = "/hero-mosaic.js?v=3&mounted";
      document.body.appendChild(retry);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "hero-mosaic-motion";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let lastSide = null;
  let frame = 0;
  let animationStart = 0;
  let direction = 1;
  const duration = 850;
  const cell = 54;
  const random = (x, y) => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function draw(time) {
    const t = Math.min((time - animationStart) / duration, 1);
    ctx.clearRect(0, 0, width, height);
    if (t >= 1) {
      canvas.classList.remove("is-active");
      frame = 0;
      return;
    }

    const travel = 1 - Math.pow(1 - t, 3);
    const center = direction > 0
      ? height + 110 - travel * (height + 250)
      : -110 + travel * (height + 250);
    const strength = Math.sin(Math.PI * t);
    const columns = Math.ceil(width / cell);
    const rows = Math.ceil(height / cell);
    for (let row = 0; row < rows; row++) {
      const y = row * cell;
      const distance = Math.abs(y - center);
      if (distance > 175) continue;
      const wave = 1 - distance / 175;
      for (let col = 0; col < columns; col++) {
        const r = random(col, row);
        if (r < 0.22) continue;
        const alpha = strength * wave * (0.22 + r * 0.46);
        if (alpha < 0.03) continue;
        ctx.fillStyle = r > 0.97
          ? "rgba(188,63,71," + (alpha * 0.7) + ")"
          : r > 0.73
            ? "rgba(125,124,123," + (alpha * 0.75) + ")"
            : "rgba(17,17,17," + alpha + ")";
        ctx.fillRect(col * cell, y, cell, cell);
      }
    }
    frame = requestAnimationFrame(draw);
  }

  function play(nextDirection) {
    direction = nextDirection;
    if (frame) cancelAnimationFrame(frame);
    resize();
    animationStart = performance.now();
    canvas.classList.add("is-active");
    canvas.dataset.active = "true";
    frame = requestAnimationFrame(draw);
  }

  function onScroll() {
    const threshold = hero.offsetTop + hero.offsetHeight - window.innerHeight * 0.55;
    const side = window.scrollY >= threshold ? 1 : -1;
    if (lastSide !== null && side !== lastSide) play(side);
    lastSide = side;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  resize();
  onScroll();
})();
