// ─── CONFIG ───────────────────────────────────────────────
const TOTAL_FRAMES = 192;
const FRAME_PATH   = i =>
  `frames/frame${String(i).padStart(3, "0")}.png`;
// ──────────────────────────────────────────────────────────
 
const canvas     = document.getElementById("frameCanvas");
const ctx        = canvas.getContext("2d");
const music      = document.getElementById("bgMusic");
const scrollHint = document.getElementById("scrollHint");
 
const frames = [];
let loadedCount = 0;
 
function preloadFrames(onReady) {
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = FRAME_PATH(i);
    img.onload = () => {
      loadedCount++;
      if (loadedCount === TOTAL_FRAMES) onReady();
    };
    img.onerror = () => { loadedCount++; };
    frames[i - 1] = img;
  }
}
 
let canvasW = window.innerWidth;
let canvasH = window.innerHeight;
 
function resizeCanvas() {
  canvasW = window.innerWidth;
  canvasH = window.innerHeight;
  canvas.width  = canvasW;
  canvas.height = canvasH;
  drawFrame(currentFrameIndex);
}
window.addEventListener("resize", resizeCanvas);
 
let currentFrameIndex = 0;
let targetFrameIndex  = 0;
let smoothFrame       = 0;
 
function drawFrame(index) {
  const i = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)));
  const img = frames[i];
  if (!img || !img.complete) return;
 
  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasW, canvasH);
 
  const scale = Math.min(canvasW / img.naturalWidth, canvasH / img.naturalHeight);
 
  const w = img.naturalWidth  * scale;
  const h = img.naturalHeight * scale;
  const x = (canvasW - w) / 2;
  const y = (canvasH - h) / 2;
 
  ctx.drawImage(img, x, y, w, h);
}
 
let musicStarted = false;
function startMusic() {
  if (musicStarted) return;
  music.volume = 0;
  music.play().then(() => {
    musicStarted = true;
    let vol = 0;
    const fade = setInterval(() => {
      vol = Math.min(vol + 0.05, 1);
      music.volume = vol;
      if (vol >= 1) clearInterval(fade);
    }, 100);
  }).catch(() => {});
}
 
let hintHidden = false;
 
window.addEventListener("scroll", () => {
  startMusic();
 
  if (!hintHidden && window.scrollY > 50) {
    hintHidden = true;
    scrollHint.style.opacity = "0";
    setTimeout(() => scrollHint.style.display = "none", 800);
  }
 
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress  = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
  targetFrameIndex = progress * (TOTAL_FRAMES - 1);
}, { passive: true });
 
function animate() {
  smoothFrame += (targetFrameIndex - smoothFrame) * 0.12;
  if (Math.abs(targetFrameIndex - smoothFrame) < 0.1) smoothFrame = targetFrameIndex;
 
  if (Math.round(smoothFrame) !== currentFrameIndex) {
    currentFrameIndex = Math.round(smoothFrame);
    drawFrame(currentFrameIndex);
  }
 
  const s = window.scrollY;
  const title   = document.querySelector(".title");
  const names   = document.querySelector(".names");
  const details = document.querySelector(".details");
 
  if (title) {
    const v = s > 100 && s < 600;
    title.style.opacity   = v ? 1 : 0;
    title.style.transform = v ? "translateY(0)" : "translateY(30px)";
  }
  if (names) {
    const v = s > 500 && s < 1200;
    names.style.opacity   = v ? 1 : 0;
    names.style.transform = v ? "scale(1)" : "scale(0.9)";
  }
  if (details) {
    const v = s > 1100 && s < 1800;
    details.style.opacity   = v ? 1 : 0;
    details.style.transform = v ? "translateY(0)" : "translateY(20px)";
  }
 
  requestAnimationFrame(animate);
}
 
preloadFrames(() => {
  resizeCanvas();
  drawFrame(0);
  animate();
});
