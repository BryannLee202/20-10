(() => {
  'use strict';

  const STORAGE_KEY = 'flower.greeting.20-10.v2';
  const defaultGreeting = {
    recipient: 'em yêu',
    title: 'Chúc em một ngày\nthật nhiều yêu thương.',
    message: 'Nhân ngày Phụ nữ Việt Nam 20/10, chúc người con gái anh thương luôn khỏe mạnh, bình an và có thật nhiều niềm vui.\n\nMong em luôn được yêu thương từ những điều nhỏ nhất, luôn giữ nụ cười rạng rỡ trên môi và tự tin theo đuổi những điều mình mong muốn.\n\nHôm nay và cả những ngày sau, cảm ơn em vì đã luôn ở bên anh nhé.',
    sender: 'Người luôn thương em ♡'
  };

  function encodeGiftPayload(payload) {
    try {
      const json = JSON.stringify(payload);
      const bytes = new TextEncoder().encode(json);
      let binary = '';
      bytes.forEach(b => { binary += String.fromCharCode(b); });
      return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch {
      return '';
    }
  }

  function decodeGiftPayload(encoded) {
    try {
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return null;
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const rawGiftParam = urlParams.get('g');
  const sharedPayload = rawGiftParam ? decodeGiftPayload(rawGiftParam) : null;
  const isGiftReceiverMode = urlParams.get('edit') !== '1' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  const dialog = document.getElementById('greetingCard');
  const openButton = document.getElementById('openCard');
  const reading = document.getElementById('cardReading');
  const editor = document.getElementById('cardEditor');
  const editButton = document.getElementById('editCard');
  const copyShareLinkButton = document.getElementById('copyShareLink');
  const shareLinkBox = document.getElementById('shareLinkBox');
  const shareLinkOutput = document.getElementById('shareLinkOutput');
  const copyShareLinkBtn = document.getElementById('copyShareLinkBtn');
  const gardenLink = document.getElementById('gardenLink');
  const status = document.getElementById('cardStatus');
  const closeButton = document.getElementById('closeCard');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopLayout = window.matchMedia('(min-width: 1100px)');
  const sceneElements = [...document.querySelectorAll('.bouquet-composition, .scene-footer')];
  const layoutAnimations = new Set();
  const album = document.getElementById('memoryAlbum');
  const albumToggle = document.getElementById('toggleAlbum');
  const editAlbumBtn = document.getElementById('editAlbum');

  if (isGiftReceiverMode) {
    if (editButton) editButton.hidden = true;
    if (copyShareLinkButton) copyShareLinkButton.hidden = true;
    if (editAlbumBtn) editAlbumBtn.hidden = true;
  }

  const albumObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      album.classList.add('is-revealed');
      albumObserver.unobserve(album);
    }
  }, { threshold: 0.08 });

  let albumRevealPromise;
  function revealAlbum() {
    if (albumRevealPromise) return albumRevealPromise;
    const photos = [...album.querySelectorAll('img')];
    photos.forEach(photo => {
      const deferredSrc = photo.getAttribute('data-src');
      if (deferredSrc && photo.getAttribute('src')?.startsWith('data:image/gif')) {
        photo.src = deferredSrc;
      }
      photo.loading = 'eager';
    });
    albumRevealPromise = Promise.resolve(window.albumPhotosReady)
      .then(() => Promise.allSettled(photos.map(photo => photo.decode())))
      .then(() => {
        album.hidden = false;
        albumObserver.observe(album);
      });
    return albumRevealPromise;
  }

  albumToggle.addEventListener('click', () => {
    const expanded = album.classList.toggle('is-spread');
    albumToggle.setAttribute('aria-expanded', String(expanded));
    albumToggle.innerHTML = expanded ? 'Gấp album <span aria-hidden="true">♡</span>' : 'Xòe album <span aria-hidden="true">♡</span>';
  });
  document.getElementById('viewAlbum').addEventListener('click', async () => {
    await revealAlbum();
    album.classList.add('is-revealed');
    album.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
    albumToggle.focus({ preventScroll: true });
  });

  function reflowScene(changeLayout) {
    layoutAnimations.forEach(animation => animation.cancel());
    layoutAnimations.clear();
    const before = sceneElements.map(element => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left + window.scrollX, top: rect.top + window.scrollY, width: rect.width, height: rect.height };
    });
    changeLayout();
    if (motion.matches) return;
    sceneElements.forEach((element, index) => {
      const after = element.getBoundingClientRect();
      if (!after.width || !after.height) return;
      const dx = before[index].left - after.left - window.scrollX;
      const dy = before[index].top - after.top - window.scrollY;
      const scale = element.matches('.bouquet-composition')
        ? ` scale(${before[index].width / after.width}, ${before[index].height / after.height})` : '';
      const animation = element.animate([
        { transform: `translate(${dx}px, ${dy}px)${scale}` },
        { transform: 'none' }
      ], { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)' });
      layoutAnimations.add(animation);
      animation.onfinish = () => layoutAnimations.delete(animation);
    });
  }

  function revealCard() {
    const rect = dialog.getBoundingClientRect();
    if (!desktopLayout.matches || rect.top < 16 || rect.top > window.innerHeight * 0.35 || rect.bottom > window.innerHeight - 16) {
      dialog.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
    }
  }

  function setCardOpen(open) {
    if (dialog.open === open) return;
    reflowScene(() => {
      if (open) {
        showReading();
        status.textContent = '';
        document.body.classList.add('card-open');
        dialog.show();
      } else {
        dialog.close();
        document.body.classList.remove('card-open');
        showReading();
      }
      openButton.setAttribute('aria-expanded', String(open));
      openButton.querySelector('.envelope-action').textContent = open ? 'Gấp thiệp' : 'Mở thiệp';
    });
    if (open) {
      closeButton.focus({ preventScroll: true });
      revealAlbum();
      revealCard();
      document.dispatchEvent(new Event('bouquet:celebrate'));
    } else {
      openButton.focus({ preventScroll: true });
      const rect = openButton.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        openButton.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'center' });
      }
    }
  }

  motion.addEventListener('change', () => {
    if (motion.matches) {
      layoutAnimations.forEach(animation => animation.cancel());
      layoutAnimations.clear();
    }
  });

  const inputs = {
    recipient: document.getElementById('recipientInput'),
    title: document.getElementById('titleInput'),
    message: document.getElementById('messageInput'),
    sender: document.getElementById('senderInput')
  };
  let greeting = { ...defaultGreeting };

  if (sharedPayload && typeof sharedPayload === 'object') {
    if (typeof sharedPayload.r === 'string' && sharedPayload.r.trim()) greeting.recipient = sharedPayload.r.trim().slice(0, 60);
    if (typeof sharedPayload.t === 'string' && sharedPayload.t.trim()) greeting.title = sharedPayload.t.trim().slice(0, 120);
    if (typeof sharedPayload.m === 'string' && sharedPayload.m.trim()) greeting.message = sharedPayload.m.trim().slice(0, 1500);
    if (typeof sharedPayload.s === 'string' && sharedPayload.s.trim()) greeting.sender = sharedPayload.s.trim().slice(0, 60);
    window.sharedAlbumCaptions = Array.isArray(sharedPayload.c) ? sharedPayload.c : null;
  } else {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved === 'object') {
        if (typeof saved.recipient === 'string' && saved.recipient.trim()) greeting.recipient = saved.recipient.trim().slice(0, 60);
        if (typeof saved.title === 'string' && saved.title.trim()) greeting.title = saved.title.trim().slice(0, 120);
        if (typeof saved.message === 'string' && saved.message.trim()) greeting.message = saved.message.trim().slice(0, 1500);
        if (typeof saved.sender === 'string' && saved.sender.trim()) greeting.sender = saved.sender.trim().slice(0, 60);
      }
    } catch {
      // Keep default greeting when storage is unavailable
    }
  }

  const PUBLIC_BASE_URL = 'https://bryannlee202.github.io/20-10/';

  function buildShareUrl() {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseHref = isLocal && PUBLIC_BASE_URL ? PUBLIC_BASE_URL : window.location.origin + window.location.pathname;
    if (gardenLink) {
      gardenLink.href = './garden.html';
    }
    return baseHref.replace(/\/index\.html$/, '');
  }

  window.updateGiftShareUrl = buildShareUrl;

  function renderGreeting() {
    document.getElementById('cardRecipient').textContent = greeting.recipient;
    const envelopeRecipient = document.getElementById('envelopeRecipient');
    if (envelopeRecipient) {
      envelopeRecipient.textContent = `Gửi ${greeting.recipient.length > 12 ? 'em' : greeting.recipient}`;
    }
    const cardTitleEl = document.getElementById('cardTitle');
    if (cardTitleEl) {
      cardTitleEl.textContent = greeting.title || defaultGreeting.title;
    }
    const paragraphs = greeting.message.split(/\n\s*\n/).map(text => {
      const paragraph = document.createElement('span');
      paragraph.className = 'message-paragraph';
      paragraph.textContent = text;
      return paragraph;
    });
    document.getElementById('cardMessage').replaceChildren(...paragraphs);
    document.getElementById('cardSender').textContent = greeting.sender;
    buildShareUrl();
  }

  function showReading() {
    reading.hidden = false;
    editor.hidden = true;
    dialog.setAttribute('aria-labelledby', 'cardTitle');
    dialog.scrollTop = 0;
  }

  async function showAndCopyShareLink() {
    const link = buildShareUrl();
    if (shareLinkOutput && shareLinkBox) {
      shareLinkOutput.value = link;
      shareLinkBox.hidden = false;
    }
    try {
      await navigator.clipboard.writeText(link);
      status.textContent = '✨ Đã copy link gửi người yêu! Bạn có thể dán gửi qua Zalo / Messenger ngay.';
    } catch {
      if (shareLinkOutput) {
        shareLinkOutput.focus();
        shareLinkOutput.select();
      }
      status.textContent = 'Đã tạo link bên trên — bạn bấm Copy để gửi cho người yêu nhé.';
    }
  }

  if (copyShareLinkButton) {
    copyShareLinkButton.addEventListener('click', showAndCopyShareLink);
  }
  if (copyShareLinkBtn) {
    copyShareLinkBtn.addEventListener('click', showAndCopyShareLink);
  }

  document.addEventListener('bouquet:ready', () => { openButton.hidden = false; });
  document.addEventListener('bouquet:rose', event => {
    const wish = document.getElementById('roseWish');
    wish.classList.remove('is-new');
    wish.textContent = event.detail.message;
    void wish.offsetWidth;
    wish.classList.add('is-new');
  });
  document.getElementById('replayBloom').addEventListener('click', () => {
    document.dispatchEvent(new Event('bouquet:replay'));
    document.getElementById('roseWish').textContent = '';
  });

  openButton.addEventListener('click', () => setCardOpen(!dialog.open));
  closeButton.addEventListener('click', () => setCardOpen(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.open && !event.defaultPrevented) {
      event.preventDefault();
      setCardOpen(false);
    }
  });
  dialog.addEventListener('close', () => {
    if (dialog.open || !document.body.classList.contains('card-open')) return;
    document.body.classList.remove('card-open');
    openButton.setAttribute('aria-expanded', 'false');
    openButton.querySelector('.envelope-action').textContent = 'Mở thiệp';
    showReading();
  });

  editButton.addEventListener('click', () => {
    Object.keys(inputs).forEach(key => {
      if (inputs[key]) {
        inputs[key].value = greeting[key] || '';
        inputs[key].setCustomValidity('');
      }
    });
    reading.hidden = true;
    editor.hidden = false;
    status.textContent = '';
    dialog.setAttribute('aria-labelledby', 'editorTitle');
    dialog.scrollTop = 0;
    inputs.recipient.focus({ preventScroll: true });
    revealCard();
  });
  document.getElementById('cancelEdit').addEventListener('click', () => {
    showReading();
    editButton.focus({ preventScroll: true });
    revealCard();
  });
  Object.values(inputs).forEach(input => {
    if (input) input.addEventListener('input', () => input.setCustomValidity(''));
  });
  editor.addEventListener('submit', async event => {
    event.preventDefault();
    for (const input of Object.values(inputs)) {
      if (input) input.setCustomValidity(input.value.trim() ? '' : 'Bạn viết vài chữ vào đây nhé.');
    }
    if (!editor.reportValidity()) return;
    greeting = Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, input.value.trim()]));
    renderGreeting();
    showReading();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(greeting));
    } catch {
      // Ignore storage error
    }
    try {
      fetch('./api/save-greeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(greeting)
      }).catch(() => {});
    } catch {}
    await showAndCopyShareLink();
    revealCard();
  });
  renderGreeting();
})();
