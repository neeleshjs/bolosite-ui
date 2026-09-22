(() => {
  const html = document.documentElement;
  const homepageAnimationsDisabled = html.dataset.homepageAnimations === 'off';
  if (!homepageAnimationsDisabled) {
    html.classList.add('reveal-ready');
    window.setTimeout(() => html.classList.remove('reveal-ready'), 2500);
  }
  const body = document.body;
  const header = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  let currentAccount = null;
  let lastFocused = null;
  let lastPublicActivity = Date.now();
  let publicCsrf = '';
  for (const eventName of ['pointerdown', 'keydown', 'input', 'scroll']) {
    document.addEventListener(eventName, event => {
      if (event.isTrusted) lastPublicActivity = Date.now();
    }, { passive: true });
  }

  const apiRequest = async (url, options = {}, csrfRetried = false) => {
    const response = await fetch(url, {
      credentials: 'same-origin',
      ...options,
      headers: { 'Content-Type': 'application/json',
        ...(publicCsrf ? { 'X-CSRF-Token': publicCsrf } : {}),
        ...(!document.hidden && Date.now() - lastPublicActivity < 65000 ? { 'X-BoloSite-User-Activity': '1' } : {}),
        ...(options.headers || {}) }
    });
    const payload = await response.json().catch(() => ({}));
    if (payload.csrf_token) publicCsrf = payload.csrf_token;
    if (payload.code === 'session_expired') { publicCsrf = ''; renderAccount(null); }
    if (response.status === 403 && payload.code === 'csrf_failed' && !csrfRetried) {
      await apiRequest('/api/public/session');
      return apiRequest(url, options, true);
    }
    if (!response.ok || payload.ok === false) throw new Error(payload.error || 'Something went wrong. Please try again.');
    return payload;
  };

  window.setInterval(() => {
    if (currentAccount && !document.hidden && Date.now() - lastPublicActivity < 65000) {
      apiRequest('/api/public/session').then(result => {
        if (!result.authenticated) renderAccount(null);
      }).catch(() => {});
    }
  }, 60000);

  const showToast = (title, message) => {
    if (!toast) return;
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 4300);
  };

  document.getElementById('year').textContent = new Date().getFullYear();

  let headerScrolled = null;
  let headerScrollTicking = false;
  const updateHeader = () => {
    const scrolled = window.scrollY > 24;
    if (scrolled === headerScrolled) return;
    headerScrolled = scrolled;
    header.classList.toggle('scrolled', scrolled);
  };
  const requestHeaderUpdate = () => {
    if (headerScrollTicking) return;
    headerScrollTicking = true;
    window.requestAnimationFrame(() => {
      headerScrollTicking = false;
      updateHeader();
    });
  };
  updateHeader();
  window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
  document.addEventListener('visibilitychange', () => {
    html.classList.toggle('page-is-hidden', document.hidden);
  });

  const closeMenu = () => {
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    mobileNav.classList.remove('open');
  };

  menuToggle.addEventListener('click', () => {
    const opening = !mobileNav.classList.contains('open');
    mobileNav.classList.toggle('open', opening);
    menuToggle.classList.toggle('active', opening);
    menuToggle.setAttribute('aria-expanded', String(opening));
    menuToggle.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
  });

  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => {
    if (mobileNav.classList.contains('open') && !event.target.closest('.site-header')) closeMenu();
  });

  const setTheme = theme => {
    const selected = theme === 'dark' ? 'dark' : 'light';
    html.dataset.theme = selected;
    localStorage.setItem('bolosite-theme', selected);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', selected === 'dark' ? '#0d120c' : '#f5f7f2');
    document.querySelectorAll('#themeToggle, #mobileThemeToggle').forEach(button => {
      button.setAttribute('aria-label', selected === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
    const footerThemeToggle = document.getElementById('footerThemeToggle');
    if (footerThemeToggle) footerThemeToggle.textContent = selected === 'dark' ? 'Light mode' : 'Dark mode';
  };

  const toggleTheme = () => setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark');
  document.querySelectorAll('#themeToggle, #mobileThemeToggle').forEach(button => button.addEventListener('click', toggleTheme));
  document.getElementById('footerThemeToggle')?.addEventListener('click', toggleTheme);
  setTheme(html.dataset.theme);

  const footerShareButton = document.getElementById('footerShareButton');
  if (footerShareButton) {
    footerShareButton.addEventListener('click', async () => {
      const shareUrl = footerShareButton.dataset.shareUrl || 'https://www.bolosite.com';
      const shareData = {
        title: 'BoloSite',
        text: 'Try BoloSite, the AI operating layer for websites.',
        url: shareUrl
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
          showToast('Website shared', 'Thanks for sharing BoloSite.');
          return;
        }

        await navigator.clipboard.writeText(shareUrl);
        showToast('Website copied', 'www.bolosite.com is ready to share.');
      } catch (error) {
        showToast('Share link', shareUrl);
      }
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if (homepageAnimationsDisabled) {
    revealItems.forEach(item => item.classList.add('visible'));
  } else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -35px' });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
  }

  const initBetterInlineIcons = () => {
    const iconPaths = {
      shopping: '<path d="M6 8h12l-1 11H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
      graduation: '<path d="m3 8 9-4 9 4-9 4-9-4Z"/><path d="M7 10v5c3 2 7 2 10 0v-5"/><path d="M21 8v6"/>',
      rocket: '<path d="M13 4c4 1 7 4 7 8l-4 1-3 4-2-4-4-2 4-3 2-4Z"/><path d="M6 14l-2 5 5-2"/><path d="M15 8h.01"/>',
      message: '<path d="M5 6h14v9H8l-4 4V6Z"/><path d="M8 10h8"/><path d="M8 13h5"/>',
      route: '<path d="M5 18c5 0 5-12 14-12"/><path d="M13 6h6v6"/><circle cx="5" cy="18" r="2"/>',
      shield: '<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/>',
      user: '<circle cx="12" cy="8" r="3.2"/><path d="M5 20c1.1-4 12.9-4 14 0"/>',
      briefcase: '<path d="M4 8h16v10H4V8Z"/><path d="M9 8V6h6v2"/><path d="M4 12h16"/>',
      mail: '<path d="M4 6h16v12H4V6Z"/><path d="m4 7 8 6 8-6"/>',
      clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/>',
      globe: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16"/><path d="M12 4c2.2 2.4 2.2 13.6 0 16"/><path d="M12 4c-2.2 2.4-2.2 13.6 0 16"/>',
      search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/>',
      explain: '<path d="M5 5h14v14H5V5Z"/><path d="M8 9h8"/><path d="M8 13h5"/><path d="M17 17h.01"/>',
      navigate: '<path d="M5 19 19 5"/><path d="M10 5h9v9"/>',
      check: '<path d="M20 6 9 17l-5-5"/>',
      language: '<path d="M4 6h9"/><path d="M9 4v2c0 4-2 7-5 9"/><path d="M6 10c1 2 3 4 6 5"/><path d="M14 20l4-9 4 9"/><path d="M15.3 17h5.4"/>',
      keyboard: '<path d="M4 7h16v10H4V7Z"/><path d="M7 10h.01M10 10h.01M13 10h.01M16 10h.01M8 14h8"/>',
      mic: '<path d="M12 4a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3Z"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>',
      portal: '<path d="M5 5h14v14H5V5Z"/><path d="M9 9h6v6H9V9Z"/><path d="M15 12h5"/><path d="M4 12h5"/>',
      database: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
      target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
      bolt: '<path d="m13 2-8 12h6l-1 8 9-13h-6l0-7Z"/>'
    };

    const makeIcon = name => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'ui-icon');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = iconPaths[name] || iconPaths.target;
      return svg;
    };

    const setIcon = (element, name) => {
      if (!element) return;
      element.textContent = '';
      element.appendChild(makeIcon(name));
    };

    [
      ['.problem-card:nth-child(1) .icon-box', 'message'],
      ['.problem-card:nth-child(2) .icon-box', 'route'],
      ['.problem-card:nth-child(3) .icon-box', 'shield'],
      ['.industry-card.ecommerce .industry-icon', 'shopping'],
      ['.industry-card.education .industry-icon', 'graduation'],
      ['.industry-card.saas .industry-icon', 'rocket'],
      ['.hero-paths a:nth-child(1) .path-icon', 'user'],
      ['.hero-paths a:nth-child(2) .path-icon', 'briefcase'],
      ['.contact-details > a:nth-child(1) > span', 'mail'],
      ['.contact-details > div:nth-child(2) > span', 'clock'],
      ['.contact-details > div:nth-child(3) > span', 'globe'],
      ['.floating-card-one > span', 'bolt']
    ].forEach(([selector, icon]) => setIcon(document.querySelector(selector), icon));

    document.querySelectorAll('.journey-feature-grid article').forEach(article => {
      const title = article.querySelector('strong')?.textContent.toLowerCase() || '';
      const marker = article.querySelector('i');
      if (title.includes('find')) setIcon(marker, 'search');
      else if (title.includes('understand')) setIcon(marker, 'explain');
      else if (title.includes('move') || title.includes('page action')) setIcon(marker, 'navigate');
      else if (title.includes('next step')) setIcon(marker, 'check');
      else if (title.includes('hindi') || title.includes('language') || title.includes('natural')) setIcon(marker, 'language');
      else if (title.includes('type') || title.includes('text chat')) setIcon(marker, 'keyboard');
      else if (title.includes('knowledge')) setIcon(marker, 'database');
      else if (title.includes('sales')) setIcon(marker, 'target');
      else if (title.includes('portal')) setIcon(marker, 'portal');
    });
  };

  initBetterInlineIcons();

  const initSectionLogoAssemblies = () => {
    const sections = [...document.querySelectorAll('main > section')];
    if (!sections.length) return;

    let globalLogoLayer = document.querySelector('.bs-global-logo-layer');
    if (!globalLogoLayer) {
      globalLogoLayer = document.createElement('div');
      globalLogoLayer.className = 'bs-global-logo-layer';
      globalLogoLayer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(globalLogoLayer);
    }

    const partSources = [
      ['b', 'assets/images/logo-parts/bolosite-b.svg'],
      ['bot', 'assets/images/logo-parts/bolosite-bot.svg'],
      ['voice', 'assets/images/logo-parts/bolosite-voice.svg'],
      ['word', 'assets/images/logo-parts/bolosite-word.svg']
    ];
    const sectionPatterns = [
      [{ x: 6, y: 15 }, { x: 82, y: 54 }, { x: 43, y: 76 }],
      [{ x: 84, y: 18 }, { x: 7, y: 58 }, { x: 54, y: 72 }],
      [{ x: 9, y: 66 }, { x: 78, y: 16 }, { x: 38, y: 44 }],
      [{ x: 80, y: 64 }, { x: 12, y: 22 }, { x: 59, y: 77 }]
    ];

    const randomBetween = (min, max) => min + Math.random() * (max - min);
    const randomSign = () => Math.random() > .5 ? 1 : -1;
    const setPct = (element, name, value) => element.style.setProperty(name, `${Math.round(value)}%`);
    const setDeg = (element, name, value) => element.style.setProperty(name, `${Math.round(value)}deg`);

    const randomizeBlastPath = assembly => {
      const paths = [
        { cls: 'b', sx: -1, sy: -1, x: [260, 340], y: [210, 320], curve: [-68, -118] },
        { cls: 'bot', sx: 1, sy: -1, x: [270, 360], y: [205, 325], curve: [66, -112] },
        { cls: 'voice', sx: -1, sy: 1, x: [255, 350], y: [230, 360], curve: [-86, 92] },
        { cls: 'word', sx: 1, sy: 1, x: [270, 365], y: [235, 365], curve: [84, 102] }
      ];

      paths.forEach((path, index) => {
        const part = assembly.querySelector(`.bs-logo-piece--${path.cls}`);
        if (!part) return;

        const blastX = path.sx * randomBetween(path.x[0], path.x[1]);
        const blastY = path.sy * randomBetween(path.y[0], path.y[1]);
        const curveX = path.curve[0] + randomBetween(-24, 24);
        const curveY = path.curve[1] + randomBetween(-24, 24);
        const spin = randomSign() * randomBetween(230, 430);
        const returnSpin = randomSign() * randomBetween(24, 54);
        const settleSpin = randomSign() * randomBetween(5, 13);

        setPct(part, '--pull-x', -path.sx * randomBetween(8, 18));
        setPct(part, '--pull-y', -path.sy * randomBetween(6, 16));
        setDeg(part, '--pull-r', -path.sx * randomBetween(8, 18));
        setPct(part, '--pop-x', path.sx * randomBetween(24, 46));
        setPct(part, '--pop-y', path.sy * randomBetween(18, 42));
        setDeg(part, '--pop-r', path.sx * randomBetween(18, 42));
        setPct(part, '--blast-mid-x', blastX * .58 + curveX);
        setPct(part, '--blast-mid-y', blastY * .58 + curveY);
        setDeg(part, '--blast-mid-r', spin * .55);
        setPct(part, '--blast-x', blastX);
        setPct(part, '--blast-y', blastY);
        setDeg(part, '--blast-r', spin);
        setPct(part, '--hang-x', blastX + randomBetween(-28, 28));
        setPct(part, '--hang-y', blastY + randomBetween(-28, 28));
        setDeg(part, '--hang-r', spin + randomSign() * randomBetween(28, 72));
        setPct(part, '--orbit-x', -path.sx * randomBetween(58, 92));
        setPct(part, '--orbit-y', path.sy * randomBetween(36, 82));
        setDeg(part, '--orbit-r', -spin * .32);
        setPct(part, '--return-x', path.sx * randomBetween(30, 54));
        setPct(part, '--return-y', -path.sy * randomBetween(24, 48));
        setDeg(part, '--return-r', returnSpin);
        setPct(part, '--settle-x', -path.sx * randomBetween(8, 16));
        setPct(part, '--settle-y', path.sy * randomBetween(6, 14));
        setDeg(part, '--settle-r', settleSpin);
        setPct(part, '--recoil-x', path.sx * randomBetween(3, 7));
        setPct(part, '--recoil-y', -path.sy * randomBetween(2, 6));
        setDeg(part, '--recoil-r', -settleSpin * .55);
        part.style.setProperty('--blast-scale', randomBetween(.64, .82).toFixed(2));
        part.style.setProperty('--blast-delay', `${(index * .07 + randomBetween(0, .045)).toFixed(2)}s`);
        part.style.setProperty('--blast-duration', `${randomBetween(2.08, 2.42).toFixed(2)}s`);
      });
    };

    const blastLogo = assembly => {
      window.clearTimeout(assembly._blastTimer);
      window.clearTimeout(assembly._settleTimer);
      window.cancelAnimationFrame(assembly._blastFrame);
      assembly.classList.remove('is-blasting');
      assembly.classList.remove('is-settled');
      assembly.classList.add('is-touched');
      randomizeBlastPath(assembly);
      assembly._blastFrame = window.requestAnimationFrame(() => {
        assembly._blastFrame = window.requestAnimationFrame(() => {
          assembly.classList.add('is-blasting');
          assembly._blastTimer = window.setTimeout(() => {
            assembly.classList.remove('is-blasting');
            assembly.classList.remove('is-touched');
            assembly.classList.add('is-settled');
            assembly._settleTimer = window.setTimeout(() => assembly.classList.remove('is-settled'), 1000);
          }, 2750);
        });
      });
    };

    const restoreSavedPosition = (assembly, storageKey) => {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey));
        if (!saved) return;

        if (saved.portaled && Number.isFinite(saved.left) && Number.isFinite(saved.top)) {
          assembly.classList.add('is-portaled');
          assembly.style.left = `${saved.left}px`;
          assembly.style.top = `${saved.top}px`;
          if (Number.isFinite(saved.width)) assembly.style.width = `${saved.width}px`;
          assembly.dataset.dragX = '0';
          assembly.dataset.dragY = '0';
          assembly.style.setProperty('--drag-x', '0px');
          assembly.style.setProperty('--drag-y', '0px');
          globalLogoLayer.appendChild(assembly);
          return;
        }

        if (!Number.isFinite(saved.x) || !Number.isFinite(saved.y)) return;
        assembly.dataset.dragX = String(saved.x);
        assembly.dataset.dragY = String(saved.y);
        assembly.style.setProperty('--drag-x', `${saved.x}px`);
        assembly.style.setProperty('--drag-y', `${saved.y}px`);
      } catch (_) {}
    };

    const savePosition = (storageKey, position) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(position));
      } catch (_) {}
    };

    const promoteLogoToGlobalLayer = assembly => {
      if (assembly.classList.contains('is-portaled')) return;

      const rect = assembly.getBoundingClientRect();
      assembly.classList.add('is-portaled');
      assembly.style.left = `${rect.left + window.scrollX}px`;
      assembly.style.top = `${rect.top + window.scrollY}px`;
      assembly.style.width = `${rect.width}px`;
      assembly.dataset.dragX = '0';
      assembly.dataset.dragY = '0';
      assembly.style.setProperty('--drag-x', '0px');
      assembly.style.setProperty('--drag-y', '0px');
      globalLogoLayer.appendChild(assembly);
    };

    const wireLogoInteraction = (assembly, movementMode, storageKey) => {
      let active = null;
      let moveFrame = 0;

      const applyPointerMove = () => {
        moveFrame = 0;
        if (!active) return;

        const { pendingX: dx, pendingY: dy } = active;
        if (active.mode === 'part') {
          const rotate = (dx + dy) * .45;
          active.part.style.transform = `${active.baseTransform} translate3d(${dx}px, ${dy}px, 0) rotate(${rotate}deg)`;
          return;
        }

        assembly.style.setProperty('--drag-x', `${active.nextX}px`);
        assembly.style.setProperty('--drag-y', `${active.nextY}px`);
      };

      const finishPointer = event => {
        if (!active || active.id !== event.pointerId) return;
        if (moveFrame) {
          window.cancelAnimationFrame(moveFrame);
          applyPointerMove();
        }
        const state = active;
        active = null;
        assembly.classList.remove('is-dragging');

        if (state.mode === 'part') {
          state.part.classList.remove('is-manual');
          state.part.style.transform = '';
        }

        if (state.mode === 'logo') {
          if (state.movementMode === 'free') {
            if (assembly.classList.contains('is-portaled')) {
              const left = state.baseLeft + state.nextX;
              const top = state.baseTop + state.nextY;
              assembly.style.left = `${left}px`;
              assembly.style.top = `${top}px`;
              assembly.dataset.dragX = '0';
              assembly.dataset.dragY = '0';
              assembly.style.setProperty('--drag-x', '0px');
              assembly.style.setProperty('--drag-y', '0px');
              savePosition(storageKey, {
                portaled: true,
                left,
                top,
                width: assembly.getBoundingClientRect().width
              });
            } else {
              assembly.dataset.dragX = String(state.nextX);
              assembly.dataset.dragY = String(state.nextY);
              assembly.style.setProperty('--drag-x', `${state.nextX}px`);
              assembly.style.setProperty('--drag-y', `${state.nextY}px`);
              savePosition(storageKey, { x: state.nextX, y: state.nextY });
            }
          } else if (state.movementMode === 'return') {
            assembly.classList.add('is-returning');
            assembly.dataset.dragX = '0';
            assembly.dataset.dragY = '0';
            assembly.style.setProperty('--drag-x', '0px');
            assembly.style.setProperty('--drag-y', '0px');
            window.setTimeout(() => assembly.classList.remove('is-returning'), 520);
          }
        }

        if (!state.moved) blastLogo(assembly);
      };

      assembly.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        if (movementMode === 'blast-only') {
          blastLogo(assembly);
          return;
        }

        const selectedPart = event.target.closest('.bs-logo-piece');
        const dragPart = selectedPart && (event.shiftKey || event.altKey);
        if (!dragPart && movementMode === 'free') promoteLogoToGlobalLayer(assembly);
        const startDragX = Number(assembly.dataset.dragX || 0);
        const startDragY = Number(assembly.dataset.dragY || 0);
        const baseLeft = assembly.classList.contains('is-portaled') ? Number.parseFloat(assembly.style.left) || 0 : 0;
        const baseTop = assembly.classList.contains('is-portaled') ? Number.parseFloat(assembly.style.top) || 0 : 0;

        active = {
          id: event.pointerId,
          mode: dragPart ? 'part' : 'logo',
          part: dragPart ? selectedPart : null,
          startX: event.clientX,
          startY: event.clientY,
          startDragX,
          startDragY,
          nextX: startDragX,
          nextY: startDragY,
          baseLeft,
          baseTop,
          movementMode,
          moved: false,
          pendingX: 0,
          pendingY: 0,
          baseTransform: 'translate3d(0, 0, 0)'
        };

        assembly.classList.add('is-touched');
        window.setTimeout(() => assembly.classList.remove('is-touched'), 240);

        if (dragPart) {
          const currentTransform = getComputedStyle(selectedPart).transform;
          active.baseTransform = currentTransform === 'none' ? 'translate3d(0, 0, 0)' : currentTransform;
          selectedPart.classList.add('is-manual');
          selectedPart.style.transform = active.baseTransform;
        } else {
          assembly.classList.add('is-dragging');
        }

        assembly.setPointerCapture(event.pointerId);
        event.preventDefault();
      });

      assembly.addEventListener('pointermove', event => {
        if (!active || active.id !== event.pointerId) return;
        const dx = event.clientX - active.startX;
        const dy = event.clientY - active.startY;
        if (Math.hypot(dx, dy) > 4) active.moved = true;
        active.pendingX = dx;
        active.pendingY = dy;

        if (active.mode !== 'part') {
          active.nextX = active.startDragX + dx;
          active.nextY = active.startDragY + dy;
        }
        if (!moveFrame) moveFrame = window.requestAnimationFrame(applyPointerMove);
        event.preventDefault();
      });

      assembly.addEventListener('pointerup', finishPointer);
      assembly.addEventListener('pointercancel', finishPointer);
      assembly.addEventListener('lostpointercapture', finishPointer);
      assembly.addEventListener('dblclick', event => {
        event.preventDefault();
        blastLogo(assembly);
      });
    };

    const mountSectionLogos = (section, sectionIndex) => {
      if (section.dataset.bsLogoMounted === 'true') return;
      section.dataset.bsLogoMounted = 'true';
      if (section.querySelector('.bs-section-logo-layer')) return;

      const layer = document.createElement('div');
      layer.className = 'bs-section-logo-layer';
      layer.setAttribute('aria-hidden', 'true');
      section.prepend(layer);

      const isHero = section.classList.contains('hero');
      const isSlim = section.classList.contains('usecase-strip') || section.classList.contains('final-cta');
      const pattern = isHero
        ? [{ x: 4, y: 20 }, { x: 90, y: 16 }, { x: 5, y: 78 }, { x: 90, y: 74 }]
        : sectionPatterns[sectionIndex % sectionPatterns.length];
      const sizes = isHero ? [66, 76, 68, 74] : isSlim ? [58, 48, 44] : [84, 68, 62];

      pattern.forEach((position, logoIndex) => {
        const movementMode = isHero
          ? (logoIndex === 1 || logoIndex === 3 ? 'free' : 'return')
          : (logoIndex > 0 ? 'free' : 'return');
        const assembly = document.createElement('div');
        const sectionId = section.id || `section-${sectionIndex}`;
        const storageKey = `bolosite-logo-${sectionId}-${logoIndex}`;

        assembly.className = `bs-logo-assembly ${movementMode === 'free' ? 'bs-logo-assembly--movable' : 'bs-logo-assembly--fixed'}`;
        assembly.dataset.movement = movementMode;
        assembly.dataset.dragX = '0';
        assembly.dataset.dragY = '0';
        assembly.style.setProperty('--logo-x', `${position.x}%`);
        assembly.style.setProperty('--logo-y', `${position.y}%`);
        assembly.style.setProperty('--size', `${sizes[logoIndex]}px`);
        assembly.style.setProperty('--delay', `${-((sectionIndex * 1.2) + (logoIndex * 2.1))}s`);
        assembly.style.setProperty('--float-x', `${logoIndex % 2 === 0 ? 10 : -12}px`);
        assembly.style.setProperty('--float-y', `${logoIndex === 1 ? 12 : -10}px`);

        partSources.forEach(([name, src], partIndex) => {
          const part = document.createElement('img');
          part.className = `bs-logo-piece bs-logo-piece--${name}`;
          part.src = src;
          part.alt = '';
          part.draggable = false;
          part.loading = 'lazy';
          part.decoding = 'async';
          part.fetchPriority = 'low';
          part.style.setProperty('--delay', `${-((sectionIndex * 1.2) + (logoIndex * 2.1) + (partIndex * .18))}s`);
          assembly.appendChild(part);
        });

        layer.appendChild(assembly);
        if (movementMode === 'free') restoreSavedPosition(assembly, storageKey);
        wireLogoInteraction(assembly, movementMode, storageKey);
      });
    };

    sections.forEach(section => section.classList.add('bs-logo-zone'));

    const mobileLogoOptimization = window.matchMedia('(max-width: 820px)').matches;
    if (mobileLogoOptimization && 'IntersectionObserver' in window) {
      const mountDistance = Math.max(900, Math.round(window.innerHeight * 1.25));
      const logoMountObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const sectionIndex = Number(entry.target.dataset.bsLogoSectionIndex);
          mountSectionLogos(entry.target, sectionIndex);
          logoMountObserver.unobserve(entry.target);
        });
      }, { rootMargin: `${mountDistance}px 0px`, threshold: 0 });

      sections.forEach((section, sectionIndex) => {
        section.dataset.bsLogoSectionIndex = String(sectionIndex);
        if (sectionIndex === 0) mountSectionLogos(section, sectionIndex);
        else logoMountObserver.observe(section);
      });
    } else {
      sections.forEach(mountSectionLogos);
    }

    if ('IntersectionObserver' in window) {
      const logoMotionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.target.classList.toggle('bs-logo-live', entry.isIntersecting));
      }, { rootMargin: mobileLogoOptimization ? '120px 0px' : '320px 0px', threshold: 0 });
      sections.forEach(section => logoMotionObserver.observe(section));
    } else {
      sections.forEach(mountSectionLogos);
      sections.forEach(section => section.classList.add('bs-logo-live'));
    }
  };

  // The page motion switch pauses decorative website movement, but the
  // interactive BoloSite logo remains part of the product identity.
  initSectionLogoAssemblies();

  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const openModal = modal => {
    if (!modal) return;
    closeMenu();
    lastFocused = document.activeElement;
    modal.hidden = false;
    body.classList.add('modal-open');
    window.setTimeout(() => modal.querySelector('input, button, select, textarea')?.focus(), 30);
  };
  const closeModal = modal => {
    if (!modal) return;
    modal.hidden = true;
    if (!document.querySelector('.modal:not([hidden])')) body.classList.remove('modal-open');
    lastFocused?.focus?.();
  };

  document.querySelectorAll('[data-open-modal]').forEach(button => button.addEventListener('click', () => openModal(document.getElementById(button.dataset.openModal))));
  document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', () => closeModal(button.closest('.modal'))));

  document.addEventListener('keydown', event => {
    const modal = document.querySelector('.modal:not([hidden])');
    if (!modal) return;
    if (event.key === 'Escape') return closeModal(modal);
    if (event.key !== 'Tab') return;
    const focusable = [...modal.querySelectorAll(focusableSelector)];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  document.querySelectorAll('.faq-item button').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(other => {
        other.classList.remove('open');
        other.querySelector('button').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.querySelectorAll('video').forEach(video => {
    video.addEventListener('play', () => document.querySelectorAll('video').forEach(other => {
      if (other !== video) other.pause();
    }));
  });

  const switchAuthPanel = view => {
    const selected = view === 'signup' ? 'signup' : 'login';
    document.querySelectorAll('[data-auth-panel]').forEach(panel => panel.classList.toggle('is-hidden', panel.dataset.authPanel !== selected));
    document.querySelectorAll('[data-auth-tab]').forEach(tab => tab.classList.toggle('active', tab.dataset.authTab === selected));
  };

  document.querySelectorAll('[data-auth-view]').forEach(button => {
    button.addEventListener('click', () => {
      switchAuthPanel(button.dataset.authView);
      openModal(document.getElementById('authModal'));
    });
  });
  document.querySelectorAll('[data-auth-tab]').forEach(button => button.addEventListener('click', () => switchAuthPanel(button.dataset.authTab)));

  const renderAccount = accountData => {
    currentAccount = accountData || null;
    const loggedIn = Boolean(currentAccount);
    document.getElementById('loginButton').classList.toggle('is-hidden', loggedIn);
    document.getElementById('profileWrap').classList.toggle('is-hidden', !loggedIn);
    document.querySelector('.mobile-auth').classList.toggle('is-hidden', loggedIn);
    const showClientPortal = !loggedIn || currentAccount.role === 'client';
    document.getElementById('clientPortalButton').classList.toggle('is-hidden', !showClientPortal);
    document.getElementById('mobileClientPortalButton').classList.toggle('is-hidden', !showClientPortal);
    if (!loggedIn) return;
    const account = currentAccount;
    const initial = (account.name || 'A').trim().charAt(0).toUpperCase();
    document.getElementById('profileAvatar').textContent = initial;
    document.getElementById('profileMenuAvatar').textContent = initial;
    document.getElementById('profileShortName').textContent = account.name.split(' ')[0];
    document.getElementById('profileMenuName').textContent = account.name;
    document.getElementById('profileMenuRole').textContent = account.role === 'client' ? 'Website client' : 'Website user';
    document.getElementById('profileMenuEmail').textContent = account.email;
    document.getElementById('profileMenuMobile').textContent = account.mobile || '—';
    document.getElementById('profileMenuProfession').textContent = account.profession || '—';
  };

  const setFormBusy = (form, busy) => {
    const button = form.querySelector('[type="submit"]');
    if (!button) return;
    button.disabled = busy;
    button.classList.toggle('is-loading', busy);
  };

  document.getElementById('profileButton').addEventListener('click', () => {
    const menu = document.getElementById('profileMenu');
    const opening = !menu.classList.contains('open');
    menu.classList.toggle('open', opening);
    document.getElementById('profileButton').setAttribute('aria-expanded', String(opening));
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.profile-wrap')) {
      document.getElementById('profileMenu').classList.remove('open');
      document.getElementById('profileButton').setAttribute('aria-expanded', 'false');
    }
  });

  // Capture the exact attempt before awaiting the host API. No field values enter receipts.
  const captureBoloFormReceipt = form => {
    const execution_id = form.getAttribute('data-bolosite-execution-id');
    const form_type = form.getAttribute('data-bolosite-form-type');
    return success => {
      if (!execution_id || !form_type) return;
      window.dispatchEvent(new CustomEvent(success ? 'bolosite:form-submit-success' : 'bolosite:form-submit-failure', {
        detail: { execution_id, form_type }
      }));
      if (form.getAttribute('data-bolosite-execution-id') === execution_id) {
        form.removeAttribute('data-bolosite-execution-id');
        form.removeAttribute('data-bolosite-form-type');
      }
    };
  };

  document.getElementById('signupForm').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const receipt = captureBoloFormReceipt(form);
    const data = new FormData(form);
    setFormBusy(form, true);
    try {
      const result = await apiRequest('/api/public/register', {
        method: 'POST', body: JSON.stringify(Object.fromEntries(data.entries()))
      });
      receipt(true);
      renderAccount(result.account);
      closeModal(document.getElementById('authModal'));
      form.reset();
      showToast(`Welcome, ${result.account.name.split(' ')[0]}!`, 'Your secure BoloSite account is ready.');
    } catch (error) {
      receipt(false);
      showToast('Could not create account', error.message);
    } finally {
      setFormBusy(form, false);
    }
  });

  document.getElementById('loginForm').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const receipt = captureBoloFormReceipt(form);
    const data = new FormData(form);
    setFormBusy(form, true);
    try {
      const result = await apiRequest('/api/public/login', {
        method: 'POST', body: JSON.stringify(Object.fromEntries(data.entries()))
      });
      receipt(true);
      renderAccount(result.account);
      closeModal(document.getElementById('authModal'));
      form.reset();
      showToast(`Welcome back, ${result.account.name.split(' ')[0]}!`, 'Your secure profile has been restored.');
    } catch (error) {
      receipt(false);
      showToast('Could not log in', error.message);
    } finally {
      setFormBusy(form, false);
    }
  });

  document.getElementById('logoutButton').addEventListener('click', async () => {
    try { await apiRequest('/api/public/logout', { method: 'POST', body: '{}' }); }
    catch (error) { showToast('Could not log out', error.message); return; }
    publicCsrf = '';
    document.getElementById('profileMenu').classList.remove('open');
    renderAccount(null);
    showToast('Logged out', 'Your account remains safely stored for the next login.');
  });
  renderAccount(null);
  apiRequest('/api/public/session').then(result => renderAccount(result.authenticated ? result.account : null)).catch(() => {});

  const quickDemoForm = document.getElementById('quickDemoForm');
  const quickDemoInput = document.getElementById('quickDemoInput');
  const quickDemoQuestion = document.getElementById('quickDemoQuestion');
  const quickDemoAnswer = document.getElementById('quickDemoAnswer');
  const quickDemoAction = document.getElementById('quickDemoAction');
  const quickDemoLink = document.getElementById('quickDemoLink');
  const quickDemoResult = question => {
    const value = question.toLowerCase();
    if (/contact|email|phone|call|sampark/.test(value)) return {
      answer: 'BoloSite found the contact section so the visitor can send website details or a message without searching for the right page.',
      label: 'Contact BoloSite', href: '/contact'
    };
    if (/text|chat|type|typing|keyboard|mic|microphone|private|noisy|fallback/.test(value)) return {
      answer: 'BoloSite lets visitors ask by voice or typing, so they can still get approved answers and next steps when speaking is not possible.',
      label: 'Speech or typing', href: '/what-is-bolosite'
    };
    if (/setup|add|install|script|kaise|website/.test(value)) return {
      answer: 'BoloSite connects to an existing website with one script. Then the owner approves business knowledge, actions, and usage controls before going live.',
      label: 'Setup path', href: '/owner'
    };
    if (/feature|language|hindi|english|action|voice/.test(value)) return {
      answer: 'BoloSite helps visitors ask naturally, receive answers from approved business content, and move toward approved website actions such as opening sections or forms.',
      label: 'How BoloSite helps', href: '/what-is-bolosite'
    };
    return {
      answer: 'BoloSite found pricing. It starts at ₹200 per month, then usage is based on real visitor requests.',
      label: 'Pricing', href: '/pricing'
    };
  };

  const hasInlineQuickDemo = document.querySelector('script[data-inline-quick-demo]');
  if (!hasInlineQuickDemo) quickDemoForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!quickDemoForm.reportValidity()) return;
    const question = quickDemoInput.value.trim();
    const result = quickDemoResult(question);
    quickDemoQuestion.textContent = `“${question}”`;
    quickDemoAnswer.textContent = result.answer;
    quickDemoAction.querySelector('strong').textContent = result.label;
    quickDemoLink.href = result.href;
    quickDemoAction.classList.remove('is-fresh');
    void quickDemoAction.offsetWidth;
    quickDemoAction.classList.add('is-fresh');
  });
  if (!hasInlineQuickDemo) document.querySelectorAll('[data-demo-question]').forEach(button => button.addEventListener('click', () => {
    quickDemoInput.value = button.dataset.demoQuestion;
    quickDemoForm.requestSubmit();
  }));

  const updateEstimate = () => {
    const requestsInput = document.getElementById('monthlyRequests');
    if (!requestsInput) return;
    const requests = Number(requestsInput.value);
    const total = 200 + requests;
    const price = document.getElementById('estimatePrice');
    const tier = document.getElementById('estimateTier');
    document.getElementById('monthlyRequestsValue').textContent = requests.toLocaleString('en-IN');
    price.innerHTML = `₹${total.toLocaleString('en-IN')} <em>/ month</em>`;
    tier.textContent = `₹200 base + ₹${requests.toLocaleString('en-IN')} requests`;
  };
  document.getElementById('monthlyRequests')?.addEventListener('input', updateEstimate);
  updateEstimate();

  const submitPublicForm = async (form, submissionType, payload) => {
    const receipt = captureBoloFormReceipt(form);
    setFormBusy(form, true);
    try {
      const result = await apiRequest('/api/public/submissions', {
        method: 'POST',
        body: JSON.stringify({ submission_type: submissionType, ...payload })
      });
      receipt(true);
      form.reset();
      showToast('Details received', result.message);
      return true;
    } catch (error) {
      receipt(false);
      showToast('Could not save details', error.message);
      return false;
    } finally {
      setFormBusy(form, false);
    }
  };

  document.getElementById('demoForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const saved = await submitPublicForm(form, 'trial', Object.fromEntries(data.entries()));
    if (saved) closeModal(document.getElementById('demoModal'));
  });

  document.getElementById('contactForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    await submitPublicForm(form, 'contact', {
      ...Object.fromEntries(data.entries()),
      audience_type: data.get('type')
    });
  });

  document.getElementById('feedbackForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const saved = await submitPublicForm(form, 'feedback', Object.fromEntries(data.entries()));
    if (saved) {
      sessionStorage.setItem('bolosite-feedback-seen', '1');
      closeModal(document.getElementById('feedbackModal'));
    }
  });

  const feedbackAlreadySeen = () => sessionStorage.getItem('bolosite-feedback-seen') === '1';
  window.setTimeout(() => {
    if (window.matchMedia('(pointer: coarse)').matches && !feedbackAlreadySeen() && !document.querySelector('.modal:not([hidden])')) {
      openModal(document.getElementById('feedbackModal'));
      sessionStorage.setItem('bolosite-feedback-seen', '1');
    }
  }, 55000);

  document.addEventListener('mouseout', event => {
    if (event.clientY > 6 || event.relatedTarget || feedbackAlreadySeen() || performance.now() < 25000) return;
    if (document.querySelector('.modal:not([hidden])')) return;
    sessionStorage.setItem('bolosite-feedback-seen', '1');
    openModal(document.getElementById('feedbackModal'));
  });
})();


