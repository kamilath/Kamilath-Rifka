const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
const progress = document.getElementById('progress');
const copyBtn = document.getElementById('copyEmail');
const copyMsg = document.getElementById('copyMsg');
const themeToggle = document.getElementById('themeToggle');

if (window.lucide) lucide.createIcons();

menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.innerHTML = open ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
  if (window.lucide) lucide.createIcons();
});

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = '<i data-lucide="menu"></i>';
    if (window.lucide) lucide.createIcons();
  });
});

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
document.getElementById('year').textContent = new Date().getFullYear();

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('kamilathrifka@gmail.com');
    copyMsg.textContent = 'Copied!';
  } catch {
    copyMsg.textContent = 'Email: kamilathrifka@gmail.com';
  }
  setTimeout(() => { copyMsg.textContent = ''; }, 2200);
});

// Theme toggle: remembers the visitor's choice for their next visit.
const savedTheme = localStorage.getItem('kamilath-theme');
if (savedTheme === 'dark') document.body.dataset.theme = 'dark';
function syncThemeButton() {
  const dark = document.body.dataset.theme === 'dark';
  themeToggle.innerHTML = dark
    ? '<i data-lucide="sun"></i><span>Light mode</span>'
    : '<i data-lucide="moon"></i><span>Dark mode</span>';
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  if (window.lucide) lucide.createIcons();
}
syncThemeButton();
themeToggle.addEventListener('click', () => {
  const dark = document.body.dataset.theme !== 'dark';
  if (dark) document.body.dataset.theme = 'dark';
  else delete document.body.dataset.theme;
  localStorage.setItem('kamilath-theme', dark ? 'dark' : 'light');
  syncThemeButton();
});

// Decorative animated network: nodes drift and connect like a test system map.
(() => {
  const canvas = document.getElementById('networkCanvas');
  const host = canvas?.parentElement;
  if (!canvas || !host) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0, height = 0, frame = 0;
  let points = [];
  const palette = ['155, 132, 255', '255, 126, 205', '77, 213, 185'];
  function resize() {
    const box = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = box.width + 44; height = box.height + 44;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(22, Math.min(48, Math.round(width / 15)));
    points = Array.from({length: count}, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
      r: Math.random() * 1.8 + .8, color: palette[Math.floor(Math.random() * palette.length)]
    }));
    if (reduceMotion) draw(false);
  }
  function draw(animate = true) {
    ctx.clearRect(0, 0, width, height);
    const maxDist = Math.min(125, width * .24);
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      if (animate) { a.x += a.vx; a.y += a.vy; }
      if (a.x < 0 || a.x > width) a.vx *= -1;
      if (a.y < 0 || a.y > height) a.vy *= -1;
      for (let j = i + 1; j < points.length; j++) {
        const b = points[j], dx = a.x - b.x, dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);
        if (distance < maxDist) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(155,140,220,${(1 - distance / maxDist) * .22})`;
          ctx.lineWidth = .7; ctx.stroke();
        }
      }
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${a.color},.58)`; ctx.fill();
    }
    if (animate && !document.hidden) frame = requestAnimationFrame(() => draw(true));
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  if (!reduceMotion) frame = requestAnimationFrame(() => draw(true));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else if (!reduceMotion) frame = requestAnimationFrame(() => draw(true));
  });
})();

// Animate numeric highlights when they enter view, without changing their values.
(() => {
  const values = document.querySelectorAll('.proof-strip strong');
  if (!('IntersectionObserver' in window)) return;
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const original = el.textContent.trim();
      const match = original.match(/^(\d+)(.*)$/);
      if (match) {
        const target = Number(match[1]);
        const suffix = match[2];
        const duration = 850;
        const start = performance.now();
        el.classList.add('count-ready');
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = `${Math.round(target * eased)}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = original;
        }
        requestAnimationFrame(tick);
      }
      counterObserver.unobserve(el);
    });
  }, {threshold: .6});
  values.forEach(el => counterObserver.observe(el));
})();

// Small pointer tilt on desktop cards; disabled for touch and reduced-motion users.
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.skill-card, .project-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(850px) rotateX(${y * -3}deg) rotateY(${x * 3}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

// The terminal's Run button plays a local demo only; it does not execute real tests.
const runTestsButton = document.getElementById('runTests');
if (runTestsButton) {
  runTestsButton.addEventListener('click', () => {
    const result = document.getElementById('terminalResult');
    const text = document.getElementById('testResultText');
    const time = document.getElementById('testResultTime');
    if (!result || !text || !time || runTestsButton.disabled) return;
    runTestsButton.disabled = true;
    runTestsButton.innerHTML = '<i data-lucide="loader-circle"></i> Running';
    if (window.lucide) lucide.createIcons();
    result.classList.remove('is-failed'); result.classList.add('is-running');
    text.textContent = 'Running sample checks…'; time.textContent = 'please wait';
    window.setTimeout(() => {
      result.classList.remove('is-running');
      text.textContent = '3 sample checks passed'; time.textContent = 'demo complete';
      runTestsButton.disabled = false;
      runTestsButton.innerHTML = '<i data-lucide="rotate-ccw"></i> Run again';
      if (window.lucide) lucide.createIcons();
    }, 1150);
  });
}
