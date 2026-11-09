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
      if (hero && work && work.querySelectorAll('.index-glass-card').length === 4 && work.dataset.chapter !== undefined) {
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
    status.textContent = '正在加载首页视频';
    const response = await fetch('/videos/hero-lite.mp4?v=20261110', {cache: 'force-cache'});
    if (!response.ok) throw new Error('Video HTTP ' + response.status);
    const size = Number(response.headers.get('content-length')) || 0;
    let received = 0;
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        received += value.byteLength;
        if (size) status.textContent = '正在加载首页视频 ' + Math.min(99, Math.round(received / size * 100)) + '%';
      }
    } else await response.arrayBuffer();
    status.textContent = '视频已下载，正在准备画面';
    await appReady();
    status.textContent = '正在检查视频画面';
    const video = document.querySelector('#hero video.hero-video');
    if (!video) throw new Error('Hero video element missing');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) video.load();
    const showPlayButton = () => {
      if (document.querySelector('.hero-tap-to-play')) return;
      const button = document.createElement('button');
      button.className = 'hero-tap-to-play';
      button.textContent = '点击播放视频 ▶';
      button.onclick = () => video.play().then(() => button.remove()).catch(() => {});
      document.getElementById('hero')?.appendChild(button);
    };
    const playAttempt = video.play().catch(showPlayButton);
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      video.addEventListener('error', showPlayButton, {once: true});
      setTimeout(() => {
        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) showPlayButton();
      }, 2500);
    }
    void playAttempt;
  }
  async function start() {
    retry.hidden = true;
    try {
      const video = videoReady();
      const images = Promise.all(criticalImages.map(imageReady));
      const [, , loadRemaining] = await Promise.all([video, images, galleryReady]);
      status.textContent = '准备完成';
      overlay.classList.add('is-done');
      document.documentElement.classList.remove('is-loading');
      void loadRemaining();
      setTimeout(() => overlay.remove(), 480);
    } catch (error) {
      console.error('Startup load failed:', error);
      status.textContent = '加载遇到问题，请重试';
      retry.hidden = false;
    }
  }
  retry.addEventListener('click', start);
  start();
})();