(() => {
  const modeButtons = document.querySelectorAll('[data-mode-demo]');
  const screen = document.querySelector('.interaction-screen');
  if (!modeButtons.length || !screen) return;

  const content = {
    voice: {
      status: 'Listening when visitor allows mic',
      question: '“Show me the pricing plans.”',
      answer: 'I found the pricing section and opened it. You can compare plans from approved website information.',
      action: 'Approved action: Pricing opened',
      input: 'Voice active after permission'
    },
    text: {
      status: 'Text chat ready for private questions',
      question: '“Can you help me choose the right plan?”',
      answer: 'Yes. Tell me your need and I will guide you using the website owner’s approved product and pricing knowledge.',
      action: 'Approved action: Plan guidance started',
      input: 'Type your question privately'
    }
  };

  const setMode = mode => {
    const selected = content[mode] ? mode : 'voice';
    screen.dataset.interactionState = selected;
    modeButtons.forEach(button => {
      const active = button.dataset.modeDemo === selected;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    document.getElementById('modeDemoStatus').textContent = content[selected].status;
    document.getElementById('modeDemoQuestion').textContent = content[selected].question;
    document.getElementById('modeDemoAnswer').textContent = content[selected].answer;
    document.getElementById('modeDemoAction').textContent = content[selected].action;
    document.getElementById('modeDemoInputLabel').textContent = content[selected].input;
  };

  modeButtons.forEach(button => button.addEventListener('click', () => setMode(button.dataset.modeDemo)));
})();
