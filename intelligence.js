(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const body = document.body;
  const initScreen = document.querySelector('.init-screen');
  const finishIntro = () => {
    if (!initScreen) return;
    initScreen.classList.add('is-complete');
    body.classList.add('intelligence-ready');
    window.setTimeout(() => initScreen.remove(), 450);
  };

  if (initScreen) {
    const skip = initScreen.querySelector('.init-skip');
    skip?.addEventListener('click', finishIntro);
    window.setTimeout(finishIntro, reduceMotion ? 0 : 600);
  }

  const progress = document.querySelector('.intel-progress');
  const progressButtons = [...document.querySelectorAll('[data-progress]')];
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    const active = Math.min(6, Math.floor(ratio * 7.01));
    body.dataset.intelligenceStage = active;
    progressButtons.forEach((button, index) => button.classList.toggle('is-active', index === active));
  };
  progressButtons.forEach((button) => button.addEventListener('click', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * (Number(button.dataset.progress) / 6), behavior: reduceMotion ? 'auto' : 'smooth' });
  }));
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });

  const sections = document.querySelectorAll('[data-intelligence]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-correlated');
    }), { threshold: .18 });
    sections.forEach((section) => observer.observe(section));
  } else sections.forEach((section) => section.classList.add('is-correlated'));

  const nodes = document.querySelectorAll('.node');
  nodes.forEach((node) => {
    node.setAttribute('tabindex', '0');
    node.addEventListener('mouseenter', () => body.classList.add('signal-focus'));
    node.addEventListener('mouseleave', () => body.classList.remove('signal-focus'));
    node.addEventListener('focus', () => body.classList.add('signal-focus'));
    node.addEventListener('blur', () => body.classList.remove('signal-focus'));
  });

  if (!coarsePointer && !reduceMotion) {
    const cursor = document.createElement('span');
    const cursorRing = document.createElement('span');
    cursor.className = 'precision-cursor';
    cursorRing.className = 'precision-cursor-ring';
    body.append(cursor, cursorRing);
    window.addEventListener('pointermove', (event) => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      cursorRing.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    }, { passive: true });
    document.querySelectorAll('a, button, .node, .card, .cert').forEach((element) => {
      element.addEventListener('mouseenter', () => body.classList.add('cursor-interactive'));
      element.addEventListener('mouseleave', () => body.classList.remove('cursor-interactive'));
    });
  }

  const canvas = document.querySelector('.intelligence-canvas');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  const network = [
    { label: 'THREAT INTELLIGENCE', x: .76, y: .2 },
    { label: 'DIGITAL RISK', x: .88, y: .47 },
    { label: 'ATTACK SURFACE', x: .67, y: .73 },
    { label: 'SECURITY OPERATIONS', x: .38, y: .8 },
    { label: 'INCIDENT RESPONSE', x: .22, y: .55 },
    { label: 'SECURITY AWARENESS', x: .3, y: .23 },
    { label: 'GOVERNANCE', x: .55, y: .43 }
  ];
  let width = 0;
  let height = 0;
  let pointer = { x: -1000, y: -1000 };
  let animationFrame;
  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = bounds.width;
    height = bounds.height;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  const draw = (time) => {
    context.clearRect(0, 0, width, height);
    const points = network.map((node, index) => ({ ...node, px: node.x * width, py: node.y * height + Math.sin(time * .0004 + index) * 5 }));
    points.forEach((point, index) => points.slice(index + 1).forEach((other) => {
      const distance = Math.hypot(point.px - other.px, point.py - other.py);
      if (distance > width * .42) return;
      const nearPointer = Math.hypot(pointer.x - point.px, pointer.y - point.py) < 150 || Math.hypot(pointer.x - other.px, pointer.y - other.py) < 150;
      context.strokeStyle = nearPointer ? 'rgba(180, 227, 111, .32)' : 'rgba(180, 227, 111, .09)';
      context.lineWidth = nearPointer ? 1.2 : .7;
      context.beginPath(); context.moveTo(point.px, point.py); context.lineTo(other.px, other.py); context.stroke();
    }));
    points.forEach((point) => {
      const active = Math.hypot(pointer.x - point.px, pointer.y - point.py) < 150;
      context.fillStyle = active ? '#b4e36f' : 'rgba(180, 227, 111, .62)';
      context.beginPath(); context.arc(point.px, point.py, active ? 3.5 : 2, 0, Math.PI * 2); context.fill();
      if (active) {
        context.fillStyle = 'rgba(220, 236, 220, .72)';
        context.font = '10px IBM Plex Mono, monospace';
        context.fillText(point.label, point.px + 9, point.py - 8);
      }
    });
    animationFrame = window.requestAnimationFrame(draw);
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });
  canvas.addEventListener('pointermove', (event) => {
    const bounds = canvas.getBoundingClientRect();
    pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }, { passive: true });
  canvas.addEventListener('pointerleave', () => { pointer = { x: -1000, y: -1000 }; });
  const visibility = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !animationFrame) animationFrame = window.requestAnimationFrame(draw);
    if (!entry.isIntersecting && animationFrame) { window.cancelAnimationFrame(animationFrame); animationFrame = null; }
  });
  visibility.observe(canvas);
})();
