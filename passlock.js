(() => {
  'use strict';

  const PASSCODE = '3006';

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('from') === 'garden') {
    return;
  }

  const WRONG_MESSAGES = [
    'Ủa kìa… sai pass rồi, anh dỗi đó nha 🥺',
    'Ơ kìa vẫn chưa nhớ ra hả? Gợi ý: ngày đặc biệt 4 số đó! 💌',
    'Thương quá nhắc bài luôn nè: bấm 3 - 0 - 0 - 6 nha đồ ngốc đáng yêu 💗'
  ];

  // Gentle synthesized sound effects (Web Audio API - zero external files needed)
  let audioCtx = null;
  function playCuteSound(type) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;

      if (type === 'tap') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(720, now + 0.06);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.075);
      } else if (type === 'wrong') {
        [340, 260].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.11);
          gain.gain.setValueAtTime(0.1, now + i * 0.11);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.11 + 0.14);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.11);
          osc.stop(now + i * 0.11 + 0.15);
        });
      } else if (type === 'success') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.11, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.36);
        });
      }
    } catch {}
  }

  const style = document.createElement('style');
  style.textContent = `
    .passlock-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: radial-gradient(circle at 50% 45%, #fff5f8 0%, #fde2eb 58%, #f9d0df 100%);
      overflow: hidden;
      transition: opacity 0.85s cubic-bezier(.2,.8,.2,1), visibility 0.85s;
    }
    .passlock-overlay.is-unlocked {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .passlock-confetti {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
    }
    .passlock-card {
      position: relative;
      z-index: 1;
      width: min(100%, 326px);
      padding: 26px 26px 26px;
      border-radius: 28px;
      background: #ffffff;
      box-shadow: 0 22px 64px rgba(226, 95, 130, 0.2), 0 4px 16px rgba(226, 95, 130, 0.09);
      text-align: center;
      transition: transform 0.6s cubic-bezier(.2,1.2,.3,1), opacity 0.55s, box-shadow 0.4s;
    }
    .passlock-card.is-celebrating {
      transform: scale(1.04);
      box-shadow: 0 28px 80px rgba(236, 86, 124, 0.34), 0 0 0 4px rgba(244, 164, 186, 0.4);
    }
    .passlock-overlay.is-unlocked .passlock-card {
      transform: scale(0.92) translateY(14px);
      opacity: 0;
    }
    .passlock-mascot {
      width: 78px;
      height: 72px;
      margin: 0 auto 6px;
      display: block;
      transition: transform 0.3s cubic-bezier(.2,1.4,.4,1);
    }
    .passlock-card.is-celebrating .passlock-mascot {
      animation: mascot-jump 0.55s ease infinite alternate;
    }
    .passlock-card.is-pouting .passlock-mascot {
      transform: scale(0.95) rotate(-4deg);
    }
    .mascot-eyes-normal, .mascot-eyes-sad, .mascot-eyes-love, .mascot-tears {
      transition: opacity 0.2s;
    }
    .passlock-card:not(.is-pouting):not(.is-celebrating) .mascot-eyes-sad,
    .passlock-card:not(.is-pouting):not(.is-celebrating) .mascot-tears,
    .passlock-card:not(.is-pouting):not(.is-celebrating) .mascot-eyes-love {
      opacity: 0;
    }
    .passlock-card.is-pouting .mascot-eyes-normal,
    .passlock-card.is-pouting .mascot-eyes-love {
      opacity: 0;
    }
    .passlock-card.is-pouting .mascot-eyes-sad,
    .passlock-card.is-pouting .mascot-tears {
      opacity: 1;
    }
    .passlock-card.is-celebrating .mascot-eyes-normal,
    .passlock-card.is-celebrating .mascot-eyes-sad,
    .passlock-card.is-celebrating .mascot-tears {
      opacity: 0;
    }
    .passlock-card.is-celebrating .mascot-eyes-love {
      opacity: 1;
    }
    .passlock-title {
      margin: 0 0 14px;
      font: 700 23px/1.25 "Segoe UI", "Noto Sans", sans-serif;
      color: #e85278;
      letter-spacing: -0.3px;
      transition: color 0.25s, transform 0.25s;
    }
    .passlock-card.is-celebrating .passlock-title {
      color: #d93864;
      transform: scale(1.05);
    }
    .passlock-dots {
      display: flex;
      justify-content: center;
      gap: 14px;
      margin: 0 auto 12px;
    }
    .passlock-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #f4a4ba;
      background: #fff5f8;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: transparent;
      font-size: 12px;
      line-height: 1;
      transition: transform 0.24s cubic-bezier(.2,1.6,.4,1), background-color 0.2s, border-color 0.2s, color 0.2s;
    }
    .passlock-dot.is-filled {
      background: #ec567c;
      border-color: #ec567c;
      color: #ffffff;
      transform: scale(1.16);
    }
    .passlock-dot.is-love {
      background: #ff3e6c;
      border-color: #ff3e6c;
      color: #ffffff;
      transform: scale(1.32);
      box-shadow: 0 0 12px rgba(255, 62, 108, 0.55);
    }
    .passlock-dot.is-error {
      background: #ff4d6d;
      border-color: #ff4d6d;
      color: #ffffff;
    }
    .passlock-hint {
      min-height: 36px;
      margin: 0 0 12px;
      padding: 6px 10px;
      border-radius: 12px;
      font: 500 12.5px/1.45 "Segoe UI", "Noto Sans", sans-serif;
      color: #c94668;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.25s, transform 0.25s;
    }
    .passlock-hint.is-bubble {
      background: #fff0f4;
      border: 1px dashed #f3b6c8;
    }
    .passlock-hint.is-success-bubble {
      background: #ffe8ef;
      border: 1px solid #f49bb4;
      color: #c42b56;
      font-weight: 600;
    }
    .passlock-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 11px;
    }
    .passlock-key {
      height: 50px;
      border: 1px solid #f5e1e7;
      border-radius: 14px;
      background: #fffbfc;
      color: #4a353b;
      font: 600 18px/1 "Segoe UI", "Noto Sans", sans-serif;
      box-shadow: 0 3px 8px rgba(214, 110, 140, 0.07);
      cursor: pointer;
      user-select: none;
      transition: transform 0.12s, background-color 0.15s, border-color 0.2s, box-shadow 0.2s;
      touch-action: manipulation;
    }
    .passlock-key:hover {
      background: #fff0f4;
      border-color: #f2c6d4;
    }
    .passlock-key:active, .passlock-key.is-pressed {
      transform: scale(0.92);
      background: #fde0e9;
    }
    .passlock-key.is-hint-glow {
      border-color: #ec567c;
      background: #fff0f5;
      box-shadow: 0 0 12px rgba(236, 86, 124, 0.28);
      animation: key-pulse 1s ease-in-out infinite alternate;
    }
    .passlock-key--empty {
      visibility: hidden;
      pointer-events: none;
    }
    .passlock-key--del {
      color: #d92648;
      font-size: 18px;
      font-weight: 800;
    }
    @keyframes passlock-shake {
      0%, 100% { transform: translateX(0); }
      18% { transform: translateX(-10px) rotate(-1.5deg); }
      36% { transform: translateX(9px) rotate(1.5deg); }
      54% { transform: translateX(-7px) rotate(-1deg); }
      72% { transform: translateX(6px) rotate(1deg); }
    }
    @keyframes mascot-jump {
      from { transform: translateY(0) scale(1); }
      to { transform: translateY(-7px) scale(1.08); }
    }
    @keyframes key-pulse {
      from { transform: scale(1); }
      to { transform: scale(1.06); }
    }
    .passlock-card.is-shaking {
      animation: passlock-shake 0.46s ease;
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.className = 'passlock-overlay';
  overlay.id = 'passlockOverlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'passlockTitle');
  overlay.innerHTML = `
    <canvas class="passlock-confetti" id="passlockCanvas" aria-hidden="true"></canvas>
    <div class="passlock-card" id="passlockCard">
      <svg class="passlock-mascot" id="passlockMascot" viewBox="0 0 100 92" fill="none" aria-hidden="true">
        <!-- Cute white bunny ears -->
        <ellipse cx="34" cy="24" rx="10" ry="21" transform="rotate(-12 34 24)" fill="#fffafb" stroke="#f2b8c9" stroke-width="2.2"/>
        <ellipse cx="34" cy="25" rx="5.5" ry="13" transform="rotate(-12 34 25)" fill="#fcd3df"/>
        <ellipse cx="66" cy="24" rx="10" ry="21" transform="rotate(12 66 24)" fill="#fffafb" stroke="#f2b8c9" stroke-width="2.2"/>
        <ellipse cx="66" cy="25" rx="5.5" ry="13" transform="rotate(12 66 25)" fill="#fcd3df"/>
        <!-- Bunny face -->
        <ellipse cx="50" cy="56" rx="31" ry="26" fill="#ffffff" stroke="#f2b8c9" stroke-width="2.2"/>
        <!-- Rosy cheeks -->
        <ellipse cx="29" cy="59" rx="6" ry="3.8" fill="#fbaec4" opacity="0.75"/>
        <ellipse cx="71" cy="59" rx="6" ry="3.8" fill="#fbaec4" opacity="0.75"/>
        <!-- Normal happy eyes -->
        <g class="mascot-eyes-normal">
          <circle cx="38" cy="52" r="3.2" fill="#4a2c35"/>
          <circle cx="36.8" cy="50.8" r="1.1" fill="#ffffff"/>
          <circle cx="62" cy="52" r="3.2" fill="#4a2c35"/>
          <circle cx="60.8" cy="50.8" r="1.1" fill="#ffffff"/>
          <path d="M46 58 Q50 62 54 58" stroke="#d9597c" stroke-width="2" stroke-linecap="round" fill="none"/>
        </g>
        <!-- Pouting / sad eyes when wrong password -->
        <g class="mascot-eyes-sad">
          <path d="M33 53 Q38 49 42 53" stroke="#4a2c35" stroke-width="2.3" stroke-linecap="round" fill="none"/>
          <path d="M58 53 Q62 49 67 53" stroke="#4a2c35" stroke-width="2.3" stroke-linecap="round" fill="none"/>
          <path d="M45 62 Q50 57 55 62" stroke="#d9597c" stroke-width="2" stroke-linecap="round" fill="none"/>
        </g>
        <!-- Cute watery tears -->
        <g class="mascot-tears">
          <Drop cx="34" cy="58"/>
          <ellipse cx="33" cy="58" rx="2.2" ry="3.6" fill="#7cc6fe"/>
          <ellipse cx="67" cy="58" rx="2.2" ry="3.6" fill="#7cc6fe"/>
        </g>
        <!-- Heart eyes when unlocked! -->
        <g class="mascot-eyes-love">
          <path d="M38 55 C38 55 32 51 32 47.5 C32 45.5 34 44 35.8 44 C37 44 38 45 38 45 C38 45 39 44 40.2 44 C42 44 44 45.5 44 47.5 C44 51 38 55 38 55 Z" fill="#ec4067"/>
          <path d="M62 55 C62 55 56 51 56 47.5 C56 45.5 58 44 59.8 44 C61 44 62 45 62 45 C62 45 63 44 64.2 44 C66 44 68 45.5 68 47.5 C68 51 62 55 62 55 Z" fill="#ec4067"/>
          <path d="M44 57 Q50 64 56 57 Z" fill="#f26b8a"/>
        </g>
        <!-- Little pink heart on bunny ear -->
        <path d="M74 34 C74 34 69 30.5 69 27.5 C69 25.8 70.5 24.5 72 24.5 C73 24.5 74 25.4 74 25.4 C74 25.4 75 24.5 76 24.5 C77.5 24.5 79 25.8 79 27.5 C79 30.5 74 34 74 34 Z" fill="#ff5c8a"/>
      </svg>
      <h2 class="passlock-title" id="passlockTitle">Nhập pass nha</h2>
      <div class="passlock-dots" id="passlockDots" aria-hidden="true">
        <span class="passlock-dot">♥</span>
        <span class="passlock-dot">♥</span>
        <span class="passlock-dot">♥</span>
        <span class="passlock-dot">♥</span>
      </div>
      <p class="passlock-hint" id="passlockHint" role="status" aria-live="polite">Mật mã bí mật của tụi mình ♡</p>
      <div class="passlock-grid">
        <button type="button" class="passlock-key" data-digit="1">1</button>
        <button type="button" class="passlock-key" data-digit="2">2</button>
        <button type="button" class="passlock-key" data-digit="3">3</button>
        <button type="button" class="passlock-key" data-digit="4">4</button>
        <button type="button" class="passlock-key" data-digit="5">5</button>
        <button type="button" class="passlock-key" data-digit="6">6</button>
        <button type="button" class="passlock-key" data-digit="7">7</button>
        <button type="button" class="passlock-key" data-digit="8">8</button>
        <button type="button" class="passlock-key" data-digit="9">9</button>
        <span class="passlock-key passlock-key--empty" aria-hidden="true"></span>
        <button type="button" class="passlock-key" data-digit="0">0</button>
        <button type="button" class="passlock-key passlock-key--del" data-action="del" aria-label="Xóa">✖</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const pCanvas = overlay.querySelector('#passlockCanvas');
  const pCtx = pCanvas.getContext('2d');
  let pWidth = 0, pHeight = 0, pAnimId = 0;

  const ambientParticles = Array.from({ length: 38 }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: 3 + Math.random() * 4.5,
    speedY: 0.25 + Math.random() * 0.6,
    speedX: (Math.random() - 0.5) * 0.35,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.04,
    type: Math.random() > 0.4 ? 'ribbon' : 'dot',
    color: ['#f26b8a', '#f79bb0', '#f9bac8', '#e85278', '#ffffff'][Math.floor(Math.random() * 5)],
    alpha: 0.35 + Math.random() * 0.45
  }));

  const burstHearts = [];

  function spawnHeartFireworks() {
    const cx = pWidth * 0.5;
    const cy = pHeight * 0.46;
    const colors = ['#ff3e6c', '#ec567c', '#ff7597', '#ff9ebb', '#ffd1dc', '#ffb347'];
    for (let i = 0; i < 68; i++) {
      const angle = (Math.PI * 2 * i) / 68 + (Math.random() - 0.5) * 0.25;
      const speed = 2.8 + Math.random() * 8.5;
      burstHearts.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.2,
        gravity: 0.14 + Math.random() * 0.06,
        size: 7 + Math.random() * 11,
        rot: (Math.random() - 0.5) * 0.8,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        color: colors[i % colors.length],
        alpha: 1,
        isHeart: i % 3 !== 0
      });
    }
  }

  function drawHeartPath(ctx, size) {
    const s = size * 0.5;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.65);
    ctx.bezierCurveTo(-s * 1.2, -s * 0.2, -s * 0.65, -s * 1.15, 0, -s * 0.35);
    ctx.bezierCurveTo(s * 0.65, -s * 1.15, s * 1.2, -s * 0.2, 0, s * 0.65);
    ctx.closePath();
    ctx.fill();
  }

  function resizeLockCanvas() {
    pWidth = window.innerWidth;
    pHeight = window.innerHeight;
    pCanvas.width = pWidth;
    pCanvas.height = pHeight;
  }
  resizeLockCanvas();
  window.addEventListener('resize', resizeLockCanvas);

  function drawLockParticles() {
    if (!overlay.isConnected) return;
    pCtx.clearRect(0, 0, pWidth, pHeight);

    ambientParticles.forEach(p => {
      p.y += p.speedY / Math.max(400, pHeight);
      p.x += p.speedX / Math.max(400, pWidth);
      p.rot += p.rotSpeed;
      if (p.y > 1.05) { p.y = -0.05; p.x = Math.random(); }
      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;

      pCtx.save();
      pCtx.globalAlpha = p.alpha;
      pCtx.translate(p.x * pWidth, p.y * pHeight);
      pCtx.rotate(p.rot);
      pCtx.fillStyle = p.color;
      if (p.type === 'ribbon') {
        pCtx.fillRect(-p.size, -p.size * 0.35, p.size * 2, p.size * 0.7);
      } else {
        pCtx.beginPath();
        pCtx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2);
        pCtx.fill();
      }
      pCtx.restore();
    });

    for (let i = burstHearts.length - 1; i >= 0; i--) {
      const b = burstHearts[i];
      b.x += b.vx;
      b.y += b.vy;
      b.vy += b.gravity;
      b.vx *= 0.985;
      b.rot += b.rotSpeed;
      b.alpha -= 0.011;
      if (b.alpha <= 0) {
        burstHearts.splice(i, 1);
        continue;
      }
      pCtx.save();
      pCtx.globalAlpha = Math.max(0, b.alpha);
      pCtx.translate(b.x, b.y);
      pCtx.rotate(b.rot);
      pCtx.fillStyle = b.color;
      if (b.isHeart) {
        drawHeartPath(pCtx, b.size);
      } else {
        pCtx.beginPath();
        pCtx.arc(0, 0, b.size * 0.35, 0, Math.PI * 2);
        pCtx.fill();
      }
      pCtx.restore();
    }

    pAnimId = requestAnimationFrame(drawLockParticles);
  }
  pAnimId = requestAnimationFrame(drawLockParticles);

  const dots = [...overlay.querySelectorAll('.passlock-dot')];
  const card = overlay.querySelector('#passlockCard');
  const titleEl = overlay.querySelector('#passlockTitle');
  const hint = overlay.querySelector('#passlockHint');
  const mascot = overlay.querySelector('#passlockMascot');
  const openCardBtn = document.getElementById('openCard');
  if (openCardBtn) openCardBtn.hidden = true;

  let inputCode = '';
  let locked = false;
  let wrongCount = 0;

  function renderDots(state = 'normal') {
    dots.forEach((dot, idx) => {
      const filled = idx < inputCode.length;
      dot.classList.toggle('is-filled', filled && state === 'normal');
      dot.classList.toggle('is-error', state === 'error');
      dot.classList.toggle('is-love', state === 'love');
      dot.textContent = state === 'error' ? '×' : '♥';
    });
  }

  function unlockSuccess() {
    locked = true;
    playCuteSound('success');
    card.classList.remove('is-pouting');
    card.classList.add('is-celebrating');
    renderDots('love');
    titleEl.textContent = 'Yayyy! Đúng rồi nè ♡';
    hint.textContent = 'Chào mừng công chúa của anh bước vào vườn hoa 20/10 🌷';
    hint.className = 'passlock-hint is-success-bubble';
    spawnHeartFireworks();

    setTimeout(() => {
      overlay.classList.add('is-unlocked');
      document.dispatchEvent(new Event('bouquet:replay'));
      if (openCardBtn) {
        openCardBtn.hidden = true;
        setTimeout(() => { openCardBtn.hidden = false; }, 1600);
      }
      setTimeout(() => {
        cancelAnimationFrame(pAnimId);
        window.removeEventListener('resize', resizeLockCanvas);
        window.removeEventListener('keydown', onKeyDown);
        overlay.remove();
      }, 900);
    }, 1250);
  }

  function handleDigit(digit) {
    if (locked || inputCode.length >= 4) return;
    playCuteSound('tap');
    card.classList.remove('is-pouting');
    inputCode += digit;
    mascot.style.transform = `rotate(${(inputCode.length % 2 ? -1 : 1) * 4}deg) translateY(-2px)`;
    renderDots('normal');

    if (inputCode.length === 4) {
      mascot.style.transform = '';
      if (inputCode === PASSCODE) {
        unlockSuccess();
      } else {
        locked = true;
        wrongCount++;
        playCuteSound('wrong');
        renderDots('error');
        card.classList.remove('is-shaking');
        void card.offsetWidth;
        card.classList.add('is-shaking', 'is-pouting');

        const msg = WRONG_MESSAGES[Math.min(wrongCount - 1, WRONG_MESSAGES.length - 1)];
        hint.textContent = msg;
        hint.className = 'passlock-hint is-bubble';

        if (wrongCount >= 3) {
          ['3', '0', '6'].forEach(k => {
            const keyBtn = overlay.querySelector(`.passlock-key[data-digit="${k}"]`);
            if (keyBtn) keyBtn.classList.add('is-hint-glow');
          });
        }

        setTimeout(() => {
          inputCode = '';
          locked = false;
          renderDots('normal');
        }, 650);
      }
    }
  }

  function handleDelete() {
    if (locked || !inputCode.length) return;
    playCuteSound('tap');
    inputCode = inputCode.slice(0, -1);
    renderDots('normal');
  }

  overlay.querySelectorAll('.passlock-key').forEach(btn => {
    btn.addEventListener('click', () => {
      const digit = btn.getAttribute('data-digit');
      if (digit !== null) handleDigit(digit);
      else if (btn.getAttribute('data-action') === 'del') handleDelete();
    });
  });

  function onKeyDown(e) {
    if (!overlay.isConnected || overlay.classList.contains('is-unlocked')) return;
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      handleDigit(e.key);
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      handleDelete();
    }
  }
  window.addEventListener('keydown', onKeyDown);
})();
