const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const precisePointerQuery = window.matchMedia('(pointer: fine)');

const createScrollMotion = () => {
  const motionAllowed = !reducedMotionQuery.matches;
  const smoothManualScroll = precisePointerQuery.matches && motionAllowed;
  let current = window.scrollY;
  let target = current;
  let frameHandle = 0;
  let previousTime = performance.now();

  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const clampTarget = (value) => Math.min(maxScroll(), Math.max(0, value));

  const render = (timestamp) => {
    const elapsed = Math.min(48, Math.max(1, timestamp - previousTime));
    previousTime = timestamp;
    const smoothing = 1 - Math.exp(-elapsed * .0068);

    current += (target - current) * smoothing;

    if (Math.abs(target - current) < .35) current = target;
    window.scrollTo(0, current);

    if (current !== target) {
      frameHandle = window.requestAnimationFrame(render);
    } else {
      frameHandle = 0;
      document.documentElement.classList.remove('is-scroll-settling');
    }
  };

  const start = () => {
    if (!motionAllowed || frameHandle) return;
    previousTime = performance.now();
    document.documentElement.classList.add('is-scroll-settling');
    frameHandle = window.requestAnimationFrame(render);
  };

  const moveTo = (nextTarget, immediate = false) => {
    target = clampTarget(nextTarget);

    if (!motionAllowed || immediate) {
      if (frameHandle) window.cancelAnimationFrame(frameHandle);
      frameHandle = 0;
      current = target;
      window.scrollTo(0, target);
      document.documentElement.classList.remove('is-scroll-settling');
      return;
    }

    if (!frameHandle) current = window.scrollY;
    start();
  };

  if (motionAllowed) {
    document.documentElement.dataset.scrollMotion = 'ready';
  }

  if (smoothManualScroll) {
    window.addEventListener('wheel', (event) => {
      if (event.ctrlKey || event.metaKey) return;

      const multiplier = event.deltaMode === 1
        ? 16
        : event.deltaMode === 2
          ? window.innerHeight
          : 1;
      const delta = event.deltaY * multiplier;
      if (!delta) return;

      event.preventDefault();
      if (!frameHandle) current = target = window.scrollY;
      target = clampTarget(target + delta);
      start();
    }, { passive: false });

    window.addEventListener('keydown', (event) => {
      const activeElement = document.activeElement;
      const isTyping = activeElement?.matches('input, textarea, select, [contenteditable="true"]');
      if (isTyping || event.altKey || event.ctrlKey || event.metaKey) return;

      let nextTarget = null;
      const pageStep = window.innerHeight * .86;

      if (event.key === 'ArrowDown') nextTarget = target + 76;
      if (event.key === 'ArrowUp') nextTarget = target - 76;
      if (event.key === 'PageDown' || (event.key === ' ' && !event.shiftKey)) nextTarget = target + pageStep;
      if (event.key === 'PageUp' || (event.key === ' ' && event.shiftKey)) nextTarget = target - pageStep;
      if (event.key === 'Home') nextTarget = 0;
      if (event.key === 'End') nextTarget = maxScroll();
      if (nextTarget === null) return;

      event.preventDefault();
      if (!frameHandle) current = target = window.scrollY;
      target = clampTarget(nextTarget);
      start();
    });
  }

  document.addEventListener('click', (event) => {
    const clickedElement = event.target instanceof Element ? event.target : null;
    const link = clickedElement?.closest('a[href^="#"]');
    if (!link || link.classList.contains('skip-link')) return;

    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    const destination = document.querySelector(hash);
    if (!destination) return;

    event.preventDefault();
    const headerHeight = document.querySelector('[data-header]')?.getBoundingClientRect().height || 0;
    const destinationTop = destination.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.history.pushState(null, '', hash);
    moveTo(destinationTop);
  });

  window.addEventListener('resize', () => {
    target = clampTarget(target);
    if (!frameHandle) current = window.scrollY;
  }, { passive: true });

  window.addEventListener('pageshow', () => {
    current = target = window.scrollY;
  }, { passive: true });

  return { moveTo, isEnabled: motionAllowed };
};

