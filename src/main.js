/**
 * HAYNES CONSULT — MAIN JS
 * Premium Light-Theme Rebuild
 * Typing animation hero · Crystal navbar · Floating blobs
 */

import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const isMobile = window.matchMedia('(max-width: 768px)').matches;
const isTouch  = window.matchMedia('(pointer: coarse)').matches;

/* ============================================================
   SMOOTH SCROLL — LENIS
============================================================ */
const lenis = new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  syncTouch: false,
});

function raf(time) {
  lenis.raf(time);
  ScrollTrigger.update();
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

document.querySelectorAll('a[href^="#"]').forEach((el) => {
  el.addEventListener('click', (e) => {
    const href = el.getAttribute('href');
    if (!href || href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) lenis.scrollTo(target, { offset: -80, duration: 1.3 });
    mobileMenu?.classList.remove('open');
    hamburger?.classList.remove('open');
  });
});

/* ============================================================
   LOADER — Light Theme
============================================================ */
const loader = document.getElementById('loader');
const loaderProgress = document.getElementById('loaderProgress');
const loaderText = document.getElementById('loaderText');

let progress = 0;
const loadInterval = setInterval(() => {
  progress += Math.random() * 18 + 6;
  if (progress >= 100) {
    progress = 100;
    clearInterval(loadInterval);
    setTimeout(hideLoader, 250);
  }
  loaderProgress.style.width = progress + '%';
  loaderText.textContent = Math.floor(progress) + '%';
}, 110);

function hideLoader() {
  gsap.to(loader, {
    opacity: 0,
    duration: 0.7,
    ease: 'power2.inOut',
    onComplete: () => {
      loader.style.display = 'none';
      initHeroSlider();
      initCanvas();
    },
  });
}

/* ============================================================
   CUSTOM CURSOR
============================================================ */
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');

if (cursor && cursorFollower && window.matchMedia('(pointer: fine)').matches && !isTouch) {
  let mx = 0, my = 0;
  let fx = 0, fy = 0;
  let ticking = false;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateCursor);
    }
  }, { passive: true });

  function updateCursor() {
    cursor.style.transform = `translate(${mx - 5}px, ${my - 5}px)`;
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    cursorFollower.style.transform = `translate(${fx - 20}px, ${fy - 20}px)`;
    ticking = false;
  }

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .services__card, .services__extra-item')) {
      document.body.classList.add('cursor--hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, .services__card, .services__extra-item')) {
      document.body.classList.remove('cursor--hover');
    }
  });
}

/* ============================================================
   HERO CANVAS — updated for light background
============================================================ */
function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildParticles();
  }

  // Light blue / navy particles for light background
  const COLORS = [
    'rgba(21,101,192,0.5)',
    'rgba(61,168,245,0.5)',
    'rgba(13,43,126,0.35)',
    'rgba(61,168,245,0.3)',
  ];

  function buildParticles() {
    particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.2 + 0.6,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.4 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  }

  let pmx = 0, pmy = 0, mouseReady = false;
  document.addEventListener('mousemove', (e) => {
    pmx = (e.clientX / window.innerWidth  - 0.5) * 0.4;
    pmy = (e.clientY / window.innerHeight - 0.5) * 0.3;
    mouseReady = true;
  }, { passive: true });

  let animId;
  let isVisible = true;

  const heroObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible && !animId) draw();
  });
  heroObserver.observe(canvas);

  function draw() {
    if (!isVisible) { animId = null; return; }
    animId = requestAnimationFrame(draw);

    ctx.clearRect(0, 0, W, H);

    particles.forEach((p) => {
      p.x += p.vx + (mouseReady ? pmx * 0.1 : 0);
      p.y += p.vy + (mouseReady ? pmy * 0.08 : 0);

      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      if (p.y < -5) p.y = H + 5;
      if (p.y > H + 5) p.y = -5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });

    // Connection lines — blue on light bg
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 50; i++) {
      const a = particles[i];
      for (let j = i + 1; j < 60; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.globalAlpha = (1 - dist / 100) * 0.1;
          ctx.strokeStyle = 'rgba(21,101,192,0.8)';
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  }, { passive: true });

  resize();
}

