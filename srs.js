/* BANDUP logic core — pure functions only (no DOM, no storage). Imported by app.js and by tests/logic.test.mjs in node.
   Dates are local 'YYYY-MM-DD' keys. */
import { fsrs, generatorParameters, createEmptyCard, Rating } from './vendor/ts-fsrs.mjs';

/* ---------- dates ---------- */
export const pad = n => String(n).padStart(2, '0');
const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** The study day starts at DAY_START_H (default 04:00, Anki style): 01:30 still counts as the day before. Settings can move it. */
let DAY_START_H = 4;
export const setDayStart = h => { DAY_START_H = Math.min(6, Math.max(0, +h || 0)); };
export const dayStartH = () => DAY_START_H;
export const dayKey = (d = new Date()) => fmt(new Date(+d - DAY_START_H * 36e5));
export const kDate = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (k, n) => { const d = kDate(k); d.setDate(d.getDate() + n); return fmt(d); };
export const diffDays = (a, b) => Math.round((kDate(b) - kDate(a)) / 864e5);   // b - a
export const dow = k => kDate(k).getDay();   // 0 Sun … 6 Sat
export const mondayOf = k => addDays(k, -((dow(k) + 6) % 7));
export const isoWeek = k => { const th = addDays(mondayOf(k), 3), y = +th.slice(0, 4); return `${y}-W${pad(Math.floor(diffDays(`${y}-01-01`, th) / 7) + 1)}`; };
export const DOW_KO = ['일', '월', '화', '수', '목', '금', '토'];

/* ---------- 3.1 schedule engine ---------- */
const WEEK_TPL = {
  P1: [{ focus: '진단 · Part 1 세 문장 공식 · L Part 1 빈칸 예측 · R T/F/NG 입문 · T2 4단락 골격', gram: ['be', 'article', 'prep'], gramKo: 'be동사·관사·전치사' },
       { focus: 'L Part 1·2 양식·숫자·철자 · R T/F/NG 시간 재기 · T2 의견형 · 스토리 1~3편', gram: ['tense'], gramKo: '과거시제' }],
  P2: [{ focus: 'T1 개요와 선·막대 추세 · 스토리 4~6편 · Franklin 시작 · L Part 2', gram: ['toinf', 'tense'], gramKo: 'to부정사와 시제 복습' },
       { focus: 'Matching headings · T2 토론형·장단점형 · 4/3/2', gram: [], gramKo: '관계사(복문)' },
       { focus: 'L Part 3·4 강의와 함정 표현 · T1 process와 표 · Part 3 확장', gram: [], gramKo: '수동태·비교' }],
  P3: [{ focus: '오류 로그 상위 유형 · T2 문제해결형·두 질문형', gram: [], gramKo: '오류 로그 1위' },
       { focus: '실전 시간으로 영역별 통째 풀기 (지문당 20분, T1+T2 60분)', gram: [], gramKo: '오류 로그 1위' },
       { focus: '오류 로그 정리 · 무작위 큐카드 · 분량 줄이기', gram: [], gramKo: '오류 로그 1위' }],
  P4: [{ focus: 'SRS · 섀도잉 1편 · 짧은 지문과 P2 1장 · 수면', gram: [], gramKo: '복습만' }]
};
export const PHASE_KO = { P1: '기초·진단', P2: '확장', P3: '실전', P4: '테이퍼' };
/** plan(startDate, testDate): weeks anchored on the Monday of start. Taper = the 5 days before the test (fixed);
 *  practical = 3 weeks before taper; foundation = first 2 weeks (1 if under 6 weeks); expansion = the rest, at least 1.
 *  Full mocks: every practical weekend + one expansion weekend (the one before the last expansion week, so the
 *  gap week before practice stays — this reproduces the PRD table/AT-C1: W4, W6, W7, W8). */
export function plan(start, test) {
  const mon0 = mondayOf(start), taperStart = addDays(test, -5), taperEnd = addDays(test, -1);
  const N = Math.max(1, Math.floor(diffDays(mon0, mondayOf(taperStart)) / 7) + 1);   // week index of taper = N (≥1: a test date within 5 days still gets a taper week, not an empty plan)
  let p3 = Math.min(3, Math.max(0, N - 2)), p1 = N - 1 < 6 ? 1 : 2, p2 = N - 1 - p3 - p1;
  if (p2 < 1 && p1 > 1) { p1 = 1; p2 = N - 1 - p3 - p1; }
  while (p2 < 1 && p3 > 1) { p3--; p2++; }
  if (p2 < 0) { p2 = 0; p1 = Math.max(0, N - 1 - p3); }
  const phaseOf = i => i <= p1 ? 'P1' : i <= p1 + p2 ? 'P2' : i < N ? 'P3' : 'P4';
  const p2mock = p2 ? p1 + Math.max(1, p2 - 1) : 0;
  const weeks = [];
  const cnt = { P1: 0, P2: 0, P3: 0, P4: 0 };
  for (let i = 1; i <= N; i++) {
    const phase = phaseOf(i), tpl = WEEK_TPL[phase], t = tpl[Math.min(cnt[phase]++, tpl.length - 1)];
    const mon = addDays(mon0, (i - 1) * 7);
    const sat = i === 1 ? 'diag' : phase === 'P4' ? null : (phase === 'P3' || i === p2mock) ? 'full' : 'mini';
    weeks.push({ n: i, mon, sun: addDays(mon, 6), phase, focus: t.focus, gram: t.gram, gramKo: t.gramKo, sat });
  }
  return { start, test, weeks, taperStart, taperEnd };
}
export const weekOf = (P, day) => P.weeks[Math.min(P.weeks.length - 1, Math.max(0, Math.floor(diffDays(P.weeks[0].mon, day) / 7)))];
export const isTaper = (P, day) => day >= P.taperStart && day <= P.taperEnd;

