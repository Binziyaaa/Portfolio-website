/* ============================================================
   BINZIYA K A — PORTFOLIO  |  script.js
   Modular, well-commented vanilla JavaScript
   ============================================================ */

'use strict';

/* ============================================================
   CONFIG
   ============================================================ */
const CONFIG = {
  // Update with your actual email address
  EMAIL: 'binziyaka.email@example.com',

  // Typing animation phrases (hero tagline)
  TYPING_PHRASES: [
    'Learn.',
    'Build.',
    'Improve.',
  ],

  // Loading screen minimum display time (ms)
  LOADING_MIN_MS: 1600,

  // Back-to-top trigger scroll depth (px)
  BACK_TOP_THRESHOLD: 400,

  // Nav scroll trigger (px)
  NAV_SCROLL_THRESHOLD: 48,
};

/* ============================================================
   1. THEME MANAGER
   ─ Reads stored preference → applies on load (FOUC handled
     by inline script in <head>). Toggle switches & persists.
   ============================================================ */
function initTheme() {
  const root   = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'dark';
    const next    = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });
}

/* ============================================================
   2. LOADING SCREEN
   ─ Hides after page load or minimum duration, whichever is
     longer. Removes from DOM after the transition ends.
   ============================================================ */
function initLoadingScreen() {
  const screen    = document.getElementById('loading-screen');
  const body      = document.body;
  if (!screen) return;

  // Prevent scrolling during intro
  body.classList.add('is-loading');

  const startTime = Date.now();

  function hideScreen() {
    const elapsed   = Date.now() - startTime;
    const remaining = Math.max(0, CONFIG.LOADING_MIN_MS - elapsed);

    setTimeout(() => {
      screen.classList.add('hidden');
      body.classList.remove('is-loading');

      // Remove from DOM once transition completes
      screen.addEventListener(
        'transitionend',
        () => screen.remove(),
        { once: true }
      );
    }, remaining);
  }

  if (document.readyState === 'complete') {
    hideScreen();
  } else {
    window.addEventListener('load', hideScreen, { once: true });
  }
}

/* ============================================================
   3. NAVBAR
   ─ Adds `.scrolled` class when user scrolls past threshold.
     This triggers backdrop-filter blur + background opacity.
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function update() {
    navbar.classList.toggle('scrolled', window.scrollY > CONFIG.NAV_SCROLL_THRESHOLD);
  }

  window.addEventListener('scroll', update, { passive: true });
  update(); // Run once on init
}

/* ============================================================
   4. ACTIVE NAV INDICATOR
   ─ Uses IntersectionObserver to detect which section is
     currently in view and highlights the matching nav link.
   ============================================================ */
function initActiveNav() {
  const links    = document.querySelectorAll('.nav-link[data-section]');
  const sections = document.querySelectorAll('section[id]');
  if (!links.length || !sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;
        links.forEach((link) => {
          const match = link.dataset.section === id;
          link.classList.toggle('active', match);
        });
      });
    },
    {
      // Fire when 40% of section enters, leaving at 55%
      rootMargin: '-40% 0px -55% 0px',
    }
  );

  sections.forEach((s) => observer.observe(s));
}

/* ============================================================
   5. TYPING ANIMATION (Hero tagline)
   ─ Cycles through TYPING_PHRASES using a typewriter effect.
     Includes configurable type/delete speeds and pause durations.
   ============================================================ */
function initTypingAnimation() {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const phrases     = CONFIG.TYPING_PHRASES;
  const SPEED_TYPE  = 65;   // ms per character (typing)
  const SPEED_DEL   = 38;   // ms per character (deleting)
  const PAUSE_END   = 2400; // ms pause at full phrase
  const PAUSE_START = 480;  // ms pause before typing next

  let phraseIndex = 0;
  let charIndex   = 0;
  let isDeleting  = false;
  let timer;

  function tick() {
    const phrase = phrases[phraseIndex];

    if (isDeleting) {
      // Remove one character
      charIndex--;
      el.textContent = phrase.slice(0, charIndex);

      if (charIndex === 0) {
        isDeleting  = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        timer = setTimeout(tick, PAUSE_START);
      } else {
        timer = setTimeout(tick, SPEED_DEL);
      }
    } else {
      // Add one character
      charIndex++;
      el.textContent = phrase.slice(0, charIndex);

      if (charIndex === phrase.length) {
        isDeleting = true;
        timer = setTimeout(tick, PAUSE_END);
      } else {
        timer = setTimeout(tick, SPEED_TYPE);
      }
    }
  }

  // Start after loading screen clears
  timer = setTimeout(tick, CONFIG.LOADING_MIN_MS + 200);
}

