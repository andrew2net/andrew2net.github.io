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
      link.classList.remove('text-transparent', 'bg-clip-text', 'bg-gradient-to-r', 'from-blue-400', 'to-slate-900', 'hover:text-transparent', 'visited:text-transparent');
      link.classList.add('text-blue-400');
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
        var card = link.closest('.project-card');
        var projectName = card ? card.querySelector('h3').textContent : 'unknown';
        gtag('event', 'portfolio_click', {
          project_name: projectName,
          link_text: link.textContent.trim()
        });
      }
    });
  });

  // Fade-in on scroll
  var fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show everything
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }
});