/* ============================================================
   HERO SLIDER — Word-bounce animation + video crossfade
   Slide 1 → video right-positioned (heroo.mp4)
   Slide 2 → video centred (heroo2.mp4)
============================================================ */
function initHeroSlider() {
  const heroSection = document.querySelector('.hero');
  const slides  = document.querySelectorAll('.hero__slide');
  const dots    = document.querySelectorAll('.hero__dot');
  const video1  = document.getElementById('heroVideo1');
  const video2  = document.getElementById('heroVideo2');

  if (!slides.length) return;

  let current         = 0;
  let isTransitioning = false;
  const INTERVAL      = 9000; // ms per slide

  // Start both video but only show the active one
  [video1, video2].forEach(v => { if (v) { v.load(); v.play().catch(() => {}); } });

  // ── Word-bounce animation ──────────────────────────────────
  function animateWords(slideEl, delayOffset = 0) {
    const words = slideEl.querySelectorAll('.hw');
    // Reset first
    gsap.set(words, { y: -90, opacity: 0, scale: 0.85 });
    // Then animate each word with a staggered elastic bounce
    gsap.to(words, {
      y: 0,
      opacity: 1,
      scale: 1,
      stagger: 0.1,
      delay: delayOffset + 0.35,
      duration: 1.1,
      ease: 'bounce.out',
    });
  }

  // ── Activate a slide ───────────────────────────────────────
  function activateSlide(idx) {
    const slide = slides[idx];
    slide.classList.add('active');
    if (heroSection) heroSection.setAttribute('data-slide', idx + 1);

    // Sync video
    if (idx === 0) {
      if (video1) video1.style.opacity = '1';
      if (video2) video2.style.opacity = '0';
    } else {
      if (video1) video1.style.opacity = '0';
      if (video2) video2.style.opacity = '1';
    }

    // Animate words for this slide
    animateWords(slide, 0);

    // Dot
    dots.forEach((d, i) => {
      d.classList.toggle('hero__dot--active', i === idx);
    });
  }

  // ── Transition to new slide ────────────────────────────────
  function goTo(idx) {
    if (isTransitioning || idx === current) return;
    isTransitioning = true;

    slides[current].classList.remove('active');
    setTimeout(() => {
      current = idx;
      activateSlide(idx);
      setTimeout(() => { isTransitioning = false; }, 1300);
    }, 200);
  }

  // ── Init first slide ───────────────────────────────────────
  activateSlide(0);

  // ── Auto-advance ───────────────────────────────────────────
  let timer = setInterval(() => goTo((current + 1) % slides.length), INTERVAL);

  // ── Dot clicks ─────────────────────────────────────────────
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goTo(i);
      timer = setInterval(() => goTo((current + 1) % slides.length), INTERVAL);
    });
  });
}


/* ============================================================
   COUNTER ANIMATION
============================================================ */
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const obj = { val: 0 };
  gsap.to(obj, {
    val: target,
    duration: 1.8,
    ease: 'power2.out',
    onUpdate: () => { el.textContent = Math.floor(obj.val); },
  });
}

ScrollTrigger.create({
  trigger: '.hero__stats',
  start: 'top 90%',
  once: true,
  onEnter: () => document.querySelectorAll('[data-count]').forEach(animateCounter),
});

/* ============================================================
   SCROLL ANIMATIONS
============================================================ */
const animMap = {
  fadeUp:      { y: 40, opacity: 0 },
  slideLeft:   { x: -60, opacity: 0 },
  slideRight:  { x: 60, opacity: 0 },
  cardReveal:  { y: 60, opacity: 0, scale: 0.95 },
  processStep: { y: 40, opacity: 0 },
};

