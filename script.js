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
  scene.addEventListener('click', () => {
    const nextState = !scene.classList.contains('is-active');

    solutionScenes.forEach((otherScene) => {
      otherScene.classList.remove('is-active');
      otherScene.setAttribute('aria-pressed', 'false');
    });

    scene.classList.toggle('is-active', nextState);
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
    runMotionState(isOpen ? 'is-opening' : 'is-closing', 984);

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
      }, 672);
    }, currentIsOpen ? 984 : 0);
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
