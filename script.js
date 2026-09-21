const experience = document.getElementById('experience');
const openLetterButton = document.getElementById('openLetter');
const letter = document.getElementById('letter');
const bouquetTouch = document.getElementById('bouquetTouch');
const petalButton = document.getElementById('petalButton');
const replayButton = document.getElementById('replayButton');
const petalBurst = document.getElementById('petalBurst');
const sunflowerRain = document.getElementById('sunflowerRain');
const tapSparkles = document.getElementById('tapSparkles');
const tapSound = document.getElementById('tapSound');
const liveStatus = document.getElementById('liveStatus');
const scrollCue = document.getElementById('scrollCue');

const themeToggle = document.getElementById('themeToggle');
const themeLabel = themeToggle.querySelector('.theme-label');
const themeMeta = document.querySelector('meta[name="theme-color"]');

const floatingDock = document.getElementById('floatingDock');
const rainHint = document.getElementById('rainHint');
const audioPlayer = document.getElementById('audioPlayer');
const audio = document.getElementById('audio');
const playButton = document.getElementById('playButton');
const minimizePlayer = document.getElementById('minimizePlayer');
const progress = document.getElementById('progress');
const volume = document.getElementById('volume');
const currentTime = document.getElementById('currentTime');
const duration = document.getElementById('duration');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let isOpen = false;
let tapAudioContext;
let lastTapTone = 0;
let tapSoundIndex = 0;
const hintTimers = new WeakMap();
const tapSoundPool = [tapSound, ...Array.from({ length: 3 }, () => {
  const sound = tapSound.cloneNode(true);
  sound.removeAttribute('id');
  sound.preload = 'auto';
  return sound;
})];

const randomBetween = (min, max) => Math.random() * (max - min) + min;

function playTapTone() {
  const nowMs = performance.now();
  if (nowMs - lastTapTone < 75) return;
  lastTapTone = nowMs;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  tapAudioContext ||= new AudioContextClass();
  if (tapAudioContext.state === 'suspended') tapAudioContext.resume().catch(() => {});

  const start = tapAudioContext.currentTime;
  const gain = tapAudioContext.createGain();
  const tone = tapAudioContext.createOscillator();
  const shimmer = tapAudioContext.createOscillator();

  tone.type = 'sine';
  shimmer.type = 'sine';
  tone.frequency.setValueAtTime(880, start);
  tone.frequency.exponentialRampToValueAtTime(1120, start + .13);
  shimmer.frequency.setValueAtTime(1320, start);
  shimmer.frequency.exponentialRampToValueAtTime(1560, start + .1);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(.018, start + .008);
  gain.gain.exponentialRampToValueAtTime(.0001, start + .16);

  tone.connect(gain);
  shimmer.connect(gain);
  gain.connect(tapAudioContext.destination);
  tone.start(start);
  shimmer.start(start);
  tone.stop(start + .17);
  shimmer.stop(start + .13);
}

function playTapSound() {
  try {
    const sound = tapSoundPool[tapSoundIndex];
    tapSoundIndex = (tapSoundIndex + 1) % tapSoundPool.length;
    sound.volume = .26;
    sound.currentTime = 0;
    const playback = sound.play();
    playback?.catch(playTapTone);
  } catch {
    playTapTone();
  }
}

function showTapSpark(event) {
  if (!event.isPrimary) return;
  const spark = document.createElement('span');
  spark.className = 'tap-spark';
  spark.innerHTML = '<i></i><i></i><i></i><i></i>';
  spark.style.setProperty('--tap-x', `${event.clientX}px`);
  spark.style.setProperty('--tap-y', `${event.clientY}px`);
  spark.style.setProperty('--tap-spin', `${randomBetween(-22, 22)}deg`);
  tapSparkles.appendChild(spark);
  spark.addEventListener('animationend', () => spark.remove(), { once: true });
  if (reduceMotion) window.setTimeout(() => spark.remove(), 80);
  playTapSound();
}

document.addEventListener('pointerdown', showTapSpark, { passive: true });

function storedTheme() {
  try {
    return localStorage.getItem('camille-theme');
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem('camille-theme', theme);
  } catch {
    // The visual theme still works when browser storage is unavailable.
  }
}

function showDockHint(hint) {
  const previousTimer = hintTimers.get(hint);
  if (previousTimer) window.clearTimeout(previousTimer);
  hint.classList.add('is-hint-visible');
  const timer = window.setTimeout(() => {
    hint.classList.remove('is-hint-visible');
    hintTimers.delete(hint);
  }, 1500);
  hintTimers.set(hint, timer);
}

