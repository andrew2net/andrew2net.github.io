document.addEventListener('DOMContentLoaded', function () {
  const hidentel = document.getElementById('hidentel');
  const revtel = (event) => {
    event.preventDefault();
    elms = document.getElementsByClassName('hidden');
    enc = [].slice.call(elms).map((el) => el.innerText).join('');
    tel = window.atob(enc);
    hidentel.innerText = tel
    hidentel.href = 'tel:' + tel.replace(/ /g, '');
    hidentel.classList.remove('bg-gradient-to-r');
    hidentel.classList.add('bg-blue-600');
    hidentel.onclick = null;
  }

  hidentel.onmouseover = function () {
    hidentel.onclick = revtel;
    hidentel.onmouseover = null;
  }
});
