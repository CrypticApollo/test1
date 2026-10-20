/* Spatial navigation: arrow keys move focus to the nearest .focusable element
   in the active layer, in the direction pressed. Works for any layout. */
var Nav = (function () {
  var current = null;
  var root = null;
  var onMove = null;

  function rect(el) { return el.getBoundingClientRect(); }

  function candidates() {
    return Array.prototype.slice.call(root.querySelectorAll('.focusable'));
  }

  function focus(el) {
    if (!el) return;
    if (current) current.classList.remove('focused');
    current = el;
    el.classList.add('focused');
    if (onMove) onMove(el);
  }

  function move(dir) {
    if (!current) { focus(candidates()[0]); return true; }
    var a = rect(current);
    var ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    var best = null, bestScore = Infinity;

    candidates().forEach(function (el) {
      if (el === current) return;
      var b = rect(el);
      var bx = b.left + b.width / 2, by = b.top + b.height / 2;
      var dx = bx - ax, dy = by - ay;
      var along, across;
      if (dir === 'left')  { along = -dx; across = Math.abs(dy); }
      if (dir === 'right') { along = dx;  across = Math.abs(dy); }
      if (dir === 'up')    { along = -dy; across = Math.abs(dx); }
      if (dir === 'down')  { along = dy;  across = Math.abs(dx); }
      if (along <= 1) return;
      // Left/right never jump rows: at the end of a row, focus just stays put.
      if ((dir === 'left' || dir === 'right') && across > a.height * 0.6) return;
      // Strongly prefer staying in the same row/column.
      var score = along + across * 3;
      if (score < bestScore) { bestScore = score; best = el; }
    });

    if (best) { focus(best); return true; }
    return false;
  }

  return {
    // Switch to a layer, focusing `first` (or a remembered element, or the first focusable).
    setRoot: function (el, first) {
      root = el;
      if (current) current.classList.remove('focused');
      current = null;
      focus(first || el.querySelector('.focusable'));
    },
    focus: focus,
    move: move,
    current: function () { return current; },
    onMove: function (fn) { onMove = fn; }
  };
})();
