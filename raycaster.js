const canvas = document.getElementById('rendering-surface');
const ctx = canvas.getContext('2d');

const canvas2 = document.getElementById('rendering-surface2');
const ctx2 = canvas2.getContext('2d');

canvas.width = 640;
canvas.height = 640;

canvas2.width = 640;
canvas2.height = 640;

const tileWidth = canvas.width / 16;
const tileHeight = canvas.height / 16;

const keys = {};

// 16x16 map
const map = [1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,
             1,2,2,0,0,0,0,0,0,0,0,0,0,0,1,1,
             3,0,0,0,0,0,1,1,1,1,1,0,0,0,0,1,
             3,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,
             1,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,
             1,0,0,0,0,1,0,0,0,1,1,0,0,0,0,1,
             1,0,0,0,0,1,0,0,0,1,1,0,0,0,0,1,
             1,0,0,0,0,1,0,0,0,1,1,0,0,0,0,1,
             1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,
             1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,
             1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,
             1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,
             1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
             1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
             1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
             1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]; 

let playerX = 2.5;
let playerY=  2.5;
let playerFOV = Math.PI / 3;
let playerDirectionAngle = 1.523 * 2;

function clear(ctx) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function renderMinimap() {
  // render map

  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      if (map[col + row * 16] === 0) {
        continue;
      }

      const colorMap = {
        1: '#0000FF',
        2: '#00FF00',
        3: '#FF0000'
      }
      const wallColor = colorMap[map[col + row * 16]];

      const x = col * tileWidth;
      const y = row * tileHeight;

      ctx.save();
      ctx.fillStyle = wallColor;
      ctx.fillRect(x, y, tileWidth, tileHeight);
      ctx.restore();
    }
  }

  // render player
  const playerMarkerSize = 6;
  ctx.fillStyle = 'red';
  ctx.fillRect(
    (playerX * tileWidth) - playerMarkerSize / 2, 
    (playerY * tileHeight) - playerMarkerSize / 2, 
    playerMarkerSize, 
    playerMarkerSize
  );

  // draw FOV
  for (let i = 0; i < canvas.width; i++) {
    const rayAngle = playerDirectionAngle - playerFOV / 2 + playerFOV * i / canvas.width;
    const { x, y, distance, wall } = castRay(playerX, playerY, rayAngle);
    drawLine(ctx, playerX * tileWidth, playerY * tileWidth, x, y, '#FFF');

    const colorMap = {
      1: '#0000FF',
      2: '#00FF00',
      3: '#FF0000'
    }
    const wallColor = colorMap[wall];

    // draw 2.5d
    const wallHeight = canvas.height / (distance * Math.cos(rayAngle - playerDirectionAngle));
    drawLine(ctx2, i, canvas.height / 2 - wallHeight / 2, i, canvas.height / 2 - wallHeight / 2 + wallHeight, wallColor);
  }

  // render player direction ray
  const { x, y } = castRay(playerX, playerY, playerDirectionAngle);
  drawLine(ctx, playerX * tileWidth, playerY * tileHeight, x, y, 'hsl(30, 100%, 70%)');
}

function drawLine(ctx, x1, y1, x2, y2, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.stroke(); 
  ctx.restore();
}

function castRay(fromX, fromY, direction) {
  let distance;
  let x, y;
  let pixelX, pixelY;
  let wall;
  for (distance = 0; distance < 20; distance += 0.005) {
    x = fromX + distance * Math.cos(direction);
    y = fromY + distance * Math.sin(direction);
    wall = map[Math.trunc(x) + Math.trunc(y) * 16];

    if (wall !== 0) {
      break;
    }

    pixelX = x * canvas.width / 16;
    pixelY = y * canvas.width / 16;
  }
  return { distance: distance - 0.005, x: pixelX, y: pixelY, wall }
}

function handleInput() {
  if (keys['w']) {
    playerY = playerY + 0.1 * Math.sin(playerDirectionAngle);
    playerX = playerX + 0.1 * Math.cos(playerDirectionAngle);
  }

  if (keys['s']) {
    playerY = playerY - 0.1 * Math.sin(playerDirectionAngle);
    playerX = playerX - 0.1 * Math.cos(playerDirectionAngle);
  }

  if (keys['a']) {
    playerY = playerY - 0.1 * Math.sin(playerDirectionAngle + Math.PI / 2);
    playerX = playerX - 0.1 * Math.cos(playerDirectionAngle + Math.PI / 2);
  }

  if (keys['d']) {
    playerY = playerY + 0.1 * Math.sin(playerDirectionAngle + Math.PI / 2);
    playerX = playerX + 0.1 * Math.cos(playerDirectionAngle + Math.PI / 2);
  }

  if (keys['ArrowLeft']) {
    playerDirectionAngle -= 0.03;
  }

  if (keys['ArrowRight']) {
    playerDirectionAngle += 0.03;
  }
}

function loop() {
  handleInput();
  clear(ctx);
  clear(ctx2);
  renderMinimap();
  window.requestAnimationFrame(loop);
}

loop();

window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});