/* Nova OS shell: home screen, layers, remote handling, ambient mode. */
(function () {
  function $(id) { return document.getElementById(id); }

  // ---------- Content ----------
  // Fallback app list for when the TV won't share its installed apps (or in a browser).
  var DEFAULT_APPS = [
    { id: 'netflix', title: 'Netflix', mark: 'N', bg: '#b20710' },
    { id: 'youtube.leanback.v4', title: 'YouTube', mark: '▶', bg: '#e62117' },
    { id: 'amazon', title: 'Prime Video', mark: 'prime', bg: '#1a98ff' },
    { id: 'com.disney.disneyplus-prod', title: 'Disney+', mark: 'D+', bg: '#0b1f5c' },
    { id: 'spotify-beehive', title: 'Spotify', mark: '♫', bg: '#1db954' },
    { id: 'com.apple.appletv', title: 'Apple TV', mark: 'tv', bg: '#222' },
    { id: 'com.webos.app.browser', title: 'Web Browser', mark: '◎', bg: '#3b4cca' }
  ];
  var INPUTS = [
    { id: 'com.webos.app.livetv', title: 'Live TV', mark: 'TV', bg: '#2a2f55' },
    { id: 'com.webos.app.hdmi1', title: 'HDMI 1', mark: '1', bg: '#30354f' },
    { id: 'com.webos.app.hdmi2', title: 'HDMI 2', mark: '2', bg: '#30354f' },
    { id: 'com.webos.app.hdmi3', title: 'HDMI 3', mark: '3', bg: '#30354f' },
    { id: 'com.webos.app.hdmi4', title: 'HDMI 4', mark: '4', bg: '#30354f' }
  ];
  var NOVA_APPS = [
    { action: 'ambient', title: 'Ambient', mark: '☾', bg: 'linear-gradient(135deg,#141e30,#243b55)' },
    { action: 'snake', title: 'Snake', mark: '◆', bg: 'linear-gradient(135deg,#11998e,#38ef7d)' },
    { action: 'settings', title: 'Settings', mark: '⚙', bg: 'linear-gradient(135deg,#5b6cff,#b44cff)' },
    { action: 'system', title: 'System', mark: 'i', bg: 'linear-gradient(135deg,#ff6f91,#ff9671)' },
    { id: 'com.palm.app.settings', title: 'TV Settings', mark: '☰', bg: 'linear-gradient(135deg,#434343,#000)' }
  ];

  var SETTINGS = [
    { key: 'accent', label: 'Accent colour', values: ['indigo', 'coral', 'mint', 'gold', 'pink'] },
    { key: 'wallpaper', label: 'Wallpaper', values: ['aurora', 'sunset', 'ocean', 'midnight'] },
    { key: 'clock24', label: 'Clock', values: [true, false], names: ['24-hour', '12-hour'] },
    { key: 'ambientMinutes', label: 'Ambient mode after', values: [0, 2, 5, 10, 30], names: ['Never', '2 min', '5 min', '10 min', '30 min'] },
    { key: 'bootAnimation', label: 'Boot animation', values: [true, false], names: ['On', 'Off'] }
  ];

  // ---------- Helpers ----------
  var toastTimer;
  function toast(text) {
    var t = $('toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function timeString(d) {
    var h = d.getHours(), m = pad(d.getMinutes());
    if (Store.get('clock24')) return pad(h) + ':' + m;
    return ((h % 12) || 12) + ':' + m + (h < 12 ? ' AM' : ' PM');
  }
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function dateString(d) { return DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()]; }

  // ---------- Tiles ----------
  function makeTile(item) {
    var tile = document.createElement('div');
    tile.className = 'tile focusable';
    tile.style.background = item.bg || 'rgba(255,255,255,.08)';
    var icon = document.createElement('div');
    icon.className = 't-icon';
    if (item.icon) {
      var img = document.createElement('img');
      img.src = item.icon;
      icon.appendChild(img);
    } else {
      icon.textContent = item.mark || item.title.charAt(0);
    }
    var label = document.createElement('div');
    label.className = 't-label';
    label.textContent = item.title;
    tile.appendChild(icon);
    tile.appendChild(label);
    tile._item = item;
    return tile;
  }

  function fillRow(id, items) {
    var track = $(id);
    track.innerHTML = '';
    track._shift = 0;
    track.style.webkitTransform = track.style.transform = 'translateX(0)';
    items.forEach(function (it) { track.appendChild(makeTile(it)); });
  }

  // Keep the focused tile visible by sliding its row.
  var VISIBLE = 1700;
  Nav.onMove(function (el) {
    var track = el.parentNode;
    if (!track || !track.classList || !track.classList.contains('track')) return;
    var left = el.offsetLeft, right = left + el.offsetWidth;
    var shift = track._shift || 0;
    if (right - shift > VISIBLE - 40) shift = right - VISIBLE + 40;
    if (left - shift < 0) shift = left;
    track._shift = shift;
    track.style.webkitTransform = track.style.transform = 'translateX(' + (-shift) + 'px)';
  });

  function launchApp(item) {
    if (!Luna.available) {
      toast('Preview: would open ' + item.title + ' (' + item.id + ')');
      return;
    }
    toast('Opening ' + item.title + '…');
    Luna.launch(item.id, null, function (res) {
      if (!res.returnValue) toast('Couldn’t open ' + item.title + ' — is it installed?');
    });
  }

  function loadInstalledApps() {
    Luna.listLaunchPoints(function (res) {
      if (!res.returnValue || !res.launchPoints || !res.launchPoints.length) return;
      var skip = /^(com\.nova\.os|com\.webos\.app\.(hdmi|livetv))/;
      var apps = res.launchPoints
        .filter(function (lp) { return !skip.test(lp.id); })
        .map(function (lp) {
          return { id: lp.id, title: lp.title, icon: lp.largeIcon || lp.icon, bg: lp.bgColor || lp.iconColor || '#1c2040' };
        });
      if (apps.length) {
        var onHome = $('home').contains(Nav.current());
        fillRow('row-apps', apps);
        if (onHome && layers.length === 1) Nav.setRoot($('home'));
      }
    });
  }

  // ---------- Layers ----------
  var layers = []; // stack of { el, onClose, focusBack }

  function openLayer(id, opts) {
    opts = opts || {};
    var el = $(id);
    layers.push({ el: el, onClose: opts.onClose, focusBack: Nav.current() });
    el.classList.add('open');
    Nav.setRoot(el, opts.first);
  }

  function closeLayer() {
    if (layers.length <= 1) return;
    var top = layers.pop();
    top.el.classList.remove('open');
    if (top.onClose) top.onClose();
    Nav.setRoot(layers[layers.length - 1].el, top.focusBack);
  }

  function topId() { return layers.length ? layers[layers.length - 1].el.id : ''; }

  // ---------- Settings ----------
  function settingName(s, v) {
    var i = s.values.indexOf(v);
    if (s.names) return s.names[i];
    return String(v).charAt(0).toUpperCase() + String(v).slice(1);
  }

  function renderSettings() {
    var list = $('settings-list');
    list.innerHTML = '';
    SETTINGS.forEach(function (s) {
      var row = document.createElement('div');
      row.className = 'setting focusable';
      row._setting = s;
      row.innerHTML = '<span></span><span class="val accent-text"></span>';
      row.firstChild.textContent = s.label;
      row.lastChild.textContent = settingName(s, Store.get(s.key));
      list.appendChild(row);
    });
  }

  function cycleSetting(row, step) {
    var s = row._setting;
    var i = s.values.indexOf(Store.get(s.key));
    i = (i + step + s.values.length) % s.values.length;
    Store.set(s.key, s.values[i]);
    row.lastChild.textContent = settingName(s, s.values[i]);
    applySettings();
  }

  function applySettings() {
    var cls = document.body.className.split(' ').filter(function (c) {
      return c.indexOf('accent-') !== 0 && c.indexOf('wall-') !== 0;
    });
    cls.push('accent-' + Store.get('accent'), 'wall-' + Store.get('wallpaper'));
    document.body.className = cls.join(' ');
    updateClock();
    resetIdle();
  }

  // ---------- System info ----------
  function renderSystem() {
    var rows = [
      ['Nova OS', '1.0.0'],
      ['Platform', Luna.available ? 'LG webOS' : 'Browser preview'],
      ['Screen', window.innerWidth + ' × ' + window.innerHeight],
      ['Engine', navigator.userAgent]
    ];
    function draw() {
      $('system-info').innerHTML = rows.map(function (r) {
        return '<div><dt>' + r[0] + '</dt><dd>' + String(r[1]).replace(/</g, '&lt;') + '</dd></div>';
      }).join('');
    }
    draw();
    Luna.systemInfo(function (res) {
      if (!res.returnValue) return;
      if (res.modelName) rows.splice(2, 0, ['TV model', res.modelName]);
      if (res.firmwareVersion) rows.splice(3, 0, ['Firmware', res.firmwareVersion]);
      if (res.sdkVersion) rows.splice(4, 0, ['webOS SDK', res.sdkVersion]);
      if (res.UHD) rows.splice(5, 0, ['4K panel', res.UHD === 'true' ? 'Yes' : 'No']);
      draw();
    });
  }

  // ---------- Ambient (burn-in friendly: the clock wanders) ----------
  var ambientTimer;
  function ambientTick() {
    var c = $('ambient-clock'), now = new Date();
    c.querySelector('.a-time').textContent = timeString(now);
    c.querySelector('.a-date').textContent = dateString(now);
  }
  function ambientWander() {
    var c = $('ambient-clock');
    c.style.left = Math.round(80 + Math.random() * (1920 - 160 - (c.offsetWidth || 700))) + 'px';
    c.style.top = Math.round(80 + Math.random() * (1080 - 160 - (c.offsetHeight || 300))) + 'px';
  }
  function openAmbient() {
    if (topId() === 'layer-ambient') return;
    if (topId() === 'layer-snake') return; // never interrupt a game
    ambientTick();
    ambientWander();
    var n = 0;
    ambientTimer = setInterval(function () { ambientTick(); if (++n % 20 === 0) ambientWander(); }, 1000);
    openLayer('layer-ambient', { onClose: function () { clearInterval(ambientTimer); } });
  }

  // ---------- Idle ----------
  var idleTimer;
  function resetIdle() {
    clearTimeout(idleTimer);
    var mins = Store.get('ambientMinutes');
    if (mins > 0) idleTimer = setTimeout(openAmbient, mins * 60000);
  }

  // ---------- Actions ----------
  function runAction(name) {
    if (name === 'ambient') openAmbient();
    else if (name === 'snake') { Snake.open(); openLayer('layer-snake', { onClose: Snake.close }); }
    else if (name === 'settings') { renderSettings(); openLayer('layer-settings'); }
    else if (name === 'system') { renderSystem(); openLayer('layer-system'); }
    else if (name === 'close') closeLayer();
    else if (name === 'reload') location.reload();
    else if (name === 'reset') { Store.reset(); applySettings(); toast('Settings reset'); }
    else if (name === 'exit') exitApp();
  }

  function exitApp() {
    if (window.PalmSystem && window.PalmSystem.platformBack) window.PalmSystem.platformBack();
    else window.close();
    if (!Luna.available) { closeLayer(); toast('Preview: Nova OS would close here'); }
  }

  function activate(el) {
    if (!el) return;
    if (el._setting) return cycleSetting(el, 1);
    var item = el._item;
    if (item) return item.action ? runAction(item.action) : launchApp(item);
    var a = el.getAttribute('data-action');
    if (a) runAction(a);
  }

  function back() {
    if (layers.length > 1) closeLayer();
    else openLayer('layer-exit', { first: document.querySelector('#layer-exit [data-action="close"]') });
  }

  // ---------- Remote / keyboard ----------
  var KEYS = {
    37: 'left', 38: 'up', 39: 'right', 40: 'down', 13: 'ok',
    461: 'back', 8: 'back', 27: 'back',
    403: 'red', 404: 'green', 405: 'yellow', 406: 'blue',
    82: 'red', 71: 'green', 89: 'yellow', 66: 'blue' // R G Y B on a keyboard
  };

  document.addEventListener('keydown', function (e) {
    var key = KEYS[e.keyCode];
    resetIdle();
    if (!key) return;
    e.preventDefault();

    var top = topId();
    if (top === 'layer-ambient') { closeLayer(); return; } // any key wakes
    if (top === 'layer-snake' && Snake.key(key)) return;

    var cur = Nav.current();
    if (cur && cur._setting && (key === 'left' || key === 'right')) {
      cycleSetting(cur, key === 'left' ? -1 : 1);
      return;
    }

    if (key === 'left' || key === 'right' || key === 'up' || key === 'down') Nav.move(key);
    else if (key === 'ok') activate(cur);
    else if (key === 'back') back();
    else if (layers.length === 1) {
      runAction({ red: 'ambient', green: 'snake', yellow: 'settings', blue: 'system' }[key]);
    }
  });

  // Magic Remote pointer / mouse: hover focuses, click activates.
  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest ? e.target.closest('.focusable') : null;
    if (el && layers.length && layers[layers.length - 1].el.contains(el)) Nav.focus(el);
  });
  document.addEventListener('click', function (e) {
    resetIdle();
    if (topId() === 'layer-ambient') { closeLayer(); return; }
    var el = e.target.closest ? e.target.closest('.focusable') : null;
    if (el) activate(el);
  });
  document.addEventListener('mousemove', resetIdle);

  // ---------- Clock ----------
  function updateClock() {
    var d = new Date(), h = d.getHours();
    $('clock').textContent = timeString(d);
    $('date').textContent = dateString(d);
    $('greeting').textContent = h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }

  // ---------- Fit 1920x1080 canvas to whatever the window is ----------
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    var screen = $('screen');
    screen.style.webkitTransform = screen.style.transform = 'scale(' + s + ')';
    screen.style.left = Math.round((window.innerWidth - 1920 * s) / 2) + 'px';
    screen.style.top = Math.round((window.innerHeight - 1080 * s) / 2) + 'px';
  }
  window.addEventListener('resize', fit);

  // Come back to a fresh state when the TV relaunches us from the background.
  document.addEventListener('webOSRelaunch', function () {
    while (layers.length > 1) closeLayer();
    loadInstalledApps();
  });

  // ---------- Boot ----------
  function boot() {
    fit();
    applySettings();
    updateClock();
    setInterval(updateClock, 1000);
    $('platform-pill').textContent = Luna.available ? 'webOS' : 'Preview mode';

    fillRow('row-apps', DEFAULT_APPS);
    fillRow('row-inputs', INPUTS);
    fillRow('row-nova', NOVA_APPS);

    var home = $('home');
    home.classList.add('open');
    layers.push({ el: home });
    Nav.setRoot(home);
    loadInstalledApps();

    var delay = Store.get('bootAnimation') ? 2400 : 0;
    setTimeout(function () { $('boot').classList.add('gone'); }, delay);
  }

  boot();
})();
