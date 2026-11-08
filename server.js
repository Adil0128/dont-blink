/**
 * Zero-dependency Node.js HTTP Server for "DON'T BLINK"
 * Run with: agy-node server.js OR node server.js
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.mjs': 'text/javascript; charset=UTF-8',
  '.ts': 'text/typescript; charset=UTF-8',
  '.tsx': 'text/typescript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
};

const server = http.createServer((req, res) => {
  // Parse clean URL
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;

  if (pathname === '/' || pathname === '') {
    // Check if standalone index.html or root index.html exists
    if (fs.existsSync(path.join(__dirname, 'dont-blink.html'))) {
      pathname = '/dont-blink.html';
    } else {
      pathname = '/index.html';
    }
  }

  let filePath = path.join(__dirname, pathname);

  // If path doesn't exist, try falling back to index.html or dont-blink.html
  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(path.join(__dirname, 'dont-blink.html'))) {
      filePath = path.join(__dirname, 'dont-blink.html');
    } else {
      filePath = path.join(__dirname, 'index.html');
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Internal Server Error: ${err.message}`);
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`⚡ "DON'T BLINK" Arcade Server Running!`);
  console.log(`👉 Open: http://localhost:${PORT}`);
  console.log(`========================================\n`);
});
