/**
 * Creative Portfolio — Contact form: validation, AJAX submit, loading state, status messages, entrance animations.
 *
 * Requires global creativePortfolio (ajaxUrl) from wp_localize_script.
 */

(function () {
  'use strict';

  if (typeof window.creativePortfolio === 'undefined' || !window.creativePortfolio.ajaxUrl) {
    return;
  }

  const SELECTORS = {
    form: '#contact-form',
    status: '#contact-status',
    statusIcon: '#contact-status .contact-status-icon',
    statusMessage: '#contact-status .contact-status-message',
    submitBtn: '[data-contact-submit]',
    submitText: '.contact-submit-text',
    submitIcon: '.contact-submit-icon',
    submitLoading: '.contact-submit-loading',
    animate: '[data-contact-animate]',
    stagger: '[data-contact-stagger]',
  };

  const SUCCESS_CLASSES = 'border-green-500/20 bg-green-500/10 text-green-400';
  const ERROR_CLASSES = 'border-red-500/20 bg-red-500/10 text-red-400';
  const STAGGER_DELAY_MS = 100;
  const SUCCESS_AUTOHIDE_MS = 5000;

  /** @type {HTMLFormElement | null} */
  let formEl = null;
  /** @type {HTMLElement | null} */
  let statusEl = null;
  /** @type {HTMLElement | null} */
  let submitBtnEl = null;

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  /**
   * Validates email format.
   * @param {string} email - Email string.
   * @returns {boolean}
   */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  }

  /**
   * Checks value is non-empty after trim.
   * @param {string} value - Field value.
   * @returns {boolean}
   */
  function validateRequired(value) {
    return String(value).trim().length > 0;
  }

  /**
   * Runs client-side validation and returns first error message or null.
   * @param {{ name: string, email: string, subject: string, message: string }} data - Form data.
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
  // Status messages
  // ---------------------------------------------------------------------------

  /**
   * Clears and hides the status block.
   */
  function clearStatus() {
    if (!statusEl) return;
    statusEl.className = 'mb-6 flex items-center gap-3 rounded-lg border p-4 hidden';
    const icon = statusEl.querySelector('.contact-status-icon');
    const msg = statusEl.querySelector('.contact-status-message');
    if (icon) icon.innerHTML = '';
    if (msg) msg.textContent = '';
  }

  /**
   * Shows error message in #contact-status with error styling.
   * @param {string} message - Error message.
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

  /**
   * Shows success message in #contact-status with success styling; optional auto-hide.
   * @param {string} message - Success message.
   * @param {number} [autoHideMs] - Auto-hide after ms (0 = no auto-hide).
   */
  function showSuccess(message, autoHideMs = SUCCESS_AUTOHIDE_MS) {
    if (!statusEl) return;
    statusEl.className = 'mb-6 flex items-center gap-3 rounded-lg border p-4 ' + SUCCESS_CLASSES;
    statusEl.classList.remove('hidden');
    statusEl.setAttribute('role', 'alert');
    statusEl.setAttribute('aria-live', 'polite');

    const iconEl = statusEl.querySelector('.contact-status-icon');
    const msgEl = statusEl.querySelector('.contact-status-message');
    if (iconEl) {
      iconEl.innerHTML = '<svg class="h-5 w-5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>';
    }
    if (msgEl) msgEl.textContent = message;

    if (autoHideMs > 0) {
      setTimeout(clearStatus, autoHideMs);
    }
  }

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  /**
   * Toggles submit button loading state (spinner, disabled, text).
   * @param {boolean} loading - True to show loading.
   */
  function setLoading(loading) {
    if (!submitBtnEl) return;
    const textEl = submitBtnEl.querySelector(SELECTORS.submitText);
    const iconEl = submitBtnEl.querySelector(SELECTORS.submitIcon);
    const loadingEl = submitBtnEl.querySelector(SELECTORS.submitLoading);

    submitBtnEl.disabled = loading;
    submitBtnEl.setAttribute('aria-busy', loading ? 'true' : 'false');

    if (textEl) textEl.classList.toggle('hidden', loading);
    if (iconEl) iconEl.classList.toggle('hidden', loading);
    if (loadingEl) {
      loadingEl.classList.toggle('hidden', !loading);
      loadingEl.classList.toggle('flex', loading);
    }
  }

  // ---------------------------------------------------------------------------
  // Form submit (AJAX)
  // ---------------------------------------------------------------------------

  /**
   * Resets form fields and clears any inline error styling.
   */
  function resetForm() {
    if (!formEl) return;
    formEl.reset();
    formEl.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.removeAttribute('aria-invalid'));
  }

  /**
   * Handles form submit: validate, AJAX POST, then success/error + loading.
   * @param {Event} e - Submit event.
   */
  function handleSubmit(e) {
    e.preventDefault();
    if (!formEl || !statusEl) return;

    clearStatus();

    const name = (formEl.querySelector('[name="name"]') && formEl.querySelector('[name="name"]').value) || '';
    const email = (formEl.querySelector('[name="email"]') && formEl.querySelector('[name="email"]').value) || '';
    const subject = (formEl.querySelector('[name="subject"]') && formEl.querySelector('[name="subject"]').value) || '';
    const message = (formEl.querySelector('[name="message"]') && formEl.querySelector('[name="message"]').value) || '';
    const nonceEl = formEl.querySelector('[name="nonce"]');
    const nonce = nonceEl ? nonceEl.value : '';

    const validationError = validateForm({ name, email, subject, message });
    if (validationError) {
      showError(validationError);
      return;
    }

    setLoading(true);

    const body = new FormData();
    body.append('action', 'contact_form_submit');
    body.append('nonce', nonce);
    body.append('name', name.trim());
    body.append('email', email.trim());
    body.append('subject', subject.trim());
    body.append('message', message.trim());

    fetch(window.creativePortfolio.ajaxUrl, {
      method: 'POST',
      body,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (data && data.success) {
          showSuccess(data.data && data.data.message ? data.data.message : "Message sent successfully! We'll get back to you within 24 hours.", SUCCESS_AUTOHIDE_MS);
          resetForm();
        } else {
          const errMsg = (data && data.data && data.data.message) ? data.data.message : 'Something went wrong. Please try again.';
          showError(errMsg);
        }
      })
      .catch(() => {
        showError('Network error. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // ---------------------------------------------------------------------------
  // Entrance animations (IntersectionObserver)
  // ---------------------------------------------------------------------------

  /**
   * Injects CSS for contact section entrance (fade-left / fade-right, stagger).
   */
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

  /**
   * Runs entrance animations when #contact enters viewport; stagger for [data-contact-stagger] children.
   */
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
    submitBtnEl = document.querySelector(SELECTORS.submitBtn);

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
