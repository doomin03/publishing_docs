// 크롬 없이 도는 자체 검사: 토큰 파서 셋과 색 역조회. 사용: node check.js
const assert = require('assert');
const { norm, PARSERS } = require('./config');
const { hex, lines } = require('./format');

assert.strictEqual(norm('#FFF'), '#ffffff');
assert.strictEqual(norm('#102128ff'), '#102128');
assert.strictEqual(norm('#bcd8ce2e'), '#bcd8ce2e');
assert.strictEqual(norm('#12345'), null);

assert.deepStrictEqual(PARSERS.dart('static const homeDeep = Color(0xFF102128);\nstatic const veil = Color(0x2EBCD8CE);'),
  [['#102128', 'homeDeep'], ['#bcd8ce2e', 'veil']]);
assert.deepStrictEqual(PARSERS.css(':root { --background: #ffffff; --border: rgba(55, 53, 47, 0.09); --ring:#2383E2 }'),
  [['#ffffff', '--background'], ['#2383e2', '--ring']]);
assert.deepStrictEqual(PARSERS.json('{"color":{"brand":{"$value":"#F4BB81"},"$description":"x","ink":"#102b30","size":4}}'),
  [['#f4bb81', 'color.brand'], ['#102b30', 'color.ink']]);

const ctx = { tokens: { '#102128': ['DkColors.homeDeep'] }, tones: { '#102128': ['tone-deep'] }, fonts: ['Pretendard'] };
assert.strictEqual(hex('rgb(16, 33, 40)', ctx), '#102128=DkColors.homeDeep|tone-deep');
assert.strictEqual(hex('rgba(16, 33, 40, 0.64)', ctx), '#102128a3=DkColors.homeDeep|tone-deep@64%');
assert.strictEqual(hex('color(srgb 1 1 1 / 0.5)', ctx), '#ffffff80');

const leaf = (tx, x) => ({ t: 'div', c: 'metric', id: '', b: [x, 0, 10, 10], s: { 'font-family': 'Pretendard' }, tx, src: '', k: [] });
assert.deepStrictEqual(lines([leaf('키', 0), leaf('몸무게', 20)], 0, ctx, []),
  ['div.metric [0,0 10×10] font 16/400 c #000000 「키」 ×2 나머지「몸무게」']);
console.log('check ok');
