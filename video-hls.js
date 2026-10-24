(() => {
  const players = new Map();

  function attach(video) {
    const source = video.dataset.hlsSrc;
    if (!source || players.has(video)) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      players.set(video, null);
      return;
    }

    if (!window.Hls?.isSupported()) return;
    const player = new window.Hls({ enableWorker: true });
    player.on(window.Hls.Events.MEDIA_ATTACHED, () => player.loadSource(source));
    player.on(window.Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal) return;
      if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) player.startLoad();
      else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) player.recoverMediaError();
      else video.dispatchEvent(new Event('error'));
    });
    player.attachMedia(video);
    players.set(video, player);
  }

  function update() {
    document.querySelectorAll('video[data-hls-src]').forEach(attach);
    for (const [video, player] of players) {
      if (video.isConnected) continue;
      player?.destroy();
      players.delete(video);
    }
  }

  const observer = new MutationObserver(update);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', update, { once: true });
  } else update();
})();
