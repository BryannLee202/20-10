const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

function updateAllBanToEm() {
  // 1. Update script.js WHISPER_NOTES & fast startup
  let script = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
  script = script
    .replace('const dpr = Math.min(window.devicePixelRatio || 2, 2.2);', 'const dpr = Math.min(window.devicePixelRatio || 1.5, 1.5);')
    .replace(/requestSceneRender\(\);\r?\n\}\);\s*$/, "requestSceneRender();\n}\nif (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startBouquetScene); else startBouquetScene();\n")
    .replace('Chúc bạn một ngày 20/10 ngập tràn yêu thương và những bất ngờ nho nhỏ.', 'Chúc em một ngày 20/10 ngập tràn yêu thương và những bất ngờ nho nhỏ.')
    .replace('Mong bạn luôn được lắng nghe, trân trọng và yêu thương theo cách mình xứng đáng.', 'Mong em luôn được lắng nghe, trân trọng và yêu thương theo cách em xứng đáng.')
    .replace('Chúc bạn đủ bình yên để nghỉ ngơi, đủ tự tin để theo đuổi điều mình thích.', 'Chúc em đủ bình yên để nghỉ ngơi, đủ tự tin để theo đuổi điều mình thích.')
    .replace('Một bông hoa dành cho nụ cười của bạn. Hôm nay nhớ vui thật nhiều nhé!', 'Một bông hoa dành cho nụ cười của em. Hôm nay nhớ vui thật nhiều nhé!')
    .replace('Chúc những dự định của bạn sớm đơm hoa, từng chút một, theo nhịp của riêng mình.', 'Chúc những dự định của em sớm đơm hoa, từng chút một, theo nhịp của riêng mình.')
    .replace('Mong mỗi ngày của bạn đều có một lý do thật nhỏ để mỉm cười.', 'Mong mỗi ngày của em đều có một lý do thật nhỏ để mỉm cười.')
    .replace('Chúc bạn luôn khỏe mạnh, an yên và có thật nhiều thời gian cho chính mình.', 'Chúc em luôn khỏe mạnh, an yên và có thật nhiều thời gian cho chính mình.');
  fs.writeFileSync(path.join(ROOT, 'script.js'), script, 'utf8');

  // 2. Update card.js
  let card = fs.readFileSync(path.join(ROOT, 'card.js'), 'utf8');
  card = card
    .replace("const STORAGE_KEY = 'flower.greeting.20-10.v1';", "const STORAGE_KEY = 'flower.greeting.20-10.v2';")
    .replace("Gửi ${greeting.recipient.length > 12 ? 'bạn' : greeting.recipient}", "Gửi ${greeting.recipient.length > 12 ? 'em' : greeting.recipient}");
  fs.writeFileSync(path.join(ROOT, 'card.js'), card, 'utf8');

  // 3. Update garden.html & garden-card.js
  let garden = fs.readFileSync(path.join(ROOT, 'garden.html'), 'utf8');
  garden = garden
    .replace('Dành bạn, cả một vườn thương.', 'Dành em, cả một vườn thương.')
    .replace('Chạm vào hoa, một điều dịu dàng đang chờ bạn.', 'Chạm vào hoa, một điều dịu dàng đang chờ em.')
    .replace('<span id="cardRecipient">bạn thương mến</span>', '<span id="cardRecipient">em yêu</span>')
    .replace('luôn nở bên bạn.', 'luôn nở bên em.')
    .replace('Còn bạn, làm thế giới này dịu dàng hơn.', 'Còn em, làm thế giới này dịu dàng hơn.')
    .replace('Nhân ngày 20/10, chúc bạn luôn được yêu thương, trân trọng và có thật nhiều niềm vui. Mong bạn đủ bình yên để tận hưởng những điều nhỏ bé, đủ tự tin để theo đuổi những điều mình yêu.', 'Nhân ngày 20/10, chúc em luôn được yêu thương, trân trọng và có thật nhiều niềm vui. Mong em đủ bình yên để tận hưởng những điều nhỏ bé, đủ tự tin để theo đuổi những điều mình yêu.')
    .replace('Gửi bạn thật nhiều thương mến ♡', 'Gửi em thật nhiều thương mến ♡')
    .replace('Cả vườn hoa đã nở. Một tấm thiệp dành tặng bạn.', 'Cả vườn hoa đã nở. Một tấm thiệp dành tặng em.');

  if (!garden.includes('back-to-bouquet')) {
    garden = garden.replace(
      '.garden-actions button:hover { background: #fae7ef; }',
      `.garden-actions button:hover, .garden-actions a:hover, .back-to-bouquet:hover { background: #fae7ef; }
    .back-to-bouquet {
      position: absolute; top: max(22px, env(safe-area-inset-top)); left: 50%; transform: translateX(-50%);
      z-index: 4; display: inline-flex; align-items: center; gap: 6px;
      border: 1px solid #dcb9c8; background: #fffdfcf2; border-radius: 30px;
      padding: 9px 18px; font-size: 12px; color: var(--ink); text-decoration: none;
      box-shadow: 0 3px 16px #76364d0c;
    }
    .garden-actions a {
      border: 1px solid #dcb9c8; background: #fffdfcf2; border-radius: 30px;
      padding: 12px 20px; font-size: 12px; color: var(--ink); text-decoration: none;
      box-shadow: 0 3px 16px #76364d0c;
    }
    .letter-actions a.view-garden { color: var(--ink); text-decoration: none; }`
    );
    garden = garden.replace(
      '<header class="page-header">',
      '<a class="back-to-bouquet" href="./index.html">← Bó hoa &amp; Album kỷ niệm ♡</a>\n    <header class="page-header">'
    );
    garden = garden.replace(
      '<button id="replay" type="button">Cho hoa nở lại</button>',
      '<button id="replay" type="button">Cho hoa nở lại</button>\n      <a href="./index.html">← Bó hoa &amp; Album ảnh ♡</a>'
    );
    garden = garden.replace(
      '<button class="view-garden" id="viewGarden" type="button" autofocus>Ngắm vườn hoa</button>',
      '<button class="view-garden" id="viewGarden" type="button" autofocus>Ngắm vườn hoa</button>\n            <a class="view-garden" href="./index.html">Xem Bó hoa &amp; Album kỷ niệm ♡</a>'
    );
  }
  garden = garden.replace(/href="\.\/index\.html"/g, 'href="./index.html?from=garden"');
  if (!garden.includes('./music.js')) {
    garden = garden.replace('<script src="./garden-card.js"></script>', '<script src="./garden-card.js"></script>\n  <script src="./music.js"></script>');
  }
  fs.writeFileSync(path.join(ROOT, 'garden.html'), garden, 'utf8');

  let gcard = fs.readFileSync(path.join(ROOT, 'garden-card.js'), 'utf8');
  gcard = gcard.replace("const STORAGE_KEY = 'flower.garden.greeting.20-10.v1';", "const STORAGE_KEY = 'flower.garden.greeting.20-10.v2';");
  fs.writeFileSync(path.join(ROOT, 'garden-card.js'), gcard, 'utf8');
}

