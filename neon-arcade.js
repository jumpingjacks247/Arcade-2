(() => {
  const tasks = [
    'Make a snack and rate it out of 10.',
    'Put on one song and have a tiny dance party.',
    'Go outside for five minutes and find something cool.',
    'Draw the first silly thing that comes to mind.',
    'Text someone a meme they would love.',
    'Build, make, or try something with your hands.',
    'Pick a movie or show and press play — no scrolling.',
    'Tidy one small spot, then celebrate your progress.',
    'Take a dramatic water break. Hydration is a quest.',
    'Do the thing you have been putting off for ten minutes.'
  ];
  const $ = id => document.getElementById(id);
  const welcomeModal = $('welcome-modal');
  const gameModal = $('game-modal');
  const stage = $('game-stage');
  const resultNote = $('result-note');
  const resultText = $('result-text');
  const tokenKey = 'neon-arcade-tokens';
  const unlockKey = 'neon-arcade-unlocks';
  let activeGame = null;
  let moleTimer = null;
  let soundOn = true;
  let clawX = 50;
  let clawBusy = false;
  let clawDrop = null;
  let discoTimer = null;
  let discoAudioContext = null;

  function randomTask() { return tasks[Math.floor(Math.random() * tasks.length)]; }
  function showToast(message) { const toast = $('toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200); }
  function getTokens() { return Number(localStorage.getItem(tokenKey) || 0); }
  function updateTokenBalance() { const balance = $('token-balance'); if (balance) balance.textContent = getTokens(); }
  function addTokens(amount) { localStorage.setItem(tokenKey, String(getTokens() + amount)); updateTokenBalance(); }
  function getUnlocks() { try { return JSON.parse(localStorage.getItem(unlockKey) || '{}'); } catch { return {}; } }
  function revealTask(isCatch = false) { resultText.textContent = randomTask(); resultNote.hidden = false; if (isCatch) { addTokens(10); showToast('+ 10 Tokens!'); } else if (soundOn) showToast('Prize unlocked ✦'); }
  function closeWelcome() { welcomeModal.classList.remove('is-open'); }
  function openGame(game) {
    activeGame = game;
    clearInterval(moleTimer);
    resultNote.hidden = true;
    gameModal.classList.add('is-open');
    gameModal.setAttribute('aria-hidden', 'false');
    const copy = {
      wheel: ['✦', 'CHANCE / SPIN', 'Spin the Wheel'],
      claw: ['★', 'SKILL / GRAB', 'Claw Machine'],
      mole: ['●', 'REFLEX / TAP', 'Whack-a-Mole']
    }[game];
    $('modal-game-icon').textContent = copy[0]; $('modal-game-kicker').textContent = copy[1]; $('game-modal-title').textContent = copy[2];
    if (game === 'wheel') renderWheel();
    if (game === 'claw') renderClaw();
    if (game === 'mole') renderMole();
  }
  function closeGame() { gameModal.classList.remove('is-open'); gameModal.setAttribute('aria-hidden', 'true'); clearInterval(moleTimer); }
  function renderWheel() {
    stage.innerHTML = '<div class="wheel-stage-wrap"><span class="wheel-pointer" aria-hidden="true"></span><div class="stage-wheel" id="stage-wheel">SPIN</div></div><button class="stage-button" id="action-button" type="button">SPIN THE WHEEL</button>';
    $('action-button').onclick = () => { const wheel = $('stage-wheel'); wheel.classList.remove('spinning'); void wheel.offsetWidth; wheel.classList.add('spinning'); $('action-button').disabled = true; $('action-button').textContent = 'SPINNING...'; setTimeout(() => { $('action-button').disabled = false; $('action-button').textContent = 'SPIN AGAIN'; revealTask(); }, 2900); };
  }
  function renderClaw() {
    const prizes = [['🐻', 'bear', 10], ['★', 'star', 22], ['🐸', 'frog', 34], ['💎', 'gem', 46], ['🦄', 'unicorn', 58], ['🔺', 'triangle', 70], ['🐙', 'octopus', 82], ['❤️', 'heart', 92]];
    stage.innerHTML = `<div class="claw-game-wrap"><div class="claw-stage interactive-claw" id="claw-stage"><span class="stage-claw-arm" id="claw-arm"></span><div class="claw-prize-pit">${prizes.map(([emoji, name, x]) => `<button class="claw-prize-stage claw-prize-item" data-prize="${name}" aria-label="${name} prize" style="left:${x}%">${emoji}</button>`).join('')}</div><span class="claw-light-strip" aria-hidden="true"></span></div><div class="claw-controls"><kbd>A</kbd><span>LEFT</span><kbd>D</kbd><span>RIGHT</span><kbd>SPACE</kbd><span>GRAB</span></div></div><button class="stage-button" id="action-button" type="button">DROP THE CLAW <span>SPACE</span></button>`;
    clawX = 50; clawBusy = false;
    const clawStage = $('claw-stage');
    const arm = $('claw-arm');
    const actionButton = $('action-button');
    const setPosition = () => clawStage.style.setProperty('--claw-x', `${clawX}%`);
    const resetButton = () => { actionButton.disabled = false; actionButton.innerHTML = 'DROP THE CLAW <span>SPACE</span>'; clawBusy = false; };
    const drop = () => {
      if (clawBusy) return;
      clawBusy = true; actionButton.disabled = true; actionButton.textContent = 'GRABBING...';
      const available = [...document.querySelectorAll('.claw-prize-item:not(.caught)')];
      const target = available.sort((a, b) => Math.abs(parseFloat(a.style.left) - clawX) - Math.abs(parseFloat(b.style.left) - clawX))[0];
      const distance = target ? Math.abs(parseFloat(target.style.left) - clawX) : 100;
      setTimeout(() => {
        arm.classList.add('dropping');
        if (target && distance <= 8) {
          target.style.left = `${clawX}%`; target.classList.add('caught');
          setTimeout(() => { arm.classList.remove('dropping'); revealTask(true); resetButton(); }, 900);
        } else {
          setTimeout(() => { arm.classList.remove('dropping'); showToast('Missed! Move over a prize and try again.'); resetButton(); }, 900);
        }
      }, 250);
    };
    clawDrop = drop;
    actionButton.onclick = drop;
    setPosition();
  }
  function renderMole() {
    stage.innerHTML = '<div class="stage-mole-grid">' + Array.from({length: 9}, (_, i) => `<div class="hole" data-hole="${i}"></div>`).join('') + '</div><p class="mole-instructions">Tap the golden mole!</p>';
    const pop = () => {
      document.querySelectorAll('.mole-pop').forEach(node => node.remove());
      const holes = document.querySelectorAll('.hole');
      const hole = holes[Math.floor(Math.random() * holes.length)];
      const isGolden = Math.random() < 0.42;
      const decoyColors = ['mole-pink', 'mole-purple', 'mole-aqua'];
      const button = document.createElement('button');
      button.className = `mole-pop ${isGolden ? 'mole-golden' : decoyColors[Math.floor(Math.random() * decoyColors.length)]}`;
      button.type = 'button';
      button.setAttribute('aria-label', isGolden ? 'Whack the golden mole' : 'Whack the colored mole');
      button.textContent = 'WHACK';
      button.onclick = () => {
        button.remove();
        if (isGolden) { clearInterval(moleTimer); revealTask(true); }
        else { showToast('That one was a decoy! Try again ✦'); }
      };
      hole.appendChild(button);
    };
    pop(); moleTimer = setInterval(pop, 1050);
  }
  $('start-button').onclick = () => { closeWelcome(); $('games').scrollIntoView({behavior:'smooth'}); };
  $('modal-start').onclick = () => { closeWelcome(); $('games').scrollIntoView({behavior:'smooth'}); };
  $('welcome-close').onclick = closeWelcome;
  $('game-close').onclick = closeGame;
  $('game-exit').onclick = closeGame;
  $('play-again').onclick = () => openGame(activeGame);
  document.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => openGame(button.dataset.game)));
  $('sound-toggle').onclick = () => { soundOn = !soundOn; $('sound-toggle').textContent = soundOn ? '♪ SOUND ON' : '♪ SOUND OFF'; $('sound-toggle').setAttribute('aria-pressed', String(soundOn)); showToast(soundOn ? 'Sound effects on' : 'Sound effects off'); };
  welcomeModal.addEventListener('click', e => { if (e.target === welcomeModal) closeWelcome(); });
  gameModal.addEventListener('click', e => { if (e.target === gameModal) closeGame(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeWelcome(); closeGame(); }
    if (activeGame !== 'claw' || !gameModal.classList.contains('is-open') || clawBusy) return;
    const clawStage = $('claw-stage');
    if (e.key.toLowerCase() === 'a') { e.preventDefault(); clawX = Math.max(8, clawX - 4); if (clawStage) clawStage.style.setProperty('--claw-x', `${clawX}%`); }
    if (e.key.toLowerCase() === 'd') { e.preventDefault(); clawX = Math.min(94, clawX + 4); if (clawStage) clawStage.style.setProperty('--claw-x', `${clawX}%`); }
    if (e.code === 'Space') { e.preventDefault(); if (clawDrop) clawDrop(); }
  });
  function startDiscoMusic() {
    const until = Number(localStorage.getItem('neon-arcade-disco-until') || 0);
    if (!document.body.classList.contains('disco-mode') || Date.now() >= until || discoTimer || !soundOn) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    discoAudioContext = discoAudioContext || new AudioContext();
    if (discoAudioContext.state === 'suspended') discoAudioContext.resume();
    const notes = [261.63, 329.63, 392, 523.25, 392, 329.63];
    let step = 0;
    const tick = () => {
      if (Date.now() >= until) { discoTimer = null; return; }
      if (soundOn) { const oscillator = discoAudioContext.createOscillator(); const gain = discoAudioContext.createGain(); oscillator.type = 'square'; oscillator.frequency.value = notes[step++ % notes.length]; gain.gain.setValueAtTime(.035, discoAudioContext.currentTime); gain.gain.exponentialRampToValueAtTime(.001, discoAudioContext.currentTime + .18); oscillator.connect(gain).connect(discoAudioContext.destination); oscillator.start(); oscillator.stop(discoAudioContext.currentTime + .2); }
      discoTimer = setTimeout(tick, 280);
    };
    tick();
  }
  function applyBoothEffects() {
    const unlocks = getUnlocks();
    if (unlocks.confetti) document.body.classList.add('party-mode');
    const discoUntil = Number(localStorage.getItem('neon-arcade-disco-until') || 0);
    if (discoUntil > Date.now()) { document.body.classList.add('disco-mode'); startDiscoMusic(); }
    updateTokenBalance();
  }
  document.addEventListener('pointerdown', startDiscoMusic);
  document.addEventListener('keydown', startDiscoMusic);
  applyBoothEffects();
})();
