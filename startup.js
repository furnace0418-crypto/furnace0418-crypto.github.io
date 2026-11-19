(() => {
  const overlay = document.getElementById('site-startup');
  if (!overlay) return;
  const status = overlay.querySelector('.startup-status');
  const retry = overlay.querySelector('.startup-retry');
  const criticalImages = [
    '/images/index/hero-poster.webp',
    '/images/index/cards/profile-furnace-card.webp',
    '/images/index/cards/santiago-project-card-small.webp',
    '/images/index/cards/monopoly-scene-card.webp',
    '/images/index/cards/motion-video-honest-bite.webp'
  ];
  const imageReady = src => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = () => reject(new Error('Image failed: ' + src));
    image.src = src;
  });
  const appReady = () => new Promise(resolve => {
    const check = () => {
      const hero = document.getElementById('hero');
      const work = document.getElementById('work');
      if (hero && document.querySelector('#hero video.hero-video')) {
        resolve();
      } else setTimeout(check, 50);
    };
    check();
  });
  // Start gallery downloads before the visitor scrolls into the section.
  const galleryReady = (async () => {
    const response = await fetch('/gallery-preload.json?v=20261110');
    if (!response.ok) throw new Error('Gallery manifest unavailable');
    const urls = await response.json();
    const half = Math.ceil(urls.length / 2);
    async function loadBatch(batch) {
      let cursor = 0;
      await Promise.all(Array.from({length: 3}, async () => {
        while (cursor < batch.length) {
          const src = batch[cursor++];
          try { await imageReady(src); } catch (error) { console.warn(error); }
        }
      }));
    }
    await loadBatch(urls.slice(0, half));
    return () => loadBatch(urls.slice(half));
  })().catch(error => { console.warn(error); return () => Promise.resolve(); });
  async function videoReady() {
    status.textContent = 'LOADING...';
    const response = await fetch('/videos/hero-lite.mp4?v=20261110', {cache: 'force-cache'});
    if (!response.ok) throw new Error('Video HTTP ' + response.status);
    const size = Number(response.headers.get('content-length')) || 0;
    let received = 0;
    const chunks = [];
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        received += value.byteLength;
        chunks.push(value);
        if(size) overlay.style.setProperty('--load-progress',Math.min(85,Math.round(received/size*85))+'%');
      }
    } else chunks.push(await response.arrayBuffer());
    status.textContent = 'PREPARING...';
    await appReady();
    status.textContent = 'LOADING...';
    const video = document.querySelector('#hero video.hero-video');
    if (!video) throw new Error('Hero video element missing');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.autoplay = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.src = URL.createObjectURL(new Blob(chunks, {type:'video/mp4'}));
    video.load();
    await new Promise((resolve, reject) => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return resolve();
      video.addEventListener('loadeddata', resolve, {once:true});
      video.addEventListener('error', () => reject(new Error('Hero video decode failed')), {once:true});
    });
    const play = () => {
      if (!document.documentElement.classList.contains('is-loading')) {
        video.muted = true;
        video.play().catch(() => {});
      }
    };
    video.addEventListener('canplay', play);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) play(); });
    // Some mobile browsers require a gesture; retry silently on the first touch.
    document.addEventListener('pointerdown', play, {passive:true});
    video._startAfterLoading = play;
    // Begin playback behind the loading screen so its first revealed frame moves.
    await video.play().catch(() => {});
  }
  async function start() {
    retry.hidden = true;
    try {
      const video = videoReady();
      const images = Promise.all(criticalImages.map(imageReady));
      const [, , loadRemaining] = await Promise.all([video, images, galleryReady]);
      status.textContent = 'READY'; overlay.style.setProperty('--load-progress','100%');
      await new Promise(resolve => setTimeout(resolve, 350));
      document.documentElement.classList.remove('is-loading');
      document.querySelector('#hero video.hero-video')?._startAfterLoading?.();
      requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('is-done')));
      void loadRemaining();
      setTimeout(() => overlay.remove(), 1100);
    } catch (error) {
      console.error('Startup load failed:', error);
      status.textContent = 'PLEASE RETRY';
      retry.hidden = false;
    }
  }
  retry.addEventListener('click', start);
  start();
})();
