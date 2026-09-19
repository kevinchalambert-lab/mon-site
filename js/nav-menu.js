/* Menu déroulant « Nos Univers » : sur écran tactile, le premier appui
   ouvre le menu au lieu de naviguer ; Échap ou un appui ailleurs le referme. */
(function () {
  var drop = document.querySelector('.n-drop');
  if (!drop) return;
  var trigger = drop.querySelector('.n-drop-trigger');
  var touch = window.matchMedia('(hover: none)');

  function setOpen(open) {
    drop.classList.toggle('open', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  trigger.addEventListener('click', function (e) {
    if (touch.matches && !drop.classList.contains('open')) {
      e.preventDefault();
      setOpen(true);
    }
  });
  document.addEventListener('click', function (e) {
    if (!drop.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();
