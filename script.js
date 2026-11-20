const modal = document.getElementById("surpriseModal");
const toast = document.getElementById("toast");
const flame = document.getElementById("flame");
const sparkleLayer = document.querySelector(".sparkle-layer");
const birthdayScene = document.getElementById("birthdayScene");
const surpriseMessage = document.getElementById("surpriseMessage");
const modalCelebrate = document.getElementById("modalCelebrate");
const musicToggle = document.getElementById("musicToggle");
const openGiftButton = document.getElementById("openGift");
const giftMessage = document.getElementById("giftMessage");
let flowerShowerInterval;
let feedingTimeout;
let giftOpen = false;
let musicContext;
let musicGain;
let musicTimeout;
let musicNoteIndex = 0;
let musicEnabled = false;
let musicRunId = 0;
const birthdayNotes = [
  [392, 0.42], [392, 0.22], [440, 0.62], [392, 0.62], [523.25, 0.62], [493.88, 1.05],
  [392, 0.42], [392, 0.22], [440, 0.62], [392, 0.62], [587.33, 0.62], [523.25, 1.05],
  [392, 0.42], [392, 0.22], [783.99, 0.62], [659.25, 0.62], [523.25, 0.62], [493.88, 0.62], [440, 1.05],
  [698.46, 0.42], [698.46, 0.22], [659.25, 0.62], [523.25, 0.62], [587.33, 0.62], [523.25, 1.3], [0, 1.15]
];

for (let i = 0; i < 24; i++) {
  const sparkle = document.createElement("span");
  sparkle.className = "sparkle";
  sparkle.style.left = Math.random() * 100 + "%";
  sparkle.style.top = Math.random() * 100 + "%";
  sparkle.style.animationDelay = Math.random() * 3 + "s";
  sparkle.style.animationDuration = (2 + Math.random() * 3) + "s";
  sparkleLayer.appendChild(sparkle);
}

function showToast(message = "Happy Birthday, Laxmi! 💗") {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function makeConfetti(count = 65, pieces = ["💗", "🌸", "✨", "🎀", "💕", "✿"]) {
  for (let i = 0; i < count; i++) {
    const item = document.createElement("span");
    item.className = "petal";
    item.textContent = pieces[Math.floor(Math.random() * pieces.length)];
    item.style.left = Math.random() * 100 + "vw";
    item.style.fontSize = (14 + Math.random() * 18) + "px";
    item.style.animationDuration = (3 + Math.random() * 4) + "s";
    item.style.setProperty("--drift", (Math.random() * 180 - 90) + "px");
    document.body.appendChild(item);
    window.setTimeout(() => item.remove(), 7500);
  }
}

function makeGiftSparkles() {
  const pieces = ["💖", "✨", "🌸", "🎀", "⭐"];
  const rect = openGiftButton.getBoundingClientRect();
  for (let i = 0; i < 32; i++) {
    const item = document.createElement("span");
    item.className = "gift-spark";
    item.textContent = pieces[Math.floor(Math.random() * pieces.length)];
    item.style.left = rect.left + rect.width * (0.25 + Math.random() * 0.5) + "px";
    item.style.top = rect.top + rect.height * 0.45 + "px";
    item.style.fontSize = (14 + Math.random() * 17) + "px";
    item.style.animationDelay = Math.random() * 0.35 + "s";
    item.style.setProperty("--drift", (Math.random() * 200 - 100) + "px");
    document.body.appendChild(item);
    window.setTimeout(() => item.remove(), 2300);
  }
}

openGiftButton.addEventListener("click", () => {
  giftOpen = !giftOpen;
  openGiftButton.classList.toggle("is-open", giftOpen);
  openGiftButton.setAttribute("aria-pressed", String(giftOpen));
  giftMessage.textContent = giftOpen
    ? "Surprise, Laxmi! You are loved more than words can say. Happy Birthday! 💖"
    : "A little surprise, wrapped just for you ♡";
  if (giftOpen) {
    makeGiftSparkles();
    makeConfetti(45, ["💖", "✨", "🌸", "🎀"]);
  }
});

function startFlowerShower() {
  const flowers = ["🌸", "🌼", "🌷", "🌺", "💮"];
  makeConfetti(90, flowers);
  flowerShowerInterval = window.setInterval(() => makeConfetti(12, flowers), 550);
}

function playBirthdayNote() {
  if (!musicContext || !musicGain || !musicEnabled) return;
  const startAt = musicContext.currentTime;
  const [frequency, duration] = birthdayNotes[musicNoteIndex];
  musicNoteIndex = (musicNoteIndex + 1) % birthdayNotes.length;

  if (frequency) {
    const playSoftNote = (noteFrequency, volume, length) => {
      const oscillator = musicContext.createOscillator();
      const noteGain = musicContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(noteFrequency, startAt);
      noteGain.gain.setValueAtTime(0.0001, startAt);
      noteGain.gain.exponentialRampToValueAtTime(volume, startAt + 0.055);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startAt + length);
      oscillator.connect(noteGain);
      noteGain.connect(musicGain);
      oscillator.start(startAt);
      oscillator.stop(startAt + length + 0.02);
    };

    playSoftNote(frequency, 0.11, Math.min(duration * 0.78, 0.48));
    playSoftNote(frequency * 2, 0.012, Math.min(duration * 0.42, 0.25));
  }

  const runId = musicRunId;
  musicTimeout = window.setTimeout(() => {
    if (runId === musicRunId) playBirthdayNote();
  }, duration * 1000);
}

