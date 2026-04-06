const video = document.getElementById("scrollVideo");
const music = document.getElementById("bgMusic");
const scrollHint = document.getElementById("scrollHint");

let duration = 0;
let targetTime = 0;
let currentTime = 0;

let unlocked = false;
let musicStarted = false;
let hintHidden = false;

const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

video.setAttribute("playsinline", "true");
video.setAttribute("webkit-playsinline", "true");
video.setAttribute("muted", "true");
video.setAttribute("preload", "auto");
video.muted = true;

video.addEventListener("loadedmetadata", () => {
  duration = video.duration;
});

function unlockVideo() {
  if (unlocked) return;
  video.muted = true;
  video.playsInline = true;
  video.currentTime = 0.01;
  video.play().then(() => {
    video.pause();
    unlocked = true;
  }).catch(() => {});
}

function startMusic() {
  if (!musicStarted) {
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
}

// --- Smooth scroll state ---
let smoothScroll = window.scrollY;     // the interpolated scroll position
let lastScrollY = window.scrollY;
let scrollVelocity = 0;
const LERP_FACTOR = isMobile ? 0.06 : 0.08;   // lower = smoother, slower
const VELOCITY_DAMPING = 0.82;                 // how fast velocity bleeds off

window.addEventListener("scroll", () => {
  unlockVideo();
  startMusic();

  if (!hintHidden && window.scrollY > 50) {
    hintHidden = true;
    scrollHint.style.opacity = "0";
    setTimeout(() => { scrollHint.style.display = "none"; }, 800);
  }
}, { passive: true });

// Minimum seek threshold — don't touch currentTime for tiny diffs
const SEEK_THRESHOLD = isMobile ? 0.15 : 0.05;

// Track last time we actually seeked, to avoid hammering the decoder
let lastSeekedTime = -1;

function animate() {
  // Compute scroll velocity for inertia feel
  const rawScroll = window.scrollY;
  scrollVelocity = (scrollVelocity + (rawScroll - lastScrollY)) * VELOCITY_DAMPING;
  lastScrollY = rawScroll;

  // Lerp smoothScroll toward rawScroll (with a tiny velocity nudge for feel)
  smoothScroll += (rawScroll - smoothScroll) * LERP_FACTOR;

  // Clamp
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const clampedScroll = Math.min(Math.max(smoothScroll, 0), maxScroll);

  const progress = maxScroll > 0 ? clampedScroll / maxScroll : 0;
  targetTime = duration * progress;

  // Only lerp currentTime toward targetTime
  currentTime += (targetTime - currentTime) * 0.12;
  if (Math.abs(targetTime - currentTime) < 0.001) currentTime = targetTime;

  // Only seek if the difference is worth it (avoids decoder hammering)
  if (
    video.readyState >= 2 &&
    Math.abs(video.currentTime - currentTime) > SEEK_THRESHOLD
  ) {
    video.currentTime = currentTime;
    lastSeekedTime = currentTime;
  }

  // --- Text overlay transitions (driven by smoothScroll for consistency) ---
  const s = clampedScroll;

  const title = document.querySelector(".title");
  const names = document.querySelector(".names");
  const details = document.querySelector(".details");

  if (title) {
    const visible = s > 100 && s < 600;
    title.style.opacity = visible ? 1 : 0;
    title.style.transform = visible ? "translateY(0)" : "translateY(30px)";
  }

  if (names) {
    const visible = s > 500 && s < 1200;
    names.style.opacity = visible ? 1 : 0;
    names.style.transform = visible ? "scale(1)" : "scale(0.9)";
  }

  if (details) {
    const visible = s > 1100 && s < 1800;
    details.style.opacity = visible ? 1 : 0;
    details.style.transform = visible ? "translateY(0)" : "translateY(20px)";
  }

  requestAnimationFrame(animate);
}

animate();

window.addEventListener("touchstart", unlockVideo, { once: true });
window.addEventListener("click", unlockVideo, { once: true });