/* ============================================================
   6. SCROLL REVEAL
   ─ Elements with class `.reveal` animate in when they enter
     the viewport. Supports `data-delay` for stagger effects.
   ============================================================ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  // Add stagger delays to grid children
  const staggerGroups = [
    { selector: '.skills-grid .skill-card', step: 80 },
    { selector: '.certs-grid .cert-card',  step: 120 },
    { selector: '.about-stats .stat-card', step: 80  },
  ];

  staggerGroups.forEach(({ selector, step }) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      if (!el.dataset.delay) el.dataset.delay = i * step;
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const delay = parseInt(entry.target.dataset.delay || 0, 10);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.10,
      rootMargin: '0px 0px -44px 0px',
    }
  );

  // Re-query to include dynamically added `.reveal` elements
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

/* ============================================================
   7. STAT COUNTER ANIMATION
   ─ When stat cards enter view, animates numbers from 0 to
     their target value using ease-out-cubic interpolation.
   ============================================================ */
function initStatCounters() {
  const cards = document.querySelectorAll('.stat-card');
  if (!cards.length) return;

  function animateValue(el, target, decimals, duration = 1200) {
    const start     = performance.now();
    const formatter = (n) =>
      decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatter(target * eased);

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        const valEl   = entry.target.querySelector('.stat-value');
        if (!valEl) return;

        const target   = parseFloat(valEl.dataset.target);
        const decimals = parseInt(valEl.dataset.decimal || 0, 10);
        animateValue(valEl, target, decimals);
      });
    },
    { threshold: 0.5 }
  );

  cards.forEach((c) => observer.observe(c));
}

/* ============================================================
   8. MOBILE MENU
   ─ Toggles `.open` on the overlay and `.active` on the
     hamburger button. Locks body scroll while open.
     Closes on link click or Escape key.
   ============================================================ */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  if (!hamburger || !mobileMenu) return;

  function setOpen(open) {
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('active');
    setOpen(!isOpen);
  });

  // Close on nav link click
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  // Close when clicking outside menu area
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) setOpen(false);
  });
}

/* ============================================================
   9. SMOOTH SCROLL
   ─ Intercepts anchor clicks, calculates offset accounting
     for the sticky navbar height, then scrolls smoothly.
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const navH   = document.getElementById('navbar')?.offsetHeight ?? 72;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   10. BACK TO TOP BUTTON
   ─ Fades in after scrolling past threshold. Smooth-scrolls
     to the very top of the page on click.
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener(
    'scroll',
    () => btn.classList.toggle('visible', window.scrollY > CONFIG.BACK_TOP_THRESHOLD),
    { passive: true }
  );

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   11. CONTACT FORM (mailto)
   ─ On submit, validates fields and constructs a mailto: URI
     with the name, email, and message pre-filled.
   ============================================================ */
function initContactForm() {
  const form    = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('contact-name')?.value.trim()    || '';
    const email   = document.getElementById('contact-email')?.value.trim()   || '';
    const message = document.getElementById('contact-message')?.value.trim() || '';

    // Basic validation
    if (!name || !email || !message) {
      shakeElement(submitBtn);
      return;
    }

    if (!isValidEmail(email)) {
      shakeElement(document.getElementById('contact-email'));
      return;
    }

    // Build mailto URL
    const subject = encodeURIComponent(`Portfolio Enquiry — ${name}`);
    const body    = encodeURIComponent(
      `Hi Binziya,\n\nName: ${name}\nEmail: ${email}\n\n${message}`
    );

    window.location.href = `mailto:${CONFIG.EMAIL}?subject=${subject}&body=${body}`;
  });
}

/** Shake animation for invalid field feedback */
function shakeElement(el) {
  if (!el) return;
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
  el.addEventListener('animationend', () => (el.style.animation = ''), { once: true });
}

/** Simple email format validator */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================
   12. CSS ANIMATION INJECTION (Shake)
   ─ Injects the shake keyframe into the page at runtime so
     we don't need to add it to style.css.
   ============================================================ */
function injectDynamicStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-6px); }
      40%       { transform: translateX(6px); }
      60%       { transform: translateX(-4px); }
      80%       { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
}

/* ============================================================
   13. CARD TILT EFFECT (Subtle 3-D on mouse move)
   ─ Adds a very subtle perspective tilt on project and cert
     cards as the mouse moves over them. Keeps it premium,
     not gimmicky.
   ============================================================ */
function initCardTilt() {
  const cards = document.querySelectorAll(
    '.skill-card, .cert-card, .stat-card, .project-card'
  );

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const tiltX  = ((y - cy) / cy) * 4;   // max ±4deg
      const tiltY  = ((x - cx) / cx) * -4;

      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ============================================================
   14. INIT — Run everything on DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  injectDynamicStyles();
  initTheme();
  initLoadingScreen();
  initNavbar();
  initActiveNav();
  initTypingAnimation();
  initScrollReveal();
  initStatCounters();
  initMobileMenu();
  initSmoothScroll();
  initBackToTop();
  initContactForm();
  initCardTilt();
});
