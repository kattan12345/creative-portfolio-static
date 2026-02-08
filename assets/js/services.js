/**
 * Creative Portfolio — Services section animations.
 *
 * - Scroll-triggered entrance: section header + cards with stagger (data-delay)
 * - Icon rotation on card hover (service-icon-rotate)
 * - Uses IntersectionObserver and CSS transitions
 */

(function () {
  'use strict';

  const STAGGER_BASE_MS = 100;

  /** @type {HTMLElement | null} */
  let sectionEl = null;

  /**
   * Inject CSS for services entrance and icon hover.
   */
  function injectStyles() {
    const id = 'services-animation-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      [data-services-animate="section-header"] {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
      }
      [data-services-animate="section-header"].services-fade-up {
        opacity: 1;
        transform: translateY(0);
      }
      [data-services-animate="card"] {
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
      }
      [data-services-animate="card"].services-fade-up {
        opacity: 1;
        transform: translateY(0);
      }
      [data-service-icon] {
        transition: transform 0.3s ease;
      }
      [data-service-icon].service-icon-rotate {
        transform: rotate(6deg);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Apply entrance classes: header + cards with staggered delay from data-delay.
   */
  function runEntranceAnimations() {
    if (!sectionEl) return;

    const header = sectionEl.querySelector('[data-services-animate="section-header"]');
    const cards = sectionEl.querySelectorAll('[data-services-animate="card"]');

    if (header) header.classList.add('services-fade-up');

    cards.forEach((card) => {
      const delayMs = parseInt(card.getAttribute('data-delay'), 10) || 0;
      card.style.transitionDelay = `${delayMs}ms`;
      card.classList.add('services-fade-up');
    });
  }

  /**
   * IntersectionObserver: when services section enters viewport, run entrance.
   */
  function observeSection() {
    sectionEl = document.getElementById('services');
    if (!sectionEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runEntranceAnimations();
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px' }
    );
    observer.observe(sectionEl);
  }

  /**
   * Bind icon rotation on card hover: add/remove service-icon-rotate on [data-service-icon].
   */
  function bindIconHover() {
    if (!sectionEl) return;

    const cards = sectionEl.querySelectorAll('[data-services-animate="card"]');
    cards.forEach((card) => {
      const icon = card.querySelector('[data-service-icon]');
      if (!icon) return;

      card.addEventListener('mouseenter', () => icon.classList.add('service-icon-rotate'));
      card.addEventListener('mouseleave', () => icon.classList.remove('service-icon-rotate'));
    });
  }

  /**
   * Initialize: inject styles, observe section, bind icon hover.
   */
  function init() {
    injectStyles();
    observeSection();
    bindIconHover();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
