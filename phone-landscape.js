(() => {
  const gate = document.querySelector('.phone-rotate');
  const params = new URLSearchParams(location.search);
  if (params.has('phoneLandscape')) {
    gate?.remove();
    let last = null;
    let target = null;
    const rotated = () => window.parent !== window && parent.innerHeight > parent.innerWidth;
    addEventListener('touchstart', event => {
      if (!rotated() || event.touches.length !== 1) { last = null; return; }
      last = {x:event.touches[0].clientX,y:event.touches[0].clientY};
      target = event.target;
    }, {passive:true});
    addEventListener('touchmove', event => {
      if (!last || !rotated() || event.touches.length !== 1) return;
      // Keep the viewer's pinch/pan and carousels' native gesture handlers.
      if (target.closest('.project-reader-viewport,.ip-accordion,.illustration-grid-scroll,.illustration-viewer-rail,video,input')) return;
      const touch = event.touches[0];
      const dx = touch.clientX-last.x;
      const dy = last.y-touch.clientY;
      last = {x:touch.clientX,y:touch.clientY};
      if (document.documentElement.classList.contains('is-loading')) return;
      event.preventDefault();
      window.scrollBy({top:Math.abs(dx)>Math.abs(dy)?dx:dy,behavior:'instant'});
    }, {passive:false});
    addEventListener('touchend', () => { last = null; }, {passive:true});
    return;
  }
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
