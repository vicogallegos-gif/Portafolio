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

const projectCatalog = [
  {
    id: 'mogi',
    title: 'MOGI',
    description: 'Una herramienta para organizar prospección y operación comercial.',
    pages: [
      ['01 / Problema', 'Operación comercial', 'Contenido pendiente de documentar.', 'Ver el problema que aborda MOGI'],
      ['02 / Flujos', 'Proceso principal', 'Contenido pendiente de documentar.', 'Ver los flujos principales de MOGI'],
      ['03 / Decisiones', 'Criterio de producto', 'Contenido pendiente de documentar.', 'Ver las decisiones de producto de MOGI'],
      ['04 / Stack', 'Tecnologías', 'Contenido pendiente de documentar.', 'Ver las tecnologías utilizadas en MOGI'],
    ],
  },
  {
    id: 'ejercicios-visuales',
    title: 'Ejercicios visuales',
    description: 'Una herramienta gamificada para acompañar ejercicios visuales.',
    pages: [
      ['01 / Problema', 'Rutina difícil de mantener', 'Contenido pendiente de documentar.', 'Ver el problema de los ejercicios visuales'],
      ['02 / Interacción', 'Experiencia guiada', 'Contenido pendiente de documentar.', 'Ver la interacción de los ejercicios visuales'],
      ['03 / Decisiones', 'Criterio de producto', 'Contenido pendiente de documentar.', 'Ver las decisiones de los ejercicios visuales'],
      ['04 / Stack', 'Tecnologías', 'Contenido pendiente de documentar.', 'Ver las tecnologías de los ejercicios visuales'],
    ],
  },
  {
    id: 'prototipos',
    title: 'Prototipos',
    description: 'Exploraciones interactivas para aprender construyendo.',
    pages: [
      ['01 / Exploración', 'Idea en movimiento', 'Contenido pendiente de documentar.', 'Ver la exploración del prototipo'],
      ['02 / Interacción', 'Prueba de concepto', 'Contenido pendiente de documentar.', 'Ver la interacción del prototipo'],
      ['03 / Decisiones', 'Criterio de diseño', 'Contenido pendiente de documentar.', 'Ver las decisiones del prototipo'],
      ['04 / Stack', 'Tecnologías', 'Contenido pendiente de documentar.', 'Ver las tecnologías del prototipo'],
    ],
  },
];

const updateProjectFolder = (folder, project) => {
  const pages = folder.querySelector('.project-folder-pages');
  const trigger = folder.querySelector('.project-folder-trigger');
  const title = folder.querySelector('.project-folder-front h3');
  const description = folder.querySelector('.project-folder-front > p');

  folder.dataset.projectId = project.id;
  if (title) title.textContent = project.title;
  if (description) description.textContent = project.description;

  if (pages) {
    const pagesId = `${project.id}-folder-pages`;
    pages.id = pagesId;
    pages.querySelectorAll('[data-folder-page]').forEach((page, index) => {
      const content = project.pages[index];
      if (!content) return;
      const heading = page.querySelector('.project-folder-page-heading');
      const bodyTitle = page.querySelector('.project-folder-page-body h4');
      const bodyText = page.querySelector('.project-folder-page-body p');
      const pageButton = page.querySelector('.project-folder-page-hit');
      if (heading) {
        heading.children[0].textContent = content[0];
        heading.children[1].textContent = 'Placeholder';
      }
      if (bodyTitle) bodyTitle.textContent = content[1];
      if (bodyText) bodyText.textContent = content[2];
      if (pageButton) pageButton.setAttribute('aria-label', content[3]);
    });
  }

  if (trigger) {
    trigger.setAttribute('aria-controls', pages?.id || `${project.id}-folder-pages`);
    trigger.setAttribute('aria-label', `Abrir carpeta ${project.title}`);
  }
};

const initializeProjectFolder = (folder) => {
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
    folder.classList.remove('has-max-selection');
    pageItems.forEach((page) => {
      page.classList.remove('is-selected');
      page.classList.remove('is-in-front-of-selection');
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

      const wasSelected = page.classList.contains('is-selected');
      const wasMaxSelected = folder.classList.contains('has-max-selection') && wasSelected;

      if (wasSelected && !wasMaxSelected) {
        folder.classList.add('has-max-selection');
        pageItems.forEach((candidate, candidateIndex) => {
          candidate.classList.toggle('is-in-front-of-selection', candidateIndex > index);
        });
        return;
      }

      if (wasMaxSelected) {
        clearSelection();
        return;
      }

      clearSelection();

      folder.classList.add('has-selection');
      page.classList.add('is-selected');
      button.setAttribute('aria-pressed', 'true');
    });
  });
};

document.querySelectorAll('[data-project-folder]').forEach((folder) => {
  const project = projectCatalog.find((item) => item.id === folder.dataset.projectId) || projectCatalog[0];
  updateProjectFolder(folder, project);
  initializeProjectFolder(folder);
});

const projectCarousel = document.querySelector('[data-project-carousel]');
if (projectCarousel) {
  const stage = projectCarousel.querySelector('.project-folder-stage');
  const previousButton = projectCarousel.querySelector('[data-project-prev]');
  const nextButton = projectCarousel.querySelector('[data-project-next]');
  let isSwitching = false;
  let switchTimer;

  const setControlsDisabled = (isDisabled) => {
    [previousButton, nextButton].forEach((button) => {
      if (button) button.disabled = isDisabled;
    });
  };

  const switchProject = (direction) => {
    if (!stage || isSwitching) return;

    const currentFolder = stage.querySelector('.project-folder-current');
    if (!currentFolder) return;

    const currentIndex = projectCatalog.findIndex((project) => project.id === currentFolder.dataset.projectId);
    const nextIndex = (currentIndex + direction + projectCatalog.length) % projectCatalog.length;
    const nextProject = projectCatalog[nextIndex];
    const currentIsOpen = currentFolder.classList.contains('is-open');

    isSwitching = true;
    setControlsDisabled(true);

    if (currentIsOpen) {
      currentFolder.querySelector('.project-folder-trigger')?.click();
    }

    window.clearTimeout(switchTimer);
    switchTimer = window.setTimeout(() => {
      const nextFolder = currentFolder.cloneNode(true);
      nextFolder.className = 'project-folder project-folder-entering';
      updateProjectFolder(nextFolder, nextProject);
      initializeProjectFolder(nextFolder);
      nextFolder.classList.add(direction > 0 ? 'from-right' : 'from-left');

      currentFolder.classList.remove('project-folder-current');
      currentFolder.classList.add(direction > 0 ? 'project-folder-exiting-left' : 'project-folder-exiting-right');
      stage.append(nextFolder);

      switchTimer = window.setTimeout(() => {
        currentFolder.remove();
        nextFolder.classList.remove('project-folder-entering', 'from-right', 'from-left');
        nextFolder.classList.add('project-folder-current');
        isSwitching = false;
        setControlsDisabled(false);
      }, 560);
    }, currentIsOpen ? 820 : 0);
  };

  previousButton?.addEventListener('click', () => switchProject(-1));
  nextButton?.addEventListener('click', () => switchProject(1));
}
