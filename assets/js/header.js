/**
 * Creative Portfolio — Header behavior (vanilla JS).
 * Replaces v0.dev React/Framer Motion: mobile menu, scroll spy, progress bar, smooth scroll, logo animation.
 */

(function () {
  'use strict';

  const SCROLL_THRESHOLD = 20;
  const HEADER_OFFSET = 100;
  const SMOOTH_SCROLL_OFFSET = 80;

  let mobileOpen = false;
  let ticking = false;
  let lastScrollY = window.scrollY ?? 0;

  // ─── DOM refs (lazy once DOM ready) ─────────────────────────────────────
  const getHeader = () => document.querySelector('[data-header]');
  const getHeaderInner = () => document.querySelector('[data-header-inner]');
  const getHeaderRow = () => document.querySelector('[data-header-row]');
  const getLogoWordmark = () => document.querySelector('[data-logo-wordmark]');
  const getProgressBar = () => document.querySelector('[data-scroll-progress]');
  const getMobileMenu = () => document.querySelector('[data-mobile-menu]');
  const getMobileBackdrop = () => document.querySelector('[data-mobile-backdrop]');
  const getMobilePanel = () => document.querySelector('[data-mobile-panel]');
  const getMobileToggle = () => document.querySelector('[data-mobile-toggle]');
  const getMobileNavLinks = () => document.querySelectorAll('[data-mobile-nav-links] a[data-section]');
  const getDesktopNavLinks = () => document.querySelectorAll('.header-nav a[data-section]');

  /**
   * Toggle mobile menu open/close and body scroll lock.
   */
  function setMobileOpen(open) {
    mobileOpen = open;
    const menu = getMobileMenu();
    const panel = getMobilePanel();
    const toggle = getMobileToggle();

    if (!menu || !panel || !toggle) return;

    if (open) {
      menu.classList.remove('hidden');
      menu.setAttribute('aria-hidden', 'false');
      panel.classList.remove('translate-x-full');
      toggle.setAttribute('aria-label', document.body.getAttribute('data-aria-close') || 'Close navigation menu');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      // Trigger reflow so panel slide transition runs
      requestAnimationFrame(() => requestAnimationFrame(() => {}));
      // Animate in mobile nav items (opacity + line)
      requestAnimationFrame(() => {
        menu.querySelectorAll('.mobile-nav-link').forEach((el) => el.classList.add('opacity-100'));
        menu.querySelectorAll('[data-mobile-nav-line]').forEach((el) => el.classList.add('scale-x-100'));
        const cta = menu.querySelector('[data-mobile-cta]');
        const footer = menu.querySelector('[data-mobile-footer]');
        if (cta) cta.classList.add('opacity-100');
        if (footer) footer.classList.add('opacity-100');
      });
    } else {
      panel.classList.add('translate-x-full');
      menu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-label', document.body.getAttribute('data-aria-open') || 'Open navigation menu');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      menu.querySelectorAll('.mobile-nav-link').forEach((el) => el.classList.remove('opacity-100'));
      menu.querySelectorAll('[data-mobile-nav-line]').forEach((el) => el.classList.remove('scale-x-100'));
      const cta = menu.querySelector('[data-mobile-cta]');
      const footer = menu.querySelector('[data-mobile-footer]');
      if (cta) cta.classList.remove('opacity-100');
      if (footer) footer.classList.remove('opacity-100');
      // Hide menu after panel transition
      const duration = 500;
      setTimeout(() => {
        if (!mobileOpen) menu.classList.add('hidden');
      }, duration);
    }

    // Hamburger → X animation (CSS classes; we toggle a state class on the button)
    toggle.classList.toggle('is-open', open);
  }

  /**
   * Hamburger visual state: add/remove .is-open on button so CSS can transform lines to X.
   */
  function updateHamburgerStyles() {
    const toggle = getMobileToggle();
    if (!toggle) return;
    const isOpen = toggle.classList.contains('is-open');
    const lines = toggle.querySelectorAll('.hamburger-line');
    if (lines.length < 3) return;
    // Top: rotate 45deg, translateY(3px)
    lines[0].style.transform = isOpen ? 'rotate(45deg) translateY(3px)' : 'rotate(0deg) translateY(0)';
    // Middle: hide
    lines[1].style.opacity = isOpen ? '0' : '1';
    lines[1].style.transform = isOpen ? 'scaleX(0)' : 'scaleX(1)';
    // Bottom: rotate -45deg, translateY(-3px)
    lines[2].style.transform = isOpen ? 'rotate(-45deg) translateY(-3px)' : 'rotate(0deg) translateY(0)';
  }

  /**
   * Scroll detection: update header “scrolled” state and active section.
   */
  function onScroll() {
    const y = window.scrollY ?? window.pageYOffset;
    const scrolled = y > SCROLL_THRESHOLD;

    const inner = getHeaderInner();
    const row = getHeaderRow();
    const wordmark = getLogoWordmark();

    if (inner) {
      inner.classList.toggle('border-b', scrolled);
      inner.classList.toggle('border-white/[0.06]', scrolled);
      inner.classList.toggle('bg-black/90', scrolled);
      inner.classList.toggle('shadow-[0_1px_40px_-12px_rgba(217,70,239,0.08)]', scrolled);
      inner.classList.toggle('backdrop-blur-xl', scrolled);
      inner.classList.toggle('backdrop-blur-none', !scrolled);
    }

    if (row) {
      row.classList.toggle('py-3', scrolled);
      row.classList.toggle('py-5', !scrolled);
      row.classList.toggle('lg:py-6', !scrolled);
    }

    // Logo wordmark letter-spacing: scrolled → 0.15em, else 0.2em
    if (wordmark) {
      wordmark.style.letterSpacing = scrolled ? '0.15em' : '0.2em';
    }

    // Scroll spy: which section is in view (only sections linked from nav)
    const scrollPos = y + HEADER_OFFSET;
    const navLinks = getDesktopNavLinks();
    const mobileLinks = getMobileNavLinks();
    let sectionIds = [...navLinks].map((a) => (a.getAttribute('data-section') || '').toLowerCase()).filter(Boolean);
    if (sectionIds.length === 0 && mobileLinks.length > 0) {
      sectionIds = [...mobileLinks].map((a) => (a.getAttribute('data-section') || '').toLowerCase()).filter(Boolean);
    }
    if (sectionIds.length === 0) {
      sectionIds = ['home', 'work', 'about', 'services', 'contact'];
    }
    const sections = sectionIds
      .map((id) => {
        const el = document.getElementById(id);
        return el ? { id, top: el.getBoundingClientRect().top + y } : null;
      })
      .filter(Boolean)
      .filter((s) => s.top <= scrollPos)
      .sort((a, b) => b.top - a.top);
    const activeId = sections[0] ? sections[0].id : '';

    getDesktopNavLinks().forEach((a) => {
      const section = (a.getAttribute('data-section') || '').toLowerCase();
      const active = (activeId || '').toLowerCase() === section;
      a.classList.toggle('nav-link-active', active);
      const underline = a.querySelector('[data-active-underline]');
      if (underline) underline.style.transform = active ? 'scaleX(1)' : 'scaleX(0)';
    });

    getMobileNavLinks().forEach((a) => {
      const section = (a.getAttribute('data-section') || '').toLowerCase();
      const active = (activeId || '').toLowerCase() === section;
      a.classList.toggle('nav-link-active', active);
      const num = a.querySelector('[data-mobile-nav-num]');
      const label = a.querySelector('[data-mobile-nav-label]');
      if (num) num.classList.toggle('text-fuchsia-400', active);
      if (num) num.classList.toggle('text-neutral-600', !active);
      if (label) label.classList.toggle('bg-gradient-to-r', active);
      if (label) label.classList.toggle('from-fuchsia-400', active);
      if (label) label.classList.toggle('to-pink-400', active);
      if (label) label.classList.toggle('bg-clip-text', active);
      if (label) label.classList.toggle('text-transparent', active);
      if (label) label.classList.toggle('text-white', !active);
    });

    // Progress bar: scaleX from 0 to 1 based on scroll progress
    const progressEl = getProgressBar();
    if (progressEl) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(y / docHeight, 1) : 0;
      progressEl.style.transform = `scaleX(${progress})`;
    }

    lastScrollY = y;
    ticking = false;
  }

  function requestScrollUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  }

  /**
   * Smooth scroll to anchor; close mobile menu and scroll with offset.
   */
  function smoothScroll(e, href) {
    const anchor = typeof href === 'string' ? href : (e && e.currentTarget && e.currentTarget.getAttribute('href'));
    if (!anchor || !anchor.startsWith('#')) return;
    e.preventDefault();
    setMobileOpen(false);
    const id = anchor.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + (window.scrollY ?? window.pageYOffset) - SMOOTH_SCROLL_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  /**
   * Bind events: scroll, resize, mobile toggle, backdrop click, smooth-scroll links.
   */
  function bind() {
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', requestScrollUpdate);

    const toggle = getMobileToggle();
    if (toggle) {
      toggle.addEventListener('click', () => setMobileOpen(!mobileOpen));
    }

    const backdrop = getMobileBackdrop();
    if (backdrop) {
      backdrop.addEventListener('click', () => setMobileOpen(false));
    }

    document.querySelectorAll('[data-smooth-scroll]').forEach((el) => {
      el.addEventListener('click', (e) => smoothScroll(e, el.getAttribute('href')));
    });

    // Observe hamburger for class changes so we can apply transform
    const observer = new MutationObserver(() => updateHamburgerStyles());
    if (toggle) observer.observe(toggle, { attributes: true, attributeFilter: ['class'] });
  }

  /**
   * Init: run first scroll update, then bind.
   */
  function init() {
    onScroll();
    updateHamburgerStyles();
    bind();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
