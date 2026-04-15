window.__app = window.__app || {};
(function () {
  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function throttle(fn, ms) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }

  __app.refreshAOS = function () {
    try {
      if (window.AOS) AOS.refresh();
    } catch (e) {}
  };

  __app.notify = function (msg, type) {
    var c = document.getElementById('toast-container');
    if (!c) return;
    var t = document.createElement('div');
    t.className = 'c-toast c-toast--' + (type || 'success');
    t.textContent = msg;
    t.setAttribute('role', 'status');
    c.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .3s';
      t.style.opacity = '0';
      setTimeout(function () {
        if (t.parentNode) t.parentNode.removeChild(t);
      }, 350);
    }, 5000);
  };

  function initAOS() {
    if (__app.aosInit) return;
    __app.aosInit = true;
    if (!window.AOS) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    document.querySelectorAll('[data-aos][data-avoid-layout="true"]').forEach(function (el) {
      el.removeAttribute('data-aos');
    });
    AOS.init({
      once: false,
      duration: 600,
      easing: 'ease-out',
      offset: 120,
      mirror: false,
      disable: function () {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
    });
  }

  function initNav() {
    if (__app.navInit) return;
    __app.navInit = true;
    var toggle = document.querySelector('.c-nav__toggle');
    var nav = document.querySelector('.c-nav#main-nav');
    if (!toggle || !nav) return;
    var list = nav.querySelector('.c-nav__list');

    function openNav() {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
      if (list) {
        var focusable = list.querySelectorAll('a, button, [tabindex]');
        if (focusable.length) focusable[0].focus();
      }
    }

    function closeNav() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
    }

    function trapFocus(e) {
      if (!nav.classList.contains('is-open')) return;
      var focusable = list
        ? Array.from(list.querySelectorAll('a, button, [tabindex]')).filter(function (el) {
            return !el.disabled && el.offsetParent !== null;
          })
        : [];
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    toggle.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) closeNav();
      else openNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
      trapFocus(e);
    });

    document.addEventListener('click', function (e) {
      if (
        nav.classList.contains('is-open') &&
        !nav.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        closeNav();
      }
    });

    if (list) {
      list.querySelectorAll('.c-nav__link').forEach(function (link) {
        link.addEventListener('click', function () {
          closeNav();
        });
      });
    }

    window.addEventListener(
      'resize',
      debounce(function () {
        if (window.innerWidth >= 1024) {
          closeNav();
        }
      }, 100),
      { passive: true }
    );
  }

  function initAnchors() {
    if (__app.anchorsInit) return;
    __app.anchorsInit = true;
    var isHome =
      location.pathname === '/' ||
      location.pathname === '/index.html' ||
      location.pathname.endsWith('/index.html');

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (h === '#' || h === '#!') return;
      if (!isHome) {
        a.setAttribute('href', '/' + h);
        return;
      }
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.querySelector(h);
        if (!target) return;
        var header = document.querySelector('.l-header');
        var offset = header ? header.offsetHeight : 80;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });

    document.querySelectorAll('[id]').forEach(function (el) {
      var tag = el.tagName.toLowerCase();
      if (tag === 'section' || tag === 'div') {
        var cur = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        if (cur < 60) {
          el.style.scrollMarginTop = 'var(--nav-h,64px)';
        }
      }
    });
  }

  function initActiveNav() {
    if (__app.activeNavInit) return;
    __app.activeNavInit = true;
    var path = location.pathname;
    var hash = location.hash;
    document.querySelectorAll('.c-nav__link').forEach(function (link) {
      link.removeAttribute('aria-current');
      link.classList.remove('is-active');
      var href = link.getAttribute('href');
      if (!href) return;
      var isHome =
        path === '/' ||
        path === '/index.html' ||
        path.endsWith('/index.html');
      if (href === '/' && isHome) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('is-active');
      } else if (
        href === path ||
        path.endsWith('/' + href) ||
        (href.includes('#') &&
          isHome &&
          href.split('#')[1] &&
          hash === '#' + href.split('#')[1])
      ) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('is-active');
      }
    });
  }

  function initImages() {
    if (__app.imagesInit) return;
    __app.imagesInit = true;
    document.querySelectorAll('img').forEach(function (img) {
      if (!img.classList.contains('img-fluid')) img.classList.add('img-fluid');
      if (
        !img.hasAttribute('loading') &&
        !img.classList.contains('c-logo__img') &&
        !img.hasAttribute('data-critical')
      ) {
        img.setAttribute('loading', 'lazy');
      }
      img.addEventListener(
        'error',
        function () {
          var isLogo = img.classList.contains('c-logo__img');
          var svg =
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect fill='%23e5e7eb' width='200' height='150'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14'%3EAfbeelding niet beschikbaar%3C/text%3E%3C/svg%3E";
          img.src = svg;
          img.style.objectFit = 'contain';
          if (isLogo) img.style.maxHeight = '40px';
        },
        { once: true }
      );
    });
  }

  function initForms() {
    if (__app.formsInit) return;
    __app.formsInit = true;
    document.querySelectorAll('form.needs-validation').forEach(function (form) {
      if (form.dataset.initialized) return;
      form.dataset.initialized = 'true';
      form.addEventListener(
        'submit',
        function (e) {
          if (!form.checkValidity()) {
            e.preventDefault();
            e.stopPropagation();
            form.classList.add('was-validated');
            var first = form.querySelector(':invalid');
            if (first) first.focus();
            return;
          }
          form.classList.add('was-validated');
          var btn = form.querySelector('[type="submit"]');
          var btnText = form.querySelector('.c-button__text');
          var spinner = form.querySelector('.c-button__spinner');
          if (btn) btn.disabled = true;
          if (spinner) spinner.classList.remove('d-none');
          if (btnText) btnText.textContent = 'Bezig...';
          var action = form.getAttribute('action');
          if (action && action !== '') {
            window.location.href = action;
            return;
          }
          var fd = new FormData(form);
          var obj = {};
          fd.forEach(function (v, k) {
            obj[k] = v;
          });
          fetch('process.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(obj)
          })
            .then(function (r) {
              if (r.ok) {
                __app.notify(
                  'Uw aanvraag is succesvol verstuurd. Wij nemen spoedig contact op.',
                  'success'
                );
                form.reset();
                form.classList.remove('was-validated');
              } else {
                __app.notify('Er is een fout opgetreden. Probeer het opnieuw.', 'error');
              }
            })
            .catch(function () {
              __app.notify('Er is een verbindingsfout. Probeer het later opnieuw.', 'error');
            })
            .finally(function () {
              if (btn) btn.disabled = false;
              if (spinner) spinner.classList.add('d-none');
              if (btnText) btnText.textContent = 'Offerte Aanvragen';
            });
        },
        false
      );
    });
  }

  function initMobileFlexGaps() {
    if (__app.mobileFlexInit) return;
    __app.mobileFlexInit = true;

    function applyGaps() {
      var vw = window.innerWidth;
      document.querySelectorAll('.d-flex').forEach(function (el) {
        var gapClasses = Array.from(el.classList).some(function (c) {
          return /^gap-|^g-/.test(c);
        });
        if (vw < 576) {
          if (!gapClasses && el.children.length > 1) el.classList.add('gap-3');
        } else {
          el.classList.remove('gap-3');
        }
      });
    }

    applyGaps();
    window.addEventListener('resize', debounce(applyGaps, 150), { passive: true });
  }

  function initScrollHeader() {
    if (__app.scrollHeaderInit) return;
    __app.scrollHeaderInit = true;
    var header = document.querySelector('.l-header');
    if (!header) return;
    var handler = throttle(function () {
      if (window.scrollY > 10) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    }, 100);
    window.addEventListener('scroll', handler, { passive: true });
  }

  function initFooterYear() {
    var el = document.getElementById('footerYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  function initAnimeInteractions() {
    if (__app.animeInit) return;
    __app.animeInit = true;
    if (!window.anime) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    var targets = [
      '.c-service-card',
      '.c-benefit-card',
      '.c-blog-card',
      '.c-stat-card',
      '.btn-primary',
      '.btn-success'
    ];
    targets.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.addEventListener('mouseenter', function () {
          anime({ targets: el, translateY: -6, duration: 200, easing: 'easeOutQuad' });
        });
        el.addEventListener('mouseleave', function () {
          anime({ targets: el, translateY: 0, duration: 200, easing: 'easeOutQuad' });
        });
      });
    });
  }

  __app.init = function () {
    if (__app.initialized) return;
    __app.initialized = true;
    initAOS();
    initNav();
    initAnchors();
    initActiveNav();
    initImages();
    initForms();
    initMobileFlexGaps();
    initScrollHeader();
    initFooterYear();
    initAnimeInteractions();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', __app.init);
  } else {
    __app.init();
  }
})();