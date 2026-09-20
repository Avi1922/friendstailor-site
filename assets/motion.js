(() => {
  'use strict';
  // Content stays visible without JavaScript or animation support.
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches) return;
  const selectors = [
    '.hero-eyebrow', '.hero h1', '.hero-panel > p', '.hero-tagline', '.hero .btn-group', '.founder-photo', '.founder-message',
    '.story-copy', '.story-visual', '.story-journey', '.story-note',
    '.why-photo', '.why-copy', '.collection-heading', '.collection-card',
    '.collection-special', '.collection-footnote', '.fabric-copy', '.fabric-visual',
    '.fabric-brand-row', '#contact .section-header', '.contact-card',
    '.intro', '.collection-types', '.fabric-card', '.reviews-heading', '.reviews-toolbar', '.reviews-track'
  ];
  const running = new Map();
  const revealed = new Set();
  const observer = new IntersectionObserver(entries => {
    // Reveal once per page load, then stop observing before moving the element.
    const entering = entries.filter(entry => entry.isIntersecting && !revealed.has(entry.target));
    entering.forEach((entry, index) => {
      revealed.add(entry.target);
      observer.unobserve(entry.target);
      if (preference.matches || entry.target.contains(document.activeElement)) return;
      const isPhoto = entry.target.matches('.founder-photo, .story-visual, .why-photo, .fabric-visual');
      const animation = entry.target.animate([
        { opacity: 0, transform: isPhoto ? 'translateY(38px)' : 'translateY(30px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], {
        duration: isPhoto ? 1500 : 1250,
        delay: Math.min(index, 4) * 130,
        easing: 'cubic-bezier(0.16, 0.7, 0.25, 1)',
        fill: 'backwards'
      });
      running.set(entry.target, animation);
      const cleanup = () => {
        if (running.get(entry.target) === animation) running.delete(entry.target);
      };
      animation.addEventListener('finish', cleanup, { once: true });
      animation.addEventListener('cancel', cleanup, { once: true });
    });
  }, { threshold: 0, rootMargin: '0px 0px -56px 0px' });
  document.querySelectorAll(selectors.join(',')).forEach(element => {
    observer.observe(element);
  });
  const finishMotion = () => {
    running.forEach(animation => animation.cancel());
    running.clear();
  };
  // Keyboard navigation, printing, and changed motion preferences stay immediate.
  document.addEventListener('focusin', finishMotion);
  window.addEventListener('beforeprint', finishMotion);
  window.addEventListener('pagehide', finishMotion);
  preference.addEventListener('change', event => {
    if (event.matches) { observer.disconnect(); finishMotion(); }
  });
})();