Object.keys(animMap).forEach((type) => {
  document.querySelectorAll(`[data-animate="${type}"]`).forEach((el) => {
    const delay = parseFloat(el.dataset.delay || 0);
    const to = { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.85, delay, ease: 'power3.out' };
    gsap.to(el, {
      ...to,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
});

gsap.to('.cta-section__content', {
  opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
  scrollTrigger: { trigger: '.cta-section', start: 'top 78%', once: true },
});

gsap.fromTo('.process__line',
  { scaleY: 0 },
  {
    scaleY: 1, transformOrigin: 'top center', ease: 'none',
    scrollTrigger: {
      trigger: '.process__timeline',
      start: 'top 80%', end: 'bottom 80%',
      scrub: 2,
    },
  },
);

/* ============================================================
   SCROLL LISTENER
============================================================ */
const nav = document.getElementById('nav');
const backToTop = document.getElementById('backToTop');
let scrollRaf = false;

window.addEventListener('scroll', () => {
  if (!scrollRaf) {
    scrollRaf = true;
    requestAnimationFrame(handleScroll);
  }
}, { passive: true });

function handleScroll() {
  scrollRaf = false;
  const y = window.scrollY;
  nav?.classList.toggle('nav--scrolled', y > 60);
  backToTop?.classList.toggle('visible', y > 400);
}

/* ============================================================
   ACTIVE NAV LINKS
============================================================ */
const navLinks = document.querySelectorAll('.nav__link');
const sections = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.dataset.nav === entry.target.id);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' },
);
sections.forEach((s) => navObserver.observe(s));

/* ============================================================
   MOBILE MENU
============================================================ */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.nav__mobile-link, .nav__mobile .btn').forEach((link) => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    mobileMenu?.classList.remove('open');
  });
});

/* ============================================================
   BACK TO TOP
============================================================ */
backToTop?.addEventListener('click', () => lenis.scrollTo(0, { duration: 1.3 }));

/* ============================================================
   CONTACT FORM
============================================================ */
document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const btnText = btn.querySelector('.btn-text');
  const btnSpinner = btn.querySelector('.btn-spinner');

  btn.disabled = true;
  btnText.style.display = 'none';
  btnSpinner.style.display = 'inline';

  await new Promise((r) => setTimeout(r, 1500));

  btnText.textContent = '✓ Message Sent!';
  btnText.style.display = 'inline';
  btnSpinner.style.display = 'none';
  gsap.fromTo(btn, { scale: 0.97 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' });

  setTimeout(() => {
    e.target.reset();
    btn.disabled = false;
    btnText.textContent = 'Send Message';
  }, 3000);
});

/* ============================================================
   BLOB MOUSE PARALLAX (replaces orb parallax)
============================================================ */
let pxTick = false;
if (!isTouch) {
  document.addEventListener('mousemove', (e) => {
    if (pxTick) return;
    pxTick = true;
    requestAnimationFrame(() => {
      const mx = (e.clientX / window.innerWidth  - 0.5);
      const my = (e.clientY / window.innerHeight - 0.5);
      const b1 = document.querySelector('.hero__blob--1');
      const b2 = document.querySelector('.hero__blob--2');
      const b3 = document.querySelector('.hero__blob--3');
      const b4 = document.querySelector('.hero__blob--4');
      if (b1) b1.style.transform = `translate(${mx * -28}px, ${my * -20}px)`;
      if (b2) b2.style.transform = `translate(${mx * 22}px, ${my * 16}px)`;
      if (b3) b3.style.transform = `translate(${mx * -15}px, ${my * -12}px)`;
      if (b4) b4.style.transform = `translate(${mx * 18}px, ${my * 14}px)`;
      pxTick = false;
    });
  }, { passive: true });
}