function applyTheme(theme, persist = false) {
  const isNight = theme === 'night';
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute('aria-pressed', String(isNight));
  themeToggle.setAttribute('aria-label', `Cambiar al modo ${isNight ? 'día' : 'noche'}`);
  themeLabel.textContent = isNight ? 'Modo noche' : 'Modo día';
  themeMeta.setAttribute('content', isNight ? '#121c33' : '#edf8fc');
  if (persist) saveTheme(theme);
}

applyTheme(document.documentElement.dataset.theme || 'day');

themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'night' ? 'day' : 'night';
  applyTheme(nextTheme, true);
  showDockHint(themeLabel);
});
themeToggle.addEventListener('focus', () => showDockHint(themeLabel));

systemTheme.addEventListener?.('change', (event) => {
  if (!storedTheme()) applyTheme(event.matches ? 'night' : 'day');
});

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function updateRangeFill(input, percentage) {
  input.style.setProperty('--value', `${Math.min(100, Math.max(0, percentage))}%`);
}

audio.volume = Number(volume.value);
updateRangeFill(volume, audio.volume * 100);

function setPlayerExpanded(expanded) {
  audioPlayer.classList.toggle('is-collapsed', !expanded);
  floatingDock.classList.toggle('is-player-expanded', expanded);
  experience.classList.toggle('is-player-expanded', expanded);
  minimizePlayer.setAttribute('aria-expanded', String(expanded));
  minimizePlayer.setAttribute('aria-label', expanded ? 'Minimizar reproductor' : 'Expandir reproductor');
}

async function playAudio() {
  try {
    await audio.play();
    liveStatus.textContent = 'Reproduciendo Life Is Moving.';
  } catch {
    setPlayerExpanded(true);
    liveStatus.textContent = 'La música está lista. Toca reproducir para escucharla.';
  }
}

function openExperience() {
  if (isOpen) return;
  isOpen = true;
  experience.classList.add('is-open');
  openLetterButton.setAttribute('aria-expanded', 'true');
  letter.setAttribute('aria-hidden', 'false');
  bouquetTouch.tabIndex = 0;
  bouquetTouch.setAttribute('aria-hidden', 'false');
  scrollCue.tabIndex = 0;
  scrollCue.setAttribute('aria-hidden', 'false');
  petalButton.tabIndex = 0;
  petalButton.setAttribute('aria-hidden', 'false');
  audioPlayer.removeAttribute('inert');
  audioPlayer.setAttribute('aria-hidden', 'false');
  liveStatus.textContent = 'La carta se abrió y apareció un ramo de flores para Camille.';
  playAudio();

  if (!reduceMotion) {
    window.setTimeout(() => releasePetals(bouquetTouch, 9), 1450);
  }
}

openLetterButton.addEventListener('click', openExperience);

function releasePetals(originElement, count = 14, wide = false) {
  const rect = originElement.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = Math.max(80, rect.top + Math.min(rect.height * .38, 220));

  for (let index = 0; index < count; index += 1) {
    const petal = document.createElement('span');
    petal.className = 'loose-petal';
    const size = randomBetween(7, 15);
    const spread = wide ? randomBetween(-window.innerWidth * .42, window.innerWidth * .42) : randomBetween(-125, 125);

    petal.style.left = `${originX + randomBetween(-60, 60)}px`;
    petal.style.top = `${originY + randomBetween(-30, 35)}px`;
    petal.style.setProperty('--size', `${size}px`);
    petal.style.setProperty('--duration', `${randomBetween(2.4, 4.2)}s`);
    petal.style.setProperty('--dx', `${spread}px`);
    petal.style.setProperty('--dy', `${randomBetween(210, Math.max(300, window.innerHeight * .68))}px`);
    petal.style.setProperty('--rot', `${randomBetween(240, 820)}deg`);
    petal.style.animationDelay = `${randomBetween(0, .3)}s`;
    petalBurst.appendChild(petal);
    petal.addEventListener('animationend', () => petal.remove(), { once: true });
  }
}

function burstAt(x, y, count = 11) {
  for (let index = 0; index < count; index += 1) {
    const petal = document.createElement('span');
    petal.className = 'loose-petal';
    petal.style.left = `${x + randomBetween(-5, 5)}px`;
    petal.style.top = `${y + randomBetween(-5, 5)}px`;
    petal.style.setProperty('--size', `${randomBetween(5, 10)}px`);
    petal.style.setProperty('--duration', `${randomBetween(.65, 1.25)}s`);
    petal.style.setProperty('--dx', `${randomBetween(-78, 78)}px`);
    petal.style.setProperty('--dy', `${randomBetween(-90, 85)}px`);
    petal.style.setProperty('--rot', `${randomBetween(-420, 520)}deg`);
    petalBurst.appendChild(petal);
    petal.addEventListener('animationend', () => petal.remove(), { once: true });
  }
}

