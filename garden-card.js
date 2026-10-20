(() => {
  'use strict';

  const STORAGE_KEY = 'flower.garden.greeting.20-10.v2';
  const card = document.getElementById('wishCard');
  const reading = document.getElementById('cardReading');
  const editor = document.getElementById('cardEditor');
  const editButton = document.getElementById('editCard');
  const status = document.getElementById('cardStatus');
  const recipient = document.getElementById('cardRecipient');
  const title = document.getElementById('cardTitle');
  const message = document.getElementById('cardMessage');
  const signature = document.getElementById('cardSignature');
  const inputs = {
    recipient: document.getElementById('recipientInput'),
    title: document.getElementById('titleInput'),
    message: document.getElementById('messageInput'),
    signature: document.getElementById('signatureInput')
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
  const isGiftReceiverMode = Boolean(sharedPayload) && urlParams.get('edit') !== '1';

  if (isGiftReceiverMode && editButton) {
    editButton.hidden = true;
  }

  function readText(element) {
    const copy = element.cloneNode(true);
    copy.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    return copy.textContent.trim();
  }
  let greeting = {
    recipient: readText(recipient),
    title: readText(title),
    message: [...message.querySelectorAll('p')].map(readText).join('\n\n'),
    signature: readText(signature)
  };

  function renderGreeting() {
    recipient.textContent = greeting.recipient;
    title.textContent = greeting.title;
    signature.textContent = greeting.signature;
    message.replaceChildren(...greeting.message.split(/\n\s*\n/).map(text => {
      const paragraph = document.createElement('p');
      paragraph.className = 'message';
      paragraph.textContent = text;
      return paragraph;
    }));
  }

  if (sharedPayload && typeof sharedPayload === 'object') {
    if (typeof sharedPayload.r === 'string' && sharedPayload.r.trim()) greeting.recipient = sharedPayload.r.trim().slice(0, 60);
    if (typeof sharedPayload.t === 'string' && sharedPayload.t.trim()) greeting.title = sharedPayload.t.trim().slice(0, 160);
    if (typeof sharedPayload.m === 'string' && sharedPayload.m.trim()) greeting.message = sharedPayload.m.trim().slice(0, 3000);
    if (typeof sharedPayload.s === 'string' && sharedPayload.s.trim()) greeting.signature = sharedPayload.s.trim().slice(0, 120);
    renderGreeting();
  } else {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && Object.entries(inputs).every(([key, input]) =>
        typeof saved[key] === 'string' && saved[key].trim() && saved[key].length <= input.maxLength)) {
        greeting = Object.fromEntries(Object.keys(inputs).map(key => [key, saved[key].trim()]));
        renderGreeting();
      }
    } catch {
      // Keep the original letter when storage is unavailable or malformed.
    }
  }

  function showReading() {
    editor.hidden = true;
    reading.hidden = false;
    card.setAttribute('aria-labelledby', 'cardTitle');
    card.scrollTop = 0;
  }

  editButton.addEventListener('click', () => {
    Object.entries(inputs).forEach(([key, input]) => {
      input.value = greeting[key];
      input.setCustomValidity('');
    });
    reading.hidden = true;
    editor.hidden = false;
    status.textContent = '';
    card.setAttribute('aria-labelledby', 'editorTitle');
    card.scrollTop = 0;
    inputs.recipient.focus({ preventScroll: true });
  });
  document.getElementById('cancelEdit').addEventListener('click', () => {
    showReading();
    editButton.focus({ preventScroll: true });
  });
  card.addEventListener('close', () => {
    showReading();
    status.textContent = '';
  });
  Object.values(inputs).forEach(input => {
    input.addEventListener('input', () => input.setCustomValidity(''));
  });
  editor.addEventListener('submit', async event => {
    event.preventDefault();
    Object.values(inputs).forEach(input => {
      input.setCustomValidity(input.value.trim() ? '' : 'Bạn viết vài chữ vào đây nhé.');
    });
    if (!editor.reportValidity()) return;
    greeting = Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, input.value.trim()]));
    renderGreeting();
    showReading();
    const encoded = encodeGiftPayload({
      r: greeting.recipient,
      t: greeting.title,
      m: greeting.message,
      s: greeting.signature
    });
    const shareUrl = new URL(window.location.href);
    shareUrl.searchParams.set('g', encoded);
    shareUrl.searchParams.delete('edit');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(greeting));
      await navigator.clipboard.writeText(shareUrl.toString());
      status.textContent = '✨ Đã lưu và copy link gửi người yêu vào bộ nhớ tạm!';
    } catch {
      status.textContent = 'Đã lưu lời chúc của bạn.';
    }
    editButton.focus({ preventScroll: true });
  });
})();