function buildStandaloneHtml() {
  updateAllBanToEm();
  let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
  const scriptJs = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
  const cardJs = fs.readFileSync(path.join(ROOT, 'card.js'), 'utf8');
  const albumJs = fs.readFileSync(path.join(ROOT, 'album.js'), 'utf8');
  const musicJs = fs.readFileSync(path.join(ROOT, 'music.js'), 'utf8');
  const passlockJs = fs.readFileSync(path.join(ROOT, 'passlock.js'), 'utf8');
  const mp3Path = path.join(ROOT, 'assets', 'bg-music.mp3');
  const mp3B64 = fs.existsSync(mp3Path) ? `data:audio/mpeg;base64,${fs.readFileSync(mp3Path).toString('base64')}` : '';

  // Embed images as base64 data URLs so the single HTML file works 100% standalone
  html = html.replace(/data-src="(\.\/assets\/[^"]+)"/g, (match, relPath) => {
    const imgPath = path.join(ROOT, relPath);
    if (!fs.existsSync(imgPath)) return match;
    const ext = path.extname(imgPath).toLowerCase();
    const mime = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg';
    const b64 = fs.readFileSync(imgPath).toString('base64');
    return `data-src="data:${mime};base64,${b64}"`;
  });

  html = html.replace(
    'href="./garden.html"',
    'href="https://fab6a9bfd241d1.lhr.life/garden.html"'
  );

  html = html.replace('<link rel="stylesheet" href="./style.css">', `<style>\n${css}\n</style>`);
  html = html.replace(
    /<script src="\.\/script\.js" defer><\/script>[\s\S]*?<\/head>/,
    `<script>\nwindow.INLINE_BG_MUSIC_SRC = ${JSON.stringify(mp3B64)};\nwindow.addEventListener('DOMContentLoaded', () => {\n${scriptJs}\n${cardJs}\n${albumJs}\n${musicJs}\n${passlockJs}\n});\n</script>\n</head>`
  );

  const outPath = path.join(ROOT, 'Tang_Em_20_10.html');
  fs.writeFileSync(outPath, html, 'utf8');
  return outPath;
}

if (require.main === module) {
  const out = buildStandaloneHtml();
  console.log('Built standalone HTML & updated all ban->em:', out);
}

module.exports = { buildStandaloneHtml };
