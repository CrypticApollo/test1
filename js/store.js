/* Settings persisted in localStorage (survives app restarts on the TV). */
var Store = (function () {
  var KEY = 'nova.settings';
  var defaults = {
    accent: 'indigo',
    wallpaper: 'aurora',
    clock24: true,
    screensaver: 'fireworks',
    ambientMinutes: 5,
    bootAnimation: true,
    snakeBest: 0
  };
  var data = {};

  function load() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
    data = {};
    for (var k in defaults) data[k] = saved.hasOwnProperty(k) ? saved[k] : defaults[k];
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  load();
  return {
    get: function (k) { return data[k]; },
    set: function (k, v) { data[k] = v; save(); },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} load(); }
  };
})();