async function startBirthdayMusic() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    musicToggle.textContent = "Birthday music is not supported in this browser";
    musicToggle.disabled = true;
    return;
  }

  if (!musicContext || musicContext.state === "closed") {
    musicContext = new AudioContextClass();
    musicGain = musicContext.createGain();
    musicGain.gain.value = 0.16;
    musicGain.connect(musicContext.destination);
  }

  try {
    await musicContext.resume();
    musicRunId++;
    musicEnabled = true;
    musicGain.gain.setTargetAtTime(0.16, musicContext.currentTime, 0.08);
    musicToggle.setAttribute("aria-pressed", "true");
    musicToggle.textContent = "♫ Cute birthday tune on · Mute";
    musicNoteIndex = 0;
    playBirthdayNote();
  } catch (error) {
    musicEnabled = false;
    musicToggle.setAttribute("aria-pressed", "false");
    musicToggle.textContent = "Music couldn't start · Try again";
  }
}

function stopBirthdayMusic() {
  musicRunId++;
  window.clearTimeout(musicTimeout);
  musicTimeout = undefined;
  musicEnabled = false;
  musicNoteIndex = 0;
  musicToggle.setAttribute("aria-pressed", "false");
  musicToggle.textContent = "♫ Play birthday music";
  if (musicContext && musicContext.state !== "closed") {
    const contextToClose = musicContext;
    musicContext = undefined;
    musicGain = undefined;
    contextToClose.close();
  }
}

function closeSurprise() {
  modal.hidden = true;
  window.clearInterval(flowerShowerInterval);
  flowerShowerInterval = undefined;
  window.clearTimeout(feedingTimeout);
  feedingTimeout = undefined;
  document.querySelectorAll(".petal").forEach(petal => petal.remove());
  stopBirthdayMusic();
}

document.getElementById("openSurprise").addEventListener("click", () => {
  birthdayScene.classList.remove("is-cut", "is-fed", "is-open");
  modalCelebrate.disabled = false;
  modalCelebrate.textContent = "Cut cake & share! 🍰";
  surpriseMessage.textContent = "The cats are ready to cheer! Cut the cake and share a slice with your bestie.";
  musicToggle.disabled = false;
  modal.hidden = false;
  window.requestAnimationFrame(() => birthdayScene.classList.add("is-open"));
  startFlowerShower();
  startBirthdayMusic();
});
document.getElementById("closeModal").addEventListener("click", closeSurprise);
modal.addEventListener("click", event => {
  if (event.target === modal) closeSurprise();
});
modalCelebrate.addEventListener("click", () => {
  birthdayScene.classList.add("is-cut");
  modalCelebrate.disabled = true;
  modalCelebrate.textContent = "Sharing the cake! 💗";
  surpriseMessage.textContent = "Yay, Laxmi! Everyone is clapping while you share a slice with your bestie. 💗";
  makeConfetti(75);
  feedingTimeout = window.setTimeout(() => {
    if (!modal.hidden) birthdayScene.classList.add("is-fed");
  }, 650);
});
musicToggle.addEventListener("click", () => {
  if (musicEnabled) {
    musicEnabled = false;
    musicRunId++;
    window.clearTimeout(musicTimeout);
    musicTimeout = undefined;
    musicGain.gain.setTargetAtTime(0, musicContext.currentTime, 0.08);
    musicToggle.setAttribute("aria-pressed", "false");
    musicToggle.textContent = "♫ Birthday music muted · Play";
  } else {
    startBirthdayMusic();
  }
});
document.getElementById("celebrate").addEventListener("click", celebrate);

function celebrate() {
  flame.classList.add("out");
  makeConfetti(100);
  showToast("A whole lot of love for you, Laxmi! 🎂💗");
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !modal.hidden) closeSurprise();
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(section => observer.observe(section));
