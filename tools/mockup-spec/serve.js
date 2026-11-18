// 목업 루트를 127.0.0.1 의 빈 포트로 내보내고, 하네스(spec.html)를 같은 출처의 예약 경로에 얹는다.
// 같은 출처여야 하네스가 iframe 안 문서(contentDocument)의 계산값을 읽을 수 있다.
// ponytail: 정적 파일만 낸다. 목업이 API·SPA 라우팅을 요구하면 외부 서버 모드를 그때 더한다.
const http = require('http'), fs = require('fs'), path = require('path');
const HARNESS = '/__mockup-spec__/spec.html';
const TEXT = 'charset=utf-8';
const MIME = {
  '.html': 'text/html; ' + TEXT, '.htm': 'text/html; ' + TEXT, '.css': 'text/css; ' + TEXT,
  '.js': 'text/javascript; ' + TEXT, '.mjs': 'text/javascript; ' + TEXT, '.json': 'application/json; ' + TEXT,
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf',
};

// port 0 = 빈 포트. 목업이 http://127.0.0.1:<포트>/… 절대 주소를 품고 있으면 그 포트를 설정에 준다.
function serve(root, harness, port = 0) {
  return new Promise((ok, no) => {
    const srv = http.createServer((req, res) => {
      let p = '';
      try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { /* 잘못된 주소 → 403 */ }
      const file = p === HARNESS ? harness : path.join(root, p);
      if (file !== harness && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
      fs.readFile(file, (e, body) => {
        if (e) { res.writeHead(404); return res.end(); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
        res.end(body);
      });
    });
    srv.on('error', e => no(new Error(e.code === 'EADDRINUSE' ? '포트 ' + port + ' 를 이미 다른 프로세스가 쓰고 있다' : e.message)))
      .listen(port, '127.0.0.1', () => ok(srv));
  });
}
module.exports = { serve, HARNESS };
