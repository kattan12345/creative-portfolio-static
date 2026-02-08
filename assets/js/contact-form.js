/**
 * Creative Portfolio — Contact form (static / Netlify).
 * Client-side validation only. Form submission uses browser default (Netlify Forms).
 * Entrance animations (fade-left, fade-right) via IntersectionObserver are preserved.
 */

(function () {
  'use strict';

  const SELECTORS = {
    form: 'form[name="contact"]',
    status: '#contact-status',
    animate: '[data-contact-animate]',
    stagger: '[data-contact-stagger]',
  };

  const ERROR_CLASSES = 'border-red-500/20 bg-red-500/10 text-red-400';
  const STAGGER_DELAY_MS = 100;

  /** @type {HTMLFormElement | null} */
  let formEl = null;
  /** @type {HTMLElement | null} */
  let statusEl = null;

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  }

  function validateRequired(value) {
    return String(value).trim().length > 0;
  }

  /**
   * Runs client-side validation. Returns first error message or null.
   * @param {{ name: string, email: string, subject: string, message: string }} data
   * @returns {string | null}
   */
  function validateForm(data) {
    if (!validateRequired(data.name)) {
      return 'Please enter your name.';
    }
    if (!validateRequired(data.email)) {
      return 'Please enter your email address.';
    }
    if (!validateEmail(data.email)) {
      return 'Please enter a valid email address.';
    }
    if (!validateRequired(data.subject)) {
      return 'Please enter a subject.';
    }
    if (!validateRequired(data.message)) {
      return 'Please enter a message.';
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Error message (status block)
  // ---------------------------------------------------------------------------

  function clearStatus() {
    if (!statusEl) return;
    statusEl.className = 'mb-6 flex items-center gap-3 rounded-lg border p-4 hidden';
    const icon = statusEl.querySelector('.contact-status-icon');
    const msg = statusEl.querySelector('.contact-status-message');
    if (icon) icon.innerHTML = '';
    if (msg) msg.textContent = '';
  }

  /**
   * Shows error in #contact-status.
   * @param {string} message
   */
  function showError(message) {
    if (!statusEl) return;
    statusEl.className = 'mb-6 flex items-center gap-3 rounded-lg border p-4 ' + ERROR_CLASSES;
    statusEl.classList.remove('hidden');
    statusEl.setAttribute('role', 'alert');
    statusEl.setAttribute('aria-live', 'polite');

    const iconEl = statusEl.querySelector('.contact-status-icon');
    const msgEl = statusEl.querySelector('.contact-status-message');
    if (iconEl) {
      iconEl.innerHTML = '<svg class="h-5 w-5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>';
    }
    if (msgEl) msgEl.textContent = message;
  }

  // ---------------------------------------------------------------------------
  // Form submit (validation only; default submit for Netlify)
  // ---------------------------------------------------------------------------

  function handleSubmit(e) {
    if (!formEl || !statusEl) return;

    clearStatus();

    const name = (formEl.querySelector('[name="name"]') && formEl.querySelector('[name="name"]').value) || '';
    const email = (formEl.querySelector('[name="email"]') && formEl.querySelector('[name="email"]').value) || '';
    const subject = (formEl.querySelector('[name="subject"]') && formEl.querySelector('[name="subject"]').value) || '';
    const message = (formEl.querySelector('[name="message"]') && formEl.querySelector('[name="message"]').value) || '';

    const validationError = validateForm({ name, email, subject, message });
    if (validationError) {
      e.preventDefault();
      showError(validationError);
      return false;
    }

    // Validation passed → allow browser default submit (Netlify Forms handles it).
    // Redirect to thank-you.html is configured in Netlify form settings.
  }

  // ---------------------------------------------------------------------------
  // Entrance animations (IntersectionObserver)
  // ---------------------------------------------------------------------------

  function injectContactStyles() {
    const id = 'contact-animation-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      [data-contact-animate] {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
      }
      [data-contact-animate="fade-left"] { transform: translate(-24px, 24px); }
      [data-contact-animate="fade-left"].contact-visible { transform: translate(0, 0); opacity: 1; }
      [data-contact-animate="fade-right"] { transform: translate(24px, 24px); }
      [data-contact-animate="fade-right"].contact-visible { transform: translate(0, 0); opacity: 1; }
      #contact-status:not(.hidden) {
        animation: contactStatusIn 0.3s ease-out forwards;
      }
      @keyframes contactStatusIn {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  function observeContactSection() {
    const section = document.getElementById('contact');
    if (!section) return;

    injectContactStyles();

    const animated = section.querySelectorAll(SELECTORS.animate);
    const staggerParent = section.querySelector(SELECTORS.stagger);
    const staggerChildren = staggerParent ? staggerParent.querySelectorAll(SELECTORS.animate) : [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animated.forEach((el) => el.classList.add('contact-visible'));
          staggerChildren.forEach((el, i) => {
            el.style.transitionDelay = `${i * STAGGER_DELAY_MS}ms`;
          });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px' }
    );
    observer.observe(section);
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------

  function init() {
    formEl = document.querySelector(SELECTORS.form);
    statusEl = document.querySelector(SELECTORS.status);

    if (formEl) {
      formEl.addEventListener('submit', handleSubmit);
    }
    observeContactSection();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
