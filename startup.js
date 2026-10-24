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
    image.onload = async () => {
      try { if (image.decode) await image.decode(); resolve(); }
      catch (error) { reject(error); }
    };
    image.onerror = () => reject(new Error('Image failed: ' + src));
    image.src = src;
  });
  const appReady = () => new Promise(resolve => {
    const check = () => {
      const hero = document.getElementById('hero');
      const work = document.getElementById('work');
      if (hero && work && work.querySelectorAll('.index-glass-card').length === 4 && work.dataset.chapter !== undefined) {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      } else requestAnimationFrame(check);
    };
    check();
  });
  async function videoReady() {
    status.textContent = '正在加载首页视频';
    const response = await fetch('/videos/hero-fast.mp4', {cache: 'force-cache'});
    if (!response.ok) throw new Error('Video HTTP ' + response.status);
    const size = Number(response.headers.get('content-length')) || 0;
    let received = 0;
    const chunks = [];
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.byteLength;
        if (size) status.textContent = '正在加载首页视频 ' + Math.min(99, Math.round(received / size * 100)) + '%';
      }
    } else chunks.push(await response.blob());
    const url = URL.createObjectURL(new Blob(chunks, {type: 'video/mp4'}));
    window.__heroVideoBlobUrl = url;
    await appReady();
    const video = document.querySelector('#hero video.hero-video');
    if (!video) throw new Error('Hero video element missing');
    video.src = url;
    video.preload = 'auto';
    video.load();
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      await new Promise((resolve, reject) => {
        video.addEventListener('loadeddata', resolve, {once: true});
        video.addEventListener('error', reject, {once: true});
      });
    }
    await video.play().catch(() => {});
  }
  async function start() {
    retry.hidden = true;
    try {
      const video = videoReady();
      const images = Promise.all(criticalImages.map(imageReady));
      await Promise.all([video, images]);
      status.textContent = '准备完成';
      overlay.classList.add('is-done');
      document.documentElement.classList.remove('is-loading');
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
