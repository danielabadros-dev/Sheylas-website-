// WhatsApp links
const WA_NUMBER = '34634485764';
const WA_DEFAULT_MSG = 'Hola, me gustaría reservar una sesión de fotos';

document.querySelectorAll('.whatsapp-link').forEach(link => {
  const msg = link.dataset.waMsg || WA_DEFAULT_MSG;
  link.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
});

// Navbar scroll style
const navbar = document.getElementById('navbar');
if (navbar) {
  const updateNavbar = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', updateNavbar);
  updateNavbar();
}

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.classList.remove('no-scroll');
    });
  });
}

// Fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Lazy-load the gallery video (avoids a large download competing with critical
// resources during initial page load — it only starts once it's near the viewport)
const lazyVideo = document.querySelector('video[data-src]');
if (lazyVideo) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target;
        video.src = video.dataset.src;
        video.removeAttribute('data-src');
        video.play().catch(() => {});
        videoObserver.unobserve(video);
      }
    });
  }, { rootMargin: '200px', threshold: 0.1 });
  videoObserver.observe(lazyVideo);
}

// Contact form (front-end only)
const form = document.getElementById('contactForm');
if (form) {
  const status = document.getElementById('formStatus');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = '¡Gracias! Tu mensaje ha sido recibido. Te responderé lo antes posible.';
    status.classList.add('show');
    form.reset();
  });
}

// Gallery filters
const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

if (filterButtons.length && galleryItems.length) {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !match);
      });
    });
  });
}

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', () => {
    item.classList.toggle('open');
  });
});
