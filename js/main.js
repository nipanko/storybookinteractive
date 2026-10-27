/* ============================================
   STORYBOOK INTERACTIVE — Main JS v6
   Smooth Lenis + GSAP Scroll Reveals + Modern Micro-Interactions
   ============================================ */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- LENIS SMOOTH SCROLL ---------- */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ---------- THEME TOGGLE ---------- */
  function initTheme() {
    const toggle = document.getElementById('cinThemeToggle');
    const html = document.documentElement;

    const saved = localStorage.getItem('sb-theme');
    if (saved) {
      html.setAttribute('data-theme', saved);
    }
    updateIcon();

    if (toggle) {
      toggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('sb-theme', next);
        updateIcon();
      });
    }

    function updateIcon() {
      if (!toggle) return;
      const isDark = html.getAttribute('data-theme') === 'dark';
      // Sun icon for dark mode (click to go light), Moon icon for light mode (click to go dark)
      toggle.innerHTML = isDark
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
  }

  /* ---------- MOBILE MENU (Mobile Only <= 768px) ---------- */
  function initMobileMenu() {
    const toggle = document.getElementById('cinMenuToggle');
    const menu = document.getElementById('cinMobileMenu');
    const links = document.querySelectorAll('[data-mobile-link]');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.contains('active');
      toggle.classList.toggle('active');
      menu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', String(!isOpen));

      if (!isOpen) {
        lenis.stop();
      } else {
        lenis.start();
      }
    });

    links.forEach((link) => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        lenis.start();
      });
    });

    // Close on resize if viewport expands beyond mobile breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && menu.classList.contains('active')) {
        toggle.classList.remove('active');
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        lenis.start();
      }
    });
  }

  /* ---------- SMOOTH ANCHOR LINKS ---------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -24, duration: 1.2 });
        }
      });
    });
  }

  /* ---------- FIXED BACKGROUND VIDEO ---------- */
  function initVideo() {
    const video = document.getElementById('heroVideo');
    if (!video) return;

    video.muted = true;
    const tryPlay = () => {
      video.play().catch(() => {});
    };
    tryPlay();

    // Fallback in case browser policy requires initial interaction
    const unlock = () => {
      tryPlay();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('scroll', unlock);
    };
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    window.addEventListener('scroll', unlock, { once: true });
  }

  /* ---------- GSAP SCROLL ANIMATIONS ---------- */
  function initScrollAnimations() {
    // Section headers reveal
    gsap.utils.toArray('.cin-section-header').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        opacity: 0,
        y: 35,
        duration: 0.9,
        ease: 'power3.out',
      });
    });

    // ELEMENTZ Flagship card reveal
    const elementzCard = document.getElementById('elementzShowcase');
    if (elementzCard) {
      gsap.from(elementzCard, {
        scrollTrigger: { trigger: elementzCard, start: 'top 85%', toggleActions: 'play none none none' },
        opacity: 0,
        y: 50,
        duration: 1.0,
        ease: 'power3.out',
      });
    }

    // Mission value cards stagger
    gsap.utils.toArray('.mission-value-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
        opacity: 0,
        y: 40,
        scale: 0.96,
        duration: 0.8,
        delay: i * 0.12,
        ease: 'power3.out',
      });
    });

    // Founder spotlight card reveal
    const founderCard = document.querySelector('.founder-spotlight-card');
    if (founderCard) {
      gsap.from(founderCard, {
        scrollTrigger: { trigger: founderCard, start: 'top 85%', toggleActions: 'play none none none' },
        opacity: 0,
        y: 40,
        duration: 1.0,
        ease: 'power3.out',
      });
    }

    // Contact card reveal
    const contactCard = document.querySelector('.contact-glass-card');
    if (contactCard) {
      gsap.from(contactCard, {
        scrollTrigger: { trigger: contactCard, start: 'top 88%', toggleActions: 'play none none none' },
        opacity: 0,
        y: 35,
        duration: 0.9,
        ease: 'power3.out',
      });
    }
  }

  /* ---------- CONTACT FORM ---------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (!form || !status) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) {
        status.textContent = 'Please fill out all fields.';
        status.style.color = 'var(--pink)';
        return;
      }

      const subject = encodeURIComponent('Inquiry from ' + name + ' — Storybook Interactive / ELEMENTZ');
      const body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message);
      window.location.href = 'mailto:nipanko@storybookinteractive.com?subject=' + subject + '&body=' + body;

      status.textContent = 'Opening your email client...';
      status.style.color = 'var(--primary)';

      setTimeout(() => {
        form.reset();
        status.textContent = '';
      }, 3500);
    });
  }

  /* ---------- FOUNDER CARD 3D TILT EFFECT ---------- */
  function initFounderTilt() {
    const card = document.querySelector('.founder-spotlight-card');
    const ring = document.querySelector('.founder-insignia-ring');
    if (!card || !ring) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const tiltX = (y / rect.height) * -8;
      const tiltY = (x / rect.width) * 8;

      gsap.to(card, {
        rotateX: tiltX,
        rotateY: tiltY,
        transformPerspective: 1000,
        duration: 0.3,
        ease: 'power2.out',
      });

      gsap.to(ring, {
        x: x * 0.05,
        y: y * 0.05,
        duration: 0.3,
        ease: 'power2.out',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to([card, ring], {
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      });
    });
  }

  /* ---------- INTERACTIVE HERO HEADLINE ("Making Learning Fun Through Play.") ---------- */
  function initInteractiveHeroTitle() {
    const title = document.getElementById('heroInteractiveTitle');
    if (!title) return;

    const words = title.querySelectorAll('.hero-word');
    const wordFun = document.getElementById('wordFun');
    const wordPlay = document.getElementById('wordPlay');

    // 1. Kinetic Elastic Stagger Entrance
    gsap.from(words, {
      opacity: 0,
      y: 45,
      scale: 0.75,
      rotation: () => (Math.random() - 0.5) * 16,
      stagger: 0.09,
      duration: 1.1,
      ease: 'back.out(2.2)',
      delay: 0.25,
      clearProps: 'transform,opacity',
    });

    // 2. Confetti & Sparkle Burst Generator
    function spawnBurst(target, symbols, colors) {
      const rect = target.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      const count = 12;

      for (let i = 0; i < count; i++) {
        const particle = document.createElement('span');
        particle.className = 'burst-particle';
        particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        particle.style.left = originX + 'px';
        particle.style.top = originY + 'px';
        particle.style.color = colors[Math.floor(Math.random() * colors.length)];
        document.body.appendChild(particle);

        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const distance = 40 + Math.random() * 70;
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance - 25;

        gsap.to(particle, {
          x: targetX,
          y: targetY,
          scale: 1.2 + Math.random() * 0.6,
          rotation: (Math.random() - 0.5) * 360,
          opacity: 0,
          duration: 0.85 + Math.random() * 0.35,
          ease: 'power2.out',
          onComplete: () => particle.remove(),
        });
      }
    }

    // 3. Interactive reactions on "Fun"
    if (wordFun) {
      const funSymbols = ['✨', '🎈', '🌟', '💛', '💖', '🎉', '✦'];
      const funColors = ['#ffd700', '#ff5c9f', '#e23d8b', '#38bdf8', '#5dea90'];

      const triggerFun = () => {
        gsap.timeline()
          .to(wordFun, { scale: 1.25, rotate: -10, duration: 0.15, ease: 'power2.out' })
          .to(wordFun, { scale: 1, rotate: 0, duration: 0.45, ease: 'elastic.out(1.5, 0.4)' });
        spawnBurst(wordFun, funSymbols, funColors);
      };

      wordFun.addEventListener('click', triggerFun);
      wordFun.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerFun();
        }
      });
    }

    // 4. Interactive reactions on "Play."
    if (wordPlay) {
      const playSymbols = ['🎮', '✦', '★', '⚡', '💎', '🔥', '⚛️'];
      const playColors = ['#e23d8b', '#ff7bb8', '#ffd700', '#38bdf8', '#ffffff'];

      const triggerPlay = () => {
        gsap.timeline()
          .to(wordPlay, { scale: 1.22, rotate: 8, duration: 0.14, ease: 'power2.out' })
          .to(wordPlay, { scale: 1, rotate: 0, duration: 0.5, ease: 'elastic.out(1.6, 0.4)' });
        spawnBurst(wordPlay, playSymbols, playColors);
      };

      wordPlay.addEventListener('click', triggerPlay);
      wordPlay.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerPlay();
        }
      });
    }

    // 5. Tactile bouncy hover on each individual word
    words.forEach((word) => {
      word.addEventListener('mouseenter', () => {
        gsap.to(word, {
          y: -8,
          scale: 1.08,
          duration: 0.25,
          ease: 'power2.out',
        });
      });
      word.addEventListener('mouseleave', () => {
        gsap.to(word, {
          y: 0,
          scale: 1,
          duration: 0.35,
          ease: 'elastic.out(1.2, 0.4)',
        });
      });
    });
  }

  /* ---------- INIT ---------- */
  function init() {
    initTheme();
    initMobileMenu();
    initAnchors();
    initVideo();
    initInteractiveHeroTitle();
    initScrollAnimations();
    initContactForm();
    initFounderTilt();

    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
