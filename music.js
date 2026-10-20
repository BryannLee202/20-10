(() => {
  'use strict';

  const SESSION_KEY = 'flower.music.state.v1';
  const AUDIO_SRC = window.INLINE_BG_MUSIC_SRC || './assets/bg-music.mp3';

  // Inject floating Vinyl Music Pill styles
  const style = document.createElement('style');
  style.textContent = `
    .music-pill {
      position: fixed;
      top: max(14px, env(safe-area-inset-top));
      left: max(16px, env(safe-area-inset-left));
      z-index: 20;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 40px;
      padding: 7px 14px 7px 10px;
      border: 1px solid #ecd3db;
      border-radius: 24px;
      background: rgba(255, 253, 251, 0.92);
      backdrop-filter: blur(6px);
      color: #76364d;
      font: 12px/1.2 "Segoe UI", "Noto Sans", sans-serif;
      box-shadow: 0 4px 16px rgba(118, 54, 77, 0.08);
      cursor: pointer;
      user-select: none;
      transition: background 0.25s, transform 0.25s, box-shadow 0.25s;
    }
    .music-pill:hover {
      background: #fae7ef;
      transform: translateY(-1px);
    }
    .music-disc {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: radial-gradient(circle, #fff8fa 0 22%, #c7637d 24% 34%, #4a2030 36% 68%, #2d121d 70% 100%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(118, 54, 77, 0.22);
      flex-shrink: 0;
    }
    .music-pill.is-playing .music-disc {
      animation: vinyl-spin 4s linear infinite;
    }
    .music-note- floating {
      color: #c7637d;
      font-size: 14px;
      line-height: 1;
    }
    .music-pill.is-playing .music-note-icon {
      animation: note-bob 1.4s ease-in-out infinite;
    }
    .music-note-icon {
      color: #c7637d;
      font-size: 14px;
      display: inline-block;
    }
    @keyframes vinyl-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes note-bob {
      0%, 100% { transform: translateY(0) scale(1); opacity: 0.85; }
      50% { transform: translateY(-3px) scale(1.15); opacity: 1; }
    }
    @media (max-width: 600px) {
      .music-pill {
        padding: 6px 12px 6px 8px;
        min-height: 36px;
        font-size: 11px;
      }
      .music-disc { width: 20px; height: 20px; }
    }
  `;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'music-pill';
  btn.id = 'musicToggleBtn';
  btn.setAttribute('aria-label', 'Bật hoặc tắt nhạc nền');
  btn.innerHTML = `
    <span class="music-disc" aria-hidden="true"></span>
    <span class="music-label">Bật nhạc</span>
    <span class="music-note-icon" aria-hidden="true">♪</span>
  `;
  document.body.appendChild(btn);
  const labelEl = btn.querySelector('.music-label');

  const audio = new Audio();
  audio.src = AUDIO_SRC;
  audio.loop = true;
  audio.preload = 'auto';
  audio.playsInline = true;

  let savedState = { time: 0, mutedByUser: false };
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.time === 'number' && parsed.time >= 0) savedState.time = parsed.time;
      if (typeof parsed.mutedByUser === 'boolean') savedState.mutedByUser = parsed.mutedByUser;
    }
  } catch {}

  let userPaused = savedState.mutedByUser;
  let fadeTimer = null;

  function saveProgress() {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        time: audio.currentTime || 0,
        mutedByUser: userPaused
      }));
    } catch {}
  }

  function updateUI(playing) {
    btn.classList.toggle('is-playing', playing);
    btn.setAttribute('aria-pressed', String(playing));
    labelEl.textContent = playing ? 'Nhạc tình ca' : 'Bật nhạc';
  }

  function fadeInVolume(target = 0.8) {
    clearInterval(fadeTimer);
    audio.volume = Math.min(0.15, target);
    fadeTimer = setInterval(() => {
      if (audio.paused) {
        clearInterval(fadeTimer);
        return;
      }
      if (audio.volume + 0.06 < target) {
        audio.volume = +(audio.volume + 0.06).toFixed(2);
      } else {
        audio.volume = target;
        clearInterval(fadeTimer);
      }
    }, 90);
  }

  async function tryPlay(withFade = true) {
    if (userPaused) return false;
    try {
      if (savedState.time > 0 && audio.currentTime === 0) {
        audio.currentTime = savedState.time;
      }
      if (withFade) audio.volume = 0.15;
      else audio.volume = 0.8;
      await audio.play();
      if (withFade) fadeInVolume(0.8);
      updateUI(true);
      removeUnlockListeners();
      return true;
    } catch {
      updateUI(false);
      return false;
    }
  }

  const unlockEvents = ['pointerdown', 'touchstart', 'click', 'keydown'];
  function onFirstInteraction(e) {
    if (e.target && btn.contains(e.target)) return;
    if (!userPaused && audio.paused) {
      tryPlay(true);
    } else {
      removeUnlockListeners();
    }
  }

  function removeUnlockListeners() {
    unlockEvents.forEach(evt => window.removeEventListener(evt, onFirstInteraction, true));
  }

  unlockEvents.forEach(evt => window.addEventListener(evt, onFirstInteraction, { capture: true, passive: true }));

  btn.addEventListener('click', async e => {
    e.stopPropagation();
    removeUnlockListeners();
    if (audio.paused) {
      userPaused = false;
      await tryPlay(false);
    } else {
      userPaused = true;
      clearInterval(fadeTimer);
      audio.pause();
      updateUI(false);
    }
    saveProgress();
  });

  audio.addEventListener('loadedmetadata', () => {
    if (savedState.time > 0 && savedState.time < audio.duration) {
      try { audio.currentTime = savedState.time; } catch {}
    }
  });

  audio.addEventListener('timeupdate', saveProgress);
  window.addEventListener('pagehide', saveProgress);
  window.addEventListener('beforeunload', saveProgress);

  let wasPlayingBeforeHide = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      wasPlayingBeforeHide = !audio.paused;
      if (wasPlayingBeforeHide) {
        saveProgress();
        audio.pause();
      }
    } else if (wasPlayingBeforeHide && !userPaused) {
      tryPlay(false);
    }
  });

  // Attempt immediate play (works when navigating between index.html <-> garden.html!)
  if (!userPaused) {
    tryPlay(savedState.time === 0);
  }
})();
