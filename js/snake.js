/* Snake, playable with the remote's arrow keys. */
var Snake = (function () {
  var COLS = 40, ROWS = 20, CELL = 42;
  var canvas, ctx, timer, snake, dir, nextDir, food, score, state;

  function el(id) { return document.getElementById(id); }

  function msg(text) { el('snake-msg').innerHTML = text; }

  function placeFood() {
    while (true) {
      var f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      var hit = snake.some(function (s) { return s.x === f.x && s.y === f.y; });
      if (!hit) { food = f; return; }
    }
  }

  function reset() {
    snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    dir = nextDir = { x: 1, y: 0 };
    score = 0;
    el('snake-score').textContent = '0';
    el('snake-best').textContent = Store.get('snakeBest');
    placeFood();
    state = 'ready';
    msg('Press <b>OK</b> to start');
    draw();
  }

  function tick() {
    dir = nextDir;
    var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    var dead = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS ||
      snake.some(function (s) { return s.x === head.x && s.y === head.y; });
    if (dead) return gameOver();

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      el('snake-score').textContent = score;
      placeFood();
      // Speed up a little every 5 points.
      if (score % 5 === 0) { clearInterval(timer); timer = setInterval(tick, Math.max(55, 120 - score * 2)); }
    } else {
      snake.pop();
    }
    draw();
  }

  function gameOver() {
    clearInterval(timer);
    state = 'over';
    if (score > Store.get('snakeBest')) {
      Store.set('snakeBest', score);
      el('snake-best').textContent = score;
      msg('New best: ' + score + '!<br><small>OK to play again · BACK to exit</small>');
    } else {
      msg('Game over · ' + score + '<br><small>OK to play again · BACK to exit</small>');
    }
  }

  function rounded(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (var x = 0; x < COLS; x++)
      for (var y = 0; y < ROWS; y++)
        if ((x + y) % 2) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);

    ctx.fillStyle = '#ff5f7e';
    rounded(food.x * CELL + 6, food.y * CELL + 6, CELL - 12, CELL - 12, 14);

    snake.forEach(function (s, i) {
      var t = 1 - i / (snake.length + 6);
      ctx.fillStyle = 'rgba(91,' + Math.round(140 + 90 * t) + ',255,' + (0.45 + 0.55 * t) + ')';
      rounded(s.x * CELL + 3, s.y * CELL + 3, CELL - 6, CELL - 6, 10);
    });
  }

  return {
    open: function () {
      canvas = el('snake-canvas');
      ctx = canvas.getContext('2d');
      reset();
    },
    close: function () { clearInterval(timer); state = 'closed'; },
    // Returns true if the key was consumed.
    key: function (name) {
      var d = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }[name];
      if (d) {
        if (d.x !== -dir.x || d.y !== -dir.y) nextDir = d;
        return true;
      }
      if (name === 'ok') {
        if (state === 'over') reset();
        if (state === 'ready') { state = 'play'; msg(''); timer = setInterval(tick, 120); }
        return true;
      }
      return false;
    }
  };
})();
