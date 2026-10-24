(() => {
  const overlay = document.getElementById('site-startup');
  if (!overlay) return;
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const imageReady = src => new Promise(resolve => {
    const image = new Image();
    image.onload = () => image.decode?.().catch(() => {}).finally(resolve) ?? resolve();
    image.onerror = resolve;
    image.src = src;
    if (image.complete && image.naturalWidth) resolve();
  });
  const appReady = new Promise(resolve => {
    const deadline = performance.now() + 5800;
    const check = () => {
      const hero = document.getElementById('hero');
      const work = document.getElementById('work');
      if (hero && work && work.dataset.chapter !== undefined && work.querySelector('.index-glass-card')) {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      } else if (performance.now() < deadline) requestAnimationFrame(check);
      else resolve();
    };
    check();
  });
  Promise.race([
    Promise.all([
      appReady,
      imageReady('/images/index/hero-poster.webp'),
      imageReady('/images/index/profile-furnace.jpg')
    ]),
    delay(6000)
  ]).then(() => {
    overlay.classList.add('is-done');
    document.documentElement.classList.remove('is-loading');
    setTimeout(() => overlay.remove(), 480);
    // Later cards are warmed after the first screen is interactive.
    const warm = () => [
      '/images/index/santiago-project-card.webp',
      '/images/illustration/new-work/monopoly-scene.webp',
      '/images/index/cards/motion-video-honest-bite.webp'
    ].forEach(src => { const image = new Image(); image.src = src; });
    if ('requestIdleCallback' in window) requestIdleCallback(warm, {timeout: 2500});
    else setTimeout(warm, 900);
  });
})();
