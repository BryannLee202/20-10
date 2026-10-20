const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = Number(process.env.PORT || 8090);
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg'
};

const COMPRESSIBLE_EXTS = new Set(['.html', '.css', '.js', '.json', '.svg']);
const cache = new Map();

function getCachedFile(fullPath, ext) {
  const stat = fs.statSync(fullPath);
  const mtimeMs = stat.mtimeMs;
  const cached = cache.get(fullPath);
  if (cached && cached.mtimeMs === mtimeMs) {
    return cached;
  }
  const raw = fs.readFileSync(fullPath);
  const gzipped = COMPRESSIBLE_EXTS.has(ext) ? zlib.gzipSync(raw, { level: 9 }) : null;
  const entry = { mtimeMs, raw, gzipped };
  cache.set(fullPath, entry);
  return entry;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'POST' && parsedUrl.pathname === '/api/save-photo') {
      const { index, dataUrl } = await readJsonBody(req);
      const photoIndex = Number(index);
      if ([1, 2, 3, 4].includes(photoIndex) && typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
        const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
        const fileName = `couple-${photoIndex}.jpg`;
        const filePath = path.join(ROOT, 'assets', fileName);
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        cache.clear();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, file: `./assets/${fileName}` }));
        return;
      }
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false }));
      return;
    }

    if (req.method === 'POST' && parsedUrl.pathname === '/api/save-greeting') {
      const greeting = await readJsonBody(req);
      const cardJsPath = path.join(ROOT, 'card.js');
      if (fs.existsSync(cardJsPath) && greeting && typeof greeting.recipient === 'string') {
        let code = fs.readFileSync(cardJsPath, 'utf8');
        const replacement = `  const defaultGreeting = {\n    recipient: ${JSON.stringify(greeting.recipient)},\n    title: ${JSON.stringify(greeting.title || 'Chúc em một ngày\\nthật nhiều yêu thương.')},\n    message: ${JSON.stringify(greeting.message)},\n    sender: ${JSON.stringify(greeting.sender)}\n  };`;
        code = code.replace(/  const defaultGreeting = \{[\s\S]*?\};/, replacement);
        fs.writeFileSync(cardJsPath, code, 'utf8');
        cache.clear();
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    let reqPath = decodeURIComponent(parsedUrl.pathname);
    if (reqPath === '/') reqPath = '/index.html';
    const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, '');
    const fullPath = path.join(ROOT, safePath);

    if (!fullPath.startsWith(ROOT) || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const entry = getCachedFile(fullPath, ext);
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const isMediaOrFont = ['.jpg', '.jpeg', '.png', '.webp', '.woff2', '.mp3'].includes(ext);
    const headers = {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': isMediaOrFont ? 'public, max-age=86400' : 'public, max-age=60',
      'Accept-Ranges': 'bytes'
    };

    const range = req.headers.range;
    if (ext === '.mp3' && range) {
      const total = entry.raw.length;
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10) || 0;
      const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
      if (start >= 0 && start < total && end >= start && end < total) {
        const chunk = entry.raw.subarray(start, end + 1);
        res.writeHead(206, {
          ...headers,
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Content-Length': chunk.length
        });
        res.end(chunk);
        return;
      }
    }

    if (entry.gzipped && acceptEncoding.includes('gzip')) {
      headers['Content-Encoding'] = 'gzip';
      headers['Content-Length'] = entry.gzipped.length;
      res.writeHead(200, headers);
      res.end(entry.gzipped);
    } else {
      headers['Content-Length'] = entry.raw.length;
      res.writeHead(200, headers);
      res.end(entry.raw);
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server error: ' + err.message);
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌸 Web Hoa 20/10 (Gzip + Fast Cache) tại: http://localhost:${PORT}`);
  console.log(`🌷 Trang Vườn hoa nở:                    http://localhost:${PORT}/garden.html`);
  console.log(`====================================================`);
});
