/* ============================================================
   LSE — Engenharia Construtiva · app.js
   Zero dependência externa. Motor de movimento próprio.
   Calibragem da casa: movimento curto, easing longo, sem bounce.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 0. Constantes de contato ----------------------------------
     ⚠️ PLACEHOLDER: a proposta comercial traz o WhatsApp truncado
     ("9 9973-32"). Trocar WA_NUMBER pelo número real (formato 55DDNNNNNNNNN)
     — é o ÚNICO ponto do site onde o número aparece. */
  var WA_NUMBER = '5541999999999';           // [[PLACEHOLDER — WHATSAPP REAL]]
  var WA_BASE = 'Olá! Vim pelo site da LSE';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. WhatsApp ------------------------------------------------ */
  function waHref(subject) {
    var txt = WA_BASE + (subject ? '. Preciso de: ' + subject + '.' : '.');
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(txt);
  }
  $$('[data-wa-btn]').forEach(function (el) {
    el.setAttribute('href', waHref(el.getAttribute('data-wa-btn')));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  /* ---------- 2. Header de duas faixas ----------------------------------- */
  var header = $('.site-header');
  if (header) {
    var onScrollHeader = function () {
      header.setAttribute('data-condensed', window.scrollY > 40 ? 'true' : 'false');
    };
    onScrollHeader();
    window.addEventListener('scroll', onScrollHeader, { passive: true });
  }

  /* ---------- 3. Menu off-canvas ----------------------------------------- */
  var toggle = $('.nav-toggle');
  var menu = $('.nav-menu');
  var backdrop = $('.nav-backdrop');
  function syncMenuInert() {
    if (!menu) return;
    var closedMobile = window.innerWidth <= 900 && !document.body.classList.contains('nav-open');
    menu.setAttribute('aria-hidden', String(closedMobile));
    // `inert` reforça o que o visibility:hidden já faz: nada dentro do painel
    // fechado é focável por Tab (conteúdo focável sob aria-hidden é falha WCAG).
    if (closedMobile) menu.setAttribute('inert', '');
    else menu.removeAttribute('inert');
  }
  function setMenu(open) {
    document.body.classList.toggle('nav-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    syncMenuInert();
    document.body.style.overflow = open ? 'hidden' : '';
    if (open && menu) { var a = menu.querySelector('a'); if (a) a.focus(); }
  }
  if (toggle) toggle.addEventListener('click', function () {
    setMenu(!document.body.classList.contains('nav-open'));
  });
  if (backdrop) backdrop.addEventListener('click', function () { setMenu(false); });
  if (menu) menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      setMenu(false);
      if (toggle) toggle.focus();
    }
  });
  // trava de foco dentro do menu aberto
  if (menu) menu.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !document.body.classList.contains('nav-open')) return;
    var f = $$('a[href],button:not([disabled])', menu);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900 && document.body.classList.contains('nav-open')) setMenu(false);
    syncMenuInert();
  });
  syncMenuInert();

  /* ---------- 4. Reveals -------------------------------------------------
     Três camadas de gatilho (armadilha nº2 e nº3 do sistema de movimento):
     (a) primeira tela por timer, (b) IntersectionObserver, (c) flush em saltos. */
  var revealables = $$('[data-reveal],.rule');
  function show(el) { el.classList.add('is-in'); }
  if (reduce.matches || !('IntersectionObserver' in window)) {
    revealables.forEach(show);
  } else {
    document.documentElement.setAttribute('data-motion', 'on');
    // stagger automático entre irmãos diretos
    var byParent = new Map();
    revealables.forEach(function (el) {
      if (!el.hasAttribute('data-reveal')) return;
      var p = el.parentNode;
      if (!byParent.has(p)) byParent.set(p, 0);
      var i = byParent.get(p);
      if (i > 0) el.style.transitionDelay = Math.min(i, 6) * 80 + 'ms';
      byParent.set(p, i + 1);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    revealables.forEach(function (el) { io.observe(el); });

    // (a) primeira tela — não depende de observer (aba de fundo)
    var firstPaint = function () {
      revealables.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.94) show(el);
      });
    };
    requestAnimationFrame(firstPaint);
    setTimeout(firstPaint, 140);

    // (c) salto de scroll (âncora/hash/arrasto da barra) não gera callback
    var flush = function () {
      var lim = window.innerHeight * 0.3;
      revealables.forEach(function (el) {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().bottom < lim) {
          el.style.transition = 'none'; show(el);
        }
      });
    };
    window.addEventListener('scroll', flush, { passive: true });
  }

  /* ---------- 5. Contadores ---------------------------------------------- */
  $$('[data-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-count-suffix') || '';
    if (reduce.matches || !('IntersectionObserver' in window) || isNaN(target)) return;
    var done = false;
    var ob = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting || done) return;
      done = true; ob.disconnect();
      var t0 = performance.now(), dur = 1600;
      (function tick(now) {
        var p = Math.min((now - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);            // easeOutCubic
        el.textContent = Math.round(target * e) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.4 });
    ob.observe(el);
  });

  /* ---------- 6. Passo a passo do CTA ------------------------------------ */
  var steps = $('.steps');
  if (steps) {
    if (reduce.matches || !('IntersectionObserver' in window)) {
      steps.setAttribute('data-on', 'true');
    } else {
      var so = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { steps.setAttribute('data-on', 'true'); so.disconnect(); }
      }, { threshold: 0.25 });
      so.observe(steps);
    }
  }

  /* ---------- 7. Parallax das faixas de imagem (≤0.12) ------------------- */
  var bands = $$('.imgband-media');
  if (bands.length && !reduce.matches && window.matchMedia('(min-width: 700px)').matches) {
    var ticking = false;
    var moveBands = function () {
      bands.forEach(function (m) {
        var r = m.parentNode.getBoundingClientRect();
        if (r.bottom < -80 || r.top > window.innerHeight + 80) return;
        var mid = r.top + r.height / 2 - window.innerHeight / 2;
        m.style.transform = 'translate3d(0,' + (-mid * 0.1).toFixed(1) + 'px,0)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(moveBands); }
    }, { passive: true });
    moveBands();
  }

  /* ---------- 8. Scroll suave com inércia (lerp) -------------------------
     Arquitetura A do sistema-de-movimento §4: html{scroll-behavior:auto} e
     todo o scroll suave — roda do mouse, teclado e âncoras — fica com o JS.
     Sem biblioteca: usa o scroll real da janela, então position:sticky,
     :target e a barra do navegador continuam funcionando. */
  var EASE = 0.1;                                   // faixa testada: 0.09–0.105
  var lerpOn = !reduce.matches &&
               window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var target = window.scrollY, current = window.scrollY, running = false;

  function maxScroll() { return document.documentElement.scrollHeight - window.innerHeight; }
  function clampY(v) { return Math.max(0, Math.min(v, maxScroll())); }
  function overlayOpen() { return document.body.style.overflow === 'hidden'; }

  // não sequestra a roda quando o cursor está sobre área rolável própria
  function scrollableUnder(node) {
    for (var i = 0; node && node.nodeType === 1 && i < 8; i++, node = node.parentElement) {
      if (node === document.body || node === document.documentElement) break;
      var cs = getComputedStyle(node);
      if (/(auto|scroll)/.test(cs.overflowY) && node.scrollHeight > node.clientHeight + 2) return true;
      if (/(auto|scroll)/.test(cs.overflowX) && node.scrollWidth > node.clientWidth + 2) return true;
    }
    return false;
  }

  function loop() {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.4) {
      current = target; running = false;
      window.scrollTo(0, Math.round(current));
      return;
    }
    window.scrollTo(0, Math.round(current));
    requestAnimationFrame(loop);
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }
  function sync() { if (!running) { target = current = window.scrollY; } }

  if (lerpOn) {
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || overlayOpen() || scrollableUnder(e.target)) return;  // zoom, modal, carrossel
      e.preventDefault();
      if (!running) current = window.scrollY;
      target = clampY(target + e.deltaY * (e.deltaMode === 1 ? 18 : 1));
      kick();
    }, { passive: false });

    window.addEventListener('keydown', function (e) {
      var t = e.target;
      if (overlayOpen()) return;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (t && t.isContentEditable) return;
      if (e.key === ' ' && t && t.closest && t.closest('a,button,summary,[role="button"]')) return;
      var vh = window.innerHeight, d = null;
      if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) d = vh * 0.86;
      else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) d = -vh * 0.86;
      else if (e.key === 'ArrowDown') d = 90;
      else if (e.key === 'ArrowUp') d = -90;
      else if (e.key === 'Home') { e.preventDefault(); current = window.scrollY; target = 0; kick(); return; }
      else if (e.key === 'End') { e.preventDefault(); current = window.scrollY; target = maxScroll(); kick(); return; }
      if (d === null) return;
      e.preventDefault();
      if (!running) current = window.scrollY;
      target = clampY(target + d);
      kick();
    });

    // barra do navegador, scroll do teclado nativo, restauração de posição
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
  }

  function headerH() { return header ? header.getBoundingClientRect().height : 0; }
  function smoothTo(y) {
    y = clampY(y);
    if (reduce.matches) { window.scrollTo(0, y); return; }
    if (lerpOn) { if (!running) current = window.scrollY; target = y; kick(); return; }
    // touch / ponteiro grosso: tween por duração (o momentum nativo continua nativo)
    var start = window.scrollY, dist = y - start;
    if (Math.abs(dist) < 2) return;
    var dur = Math.min(1000, 320 + Math.abs(dist) * 0.34), t0 = performance.now();
    (function tick(now) {
      var p = Math.min((now - t0) / dur, 1);
      var e = p < 0.5 ? 8 * p * p * p * p : 1 - Math.pow(-2 * p + 2, 4) / 2;  // easeInOutQuart
      window.scrollTo(0, start + dist * e);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var t = document.getElementById(id.slice(1));
      if (!t) return;
      e.preventDefault();
      var delay = document.body.classList.contains('nav-open') ? 420 : 0;
      setTimeout(function () {
        smoothTo(Math.max(0, t.getBoundingClientRect().top + window.scrollY - headerH() - 16));
        history.replaceState(null, '', id);
      }, delay);
    });
  });

  /* ---------- 9. Scrollspy ----------------------------------------------- */
  var spyLinks = $$('.nav-menu a[href^="#"]');
  if (spyLinks.length && 'IntersectionObserver' in window) {
    var targets = spyLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
                          .filter(Boolean);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        spyLinks.forEach(function (a) {
          a.setAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id ? 'true' : 'false');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(function (t) { spy.observe(t); });
  }

  /* ---------- 10. Comparador antes/depois -------------------------------- */
  $$('.cmp').forEach(function (cmp) {
    var range = $('.cmp-range', cmp);
    if (!range) return;
    var apply = function (v) { cmp.style.setProperty('--pos', v + '%'); };
    apply(range.value);
    range.addEventListener('input', function () { apply(range.value); });
  });
  // troca de caso (tablist)
  var cmpTabs = $$('.cmp-switch button');
  cmpTabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      cmpTabs.forEach(function (b) {
        var on = b === btn;
        b.setAttribute('aria-selected', String(on));
        b.setAttribute('tabindex', on ? '0' : '-1');
        var panel = document.getElementById(b.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    });
    btn.addEventListener('keydown', function (e) {
      var i = cmpTabs.indexOf(btn), n = null;
      if (e.key === 'ArrowRight') n = cmpTabs[(i + 1) % cmpTabs.length];
      if (e.key === 'ArrowLeft')  n = cmpTabs[(i - 1 + cmpTabs.length) % cmpTabs.length];
      if (!n) return;
      e.preventDefault(); n.focus(); n.click();
    });
  });

  /* ---------- 11. Lightbox de galeria por obra --------------------------- */
  var lb = $('#lightbox');
  if (lb) {
    var lbImg = $('.lb-stage img', lb),
        lbTitle = $('.lb-title', lb),
        lbCounter = $('.lb-counter', lb),
        lbCaption = $('.lb-caption', lb),
        lbPrev = $('.lb-nav.is-prev', lb),
        lbNext = $('.lb-nav.is-next', lb),
        lbClose = $('.lb-close', lb);
    var shots = [], caps = [], idx = 0, opener = null;

    function render() {
      lbImg.setAttribute('src', shots[idx]);
      lbImg.setAttribute('alt', caps[idx] || '');
      lbCaption.textContent = caps[idx] || '';
      lbCounter.textContent = (idx + 1) + ' / ' + shots.length;
      var many = shots.length > 1;
      lbPrev.hidden = !many; lbNext.hidden = !many;
    }
    function open(card) {
      shots = (card.getAttribute('data-gallery') || '').split('|').filter(Boolean);
      caps  = (card.getAttribute('data-captions') || '').split('|');
      if (!shots.length) return;
      opener = card; idx = 0;
      lbTitle.textContent = card.getAttribute('data-title') || '';
      render();
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }
    function close() {
      lb.hidden = true;
      document.body.style.overflow = '';
      if (opener) opener.focus();
    }
    function go(step) { idx = (idx + step + shots.length) % shots.length; render(); }

    $$('.pf-card').forEach(function (c) {
      c.addEventListener('click', function () { open(c); });
    });
    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click', function () { go(-1); });
    lbNext.addEventListener('click', function () { go(1); });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lb-stage')) close();
    });
    window.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'ArrowRight' && shots.length > 1) { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft'  && shots.length > 1) { e.preventDefault(); go(-1); }
      if (e.key === 'Tab') {                                  // trava de foco
        var f = $$('button:not([hidden])', lb);
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- 12. Banner de cookies (LGPD) -------------------------------
     O consentimento emite evento no dataLayer para as tags respeitarem a LGPD. */
  var KEY = 'lse_consent_v1';
  var bar = $('#cookie-bar');
  window.dataLayer = window.dataLayer || [];
  function pushConsent(granted) {
    window.dataLayer.push({
      event: granted ? 'cookie_consent_granted' : 'cookie_consent_denied',
      consent_analytics: granted ? 'granted' : 'denied',
      consent_marketing: granted ? 'granted' : 'denied'
    });
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
        ad_storage:        granted ? 'granted' : 'denied',
        ad_user_data:      granted ? 'granted' : 'denied',
        ad_personalization:granted ? 'granted' : 'denied'
      });
    }
  }
  if (bar) {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (err) { saved = null; }
    if (saved === 'granted' || saved === 'denied') {
      pushConsent(saved === 'granted');
    } else {
      bar.hidden = false;
    }
    $$('[data-consent]', bar).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var granted = btn.getAttribute('data-consent') === 'granted';
        try { localStorage.setItem(KEY, granted ? 'granted' : 'denied'); } catch (err) {}
        pushConsent(granted);
        bar.hidden = true;
      });
    });
  }

  /* ---------- 13. Ano do rodapé ------------------------------------------ */
  var y = $('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
