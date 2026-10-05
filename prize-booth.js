(() => {
  const tokenKey = 'neon-arcade-tokens';
  const unlockKey = 'neon-arcade-unlocks';
  const $ = id => document.getElementById(id);
  const getTokens = () => Number(localStorage.getItem(tokenKey) || 0);
  const getUnlocks = () => { try { return JSON.parse(localStorage.getItem(unlockKey) || '{}'); } catch { return {}; } };
  const saveUnlocks = unlocks => localStorage.setItem(unlockKey, JSON.stringify(unlocks));
  const showToast = message => { const toast = $('booth-toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2500); };
  const names = { teddy:'Teddy Bear', puzzle:'Glowing Puzzle Set', duck:'Big Duck Squishy', confetti:'Party Confetti Style', disco:'Disco Party Theme' };
  const render = () => {
    const tokens = getTokens(); const unlocks = getUnlocks(); $('token-balance').textContent = tokens;
    document.querySelectorAll('[data-prize]').forEach(card => {
      const button = card.querySelector('.buy-button'); const id = card.dataset.prize; const cost = Number(card.dataset.cost);
      if (unlocks[id]) { button.disabled = true; button.textContent = id === 'disco' ? 'DISCO UNLOCKED' : 'UNLOCKED ✓'; }
      else if (tokens < cost) { button.disabled = true; button.innerHTML = `NEED ${cost - tokens} MORE <span>✦</span>`; }
      else { button.disabled = false; button.innerHTML = `${button.dataset.label || 'UNLOCK'} <span>↗</span>`; }
    });
  };
  document.querySelectorAll('[data-prize]').forEach(card => { const button = card.querySelector('.buy-button'); button.dataset.label = button.textContent.trim(); button.addEventListener('click', () => { const id = card.dataset.prize; const cost = Number(card.dataset.cost); const tokens = getTokens(); if (tokens < cost) { showToast(`You need ${cost - tokens} more tokens.`); return; } const unlocks = getUnlocks(); if (unlocks[id]) return; localStorage.setItem(tokenKey, String(tokens - cost)); unlocks[id] = true; saveUnlocks(unlocks); if (id === 'disco') localStorage.setItem('neon-arcade-disco-until', String(Date.now() + 5 * 60 * 1000)); render(); showToast(`${names[id]} unlocked! ✦`); }); });
  render();
})();
