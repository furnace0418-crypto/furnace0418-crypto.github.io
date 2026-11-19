(() => {
  const gate = document.querySelector('.phone-rotate');
  const params = new URLSearchParams(location.search);
  if (params.has('phoneLandscape')) { gate?.remove(); return; }
  const phone = matchMedia('(pointer:coarse)').matches && Math.min(screen.width, screen.height) <= 600;
  if (!phone) { gate?.remove(); return; }
  const frame = document.createElement('iframe');
  frame.className = 'phone-landscape-frame';
  frame.title = 'FURNACE Portfolio';
  frame.allow = 'autoplay; fullscreen';
  const url = new URL(location.href);
  url.searchParams.set('phoneLandscape', '1');
  frame.src = url.href;
  document.body.appendChild(frame);
  document.documentElement.classList.add('phone-landscape-shell');
  const update = () => {
    const portrait = innerHeight > innerWidth;
    frame.style.width = (portrait ? innerHeight : innerWidth) + 'px';
    frame.style.height = (portrait ? innerWidth : innerHeight) + 'px';
    frame.style.transform = portrait ? 'rotate(90deg) translateY(-100%)' : 'none';
  };
  update();
  addEventListener('resize', update, {passive:true});
  gate?.querySelector('h2')?.replaceChildren('Landscape experience.');
  gate?.querySelector('p')?.replaceChildren('即将进入横屏浏览');
  setTimeout(() => {
    gate?.remove();
    document.documentElement.classList.add('phone-intro-complete');
  }, 2000);
})();
