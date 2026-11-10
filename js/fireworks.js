/* Original fireworks standby animation: rockets rise from the bottom and burst
   into fading, gravity-pulled sparks. Pure canvas, 60fps via rAF. */
var Fireworks = (function () {
  var canvas, ctx, W, H, raf, rockets, sparks, last, acc;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function hsl(h, s, l, a) { return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')'; }

  function launch() {
    rockets.push({
      x: rand(W * 0.15, W * 0.85), y: H + 10,
      vx: rand(-0.6, 0.6), vy: rand(-15, -12),
      hue: Math.floor(rand(0, 360))
    });
  }

  function burst(x, y, hue) {
    var n = Math.floor(rand(40, 80));
    for (var i = 0; i < n; i++) {
      var ang = Math.random() * Math.PI * 2;
      var spd = rand(1, 7);
      sparks.push({
        x: x, y: y,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        hue: hue + rand(-18, 18), life: 1, decay: rand(0.008, 0.02)
      });
    }
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(2.5, (t - last) / 16.67) || 1; last = t;

    // fade the previous frame for trails
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,6,0.22)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    acc += dt;
    if (acc > rand(22, 42)) { launch(); acc = 0; }

    for (var i = rockets.length - 1; i >= 0; i--) {
      var r = rockets[i];
      r.x += r.vx * dt; r.y += r.vy * dt; r.vy += 0.16 * dt;
      ctx.fillStyle = hsl(r.hue, 100, 70, 1);
      ctx.beginPath(); ctx.arc(r.x, r.y, 3, 0, 6.3); ctx.fill();
      if (r.vy >= -2) { burst(r.x, r.y, r.hue); rockets.splice(i, 1); }
    }

    for (var j = sparks.length - 1; j >= 0; j--) {
      var s = sparks[j];
      s.x += s.vx * dt; s.y += s.vy * dt;
      s.vy += 0.08 * dt; s.vx *= 0.99; s.life -= s.decay * dt;
      if (s.life <= 0) { sparks.splice(j, 1); continue; }
      ctx.fillStyle = hsl(s.hue, 100, 62, s.life);
      ctx.beginPath(); ctx.arc(s.x, s.y, 2.4 * s.life + 0.6, 0, 6.3); ctx.fill();
    }
  }

  return {
    open: function () {
      canvas = document.getElementById('fw-canvas');
      W = canvas.width; H = canvas.height;
      ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000006'; ctx.fillRect(0, 0, W, H);
      rockets = []; sparks = []; acc = 0; last = 0;
      // a few to start so it's lively immediately
      launch(); launch();
      raf = requestAnimationFrame(frame);
    },
    close: function () { if (raf) cancelAnimationFrame(raf); raf = null; }
  };
})();