createScrollMotion();

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

const solutionScenes = document.querySelectorAll('[data-solution-scene]');
solutionScenes.forEach((scene) => {
  if (scene.classList.contains('solution-friction')) {
    const rootStyles = getComputedStyle(document.documentElement);
    const baseInk = rootStyles.getPropertyValue('--ink').trim() || '#163b64';
    const baseBlue = rootStyles.getPropertyValue('--blue-royal').trim() || '#2563eb';
    const basePaper = rootStyles.getPropertyValue('--paper').trim() || '#f8f6f0';
    const taskTicket = scene.querySelector('.task-ticket');
    const taskIcon = scene.querySelector('.task-icon');
    const taskIconSvg = scene.querySelector('.task-icon svg');
    const taskIconCheck = scene.querySelector('.task-icon span');
    const taskStates = [...scene.querySelectorAll('.task-state em')];
    const taskDestination = scene.querySelector('.task-destination');
    const taskDestinationDot = scene.querySelector('.task-destination-dot');
    const taskBurstCards = [...scene.querySelectorAll('.task-burst-card')];
    const resetSpecs = [
      { node: taskTicket, to: { transform: 'rotate(-.7deg)', borderColor: 'rgba(22, 59, 100, .13)', backgroundColor: 'rgba(255, 254, 252, .98)', color: baseInk } },
      { node: taskIcon, to: { backgroundColor: 'rgba(234, 243, 255, .96)', color: baseBlue } },
      { node: taskIconSvg, to: { opacity: '1', transform: 'scale(1)' } },
      { node: taskIconCheck, to: { color: 'transparent', transform: 'scale(.72)' } },
      ...taskStates.map((node) => ({
        node,
        to: node.classList.contains('task-ready')
          ? { opacity: '1', transform: 'translateY(0)' }
          : { opacity: '0', transform: 'translateY(3px)' },
      })),
      { node: taskDestination, to: { backgroundColor: basePaper, borderColor: 'rgba(22, 59, 100, .28)', transform: 'translate(50%, -50%)' } },
      { node: taskDestinationDot, to: { opacity: '0', transform: 'scale(.5)' } },
      ...taskBurstCards.map((node) => ({
        node,
        to: { opacity: '0', transform: 'translate3d(calc(-50% + var(--burst-x)), 18px, 0) rotate(var(--burst-rot)) scale(.7)' },
      })),
    ].filter(({ node }) => node);
    let resetTimer = null;
    let resetToken = null;

    const clearResetStyles = () => {
      resetSpecs.forEach(({ node, to }) => {
        Object.keys(to).forEach((property) => {
          node.style[property] = '';
        });
      });
    };

    const startHover = () => {
      if (scene.classList.contains('is-hovering') && !scene.classList.contains('is-resetting')) return;

      resetToken = null;
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = null;
      scene.classList.add('is-restarting');
      clearResetStyles();
      scene.classList.remove('is-resetting', 'is-hovering', 'is-restarting');
      void scene.offsetWidth;
      scene.classList.add('is-hovering');
    };

    ['mouseenter', 'pointerenter', 'mouseover', 'pointerover', 'mousemove', 'pointermove'].forEach((eventName) => {
      scene.addEventListener(eventName, startHover);
    });

    const resetHover = () => {
      if (scene.classList.contains('is-active')) {
        scene.classList.remove('is-hovering');
        return;
      }

      if (resetTimer) window.clearTimeout(resetTimer);
      const token = {};
      resetToken = token;
      const fromStyles = resetSpecs.map(({ node, to }) => {
        const computed = getComputedStyle(node);
        const from = {};
        Object.keys(to).forEach((property) => {
          from[property] = computed[property];
          node.style[property] = from[property];
        });
        return { node, from, to };
      });
      scene.classList.remove('is-hovering');
      scene.classList.add('is-resetting');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.requestAnimationFrame(() => {
        if (resetToken !== token) return;
        fromStyles.forEach(({ node, to }) => {
          Object.keys(to).forEach((property) => {
            node.style[property] = to[property];
          });
        });
      });
      resetTimer = window.setTimeout(() => {
        if (resetToken !== token) return;
        resetToken = null;
        resetTimer = null;
        clearResetStyles();
        scene.classList.remove('is-resetting', 'is-hovering');
      }, reducedMotion ? 1 : 740);
    };

    ['mouseleave', 'pointerleave'].forEach((eventName) => {
      scene.addEventListener(eventName, resetHover);
    });
  }

  scene.addEventListener('click', () => {
    const nextState = !scene.classList.contains('is-active');

    solutionScenes.forEach((otherScene) => {
      otherScene.classList.remove('is-active');
      otherScene.setAttribute('aria-pressed', 'false');
    });

    if (nextState) {
      void scene.offsetWidth;
      scene.classList.add('is-active');
    }
    scene.setAttribute('aria-pressed', String(nextState));
  });
});

