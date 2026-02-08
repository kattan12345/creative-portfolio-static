/**
 * Creative Portfolio — Static / Netlify contact form.
 * Client-side validation, loading state, native submit for Netlify Forms.
 * Use this instead of contact-form.js when not using WordPress.
 */

(function () {
  'use strict';

  const formId = 'contact-form';
  const statusId = 'contact-status';
  const SUCCESS_CLASSES = 'border-green-500/20 bg-green-500/10 text-green-400';
  const ERROR_CLASSES = 'border-red-500/20 bg-red-500/10 text-red-400';

  const form = document.getElementById(formId);
  const statusEl = document.getElementById(statusId);
  const submitBtn = form && form.querySelector('[data-contact-submit]');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  }

  function validateRequired(value) {
    return String(value).trim().length > 0;
  }

  function getFormData() {
    if (!form) return {};
    return {
      name: (form.querySelector('[name="name"]') && form.querySelector('[name="name"]').value) || '',
      email: (form.querySelector('[name="email"]') && form.querySelector('[name="email"]').value) || '',
      subject: (form.querySelector('[name="subject"]') && form.querySelector('[name="subject"]').value) || '',
      message: (form.querySelector('[name="message"]') && form.querySelector('[name="message"]').value) || '',
    };
  }

  function validateForm(data) {
    if (!validateRequired(data.name)) return 'Please enter your name.';
    if (!validateRequired(data.email)) return 'Please enter your email address.';
    if (!validateEmail(data.email)) return 'Please enter a valid email address.';
    if (!validateRequired(data.subject)) return 'Please enter a subject.';
    if (!validateRequired(data.message)) return 'Please enter a message.';
    return null;
  }

  function showStatus(isError, message) {
    if (!statusEl) return;
    statusEl.className = 'mb-6 flex items-center gap-3 rounded-lg border p-4 ' + (isError ? ERROR_CLASSES : SUCCESS_CLASSES);
    statusEl.classList.remove('hidden');
    statusEl.setAttribute('role', 'alert');
    statusEl.setAttribute('aria-live', 'polite');
    const icon = statusEl.querySelector('.contact-status-icon');
    const msg = statusEl.querySelector('.contact-status-message');
    if (icon) {
      icon.innerHTML = isError
        ? '<svg class="h-5 w-5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>'
        : '<svg class="h-5 w-5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>';
    }
    if (msg) msg.textContent = message;
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.setAttribute('aria-busy', loading ? 'true' : 'false');
    const textEl = submitBtn.querySelector('.contact-submit-text');
    const iconEl = submitBtn.querySelector('.contact-submit-icon');
    const loadingEl = submitBtn.querySelector('.contact-submit-loading');
    if (textEl) textEl.classList.toggle('hidden', loading);
    if (iconEl) iconEl.classList.toggle('hidden', loading);
    if (loadingEl) {
      loadingEl.classList.toggle('hidden', !loading);
      loadingEl.classList.toggle('flex', loading);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form || !statusEl) return;

    var data = getFormData();
    var err = validateForm(data);
    if (err) {
      showStatus(true, err);
      return;
    }

    setLoading(true);
    showStatus(false, 'Sending…');
    setTimeout(function () {
      form.submit();
    }, 300);
  }

  function init() {
    if (!form) return;
    form.addEventListener('submit', handleSubmit);

    var params = new URLSearchParams(window.location.search);
    if (params.get('contact') === 'success') {
      if (statusEl) {
        showStatus(false, "Message sent successfully! We'll get back to you within 24 hours.");
        statusEl.classList.remove('hidden');
      }
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
