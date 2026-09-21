const scene = document.getElementById('scene');
const flowerButton = document.getElementById('flowerButton');
const againButton = document.getElementById('againButton');
const petalLayer = document.getElementById('petalLayer');
const sparkleLayer = document.getElementById('sparkleLayer');
const particles = document.getElementById('particles');

let bloomed = false;
let finalShown = false;

const rand = (min, max) => Math.random() * (max - min) + min;

function flowerCenter() {
  const rect = flowerButton.getBoundingClientRect();
  return {
    x: rect.left + rect.width * 0.5,
    y: rect.top + rect.height * 0.36,
  };
}

function makeAmbientDots() {
  for (let i = 0; i < 18; i++) {
    const dot = document.createElement('span');
    dot.className = 'float-dot';
    dot.style.left = `${rand(3, 97)}%`;
    dot.style.top = `${rand(8, 92)}%`;
    dot.style.setProperty('--duration', `${rand(3.8, 7.5)}s`);
    dot.style.animationDelay = `${rand(-6, 0)}s`;
    dot.style.transform = `scale(${rand(.6, 1.35)})`;
    particles.appendChild(dot);
  }
}

function releasePetals(count = 7, energetic = false) {
  const { x, y } = flowerCenter();
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'falling-petal';
    const size = rand(8, energetic ? 17 : 14);
    const spread = energetic ? rand(-110, 110) : rand(-60, 60);
    p.style.left = `${x + spread}px`;
    p.style.top = `${y + rand(-20, 20)}px`;
    p.style.setProperty('--size', `${size}px`);
    p.style.setProperty('--duration', `${rand(2.5, energetic ? 4.2 : 5.2)}s`);
    p.style.setProperty('--drift', `${rand(-85, 85)}px`);
    p.style.setProperty('--fall', `${rand(150, energetic ? 330 : 250)}px`);
    p.style.setProperty('--start-rot', `${rand(-100, 100)}deg`);
    p.style.setProperty('--end-rot', `${rand(180, 680)}deg`);
    p.style.animationDelay = `${rand(0, .45)}s`;
    petalLayer.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

function sparkles(count = 12) {
  const { x, y } = flowerCenter();
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.style.left = `${x + rand(-20, 20)}px`;
    s.style.top = `${y + rand(-15, 15)}px`;
    s.style.setProperty('--size', `${rand(2.5, 5)}px`);
    s.style.setProperty('--duration', `${rand(.7, 1.35)}s`);
    s.style.setProperty('--dx', `${rand(-95, 95)}px`);
    s.style.setProperty('--dy', `${rand(-95, 55)}px`);
    s.style.animationDelay = `${rand(0, .18)}s`;
    sparkleLayer.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }
}

function bloom() {
  if (bloomed) return;
  bloomed = true;
  scene.classList.add('is-bloomed');
  flowerButton.setAttribute('aria-label', 'Flor amarilla florecida');

  window.setTimeout(() => sparkles(14), 820);
  window.setTimeout(() => releasePetals(6, false), 1080);

  if ('vibrate' in navigator) navigator.vibrate?.(18);
}

function finalMoment() {
  if (!bloomed) {
    bloom();
    return;
  }
  if (finalShown) {
    releasePetals(8, true);
    sparkles(8);
    return;
  }
  finalShown = true;
  scene.classList.add('is-final');
  releasePetals(12, true);
  sparkles(20);
  if ('vibrate' in navigator) navigator.vibrate?.([14, 30, 14]);
}

flowerButton.addEventListener('click', () => bloomed ? finalMoment() : bloom());
againButton.addEventListener('click', finalMoment);

makeAmbientDots();
