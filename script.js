// Появление блоков при скролле
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Счётчики
document.querySelectorAll('[data-count]').forEach((el) => {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const decimals = el.dataset.count.includes('.') ? 1 : 0;
  const obs = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    obs.disconnect();
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  obs.observe(el);
});

// Слайдеры с красными стрелками
document.querySelectorAll('[data-slider]').forEach((root) => {
  const track = root.querySelector('.slider-track');
  const n = track.children.length;
  let i = 0;
  const go = (to) => {
    i = (to + n) % n;
    track.style.transform = `translateX(${-i * 100}%)`;
  };
  root.querySelector('.prev').addEventListener('click', () => go(i - 1));
  root.querySelector('.next').addEventListener('click', () => go(i + 1));

  // Свайп; после свайпа клик по ссылке не срабатывает
  let startX = null;
  let swiped = false;
  track.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    swiped = false;
  });
  track.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) {
      swiped = true;
      go(i + (dx < 0 ? 1 : -1));
    }
    startX = null;
  });
  track.addEventListener('click', (e) => {
    if (swiped) e.preventDefault();
  });
  track.addEventListener('dragstart', (e) => e.preventDefault());
});

document.getElementById('year').textContent = new Date().getFullYear();
