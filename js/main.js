(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  // Lade-Moment: Foto und Name erscheinen einmal, orchestriert
  function loaded() { requestAnimationFrame(function () { root.classList.add('is-loaded'); }); }
  var heroImg = document.querySelector('.hero__photo img');
  if (heroImg && !heroImg.complete) {
    heroImg.addEventListener('load', loaded, { once: true });
    heroImg.addEventListener('error', loaded, { once: true });
    setTimeout(loaded, 1200);
  } else { loaded(); }

  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('menu');
  var hero = document.querySelector('.hero');
  var timeline = document.querySelector('.timeline');

  function onScroll() {
    // Navigation: hell über dem dunklen Hero, danach als Leiste
    var threshold = hero ? hero.offsetHeight - nav.offsetHeight - 10 : 10;
    nav.classList.toggle('is-scrolled', window.scrollY > threshold);

    // Zeitleiste füllt sich beim Lesen
    if (timeline) {
      var r = timeline.getBoundingClientRect();
      var start = window.innerHeight * 0.65;
      var p = (start - r.top) / r.height;
      timeline.style.setProperty('--progress', Math.max(0, Math.min(1, p)).toFixed(3));
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // Mobile-Menü
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
    menu.classList.toggle('is-open', open);
    nav.classList.toggle('menu-open', open);
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // Aktiven Menüpunkt markieren
  var links = Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });
  }

  var now = new Date();
  document.getElementById('year').textContent = now.getFullYear();

  // Alter automatisch berechnen (Geburtstag: 26.05.2001)
  var age = now.getFullYear() - 2001 - ((now.getMonth() < 4 || (now.getMonth() === 4 && now.getDate() < 26)) ? 1 : 0);
  document.querySelectorAll('[data-age]').forEach(function (el) { el.textContent = age; });
})();
