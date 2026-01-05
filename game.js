const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// BATUAI object
let batuai = {
  x: 50,
  y: 200,
  width: 50,
  height: 65,
  gravity: 1.6,   
  lift: -10,
  velocity: 0
};

let pipes = [];
let score = 0;
let highScore = 0;

// Load assets
const batuaiImg = new Image();
batuaiImg.src = "batu.png";

const bgDay = new Image();
bgDay.src = "background_day.png";

const bgNight = new Image();
bgNight.src = "background_night.png";

let bgX = 0;

// Background dinamis berdasarkan skor
function getCurrentBackground() {
  let cycle = Math.floor(score / 10); // ganti setiap 10 skor
  return cycle % 2 === 0 ? bgDay : bgNight;
}

function drawBackground() {
  const bgImg = getCurrentBackground();
  if (!bgImg.complete) return;
  bgX -= 0.5;
  if (bgX <= -canvas.width) bgX = 0;
  ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);
}

// Gambar BATUAI
function drawBATUAI() {
  ctx.save();
  ctx.translate(batuai.x + batuai.width / 2, batuai.y + batuai.height / 2);
  let angle = Math.max(Math.min(batuai.velocity / 10, 0.4), -0.4);
  ctx.rotate(angle);
  ctx.drawImage(batuaiImg, -batuai.width / 2, -batuai.height / 2, batuai.width, batuai.height);
  ctx.restore();
}

// Gambar obstacle pipa hijau natural
function drawPipes() {
  pipes.forEach(pipe => {
    let gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
    gradient.addColorStop(0, "#145a32");
    gradient.addColorStop(0.5, "#2ecc71");
    gradient.addColorStop(1, "#145a32");

    // Pipa atas
    ctx.fillStyle = gradient;
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
    ctx.fillStyle = "#006400";
    ctx.fillRect(pipe.x - 5, pipe.top - 25, pipe.width + 10, 25);

    // Pipa bawah
    ctx.fillStyle = gradient;
    ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
    ctx.fillStyle = "#006400";
    ctx.fillRect(pipe.x - 5, canvas.height - pipe.bottom, pipe.width + 10, 25);

    // Outline
    ctx.strokeStyle = "#0b3d0b";
    ctx.lineWidth = 2;
    ctx.strokeRect(pipe.x, 0, pipe.width, pipe.top);
    ctx.strokeRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
  });
}

// Update posisi dan tabrakan
function update() {
  batuai.velocity += batuai.gravity * 0.5;
  batuai.y += batuai.velocity;

  pipes.forEach(pipe => {
    pipe.x -= 1.8;
    if (pipe.x + pipe.width < 0) {
      pipes.shift();
      score++;
      showScorePopup();
    }
  });

  if (batuai.y + batuai.height > canvas.height - 10 || batuai.y < 10) resetGame();

  pipes.forEach(pipe => {
    if (
      batuai.x < pipe.x + pipe.width &&
      batuai.x + batuai.width > pipe.x &&
      (batuai.y < pipe.top || batuai.y + batuai.height > canvas.height - pipe.bottom)
    ) {
      resetGame();
    }
  });
}

// Reset game
function resetGame() {
  if (score > highScore) highScore = score;
  canvas.classList.add("shake");
  setTimeout(() => canvas.classList.remove("shake"), 300);
  batuai.y = 200;
  batuai.velocity = 0;
  pipes = [];
  score = 0;
}

// Loop utama
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawBATUAI();
  drawPipes();
  update();
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillText("High Score: " + highScore, 10, 60);
  requestAnimationFrame(loop);
}

// Kontrol
document.addEventListener("keydown", e => {
  if (e.code === "Space") batuai.velocity = batuai.lift;
});

// Spawn obstacle
setInterval(() => {
  let gap = Math.floor(Math.random() * 30) + 150;
  let top = Math.random() * (canvas.height - gap - 100) + 50;
  pipes.push({
    x: canvas.width,
    width: 60,
    top: top,
    bottom: canvas.height - top - gap
  });
}, 3000);

// Popup skor
function showScorePopup() {
  let popup = document.createElement("div");
  popup.innerText = "+1";
  popup.className = "score-popup";
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 800);
}

// Mulai game
batuaiImg.onload = () => {
  loop();
};