const capabilityCurves = [...document.querySelectorAll('[data-capability-curve]')];

if (capabilityCurves.length) {
  const drawCapabilityCurve = (canvas) => {
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * pixelRatio));
    const height = Math.max(1, Math.round(rect.height * pixelRatio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const context = canvas.getContext('2d');
    if (!context) return;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    context.lineCap = 'round';
    context.lineJoin = 'round';

    context.beginPath();
    context.moveTo(rect.width * .64, -12);
    context.bezierCurveTo(
      rect.width * .63,
      rect.height * .2,
      rect.width * .79,
      rect.height * .16,
      rect.width * .84,
      rect.height * .32,
    );
    context.bezierCurveTo(
      rect.width * .9,
      rect.height * .5,
      rect.width * .96,
      rect.height * .48,
      rect.width + 12,
      rect.height * .61,
    );
    context.strokeStyle = 'rgba(37, 99, 235, .13)';
    context.lineWidth = 1;
    context.stroke();
  };

  const drawCapabilityCurves = () => capabilityCurves.forEach(drawCapabilityCurve);
  drawCapabilityCurves();
  window.addEventListener('resize', drawCapabilityCurves, { passive: true });
}

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
      page.classList.remove('is-behind-selection');
    });
    pageButtons.forEach((button) => button?.setAttribute('aria-pressed', 'false'));
  };

  const clearClosingPositions = () => {
    pageItems.forEach((page) => {
      page.style.removeProperty('--return-start-y');
      page.style.removeProperty('--return-start-height');
    });
  };

  const captureClosingPositions = () => {
    pageItems.forEach((page) => {
      const transform = window.getComputedStyle(page).transform;
      const translateY = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
      page.style.setProperty('--return-start-y', `${translateY}px`);
      page.style.setProperty('--return-start-height', `${page.getBoundingClientRect().height}px`);
    });
  };

  const runMotionState = (state, duration) => {
    window.clearTimeout(motionTimer);
    folder.classList.remove('is-opening', 'is-closing');
    void folder.offsetWidth;
    folder.classList.add(state);
    motionTimer = window.setTimeout(() => {
      folder.classList.remove(state);
      if (state === 'is-closing') clearClosingPositions();
    }, duration);
  };

  setPageAccess(false);

  trigger.addEventListener('click', () => {
    const isOpen = !folder.classList.contains('is-open');

    if (isOpen) clearClosingPositions();
    else captureClosingPositions();

    clearSelection();
    folder.classList.toggle('is-open', isOpen);
    runMotionState(isOpen ? 'is-opening' : 'is-closing', 814);

    trigger.setAttribute('aria-expanded', String(isOpen));
    trigger.setAttribute('aria-label', `${isOpen ? 'Cerrar' : 'Abrir'} carpeta MOGI`);
    pages.setAttribute('aria-hidden', String(!isOpen));
    setPageAccess(isOpen);
  });

  pageItems.forEach((page, index) => {
    const button = pageButtons[index];
    if (!button) return;

    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', (event) => {
      if (!folder.classList.contains('is-open')) return;

      const wasSelected = page.classList.contains('is-selected');
      const wasMaxSelected = folder.classList.contains('has-max-selection') && wasSelected;

      if (wasSelected && !wasMaxSelected) {
        folder.classList.add('has-max-selection');
        pageItems.forEach((candidate, candidateIndex) => {
          candidate.classList.toggle('is-in-front-of-selection', candidateIndex > index);
          candidate.classList.remove('is-behind-selection');
        });
        return;
      }

      if (wasMaxSelected) {
        clearSelection();
        if (event.detail > 0) button.blur();
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
      }, 531);
    }, currentIsOpen ? 814 : 0);
  };

  previousButton?.addEventListener('click', () => switchProject(-1));
  nextButton?.addEventListener('click', () => switchProject(1));
}

