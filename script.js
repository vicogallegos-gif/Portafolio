const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const revealItems = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

document.querySelectorAll('[data-project-folder]').forEach((folder) => {
  const trigger = folder.querySelector('.project-folder-trigger');
  const pages = folder.querySelector('.project-folder-pages');
  const pageItems = [...folder.querySelectorAll('[data-folder-page]')];
  const pageButtons = pageItems.map((page) => page.querySelector('.project-folder-page-hit'));
  let motionTimer;

  if (!trigger || !pages) return;

  const setPageAccess = (isOpen) => {
    pageButtons.forEach((button) => {
      if (button) button.tabIndex = isOpen ? 0 : -1;
    });
  };

  const clearSelection = () => {
    folder.classList.remove('has-selection');
    pageItems.forEach((page) => {
      page.classList.remove('is-selected');
    });
    pageButtons.forEach((button) => button?.setAttribute('aria-pressed', 'false'));
  };

  const runMotionState = (state, duration) => {
    window.clearTimeout(motionTimer);
    folder.classList.remove('is-opening', 'is-closing');
    void folder.offsetWidth;
    folder.classList.add(state);
    motionTimer = window.setTimeout(() => folder.classList.remove(state), duration);
  };

  setPageAccess(false);

  trigger.addEventListener('click', () => {
    const isOpen = !folder.classList.contains('is-open');

    clearSelection();
    folder.classList.toggle('is-open', isOpen);
    runMotionState(isOpen ? 'is-opening' : 'is-closing', 820);

    trigger.setAttribute('aria-expanded', String(isOpen));
    trigger.setAttribute('aria-label', `${isOpen ? 'Cerrar' : 'Abrir'} carpeta MOGI`);
    pages.setAttribute('aria-hidden', String(!isOpen));
    setPageAccess(isOpen);
  });

  pageItems.forEach((page, index) => {
    const button = pageButtons[index];
    if (!button) return;

    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      if (!folder.classList.contains('is-open')) return;

      const willSelect = !page.classList.contains('is-selected');
      clearSelection();

      if (willSelect) {
        folder.classList.add('has-selection');
        page.classList.add('is-selected');
        button.setAttribute('aria-pressed', 'true');
      }
    });
  });
});