/* ---------- 3.2 daily composition ---------- */
export const SKILL_OF_DOW = { 1: 'L', 2: 'R', 3: 'W1', 4: 'W2', 5: 'S' };
/** Returns the ordered blocks for a mission kind. kind: 'std' | 'min' | 'comeback' | 'wknd'. */
export function dayBlocks(P, day, kind, prof = {}) {
  if (kind === 'min') return [{ id: 'vocab', min: 3, act: 'vocab', opts: { n: 10, mode: 'min' } }, { id: 'shadow1', min: 2, act: 'shadow1' }];
  if (kind === 'comeback') return [{ id: 'vocab', min: 2, act: 'vocab', opts: { n: 5, mode: 'comeback' } }, { id: 'shadow1', min: 1, act: 'shadow1' }];
  const W = weekOf(P, day), d = dow(day), mins = prof.weekdayMin || 40;
  if (isTaper(P, day)) {
    if (d === 5 || day === P.taperEnd) return dayBlocks(P, day, 'min', prof);
    return [{ id: 'vocab', min: 10, act: 'vocab', opts: { n: 30 } }, { id: 'speak', min: 5, act: 'shadow' }, { id: 'skill', min: 20, act: 'read', opts: { len: 'short' } }, { id: 'p2', min: 5, act: 'p2' }];
  }
  if (d === 6) {   // Saturday mock
    const v = { id: 'vocab', min: 10, act: 'vocab', opts: { n: 30 } };
    if (W.sat === 'full') return [v, { id: 'mockLR', min: 90, act: 'mockInput', opts: { official: true } }];
    if (W.sat === 'diag') return [v, { id: 'mockLR', min: 60, act: 'mockInput', opts: { official: true, diag: true } }, { id: 't2', min: 40, act: 't2' }, { id: 'p1', min: 5, act: 'p1' }, { id: 'p2', min: 5, act: 'p2' }];
    return [v, { id: 'L', min: 10, act: 'listen' }, { id: 'R', min: 20, act: 'read', opts: { timed: true } }, { id: 't2', min: 40, act: 't2' }, { id: 'p2', min: 5, act: 'p2' }];
  }
  if (d === 0) {
    if (W.sat === 'full') return [{ id: 't2', min: 40, act: 't2', opts: { timed: true } }, { id: 't1', min: 20, act: 't1', opts: { timed: true } }, { id: 'p1', min: 4, act: 'p1' }, { id: 'p2', min: 10, act: 'p2', opts: { thenP3: true } }, { id: 'review', min: 5, act: 'review' }];
    return [{ id: '432', min: 10, act: '432' }, { id: 'story', min: 10, act: 'story' }, ...(W.n >= 3 ? [{ id: 'franklin', min: 15, act: 'franklin' }] : []), { id: 'review', min: 5, act: 'review' }, { id: 'vocab', min: 10, act: 'vocab', opts: { n: 30, extra: true } }];
  }
  const sk = SKILL_OF_DOW[d];
  const speak = (d === 1 || d === 3 || d === 5) ? { id: 'speak', min: 5, act: 'shadow' } : { id: 'speak', min: 5, act: 'p1' };
  const skillMin = mins <= 30 ? 12 : 20;
  const skill = sk === 'L' ? { act: 'listen' } : sk === 'R' ? { act: 'read', opts: { timed: W.n >= 3 } }
    : sk === 'W1' ? (W.n >= 3 && W.n % 2 === 1 ? { act: 'franklin' } : { act: 't1' }) : sk === 'W2' ? { act: 't2' } : { act: 'p2', opts: { thenP3: true } };
  const quiz = { id: 'quiz', min: mins <= 30 ? 3 : 5, act: 'quiz', opts: { n: mins <= 30 ? 3 : 5 } };
  return [{ id: 'vocab', min: 10, act: 'vocab', opts: { n: 30 } }, ...(mins <= 25 ? [] : [speak]), { id: 'skill', min: skillMin, ...skill }, quiz];
}

