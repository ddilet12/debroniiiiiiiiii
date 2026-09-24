// Мобильное меню
const burger = document.querySelector('.burger');
const mobileMenu = document.querySelector('.mobile-menu');
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') === 'true';
  burger.setAttribute('aria-expanded', String(!open));
  mobileMenu.classList.toggle('open', !open);
});
mobileMenu.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
  })
);

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
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  io.observe(el);
});

// Счётчики в статистике
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
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  obs.observe(el);
});

// Карусель
document.querySelectorAll('[data-carousel]').forEach((root) => {
  const stage = root.querySelector('.carousel-stage');
  const cards = [...stage.children];
  const dotsWrap = root.querySelector('.carousel-dots');
  const n = cards.length;
  let active = 0;
  let timer;

  const dots = cards.map((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Слайд ${i + 1}`);
    b.addEventListener('click', () => go(i));
    dotsWrap.appendChild(b);
    return b;
  });

  function render() {
    const step = cards[0].offsetWidth + 24;
    cards.forEach((card, i) => {
      let off = i - active;
      if (off > n / 2) off -= n;
      if (off < -n / 2) off += n;
      const abs = Math.abs(off);
      card.style.transform = `translateX(${off * step}px) scale(${abs === 0 ? 1.06 : 0.92})`;
      card.style.opacity = abs > 2 ? 0 : abs === 2 ? 0.5 : 1;
      card.style.zIndex = 10 - abs;
      card.style.pointerEvents = abs > 2 ? 'none' : '';
      card.classList.toggle('active', abs === 0);
      card.tabIndex = abs === 0 ? 0 : -1;
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === active));
  }

  function go(i) {
    active = (i + n) % n;
    render();
    restart();
  }

  function restart() {
    clearInterval(timer);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timer = setInterval(() => go(active + 1), 4500);
    }
  }

  root.querySelector('.prev').addEventListener('click', () => go(active - 1));
  root.querySelector('.next').addEventListener('click', () => go(active + 1));

  // Клик по боковой карточке листает к ней, а не открывает ссылку
  cards.forEach((card, i) =>
    card.addEventListener('click', (e) => {
      if (i !== active || dragged) {
        e.preventDefault();
        if (!dragged) go(i);
      }
    })
  );

  // Свайп
  let startX = null;
  let dragged = false;
  stage.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    dragged = false;
  });
  stage.addEventListener('pointermove', (e) => {
    if (startX !== null && Math.abs(e.clientX - startX) > 10) dragged = true;
  });
  stage.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
    startX = null;
    setTimeout(() => (dragged = false), 0);
  });
  stage.addEventListener('dragstart', (e) => e.preventDefault());

  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', restart);
  window.addEventListener('resize', render);

  render();
  restart();
});

document.getElementById('year').textContent = new Date().getFullYear();
