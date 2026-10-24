(() => {
  let hero;
  let work;
  let turning = false;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  function finish() {
    turning = false;
    hero.classList.remove("hero-turning", "hero-dissolve-out", "hero-dissolve-in");
  }

  function turn(to, direction) {
    if (turning) return;
    turning = true;
    hero.classList.remove("hero-dissolve-out", "hero-dissolve-in");
    void hero.offsetWidth;
    hero.classList.add("hero-turning", direction > 0 ? "hero-dissolve-out" : "hero-dissolve-in");

    let fallback;
    let scrolled = false;
    let faded = reducedMotion.matches;
    const complete = () => {
      if (!scrolled || !faded) return;
      clearTimeout(fallback);
      removeEventListener("scrollend", onScrollEnd);
      hero.removeEventListener("animationend", onAnimationEnd);
      finish();
    };
    const onScrollEnd = () => { scrolled = true; complete(); };
    const onAnimationEnd = (event) => {
      if (event.target !== hero) return;
      faded = true;
      complete();
    };
    addEventListener("scrollend", onScrollEnd, { once: true });
    hero.addEventListener("animationend", onAnimationEnd);
    scrollTo({ top: to, behavior: reducedMotion.matches ? "auto" : "smooth" });
    fallback = setTimeout(() => { scrolled = true; faded = true; complete(); }, reducedMotion.matches ? 100 : 1300);
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
      turn(top, 1);
    } else if (event.deltaY < 0 && scrollY > 4 && scrollY < top + 110) {
      event.preventDefault();
      turn(0, -1);
    }
  }

  function boot() {
    hero = document.getElementById("hero");
    work = document.getElementById("work");
    if (!hero || !work) {
      requestAnimationFrame(boot);
      return;
    }
    addEventListener("wheel", wheel, { passive: false, capture: true });
  }
  boot();
})();
