(() => {
  if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
    history.scrollRestoration = "manual";
    history.replaceState(history.state, "", `${location.pathname}${location.search}#hero`);
    const goHome = () => {
      document.documentElement.style.scrollBehavior = "auto";
      scrollTo(0, 0);
    };
    addEventListener("DOMContentLoaded", goHome, { once: true });
    addEventListener("load", () => {
      goHome();
      requestAnimationFrame(() => {
        goHome();
        document.documentElement.style.scrollBehavior = "";
      });
    }, { once: true });
  }

  let hero;
  let work;
  let turning = false;
  let lastScrollPosition = scrollY;
  let authorizedHomeTurn = false;
  let landingUntil = 0;
  let paintQueued = false;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (value) => Math.max(0, Math.min(1, value));

  function paint() {
    paintQueued = false;
    if (reducedMotion.matches) {
      hero.style.opacity = "1";
      return;
    }
    const page = Math.max(work.offsetTop, 1);
    const phase = clamp((scrollY / page - .48) / .52);
    const eased = phase * phase * (3 - 2 * phase);
    hero.style.opacity = String(1 - eased);
  }

  function requestPaint() {
    if (paintQueued) return;
    paintQueued = true;
    requestAnimationFrame(paint);
  }

  function guardDirectoryCrossing() {
    const current = scrollY;
    const top = work.offsetTop;
    const bottom = work.offsetTop + work.offsetHeight;
    // Treat the directory as a mandatory stop on the way back from the
    // profile, even if one fast gesture crosses the entire viewport.
    if (!turning && !authorizedHomeTurn && lastScrollPosition > current &&
        lastScrollPosition >= bottom - 4 && current < bottom - 4) {
      work.dispatchEvent(new Event("directory:enter-from-below"));
      if (current >= top - 4) {
        lastScrollPosition = current;
        turn(top);
      } else {
        scrollTo({ top, behavior: "instant" });
        lastScrollPosition = top;
      }
      landingUntil = performance.now() + 800;
      requestPaint();
      return;
    }
    // Once inside, never let native momentum carry the page past the first
    // card. Only the explicit first-card exit below may reach the hero.
    if (!turning && !authorizedHomeTurn && lastScrollPosition >= top - 4 &&
        lastScrollPosition < bottom - 4 && current < top - 4) {
      scrollTo({ top, behavior: "instant" });
      lastScrollPosition = top;
      requestPaint();
      return;
    }
    if (authorizedHomeTurn && current <= 4) authorizedHomeTurn = false;
    lastScrollPosition = current;
    requestPaint();
  }

  function turn(to) {
    if (turning) return;
    turning = true;
    const from = scrollY;
    if (reducedMotion.matches || Math.abs(to - from) < 2) {
      scrollTo({ top: to, behavior: "instant" });
      turning = false;
      requestPaint();
      return;
    }
    const started = performance.now();
    const duration = 680;
    const frame = now => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      scrollTo({ top: from + (to - from) * eased, behavior: "instant" });
      requestPaint();
      if (progress < 1) requestAnimationFrame(frame);
      else {
        scrollTo({ top: to, behavior: "instant" });
        lastScrollPosition = to;
        turning = false;
      }
    };
    requestAnimationFrame(frame);
  }

  function wheel(event) {
    if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
    const now = performance.now();
    const top = work.offsetTop;
    const bottom = top + work.offsetHeight;
    const wheelPixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (turning) {
      event.preventDefault();
      return;
    }
    if (event.deltaY < 0 && now < landingUntil) {
      event.preventDefault();
      return;
    }
    // Let the profile page scroll normally. Only hand control to the directory
    // when this wheel event actually crosses its lower edge.
    if (event.deltaY < 0 && scrollY >= bottom - 4 && scrollY + wheelPixels <= bottom + 4) {
      event.preventDefault();
      work.dispatchEvent(new Event("directory:enter-from-below"));
      turn(top);
    } else if (event.deltaY < 0 && scrollY > top + 80 && scrollY < bottom - 4) {
      event.preventDefault();
      turn(top);
    } else if (event.deltaY > 0 && scrollY < top - 4) {
      event.preventDefault();
      work.dispatchEvent(new Event("directory:enter-from-above"));
      turn(top);
    } else if (event.deltaY < 0 && scrollY > 4 && scrollY < top + 110 && work.dataset.chapter === "0") {
      event.preventDefault();
      // Show the first card long enough to register, then let the next upward
      // input leave the directory even if the wheel is still in motion.
      if (now - Number(work.dataset.chapterChangedAt || 0) < 1050) return;
      authorizedHomeTurn = true;
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
    addEventListener("scroll", guardDirectoryCrossing, { passive: true });
    addEventListener("resize", requestPaint, { passive: true });
    addEventListener("wheel", wheel, { passive: false, capture: true });
    addEventListener("click", event => {
      if (event.target.closest?.('a[href="#hero"]')) authorizedHomeTurn = true;
    }, { capture: true });
    paint();
  }
  boot();
})();
