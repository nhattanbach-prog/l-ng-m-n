const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const catImg = new Image();
catImg.src = "min2.png";
const combImg = new Image();
combImg.src = "luoc3.png";

let isDragging = false;
let mouseX = 300;
let mouseY = 200;
let prevMouseY = 200;
let startSwipeY = null;

let furParticles = [];
let score = 0;

// Special & danger
let specialImg = new Image();
specialImg.src = "minnhin.png";
let showSpecial = false;
let specialTimer = null;
let specialActiveTime = null;
let specialDisappearTimer = null;

let dangerImg = new Image();
dangerImg.src = "ngap.png";
let showDanger = false;
let dangerScale = 0.1;

let gameOver = false;
let safeDelay = 500; // 2 giây an toàn

// Góc xoay của lược
let combRotation = 0;

// Reset game
function resetGame() {
  isDragging = false;
  mouseX = 300;
  mouseY = 200;
  prevMouseY = 200;
  startSwipeY = null;
  furParticles = [];
  score = 0;
  showSpecial = false;
  showDanger = false;
  dangerScale = 0.1;
  gameOver = false;
  combRotation = 0;
  startSpecialTimer();
  draw();
}

// Random timer cho special image
function startSpecialTimer() {
  clearTimeout(specialTimer);
  const delay = 1000 + Math.random() * 6000;
  specialTimer = setTimeout(() => {
    showSpecial = true;
    specialActiveTime = Date.now();

    // Sau 3 giây thì hình tự biến mất nếu chưa bị kích hoạt
    clearTimeout(specialDisappearTimer);
    specialDisappearTimer = setTimeout(() => {
      if (!showDanger && !gameOver) {
        showSpecial = false;
        startSpecialTimer();
      }
    }, 3000);
  }, delay);
}
startSpecialTimer();

// Chuột
canvas.addEventListener("mousedown", (event) => {
  if (event.button === 0) {
    isDragging = true;

    // Nếu chuột nằm trong khung thì xoay lược 10 độ
    if (mouseX > 50 && mouseX < 550 && mouseY > 50 && mouseY < 350) {
      combRotation = -Math.PI / 18; // xoay 10 độ ngược chiều kim đồng hồ
      startSwipeY = mouseY; // bắt đầu tính quãng đường
    }
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
  combRotation = 0; // quay lại vị trí ban đầu
  startSwipeY = null;
});

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;

  if (isDragging && !gameOver) {
    // Kiểm tra quãng đường đủ dài (>=30px)
    if (startSwipeY !== null && mouseY - startSwipeY >= 30) {
      if (!showDanger && mouseX > 100 && mouseX < 400 && mouseY > 80 && mouseY < 330) {
        createFur(mouseX, mouseY);
        score++;
        startSwipeY = mouseY; // reset để tính lần quét tiếp theo
      }
    }

    prevMouseY = mouseY;

    // Nếu special đang hiện thì sau 2 giây mới kiểm tra thua
    if (showSpecial && specialActiveTime) {
      if (Date.now() - specialActiveTime > safeDelay) {
        showDanger = true;
        showSpecial = false;
      }
    }
  }
});

// Nhấp vào màn hình để chơi lại sau Game Over
canvas.addEventListener("click", () => {
  if (gameOver) {
    resetGame();
  }
});

// Fur
function createFur(x, y) {
  furParticles.push({
    x: x,
    y: y,
    speedY: 2 + Math.random() * 2,
    radius: 7, // bề ngang nhỏ hơn
    angle: Math.random() * Math.PI,
    rotationSpeed: (Math.random() - 0.5) * 0.05
  });
}

function drawFur() {
  ctx.fillStyle = "gray";
  furParticles.forEach((p, index) => {
    p.y += p.speedY;
    p.angle += p.rotationSpeed;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, p.angle, p.angle + Math.PI / 25);
    ctx.arc(p.x + 2, p.y, p.radius, p.angle + Math.PI / 1, p.angle + Math.PI, true);
    ctx.closePath();
    ctx.fill();

    if (p.y > canvas.height) {
      furParticles.splice(index, 1);
    }
  });
}

// Vẽ
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 50, 500, 300);

  ctx.save();
  ctx.beginPath();
  ctx.rect(50, 50, 500, 300);
  ctx.clip();

  ctx.drawImage(catImg, 100, 40, 300, 250);

  // Vẽ lược với xoay
  ctx.save();
  ctx.translate(mouseX, mouseY);
  ctx.rotate(combRotation);
  ctx.drawImage(combImg, -50, -50, 100, 100);
  ctx.restore();

  drawFur();

  if (showSpecial) {
    ctx.drawImage(specialImg, 200, 110, 200, 150);
  }

  if (showDanger) {
    dangerScale += 0.02;
    const w = 250 * dangerScale;
    const h = 250 * dangerScale;
    ctx.drawImage(dangerImg, canvas.width/2.4 - w/2, canvas.height/2.7 - h/2, w, h);

    if (dangerScale > 2) {
      gameOver = true;
    }
  }

  ctx.restore();

  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 60, 40);

  if (gameOver) {
    ctx.fillStyle = "pink";
    ctx.font = "50px Arial";
    ctx.fillText("GAME OVER", canvas.width/2 - 150, canvas.height/2);
    ctx.font = "20px Arial";
    ctx.fillText("Click để chơi lại", canvas.width/2 - 80, canvas.height/2 + 40);
  } else {
    requestAnimationFrame(draw);
  }
}

// Load ảnh
let catLoaded = false;
let combLoaded = false;
catImg.onload = () => {
  catLoaded = true;
  if (combLoaded) draw();
};
combImg.onload = () => {
  combLoaded = true;
  if (catLoaded) draw();
};
