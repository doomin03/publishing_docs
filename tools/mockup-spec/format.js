// 계산값 트리(spec.html 출력) → 스펙 본문 줄. 형식의 정의 = SPEC-FORMAT.md.
// ctx = { tokens: {hex: [이름]}, tones: {hex: [이름]}, fonts: [기본 글꼴 이름] }
const h2 = n => Math.round(n).toString(16).padStart(2, '0');
function hex(v, ctx) {   // rgb()/rgba()/color(srgb …) → #rrggbb[aa]=토큰
  return v.replace(/rgba?\(([^)]+)\)|color\(srgb ([^)]+)\)/g, (all, rgb, srgb) => {
    let p = (rgb || srgb).split(/[\s,/]+/).filter(Boolean).map(Number);
    if (srgb) p = [p[0] * 255, p[1] * 255, p[2] * 255, p[3] ?? 1];
    const base = '#' + h2(p[0]) + h2(p[1]) + h2(p[2]), a = p[3] ?? 1;
    const name = (ctx.tokens[base] || []).concat(ctx.tones[base] || []).slice(0, 2).join('|');
    return base + (a < 1 ? h2(a * 255) : '') + (name ? '=' + name + (a < 1 ? '@' + Math.round(a * 100) + '%' : '') : '');
  });
}
const short = (v, n) => v.length > n ? v.slice(0, n) + '…' : v;
function props(n, ctx) {
  const s = n.s, o = [];
  if (s['background-color']) o.push('bg ' + hex(s['background-color'], ctx));
  if (s['background-image']) o.push('bgimg ' + short(hex(s['background-image'].replace(/url\("?[^")]*\/([^/")?]+)[^)]*\)/g, 'url($1)'), ctx), 90));
  if (s['backdrop-filter']) o.push('blur ' + s['backdrop-filter']);
  if (s['box-shadow']) o.push('shadow ' + short(hex(s['box-shadow'], ctx), 70));
  if (s.border) o.push('border ' + hex(s.border, ctx));
  for (const [k, a] of [['border-radius', 'r'], ['padding', 'pad'], ['gap', 'gap'], ['opacity', 'op'], ['position', 'pos'], ['overflow', 'ovf'], ['object-fit', 'fit']])
    if (s[k]) o.push(a + ' ' + s[k].replace(/px/g, ''));
  if (/flex|grid/.test(s.display || '')) o.push((s.display.includes('grid') ? 'grid' : s['flex-direction'] === 'column' ? 'col' : 'row')
    + [s['align-items'], s['justify-content']].filter(Boolean).map(x => ' ' + x.replace('space-', 's-')).join(''));
  const ff = s['font-family'];   // 기본 글꼴(설정 fonts)이면 생략한다
  if (n.tx) o.push('font ' + (s['font-size'] || '16px').replace('px', '') + '/' + (s['font-weight'] || 400)
    + (s['line-height'] ? ' lh' + s['line-height'].replace('px', '') : '') + (s['letter-spacing'] ? ' ls' + s['letter-spacing'].replace('px', '') : '')
    + (!ff || ctx.fonts.some(f => ff.includes(f)) ? '' : ' ff ' + short(ff, 24)) + ' c ' + hex(s.color || 'rgb(0, 0, 0)', ctx)
    + (s['text-align'] ? ' ' + s['text-align'] : '') + ' 「' + n.tx + '」');
  if (n.src) o.push('img ' + n.src);
  return o.join(' · ');
}
const sig = n => n.t + (n.c ? '.' + n.c : '') + (n.id ? '#' + n.id : '');
const text = n => [n.tx, ...n.k.map(text)].filter(Boolean).join(' ');   // 반복 행은 글자가 자손에 있다
function lines(list, depth, ctx, out) {
  for (let i = 0; i < list.length; i++) {
    const n = list[i]; let rep = 1;   // 같은 모양이 잇따르면 한 줄 + ×N(글자만 다르면 글자를 모은다)
    while (i + rep < list.length && sig(list[i + rep]) === sig(n) && list[i + rep].b[2] === n.b[2] && list[i + rep].b[3] === n.b[3]) rep++;
    const rest = list.slice(i + 1, i + rep).map(text).filter(Boolean);
    const more = rep > 1 ? ' ×' + rep + (rest.length ? ' 나머지「' + short(rest.join(' · '), 80) + '」' : '') : '';
    out.push('  '.repeat(depth) + sig(n) + ' [' + n.b[0] + ',' + n.b[1] + ' ' + n.b[2] + '×' + n.b[3] + '] ' + props(n, ctx) + more);
    lines(n.k, depth + 1, ctx, out);
    i += rep - 1;
  }
  return out;
}
module.exports = { hex, lines };
