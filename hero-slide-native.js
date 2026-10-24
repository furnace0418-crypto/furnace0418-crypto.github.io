(() => {
  let hero, work, edge;
  let turning = false;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const hash = (x, y) => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };

  function buildPixels() {
    edge.replaceChildren();
    const size = 56;
    const columns = Math.ceil(hero.clientWidth / size);
    edge.style.setProperty("--pixel-width", size + "px");
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < columns; col++) {
        const r = hash(col, row);
        if (r < (row === 0 ? .68 : .25)) continue;
        const tile = document.createElement("i");
        tile.className = "hero-pixel";
        tile.style.left = col * size + "px";
        tile.style.top = row * 30 + "px";
        tile.style.setProperty("--pixel-delay", Math.round(hash(col + 37, row) * 180) + "ms");
        tile.style.setProperty("--pixel-opacity", r > .92 ? ".72" : ".94");
        if (r > .92) tile.classList.add("hero-pixel--light");
        edge.appendChild(tile);
      }
    }
  }

  function turn(to) {
    if (turning) return;
    turning = true;
    edge.classList.remove("is-turning");
    void edge.offsetWidth;
    edge.classList.add("is-turning");
    let fallback;
    const finish = () => {
      clearTimeout(fallback);
      removeEventListener("scrollend", finish);
      turning = false;
      edge.classList.remove("is-turning");
    };
    addEventListener("scrollend", finish, { once: true });
    scrollTo({ top: to, behavior: reduce.matches ? "auto" : "smooth" });
    fallback = setTimeout(finish, reduce.matches ? 100 : 1200);
  }

  function wheel(event) {
    if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
    const top = work.offsetTop;
    if (turning) {
      event.preventDefault();
      return;
    }
    if (event.deltaY > 0 && scrollY < top - 4) {
      event.preventDefault();
      turn(top);
    } else if (event.deltaY < 0 && scrollY > 4 && scrollY < top + 110) {
      event.preventDefault();
      turn(0);
    }
  }

  function boot() {
    hero = document.getElementById("hero");
    work = document.getElementById("work");
    if (!hero || !work) {
      requestAnimationFrame(boot);
      return;
    }
    edge = document.createElement("div");
    edge.className = "hero-pixel-edge";
    edge.setAttribute("aria-hidden", "true");
    hero.appendChild(edge);
    buildPixels();
    addEventListener("resize", buildPixels, { passive: true });
    addEventListener("wheel", wheel, { passive: false, capture: true });
  }
  boot();
})();
