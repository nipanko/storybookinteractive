/* ============================================
   STORYBOOK INTERACTIVE — Main JS v3
   Lenis + GSAP + Canvas Particles + 3D Book
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
    const toggles = document.querySelectorAll('#themeToggle, #themeToggleMobile');
    const html = document.documentElement;

    const saved = localStorage.getItem('sb-theme');
    if (saved) {
      html.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.setAttribute('data-theme', 'dark');
    }
    updateToggleIcon();

    toggles.forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('sb-theme', next);
        updateToggleIcon();
      });
    });

    function updateToggleIcon() {
      const isDark = html.getAttribute('data-theme') === 'dark';
      toggles.forEach((btn) => {
        btn.textContent = isDark ? '☀️' : '🌙';
      });
    }
  }

  /* ---------- LOADER ---------- */
  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    function hide() {
      if (loader.classList.contains('hidden')) return;
      gsap.to(loader, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          loader.classList.add('hidden');
          initHeroEntrance();
        },
      });
    }

    window.addEventListener('load', () => setTimeout(hide, 500));
    setTimeout(hide, 3000);
  }

  /* ---------- HERO ENTRANCE ---------- */
  function initHeroEntrance() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('#heroGreeting', { opacity: 0, y: 30, duration: 0.8 })
      .from('#heroTitle', { opacity: 0, y: 40, duration: 1.0 }, '-=0.3')
      .from('#heroBio', { opacity: 0, y: 25, duration: 0.8 }, '-=0.5')
      .from(
        '#heroActions .btn',
        { opacity: 0, y: 20, stagger: 0.15, duration: 0.7 },
        '-=0.4'
      )
      .from(
        '.hero-float-item',
        {
          opacity: 0,
          scale: 0,
          rotation: -30,
          stagger: { each: 0.08, from: 'random' },
          duration: 0.8,
          ease: 'back.out(1.7)',
        },
        '-=0.6'
      );
  }

  /* ---------- HERO FLOATING ELEMENTS ---------- */
  function initHeroFloaters() {
    const floaters = document.querySelectorAll('.hero-float-item');
    const hero = document.querySelector('.hero');
    if (!floaters.length || !hero) return;

    // Give each floater a unique continuous GSAP animation
    floaters.forEach((item) => {
      const speed = parseFloat(item.dataset.speed) || 3;
      const depth = parseFloat(item.dataset.depth) || 0.3;

      // Gentle float (Y bob)
      gsap.to(item, {
        y: `+=${12 + depth * 20}`,
        duration: speed,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      // Slow rotation on the inner card
      const card = item.querySelector('.float-3d-card');
      gsap.to(card, {
        rotateY: 15,
        rotateX: -10,
        duration: speed * 1.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: depth,
      });
    });

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    let rafId;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    hero.addEventListener('mouseleave', () => {
      mouseX = 0;
      mouseY = 0;
    });

    function updateParallax() {
      floaters.forEach((item) => {
        const depth = parseFloat(item.dataset.depth) || 0.3;
        const moveX = mouseX * depth * 40;
        const moveY = mouseY * depth * 30;
        const rotX = mouseY * depth * -8;
        const rotY = mouseX * depth * 8;

        gsap.to(item, {
          x: moveX,
          rotateX: rotX,
          rotateY: rotY,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        // Y is handled by the float animation, so we use a different approach
        // Apply the mouse offset to the card inside
        const card = item.querySelector('.float-3d-card');
        gsap.to(card, {
          y: moveY,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });

      rafId = requestAnimationFrame(updateParallax);
    }

    updateParallax();
  }
  function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height, particles;

    function resize() {
      const section = canvas.parentElement;
      width = canvas.width = section.offsetWidth;
      height = canvas.height = section.offsetHeight;
    }

    function createParticles() {
      const count = Math.min(60, Math.floor((width * height) / 15000));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 2.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      const isDark =
        document.documentElement.getAttribute('data-theme') === 'dark';
      const color = isDark ? '255,200,87' : '255,200,87';

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${isDark ? p.opacity * 0.6 : p.opacity})`;
        ctx.fill();
      });

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${color}, ${(1 - dist / 120) * (isDark ? 0.08 : 0.12)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    resize();
    createParticles();
    animate();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        createParticles();
      }, 200);
    });
  }

  /* ---------- FLOATING STARS ---------- */
  function initStars() {
    const container = document.getElementById('starsContainer');
    if (!container) return;

    const types = ['✦', '✧', '★', '☆', '✴'];
    const sizes = ['small', 'medium', 'large'];

    for (let i = 0; i < 20; i++) {
      const star = document.createElement('div');
      star.className = 'star ' + sizes[Math.floor(Math.random() * sizes.length)];
      star.textContent = types[Math.floor(Math.random() * types.length)];
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.setProperty('--dur', 2 + Math.random() * 3 + 's');
      star.style.animationDelay = Math.random() * 4 + 's';
      container.appendChild(star);
    }

    gsap.to(container, {
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
      y: -100,
    });
  }

  /* ---------- AESTHETIC SHAPES ---------- */
  function initShapes() {
    const container = document.getElementById('aestheticShapes');
    if (!container) return;

    const shapeClasses = ['cross', 'square'];

    for (let i = 0; i < 12; i++) {
      const shape = document.createElement('div');
      shape.className = `shape ${shapeClasses[Math.floor(Math.random() * shapeClasses.length)]}`;
      shape.style.left = `${Math.random() * 100}%`;
      shape.style.top = `${Math.random() * 100}%`;
      shape.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(shape);

      gsap.to(shape, {
        y: `+=${Math.random() * 50 - 25}`,
        x: `+=${Math.random() * 50 - 25}`,
        rotation: `+=${Math.random() * 90 - 45}`,
        duration: 5 + Math.random() * 5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }

    gsap.to(container, {
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
      },
      y: -120,
    });
  }

  /* ---------- NAVIGATION ---------- */
  function initNavigation() {
    const header = document.getElementById('siteHeader');
    const toggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('[data-mobile-link]');

    ScrollTrigger.create({
      start: 'top -60',
      onUpdate: (self) => {
        header.classList.toggle('scrolled', self.progress > 0);
      },
    });

    if (toggle && mobileMenu) {
      toggle.addEventListener('click', () => {
        const isOpen = toggle.classList.contains('active');
        toggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        toggle.setAttribute('aria-expanded', String(!isOpen));

        if (!isOpen) {
          lenis.stop();
        } else {
          lenis.start();
        }
      });

      mobileLinks.forEach((link) => {
        link.addEventListener('click', () => {
          toggle.classList.remove('active');
          mobileMenu.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
          lenis.start();
        });
      });
    }

    // Smooth scroll using Lenis
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          lenis.scrollTo(target, {
            offset: -(header.offsetHeight + 10),
            duration: 1.2,
          });
        }
      });
    });
  }

  /* ---------- SCROLL ANIMATIONS ---------- */
  function initScrollAnimations() {
    // Section headers
    gsap.utils.toArray('.section-header').forEach((header) => {
      gsap.from(header, {
        scrollTrigger: {
          trigger: header,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 35,
        duration: 1.0,
        ease: 'power3.out',
      });
    });

    // Game cards
    gsap.utils.toArray('.game-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 60,
        rotation: i % 2 === 0 ? -3 : 3,
        duration: 1.0,
        delay: i * 0.15,
        ease: 'back.out(1.2)',
        onComplete: () => {
          // Gentle continuous float
          gsap.to(card, {
            y: '-=8',
            duration: 2.5 + Math.random(),
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: Math.random() * 0.5,
          });
        },
      });
    });

    // Mission content
    gsap.utils.toArray('.mission-content').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 40,
        duration: 1.0,
        ease: 'power3.out',
      });
    });

    // Value cards
    gsap.utils.toArray('.value-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 40,
        scale: 0.92,
        duration: 0.9,
        delay: i * 0.12,
        ease: 'back.out(1.3)',
      });
    });

    // Founder grid
    gsap.utils.toArray('.founder-grid').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 40,
        duration: 1.0,
        ease: 'power3.out',
      });
    });

    // Contact form
    gsap.utils.toArray('.contact-form').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: 'power3.out',
      });
    });
  }

  /* ---------- CONTACT FORM ---------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) {
        status.textContent = '⚠️ Please fill in all fields!';
        status.style.color = 'var(--coral)';
        return;
      }

      const subject = encodeURIComponent(
        'Message from ' + name + ' via Storybook Interactive'
      );
      const body = encodeURIComponent(
        'Name: ' +
          name +
          '\nEmail: ' +
          email +
          '\n\nMessage:\n' +
          message
      );
      window.location.href =
        'mailto:nipanko@storybookinteractive.com?subject=' +
        subject +
        '&body=' +
        body;

      status.textContent = '✨ Opening your email app...';
      status.style.color = 'var(--gold)';

      setTimeout(() => {
        form.reset();
        status.textContent = '';
      }, 3000);
    });
  }

  /* ---------- INTERACTIVE EYES ---------- */
  function initInteractiveEyes() {
    const leftPupil = document.getElementById('leftPupil');
    const rightPupil = document.getElementById('rightPupil');
    const portrait = document.getElementById('founderPortrait');

    if (!leftPupil || !rightPupil || !portrait) return;

    const maxMove = 5;

    document.addEventListener('mousemove', (e) => {
      const rect = portrait.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      const dist = Math.sqrt(
        Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2)
      );
      const factor = Math.min(dist / (window.innerWidth / 2), 1);

      const tx = Math.cos(angle) * maxMove * factor;
      const ty = Math.sin(angle) * maxMove * factor;

      gsap.to([leftPupil, rightPupil], {
        x: tx,
        y: ty,
        duration: 0.15,
        ease: 'power2.out',
      });
    });
  }

  /* ---------- INIT ---------- */
  function init() {
    initTheme();
    initLoader();
    initHeroCanvas();
    initHeroFloaters();
    initStars();
    initShapes();
    initNavigation();
    initScrollAnimations();
    initContactForm();
    initInteractiveEyes();

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
