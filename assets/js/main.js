/**
 * Creative Portfolio — Main JavaScript.
 *
 * Handles: back-to-top visibility, smooth scroll for anchor links, init message.
 * Global: creativePortfolio (ajaxUrl, nonce, homeUrl) — from wp_localize_script in functions.php.
 */

(function () {
  'use strict';

  const VERSION = '1.0.0';
  const BACK_TO_TOP_THRESHOLD = 300;

  /** @type {HTMLElement | null} */
  let backToTopEl = null;
  let scrollTicking = false;

  /**
   * Log init message and version.
   */
  function logInit() {
    console.log(`Creative Portfolio Theme v${VERSION}`);
  }

  /**
   * Show or hide back-to-top button based on scroll position.
   */
  function updateBackToTopVisibility() {
    if (!backToTopEl) return;
    const show = window.scrollY > BACK_TO_TOP_THRESHOLD;
    backToTopEl.classList.toggle('hidden', !show);
    scrollTicking = false;
  }

  /**
   * Request a scroll-driven update (throttled via requestAnimationFrame).
   */
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(updateBackToTopVisibility);
  }

  /**
   * Scroll to top smoothly (used by back-to-top button).
   */
  function scrollToTop(e) {
    if (e && e.preventDefault) e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Smooth scroll for anchor links: intercept click and scroll to target.
   * Skips back-to-top link (handled by its own listener).
   */
  function handleAnchorClick(e) {
    const link = /** @type {HTMLAnchorElement} */ (e.target.closest('a[href^="#"]'));
    if (!link || link.hasAttribute('data-back-to-top')) return;
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    const id = hash.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Bind back-to-top and anchor link listeners.
   */
  function bind() {
    backToTopEl = document.querySelector('[data-back-to-top]');
    if (backToTopEl) {
      backToTopEl.addEventListener('click', scrollToTop);
      window.addEventListener('scroll', onScroll, { passive: true });
      updateBackToTopVisibility();
    }

    document.addEventListener('click', handleAnchorClick);
  }

  /**
   * Initialize: log, then bind.
   */
  function init() {
    logInit();
    bind();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