function createTinySunflower(index) {
  const flower = document.createElement('button');
  flower.type = 'button';
  flower.className = 'tiny-sunflower';
  flower.setAttribute('aria-label', 'Hacer estallar este girasol');
  flower.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><b></b>';
  flower.style.setProperty('--left', `${randomBetween(7, 89)}vw`);
  flower.style.setProperty('--flower-size', `${randomBetween(25, 37)}px`);
  flower.style.setProperty('--fall-duration', `${randomBetween(5.8, 8.2)}s`);
  const sway = randomBetween(-48, 48);
  flower.style.setProperty('--sway', `${sway}px`);
  flower.style.setProperty('--sway-end', `${sway * -.55}px`);
  flower.style.animationDelay = `${index * .28 + randomBetween(0, .4)}s`;

  if (reduceMotion) {
    flower.style.animation = 'none';
    flower.style.top = `${randomBetween(12, 76)}vh`;
  }

  flower.addEventListener('click', () => {
    const rect = flower.getBoundingClientRect();
    burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
    flower.remove();
    liveStatus.textContent = 'Un girasol pequeño se convirtió en pétalos.';
  });
  flower.addEventListener('animationend', () => flower.remove(), { once: true });
  sunflowerRain.appendChild(flower);

  if (reduceMotion) window.setTimeout(() => flower.remove(), 9000);
}

function makeSunflowerRain(count = 7) {
  const maxFlowers = 18;
  const activeFlowers = sunflowerRain.childElementCount;
  const amount = Math.min(count, Math.max(0, maxFlowers - activeFlowers));
  for (let index = 0; index < amount; index += 1) createTinySunflower(index);
  return { added: amount, total: activeFlowers + amount };
}

bouquetTouch.addEventListener('click', () => {
  if (isOpen) releasePetals(bouquetTouch, 15, true);
});

petalButton.addEventListener('click', () => {
  const rain = makeSunflowerRain(7);
  showDockHint(rainHint);
  liveStatus.textContent = rain.added
    ? `Se sumaron ${rain.added} girasoles pequeños. Hay ${rain.total} en pantalla y puedes tocarlos para convertirlos en pétalos.`
    : 'Ya hay muchos girasoles en pantalla. Toca alguno para convertirlo en pétalos.';
});
petalButton.addEventListener('focus', () => showDockHint(rainHint));

replayButton.addEventListener('click', () => {
  isOpen = false;
  experience.classList.remove('is-open');
  openLetterButton.setAttribute('aria-expanded', 'false');
  letter.setAttribute('aria-hidden', 'true');
  bouquetTouch.tabIndex = -1;
  bouquetTouch.setAttribute('aria-hidden', 'true');
  scrollCue.tabIndex = -1;
  scrollCue.setAttribute('aria-hidden', 'true');
  petalButton.tabIndex = -1;
  petalButton.setAttribute('aria-hidden', 'true');
  audioPlayer.setAttribute('inert', '');
  audioPlayer.setAttribute('aria-hidden', 'true');
  setPlayerExpanded(false);
  audio.pause();
  audio.currentTime = 0;
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  window.setTimeout(() => openLetterButton.focus({ preventScroll: true }), reduceMotion ? 0 : 700);
  liveStatus.textContent = 'La carta está lista para abrirse otra vez.';
});

playButton.addEventListener('click', () => {
  if (audio.paused) {
    playAudio();
  } else {
    audio.pause();
    liveStatus.textContent = 'Música en pausa.';
  }
});

audio.addEventListener('play', () => {
  audioPlayer.classList.add('is-playing');
  playButton.setAttribute('aria-label', 'Pausar música');
});

audio.addEventListener('pause', () => {
  audioPlayer.classList.remove('is-playing');
  playButton.setAttribute('aria-label', 'Reproducir música');
});

audio.addEventListener('loadedmetadata', () => {
  duration.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  progress.value = String(percent);
  updateRangeFill(progress, percent);
  currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('ended', () => {
  audio.currentTime = 0;
  liveStatus.textContent = 'La canción terminó.';
});

progress.addEventListener('input', () => {
  if (!audio.duration) return;
  const percent = Number(progress.value);
  audio.currentTime = (percent / 100) * audio.duration;
  updateRangeFill(progress, percent);
});

volume.addEventListener('input', () => {
  audio.volume = Number(volume.value);
  updateRangeFill(volume, audio.volume * 100);
});

minimizePlayer.addEventListener('click', () => {
  setPlayerExpanded(audioPlayer.classList.contains('is-collapsed'));
});

const revealItems = document.querySelectorAll('.reveal');

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
}