/* ---------- 2.1 / 2.2 bands and gauges ---------- */
export const PROFILES = { min: { L: 6.5, R: 6.5, W: 6, S: 6 }, safe: { L: 7, R: 7, W: 6, S: 6 }, stretch: { L: 7.5, R: 7, W: 6.5, S: 6.5 } };
const L_TAB = [[35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [0, 4.5]];
const R_TAB = [[35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [0, 4.5]];
export const bandOf = (raw, skill) => { const T = skill === 'L' ? L_TAB : R_TAB; for (const [min, b] of T) if (raw >= min) return b; return 4.5; };
export const rawFor = (band, skill) => { const T = skill === 'L' ? L_TAB : R_TAB; const r = T.find(x => x[1] === band); return r ? r[0] : 40; };
/** IELTS overall rounding: .25 → up to .5, .75 → up to next whole, otherwise down to the nearest .5 */
export function roundBand(avg) { const f = Math.floor(avg + 1e-9), fr = avg - f; return fr >= .75 - 1e-9 ? f + 1 : fr >= .25 - 1e-9 ? f + .5 : f; }
export const clampBand = v => Math.min(9, Math.max(0, Math.round((+v || 0) * 2) / 2));
const md = s => { const [, m, d] = s.split('-'); return `${+m}/${+d}`; };
function wMedian(vals) {   // [{v, w}] weighted median (lower median on ties)
  const a = vals.slice().sort((x, y) => x.v - y.v), tot = a.reduce((s, x) => s + x.w, 0); let acc = 0;
  for (const x of a) { acc += x.w; if (acc * 2 >= tot) return x.v; }
  return a.length ? a[a.length - 1].v : 0;
}
/** One skill's gauge. Always a range; basis explains where it came from. */
export function gaugeOf(skill, db, today) {
  const at = db.attempts || [], cut = t => dayKey(new Date(t));
  if (skill === 'L' || skill === 'R') {
    const mk = (db.mocks || []).filter(m => m[skill] != null && m.src !== 'app' && diffDays(m.date, today) <= 21 && diffDays(m.date, today) >= 0).sort((a, b) => a.date < b.date ? 1 : -1)[0];
    if (mk) { const b = bandOf(mk[skill], skill); return { lo: Math.max(0, b - .5), hi: Math.min(9, b + .5), mid: b, basis: 'mock', raw: mk[skill], text: `모의 ${mk[skill]}/40 기준`, detail: `${md(mk.date)} ${mk.src === 'bc' ? 'British Council' : mk.src === 'cambridge' ? 'Cambridge' : 'IELTS.org'} 원점수 ${mk[skill]}/40 → ${b.toFixed(1)}. 변환표 경계가 시험지마다 1~2점 달라서 ±0.5로 보여 줘요.` }; }
    const rec = at.filter(a => a.skill === skill && a.score && diffDays(cut(a.ts), today) <= 14 && diffDays(cut(a.ts), today) >= 0);
    const parts = skill === 'L' ? ['1', '2', '3', '4'] : ['tfng', 'heading'], per = skill === 'L' ? 10 : 20, acc = {};
    let n = 0;
    for (const a of rec) {
      const by = skill === 'L' ? { [String((a.meta && a.meta.part) || 1)]: a.score } : ((a.meta && a.meta.by) || { tfng: a.score });
      for (const [k, s] of Object.entries(by)) { if (!parts.includes(k) || !s.t) continue; const f = skill === 'R' && !a.timed ? .9 : 1; acc[k] = acc[k] || { c: 0, t: 0 }; acc[k].c += s.c * f; acc[k].t += s.t; n += s.t; }
    }
    if (!n) return { none: true, basis: 'none', text: '진단 전', detail: skill === 'L' ? '리스닝 문항을 풀면 앱 연습으로 추정해요. 공식 모의 원점수를 넣으면 그것이 우선이에요.' : '리딩 문항을 풀면 앱 연습으로 추정해요. 공식 모의 원점수를 넣으면 그것이 우선이에요.' };
    const done = parts.filter(k => acc[k]), avg = done.reduce((s, k) => s + acc[k].c / acc[k].t, 0) / done.length;
    const raw = Math.round(parts.reduce((s, k) => s + per * (acc[k] ? acc[k].c / acc[k].t : Math.max(0, avg - .15)), 0));
    const b = bandOf(raw, skill), r = n < 40 ? 1 : .5;
    return { lo: Math.max(0, b - r), hi: Math.min(9, b + r), mid: b, basis: 'app', raw, n, text: `앱 연습 ${n}문항 기준`, detail: `최근 14일 ${n}문항, 예상 원점수 ${raw}/40 → ${b.toFixed(1)}.${done.length < parts.length ? ' 연습 안 한 파트는 평균보다 0.15 낮게 쳤어요.' : ''}${skill === 'R' ? ' 시간 제한 없이 푼 문항은 0.9를 곱했어요.' : ''} ${n < 40 ? '40문항 전이라 ±1.0' : '±0.5'}로 보여 줘요.` };
  }
  const g = at.filter(a => a.skill === skill && a.band && a.band.overall != null).sort((a, b) => b.ts - a.ts).slice(0, 3);
  if (!g.length) return { lo: 4.5, hi: 5, mid: 5, basis: 'prior', text: '0917 진단 기준', detail: '아직 채점 기록이 없어서 9/17 진단(5.0)을 씁니다. 채점하면 최근 3회로 바뀌어요.' };
  const wt = a => skill === 'W' ? (a.kind === 't2' ? 2 : 1) : 1;
  const lo = wMedian(g.map(a => ({ v: clampBand(a.band.overall) - .5, w: wt(a) }))), hi = wMedian(g.map(a => ({ v: clampBand(a.band.overall), w: wt(a) })));
  const last = g[0], K = { t1: 'T1', t2: 'T2', p1: 'P1', p2: 'P2', p3: 'P3', '432': '4/3/2' }[last.kind] || '';
  return { lo, hi, mid: (lo + hi) / 2, basis: 'grade', n: g.length, text: `채점 ${g.length}회 기준`, detail: `최근 ${g.length}회 채점, 가장 최근 ${md(cut(last.ts))} ${K} ${(clampBand(last.band.overall) - .5).toFixed(1)}–${clampBand(last.band.overall).toFixed(1)}. 제미나이 점수를 위쪽, 0.5 낮춘 값을 아래쪽으로 잡아요.` };
}
const SK_EN = { L: 'Listening', R: 'Reading', W: 'Writing', S: 'Speaking' };
export function gauges(db, today) {
  const target = PROFILES[(db.profile && db.profile.target) || 'safe'] || PROFILES.safe;
  const G = {}; for (const s of ['L', 'R', 'W', 'S']) G[s] = gaugeOf(s, db, today);
  const have = ['L', 'R', 'W', 'S'].every(s => !G[s].none);
  G.overall = have ? { lo: roundBand(['L', 'R', 'W', 'S'].reduce((a, s) => a + G[s].lo, 0) / 4), hi: roundBand(['L', 'R', 'W', 'S'].reduce((a, s) => a + G[s].hi, 0) / 4) } : null;
  // cheapest gain: L/R first (format skills), largest gap to target
  const gap = s => G[s].none ? 9 : target[s] - G[s].mid;
  const lr = ['L', 'R'].filter(s => gap(s) > 0).sort((a, b) => gap(b) - gap(a))[0];
  const ws = ['W', 'S'].filter(s => gap(s) > 0).sort((a, b) => gap(b) - gap(a))[0];
  const pick = lr || ws;
  if (!pick) G.cheap = '모든 영역이 목표선 위예요';
  else if (G[pick].none) G.cheap = `${SK_EN[pick]} 진단부터 · ${pick === 'L' ? '4분' : '5분'}`;
  else if (pick === 'L' || pick === 'R') { const nx = G[pick].mid + .5, need = Math.max(1, rawFor(nx, pick) - (G[pick].raw || 0)); G.cheap = `${SK_EN[pick]} +0.5 = 원점수 ${need}문항`; }
  else G.cheap = `${SK_EN[pick]} +0.5 = 반복 오류 줄이기`;
  G.target = target; G.pass = PROFILES.min;
  // hero estimate: the real overall, or a provisional one while L·R are undiagnosed (prior 4.5–5.5 = the 0917 level)
  const part = s => G[s].none ? { lo: 4.5, hi: 5.5 } : G[s];
  G.est = G.overall ? { ...G.overall, prov: false } : { lo: roundBand(['L', 'R', 'W', 'S'].reduce((a, s) => a + part(s).lo, 0) / 4), hi: roundBand(['L', 'R', 'W', 'S'].reduce((a, s) => a + part(s).hi, 0) / 4), prov: true };
  G.est.mid = (G.est.lo + G.est.hi) / 2;
  return G;
}

/* ---------- 4.1⑥ answer checker ---------- */
const NUMW = { zero: 0, oh: 0, nought: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const ORDW = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17, eighteenth: 18, nineteenth: 19, twentieth: 20, thirtieth: 30 };
const LIMW = { one: 1, two: 2, three: 3, four: 4, five: 5 };
const norm = s => String(s || '').toLowerCase().replace(/[‘’]/g, "'").replace(/[.,!?;:"]+$/g, '').replace(/^["']|["']$/g, '').replace(/\s+/g, ' ').trim();
/** Canonical form: number words → digits ("twenty-five" → 25, "fifteenth"/"15th" → 15), money/percent signs kept apart. */
export function canon(s) {
  return norm(s).split(' ').map(w => {
    const m = /^([a-z]+)-([a-z]+)$/.exec(w);
    if (m && NUMW[m[1]] >= 20 && (NUMW[m[2]] != null || ORDW[m[2]] != null)) return String(NUMW[m[1]] + (NUMW[m[2]] ?? ORDW[m[2]]));
    if (NUMW[w] != null && w !== 'oh') return String(NUMW[w]);
    if (ORDW[w] != null) return String(ORDW[w]);
    const o = /^(\d+)(st|nd|rd|th)$/.exec(w); if (o) return o[1];
    return w;
  }).join(' ');
}
export function lev(a, b) {
  const m = a.length, n = b.length; if (Math.abs(m - n) > 2) return 3;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
const isNumTok = w => /^[£$€]?\d[\d,.:]*(%|p|am|pm)?$/.test(w);
/** Words counted per IELTS rules: hyphenated = one word; numbers counted apart when the limit allows "A NUMBER". */
export function countWords(ans) { const t = norm(ans).split(' ').filter(Boolean); return { words: t.filter(w => !isNumTok(w)).length, nums: t.filter(isNumTok).length, all: t.length }; }
function limitOf(limit) {
  const L = String(limit || '').toUpperCase(), m = /(ONE|TWO|THREE|FOUR|FIVE)\s+WORDS?/.exec(L);
  return { words: m ? LIMW[m[1].toLowerCase()] : (/A NUMBER/.test(L) ? 0 : 99), num: /NUMBER/.test(L) };
}
const plural = (a, b) => a === b + 's' || a === b + 'es' || (b.endsWith('y') && a === b.slice(0, -1) + 'ies');
/** checkAnswer(ans, key, limit) → { ok, tag?, near? }. key: string | string[] | { answer:[], accept:[] } */
export function checkAnswer(ans, key, limit) {
  const keys = (typeof key === 'string' ? [key] : Array.isArray(key) ? key : [...(key.answer || []), ...(key.accept || [])]).map(canon);
  const a = canon(ans);
  if (!a) return { ok: false, tag: 'blank' };
  const lim = limitOf(limit), c = countWords(a);
  if (limit && (lim.num ? (c.words > lim.words || c.nums > 1) : c.all > lim.words)) return { ok: false, tag: 'wordlimit' };
  if (keys.includes(a)) return { ok: true };
  const sq = s => s.replace(/[\s,]/g, '').replace(/^[£$€]/, '');
  if (keys.some(k => sq(k) === sq(a))) return { ok: true };
  if (keys.some(k => plural(a, k) || plural(k, a))) return { ok: false, tag: 'plural' };
  if (keys.some(k => /^\d/.test(k) || /^\d/.test(a))) return { ok: false, tag: 'number' };
  if (keys.some(k => k.length >= 4 && lev(a, k) <= 2)) return { ok: false, tag: 'spelling', near: true };
  return { ok: false };
}

/* ---------- 3.3 streak ---------- */
export const newStreak = () => ({ cur: 0, best: 0, last: null, bridge: null, grace: false, freezes: 1, radioWeek: {}, frzWeek: {} });
/** settle(s, today): apply misses up to yesterday. One missed day = automatic grace; each further missed day burns a freeze;
 *  out of freezes → cur 0 (best kept). Idempotent. */
export function settle(s, today) {
  if (!s.last) return s;
  const anchor = s.bridge && s.bridge > s.last ? s.bridge : s.last, missed = diffDays(anchor, today) - 1;
  if (missed <= 0) return s;
  s.grace = true;
  if (missed === 1 || s.cur === 0) return s;
  const need = missed - 1;
  if (s.freezes >= need) { s.freezes -= need; s.bridge = addDays(today, -1); s.frzDays = [...(s.frzDays || []), ...Array.from({ length: need }, (_, i) => addDays(anchor, i + 2))].slice(-14); }   // freezes cover the missed days up to yesterday
  else { s.freezes = 0; s.cur = 0; s.bridge = null; }
  return s;
}
/** credit(s, day, days): the day counts. Returns true if newly credited. days = DB.days (to count the week for freezes). */
export function credit(s, day, days = {}, kind = 'std', { comebackPlus = true } = {}) {
  if (s.last === day) return false;
  if (kind === 'radio') { const w = isoWeek(day); if ((s.radioWeek[w] || 0) >= 2) return false; s.radioWeek[w] = (s.radioWeek[w] || 0) + 1; }
  settle(s, day);
  if (s.cur === 0 || !s.last) s.cur = 1; else if (!s.grace || comebackPlus) s.cur++;   // v2: the comeback day itself counts (+1); the missed day never does
  s.grace = false; s.last = day; s.bridge = null; s.best = Math.max(s.best, s.cur);
  const w = isoWeek(day), mon = mondayOf(day);
  let n = 0; for (let i = 0; i < 7; i++) { const k = addDays(mon, i); if (k === day || (days[k] && days[k].kind)) n++; }
  if (n >= 5 && !s.frzWeek[w]) { s.frzWeek[w] = 1; s.freezes = Math.min(2, s.freezes + 1); }
  return true;
}
/** days away since the last credited day (0 = did today or yesterday) */
export const awayDays = (s, today) => s.last ? Math.max(0, diffDays(s.last, today) - 1) : 0;

/* ---------- 4.6 vocab: rating, FSRS, queue ---------- */
export const RATING = { Again: Rating.Again, Hard: Rating.Hard, Good: Rating.Good, Easy: Rating.Easy };
/** Recognition card (Hackers-style delayed reveal). early = tapped "안다" before the reveal; ms = time to that tap. */
export function rateRecog({ early, ms = 9999, correct }) {
  if (early) return !correct ? 'Again' : ms <= 1500 ? 'Easy' : 'Good';
  return correct ? 'Hard' : 'Again';
}
export const rateProd = ({ correct, ms = 9999 }) => !correct ? 'Again' : ms <= 5000 ? 'Easy' : 'Good';
export const SCHED = fsrs(generatorParameters({ request_retention: 0.9, maximum_interval: 45, enable_fuzz: true }));
const toCard = c => c ? { ...c, due: new Date(c.due), last_review: c.last_review ? new Date(c.last_review) : undefined } : null;
const fromCard = c => ({ due: +c.due, stability: c.stability, difficulty: c.difficulty, elapsed_days: c.elapsed_days, scheduled_days: c.scheduled_days, learning_steps: c.learning_steps || 0, reps: c.reps, lapses: c.lapses, state: c.state, last_review: c.last_review ? +c.last_review : null });
export const emptyCard = (now = new Date()) => fromCard(createEmptyCard(now));
/** review(stored|null, 'Good', now) → new stored card */
export function review(stored, rating, now = new Date()) {
  const c = toCard(stored) || createEmptyCard(now);
  return fromCard(SCHED.next(c, now, RATING[rating]).card);
}
/** "알던 단어" from the diagnosis: stability 7 days, in review state */
export const knownCard = (now = new Date()) => ({ due: +now + 7 * 864e5, stability: 7, difficulty: 5, elapsed_days: 0, scheduled_days: 7, learning_steps: 0, reps: 1, lapses: 0, state: 2, last_review: +now });
/** Build today's queue. cards = DB.cards; order = candidate new card ids in content order (recognition ids, ':r').
 *  Returns { due:[ids], fresh:[ids] } capped by reviewCap-reviewed and newLimit-introduced. */
export function buildQueue(cards, order, now, { newLimit = 10, reviewCap = 60, reviewedToday = 0, newToday = 0, prefix = null } = {}) {
  const t = +now, ok = id => !prefix || prefix.some(p => id.startsWith(p));
  const due = Object.entries(cards).filter(([id, c]) => ok(id) && c.due <= t).sort((a, b) => a[1].due - b[1].due).map(([id]) => id).slice(0, Math.max(0, reviewCap - reviewedToday));
  const fresh = order.filter(id => !cards[id]).slice(0, Math.max(0, newLimit - newToday));
  return { due, fresh };
}
/** In-session learning step: Again → back in 5 cards. Returns the new list. */
export const requeue = (list, i, id, gap = 5) => { const l = list.slice(); l.splice(Math.min(l.length, i + 1 + gap), 0, id); return l; };
/** daily new-card limit (weekday setting; weekend 0 unless supplemented; comeback day 0) */
export const newLimitFor = (day, prof, flags = {}) => flags.comeback ? 0 : (dow(day) === 0 || dow(day) === 6) ? (flags.extra ? 10 : 0) : Math.min(12, Math.max(8, prof.newPerDay || 10));

/* ---------- 4.5 grammar quiz ---------- */
export const GRAM_TYPES = ['tense', 'toinf', 'article', 'be', 'prep'];
/** pickQuiz(items, errCount{type:n}, learned[types], focus, rnd) → 5 items: weight = errors(14d)+1, focus ≥ 2, ≥ 2 types */
export function pickQuiz(items, errCount, learned, focus, rnd = Math.random, n = 5) {
  const pool = items.filter(q => learned.includes(q.type)), out = [], used = new Set();
  const take = q => { out.push(q); used.add(q.id); };
  const byType = t => pool.filter(q => q.type === t && !used.has(q.id));
  const rand = a => a[Math.floor(rnd() * a.length)];
  const fq = byType(focus); for (let i = 0; i < Math.min(2, n) && fq.length; i++) take(fq.splice(Math.floor(rnd() * fq.length), 1)[0]);
  while (out.length < n) {
    const left = pool.filter(q => !used.has(q.id)); if (!left.length) break;
    const types = [...new Set(left.map(q => q.type))], needOther = out.length === n - 1 && out.every(q => q.type === out[0].type);
    const cand = needOther ? types.filter(t => t !== (out[0] && out[0].type)) : types; if (!cand.length) { take(rand(left)); continue; }
    const w = cand.map(t => (errCount[t] || 0) + 1), tot = w.reduce((a, b) => a + b, 0); let r = rnd() * tot, t = cand[0];
    for (let i = 0; i < cand.length; i++) { r -= w[i]; if (r <= 0) { t = cand[i]; break; } }
    take(rand(byType(t)));
  }
  return out;
}
/** learned grammar types by week (W1 be/article/prep, W2 +tense, W3+ +toinf) */
export const learnedTypes = wn => wn >= 3 ? GRAM_TYPES.slice() : wn >= 2 ? ['be', 'article', 'prep', 'tense'] : ['be', 'article', 'prep'];
export function topErrorType(errors, from, to) {
  const c = {}; for (const e of errors) { const d = dayKey(new Date(e.ts)); if (d >= from && d <= to && GRAM_TYPES.includes(e.type)) c[e.type] = (c[e.type] || 0) + 1; }
  return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}
export function focusType(P, day, errors, override) {
  const W = weekOf(P, day); if (override) return override;
  const g = W.gram.find(t => GRAM_TYPES.includes(t)); if (g) return g;
  return topErrorType(errors, addDays(W.mon, -7), addDays(W.mon, -1)) || 'article';
}

/** S4 metric: repeated grammar errors (5 types) per 100 graded words, by plan week up to today.
 *  → [{ n, words, errs, rate|null }]; baseline = first week with a rate, goal = half of it. */
export function errRateByWeek(P, attempts, errors, today) {
  const cur = weekOf(P, today).n, src = {};
  for (const e of errors || []) if (GRAM_TYPES.includes(e.type) && e.src) src[e.src] = (src[e.src] || 0) + 1;
  return P.weeks.filter(w => w.n <= cur).map(w => {
    const g = (attempts || []).filter(a => a.band && a.words && (k => k >= w.mon && k <= w.sun)(dayKey(new Date(a.ts))));
    const words = g.reduce((t, a) => t + a.words, 0), errs = g.reduce((t, a) => t + (src[a.id] || 0), 0);
    return { n: w.n, words, errs, rate: words ? errs / words * 100 : null };
  });
}

/* ---------- diff (LCS, word level) ---------- */
export const words = s => String(s || '').replace(/[‘’]/g, "'").split(/\s+/).filter(Boolean);
const wkey = w => w.toLowerCase().replace(/[^\w'-]/g, '');
export function diffWords(a, b) {   // a = reference, b = attempt → [{t:'eq'|'del'|'ins', w}]
  const A = words(a), B = words(b), m = A.length, n = B.length, L = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) L[i][j] = wkey(A[i]) === wkey(B[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < m && j < n) { if (wkey(A[i]) === wkey(B[j])) { out.push({ t: 'eq', w: A[i] }); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) out.push({ t: 'del', w: A[i++] }); else out.push({ t: 'ins', w: B[j++] }); }
  while (i < m) out.push({ t: 'del', w: A[i++] }); while (j < n) out.push({ t: 'ins', w: B[j++] });
  return out;
}
/** missed chunks of the reference (runs of 'del', cut to ≤6 words, with one word of context each side) */
export function missedChunks(ops) {
  const out = []; let run = [];
  ops.forEach((o, i) => {
    if (o.t === 'del') run.push(i);
    else if (o.t === 'eq' && run.length) { out.push(run); run = []; }
  });
  if (run.length) out.push(run);
  return out.flatMap(r => Array.from({ length: Math.ceil(r.length / 6) }, (_, k) => r.slice(k * 6, k * 6 + 6))).map(r => { const a = Math.max(0, r[0] - 1), b = Math.min(ops.length - 1, r[r.length - 1] + 1); const ctx = ops.slice(a, b + 1).filter(o => o.t !== 'ins'); return { chunk: r.map(i => ops[i].w).join(' '), ctx: ctx.map(o => o.w).join(' ') }; });
}

/* ---------- Franklin hints ---------- */
const STOP = new Set('a an the and or but so of to in on at by for with from as is are was were be been being it its this that these those they them their he she his her we our you your i my me there here which who whom whose what when where why how than then also very more most much many can could will would should may might must do does did have has had not no into over under about after before during while if because although though such other some any each both all one two'.split(' '));
/** a "내 표현" card needs a content word: one word of 3+ letters that is not a function word ("it", "of the" and "a" never become cards) */
export const contentChunk = chunk => words(chunk).some(w => { const x = w.toLowerCase().replace(/[^a-z'-]/g, ''); return x.length >= 3 && !STOP.has(x); });
export function sentences(t) { return String(t || '').match(/[^.!?]+[.!?]+["')]?|[^.!?]+$/g)?.map(s => s.trim()).filter(Boolean) || []; }
export function franklinHints(text) {
  return sentences(text).map(s => {
    const ws = words(s).map((w, i) => ({ w: w.replace(/[^\w'-]/g, ''), i })).filter(x => x.w && !STOP.has(x.w.toLowerCase()));
    const k = Math.min(4, Math.max(3, Math.round(ws.length / 3)));
    return ws.slice().sort((a, b) => b.w.length - a.w.length).slice(0, Math.min(k, ws.length)).sort((a, b) => a.i - b.i).map(x => x.w);
  });
}
export const franklinOpen = (readDay, today) => !!readDay && today > readDay;

/* ---------- 3.4 calendar reminder ---------- */
export function buildIcs({ time = '07:40', cue = '', url = '', start = dayKey(), second = '00:30' }) {
  const [h, m] = time.split(':').map(Number), [h2, m2] = second.split(':').map(Number);
  let mins = (h2 * 60 + m2) - (h * 60 + m); if (mins <= 0) mins += 24 * 60;
  const trig = `PT${Math.floor(mins / 60)}H${mins % 60}M`;
  const d = start.replace(/-/g, ''), t = `${pad(h)}${pad(m)}00`, sum = /버스/.test(cue) ? '5분 영어 · 버스에서' : '5분 영어';
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BANDUP//KO', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:bandup-daily-${d}@bandup`, `DTSTAMP:${d}T000000`, `DTSTART:${d}T${t}`, 'DURATION:PT5M', 'RRULE:FREQ=DAILY',
    `SUMMARY:${sum}`, `DESCRIPTION:${cue ? cue + ' → 5분 미션\\n' : ''}${url}`, `URL:${url}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${sum}`, 'TRIGGER:PT0M', 'END:VALARM',
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:5분 영어 · 오늘 한 번', `TRIGGER:${trig}`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}

/* ---------- 6 XP ---------- */
export const XP = { review: 1, fresh: 2, lr: 2, dict: 3, rec: 10, recGraded: 20, t1: 30, t2: 50, rewrite: 20, franklin: 30, mock: 100, min: 20, std: 50, week: 30 };

/* ---------- 4.6 Hackers companion link ---------- */
// chapter starts (s) from videos/rWZG4_idwr8.info.json; DAY 50 is missing there → midpoint of DAY 49 (13816) and DAY 51 (14312)
export const HACKERS_T = [0, 304, 590, 882, 1174, 1466, 1765, 2060, 2355, 2652, 2939, 3235, 3522, 3823, 4114, 4404, 4698, 4990, 5291, 5581, 5876, 6167, 6458, 6758, 7059, 7358, 7657, 7956, 8251, 8545, 8845, 9146, 9452, 9752, 10047, 10345, 10639, 10936, 11234, 11531, 11826, 12080, 12334, 12586, 12836, 13078, 13324, 13569, 13816, 14064, 14312, 14584, 14846, 15105, 15367, 15631, 15895, 16164, 16444, 16769];
export const HACKERS_ERRATA = ['00:44:45 "~동안 죽" → "~동안 쭉"', '00:53:55 interpay → interplay', '00:58:16 "전형적으로" 뜻 오류', '00:58:46 adsence → absence', '02:40:37 "신랄함" 뜻 오류', '03:02:19 "완전한" 뜻 오류', '03:15:38 "활력을 붙어 넣다" → "불어 넣다"'];
/** DAY n = active study days before today + 1 (a missed day never skips a DAY) */
export function hackersLink(days, today) { const n = Math.min(60, 1 + Object.keys(days || {}).filter(k => k < today && days[k] && days[k].kind).length); return { n, t: HACKERS_T[n - 1], url: `https://www.youtube.com/watch?v=rWZG4_idwr8&t=${HACKERS_T[n - 1]}` }; }

/* ---------- 5.5 Gemini response validation ---------- */
export const ERR_TYPES = ['article', 'be', 'tense', 'prep', 'toinf', 'sva', 'plural', 'wordform', 'collocation', 'spelling', 'wordlimit', 'number', 'reading-ng', 'reading-qual', 'reading-bg', 'reading-find'];
const str = (v, n = 2000) => String(v == null ? '' : v).slice(0, n);
function normCrit(c) { c = c && typeof c === 'object' ? c : {}; return { band: clampBand(c.band), evidence: (Array.isArray(c.evidence) ? c.evidence : []).slice(0, 3).map(x => str(x, 300)), fix_ko: str(c.fix_ko, 400) }; }
const normErrs = e => (Array.isArray(e) ? e : []).slice(0, 10).map(x => ({ type: ERR_TYPES.includes(x && x.type) ? x.type : 'other', wrong: str(x && x.wrong, 300), right: str(x && x.right, 300), why_ko: str(x && x.why_ko, 300) })).filter(x => x.wrong || x.right);
export function normWriting(j) {
  if (!j || typeof j !== 'object' || !j.criteria) throw new Error('shape');
  const keys = j.task === 'T1' || j.criteria.TA ? ['TA', 'CC', 'LR', 'GRA'] : ['TR', 'CC', 'LR', 'GRA'];
  const criteria = {}; for (const k of keys) criteria[k] = normCrit(j.criteria[k] || j.criteria[k === 'TA' ? 'TR' : k]);
  return { task: j.task === 'T1' ? 'T1' : 'T2', words: +j.words || 0, criteria, overall: clampBand(j.overall != null ? j.overall : Object.values(criteria).reduce((a, c) => a + c.band, 0) / 4),
    top_fixes_ko: (Array.isArray(j.top_fixes_ko) ? j.top_fixes_ko : []).slice(0, 3).map(x => str(x, 300)), errors: normErrs(j.errors),
    weakest_paragraph: Math.max(1, Math.round(+j.weakest_paragraph || 1)), rewrite_band7: str(j.rewrite_band7, 3000), summary_ko: str(j.summary_ko, 300) };
}
export function normSpeaking(j) {
  if (!j || typeof j !== 'object' || !j.criteria) throw new Error('shape');
  const criteria = {}; for (const k of ['FC', 'LR', 'GRA', 'P']) criteria[k] = normCrit(j.criteria[k]);
  const fillers = {}; for (const [k, v] of Object.entries(j.fillers && typeof j.fillers === 'object' ? j.fillers : {}).slice(0, 12)) fillers[str(k, 30)] = Math.max(0, Math.round(+v || 0));
  return { transcript: str(j.transcript, 6000), duration_s: +j.duration_s || 0, wpm: Math.round(+j.wpm || 0), fillers, long_pauses: Math.round(+j.long_pauses || 0), criteria,
    overall: clampBand(j.overall != null ? j.overall : Object.values(criteria).reduce((a, c) => a + c.band, 0) / 4), errors: normErrs(j.errors),
    pron_notes_ko: (Array.isArray(j.pron_notes_ko) ? j.pron_notes_ko : []).slice(0, 3).map(x => str(x, 300)),
    upgrades: (Array.isArray(j.upgrades) ? j.upgrades : []).slice(0, 6).map(u => ({ plain: str(u && u.plain, 80), better: str(u && u.better, 80) })), model_answer: str(j.model_answer, 4000) };
}
/** 1005 섀도잉 점수 (Saylo식): Gemini only transcribes and notes the sounds; word accuracy is counted here, against the script */
export function normShadow(j) {
  if (!j || typeof j.transcript !== 'string') throw new Error('shape');
  return { transcript: str(j.transcript, 3000), rhythm: Math.max(0, Math.min(100, Math.round(+j.rhythm || 0))), notes_ko: (Array.isArray(j.notes_ko) ? j.notes_ko : []).slice(0, 3).map(x => str(x, 300)) };
}
/** words are compared one by one in canonical form ("forty-five," = "45", "17th." = "17", case and punctuation ignored); ops carry the script's own words for display */
const ckey = w => canon(String(w).replace(/[.,!?;:"“”()]/g, ''));
export function shadowAcc(ref, said) {
  const R = words(ref).map(w => ({ w, k: ckey(w) })).filter(x => x.k), K = words(said).map(ckey).filter(Boolean);
  let i = 0; const ops = diffWords(R.map(x => x.k.replace(/\s+/g, '_')).join(' '), K.map(k => k.replace(/\s+/g, '_')).join(' ')).map(o => o.t === 'ins' ? o : { t: o.t, w: R[i++].w });
  const n = R.length;
  return { acc: n ? Math.round(ops.filter(o => o.t === 'eq').length / n * 100) : 0, ops };
}
/** 1005 AI 대화 (Lucida식): one turn = what was said, ≤2 fixes, one band-6.5 sentence, the partner's next line */
export function normTalk(j) {
  if (!j || typeof j.transcript !== 'string' || typeof j.reply !== 'string') throw new Error('shape');
  return { transcript: str(j.transcript, 3000), reply: str(j.reply, 600), better: str(j.better, 600), fixes: normErrs(j.fixes).slice(0, 2), band: clampBand(j.band) };
}
/** Did the rewrite fix the logged errors? (local check, no Gemini) */
export const fixedErrors = (errs, text) => { const t = ' ' + String(text).toLowerCase().replace(/\s+/g, ' ') + ' '; return errs.map(e => ({ ...e, fixed: !!e.wrong && !t.includes(e.wrong.toLowerCase().trim()) })); };
/** Web Audio pause metrics from a list of per-frame speaking flags (frameMs each) */
export function speechStats(flags, frameMs = 50, minPause = 700) {
  let speak = 0, pauses = 0, run = 0, started = false;
  for (const f of flags) { if (f) { speak++; if (started && run * frameMs >= minPause) pauses++; run = 0; started = true; } else run++; }
  return { ratio: flags.length ? speak / flags.length : 0, pauses };
}
