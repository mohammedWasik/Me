// Drifting nodes joined by thin lines. Lines reach toward the cursor on hover.
(function () {
  var canvas = document.getElementById("graph");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  var COUNT = 7;
  var LINK_DISTANCE = 380;
  var GRAB_DISTANCE = 300;
  var SPEED = 0.35;
  var INK = "107, 102, 94"; // matches --muted
  var ACCENT = "164, 69, 44"; // matches --accent

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var width, height, dpr;
  var mouse = null;
  var nodes = [];

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduceMotion) draw();
  }

  function makeNode() {
    var angle = Math.random() * Math.PI * 2;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * SPEED,
      vy: Math.sin(angle) * SPEED,
      r: 2 + Math.random() * 2.5
    };
  }

  function step() {
    nodes.forEach(function (n) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = width + 20;
      if (n.x > width + 20) n.x = -20;
      if (n.y < -20) n.y = height + 20;
      if (n.y > height + 20) n.y = -20;
    });
  }

  function line(a, b, alpha, color) {
    ctx.strokeStyle = "rgba(" + color + "," + alpha + ")";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;

    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < LINK_DISTANCE) line(nodes[i], nodes[j], 0.22 * (1 - d / LINK_DISTANCE), INK);
      }
    }

    if (mouse) {
      nodes.forEach(function (n) {
        var d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        if (d < GRAB_DISTANCE) line(n, mouse, 0.55 * (1 - d / GRAB_DISTANCE), ACCENT);
      });
    }

    ctx.fillStyle = "rgba(" + INK + ", 0.55)";
    nodes.forEach(function (n) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function loop() {
    step();
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", function (e) {
    mouse = { x: e.clientX, y: e.clientY };
  });
  document.addEventListener("mouseleave", function () {
    mouse = null;
  });

  resize();
  for (var k = 0; k < COUNT; k++) nodes.push(makeNode());
  if (reduceMotion) draw();
  else loop();
})();
