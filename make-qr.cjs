const fs = require('fs');

async function makeQrSvg() {
  const targetUrl = 'https://bryannlee202.github.io/20-10/';
  const qrRes = await fetch('https://api.qrserver.com/v1/create-qr-code/?size=360x360&ecc=H&margin=0&color=c53b68&bgcolor=ffffff&data=' + encodeURIComponent(targetUrl));
  const qrPngBuf = Buffer.from(await qrRes.arrayBuffer());
  const qrDataUrl = 'data:image/png;base64,' + qrPngBuf.toString('base64');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#fffdfb"/>
      <stop offset="70%" stop-color="#fdf5f3"/>
      <stop offset="100%" stop-color="#f8e6e4"/>
    </radialGradient>
    <linearGradient id="coneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8c6d6"/>
      <stop offset="55%" stop-color="#f2adc3"/>
      <stop offset="100%" stop-color="#e793ae"/>
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#a43054" flood-opacity="0.16"/>
    </filter>
    <g id="blossom5">
      <ellipse cx="0" cy="-24" rx="14" ry="23" fill="#f4adc1"/>
      <ellipse cx="0" cy="-24" rx="14" ry="23" fill="#f4adc1" transform="rotate(72)"/>
      <ellipse cx="0" cy="-24" rx="14" ry="23" fill="#f4adc1" transform="rotate(144)"/>
      <ellipse cx="0" cy="-24" rx="14" ry="23" fill="#f4adc1" transform="rotate(216)"/>
      <ellipse cx="0" cy="-24" rx="14" ry="23" fill="#f4adc1" transform="rotate(288)"/>
      <circle cx="0" cy="0" r="6" fill="#2b3654"/>
    </g>
    <g id="navyBlossom">
      <ellipse cx="0" cy="-16" rx="9" ry="15" fill="#2b3654"/>
      <ellipse cx="0" cy="-16" rx="9" ry="15" fill="#2b3654" transform="rotate(72)"/>
      <ellipse cx="0" cy="-16" rx="9" ry="15" fill="#2b3654" transform="rotate(144)"/>
      <ellipse cx="0" cy="-16" rx="9" ry="15" fill="#2b3654" transform="rotate(216)"/>
      <ellipse cx="0" cy="-16" rx="9" ry="15" fill="#2b3654" transform="rotate(288)"/>
      <circle cx="0" cy="0" r="4" fill="#f4adc1"/>
    </g>
    <g id="leafCluster">
      <ellipse cx="0" cy="-38" rx="15" ry="36" fill="#2b3654" transform="rotate(-26)"/>
      <ellipse cx="0" cy="-48" rx="17" ry="44" fill="#2b3654" transform="rotate(3)"/>
      <ellipse cx="0" cy="-34" rx="14" ry="34" fill="#2b3654" transform="rotate(30)"/>
    </g>
  </defs>

  <rect x="24" y="24" width="1032" height="1032" rx="56" fill="url(#bgGrad)"/>
  <rect x="44" y="44" width="992" height="992" rx="42" fill="none" stroke="#e9c6d2" stroke-width="2" opacity="0.6"/>

  <polygon points="540,126 665,240 415,240" fill="#e79bb2"/>

  <use href="#leafCluster" transform="translate(652,212) rotate(22) scale(1.12)"/>
  <use href="#leafCluster" transform="translate(255,360) rotate(-45) scale(1.05)"/>
  <use href="#leafCluster" transform="translate(865,392) rotate(50) scale(1.15)"/>
  <use href="#blossom5" transform="translate(472,172) rotate(12) scale(0.95)"/>
  <use href="#navyBlossom" transform="translate(825,292) rotate(24) scale(1.1)"/>

  <rect x="306" y="198" width="468" height="360" rx="82" fill="none" stroke="#394463" stroke-width="2.4"/>

  <path d="M225,390 Q320,340 390,520 L540,820 L340,650 Z" fill="#f2b8c9"/>
  <path d="M855,370 Q750,330 680,520 L540,820 L745,650 Z" fill="#eca6bc"/>

  <g filter="url(#cardShadow)">
    <rect x="338" y="212" width="404" height="404" rx="26" fill="#ffffff" stroke="#c83e6b" stroke-width="5"/>
    <rect x="345" y="219" width="390" height="390" rx="20" fill="none" stroke="#f3c178" stroke-width="3"/>
    <image x="362" y="236" width="356" height="356" href="${qrDataUrl}"/>
    <rect x="514" y="388" width="52" height="52" rx="14" fill="#ffffff" stroke="#f4b0c4" stroke-width="2.5"/>
    <path d="M540,425 C540,425 524,414 524,406 C524,401 528,398 532,398 C536,398 540,402 540,402 C540,402 544,398 548,398 C552,398 556,401 556,406 C556,414 540,425 540,425 Z" fill="#d83b6a"/>
  </g>

  <g transform="translate(822,412) rotate(32) scale(1.25)">
    <ellipse cx="0" cy="42" rx="15" ry="38" fill="#f2a2ba" transform="rotate(-50)"/>
    <ellipse cx="0" cy="42" rx="15" ry="38" fill="#f2a2ba" transform="rotate(-25)"/>
    <ellipse cx="0" cy="42" rx="15" ry="38" fill="#f2a2ba"/>
    <ellipse cx="0" cy="42" rx="15" ry="38" fill="#f2a2ba" transform="rotate(25)"/>
    <ellipse cx="0" cy="42" rx="15" ry="38" fill="#f2a2ba" transform="rotate(50)"/>
    <path d="M-32,0 A32,32 0 0,1 32,0 Z" fill="#2b3654"/>
  </g>

  <use href="#blossom5" transform="translate(305,385) rotate(8) scale(1.02)"/>
  <use href="#navyBlossom" transform="translate(268,438) rotate(30) scale(0.95)"/>
  <use href="#blossom5" transform="translate(348,502) rotate(15) scale(0.48)"/>
  <use href="#leafCluster" transform="translate(635,650) rotate(32) scale(0.85)"/>
  <use href="#leafCluster" transform="translate(520,668) rotate(-20) scale(0.75)"/>
  <use href="#blossom5" transform="translate(598,636) rotate(20) scale(1.18)"/>
  <use href="#blossom5" transform="translate(465,636) rotate(10) scale(0.56)"/>
  <use href="#navyBlossom" transform="translate(528,682) rotate(22) scale(0.95)"/>

  <polygon points="510,825 585,825 638,955 595,962 575,995 482,942" fill="#ea9ab2"/>
  <path d="M260,465 Q385,650 595,835 L502,845 Q335,690 260,465 Z" fill="#f5bdd0"/>
  <path d="M790,455 Q685,680 588,845 L498,845 Q405,680 325,540 Q490,725 635,680 Q725,575 790,455 Z" fill="url(#coneGrad)"/>

  <rect x="330" y="800" width="420" height="64" rx="14" fill="#fffcfb" opacity="0.72"/>
  <path d="M555,825 C500,770 495,855 555,825 M555,825 C610,770 615,855 555,825 M555,825 Q530,865 535,895 M555,825 Q580,865 590,888" fill="none" stroke="#394463" stroke-width="2.4" stroke-linecap="round"/>
  <text x="540" y="842" text-anchor="middle" fill="#c84669" font-family="'Palatino Linotype', 'Book Antiqua', Georgia, serif" font-style="italic" font-size="35">Gửi em - ngày 20 tháng 10 ♡</text>
</svg>`;

  fs.writeFileSync('c:/Web_RIN/flowers-20-10/QR_Bo_Hoa_Tang_Em_20_10.svg', svg, 'utf8');
  fs.writeFileSync('C:/Users/tai/.gemini/antigravity/brain/30356c0e-335d-44c8-909d-e456e6b5bfb9/QR_Bo_Hoa_Tang_Em_20_10.svg', svg, 'utf8');
  console.log('Saved SVG QR Bouquet!');
}

makeQrSvg().catch(console.error);
