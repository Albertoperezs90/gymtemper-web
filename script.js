const lang = (navigator.language || '').toLowerCase().startsWith('es') ? 'es' : 'en';

// ===== Theme =====
function getSavedTheme() {
  const saved = localStorage.getItem('gymtemper-theme');
  return saved === 'light' || saved === 'dark' ? saved : null;
}

let currentTheme = getSavedTheme() ||
  (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

function applyTheme(theme, save = true) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  if (save) localStorage.setItem('gymtemper-theme', theme);
  updateScreenshots();
}

function updateScreenshots() {
  const folder = currentTheme === 'light' ? 'light' : 'dark';
  document.querySelectorAll('.carousel-slide img[data-screen]').forEach((img) => {
    img.src = `assets/screenshots/${lang}/${folder}/${img.dataset.screen}.png`;
  });
  const heroGraphic = document.getElementById('hero-graphic');
  if (heroGraphic) heroGraphic.src = `assets/feature-graphic/play_store_feature_graphic_${lang}.png`;
}

// ===== Translations =====
function t(selector, value, html = false) {
  document.querySelectorAll(selector).forEach((el) => {
    if (html) el.innerHTML = value;
    else el.textContent = value;
  });
}

function translatePage() {
  if (lang !== 'es') return;

  document.documentElement.lang = 'es';

  // Navbar
  t('.navbar-cta', 'Descargar gratis');

  // Hero
  t('.hero-eyebrow', 'Aplicación de entreno para Android');
  t('.hero-headline', 'Tus entrenos.<br>Tu móvil.<br>Tus reglas.', true);
  t('.hero-sub',
    '<strong>Entrena inteligente. Sin cuenta. Sin nube.</strong><br>' +
    'Registra series con RIR, temporizador automático y gráficas de fuerza — todo 100% sin conexión.',
    true);
  t('.hero-micro', 'Gratis · Sin anuncios · Android 8.0+');

  // Features section
  t('.features .section-header h2',
    'Todo lo que necesitas. <span class="accent">Nada más.</span>', true);
  t('.features .section-header p', 'Para quien entrena con cabeza y sin florituras.');

  const featureTitles = [
    'Registro de series',
    'Temporizador automático',
    'Plantillas de rutinas',
    'Historial completo',
    'Gráficas de progresión 1RM',
    '100% sin conexión',
  ];
  const featureDescs = [
    'Peso, reps y RIR — con tu último rendimiento visible bajo cada campo.',
    'Se activa al terminar la serie. Funciona en segundo plano y en la pantalla de bloqueo.',
    'Guarda cualquier entreno como plantilla. Empieza tu siguiente sesión con un toque.',
    'Cada sesión guardada con duración, volumen y desglose completo de series.',
    'Sigue tu máximo estimado en el tiempo con la fórmula de Epley.',
    'Sin cuenta. Sin nube. Sin anuncios. Tus datos no salen de tu dispositivo.',
  ];
  document.querySelectorAll('.feature-card').forEach((card, i) => {
    if (featureTitles[i]) card.querySelector('h3').textContent = featureTitles[i];
    if (featureDescs[i])  card.querySelector('p').textContent  = featureDescs[i];
  });

  // Screenshots section
  t('.screenshots-section .section-header h2',
    'Véala en <span class="accent">acción</span>', true);
  t('.screenshots-section .section-header p', 'Limpia, enfocada y sin distracciones — por diseño.');

  const captions = ['Panel principal', 'Elige una rutina', 'Registra tus series',
                    'Temporizador de descanso', 'Historial de entrenos', 'Progresión de fuerza'];
  document.querySelectorAll('.carousel-caption').forEach((el, i) => {
    if (captions[i]) el.textContent = captions[i];
  });

  // Privacy
  t('.privacy-inner h2', 'Tus datos nunca salen de tu móvil.');
  const bullets = ['Sin cuenta — ahora ni nunca.',
                   'Sin sincronización en la nube, ni datos compartidos, ni funciones sociales.',
                   'Solo informes de errores anónimos (desactivable en Ajustes de Android).'];
  document.querySelectorAll('.privacy-bullets li').forEach((el, i) => {
    if (bullets[i]) el.textContent = bullets[i];
  });
  t('.privacy-inner > a', 'Leer la política de privacidad');

  // CTA banner
  t('.cta-banner h2', '¿Listo para entrenar <span class="accent">mejor?</span>', true);
  t('.cta-banner > p', 'Descarga gratuita. Sin cuenta. Sin suscripción. Solo tú y tus pesas.');

  // Footer
  t('.footer-links a:first-child', 'Política de privacidad');
  t('.footer-copy', '© 2026 Alberto Pérez Simón. Todos los derechos reservados.');
  t('.footer-disclaimer',
    'GymTemper no está afiliado a Google LLC. Android y Google Play son marcas registradas de Google LLC.');
}

