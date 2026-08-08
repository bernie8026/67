(() => {
  'use strict';

  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');

  const closeMenu = () => {
    if (!menuToggle || !menu) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    body.classList.remove('menu-open');
  };

  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
      body.classList.toggle('menu-open', !open);
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => { if (window.innerWidth > 820) closeMenu(); });
  }

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const currentFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.site-nav a[href]').forEach((link) => {
    const href = (link.getAttribute('href') || '').split('#')[0].toLowerCase();
    if (href && href === currentFile) link.setAttribute('aria-current', 'page');
  });

  const boot = document.querySelector('.boot-screen');
  if (boot) {
    const dismiss = () => {
      boot.classList.add('is-hidden');
      window.setTimeout(() => boot.remove(), reducedMotion ? 120 : 650);
    };
    if (document.readyState === 'complete') window.setTimeout(dismiss, 350);
    else window.addEventListener('load', () => window.setTimeout(dismiss, 350), { once: true });
    window.setTimeout(dismiss, 1800);
  }

  const revealTargets = document.querySelectorAll('[data-reveal], .archive-card, .guide-card, .feature-transmission, .profile-layout');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });
    revealTargets.forEach((el) => revealObserver.observe(el));
  }

  const trackedSections = document.querySelectorAll('[data-section]');
  const railLinks = document.querySelectorAll('[data-rail-link]');
  if (trackedSections.length && railLinks.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!active) return;
      railLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.railLink === active.target.dataset.section));
    }, { threshold: [0.12, 0.35], rootMargin: '-25% 0px -55% 0px' });
    trackedSections.forEach((section) => sectionObserver.observe(section));
  }

  const parallaxItems = document.querySelectorAll('[data-parallax]');
  if (!reducedMotion && window.matchMedia('(pointer:fine)').matches && parallaxItems.length) {
    let raf = 0;
    window.addEventListener('pointermove', (event) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        parallaxItems.forEach((item) => {
          const depth = Number(item.dataset.parallax || 0);
          item.style.transform = `translate3d(${x * depth * 34}px, ${y * depth * 24}px, 0)`;
        });
        raf = 0;
      });
    }, { passive: true });
  }

  const transition = document.createElement('div');
  transition.className = 'page-transition';
  transition.setAttribute('aria-hidden', 'true');
  transition.innerHTML = '<div class="page-transition__grid"></div><div class="page-transition__content"><span>AERO EDU // SECURE LINK</span><strong>ACCESSING PLATFORM</strong><div class="page-transition__bar"><i></i></div></div>';
  body.appendChild(transition);

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const raw = link.getAttribute('href') || '';
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') || link.target === '_blank') return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
    event.preventDefault();
    body.classList.add('is-page-leaving');
    closeMenu();
    window.setTimeout(() => location.assign(url.href), reducedMotion ? 100 : 520);
  });

  window.addEventListener('pageshow', () => body.classList.remove('is-page-leaving'));
})();
