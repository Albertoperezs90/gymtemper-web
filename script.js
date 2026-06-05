document.addEventListener('DOMContentLoaded', () => {
  // Init Lucide icons
  lucide.createIcons();

  // ===== Carousel =====
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(track ? track.children : []);
  const dots = Array.from(document.querySelectorAll('.carousel-dot'));
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, slides.length - 1));
    slides[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    updateDots(currentIndex);
  }

  function updateDots(index) {
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  // Sync dots when user swipes
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const i = slides.indexOf(entry.target);
          if (i !== -1) {
            currentIndex = i;
            updateDots(i);
          }
        }
      });
    },
    { root: track, threshold: 0.55 }
  );

  slides.forEach((slide) => observer.observe(slide));

  prevBtn?.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn?.addEventListener('click', () => goTo(currentIndex + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  // Init first dot
  updateDots(0);

  // ===== Scroll-in fade animation =====
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const fadeEls = document.querySelectorAll('.fade-in');
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    fadeEls.forEach((el) => fadeObserver.observe(el));
  }
});
