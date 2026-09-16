/* Animaciones cinematográficas — versión vanilla de la skill `animaciones-cinematicas`.
   El reveal al hacer scroll ya lo dispara el IntersectionObserver de main.js (añade
   .visible a los .fade-in); aquí van los efectos que sí necesitan JS: titulares
   palabra a palabra, el fade out del hero al bajar y el parallax de las fotos. */

(() => {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

  // Interpola v (0..1) sobre un tramo [from, to] del progreso.
  const range = (v, from, to, a, b) =>
    a + (b - a) * clamp((v - from) / (to - from), 0, 1);

  /* ===== Titulares que aparecen desde el desenfoque =====
     data-blur-text="words|chars", data-blur-delay, data-blur-stagger,
     data-blur-trigger="mount|view". Por defecto: palabras, al entrar en pantalla. */
  function splitBlurText(host) {
    const mode = host.dataset.blurText || 'words';
    const text = host.textContent.trim();
    if (!text) return null;

    const delay = Number(host.dataset.blurDelay || 0);
    const stagger = Number(host.dataset.blurStagger || (mode === 'chars' ? 45 : 90));
    // Partir en letras rompe la lectura de los lectores de pantalla: el texto
    // completo se conserva en aria-label y los trozos quedan ocultos para ellos.
    const pieces = mode === 'chars' ? Array.from(text) : text.split(/\s+/);

    host.textContent = '';
    if (mode === 'chars') {
      host.setAttribute('aria-label', text);
    }

    const spans = pieces.map((piece, i) => {
      const span = document.createElement('span');
      span.className = 'blur-text';
      span.textContent = piece;
      span.style.animationDelay = `${delay + i * stagger}ms`;
      if (mode === 'chars') {
        span.setAttribute('aria-hidden', 'true');
        // Un espacio real no sobrevive como textContent de un inline-block.
        if (piece === ' ') span.style.width = '0.32em';
      }
      host.appendChild(span);
      // Espacios de verdad entre palabras: la frase se sigue leyendo entera.
      if (mode === 'words' && i < pieces.length - 1) {
        host.appendChild(document.createTextNode(' '));
      }
      return span;
    });

    return spans;
  }

  function initBlurText() {
    const hosts = document.querySelectorAll('[data-blur-text]');
    if (!hosts.length) return;

    // Con movimiento reducido el texto se queda como estaba, sin trocear.
    if (REDUCED.matches) return;

    const viewObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.__blurSpans.forEach((span) => span.classList.add('shown'));
        viewObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    hosts.forEach((host) => {
      const spans = splitBlurText(host);
      if (!spans) return;

      // Lo que ya está en pantalla al cargar debe animar al montar: whileInView
      // se lo perdería (trampa conocida de la skill).
      if (host.dataset.blurTrigger === 'mount') {
        spans.forEach((span) => span.classList.add('shown'));
      } else {
        host.__blurSpans = spans;
        viewObserver.observe(host);
      }
    });
  }

  /* ===== El texto del hero sube, se desvanece y se desenfoca al bajar ===== */
  function collectScrollFades() {
    return Array.from(document.querySelectorAll('[data-scroll-fade]'));
  }

  function updateScrollFade(el) {
    const rect = el.getBoundingClientRect();
    if (!rect.height) return;

    const progress = clamp(-rect.top / rect.height, 0, 1);
    const opacity = range(progress, 0.1, 0.9, 1, 0);
    const y = range(progress, 0, 1, 0, -80);
    const blur = range(progress, 0.1, 0.9, 0, 10);

    el.style.opacity = String(opacity);
    el.style.transform = `translateY(${y}px)`;
    el.style.filter = `blur(${blur}px)`;
    // Por debajo de 0.02 ya no se ve: se saca del hit-testing para no tapar clics.
    el.style.pointerEvents = opacity < 0.02 ? 'none' : '';
  }

  /* ===== Parallax suave de las fotos =====
     La imagen se envuelve en un div propio: el scroll mueve el wrapper y el zoom
     de hover se queda en la imagen, así no se pisan las dos transiciones. */
  function collectParallax() {
    const items = [];

    document.querySelectorAll('[data-parallax]').forEach((container) => {
      const media = container.querySelector('img, video');
      if (!media || media.parentElement.classList.contains('parallax-inner')) return;

      const inner = document.createElement('div');
      inner.className = 'parallax-inner';
      media.parentElement.insertBefore(inner, media);
      inner.appendChild(media);
      items.push({ container, inner });
    });

    return items;
  }

  function updateParallax({ container, inner }) {
    const rect = container.getBoundingClientRect();
    const viewport = window.innerHeight;
    if (rect.bottom < 0 || rect.top > viewport) return;

    const progress = clamp((viewport - rect.top) / (viewport + rect.height), 0, 1);
    // scale 1.12 → 1.06 → 1.1, con y dentro del margen que deja ese zoom.
    const scale = progress < 0.5
      ? range(progress, 0, 0.5, 1.12, 1.06)
      : range(progress, 0.5, 1, 1.06, 1.1);
    const y = range(progress, 0, 1, -2.5, 2.5);

    inner.style.transform = `translateY(${y}%) scale(${scale})`;
  }

  function initScrollEffects() {
    if (REDUCED.matches) return;

    const fades = collectScrollFades();
    const parallax = collectParallax();
    if (!fades.length && !parallax.length) return;

    let queued = false;

    const render = () => {
      queued = false;
      fades.forEach(updateScrollFade);
      parallax.forEach(updateParallax);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(render);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    render();
  }

  const start = () => {
    initBlurText();
    initScrollEffects();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
