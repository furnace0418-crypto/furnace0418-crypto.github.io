(() => {
  const mobile = matchMedia('(hover:none), (max-width:780px)');
  let rail;
  let cards;
  let settleTimer;
  let frame;
  let jumping = false;

  function centerAt(index) {
    return cards[index].offsetLeft + cards[index].offsetWidth / 2 - rail.clientWidth / 2;
  }

  function emphasize() {
    frame = 0;
    if (!rail || !rail.isConnected || !mobile.matches) return;
    const center = rail.scrollLeft + rail.clientWidth / 2;
    let nearest = 0;
    let distance = Infinity;
    cards.forEach((card, index) => {
      const delta = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (delta < distance) { distance = delta; nearest = index; }
    });
    cards.forEach((card, index) => card.classList.toggle('is-loop-center', index === nearest));
  }

  function settle() {
    if (!rail || !rail.isConnected || !mobile.matches || jumping) return;
    const firstClone = centerAt(0);
    const lastClone = centerAt(cards.length - 1);
    const tolerance = Math.max(12, cards[0].offsetWidth * .08);
    let target;
    if (Math.abs(rail.scrollLeft - firstClone) < tolerance) target = centerAt(cards.length - 2);
    if (Math.abs(rail.scrollLeft - lastClone) < tolerance) target = centerAt(1);
    if (target === undefined) return;
    jumping = true;
    const snap = rail.style.scrollSnapType;
    rail.style.scrollSnapType = 'none';
    rail.scrollLeft = target;
    requestAnimationFrame(() => {
      rail.style.scrollSnapType = snap;
      jumping = false;
      emphasize();
    });
  }

  function onScroll() {
    if (!frame) frame = requestAnimationFrame(emphasize);
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 150);
  }

  function bind(next) {
    if (next === rail) return;
    rail?.removeEventListener('scroll', onScroll);
    rail = next;
    cards = [...rail.children].filter(item => item.classList.contains('ag-panel'));
    if (cards.length < 3) return;
    rail.addEventListener('scroll', onScroll, { passive: true });
    requestAnimationFrame(() => {
      if (!rail?.isConnected) return;
      rail.scrollLeft = centerAt(1);
      emphasize();
    });
  }

  function scan() {
    if (!mobile.matches) return;
    const next = document.querySelector('#ip .ip-accordion');
    if (next && next !== rail && next.children.length >= 3) bind(next);
  }

  const observer = new MutationObserver(scan);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('resize', () => { if (mobile.matches && rail) emphasize(); else scan(); }, { passive: true });
  mobile.addEventListener('change', scan);
  scan();
})();
