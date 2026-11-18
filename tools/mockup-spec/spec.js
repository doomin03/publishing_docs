// 목업 HTML(한 장 평균 수백 KB, 대부분 CSS) → 화면별 압축 스펙(<out>/<화면>.md, 수 KB).
// 사용: node spec.js --config <설정.json> [화면…]   — README.md · 형식 = SPEC-FORMAT.md
// 퍼블리싱 에이전트는 원본 HTML 대신 이 출력을 읽는다. 값은 브라우저 계산값이라
// 캐스케이드·!important·display:none·테마 재매핑을 사람이 풀 필요가 없다.
const { execFile } = require('child_process');
const fs = require('fs'), path = require('path');
const { load, fail } = require('./config');
const { lines } = require('./format');
const { serve, HARNESS } = require('./serve');
const NL = String.fromCharCode(10);
const { cfg, names: args } = load(process.argv.slice(2));
const PAGES = path.join(cfg.root, cfg.pages);
const [W, H] = cfg.viewport;

const chrome = url => new Promise(ok => execFile(cfg.chrome, ['--headless', '--disable-gpu', '--no-sandbox', '--enable-unsafe-swiftshader',
  '--window-size=' + W + ',' + H, '--virtual-time-budget=' + cfg.budget, '--dump-dom', url],
  { encoding: 'utf8', timeout: 120000, maxBuffer: 1 << 28 }, (e, o) => ok(o || (e && e.stdout) || '')));
const unescape = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

async function one(name, base) {
  const rel = path.posix.join(cfg.pages, name + '.html'), file = path.join(cfg.root, rel);
  if (!fs.existsSync(file)) return console.log(name + '\tNOT-FOUND ' + file);
  const qs = new URLSearchParams({ src: encodeURI('/' + rel), w: W, h: H, fonts: cfg.fonts.join(','), theme: cfg.themeAttr });
  const m = (await chrome(base + HARNESS + '?' + qs)).match(/<pre id="out">([\s\S]*?)<\/pre>/);
  if (!m) return console.log(name + '\tNO-OUTPUT');
  const d = JSON.parse(unescape(m[1])), tones = {};
  for (const t of d.tones.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)) (tones[t[2].toLowerCase()] = tones[t[2].toLowerCase()] || []).push(t[1]);
  const src = fs.readFileSync(file, 'utf8'), meta = cfg.meta && (src.match(cfg.meta) || [])[0];
  const F = cfg.fonts[0];
  const md = ['# ' + name + ' — 목업 계산값 스펙', '',
    '- 원본: `' + rel + '` (' + Math.round(src.length / 1024) + 'KB)' + (meta ? ' · ' + meta : ''),
    '- 테마: ' + (d.theme ? '`' + d.theme + '` (`' + cfg.themeAttr + '` — 색은 이 테마로 재매핑된 계산값이다)' : '없음'),
    '- 폰트: ' + (!F ? '확인 안 함' : d.font ? F + ' 로드됨' : '🔴 ' + F + ' 미로드 — 글자 박스 치수를 믿지 말 것')
      + ' · 뷰포트 ' + W + '×' + H + ' · 문서 높이 ' + d.h + 'px',
    '- 읽는 법: `선택자 [x,y w×h] 속성` · 들여쓰기=포함 관계 · ×N=같은 모양 반복 · `#hex=토큰` 은 값이 같은 토큰', '',
    '```', ...lines(d.tree, 0, { tokens: cfg.tokens, tones, fonts: cfg.fonts }, []), '```', ''].join(NL);
  fs.writeFileSync(path.join(cfg.out, name + '.md'), md);
  console.log([name, d.theme || '-', !F ? 'FONT-NOT-CHECKED' : d.font ? 'font' : 'NOFONT', Math.round(src.length / 1024) + 'KB→' + (md.length / 1024).toFixed(1) + 'KB'].join('\t'));
  return { name, theme: d.theme, font: F ? d.font : null, kb: md.length / 1024, src: src.length / 1024 };
}

(async () => {
  fs.mkdirSync(cfg.out, { recursive: true });
  const names = args.length ? args
    : fs.readdirSync(PAGES).filter(f => f.endsWith('.html') && f !== 'index.html' && !f.startsWith('_')).map(f => f.slice(0, -5));
  const srv = await serve(cfg.root, path.join(__dirname, 'spec.html'), cfg.port).catch(e => fail(e.message));
  const base = 'http://127.0.0.1:' + srv.address().port;
  const q = [...names], done = [];
  try {
    await Promise.all(Array.from({ length: Math.max(1, cfg.jobs) }, async () => {
      while (q.length) { const r = await one(q.shift(), base); if (r) done.push(r); }
    }));
  } finally { srv.close(); }
  if (done.length < names.length) process.exitCode = 1;   // NOT-FOUND · NO-OUTPUT 이 하나라도 있으면 실패
  if (args.length) return;   // 일부만 뽑을 때는 목록을 덮어쓰지 않는다
  done.sort((a, b) => a.name.localeCompare(b.name));
  fs.writeFileSync(path.join(cfg.out, 'README.md'), ['# 목업 계산값 스펙 — 목록', '',
    '`tools/mockup-spec/spec.js` 가 만든다. 손으로 고치지 않는다. 원본 HTML 합계 ' + Math.round(done.reduce((a, r) => a + r.src, 0)) + 'KB → 스펙 합계 '
    + Math.round(done.reduce((a, r) => a + r.kb, 0)) + 'KB.', '', '| 화면 | 테마 | 폰트 | 스펙 |', '|---|---|---|---|',
    ...done.map(r => `| [${r.name}](${r.name}.md) | ${r.theme || '—'} | ${r.font == null ? '—' : r.font ? '✓' : '🔴'} | ${r.kb.toFixed(1)}KB |`), ''].join(NL));
})();