const fluidShaderCanvases = [...document.querySelectorAll('[data-fluid-shader]')];

if (fluidShaderCanvases.length) {
  const vertexShaderSource = `
    attribute vec2 a_position;

    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    // Decorative background only: keep this deliberately cheap. The previous
    // version evaluated multi-octave noise several times for every pixel.
    precision mediump float;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_phase;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      uv.y = 1.0 - uv.y;

      // A few broad waves preserve the movement and palette without noise
      // lookups, nested loops, hashes or per-pixel grain.
      float time = u_time * 0.13;
      float warpedX = uv.x + 0.045 * sin(uv.y * 5.0 + time * 0.8 + u_phase);
      float warpedY = uv.y + 0.055 * sin(uv.x * 4.2 - time * 0.7 + u_phase);

      float edgeOne = 0.20 + 0.11 * sin(warpedY * 5.4 + time * 0.72 + u_phase);
      float edgeTwo = 0.47 + 0.12 * sin(warpedY * 4.8 - time * 0.56 + u_phase * 1.7);
      float edgeThree = 0.75 + 0.12 * sin(warpedY * 5.1 + time * 0.44 - u_phase);

      vec3 pale = vec3(0.975, 0.988, 1.0);
      vec3 lavender = vec3(0.76, 0.72, 0.91);
      vec3 blue = vec3(0.55, 0.70, 0.89);
      vec3 light = vec3(0.91, 0.95, 0.96);
      vec3 cyan = vec3(0.57, 0.78, 0.84);

      vec3 color = mix(lavender, blue, smoothstep(edgeOne - 0.06, edgeOne + 0.06, warpedX));
      color = mix(color, light, smoothstep(edgeTwo - 0.07, edgeTwo + 0.07, warpedX));
      color = mix(color, cyan, smoothstep(edgeThree - 0.075, edgeThree + 0.075, warpedX));

      float ribbonCenter = 0.5 + 0.16 * sin(warpedX * 4.7 - time * 0.41 + u_phase);
      float ribbon = 1.0 - smoothstep(0.03, 0.16, abs(warpedY - ribbonCenter));
      color = mix(color, pale, ribbon * 0.42);

      float leftLobe = 1.0 - smoothstep(0.13, 0.43, distance(vec2(warpedX * 1.1, warpedY), vec2(0.02, 0.67 + 0.08 * sin(time))));
      float rightLobe = 1.0 - smoothstep(0.18, 0.48, distance(vec2(warpedX, warpedY * 1.08), vec2(1.02, 0.42 + 0.07 * cos(time * 0.8))));
      color = mix(color, lavender, leftLobe * 0.38);
      color = mix(color, blue, rightLobe * 0.27);

      color = mix(color, pale, 0.08);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const compileShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const shaderStates = fluidShaderCanvases.map((canvas, index) => {
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
    });

    if (!gl) return null;

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const phaseLocation = gl.getUniformLocation(program, 'u_phase');

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    return {
      canvas,
      gl,
      program,
      resolutionLocation,
      timeLocation,
      phaseLocation,
      phase: canvas.dataset.shaderVariant === 'about' ? 2.4 : index * 1.3,
      visible: false,
      needsResize: true,
    };
  }).filter(Boolean);

  const resizeShader = (state) => {
    if (!state.needsResize) return;

    const rect = state.canvas.getBoundingClientRect();
    // Keep the decorative layer below full CSS resolution. It is not content
    // and this cuts the fragment workload roughly in half on large screens.
    const quality = window.innerWidth <= 680 ? 0.36 : 0.46;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25) * quality;
    const width = Math.max(1, Math.round(rect.width * pixelRatio));
    const height = Math.max(1, Math.round(rect.height * pixelRatio));

    if (state.canvas.width !== width || state.canvas.height !== height) {
      state.canvas.width = width;
      state.canvas.height = height;
      state.gl.viewport(0, 0, width, height);
    }

    state.needsResize = false;
  };

  const drawShader = (state, seconds) => {
    resizeShader(state);
    state.gl.useProgram(state.program);
    state.gl.uniform2f(state.resolutionLocation, state.canvas.width, state.canvas.height);
    state.gl.uniform1f(state.timeLocation, seconds);
    state.gl.uniform1f(state.phaseLocation, state.phase);
    state.gl.drawArrays(state.gl.TRIANGLES, 0, 6);
  };

  // Assigned below when motion is enabled. Keeping a no-op fallback avoids
  // errors for users who prefer reduced motion.
  let requestShaderFrame = () => {};

  const shaderObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const state = shaderStates.find((candidate) => candidate.canvas === entry.target);
      if (state) state.visible = entry.isIntersecting;
    });
    requestShaderFrame();
  }, { rootMargin: '160px 0px' });

  const resizeObserver = 'ResizeObserver' in window
    ? new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const state = shaderStates.find((candidate) => candidate.canvas === entry.target);
        if (state) state.needsResize = true;
      });
      requestShaderFrame();
    })
    : null;

  shaderStates.forEach((state) => {
    shaderObserver.observe(state.canvas);
    resizeObserver?.observe(state.canvas);
    drawShader(state, 0);
  });

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const shaderFrameInterval = 1000 / 18;
    let shaderFrameHandle = 0;
    let lastShaderFrame = 0;

    const hasVisibleShader = () => shaderStates.some((state) => state.visible);

    const animateShaders = (timestamp) => {
      shaderFrameHandle = 0;
      if (document.hidden || !hasVisibleShader()) return;

      if (timestamp - lastShaderFrame >= shaderFrameInterval) {
        lastShaderFrame = timestamp;
        shaderStates.forEach((state) => {
          if (state.visible) drawShader(state, timestamp / 1000);
        });
      }

      shaderFrameHandle = window.requestAnimationFrame(animateShaders);
    };

    requestShaderFrame = () => {
      if (!document.hidden && hasVisibleShader() && !shaderFrameHandle) {
        shaderFrameHandle = window.requestAnimationFrame(animateShaders);
      }
    };

    window.addEventListener('resize', () => {
      shaderStates.forEach((state) => {
        state.needsResize = true;
      });
      requestShaderFrame();
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && shaderFrameHandle) {
        window.cancelAnimationFrame(shaderFrameHandle);
        shaderFrameHandle = 0;
      } else {
        requestShaderFrame();
      }
    });

    // The observer callback normally starts this after the first layout. The
    // explicit call also covers browsers that delay the initial observation.
    window.setTimeout(requestShaderFrame, 0);
  }
}
