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
      initHeroTypingAnimation();
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
   HERO TYPING ANIMATION
   Types "Haynes" then "Consult" with cursor, then continues
============================================================ */
function initHeroTypingAnimation() {
  const mainLine = document.querySelector('.hero__wordmark-line--main');
  const subLine  = document.querySelector('.hero__wordmark-line--sub');

  if (!mainLine || !subLine) {
    initHeroFallback();
    return;
  }

  const mainText = 'HAYNES';
  const subText  = 'CONSULT';

  // Set data-text for shimmer pseudo-element
  mainLine.dataset.text = mainText;

  // Make lines visible but empty
  mainLine.style.opacity = '1';
  mainLine.textContent = '';
  subLine.style.opacity = '1';
  subLine.textContent = '';

  // Create blinking cursor
  const typingCursor = document.createElement('span');
  typingCursor.className = 'hero__typing-cursor';
  mainLine.appendChild(typingCursor);

  // Phase 1: Fade badge in
  gsap.to('.hero__badge', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });

  // Phase 2: Type "HAYNES" after 0.5s
  let charIndex = 0;
  const typeMain = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const interval = setInterval(() => {
          if (charIndex < mainText.length) {
            mainLine.textContent = mainText.slice(0, charIndex + 1);
            mainLine.appendChild(typingCursor);
            charIndex++;
          } else {
            clearInterval(interval);
            resolve();
          }
        }, 80); // type speed per character
      }, 600);
    });
  };

  // Phase 3: Move cursor to sub line and type "CONSULT"
  const typeSub = () => {
    return new Promise((resolve) => {
      // Brief pause before typing Consult
      setTimeout(() => {
        // Move cursor to sub
        if (typingCursor.parentNode) typingCursor.parentNode.removeChild(typingCursor);
        subLine.textContent = '';
        subLine.appendChild(typingCursor);

        let i = 0;
        const interval = setInterval(() => {
          if (i < subText.length) {
            subLine.textContent = subText.slice(0, i + 1);
            subLine.appendChild(typingCursor);
            i++;
          } else {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      }, 300);
    });
  };

  // Phase 4: Remove cursor and animate rest of hero
  const finishHero = () => {
    setTimeout(() => {
      // Cursor fades and disappears after a couple more blinks
      setTimeout(() => {
        if (typingCursor.parentNode) {
          gsap.to(typingCursor, {
            opacity: 0, duration: 0.4,
            onComplete: () => typingCursor.parentNode?.removeChild(typingCursor),
          });
        }
      }, 1200);

      // Now shimmer effect on mainLine text needs data-text reset
      mainLine.dataset.text = mainText;

      // Animate rule expands
      gsap.to('.hero__rule', { opacity: 1, width: '280px', duration: 0.7, ease: 'power2.inOut' });

      // Cascade rest of hero elements
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl
        .to('.hero__tagline',   { opacity: 1, y: 0, duration: 0.7 })
        .to('.hero__subtitle',  { opacity: 1, y: 0, duration: 0.65 }, '-=0.4')
        .to('.hero__actions',   { opacity: 1, y: 0, duration: 0.65 }, '-=0.35')
        .to('.hero__stats',     { opacity: 1, y: 0, duration: 0.65 }, '-=0.3');

    }, 400);
  };

  // Run sequence
  typeMain().then(() => typeSub()).then(finishHero);
}

function initHeroFallback() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl
    .to('.hero__badge',               { opacity: 1, y: 0, duration: 0.7 })
    .to('.hero__wordmark-line--main', { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, '-=0.3')
    .to('.hero__wordmark-line--sub',  { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.55')
    .to('.hero__rule',                { opacity: 1, width: '280px', duration: 0.7, ease: 'power2.inOut' }, '-=0.3')
    .to('.hero__tagline',             { opacity: 1, y: 0, duration: 0.7 }, '-=0.2')
    .to('.hero__subtitle',            { opacity: 1, y: 0, duration: 0.65 }, '-=0.4')
    .to('.hero__actions',             { opacity: 1, y: 0, duration: 0.65 }, '-=0.35')
    .to('.hero__stats',               { opacity: 1, y: 0, duration: 0.65 }, '-=0.3');
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
document.querySelectorAll('.services__card').forEach((card) => {
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

console.log(
  '%c🚀 HAYNES CONSULT%c\nBuilt for Scale. Designed for Results.',
  'color:#1565C0;font-size:18px;font-weight:bold;',
  'color:rgba(13,43,126,0.6);font-size:12px;',
);
