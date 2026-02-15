document.addEventListener('DOMContentLoaded', function () {
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
      link.classList.remove('bg-gradient-to-r');
      link.classList.add('bg-blue-600');
      if (hint) hint.remove();
      wrapper.onclick = null;
      wrapper.style.cursor = '';
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
    function (val) { return 'mailto:' + val + '?subject=Ruby developer role'; }
  );
});
