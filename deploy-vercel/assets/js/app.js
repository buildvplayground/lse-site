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
  // mesma condição do CSS (@media max-width:56.25em). Em `em`, para acompanhar
  // o tamanho de fonte do navegador — senão CSS e JS discordam sobre "é mobile?"
  // quando o usuário amplia o texto, e o painel fechado volta a ser focável.
  var mqMobile = window.matchMedia('(max-width: 56.25em)');
  var toggle = $('.nav-toggle');
  var menu = $('.nav-menu');
  var backdrop = $('.nav-backdrop');
  function syncMenuInert() {
    if (!menu) return;
    var closedMobile = mqMobile.matches && !document.body.classList.contains('nav-open');
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
  if (mqMobile.addEventListener) mqMobile.addEventListener('change', syncMenuInert);
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
    if (!mqMobile.matches && document.body.classList.contains('nav-open')) setMenu(false);
    syncMenuInert();
  });
  syncMenuInert();

  /* =====================================================================
     4. MOTOR DE MOVIMENTO
     Gate + 4 vocabulários (reveal, cortina, título palavra a palavra,
     stagger de grade), contadores, parallax e barra de leitura.

     Regra de ouro do projeto: **nenhuma entrada pode acontecer no fim do
     scroll**. Um bloco que só cruzaria a linha de gatilho depois do fim
     da página nunca animaria; e um bloco ainda animando quando o usuário
     chega ao rodapé passa sensação de site travado. As duas coisas são
     tratadas em `bottomGuard()`.
     ===================================================================== */

  var motionOn = !reduce.matches && 'IntersectionObserver' in window;

  /* --- 4.1 preparação da marcação ------------------------------------ */

  // Divide um título em palavras mascaradas. Só em texto puro: um heading
  // com <strong>/<br>/ícone é deixado como está para não quebrar marcação.
  function splitWords(el) {
    if (el.dataset.split === 'done') return false;
    var kids = Array.prototype.slice.call(el.childNodes);
    if (!kids.length || kids.some(function (n) { return n.nodeType !== 3; })) return false;
    var raw = el.textContent;
    if (raw.length > 160) return false;
    // colapsa só espaço ASCII/quebra de linha — o   das amarras precisa sobreviver
    var words = raw.replace(/[\t\n\r ]+/g, ' ').trim().split(' ').filter(Boolean);
    if (words.length < 2 || words.length > 22) return false;
    var frag = document.createDocumentFragment();
    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'w';
      var it = document.createElement('span');
      it.textContent = w;
      it.style.setProperty('--i', i);
      span.appendChild(it);
      frag.appendChild(span);
      if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
    });
    el.textContent = '';
    el.appendChild(frag);
    el.dataset.split = 'done';
    return true;
  }

  if (motionOn) {
    document.documentElement.setAttribute('data-motion', 'on');

    // títulos que carregam o movimento da seção
    $$('.hero h1, .section-title, .doc h1').forEach(function (h) {
      if (splitWords(h)) {
        var holder = h.closest('.section-head, .split-body, .hero-inner, .doc') || h;
        if (!holder.hasAttribute('data-reveal')) holder.setAttribute('data-reveal', 'soft');
      }
    });

    // grades e faixas entram escalonadas, com índice explícito (nada de nth-child)
    $$('.pf-grid, .creds-grid, .incl, .ref-list, .svc-grid, .doc-cards, .contrast-list, .creds-formacao')
      .forEach(function (g) {
        if (g.hasAttribute('data-reveal')) g.removeAttribute('data-reveal');
        g.setAttribute('data-stagger', '');
        Array.prototype.forEach.call(g.children, function (ch, i) {
          ch.style.setProperty('--i', Math.min(i, 8));
        });
      });
  }

  /* --- 4.2 gatilhos --------------------------------------------------- */

  var animated = $$('[data-reveal],[data-stagger],.rule');

  function show(el) { el.classList.add('is-in'); }

  // Leva o elemento ao estado final SEM animar — inclusive as palavras do
  // título e os filhos escalonados, que têm transição própria (por isso a
  // classe, e não style.transition: só ela alcança os descendentes).
  function settle(el) {
    if (el.classList.contains('is-in') && el.classList.contains('is-done')) return;
    el.classList.add('is-instant', 'is-in');
    void el.offsetWidth;                       // aplica o "none" antes de soltar
    el.classList.add('is-done');
    requestAnimationFrame(function () { el.classList.remove('is-instant'); });
  }

  if (!motionOn) {
    animated.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    /* Duas linhas de gatilho, porque texto e imagem têm tempos diferentes:

       TEXTO  — dispara quando já entrou 12% na tela: animar um parágrafo ainda
                colado na borda inferior faz o usuário ler algo que se mexe.
       MÍDIA  — dispara 8% ANTES de entrar, e a cortina dura 0,7s; se ela só
                começasse quando a figura aparece, a imagem terminaria de abrir
                quando o usuário já tivesse passado por ela (era o caso das duas
                figuras `.split-media`, visíveis só ~260px depois de entrarem). */
    function reveal(en, obs) {
      if (!en.isIntersecting) return;
      var el = en.target;
      obs.unobserve(el);
      var img = el.matches('[data-reveal="mask"]') ? el.querySelector('img') : null;
      // não abre a cortina sobre uma imagem que ainda não decodificou
      if (img && !(img.complete && img.naturalWidth > 0)) {
        var fired = false;
        var go = function () { if (!fired) { fired = true; show(el); } };
        img.addEventListener('load', go, { once: true });
        img.addEventListener('error', go, { once: true });
        setTimeout(go, 900);                      // rede lenta não deixa buraco
        return;
      }
      show(el);
    }

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { reveal(en, io); });
    }, { threshold: 0.08, rootMargin: '0px 0px -12% 0px' });

    var ioMedia = new IntersectionObserver(function (es) {
      es.forEach(function (en) { reveal(en, ioMedia); });
    }, { threshold: 0, rootMargin: '0px 0px 8% 0px' });

    /* Pré-aquecimento: uma imagem `lazy` só começa a baixar quando o Chrome
       decide, e a cortina ficava esperando o `load` — era esse o atraso real.
       800px antes já dá tempo de decodificar sem custar nada no carregamento. */
    if ('IntersectionObserver' in window) {
      var ioWarm = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return;
          var img = en.target.querySelector('img');
          if (img && img.loading === 'lazy') img.loading = 'eager';
          ioWarm.unobserve(en.target);
        });
      }, { rootMargin: '0px 0px 800px 0px' });
      $$('[data-reveal="mask"]').forEach(function (el) { ioWarm.observe(el); });
    }

    function isMedia(el) {
      return el.matches('[data-reveal="mask"], figure, .imgband, .pf-thumb') ||
             !!el.querySelector('img');
    }
    animated.forEach(function (el) { (isMedia(el) ? ioMedia : io).observe(el); });

    // (a) primeira tela entra por timer — IntersectionObserver e rAF não
    //     rodam em aba de fundo, e o hero não pode ficar invisível por isso
    function firstPaint() {
      var lim = window.innerHeight * 0.92;
      animated.forEach(function (el) {
        if (el.getBoundingClientRect().top < lim) { show(el); io.unobserve(el); ioMedia.unobserve(el); }
      });
      var hero = $('.hero');
      if (hero) hero.classList.add('is-lit');
    }
    requestAnimationFrame(firstPaint);
    setTimeout(firstPaint, 140);

    /* (b) GUARDA DE FIM DE SCROLL
       Dois casos que o observer sozinho não resolve:
       1. bloco cuja linha de gatilho fica além do scroll máximo — nunca
          cruzaria nada; revelamos assim que ele entra de fato na tela;
       2. usuário no fim da página — nada pode estar entrando ainda, então
          o que sobrou aparece sem animação.                              */
    function bottomGuard() {
      var y = window.scrollY;
      var vh = window.innerHeight;
      var max = document.documentElement.scrollHeight - vh;
      var atBottom = max - y <= 2;
      var nearBottom = max - y < vh * 0.9;

      for (var i = animated.length - 1; i >= 0; i--) {
        var el = animated[i];
        var settled = el.classList.contains('is-in') && el.classList.contains('is-done');

        if (atBottom) {
          // caso 2: no fim da página nada pode estar entrando — o que ainda
          // não entrou aparece direto, e o que está no meio da transição é
          // levado ao estado final na hora.
          if (!settled) { settle(el); io.unobserve(el); ioMedia.unobserve(el); }
          continue;
        }
        if (el.classList.contains('is-in')) continue;

        var r = el.getBoundingClientRect();
        if (nearBottom && r.top < vh) {       // caso 1: já visível, anima agora
          show(el); io.unobserve(el); ioMedia.unobserve(el); continue;
        }
        if (r.bottom < vh * 0.25) {           // (c) salto de scroll: já passou
          settle(el); io.unobserve(el); ioMedia.unobserve(el);
        }
      }
    }
    /* O guard precisa ser determinístico: um scroll programático (âncora,
       restauração de posição, salto da barra) pode chegar antes de a página
       terminar de crescer com as imagens lazy. Por isso ele roda a cada
       frame enquanto há rolagem, uma vez quando a rolagem para, no load, e
       sempre que a altura do documento muda. */
    var guardTick = false, guardStop = null;
    function scheduleGuard() {
      if (!guardTick) {
        guardTick = true;
        requestAnimationFrame(function () { guardTick = false; bottomGuard(); });
      }
      clearTimeout(guardStop);
      guardStop = setTimeout(bottomGuard, 90);   // chamada de cauda
    }
    window.addEventListener('scroll', scheduleGuard, { passive: true });
    window.addEventListener('resize', scheduleGuard, { passive: true });
    window.addEventListener('load', bottomGuard);
    if ('ResizeObserver' in window) {
      new ResizeObserver(scheduleGuard).observe(document.body);
    }
    setTimeout(bottomGuard, 200);

    // libera a GPU quando a entrada termina
    document.addEventListener('transitionend', function (e) {
      var t = e.target;
      // só marca como concluído o que de fato ENTROU — sem isso um
      // transitionend qualquer marcava is-done num bloco ainda invisível e o
      // bottomGuard passava direto por ele para sempre.
      if (t.classList && t.classList.contains('is-in') && t.hasAttribute('data-reveal')) {
        t.classList.add('is-done');
      }
    }, true);
  }

  /* ---------- 5. Contadores ---------------------------------------------- */
  $$('[data-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-count-suffix') || '';
    if (!motionOn || isNaN(target)) return;
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
    if (!motionOn) {
      steps.setAttribute('data-on', 'true');
    } else {
      var so = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { steps.setAttribute('data-on', 'true'); so.disconnect(); }
      }, { threshold: 0.25 });
      so.observe(steps);
      // o CTA é a última seção: se o usuário for direto ao fim, os passos
      // não podem ficar esperando o threshold
      window.addEventListener('scroll', function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (max - window.scrollY < window.innerHeight * 0.9) {
          steps.setAttribute('data-on', 'true');
        }
      }, { passive: true });
    }
  }

  /* ---------- 7. Parallax das faixas de imagem (≤0.12) ------------------- */
  var bands = $$('.imgband-media');
  if (bands.length && motionOn && window.matchMedia('(min-width: 700px)').matches) {
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

  /* ---------- 7b. Barra de leitura + header que se esconde --------------- */
  if (motionOn) {
    // ⚠️ nome único: o arquivo inteiro é um IIFE e `var` é escopado à função —
    // um `var bar` no banner de cookies reatribuía esta mesma variável, e a
    // barra de leitura passava a escrever no banner.
    var progressBar = document.createElement('div');
    progressBar.className = 'progress';
    progressBar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progressBar);

    var lastY = window.scrollY, barTick = false;
    function updateChrome() {
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(y / max, 1) : 0;
      progressBar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      progressBar.setAttribute('data-on', y > 120 ? 'true' : 'false');

      if (header && !document.body.classList.contains('nav-open')) {
        // esconde ao descer, volta ao subir — só depois de passar o hero
        var down = y > lastY + 4;
        var up = y < lastY - 4;
        if (y > 320 && down) header.setAttribute('data-hidden', 'true');
        else if (up || y <= 320) header.setAttribute('data-hidden', 'false');
      }
      lastY = y;
      barTick = false;
    }
    window.addEventListener('scroll', function () {
      if (!barTick) { barTick = true; requestAnimationFrame(updateChrome); }
    }, { passive: true });
    updateChrome();

    /* WCAG 2.4.11 — foco não pode ficar escondido: se o teclado chegar a um
       link do header enquanto ele está recolhido, o header volta. */
    document.addEventListener('focusin', function (e) {
      if (header && header.contains(e.target)) header.setAttribute('data-hidden', 'false');
    });
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
  var cookieBar = $('#cookie-bar');
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
  if (cookieBar) {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (err) { saved = null; }
    if (saved === 'granted' || saved === 'denied') {
      pushConsent(saved === 'granted');
    } else {
      cookieBar.hidden = false;
    }
    $$('[data-consent]', cookieBar).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var granted = btn.getAttribute('data-consent') === 'granted';
        try { localStorage.setItem(KEY, granted ? 'granted' : 'denied'); } catch (err) {}
        pushConsent(granted);
        cookieBar.hidden = true;
      });
    });
  }

  /* ---------- 13. Ano do rodapé ------------------------------------------ */
  var y = $('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
