// ─── CONFIG ───────────────────────────────────────────────
const TOTAL_FRAMES = 192;
const FRAME_PATH   = i =>
  `frames/frame${String(i).padStart(3, "0")}.jpg`;
// ──────────────────────────────────────────────────────────
 
const canvas     = document.getElementById("frameCanvas");
const ctx        = canvas.getContext("2d");
const music      = document.getElementById("bgMusic");
const scrollHint = document.getElementById("scrollHint");
 
// Ensure loop is set
music.loop = true;
 
let canvasW = window.innerWidth;
let canvasH = window.innerHeight;
 
function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvasW = window.innerWidth;
  canvasH = window.innerHeight;
  canvas.width  = canvasW * dpr;
  canvas.height = canvasH * dpr;
  canvas.style.width  = canvasW + "px";
  canvas.style.height = canvasH + "px";
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}
 
setupCanvas();
 
window.addEventListener("resize", () => {
  setupCanvas();
  drawFrame(currentFrameIndex);
});
 
const frames = new Array(TOTAL_FRAMES).fill(null);
let currentFrameIndex = 0;
let targetFrameIndex  = 0;
let smoothFrame       = 0;
let started           = false;
 
function drawFrame(index) {
  const i = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)));
  const img = frames[i];
  if (!img || !img.complete || !img.naturalWidth) return;
 
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasW, canvasH);
 
  const scale = Math.max(canvasW / img.naturalWidth, canvasH / img.naturalHeight);
  const w = img.naturalWidth  * scale;
  const h = img.naturalHeight * scale;
  const x = (canvasW - w) / 2;
  const y = (canvasH - h) / 2;
 
  ctx.drawImage(img, x, y, w, h);
}
 
function loadFrames() {
  const first = new Image();
  first.onload = () => {
    frames[0] = first;
    drawFrame(0);
    if (!started) { started = true; animate(); }
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      frames[i - 1] = img;
    }
  };
  first.onerror = () => console.error("Failed to load frame 1");
  first.src = FRAME_PATH(1);
}
 
// ─── MUSIC ────────────────────────────────────────────────
let musicStarted = false;
 
function startMusic() {
  if (musicStarted) return;
 
  // Unlock audio context first (required on Android)
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) {
    const ctx = new AudioContext();
    ctx.resume();
  }
 
  music.loop   = true;
  music.volume = 0;
 
  const playPromise = music.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      musicStarted = true;
      let vol = 0;
      const fade = setInterval(() => {
        vol = Math.min(vol + 0.05, 1);
        music.volume = vol;
        if (vol >= 1) clearInterval(fade);
      }, 100);
    }).catch(() => {
      // Retry on next interaction
      musicStarted = false;
    });
  }
}
 
// Attach to every possible user interaction for Android compatibility
["touchstart", "touchend", "click", "scroll"].forEach(evt => {
  window.addEventListener(evt, startMusic, { once: true, passive: true });
});
 
// ─── SCROLL HINT ──────────────────────────────────────────
let hintHidden = false;
 
window.addEventListener("scroll", () => {
  if (!hintHidden && window.scrollY > 50) {
    hintHidden = true;
    scrollHint.style.opacity = "0";
    setTimeout(() => scrollHint.style.display = "none", 800);
  }
 
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress  = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
  targetFrameIndex = progress * (TOTAL_FRAMES - 1);
}, { passive: true });
 
// ─── ANIMATION LOOP ───────────────────────────────────────
function animate() {
  smoothFrame += (targetFrameIndex - smoothFrame) * 0.12;
  if (Math.abs(targetFrameIndex - smoothFrame) < 0.1) smoothFrame = targetFrameIndex;
 
  const newIndex = Math.round(smoothFrame);
  if (newIndex !== currentFrameIndex) {
    currentFrameIndex = newIndex;
    drawFrame(currentFrameIndex);
  }
 
  requestAnimationFrame(animate);
}
 
loadFrames();
