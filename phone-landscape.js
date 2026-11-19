(() => {
  const gate = document.querySelector('.phone-rotate');
  const button = document.createElement('button');
  button.className = 'phone-rotate-start';
  button.textContent = '开启横屏浏览';
  const hint = document.createElement('p');
  hint.className = 'phone-rotate-help';
  hint.textContent = '点击开启全屏横屏模式';
  gate?.append(button, hint);
  button.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      if (screen.orientation?.lock) {
        await screen.orientation.lock('landscape');
        update();
        return;
      }
      throw new Error('Orientation lock unsupported');
    } catch (error) {
      hint.textContent = '请打开手机系统“自动旋转”，然后将手机横放。当前浏览器不支持网页直接切换方向。';
      button.textContent = '已横屏，继续浏览';
      button.onclick = () => {
        document.documentElement.classList.add('phone-is-landscape');
        gate.style.setProperty('display', 'none', 'important');
      };
    }
  }, {once:true});
  const update = () => {
    const angle = Number(screen.orientation?.angle ?? window.orientation ?? 0);
    const landscape = Math.abs(angle) % 180 === 90 ||
      screen.orientation?.type?.startsWith('landscape') ||
      matchMedia('(orientation:landscape)').matches;
    document.documentElement.classList.toggle('phone-is-landscape', !!landscape);
  };
  update();
  addEventListener('orientationchange', () => {
    update();
    setTimeout(update, 150);
    setTimeout(update, 600);
  });
  addEventListener('resize', update, {passive:true});
  screen.orientation?.addEventListener('change', update);
  window.visualViewport?.addEventListener('resize', update);
})();