/* ============================================================
   SERVICE CARD 3D TILT
============================================================ */
document.querySelectorAll('.hover-swivel').forEach((card) => {
  if (isTouch) return;
  const tiltAmount = isMobile ? 5 : 8;
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * tiltAmount;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * tiltAmount;
    card.style.transform = `perspective(700px) rotateX(${-y}deg) rotateY(${x}deg) translateY(-8px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ============================================================
   TEXT SCRAMBLE — service card titles
============================================================ */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function scramble(el) {
  if (el._scrambling) return;
  el._scrambling = true;
  const original = el.dataset.original || el.textContent;
  el.dataset.original = original;
  let frame = 0;
  const total = 18;
  const id = setInterval(() => {
    el.textContent = original.split('').map((ch, i) => {
      if (ch === ' ') return ' ';
      return frame / total > i / original.length
        ? original[i]
        : CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
    if (++frame > total) {
      el.textContent = original;
      clearInterval(id);
      el._scrambling = false;
    }
  }, 36);
}

document.querySelectorAll('.services__card-title').forEach((el) => {
  el.addEventListener('mouseenter', () => scramble(el));
});

/* ============================================================
   NAVBAR ENTRANCE — slide down on load
============================================================ */
gsap.from('.nav', {
  y: -80,
  opacity: 0,
  duration: 1,
  delay: 0.2,
  ease: 'power3.out',
});

/* ============================================================
   TEAM PHOTO SLIDESHOWS
============================================================ */
document.querySelectorAll('.team__slideshow[data-autoplay]').forEach((show) => {
  const slides = show.querySelectorAll('.team__slide');
  if (slides.length < 2) return;

  // Dots live in a sibling element of the slideshow's parent
  const wrap = show.closest('.team__photo-wrap');
  const dots  = wrap ? wrap.querySelectorAll('.team__dot') : [];

  let idx = 0;

  setInterval(() => {
    slides[idx].classList.remove('active');
    if (dots[idx]) dots[idx].classList.remove('active');

    idx = (idx + 1) % slides.length;

    slides[idx].classList.add('active');
    if (dots[idx]) dots[idx].classList.add('active');
  }, 3500);
});

console.log(
  '%c🚀 HAYNES CONSULT%c\nBuilt for Scale. Designed for Results.',
  'color:#1565C0;font-size:18px;font-weight:bold;',
  'color:rgba(13,43,126,0.6);font-size:12px;',
);

/* ============================================================
   TESTIMONIALS SLIDESHOW (AUTOPLAY + CINEMATIC CROSSFADE)
============================================================ */
document.querySelectorAll('.testimonials__slideshow[data-autoplay]').forEach((show) => {
  const slides = show.querySelectorAll('.testimonials__slide');
  if (slides.length < 2) return;

  const wrap = show.closest('.testimonials__slideshow-wrap');
  const dots  = wrap ? wrap.querySelectorAll('.testimonials__dot') : [];

  let idx = 0;
  let animating = false;

  let timer = setInterval(nextSlide, 6000);

  function goTo(nextIdx) {
    if (animating || nextIdx === idx) return;
    animating = true;

    const current = slides[idx];
    const next    = slides[nextIdx];

    // 1. Trigger exit on current slide
    current.classList.add('leaving');
    current.classList.remove('active');
    if (dots[idx]) dots[idx].classList.remove('active');

    // 2. After exit animation (~550ms), make the leaving slide fully gone
    //    and trigger the enter animation on the new slide
    setTimeout(() => {
      current.classList.remove('leaving');

      idx = nextIdx;
      next.classList.add('active');
      if (dots[idx]) dots[idx].classList.add('active');

      // Allow next transition after enter animation completes (~700ms)
      setTimeout(() => { animating = false; }, 700);
    }, 500);
  }

  function nextSlide() {
    goTo((idx + 1) % slides.length);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goTo(i);
      timer = setInterval(nextSlide, 6000);
    });
  });
});
