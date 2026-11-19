(() => {
  const gate = document.querySelector('.phone-rotate');
  // Let the browser own page scrolling and orientation. Never rotate an iframe.
  const params = new URLSearchParams(location.search);
  if (params.has('phoneLandscape')) {
    params.delete('phoneLandscape');
    history.replaceState(history.state, '', location.pathname + (params.size ? '?' + params : '') + location.hash);
  }
  const phone = matchMedia('(pointer:coarse)').matches && Math.min(screen.width, screen.height) <= 600;
  if (!phone) { gate?.remove(); return; }
  const viewport = document.querySelector('meta[name="viewport"]');
  viewport?.setAttribute('content', 'width=980, user-scalable=yes');
  document.documentElement.classList.add('phone-native-wide');
  const dismiss = () => {
    gate?.remove();
    document.documentElement.classList.add('phone-intro-complete');
  };
  gate?.querySelector('h2')?.replaceChildren('Best viewed in landscape.');
  gate?.querySelector('p')?.replaceChildren('横屏浏览效果更佳，即将自动进入');
  setTimeout(dismiss, 2000);
})();
