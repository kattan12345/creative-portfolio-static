/**
 * Creative Portfolio — Portfolio grid filtering and animations.
 *
 * - Filter by category (data-filter), show/hide items by data-categories
 * - Entrance animations via IntersectionObserver + staggered cards
 * - Filter transition: fade/scale out then in
 * - Active state on buttons, empty state, ARIA and keyboard support
 */

(function () {
  'use strict';

  const STAGGER_DELAY_MS = 100;
  const TRANSITION_DURATION_MS = 300;
  const ACTIVE_CLASS = 'portfolio-filter-active';

  /** @type {HTMLElement | null} */
  let gridEl = null;
  /** @type {NodeListOf<HTMLElement>} */
  let filterButtons = [];
  /** @type {NodeListOf<HTMLElement>} */
  let items = [];
  /** @type {HTMLElement | null} */
  let emptyEl = null;
  /** @type {HTMLElement | null} */
  let liveRegion = null;
  /** @type {string} */
  let currentFilter = 'all';

  /**
   * Inject CSS for filter transitions and entrance animations.
   */
  function injectStyles() {
    const id = 'portfolio-filter-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      [data-portfolio-item] {
        transition: opacity ${TRANSITION_DURATION_MS}ms ease-out, transform ${TRANSITION_DURATION_MS}ms ease-out;
      }
      [data-portfolio-item].portfolio-item-hidden {
        display: none !important;
      }
      [data-portfolio-animate="section-header"],
      [data-portfolio-animate="filter-tabs"] {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
      }
      [data-portfolio-animate="section-header"].portfolio-visible,
      [data-portfolio-animate="filter-tabs"].portfolio-visible {
        opacity: 1;
        transform: translateY(0);
      }
      [data-portfolio-item][data-portfolio-animate="card"] {
        opacity: 0;
        transform: translateY(40px) scale(0.95);
        transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
      }
      [data-portfolio-item][data-portfolio-animate="card"].portfolio-card-visible {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      .portfolio-filter.${ACTIVE_CLASS} {
        background: linear-gradient(135deg, rgb(192, 38, 211), rgb(219, 39, 119)) !important;
        color: rgb(255, 255, 255) !important;
        border-color: transparent !important;
        box-shadow: 0 4px 20px -2px rgba(217, 70, 239, 0.35);
      }
      .portfolio-grid[data-visible-count="1"] {
        grid-template-columns: 1fr;
        max-width: 480px;
        margin-left: auto;
        margin-right: auto;
      }
      .portfolio-grid[data-visible-count="2"] {
        grid-template-columns: repeat(2, 1fr);
        max-width: 880px;
        margin-left: auto;
        margin-right: auto;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Cache DOM references and ensure live region exists for announcements.
   */
  function cacheElements() {
    const section = document.querySelector('#work, [data-portfolio-grid]')?.closest('section');
    if (!section) return false;
    gridEl = section.querySelector('[data-portfolio-grid]');
    if (!gridEl) return false;
    filterButtons = section.querySelectorAll('[data-filter]');
    items = gridEl.querySelectorAll('[data-portfolio-item]');
    emptyEl = section.querySelector('[data-portfolio-empty]');

    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'screen-reader-text';
      liveRegion.setAttribute('role', 'status');
      if (gridEl.parentNode) gridEl.parentNode.insertBefore(liveRegion, gridEl.nextSibling);
    }
    return true;
  }

  /**
   * Announce to screen readers.
   * @param {string} message
   */
  function announce(message) {
    if (!liveRegion) return;
    liveRegion.textContent = '';
    requestAnimationFrame(() => {
      liveRegion.textContent = message;
    });
  }

  /**
   * Set active state on filter buttons and update ARIA.
   * @param {string} filterValue - 'all' or category slug
   */
  function setActiveButton(filterValue) {
    filterButtons.forEach((btn) => {
      const value = btn.getAttribute('data-filter') || '';
      const isActive = value === filterValue;
      btn.classList.toggle(ACTIVE_CLASS, isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  /**
   * Return whether an item matches the current filter.
   * @param {HTMLElement} item
   * @param {string} filterValue
   * @returns {boolean}
   */
  function itemMatchesFilter(item, filterValue) {
    if (filterValue === 'all') return true;
    const cats = (item.getAttribute('data-categories') || '').split(',').map((s) => s.trim());
    return cats.includes(filterValue);
  }

  /**
   * Apply filter: show/hide items with transition and update empty state.
   * @param {string} filterValue
   */
  function applyFilter(filterValue) {
    currentFilter = filterValue;
    let visibleCount = 0;

    items.forEach((item) => {
      const match = itemMatchesFilter(item, filterValue);
      item.classList.toggle('portfolio-item-hidden', !match);
      if (match) visibleCount++;
    });

    if (gridEl) {
      gridEl.setAttribute('data-visible-count', String(visibleCount));
    }

    if (emptyEl) {
      emptyEl.classList.toggle('hidden', visibleCount > 0);
      emptyEl.style.display = visibleCount === 0 ? 'flex' : 'none';
      emptyEl.setAttribute('aria-hidden', visibleCount > 0 ? 'true' : 'false');
    }

    const label = filterValue === 'all'
      ? 'All projects'
      : `${filterValue.replace(/-/g, ' ')} projects`;
    announce(`${visibleCount} ${visibleCount === 1 ? 'project' : 'projects'} in ${label}.`);
  }

  /**
   * Run entrance animations when section enters viewport.
   */
  function runEntranceAnimations() {
    const section = gridEl?.closest('section');
    if (!section) return;

    const header = section.querySelector('[data-portfolio-animate="section-header"]');
    const tabs = section.querySelector('[data-portfolio-animate="filter-tabs"]');
    const cards = section.querySelectorAll('[data-portfolio-item][data-portfolio-animate="card"]');

    if (header) header.classList.add('portfolio-visible');
    if (tabs) tabs.classList.add('portfolio-visible');

    cards.forEach((card, i) => {
      card.style.transitionDelay = `${i * STAGGER_DELAY_MS}ms`;
      card.classList.add('portfolio-card-visible');
    });
  }

  /**
   * IntersectionObserver: trigger entrance when portfolio section is in view.
   */
  function observeSection() {
    const section = document.getElementById('work');
    if (!section) return;

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
    observer.observe(section);
  }

  /**
   * Handle filter button click.
   * @param {string} filterValue
   */
  function onFilterClick(filterValue) {
    setActiveButton(filterValue);
    applyFilter(filterValue);
  }

  /**
   * Keyboard: arrow keys and Enter/Space on filter buttons.
   * @param {KeyboardEvent} e
   */
  function onFilterKeydown(e) {
    const list = Array.from(filterButtons);
    const current = document.activeElement;
    const idx = list.indexOf(current);
    if (idx === -1) return;

    let nextIdx = idx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIdx = (idx + 1) % list.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIdx = (idx - 1 + list.length) % list.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIdx = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIdx = list.length - 1;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const value = current.getAttribute('data-filter') || 'all';
      onFilterClick(value);
      return;
    } else {
      return;
    }

    list[nextIdx].focus();
  }

  /**
   * Bind filter button clicks and keyboard.
   */
  function bindFilters() {
    const section = gridEl?.closest('section');
    if (!section) return;

    section.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = btn.getAttribute('data-filter') || 'all';
        onFilterClick(value);
      });
    });

    const tablist = section.querySelector('[role="tablist"]');
    if (tablist) tablist.addEventListener('keydown', onFilterKeydown);
  }

  /**
   * Initialize: inject styles, cache elements, set initial state, observe, bind.
   */
  function init() {
    injectStyles();
    if (!cacheElements()) return;

    setActiveButton('all');
    applyFilter('all');
    observeSection();
    bindFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