// ===== Boot =====
document.addEventListener('DOMContentLoaded', () => {
  translatePage();
  applyTheme(currentTheme, false);
  lucide.createIcons();

  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!getSavedTheme()) applyTheme(e.matches ? 'light' : 'dark', false);
  });

  // ===== Carousel =====
  const track   = document.querySelector('.carousel-track');
  const slides  = Array.from(track ? track.children : []);
  const dots    = Array.from(document.querySelectorAll('.carousel-dot'));
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let programmaticScroll = false;
  let programmaticScrollTimer = null;

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, slides.length - 1));
    const slide = slides[currentIndex];
    const scrollLeft = slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
    programmaticScroll = true;
    clearTimeout(programmaticScrollTimer);
    track.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    updateDots(currentIndex);
    programmaticScrollTimer = setTimeout(() => { programmaticScroll = false; }, 600);
  }

  function updateDots(index) {
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (programmaticScroll) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const i = slides.indexOf(entry.target);
          if (i !== -1) { currentIndex = i; updateDots(i); }
        }
      });
    },
    { root: track, threshold: 0.55 }
  );

  const desktopMq = window.matchMedia('(min-width: 900px)');

  function onBreakpoint(isDesktop) {
    if (isDesktop) {
      observer.disconnect();
    } else {
      currentIndex = 0;
      updateDots(0);
      track.scrollLeft = 0;
      slides.forEach((s) => observer.observe(s));
    }
  }

  if (desktopMq.matches) {
    observer.disconnect();
  } else {
    slides.forEach((s) => observer.observe(s));
  }

  desktopMq.addEventListener('change', (e) => onBreakpoint(e.matches));
  prevBtn?.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn?.addEventListener('click', () => goTo(currentIndex + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  updateDots(0);

  // ===== Lightbox =====
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightbox-img');
  const lightboxPrev  = document.getElementById('lightbox-prev');
  const lightboxNext  = document.getElementById('lightbox-next');
  const lightboxClose = document.getElementById('lightbox-close');
  const slideImgs     = slides.map((s) => s.querySelector('img'));
  let lightboxIndex   = 0;

  function openLightbox(index) {
    lightboxIndex = index;
    lightboxImg.src = slideImgs[lightboxIndex].src;
    lightboxImg.alt = slideImgs[lightboxIndex].alt;
    lightbox.showModal();
  }

  function lightboxNav(dir) {
    lightboxIndex = (lightboxIndex + dir + slideImgs.length) % slideImgs.length;
    lightboxImg.src = slideImgs[lightboxIndex].src;
    lightboxImg.alt = slideImgs[lightboxIndex].alt;
  }

  slideImgs.forEach((img, i) => img.addEventListener('click', () => openLightbox(i)));
  lightboxClose?.addEventListener('click', () => lightbox.close());
  lightboxPrev?.addEventListener('click',  () => lightboxNav(-1));
  lightboxNext?.addEventListener('click',  () => lightboxNav(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
  });

  // ===== Scroll-in fade =====
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const fadeObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      }),
      { threshold: 0.15 }
    );
    document.querySelectorAll('.fade-in').forEach((el) => fadeObserver.observe(el));
  }
});
