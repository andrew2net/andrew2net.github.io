document.addEventListener('DOMContentLoaded', function () {
  // Contact reveal logic
  function decode(group) {
    var elms = document.querySelectorAll('[data-g="' + group + '"]');
    return window.atob([].slice.call(elms).map(function(el) { return el.innerText; }).join(''));
  }

  function setupReveal(link, group, prefix, buildHref) {
    var wrapper = link.parentNode;
    var hint = wrapper.querySelector('span');
    var reveal = function (event) {
      event.preventDefault();
      var value = decode(group);
      link.innerText = value;
      link.href = buildHref(value);
      link.classList.remove('contact-masked');
      link.classList.add('contact-revealed');
      if (hint) hint.remove();
      wrapper.onclick = null;
      wrapper.removeAttribute('title');
      wrapper.style.cursor = '';
      var method = group === 'p' ? 'phone' : 'email';
      if (typeof gtag === 'function') {
        gtag('event', method + '_reveal');
      }
      link.addEventListener('click', function () {
        if (typeof gtag === 'function') {
          gtag('event', method + '_click');
        }
      });
    };
    wrapper.style.cursor = 'pointer';
    wrapper.onclick = reveal;
  }

  setupReveal(
    document.getElementById('hidentel'), 'p', '+1 704 ',
    function (val) { return 'tel:' + val.replace(/ /g, ''); }
  );

  setupReveal(
    document.getElementById('hidenemail'), 'e', 'andr... ',
    function (val) { return 'mailto:' + val + '?subject=Project Inquiry'; }
  );

  // Sticky nav shadow
  var navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        navbar.classList.add('nav-scrolled');
      } else {
        navbar.classList.remove('nav-scrolled');
      }
    });
  }

  // Mobile menu toggle
  var navToggle = document.getElementById('nav-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('hidden') === false;
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.add('hidden');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Section view tracking
  var sections = document.querySelectorAll('section[id], footer[id]');
  if (sections.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && typeof gtag === 'function') {
          gtag('event', 'section_view', { section_name: entry.target.id });
          sectionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  // Portfolio button click tracking
  var portfolioLinks = document.querySelectorAll('#portfolio .btn-primary');
  portfolioLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (typeof gtag === 'function') {
        var card = link.closest('.project-card, .book-page');
        var projectName = card ? card.querySelector('h3').textContent : 'unknown';
        gtag('event', 'portfolio_click', {
          project_name: projectName,
          link_text: link.textContent.trim()
        });
      }
    });
  });

  // Social link click tracking
  var socialLinks = document.querySelectorAll('#social-links a[data-social]');
  socialLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (typeof gtag === 'function') {
        gtag('event', 'social_click', {
          platform: link.dataset.social
        });
      }
    });
  });

  // Project cards: stagger the cards in each row of their grid.
  document.querySelectorAll('.reveal-card').forEach(function (card) {
    var siblings = [].slice.call(card.parentNode.children);
    var columns = card.parentNode.dataset.columns ? Number(card.parentNode.dataset.columns) : 3;
    card.style.setProperty('--reveal-delay', (siblings.indexOf(card) % columns) * 180 + 'ms');
  });

  // Project book: the pages turn over forward and back with the scroll position.
  // The scroll itself stays normal. The book is active only on large screens
  // without "reduce motion". Elsewhere the pages are a normal list.
  var book = document.getElementById('project-book');
  if (book && window.matchMedia) {
    var bookPages = [].slice.call(book.querySelectorAll('.book-page'));
    var bookDots = [].slice.call(book.querySelectorAll('.book-dot'));
    var bookQuery = window.matchMedia('(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)');
    var bookActive = false;
    var bookCurrent = -1;
    var bookFrame = 0;
    var bookLastTime = 0;
    // Part of each page's scroll distance in which the next page stays still after the turn.
    var BOOK_DWELL = 0.15;
    var bookStage = book.querySelector('.book-stage');
    // How fast the shown turn follows the scroll position: the part of the gap closed in one 60 Hz frame.
    var BOOK_FOLLOW = 0.18;
    // targets: the turn from the scroll position (0 = flat, 1 = turned). shown: the turn on the screen.
    var bookTargets = bookPages.map(function () { return 0; });
    var bookShown = bookTargets.slice();

    var pageScroll = function () { return window.innerHeight * 0.85; };

    // The book's top position (from the top of the window) at which the first page starts
    // to turn: the moment when the stage stops in the middle of the window.
    var bookStart = function () {
      return parseFloat(window.getComputedStyle(bookStage).top) || 0;
    };
    var clamp = function (v) { return Math.max(0, Math.min(1, v)); };

    // The target turn changes at an even speed with the scroll position.
    var computeTargets = function () {
      var progress = Math.max(0, bookStart() - book.getBoundingClientRect().top) / pageScroll();
      var last = bookPages.length - 1;
      var current = last;
      bookTargets.forEach(function (_, i) {
        // Page i turns in the first part of its scroll step. The next page then stays still.
        bookTargets[i] = i === last ? 0 : clamp((progress - i) / (1 - BOOK_DWELL));
        if (bookTargets[i] < 0.5 && current === last && i < current) current = i;
      });
      if (current !== bookCurrent) {
        bookCurrent = current;
        bookDots.forEach(function (dot, i) { dot.setAttribute('aria-current', i === current ? 'true' : 'false'); });
      }
    };

    var renderBook = function () {
      var previousTurn = 1;
      bookPages.forEach(function (page, i) {
        var turn = bookShown[i];
        page.style.setProperty('--turn', turn.toFixed(4));
        page.style.setProperty('--rise', previousTurn.toFixed(4));
        page.style.zIndex = String(bookPages.length - i);
        // A turned page must not catch clicks.
        page.style.pointerEvents = turn > 0.5 ? 'none' : '';
        previousTurn = turn;
      });
    };

    // Move the shown turn toward the target a little on each frame, so the page glides
    // instead of jumping with each mouse-wheel step.
    var stepBook = function (time) {
      bookFrame = 0;
      if (!bookActive) return;
      var dt = bookLastTime ? Math.min(64, time - bookLastTime) : 16.7;
      bookLastTime = time;
      var follow = 1 - Math.pow(1 - BOOK_FOLLOW, dt / 16.7);
      var moving = false;
      bookShown = bookShown.map(function (value, i) {
        var gap = bookTargets[i] - value;
        if (Math.abs(gap) < 0.0005) return bookTargets[i];
        moving = true;
        return value + gap * follow;
      });
      renderBook();
      if (moving) {
        bookFrame = window.requestAnimationFrame(stepBook);
      } else {
        bookLastTime = 0;
      }
    };

    var requestBookUpdate = function () {
      if (!bookActive) return;
      computeTargets();
      if (!bookFrame) {
        bookLastTime = 0;
        bookFrame = window.requestAnimationFrame(stepBook);
      }
    };

    // Show the turn for the current scroll position at once, with no glide.
    var jumpBook = function () {
      computeTargets();
      bookShown = bookTargets.slice();
      renderBook();
    };

    var setBookMode = function () {
      bookActive = bookQuery.matches;
      book.classList.toggle('is-active', bookActive);
      if (bookActive) {
        // Scroll room: the stage itself, one page step for each turn, and a short rest on the last page.
        book.style.height = Math.round(bookStage.offsetHeight + (bookPages.length - 0.6) * pageScroll()) + 'px';
      } else {
        book.style.height = '';
        bookPages.forEach(function (page) {
          ['--turn', '--rise'].forEach(function (name) { page.style.removeProperty(name); });
          page.style.zIndex = '';
          page.style.pointerEvents = '';
        });
      }
      bookCurrent = -1;
      if (bookFrame) {
        window.cancelAnimationFrame(bookFrame);
        bookFrame = 0;
      }
      if (bookActive) jumpBook();
    };

    var scrollToPage = function (i, smooth) {
      // The scroll position at which page i lies flat and the page before it has just turned.
      var top = book.getBoundingClientRect().top + window.scrollY - bookStart() + i * pageScroll();
      // "instant", not "auto": "auto" follows the CSS smooth scrolling of the page.
      window.scrollTo({ top: Math.round(top), behavior: smooth ? 'smooth' : 'instant' });
    };

    bookDots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { scrollToPage(i, true); });
    });

    // Keyboard users: when focus moves into a page, show that page.
    bookPages.forEach(function (page, i) {
      page.addEventListener('focusin', function () {
        if (bookActive && bookCurrent !== i) scrollToPage(i, false);
      });
    });

    if (bookQuery.addEventListener) {
      bookQuery.addEventListener('change', setBookMode);
    } else if (bookQuery.addListener) {
      bookQuery.addListener(setBookMode);
    }
    window.addEventListener('scroll', requestBookUpdate, { passive: true });
    window.addEventListener('resize', setBookMode);
    setBookMode();
  }

  // Stagger the fade-in of the items in a [data-stagger] row.
  document.querySelectorAll('[data-stagger]').forEach(function (row) {
    [].slice.call(row.children).forEach(function (item, i) {
      var target = item.querySelector('.fade-in') || item;
      target.style.setProperty('--reveal-delay', i * 120 + 'ms');
    });
  });

  // Fade-in and card reveal on scroll
  var fadeEls = document.querySelectorAll('.fade-in, .reveal-card');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show everything
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // Cookie consent banner
  var banner = document.getElementById('cookie-banner');
  if (banner && !localStorage.getItem('cookie_consent')) {
    banner.classList.remove('hidden');
  }
  function setConsent(value) {
    localStorage.setItem('cookie_consent', value);
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: value === 'granted' ? 'granted' : 'denied'
      });
    }
    if (banner) banner.classList.add('hidden');
  }
  var acceptBtn = document.getElementById('cookie-accept');
  var declineBtn = document.getElementById('cookie-decline');
  if (acceptBtn) acceptBtn.addEventListener('click', function () { setConsent('granted'); });
  if (declineBtn) declineBtn.addEventListener('click', function () { setConsent('denied'); });
});
