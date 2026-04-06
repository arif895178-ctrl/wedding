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
const throttleMs = isMobile ? 100 : 40;

video.setAttribute("playsinline", "true");
video.setAttribute("webkit-playsinline", "true");
video.setAttribute("muted", "true");
video.setAttribute("preload", "auto");
video.muted = true; // must set as property too, not just attribute

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
        if (vol < 1) {
          vol += 0.05;
          music.volume = vol;
        } else {
          clearInterval(fade);
        }
      }, 100);
    }).catch(() => {});
  }
}

let lastUpdate = 0;

window.addEventListener("scroll", () => {
  unlockVideo();
  startMusic();

  // Hide intro hint
  if (!hintHidden && window.scrollY > 50) {
    hintHidden = true;
    scrollHint.style.opacity = "0";

    setTimeout(() => {
      scrollHint.style.display = "none";
    }, 800);
  }

  const now = performance.now();
  if (now - lastUpdate < throttleMs) return;
  lastUpdate = now;

  const scrollTop = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;

  let progress = scrollTop / maxScroll;
  progress = Math.min(Math.max(progress, 0), 1);

  targetTime = duration * progress;

  const title = document.querySelector(".title");
  const names = document.querySelector(".names");
  const details = document.querySelector(".details");

  if (scrollTop > 100 && scrollTop < 600) {
    title.style.opacity = 1;
    title.style.transform = "translateY(0)";
  } else {
    title.style.opacity = 0;
  }

  if (scrollTop > 500 && scrollTop < 1200) {
    names.style.opacity = 1;
    names.style.transform = "scale(1)";
  } else {
    names.style.opacity = 0;
  }

  if (scrollTop > 1100 && scrollTop < 1800) {
    details.style.opacity = 1;
    details.style.transform = "translateY(0)";
  } else {
    details.style.opacity = 0;
  }
});

function animate() {
  currentTime += (targetTime - currentTime) * 0.15;

  if (Math.abs(targetTime - currentTime) < 0.002) {
    currentTime = targetTime;
  }

  if (
    video.readyState >= 2 &&
    Math.abs(video.currentTime - currentTime) > 0.08
  ) {
    video.currentTime = currentTime;
  }

  requestAnimationFrame(animate);
}

animate();


window.addEventListener("touchstart", unlockVideo, { once: true });
window.addEventListener("click", unlockVideo, { once: true });