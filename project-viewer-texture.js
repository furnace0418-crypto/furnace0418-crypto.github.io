(() => {
  function updateBackdrop() {
    const galleryMain = document.querySelector('#illustration .illustration-main');
    const galleryImage = galleryMain?.querySelector('img');
    const gallerySource = galleryImage?.currentSrc || galleryImage?.src;
    if (gallerySource) galleryMain.style.setProperty('--artwork-bg', `url(${JSON.stringify(gallerySource)})`);
  }

  const observer = new MutationObserver(() => requestAnimationFrame(updateBackdrop));
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['src', 'open'],
  });
  updateBackdrop();
})();
