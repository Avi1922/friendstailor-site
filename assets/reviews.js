(() => {
  const track = document.getElementById('reviews-track');
  if (!track) return;
  const previous = document.getElementById('reviews-prev');
  const next = document.getElementById('reviews-next');
  const controls = document.querySelector('.reviews-controls');
  if (!previous || !next || !controls) return;
  controls.hidden = false;
  const update = () => {
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  };
  const move = direction => {
    const card = track.querySelector('.google-review');
    if (!card) return;
    const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || '0');
    track.scrollBy({left: direction * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  };
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', update, {passive: true});
  window.addEventListener('resize', update, {passive: true});
  update();
})();
