/**
 * Creative Portfolio — Hero section animations.
 *
 * - Entrance: IntersectionObserver + staggered fade-up (data-hero-animate, data-delay)
 * - Floating orbs: CSS keyframes (data-hero-orb)
 * - Scroll indicator: opacity pulse + dot bounce (data-scroll-indicator)
 * - Hero CTA links: smooth scroll to target section
 */

(function () {
  'use strict';

  const HERO_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const FADE_UP_DURATION = 0.8;
  const ORB_DURATIONS = { 1: 22, 2: 28, 3: 35 };

  /** @type {HTMLElement | null} */
  let heroSection = null;
  let styleEl = null;

  /**
   * Injects CSS keyframes and utility classes for hero animations.
   */
  function injectKeyframes() {
    if (styleEl) return;
    styleEl = document.createElement('style');
    styleEl.setAttribute('data-hero-animations', '');
    styleEl.textContent = `
      @keyframes hero-fade-up {
        0% { opacity: 0; transform: translateY(30px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes hero-orb-float {
        0% { transform: translate(0, 0) scale(1); }
        25% { transform: translate(30px, -40px) scale(1.05); }
        50% { transform: translate(-20px, 20px) scale(0.95); }
        75% { transform: translate(10px, -20px) scale(1.02); }
        100% { transform: translate(0, 0) scale(1); }
      }
      @keyframes hero-scroll-pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
      @keyframes hero-scroll-dot-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(8px); }
      }
      .hero-animate-fade-up {
        animation-name: hero-fade-up;
        animation-duration: ${FADE_UP_DURATION}s;
        animation-timing-function: ${HERO_EASING};
        animation-fill-mode: both;
      }
      .hero-orb-float {
        animation-name: hero-orb-float;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }
      .hero-scroll-pulse {
        animation: hero-scroll-pulse 2s ease-in-out infinite;
      }
      .hero-scroll-dot-bounce {
        animation: hero-scroll-dot-bounce 1.5s ease-in-out infinite;
      }
    `;
    document.head.appendChild(styleEl);
  }

  /**
   * Applies staggered fade-up to elements with [data-hero-animate="fade-up"].
   * Delay is read from data-delay (milliseconds) and applied as animation-delay.
   */
  function runEntranceAnimations() {
    if (!heroSection) return;
    const targets = heroSection.querySelectorAll('[data-hero-animate="fade-up"]');
    targets.forEach((el) => {
      const delayMs = parseInt(el.getAttribute('data-delay'), 10) || 0;
      el.style.animationDelay = `${delayMs / 1000}s`;
      el.classList.add('hero-animate-fade-up');
    });
  }

  /**
   * Applies floating animation to [data-hero-orb] elements.
   * Duration from ORB_DURATIONS (orb "1" -> 22s, "2" -> 28s, "3" -> 35s).
   */
  function runOrbAnimations() {
    if (!heroSection) return;
    const orbs = heroSection.querySelectorAll('[data-hero-orb]');
    orbs.forEach((orb) => {
      const id = orb.getAttribute('data-hero-orb');
      const duration = ORB_DURATIONS[id] || 22;
      orb.style.animationDuration = `${duration}s`;
      orb.classList.add('hero-orb-float');
    });
  }

  /**
   * Applies pulse to scroll-indicator pill and bounce to inner dot.
   */
  function runScrollIndicatorAnimations() {
    const container = document.querySelector('[data-scroll-indicator]');
    if (!container) return;
    const pill = container.firstElementChild;
    const dot = container.querySelector('.hero-scroll-dot');
    if (pill) pill.classList.add('hero-scroll-pulse');
    if (dot) dot.classList.add('hero-scroll-dot-bounce');
  }

  /**
   * Smooth scroll for hero CTA links (href starting with #).
   */
  function smoothScrollToTarget(e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
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
   * IntersectionObserver: when hero enters viewport, run entrance + orbs + scroll indicator.
   */
  function observeHero() {
    heroSection = document.getElementById('home');
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runEntranceAnimations();
          runOrbAnimations();
          runScrollIndicatorAnimations();
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px' }
    );

    observer.observe(heroSection);
  }

  /**
   * Bind hero CTA clicks (delegate from hero section).
   */
  function bindCtaSmoothScroll() {
    heroSection = document.getElementById('home');
    if (!heroSection) return;
    heroSection.addEventListener('click', smoothScrollToTarget);
  }

  /**
   * Initialize: inject keyframes, observe hero, bind CTA smooth scroll.
   */
  function init() {
    injectKeyframes();
    observeHero();
    bindCtaSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
