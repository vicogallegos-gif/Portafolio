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
  const label = folder.querySelector('[data-folder-label]');

  if (!trigger || !pages || !label) return;

  trigger.addEventListener('click', () => {
    const isOpen = folder.classList.toggle('is-open');

    trigger.setAttribute('aria-expanded', String(isOpen));
    trigger.setAttribute('aria-label', `${isOpen ? 'Cerrar' : 'Abrir'} carpeta MOGI`);
    pages.setAttribute('aria-hidden', String(!isOpen));
    label.textContent = isOpen ? 'Cerrar carpeta' : 'Abrir carpeta';
  });
});
