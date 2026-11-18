// 설정 파일 읽기와 토큰 역조회 표 만들기. 설정 항목은 README.md 에 있다.
const fs = require('fs'), path = require('path');

const fail = msg => { console.error('mockup-spec: ' + msg); process.exit(2); };

// '#rgb' · '#rgba' · '#rrggbb' · '#rrggbbaa' → 소문자 '#rrggbb[aa]'. 알파가 ff 면 뗀다. 아니면 null.
function norm(v) {
  const m = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(String(v).trim());
  if (!m) return null;
  let h = m[1].toLowerCase();
  if (h.length <= 4) h = [...h].map(c => c + c).join('');
  return '#' + (h.length === 8 && h.endsWith('ff') ? h.slice(0, 6) : h);
}
// JSON 토큰: 문자열 잎, 또는 { $value } / { value } 객체. 이름은 경로를 '.' 로 잇는다.
function walk(o, p) {
  if (typeof o === 'string') { const h = norm(o); return h ? [[h, p.join('.')]] : []; }
  if (!o || typeof o !== 'object') return [];
  const v = o.$value ?? o.value;
  if (typeof v === 'string') return walk(v, p);
  return Object.entries(o).flatMap(([k, x]) => k.startsWith('$') ? [] : walk(x, [...p, k]));
}
// 토큰 파일 본문 → [[hex, 이름]]. 플랫폼이 늘면 형식 하나를 여기 더한다.
const PARSERS = {
  // Flutter: static const name = Color(0xAARRGGBB)
  dart: s => [...s.matchAll(/static const (\w+) = Color\(0x([0-9A-Fa-f]{8})\)/g)]
    .map(m => [norm('#' + m[2].slice(2) + m[2].slice(0, 2)), m[1]]),
  // CSS·SCSS: --name: #hex
  css: s => [...s.matchAll(/(--[\w-]+)\s*:\s*(#[0-9A-Fa-f]{3,8})\b/g)]
    .map(m => [norm(m[2]), m[1]]).filter(([h]) => h),
  json: s => walk(JSON.parse(s), []),
};

// 값 → 이름 목록. 설정의 순서가 우선순위다(앞의 이름이 먼저 붙는다).
function loadTokens(list, at) {
  const T = {};
  for (const t of list) {
    const file = at(t.file), parse = PARSERS[t.format];
    if (!parse) fail('토큰 형식을 모른다: ' + t.format + ' (dart · css · json)');
    if (!fs.existsSync(file)) { console.error('mockup-spec: 토큰 파일 없음, 건너뜀 — ' + file); continue; }
    for (const [hex, name] of parse(fs.readFileSync(file, 'utf8'))) (T[hex] = T[hex] || []).push((t.prefix || '') + name);
  }
  return T;
}

// argv → { cfg, names }. 설정 파일은 --config <파일> 또는 MOCKUP_SPEC_CONFIG.
// 설정 안의 상대 경로는 설정 파일이 있는 폴더 기준이다. CHROME · JOBS · VTB 환경변수가 설정보다 앞선다.
function load(argv) {
  const i = argv.indexOf('--config'), names = argv.filter((_, j) => i < 0 || (j !== i && j !== i + 1));
  const file = i >= 0 ? argv[i + 1] : process.env.MOCKUP_SPEC_CONFIG;
  if (!file) fail('설정 파일이 없다 — --config <파일> 또는 환경변수 MOCKUP_SPEC_CONFIG 로 준다');
  if (!fs.existsSync(file)) fail('설정 파일을 찾을 수 없다: ' + file);
  let c; try { c = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { fail('설정 JSON 오류 (' + file + '): ' + e.message); }
  const dir = path.dirname(path.resolve(file));
  const at = p => path.resolve(dir, p);
  for (const k of ['root', 'out']) if (!c[k]) fail('설정에 "' + k + '" 가 없다');
  const cfg = {
    root: at(c.root), pages: (c.pages || '.').replace(/\\/g, '/'), out: at(c.out),
    chrome: process.env.CHROME || (c.chrome && at(c.chrome)),
    viewport: c.viewport || [390, 844], fonts: c.fonts || [], themeAttr: c.themeAttr || '',
    meta: c.meta ? new RegExp(c.meta) : null, port: Number(c.port || 0),
    jobs: Number(process.env.JOBS || c.jobs || 4), budget: Number(process.env.VTB || c.virtualTimeBudget || 20000),
    tokens: loadTokens(c.tokens || [], at),
  };
  if (!cfg.chrome) fail('Chrome 경로가 없다 — 환경변수 CHROME 또는 설정 "chrome" 에 chrome(-headless-shell).exe 경로를 준다');
  if (!fs.existsSync(cfg.chrome)) fail('Chrome 실행 파일이 없다: ' + cfg.chrome);
  if (!fs.existsSync(path.join(cfg.root, cfg.pages))) fail('목업 폴더가 없다: ' + path.join(cfg.root, cfg.pages));
  return { cfg, names };
}

module.exports = { norm, PARSERS, loadTokens, load, fail };
