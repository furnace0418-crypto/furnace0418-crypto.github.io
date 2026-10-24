// Replay the hero's soft-focus entrance whenever a section title is reached
// while scrolling down, without shifting its surrounding layout.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('title-reveal-enabled');

  const selector = '.directory-mega-title, .profile-title, .section-title, .contact-thanks';
  const observed = new WeakSet();
  const animations = new WeakMap();
  let lastScrollY = scrollY;
  let movingDown = true;

  addEventListener('scroll', () => {
    const nextScrollY = scrollY;
    if (Math.abs(nextScrollY - lastScrollY) > 1) movingDown = nextScrollY > lastScrollY;
    lastScrollY = nextScrollY;
  }, { passive: true });

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const title = entry.target;
      if (!entry.isIntersecting) {
        if (!movingDown) {
          animations.get(title)?.cancel();
          title.classList.remove('is-revealed');
        }
        continue;
      }
      if (!movingDown) {
        animations.get(title)?.cancel();
        title.classList.add('is-revealed');
        continue;
      }
      animations.get(title)?.cancel();
      title.classList.remove('is-revealed');
      const animation = title.animate([
        { opacity: 0, filter: 'blur(15px)', translate: '0 24px', scale: '1.025' },
        { opacity: 1, filter: 'blur(3px)', translate: '0 3px', scale: '1.005', offset: .65 },
        { opacity: 1, filter: 'blur(0)', translate: '0 0', scale: '1' }
      ], { duration: 950, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' });
      animations.set(title, animation);
      animation.finished.then(() => {
        if (animations.get(title) !== animation) return;
        title.classList.add('is-revealed');
        animation.cancel();
      }).catch(() => {});
    }
  }, { threshold: 0, rootMargin: '0px 0px -18% 0px' });

  function watchTitles() {
    for (const title of document.querySelectorAll(selector)) {
      if (observed.has(title)) continue;
      observed.add(title);
      observer.observe(title);
    }
  }

  watchTitles();
  const root = document.getElementById('root');
  if (root) new MutationObserver(watchTitles).observe(root, { childList: true, subtree: true });
})();
