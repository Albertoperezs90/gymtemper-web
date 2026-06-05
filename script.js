// Detect locale: Spanish if *any* of the browser's preferred languages is es-*
const lang = (() => {
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language || 'en'];
  return langs.some((l) => l.toLowerCase().startsWith('es')) ? 'es' : 'en';
})();

// Theme helpers
function getSavedTheme() {
  const saved = localStorage.getItem('gymtemper-theme');
  return saved === 'light' || saved === 'dark' ? saved : null;
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

let currentTheme = getSavedTheme() || getSystemTheme();

function applyTheme(theme, save = true) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  if (save) localStorage.setItem('gymtemper-theme', theme);
  updateScreenshots();
}

function updateScreenshots() {
  const folder = currentTheme === 'light' ? 'light' : 'dark';

  document.querySelectorAll('.carousel-slide img[data-screen]').forEach((img) => {
    const screen = img.dataset.screen;
    img.src = `assets/screenshots/${lang}/${folder}/${screen}.png`;
  });

  const heroGraphic = document.getElementById('hero-graphic');
  if (heroGraphic) {
    heroGraphic.src = `assets/feature-graphic/play_store_feature_graphic_${lang}.png`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Apply theme and locale-appropriate images immediately
  // (theme attribute already set by inline head script; this syncs screenshots)
  applyTheme(currentTheme, false);

  // Init Lucide icons
  lucide.createIcons();

  // Theme toggle
  const toggleBtn = document.getElementById('theme-toggle');
  toggleBtn?.addEventListener('click', () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  // Respect system theme changes when user hasn't manually overridden
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!getSavedTheme()) {
      applyTheme(e.matches ? 'light' : 'dark', false);
    }
  });

  // ===== Carousel =====
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(track ? track.children : []);
  const dots = Array.from(document.querySelectorAll('.carousel-dot'));
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let programmaticScroll = false;
  let programmaticScrollTimer = null;

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, slides.length - 1));
    const slide = slides[currentIndex];
    // Calculate the scroll offset that centers the target slide in the track
    const scrollLeft = slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
    programmaticScroll = true;
    clearTimeout(programmaticScrollTimer);
    track.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    updateDots(currentIndex);
    // Re-enable swipe syncing after the animation settles
    programmaticScrollTimer = setTimeout(() => { programmaticScroll = false; }, 600);
  }

  function updateDots(index) {
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  // Sync dots when user swipes (suppressed during programmatic scrolls)
  const observer = new IntersectionObserver(
    (entries) => {
      if (programmaticScroll) return;
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

  const desktopMq = window.matchMedia('(min-width: 900px)');

  function onBreakpoint(isDesktop) {
    if (isDesktop) {
      // Grid layout: observer would fire for all visible slides and corrupt state
      observer.disconnect();
    } else {
      // Back to carousel: reset to first slide and reconnect
      currentIndex = 0;
      updateDots(0);
      track.scrollLeft = 0;
      slides.forEach((slide) => observer.observe(slide));
    }
  }

  // Init
  if (desktopMq.matches) {
    observer.disconnect();
  } else {
    slides.forEach((slide) => observer.observe(slide));
  }

  desktopMq.addEventListener('change', (e) => onBreakpoint(e.matches));

  prevBtn?.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn?.addEventListener('click', () => goTo(currentIndex + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  updateDots(0);

  // ===== Lightbox =====
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightbox-img');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxClose = document.getElementById('lightbox-close');
  const slideImgs = slides.map((s) => s.querySelector('img'));
  let lightboxIndex = 0;

  function openLightbox(index) {
    lightboxIndex = index;
    const img = slideImgs[lightboxIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.showModal();
  }

  function lightboxNav(dir) {
    lightboxIndex = (lightboxIndex + dir + slideImgs.length) % slideImgs.length;
    const img = slideImgs[lightboxIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  }

  slideImgs.forEach((img, i) => img.addEventListener('click', () => openLightbox(i)));
  lightboxClose?.addEventListener('click', () => lightbox.close());
  lightboxPrev?.addEventListener('click', () => lightboxNav(-1));
  lightboxNext?.addEventListener('click', () => lightboxNav(1));

  // Close on backdrop click (click lands directly on <dialog>, not its children)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.close();
  });

  // Keyboard navigation inside lightbox
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
  });

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
