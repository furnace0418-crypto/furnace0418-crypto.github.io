(() => {
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
  visualViewport?.addEventListener('resize', update);
})();
