/* BANDUP v2: IELTS Academic 6.5 coach. Vanilla PWA, local-first (localStorage bandup.db, IndexedDB bandup-audio).
   PRD: scratchpad/ielts/PRD.md. Pure logic lives in srs.js; Gemini in gem.js; recording in rec.js; backup in backup.js. */
import * as S from './srs.js';
import * as G from './gem.js';
import * as REC from './rec.js';
import * as BK from './backup.js';
const { dayKey, addDays, diffDays, dow, isoWeek, mondayOf, XP } = S;

/* ================= helpers ================= */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const I = {"message-circle":"<path d=\"M7.9 20A9 9 0 1 0 4 16.1L2 22Z\"/>","flame":"<path d=\"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4\"/>","settings":"<path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>","house":"<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>","book-open":"<path d=\"M12 5v16\"/><path d=\"M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z\"/>","dumbbell":"<path d=\"M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z\"/><path d=\"m2.5 21.5 1.4-1.4\"/><path d=\"m20.1 3.9 1.4-1.4\"/><path d=\"M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z\"/><path d=\"m9.6 14.4 4.8-4.8\"/>","trending-up":"<path d=\"M16 7h6v6\"/><path d=\"m22 7-8.5 8.5-5-5L2 17\"/>","play":"<path d=\"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z\"/>","pause":"<rect x=\"14\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\"/><rect x=\"5\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\"/>","mic":"<path d=\"M12 19v3\"/><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"/><rect x=\"9\" y=\"2\" width=\"6\" height=\"13\" rx=\"3\"/>","square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/>","check":"<path d=\"M20 6 9 17l-5-5\"/>","x":"<path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/>","chevron-right":"<path d=\"m9 18 6-6-6-6\"/>","chevron-left":"<path d=\"m15 18-6-6 6-6\"/>","chevron-down":"<path d=\"m6 9 6 6 6-6\"/>","headphones":"<path d=\"M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3\"/>","radio":"<path d=\"M16.247 7.761a6 6 0 0 1 0 8.478\"/><path d=\"M19.075 4.933a10 10 0 0 1 0 14.134\"/><path d=\"M4.925 19.067a10 10 0 0 1 0-14.134\"/><path d=\"M7.753 16.239a6 6 0 0 1 0-8.478\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/>","volume-2":"<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\"/><path d=\"M16 9a5 5 0 0 1 0 6\"/><path d=\"M19.364 18.364a9 9 0 0 0 0-12.728\"/>","clock":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>","rotate-ccw":"<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/><path d=\"M3 3v5h5\"/>","arrow-right":"<path d=\"M5 12h14\"/><path d=\"m12 5 7 7-7 7\"/>","pencil":"<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/><path d=\"m15 5 4 4\"/>","target":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/>","calendar":"<path d=\"M8 2v3\"/><path d=\"M16 2v3\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/>","download":"<path d=\"M12 15V3\"/><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><path d=\"m7 10 5 5 5-5\"/>","upload":"<path d=\"M12 3v12\"/><path d=\"m17 8-5-5-5 5\"/><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/>","snowflake":"<path d=\"m10 20-1.25-2.5L6 18\"/><path d=\"M10 4 8.75 6.5 6 6\"/><path d=\"m14 20 1.25-2.5L18 18\"/><path d=\"m14 4 1.25 2.5L18 6\"/><path d=\"m17 21-3-6h-4\"/><path d=\"m17 3-3 6 1.5 3\"/><path d=\"M2 12h6.5L10 9\"/><path d=\"m20 10-1.5 2 1.5 2\"/><path d=\"M22 12h-6.5L14 15\"/><path d=\"m4 10 1.5 2L4 14\"/><path d=\"m7 21 3-6-1.5-3\"/><path d=\"m7 3 3 6h4\"/>","lock":"<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>","eye":"<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>","eye-off":"<path d=\"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49\"/><path d=\"M14.084 14.158a3 3 0 0 1-4.242-4.242\"/><path d=\"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143\"/><path d=\"m2 2 20 20\"/>","skip-forward":"<path d=\"M21 4v16\"/><path d=\"M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z\"/>","book-a":"<path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\"/><path d=\"m8 13 4-7 4 7\"/><path d=\"M9.1 11h5.7\"/>","sparkles":"<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\"/><path d=\"M20 2v4\"/><path d=\"M22 4h-4\"/><circle cx=\"4\" cy=\"20\" r=\"2\"/>","circle-check":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m16 9-5.5 5.5L8 12\"/>","timer":"<line x1=\"10\" x2=\"14\" y1=\"2\" y2=\"2\"/><line x1=\"12\" x2=\"15\" y1=\"14\" y2=\"11\"/><circle cx=\"12\" cy=\"14\" r=\"8\"/>","repeat":"<path d=\"m17 2 4 4-4 4\"/><path d=\"M3 11v-1a4 4 0 0 1 4-4h14\"/><path d=\"m7 22-4-4 4-4\"/><path d=\"M21 13v1a4 4 0 0 1-4 4H3\"/>","spell-check":"<path d=\"m20 15-5.5 5.5L12 18\"/><path d=\"m4 16 6-12 5.115 10.23\"/><path d=\"M6 12h8\"/>","external-link":"<path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/>","plus":"<path d=\"M5 12h14\"/><path d=\"M12 5v14\"/>","book-marked":"<path d=\"M10 2v7.751a.25.25 0 00.407.195l2.28-1.834a.5.5 0 01.627 0l2.28 1.834A.25.25 0 0016 9.751V2\"/><path d=\"M4 19.5v-15A2.5 2.5 0 016.5 2H19a1 1 0 011 1v18a1 1 0 01-1 1H6.5a1 1 0 010-5H20\"/>","pen-line":"<path d=\"M13 21h8\"/><path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/>"};
const ico = (n, c = '') => `<svg class="ico ${c}" viewBox="0 0 24 24" aria-hidden="true">${I[n] || ''}</svg>`;
const today = () => dayKey();
const now = () => new Date();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const mmss = ms => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const wc = t => (String(t || '').match(/[A-Za-z0-9'’-]+/g) || []).length;
const md = k => `${+k.slice(5, 7)}/${+k.slice(8, 10)}`;
const SK_KO = { L: '리스닝', R: '리딩', W: '라이팅', S: '스피킹', G: '문법' };
const ERR_KO = { tense: '과거시제', toinf: 'to부정사', article: '관사', be: 'be동사', prep: '전치사', sva: '주어-동사 일치', plural: '단·복수', wordform: '품사', collocation: '연어', spelling: '철자', wordlimit: '단어 수', number: '숫자', 'reading-ng': 'FALSE·NG 혼동', 'reading-qual': '한정어 함정', 'reading-bg': '배경지식', 'reading-find': '근거 못 찾음', other: '기타' };
const GRAM_TIP = { article: '처음 말하는 셀 수 있는 단수 명사 앞에는 a/an. 특정한 것이면 the. at a pharmacy.', be: '형용사·명사·장소 앞 동사 자리에는 be동사. My job is busy.', tense: 'yesterday, last year, when I was… 가 보이면 동사도 과거형. I moved.', prep: '시간 at 7 / on Monday / in May. 장소 at a point, in an area.', toinf: '~하려고 = to + 동사원형. I came to Canada to study.' };

/* ================= DB ================= */
const DBK = 'bandup.db';
const SET0 = { vocabSrc: 'hk', gmodel: '', voiceEn: '', rate: 1, theme: 'auto', dayStart: 4, nightMin: true, second: '00:30', comebackPlus: true };
const blank = () => ({ v: 1, profile: null, settings: { ...SET0 }, days: {}, streak: S.newStreak(), xp: 0, notes: {}, cards: {}, revlog: [], attempts: [], errors: [], stories: [], mocks: [], weekly: {}, gem: { day: '', calls: 0 }, flags: {}, my: {}, myShadow: [] });
let DB = (() => { try { const d = JSON.parse(localStorage.getItem(DBK)); return d && d.v === 1 ? Object.assign(blank(), d) : blank(); } catch (e) { return blank(); } })();
let saveWarned = 0;
function save() {
  if (DB.revlog.length > 5000) DB.revlog.splice(0, DB.revlog.length - 5000);
  try { localStorage.setItem(DBK, JSON.stringify(DB)); return true; }
  catch (e) { if (Date.now() - saveWarned > 10000) { saveWarned = Date.now(); toast('저장 공간이 가득 찼어요. 설정에서 JSON으로 내보내 주세요', 'warn', 5000); } return false; }
}
DB.settings = { ...SET0, ...DB.settings }; S.setDayStart(DB.settings.dayStart);
G.useSettings(DB.settings);
const dayRec = (k = today()) => (DB.days[k] = DB.days[k] || { steps: {}, secs: 0, xp: 0, rv: 0, nw: 0 });
function gain(n) { if (!n) return; if (DB.flags.xp2 === today()) n *= 2; DB.xp += n; dayRec().xp += n; return n; }
function logErr(type, wrong, right, why, src, makeCard) {
  const e = { id: uid(), ts: Date.now(), type: ERR_KO[type] ? type : 'other', src: src || null, wrong: String(wrong || '').slice(0, 300), right: String(right || '').slice(0, 300), why: String(why || '').slice(0, 300), cardId: null, hits: 0 };
  if (makeCard && e.wrong && e.right) { const cid = 'my:err:' + e.id; DB.my[cid] = { deck: 'err', wrong: e.wrong, right: e.right, why: e.why, type: e.type }; DB.cards[cid] = S.emptyCard(now()); e.cardId = cid; }
  DB.errors.push(e); if (DB.errors.length > 3000) DB.errors.splice(0, DB.errors.length - 3000);
  return e;
}
function addAttempt(a) { const x = { id: uid(), ts: Date.now(), score: null, band: null, words: 0, secs: 0, timed: false, meta: {}, ...a }; DB.attempts.push(x); return x; }
function creditDay(kind) {
  const k = today(), d = dayRec(k), was = !!d.kind;
  if (!was) d.kind = kind;
  const fresh = S.credit(DB.streak, k, DB.days, kind, { comebackPlus: DB.settings.comebackPlus !== false });
  if (!fresh && kind === 'radio' && !was) delete d.kind;   // radio beyond 2/week: exposure only
  save();
  return fresh;
}
const PLAN = () => S.plan(DB.profile.start, DB.profile.testDate);
const WEEK = (k = today()) => S.weekOf(PLAN(), k);

/* ================= content ================= */
const C = { src: {} };
const FILES = ['hackers', 'vocab', 'irregular', 'grammar', 'reading', 'listening', 'dictation', 'shadow', 'speaking', 'writing', 'links', 'rubric'];
const hasItems = j => j && typeof j === 'object' && ((Array.isArray(j.items) && j.items.length) || (j.p1 && j.p1.length) || (j.t1 && j.t1.length) || (j.t2 && j.t2.length));
async function tryLoad(u) { try { const r = await fetch(u, { cache: 'no-cache' }); if (!r.ok) return null; const j = await r.json(); return hasItems(j) ? j : null; } catch (e) { return null; } }
/** new-card order: 해커스 DAY 순서 먼저(기본) or the bundled list first; the other follows */
function buildOrder() { const hk = C.HK.slice().sort((a, b) => a.day - b.day || a.ts - b.ts).map(n => n.id + ':r'); C.ORDER = DB.settings.vocabSrc === 'base' ? [...C.BASE, ...hk] : [...hk, ...C.BASE]; }
async function loadContent() {
  await Promise.all(FILES.map(async f => {
    let j = await tryLoad(`content/${f}.json`), src = 'real';
    if (!j) { j = await tryLoad(`content/_sample/${f}.json`); src = j ? 'sample' : 'none'; }
    C[f] = j || { items: [] }; C.src[f] = src;
  }));
  const sp = C.speaking; C.p1 = sp.p1 || []; C.p2 = sp.p2 || []; C.p3 = sp.p3 || [];
  const wr = C.writing; C.t1 = wr.t1 || []; C.t2 = wr.t2 || []; C.fr = wr.franklin || [];
  C.NOTE = {}; for (const n of C.vocab.items) C.NOTE[n.id] = n;
  const seen = new Set(C.vocab.items.map(n => n.w.toLowerCase())); C.HK = (C.hackers.items || []).filter(n => !seen.has(n.w.toLowerCase()) && (seen.add(n.w.toLowerCase()), true));   // 1005 해커스 DAY 단어 (기본 단어장과 겹치는 단어는 기본 카드로)
  for (const n of C.HK) C.NOTE[n.id] = n;
  C.IRR = {}; for (const v of C.irregular.items) C.IRR[v.base] = v;
  const by = d => C.vocab.items.filter(n => n.deck === d), core = by('core'), lis = by('listening'), rd = by('reading'), order = [];
  for (let i = 0; order.length < C.vocab.items.length && i < 2000; i++) { const x = i % 5 < 3 ? core.shift() : i % 5 === 3 ? lis.shift() : rd.shift(); if (x) order.push(x.id + ':r'); else if (!core.length && !lis.length && !rd.length) break; }
  C.BASE = order; buildOrder();
  G.useRubric(C.rubric.items || []);
}
const au = p => !p ? '' : /^https?:/.test(p) ? p : 'content/' + p;

/* ================= audio & speech ================= */
const AU = document.getElementById('au');
let speakTok = 0, clipEnd = null;   // clipEnd: the playing clip's resolver — a newer clip or a stop settles it at once (1005: a superseded clip used to time out 20 s later and fall back to speaking the old word)
function stopAudio() { speakTok++; const ce = clipEnd; clipEnd = null; if (ce) ce(true, true); try { AU.pause(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {} }
/** play a clip [from, to) → resolves true when done, false on error (caller falls back to TTS) */
function playClip(src, { from = 0, to = null, rate = 1 } = {}) {
  stopAudio(); const tok = speakTok;
  return new Promise(res => {
    if (!src) return res(false);
    let fin = false; const end = (ok, gone) => { if (fin) return; fin = true; if (clipEnd === end) clipEnd = null; if (!gone) { AU.onended = AU.onerror = AU.ontimeupdate = null; if (!ok) AU.removeAttribute('src'); } res(ok); };   // gone = superseded: leave the element to the newer clip
    clipEnd = end;
    AU.onerror = () => end(false); AU.onended = () => end(true);
    AU.ontimeupdate = () => { if (tok !== speakTok) return end(true); if (to != null && AU.currentTime >= to) { AU.pause(); end(true); } };
    if (!AU.src.endsWith(src.replace(/^\.?\//, ''))) AU.src = src;
    AU.playbackRate = rate;
    const go = () => { try { AU.currentTime = from; } catch (e) {} AU.play().catch(() => end(false)); };
    AU.readyState >= 1 ? go() : (AU.onloadedmetadata = () => { AU.onloadedmetadata = null; go(); }, AU.load());
    setTimeout(() => end(false, tok !== speakTok), 20000 + (to ? (to - from) * 1000 : 60000));
  });
}
let VOICES = [];
const loadVoices = () => { try { VOICES = speechSynthesis.getVoices(); } catch (e) {} };
if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function voiceFor(lang = 'en', name = '') {
  if (lang.startsWith('ko')) return VOICES.find(v => /Yuna/.test(v.name)) || VOICES.find(v => /^ko/.test(v.lang));
  if (name) { const v = VOICES.find(x => x.name.startsWith(name)); if (v) return v; }
  const pref = DB.settings.voiceEn; if (pref) { const v = VOICES.find(x => x.name === pref); if (v) return v; }
  return VOICES.find(v => /en-GB/.test(v.lang)) || VOICES.find(v => /en-AU/.test(v.lang)) || VOICES.find(v => /^en/.test(v.lang));
}
/** speak text; resolves when done (with a timeout so a silent engine never blocks the flow) */
function speak(text, { lang = 'en-GB', rate = DB.settings.rate || 1, voice = '', keep = false } = {}) {
  if (!keep) stopAudio(); const tok = speakTok;
  return new Promise(res => {
    const est = 600 + String(text).split(/\s+/).length * 420 / rate, t = setTimeout(() => res(true), est + 1500);
    try {
      if (!window.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(text), v = voiceFor(lang, voice);
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang; u.rate = rate;
      u.onend = u.onerror = () => { clearTimeout(t); if (tok === speakTok || keep) res(true); };
      speechSynthesis.speak(u);
    } catch (e) { clearTimeout(t); res(true); }
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ================= UI primitives ================= */
function toast(msg, kind = '', ms = 3000) {
  const w = $('#toast'); w.innerHTML = `<div class="toast ${kind}" role="status">${esc(msg)}</div>`;
  clearTimeout(toast.t); toast.t = setTimeout(() => { w.innerHTML = ''; }, ms);
}
function sheet(html) { $('#sheet').innerHTML = html; $('#sheet').hidden = false; $('#scrim').hidden = false; const f = $('#sheet input, #sheet button'); f && f.focus({ preventScroll: true }); }
function closeSheet() { $('#sheet').hidden = true; $('#scrim').hidden = true; $('#sheet').innerHTML = ''; }
const pill = (t, k = '') => `<span class="pill ${k}">${t}</span>`;
/** metric tiles; a tile whose value is 0 is not drawn (no failure-reminding zeros), all zero → '' */
const metrics = list => { const L = list.filter(([, v]) => v); return L.length ? `<div class="metrics">${L.map(([l, v, u]) => `<div><span class="cap">${l}</span><b class="num">${v}${u || ''}</b></div>`).join('')}</div>` : ''; };
const bar = (v, k = '') => `<span class="bar ${k}" role="img" aria-label="${Math.round(v * 100)}%"><i style="width:${Math.round(Math.max(0, Math.min(1, v)) * 100)}%"></i></span>`;
const btn = (label, act, { cls = '', icon = '', dis = false, x = '', aria = '' } = {}) => `<button class="btn ${cls}" data-act="${act}" ${x} ${dis ? 'disabled' : ''} ${aria ? `aria-label="${aria}"` : ''}>${icon ? ico(icon) : ''}${label}</button>`;

/* ================= missions ================= */
const ACT_NAME = { talk: 'AI 대화 3턴', vocab: '단어 SRS', shadow1: '섀도잉 1문장', shadow: '섀도잉 녹음', p1: 'Part 1 세 문장', listen: 'Listening 파트 세트', read: 'Reading 지문', t1: 'Writing T1', t2: 'Writing T2', franklin: 'Franklin 재구성', p2: 'Speaking P2', quiz: '오류 퀴즈', mockInput: '공식 L·R 모의와 원점수', '432': '4/3/2 유창성', story: '스토리 뱅크 다듬기', review: '주간 리뷰', diagVocab: '진단: 어휘 체크 30', diagL1: '진단: Listening Part 1', diagL4: '진단: Listening Part 4', diagR: '진단: Reading 5분', diagS: '진단: Speaking 1분', dict: '받아쓰기 5문장', drill: '철자·숫자 드릴', radio: '라디오 모드', restart: '다시 시작' };
const blockName = b => b.act === 'p2' && b.opts && b.opts.thenP3 ? 'Speaking P2+P3' : b.act === 'quiz' ? `오류 퀴즈 ${(b.opts && b.opts.n) || 5}문항` : ACT_NAME[b.act] || b.act;
const isWknd = k => dow(k) === 0 || dow(k) === 6;
/** late night = 22:00 until the day boundary (04:00 by default): the one-tap mission is 5 minutes */
const isNight = (d = now()) => { const h = d.getHours(); return h >= 22 || h < S.dayStartH(); };
function missionKind() {
  const k = today(), away = S.awayDays(DB.streak, k), d = DB.days[k];
  if (DB.streak.last && away >= 1 && !(d && d.kind) && DB.flags.chipDay !== k) return 'comeback';
  if (DB.flags.chipDay === k && DB.flags.chip) return DB.flags.chip;
  const P = PLAN(); if (k >= P.test || (S.isTaper(P, k) && (dow(k) === 5 || k === P.taperEnd))) return 'min';   // exam day and after: nothing heavy
  const minRun = [1, 2].every(i => (DB.days[addDays(k, -i)] || {}).kind === 'min');   // two light days in a row: keep it light
  if (!(d && d.kind) && ((DB.settings.nightMin !== false && isNight()) || minRun)) return 'min';
  return isWknd(k) ? 'wknd' : 'std';
}
const DIAG_PARTS = [['v', [{ id: 'diagVocab', min: 1, act: 'diagVocab' }]], ['l', [{ id: 'diagL1', min: 2, act: 'listen', opts: { part: 1, diag: true } }, { id: 'diagL4', min: 2, act: 'listen', opts: { part: 4, diag: true } }]], ['rs', [{ id: 'diagR', min: 5, act: 'read', opts: { len: 'short', minutes: 5, diag: true } }, { id: 'diagS', min: 1, act: 'p1', opts: { quick: true, diag: true } }]]];
function missionBlocks(kind, k = today()) {
  const bl = S.dayBlocks(PLAN(), k, kind === 'wknd' ? 'std' : kind, DB.profile).map(b => ({ ...b, act: b.id === 'speak' && b.act === 'p1' && G.getKey() ? 'talk' : b.act, opts: { ...(b.opts || {}) } }));   // 1005: 화·목 말하기 = AI 대화 (키 없으면 Part 1)
  if ((kind === 'std' || kind === 'wknd') && DB.profile.diag === 'split') {
    const done = DB.flags.diag || {}, next = DIAG_PARTS.find(([p]) => !done[p]);
    if (next && DB.flags.diagDay !== k) bl.splice(1, 0, ...next[1].map(b => ({ ...b, diagPart: next[0] })));
    else if (next && DB.flags.diagDay === k) { /* one diag part per day */ }
  }
  return bl;
}
const MISSION_MIN = { min: 5, comeback: 3 };
const kindMins = (kind, k = today()) => missionBlocks(kind, k).reduce((a, b) => a + (b.min || 0), 0);
const kindLabel = kind => kind === 'min' ? '5분' : kind === 'comeback' ? '3분' : kind === 'wknd' ? '주말' : `${kindMins(kind)}분`;
function missionTitle(k = today()) {
  const d = dow(k), W = WEEK(k), P = PLAN();
  if (S.isTaper(P, k)) return `${S.DOW_KO[d]}요일, 테이퍼`;
  if (d === 6) return `토요일, ${W.sat === 'full' ? '풀 모의고사 날' : W.sat === 'diag' ? '진단 모의고사 날' : '미니 모의고사 날'}`;
  if (d === 0) return `일요일, ${W.sat === 'full' ? 'W·S 모의고사 날' : '정리하는 날'}`;
  const sk = S.SKILL_OF_DOW[d];
  return `${S.DOW_KO[d]}요일, ${sk === 'L' ? '리스닝 날' : sk === 'R' ? '리딩 날' : sk === 'W1' ? (W.n >= 3 && W.n % 2 === 1 ? 'Franklin 날' : '라이팅 T1 날') : sk === 'W2' ? '라이팅 T2 날' : '스피킹 날'}`;
}
const creditAfter = (kind, bl) => kind === 'min' || kind === 'comeback' ? bl.map(b => b.id) : kind === 'std' ? ['vocab', 'speak'].filter(id => bl.some(b => b.id === id)) : bl.slice(0, 2).map(b => b.id);

/* ================= render: shell ================= */
let TAB = 'today';
const NAV = [['today', '오늘', 'house'], ['words', '단어', 'book-a'], ['train', '훈련', 'dumbbell'], ['grow', '성장', 'trending-up']];
const LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#155EEF"/><path d="M11 27h4v-6h-4zM18 27h4V16h-4zM25 27h4V11h-4z" fill="#fff"/></svg>';
function renderNav() {
  $('#nav').hidden = !DB.profile;
  $('#nav').innerHTML = `<div class="brand" aria-hidden="true">${LOGO}</div>` + NAV.map(([id, l, ic]) => `<button data-go="${id}" ${TAB === id ? 'aria-current="page"' : ''}>${ico(ic, 's24')}${l}</button>`).join('') + `<button class="gear" data-go="set" ${TAB === 'set' ? 'aria-current="page"' : ''}>${ico('settings', 's24')}설정</button>`;
}
function render() {
  if (!DB.profile) return renderOnb();
  document.body.classList.remove('onb-on');
  renderNav();
  $('#main').innerHTML = (R[TAB] || R.today)();
  balance(); renderPanel(); fitLists();
}
/* fill lists (≥700): a .fill card's .fl list keeps only the rows that fit its column, so columns end at the viewport bottom with no blank band */
function fitLists(root = document) {
  for (const fl of $$('.fl', root)) {
    const k = [...fl.children]; k.forEach(x => { x.hidden = false; }); fl.style.minHeight = ''; fl.classList.remove('cut');
    if (innerWidth < 700 || !k.length) continue;
    fl.style.minHeight = k[0].offsetHeight + 'px';   // the first row always shows
    const b = fl.getBoundingClientRect().bottom + .5; let cut = false;
    for (const x of k.slice(1)) if (cut || x.getBoundingClientRect().bottom > b) { x.hidden = true; cut = true; }
    fl.classList.toggle('cut', cut);
  }
}
const fillCard = (title, rows, extra = '', tw = 200) => rows.length ? `<section class="card fill"><div class="row" style="min-height:0"><h2 class="h3 grow">${title}</h2>${extra}</div><div class="fl tiles" style="--tw:${tw}px">${rows.join('')}</div></section>` : '';
/** words to look at: today's reviews, today's new cards, then the next new cards in study order */
function wordRows(n = 40, skip = []) {
  const q = vocabQueue(), seen = new Set(skip), out = [];
  const add = (id, tag) => { const nid = id.replace(/:[rp]$/, ''), x = C.NOTE[nid]; if (!x || seen.has(nid) || out.length >= n) return; seen.add(nid); out.push(`<div class="row" style="min-height:44px"><b lang="en">${esc(x.w)}</b><span class="cap">${esc(x.pos)}</span><span class="grow mut">${esc(x.ko)}</span>${tag}</div>`); };
  q.due.forEach(id => add(id, pill('복습', 'pri'))); q.fresh.forEach(id => add(id, pill('오늘')));
  for (const id of C.ORDER) { if (out.length >= n) break; if (!DB.cards[id]) add(id, pill('다음')); }
  return out;
}
/** the days ahead until the test: each day's plan and minutes */
function schedRows(n = 30) {
  const k = today(), P = PLAN(), out = [];
  for (let i = 1; out.length < n; i++) { const d = addDays(k, i); if (d > P.test) break;
    const test = d === P.test, mins = test ? 0 : S.dayBlocks(P, d, 'std', DB.profile).reduce((a, b) => a + (b.min || 0), 0);
    out.push(`<div class="row"><span class="num cap" style="width:3.2em">${md(d)}</span><span class="grow">${test ? '<b>시험일</b>' : esc(missionTitle(d))}</span>${test ? pill('D-DAY', 'pri') : `<span class="cap num">${mins}분</span>`}</div>`); }
  return out;
}
/** related errors first (my own, newest), then my other errors, then bank sentences of the week's grammar focus: wrong → right */
function errRows(types = S.GRAM_TYPES, n = 30, skip = new Set()) {
  const ft = S.focusType(PLAN(), today(), DB.errors, focusOv()), mine = DB.errors.filter(e => e.wrong && e.right && e.wrong.length < 90).slice().reverse();
  const L = [...mine.filter(e => types.includes(e.type)), ...mine.filter(e => !types.includes(e.type))].map(e => [e.type, e.wrong, e.right]);
  const bank = (C.grammar.items || []).filter(q => q.kind === 'fix').sort((a, b) => (b.type === ft) - (a.type === ft) || (types.indexOf(a.type) < 0) - (types.indexOf(b.type) < 0)).map(q => [q.type, q.prompt, q.answer]);
  return [...L, ...bank].filter(([, w]) => !skip.has(w)).slice(0, n).map(([t, w, r]) => `<div class="row" style="align-items:flex-start;padding:8px 0;min-height:44px">${pill(ERR_KO[t] || t)}<span class="grow"><s class="faint" lang="en">${esc(w)}</s> → <b lang="en">${esc(r)}</b></span></div>`);
}
/* two balanced columns ≥700px: cards keep their order and go to the shorter column (no-empty-space rule) */
function balance() {
  if (innerWidth < 700) return;
  for (const m of $$('.masonry')) {
    const kids = [...m.children], cols = [0, 1].map(() => Object.assign(document.createElement('div'), { className: 'col' }));
    m.classList.add('bal'); m.append(...cols); cols[0].append(...kids);
    const hs = kids.map(k => k.getBoundingClientRect().height + 16), n = kids.length;
    let best = 0, bd = Infinity;   // exact 2-way split (n ≤ 12 → ≤ 2048 tries); first card stays left; order kept inside each column
    for (let mask = 0; mask < 1 << n; mask += 2) { let a = 0, b = 0; for (let i = 0; i < n; i++) (mask >> i & 1 ? (b += hs[i]) : (a += hs[i])); const d = Math.abs(a - b); if (d < bd) { bd = d; best = mask; } }
    kids.forEach((k, i) => cols[best >> i & 1].append(k));
  }
}
function header() {
  const k = today(), dd = diffDays(k, DB.profile.testDate), s = DB.streak, away = S.awayDays(s, k), grace = s.last && away >= 1 && !(DB.days[k] && DB.days[k].kind);
  return `<header class="hdr"><span class="title">밴드업</span><span class="dday">${dd > 0 ? 'D-' + dd : dd === 0 ? 'D-DAY' : '시험 끝'}</span>
    <span class="streak ${grace ? 'grace' : DB.days[k] && DB.days[k].kind ? 'on' : ''}" aria-label="연속 ${s.cur}일">${ico('flame', 's24')}<span class="num">${s.cur}</span></span>
    <button class="btn icon ghost" data-go="set" aria-label="설정">${ico('settings', 's24')}</button></header>`;
}
/** B5: the if-then cue that fits the hour. More than 3 hours from the anchor time → the backup anchor. */
function cueNow(d = now()) {
  const A = DB.profile.anchor || {}; if (!A.cue && !A.backup) return '';
  const [h, m] = String(A.time || '07:40').split(':').map(Number), t = d.getHours() * 60 + d.getMinutes(), diff = Math.abs(t - (h * 60 + m));
  return Math.min(diff, 1440 - diff) > 180 ? (A.backup || A.cue) : (A.cue || A.backup);
}
const R = {};

/* ---------- band axis (shared by the home hero and the growth gauges): labels sit exactly on their tick lines ---------- */
const AX = [4, 5, 6, 7, 8];
const X = v => ((Math.min(8.5, Math.max(4, v)) - 4) / 4.5 * 100).toFixed(2) + '%';
const axis = (extra = '') => `<div class="ax" aria-hidden="true">${AX.map(v => `<span class="ax-lab num" data-v="${v}" style="left:${X(v)}">${v.toFixed(1)}</span>`).join('')}${extra}</div>`;
const track = (x, marks = '') => `<span class="gz-track">${AX.map(v => `<i class="gz-tick" data-v="${v}" style="left:${X(v)}"></i>`).join('')}${x && x.lo != null ? `<span class="gz-band" style="left:${X(x.lo)};width:calc(${X(x.hi)} - ${X(x.lo)})"></span>` : ''}${marks}${x && x.mid != null ? `<span class="gz-dot" style="left:${X(x.mid)}"></span>` : ''}</span>`;

/* ---------- 오늘 ---------- */
function homeHeader() { return `<header class="hdr"><span class="title">밴드업</span><span class="sp"></span><button class="btn icon ghost" data-go="set" aria-label="설정">${ico('settings', 's24')}</button></header>`; }
function hero(kind, bl, done, allDone, week = true) {
  const k = today(), g = S.gauges(DB, k), e = g.est, dd = diffDays(k, DB.profile.testDate), st = DB.streak, W = WEEK(k), P = PLAN();
  const moment = done && DB.flags.momentShown !== k;
  const ws = Math.min(g.W.hi, g.S.hi), lr = Math.min(g.L.raw || 0, g.R.raw || 0);
  const cps = [['W6', 'W·S 5.5', ws >= 5.5], ['W7', 'L·R 28/40', lr >= 28], ['W8', 'W·S 6.0', ws >= 6]];
  const wk = isWknd(k), taperFri = S.isTaper(P, k) && dow(k) === 5, big = wk ? 'wknd' : 'std';
  const alts = done ? [] : taperFri ? [] : kind === 'comeback' ? [['min', '5분'], [big, `${kindLabel(big)} 미션`]] : kind === 'min' ? [[big, `${kindLabel(big)} 미션`]] : [['min', '5분만']];
  const light = done && /^(min|comeback|radio)$/.test(dayRec(k).kind);   // a light day is already credited: the rest is optional, not "unfinished"
  const primary = allDone || light ? '더 하기 (선택)' : kind === 'comeback' ? '3분으로 이어가기' : bl.some(b => (dayRec(k).steps || {})[b.id]) ? '이어서 하기' : `${kindLabel(kind)} 시작`;
  const dLab = dd > 0 ? 'D-' + dd : dd === 0 ? 'D-DAY' : '시험 끝';
  return `<section class="card hero ${done ? 'done' : ''} ${moment ? 'moment' : ''}" aria-labelledby="hTitle">
    <div class="hero-top"><h2 class="h2" id="hTitle"><span class="dday num">${dLab}</span>${dd >= 0 ? ' 6.5까지' : ''}</h2><span class="streak ${done ? 'on' : ''}" aria-label="연속 ${st.cur}일">${ico('flame', 's24')}<span class="num sn">${st.cur}</span></span></div>
    <div class="est"><span class="big num">${e.lo.toFixed(1)}–${e.hi.toFixed(1)}</span><span class="cap">지금 overall 추정</span>${e.prov ? pill('L·R 진단 전') : ''}${done ? pill(ico('circle-check', 's16') + '오늘 인정', 'ok') : ''}</div>
    <div class="gz hero-gz">${track(e, `<i class="gz-tgt" style="left:${X(6.5)}"></i>`)}${axis(`<span class="ax-lab tgt num" data-v="6.5" style="left:${X(6.5)}">6.5</span>`)}</div>
    <div class="cps" aria-label="6.5 체크포인트">${cps.map(([w, t, ok]) => `<span class="cp ${ok ? 'ok' : ''}" title="${w} 목표 ${t}${ok ? ', 통과' : ''}"><b>${w}</b>${t}</span>`).join('')}</div>
    <p class="lever">${ico('target', 's16')}<span><b>이번 주 레버</b> ${esc(g.cheap)}</span></p>
    ${btn(primary, 'start', { cls: 'pri lg block', icon: 'play' })}
    ${alts.length ? `<div class="alts">${alts.map(([c, l]) => `<button class="chip" data-act="chip" data-k="${c}">${l}</button>`).join('')}</div>` : ''}
    ${week ? weekStrip(k, W) : ''}</section>`;
}
/** this week: done days green (today fills during the completion moment), freeze-kept days blue with a snowflake */
function weekStrip(k, W) {
  const frz = new Set(DB.streak.frzDays || []);
  return `<div class="wk" aria-label="이번 주"><div class="row" style="min-height:0"><h3 class="h3 grow">W${W.n} · ${S.PHASE_KO[W.phase]}</h3><span class="cap">문법 초점 ${esc(W.gramKo)}</span></div>
    <div class="week7">${[0, 1, 2, 3, 4, 5, 6].map(i => { const x = addDays(W.mon, i), dd = DB.days[x], lab = ['L', 'R', 'W', 'W', 'S', '모의', '정리'][i], ok = dd && dd.kind; return `<div class="${ok ? 'done' : frz.has(x) ? 'frz' : ''} ${x === k ? 'today' : ''}"><span>${S.DOW_KO[dow(x)]}</span>${ok ? ico('check') : frz.has(x) ? ico('snowflake') : `<b>${lab}</b>`}</div>`; }).join('')}</div></div>`;
}
R.today = () => {
  const k = today(), kind = missionKind(), bl = missionBlocks(kind), d = dayRec(k), steps = d.steps || {}, W = WEEK(k), P = PLAN();
  const away = S.awayDays(DB.streak, k), allDone = bl.every(b => steps[b.id]), ftype = S.focusType(P, k, DB.errors, focusOv(k)), cue = cueNow();
  const mins = bl.reduce((a, b) => a + (b.min || 0), 0), done = !!d.kind;
  const title = kind === 'comeback' ? (away >= 3 ? '다시 시작해요' : '어제는 쉬었어요. 오늘 3분이면 이어져요') : kind === 'min' ? '오늘은 5분 미션' : missionTitle(k);
  const wide = innerWidth >= 700, moment = done && DB.flags.momentShown !== k;
  const mission = `<section class="card ${wide && moment ? 'moment' : ''}" aria-labelledby="mTitle">
    <div class="row" style="min-height:0"><h2 class="h2 grow" id="mTitle">${title}</h2>${pill(`약 ${mins}분`)}</div>
    ${cue ? `<p class="ifthen">${ico('target', 's16')}<span><b>${esc(cue)}</b> → 5분</span></p>` : ''}
    <div class="steps">${bl.map((b, i) => stepRow(b, i, steps[b.id])).join('')}</div>
    ${kind === 'min' || kind === 'comeback' ? `<div class="stack"><p class="cap">여유가 있으면 이어서: ${esc(missionTitle(k))}</p><div class="wrap">${missionBlocks(isWknd(k) ? 'wknd' : 'std').map(b => pill(`${blockName(b)} ${b.min}분`)).join('')}</div></div>` : ''}
    <p class="cap"><b class="ink">W${W.n} 할 일</b> ${esc(W.focus)}</p>${wide ? weekStrip(k, W) : ''}</section>`;   // ≥700: the week strip sits with the plan, so the hero column has room for 오늘의 약점
  const h = hero(kind, bl, done, allDone, !wide), weak = weakCard(ftype), plus = plusCard();
  if (done && DB.flags.momentShown !== k) { DB.flags.momentShown = k; save(); }   // the one 400ms completion moment plays once per day
  if (!wide) return `${homeHeader()}<div class="masonry">${h}${mission}${plus}${weak}</div>`;
  const q = vocabQueue();
  return `${homeHeader()}<div class="page"><div class="col">${h}${weak}</div><div class="col">${mission}${plus}${fillCard('오늘 볼 단어', wordRows(), `<span class="cap num">복습 ${q.due.length} · 새 ${q.fresh.length}</span>`)}</div></div>`;
};
/** a mission step: done (green check), skipped (amber, "건너뜀"), or its number */
const stepRow = (b, i, st) => `<div class="step ${st === 1 ? 'done' : st === 2 ? 'skip' : ''}"><span class="n">${st === 1 ? ico('check', 's16') : st === 2 ? ico('skip-forward', 's16') : i + 1}</span><span>${blockName(b)}</span>${st === 2 ? '<span class="sk">건너뜀</span>' : `<span class="m">${b.min}분</span>`}</div>`;
/** 오늘의 약점: the five repeat-error types, my most frequent first; a tap opens a 3-question fix (1분 교정) */
function weakCard(ft) {
  const cnt = {}, last = {}; for (const e of DB.errors) if (S.GRAM_TYPES.includes(e.type) && e.wrong && e.right) { cnt[e.type] = (cnt[e.type] || 0) + 1; last[e.type] = e; }
  const bank = t => (C.grammar.items || []).find(q => q.type === t && q.kind === 'fix') || { prompt: '', answer: '' };
  const types = S.GRAM_TYPES.slice().sort((a, b) => (cnt[b] || 0) - (cnt[a] || 0) || (b === ft) - (a === ft));
  const rows = types.map(t => { const e = last[t], w = e ? e.wrong : bank(t).prompt, r = e ? e.right : bank(t).answer;
    return `<button class="row wk-row" data-act="fixType" data-v="${t}" aria-label="${ERR_KO[t]} 1분 교정">${pill(ERR_KO[t], cnt[t] ? 'warn' : t === ft ? 'pri' : '')}<span class="grow"><s class="faint" lang="en">${esc(w)}</s> → <b lang="en">${esc(r)}</b></span>${cnt[t] ? `<span class="cap num">${cnt[t]}건</span>` : ''}</button>`; });
  return `<section class="card fill" aria-labelledby="wkTitle"><div class="row" style="min-height:0"><h2 class="h2 grow" id="wkTitle">오늘의 약점</h2><span class="cap">탭하면 1분 교정</span></div>
    <div class="fl tiles" style="--tw:280px"><p class="basis" style="grid-column:1/-1;margin-bottom:6px"><b>이번 주 문법: ${ERR_KO[ft]}</b> ${esc(GRAM_TIP[ft] || '')}</p>${rows.join('')}${errRows(S.GRAM_TYPES, 30, new Set(types.map(t => last[t] ? last[t].wrong : bank(t).prompt))).join('')}</div></section>`;
}
/* 네 영역 게이지 (성장 탭). Tap a row for the basis. */
function gaugeCard() {
  const g = S.gauges(DB, today());
  const hist = s => DB.attempts.filter(a => a.skill === s && a.band && a.band.overall != null).sort((a, b) => a.ts - b.ts).map(a => a.band.overall).concat(DB.mocks.filter(m => m[s] != null).map(m => s === 'L' || s === 'R' ? S.bandOf(m[s], s) : m[s])).slice(-12);
  const rows = ['L', 'R', 'W', 'S'].map(s => { const x = g[s], sp = spark(hist(s));
    return `<details class="gz-item" data-s="${s}"><summary class="gz-row" aria-label="${SK_KO[s]} ${x.none ? '진단 전' : x.lo + '에서 ' + x.hi}, 근거 보기"><b>${s}</b>${x.none ? `<span class="gz-none">${pill('진단 전')}<span class="cap">${s === 'L' ? '리스닝 10문항으로 진단해요' : '리딩 6문항으로 진단해요'}</span></span>` : track(x, `<i class="gz-tgt" style="left:${X(g.target[s])}"></i>`)}<span class="v num">${x.none ? '' : `${x.lo.toFixed(1)}–${x.hi.toFixed(1)}`}</span></summary>
      <div class="gz-more"><p class="basis"><b>${esc(x.text)}</b> ${esc(x.detail)}</p>${sp}</div></details>`; }).join('');
  return `<section class="card" aria-labelledby="gTitle"><div class="row" style="min-height:0"><h2 class="h2 grow" id="gTitle">영역별 게이지</h2><span class="cap">탭하면 근거</span></div>
    <div class="gz">${rows}<div class="gz-scale"><span></span>${axis()}<span></span></div></div>
    <div class="gz-legend"><span><i class="lg-tgt"></i>목표</span><span><i class="lg-band"></i>범위</span><span><i class="lg-dot"></i>추정</span></div></section>`;
}

/* ---------- 단어 ---------- */
function vocabQueue(mode = 'full', k = today()) {
  const d = dayRec(k), cb = DB.flags.cb === k, extra = DB.flags.extra === k;
  const newLimit = mode === 'comeback' ? 0 : DB.flags.firstDay === k ? 10 : S.newLimitFor(k, DB.profile, { comeback: cb, extra });
  return S.buildQueue(DB.cards, C.ORDER, now(), { newLimit, reviewCap: cb ? 30 : 60, reviewedToday: d.rv || 0, newToday: d.nw || 0, prefix: ['nawl:', 'ngsl:', 'hk:', 'my:'] });
}
R.words = () => {
  const q = vocabQueue(), k = today(), cb = DB.flags.cb === k, H = S.hackersLink(DB.days, k);
  const decks = [['core', 'Core 학술'], ['listening', 'Listening'], ['reading', 'Reading 주제']].map(([d, l]) => { const all = C.vocab.items.filter(n => n.deck === d), seen = all.filter(n => DB.cards[n.id + ':r']).length; return `<div class="row"><span style="width:6.8em">${l}</span>${bar(all.length ? seen / all.length : 0)}<span class="num cap" style="width:5.5em;text-align:right">${seen}/${all.length}</span></div>`; });
  const myN = t => Object.values(DB.my).filter(x => x.deck === t).length, myDue = t => Object.keys(DB.my).filter(id => DB.my[id].deck === t && DB.cards[id] && DB.cards[id].due <= Date.now()).length;
  const my = [['exp', '내 표현'], ['err', '내 오류']].map(([t, l]) => `<div class="row"><span style="width:6.8em">${l}</span>${bar(myN(t) ? 1 - myDue(t) / myN(t) : 0, 'ok')}<span class="num cap" style="width:5.5em;text-align:right">${myN(t)}장</span></div>`);
  const sum = `<section class="card"><h2 class="h2">오늘의 단어</h2>
    ${metrics([['복습', q.due.length, '장'], ['새 카드', q.fresh.length, '장'], ['익힌 단어', Object.keys(DB.cards).filter(id => id.endsWith(':r') && DB.cards[id].state === 2).length, '']]) || '<p class="cap">오늘 볼 카드를 다 봤어요. 라디오로 들어도 좋아요.</p>'}
    ${isWknd(k) && DB.flags.extra !== k ? `<button class="btn line block" data-act="extra">${ico('plus')}주말 보충 새 카드 +10</button>` : ''}
    ${cb ? '<p class="cap">오늘은 복습을 가볍게 30장까지만 보여 줘요.</p>' : ''}
    ${btn('복습 시작', 'vocabGo', { cls: 'pri lg block', icon: 'play', dis: !q.due.length && !q.fresh.length })}</section>`;
  const radio = `<section class="card"><div class="row" style="min-height:0">${ico('radio', 's24')}<h2 class="h2 grow">라디오 모드</h2>${pill('손 안 쓰고 듣기')}</div><p class="cap">단어 두 번, 3초 쉼, 한국어 뜻, 예문 순서예요. 화면이 꺼져도 이어져요. 5분 이상 들으면 가벼운 날로 인정돼요(주 2회).</p>${btn('라디오 켜기', 'radioGo', { cls: 'line block', icon: 'headphones' })}</section>`;
  const deckCard = `<section class="card"><h2 class="h2">덱</h2><div class="rowlist">${decks.join('')}${my.join('')}</div></section>`;
  const hk = `<section class="card"><div class="row" style="min-height:0">${ico('external-link')}<h2 class="h2 grow">해커스 DAY ${H.n} 같이 듣기</h2></div>
    <a class="btn line block" href="${H.url}" target="_blank" rel="noopener">${ico('play')}유튜브에서 DAY ${H.n}부터 열기</a>
    <details><summary class="cap" style="min-height:44px;display:flex;align-items:center">영상 제작자가 밝힌 뜻풀이 오류 7곳</summary><ul class="cap" style="margin:0;padding-left:18px">${S.HACKERS_ERRATA.map(e => `<li>${esc(e)}</li>`).join('')}</ul></details></section>`;
  if (innerWidth < 700) return `${header()}<div class="masonry">${sum}${deckCard}${radio}${hk}</div>`;
  return `${header()}<div class="page"><div class="col">${sum}${deckCard}${radio}${hk}</div><div class="col">${fillCard('단어 미리 보기', wordRows(60), `<span class="cap">복습, 오늘 새 카드, 다음 순서</span>`)}</div></div>`;
};

/* ---------- 훈련 ---------- */
const TILES = {
  L: { ic: 'headphones', name: 'Listening', list: [['listen', '파트 세트 (빈칸 예측)'], ['dict', '받아쓰기 5문장'], ['drill', '철자·숫자 드릴']] },
  R: { ic: 'book-open', name: 'Reading', list: [['read', '지문 (T/F/NG · Headings)'], ['readShort', '짧은 지문 시간 재기']] },
  W: { ic: 'pen-line', name: 'Writing', list: [['t2', 'Task 2 에세이'], ['t1', 'Task 1 차트'], ['franklin', 'Franklin 재구성']] },
  S: { ic: 'mic', name: 'Speaking', list: [['p1', 'Part 1 세 문장'], ['p2', 'Part 2 큐카드와 Part 3'], ['432', '4/3/2 유창성'], ['story', '스토리 뱅크'], ['shadow', '섀도잉 스튜디오 (발음 점수)'], ['talk', 'AI 대화 3턴']] },
  G: { ic: 'spell-check', name: '문법', list: [['quiz', '오류 퀴즈 5문항'], ['myerr', '내 오류 카드']] }
};
function recent(skill) {
  const a = DB.attempts.filter(x => x.skill === skill).sort((x, y) => y.ts - x.ts)[0];
  if (!a) return '아직 기록 없음';
  if (a.band && a.band.overall != null) return `최근 ${md(dayKey(new Date(a.ts)))} 밴드 ${a.band.overall.toFixed(1)}`;
  if (a.score) return `최근 ${md(dayKey(new Date(a.ts)))} ${a.score.c}/${a.score.t}`;
  return `최근 ${md(dayKey(new Date(a.ts)))} 연습`;
}
function nextRec(skill) {
  const W = WEEK(), k = today();
  if (skill === 'L') return W.n <= 2 ? ['listen', 'Part 1·2 빈칸 예측 세트'] : W.n >= 5 ? ['listen', 'Part 3·4 함정 표현 세트'] : ['dict', '받아쓰기 5문장'];
  if (skill === 'R') return ['read', W.n >= 4 ? 'Matching headings 긴 지문' : 'T/F/NG 짧은 지문'];
  if (skill === 'W') return DB.flags.franklin && S.franklinOpen(DB.flags.franklin.day, k) ? ['franklin', 'Franklin 재구성 열림'] : W.n >= 3 && !DB.attempts.some(a => a.kind === 't1' && diffDays(dayKey(new Date(a.ts)), k) < 7) ? ['t1', 'Task 1 개요부터'] : ['t2', 'Task 2 계획 카드부터'];
  const mine = DB.stories.filter(s => s.mine && !s.draft).length;
  if (skill === 'S') return mine < 6 ? ['story', `스토리 ${mine + 1}편 내 이야기로 바꾸기`] : ['p2', '무작위 큐카드'];
  return ['quiz', `이번 주 초점 ${ERR_KO[S.focusType(PLAN(), k, DB.errors, focusOv(k))]}`];
}
R.train = () => {
  const sk = S.SKILL_OF_DOW[dow(today())], todaySk = sk ? sk[0] : 'S';
  const tiles = ['L', 'R', 'W', 'S', 'G'].map(s => { const T = TILES[s], [act, txt] = nextRec(s);
    return `<section class="card tile"><span class="ic">${ico(T.ic, 's24')}</span><div class="row" style="min-height:0"><h2 class="h2 grow">${T.name}</h2><button class="linkbtn" data-act="tileList" data-s="${s}">유형 ${T.list.length}${ico('chevron-right', 's16')}</button></div>
      <p class="cap">${esc(recent(s))}. 다음 추천: <b>${esc(txt)}</b></p>${btn('추천 시작', 'run', { cls: (s === todaySk ? 'pri' : 'line') + ' block', icon: 'play', x: `data-a="${act}"` })}</section>`; });
  const off = (C.links.items || []).filter(l => l.kind === 'official').slice(0, 3);
  const links = `<section class="card tile"><span class="ic">${ico('external-link', 's24')}</span><div class="row" style="min-height:0"><h2 class="h2 grow">공식 자료</h2></div><p class="cap">IELTS 문항은 공식 사이트 링크로만 열어요. 푼 점수는 성장 탭에 기록해요.</p>
    <div class="rowlist" style="grid-column:1/-1">${off.map(l => `<a class="row linkbtn" href="${esc(l.url)}" target="_blank" rel="noopener" style="min-height:44px">${esc(l.title)}</a>`).join('') || '<p class="cap">링크 준비 중</p>'}</div></section>`;
  if (innerWidth < 700) return `${header()}<div class="masonry">${tiles.join('')}${links}</div>`;
  return `${header()}<div class="page"><div class="col">${tiles.join('')}</div><div class="col">${links}${fillCard('다가오는 훈련 일정', schedRows(), `<span class="cap num">${esc(md(PLAN().test))} 시험</span>`)}</div></div>`;
};

/* ---------- 1005 내 성장: 숫자 4개 + 점수 예상 + 주별 공부 시간 + 발음 점수 추이 + 공부 달력 ---------- */
const lastN = (kind, f, n) => DB.attempts.filter(a => a.kind === kind && a.meta && a.meta[f] != null).sort((a, b) => a.ts - b.ts).slice(-n).map(a => a.meta[f]);
const avgOf = v => v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
function plusCard() {
  const acc = lastN('shadow', 'acc', 1)[0], tb = lastN('talk', 'band', 1)[0], key = G.getKey(), inPlan = missionBlocks(missionKind()).some(b => b.act === 'talk');
  if (!key) return `<section class="card" aria-labelledby="plTitle"><div class="row" style="min-height:0"><h2 class="h2 grow" id="plTitle">말하기 더 하기</h2><span class="cap">각 5분</span></div>
    <p class="cap">발음 점수와 AI 대화는 무료 제미나이 키가 있어야 해요. 한 번만 넣으면 돼요.</p>${btn('AI 기능 켜기 (키 넣기 1분)', 'aiOn', { cls: 'line block', icon: 'sparkles' })}</section>`;
  return `<section class="card" aria-labelledby="plTitle"><div class="row" style="min-height:0"><h2 class="h2 grow" id="plTitle">말하기 더 하기</h2><span class="cap num">오늘 AI ${G.DAY_MAX - G.usedToday(DB)}회 남음</span></div>
    <div class="${inPlan ? 'stack' : 'kw'}">${btn('섀도잉 + 발음 점수', 'run', { cls: 'line', icon: 'mic', x: 'data-a="shadow"' })}${inPlan ? '' : btn('AI 대화 3턴', 'run', { cls: 'line', icon: 'message-circle', x: 'data-a="talk"' })}</div>
    <p class="cap">최근 발음 점수 <b class="num ink">${acc == null ? '아직 없음' : acc + '%'}</b>, 최근 대화 밴드 <b class="num ink">${tb == null ? '아직 없음' : S.roundBand(tb).toFixed(1) + ' (대략)'}</b>${inPlan ? '. AI 대화는 오늘 미션에 있어요' : ''}</p></section>`;
}
/** weekly overall estimate, last 12 weeks: gauges on the attempts and mocks known by each week's end */
function bandHist() {
  const k = today(), keyed = DB.attempts.map(a => [dayKey(new Date(a.ts)), a]), out = [];
  let m = mondayOf(DB.profile.start || k); const lo = addDays(mondayOf(k), -77); if (m < lo) m = lo;
  for (; m <= k; m = addDays(m, 7)) { const e = addDays(m, 6) < k ? addDays(m, 6) : k;
    const g = S.gauges({ ...DB, attempts: keyed.filter(x => x[0] <= e).map(x => x[1]), mocks: DB.mocks.filter(x => x.date <= e) }, e).est; out.push({ label: md(m), lo: g.lo, hi: g.hi, v: g.mid }); }
  return out;
}
const weekMin = (mon, upTo = 6) => Math.round(Array.from({ length: upTo + 1 }, (_, i) => (DB.days[addDays(mon, i)] || {}).secs || 0).reduce((a, b) => a + b, 0) / 60);
const startMon = () => { const k = today(), m = mondayOf(DB.profile.start || k), lo = addDays(mondayOf(k), -77); return m < lo ? lo : m > mondayOf(k) ? mondayOf(k) : m; };
/** one-series line chart: recessive grid, 2px line, 8px dots, the target as a dashed line, first and last values labelled */
function lineChart(pts, { lo, hi, ticks, tgt, fmt, name, unit = '' }) {
  if (!pts.length) return `<p class="cap">${name} 기록이 생기면 선이 그려져요.</p>`;
  const W = 320, H = 150, L = 36, R = 16, T = 16, B = 22, n = pts.length;
  const x = i => L + (n < 2 ? (W - L - R) / 2 : (W - L - R) * i / (n - 1)), y = v => T + (H - B - T) * (1 - (Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo));
  const grid = ticks.map(v => `<line x1="${L}" x2="${W - R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="ax"/><text x="${L - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${fmt(v)}</text>`).join('');
  const goal = tgt == null ? '' : `<line x1="${L}" x2="${W - R}" y1="${y(tgt).toFixed(1)}" y2="${y(tgt).toFixed(1)}" class="l-goal"/><text x="${L + 4}" y="${(y(tgt) + 14).toFixed(1)}" class="tg">목표 ${fmt(tgt)}${unit}</text>`;
  const ln = n > 1 ? `<polyline class="ln" points="${pts.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ')}"/>` : '';
  const dots = pts.map((p, i) => `<circle class="dt" cx="${x(i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="4"/>`).join('');
  const lab = i => { const v = pts[i].v, near = tgt != null && Math.abs(y(v) - y(tgt)) < 18; return `<text x="${x(i).toFixed(1)}" y="${(near && y(v) >= y(tgt) ? y(v) + 18 : y(v) - 9).toFixed(1)}" text-anchor="${n < 2 ? 'middle' : i ? 'end' : 'start'}" class="lv">${fmt(v)}${unit}</text>`; };
  const xl = [...new Set([0, n - 1])].map(i => `<text x="${x(i).toFixed(1)}" y="${H - 5}" text-anchor="${n < 2 ? 'middle' : i ? 'end' : 'start'}">${esc(pts[i].label)}</text>`).join('');
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(name)}: ${pts.map(p => `${p.label} ${fmt(p.v)}${unit}`).join(', ')}">${grid}${goal}${ln}${dots}${[...new Set([0, n - 1])].map(lab).join('')}${xl}</svg></div>`;
}
function growCard() {
  const k = today(), mon = mondayOf(k), dw = (dow(k) + 6) % 7, wm = weekMin(mon), pm = weekMin(addDays(mon, -7), dw), st = DB.streak;
  const acc = DB.attempts.filter(a => a.kind === 'shadow' && a.meta && a.meta.acc != null).sort((a, b) => a.ts - b.ts).slice(-12);
  const a1 = acc.length ? acc.at(-1).meta.acc : null, a0 = acc.length > 1 ? acc.at(-2).meta.acc : null, tb = avgOf(lastN('talk', 'band', 3));
  const arrow = (d, u) => `<span class="cap num ${d >= 0 ? 'ok-t' : 'no-t'}">${d >= 0 ? '↑' : '↓'} ${Math.abs(d)}${u}</span>`;
  const tiles = `<div class="metrics gr-m">
    <div><span class="cap">연속</span><b class="num">${st.cur}일</b><span class="cap num">최고 ${st.best}일</span></div>
    <div><span class="cap">이번 주 공부</span><b class="num">${wm}분</b><span class="cap num">지난주 이맘때 ${pm}분 ${wm === pm ? '' : wm > pm ? `<span class="ok-t">↑ ${wm - pm}</span>` : `<span class="no-t">↓ ${pm - wm}</span>`}</span></div>
    <div><span class="cap">발음 점수</span><b class="num">${a1 == null ? '–' : a1 + '%'}</b>${a0 == null ? '<span class="cap">가장 최근</span>' : `<span class="cap num">지난번 ${a0}% ${arrow(a1 - a0, '')}</span>`}</div>
    <div><span class="cap">대화 밴드</span><b class="num">${tb == null ? '–' : S.roundBand(tb).toFixed(1)}</b><span class="cap">최근 3번, 대략</span></div></div>`;
  const bh = bandHist(), b0 = bh[0], b1 = bh.at(-1), gap = Math.max(0, 6.5 - b1.hi), rng = x => `${x.lo.toFixed(1)}–${x.hi.toFixed(1)}`;
  const est = `<p class="gr-est"><span class="cap">전체 점수 예상</span><b class="num">${bh.length > 1 ? `${rng(b0)} → ${rng(b1)}` : rng(b1)}</b><span class="cap">${gap ? `6.5까지 ${gap.toFixed(1)}` : '6.5 범위 안'}</span></p>`;
  const wk = []; let run = Object.keys(DB.days).filter(x => x < startMon()).reduce((a, x) => a + ((DB.days[x] || {}).secs || 0) / 60, 0);
  for (let m = startMon(); m <= mon; m = addDays(m, 7)) { run += weekMin(m); wk.push({ label: md(m), v: Math.round(run) }); }   // running total: every study day moves the line up
  const c1 = bh.length >= 4 ? `<div class="gr-c"><h3 class="h3">전체 점수 예상, 주별</h3>${lineChart(bh, { lo: 4, hi: 7.5, ticks: [4, 5, 6, 7], tgt: 6.5, fmt: v => v.toFixed(1), name: '주별 전체 점수 예상' })}</div>`
    : `<div class="gr-c"><h3 class="h3">쌓인 공부 시간</h3>${lineChart(wk, { lo: 0, hi: Math.max(60, wk.at(-1).v) * 1.15, ticks: [0, Math.round(Math.max(60, wk.at(-1).v) / 2)], fmt: v => String(Math.round(v)), name: '주별 누적 공부 시간', unit: '분' })}</div>`;
  const c2 = `<div class="gr-c"><h3 class="h3">발음 점수, 최근 ${acc.length || ''}번</h3>${lineChart(acc.map(a => ({ label: md(dayKey(new Date(a.ts))), v: a.meta.acc })), { lo: 0, hi: 100, ticks: [0, 50, 100], tgt: 90, fmt: v => String(Math.round(v)), name: '발음 점수', unit: '%' })}</div>`;
  return `<section class="card" aria-labelledby="grTitle"><div class="row" style="min-height:0"><h2 class="h2 grow" id="grTitle">내 성장</h2></div>${tiles}${est}<div class="gr-2">${c1}${c2}</div></section>`;
}
/** study calendar since the start (4–12 weeks): minutes per day, one hue light → dark; today outlined; future days blank */
function heatCard() {
  const k = today(), mon = mondayOf(k); let start = startMon(); if (diffDays(start, mon) < 21) start = addDays(mon, -21);
  const nw = diffDays(start, mon) / 7 + 1, lv = m => m <= 0 ? 0 : m < 10 ? 1 : m < 20 ? 2 : m < 30 ? 3 : 4;
  const cells = []; for (let r = 0; r < 7; r++) { cells.push(`<span class="hm-d">${r % 2 ? '' : S.DOW_KO[(r + 1) % 7]}</span>`);
    for (let c = 0; c < nw; c++) { const x = addDays(start, c * 7 + r), m = Math.round(((DB.days[x] || {}).secs || 0) / 60);
      cells.push(x > k ? '<i class="hm-f"></i>' : `<i class="h${lv(m)}${x === k ? ' hm-t' : ''}" title="${md(x)} ${m}분"></i>`); } }
  const on = Object.keys(DB.days).filter(x => x >= start && x <= k && DB.days[x].kind).length;
  return `<section class="card" aria-labelledby="hmTitle"><div class="row" style="min-height:0"><h2 class="h2 grow" id="hmTitle">공부 달력</h2><span class="cap num">${md(start)}부터 ${on}일 공부</span></div>
    <div class="hm" style="--nw:${nw}" role="img" aria-label="${md(start)}부터 날짜별 공부 시간. 공부한 날 ${on}일, 이번 주 ${weekMin(mon)}분">${cells.join('')}</div>
    <div class="gz-legend"><span>0분</span><span class="hm-lg"><i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i></span><span>30분+</span></div></section>`;
}

/* ---------- 성장 ---------- */
function spark(vals) {
  if (vals.length < 2) return '';
  const lo = Math.min(...vals, 4), hi = Math.max(...vals, 7), X = i => (i / (vals.length - 1) * 200).toFixed(1), Y = v => (30 - (v - lo) / (hi - lo || 1) * 26).toFixed(1);
  return `<svg class="spark" viewBox="0 0 200 32" preserveAspectRatio="none" aria-hidden="true"><polyline fill="none" stroke="var(--pri)" stroke-width="2" vector-effect="non-scaling-stroke" points="${vals.map((v, i) => X(i) + ',' + Y(v)).join(' ')}"/></svg>`;
}
/** S4 chart: repeated grammar errors per 100 graded words by week, with the week-1 baseline and the half-of-baseline goal */
function errTrend() {
  const k = today(), wk = S.errRateByWeek(PLAN(), DB.attempts, DB.errors, k), has = wk.filter(w => w.rate != null);
  const tot = {}; for (const e of DB.errors) if (S.GRAM_TYPES.includes(e.type)) tot[e.type] = (tot[e.type] || 0) + 1;
  const top = Object.entries(tot).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const head = `<div class="row" style="min-height:0"><h2 class="h2 grow">반복 오류 5종 · 100단어당</h2>${has.length ? `<span class="num big">${has.at(-1).rate.toFixed(1)}</span>` : ''}</div>`;
  if (!has.length) return `<section class="card tight" aria-label="반복 오류 추이">${head}<p class="cap">라이팅이나 스피킹을 한 번 채점하면 주별 추이가 여기 그려져요.</p></section>`;
  const W = Math.round(Math.max(320, Math.min(760, innerWidth - (innerWidth >= 700 ? 160 : 72)))), H = 150;   // viewBox follows the card width so chart text stays 13px
  const base = has[0].rate, goal = base / 2, mx = Math.max(base, ...has.map(w => w.rate)) * 1.15 || 1, L = 34, B = 24, n = wk.length, bw = Math.min(44, (W - L) / n * .6);
  const x = i => L + (W - L) * (i + .5) / n, y = v => 8 + (H - B - 8) * (1 - v / mx);
  const bars = wk.map((w, i) => `${w.rate != null ? `<rect x="${(x(i) - bw / 2).toFixed(1)}" y="${y(w.rate).toFixed(1)}" width="${bw.toFixed(1)}" height="${(y(0) - y(w.rate)).toFixed(1)}" rx="4" class="${w.rate <= goal ? 'b-ok' : 'b-pri'}"/><text x="${x(i)}" y="${(y(w.rate) - 5).toFixed(1)}" text-anchor="middle">${w.rate.toFixed(1)}</text>` : ''}<text x="${x(i)}" y="${H - 6}" text-anchor="middle">W${w.n}</text>`).join('');
  const ln = (v, c, t) => `<line x1="${L}" x2="${W}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="${c}"/><text x="${L - 4}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${t}</text>`;
  return `<section class="card span" aria-label="반복 오류 추이">${head}<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="주별 100단어당 반복 오류">${ln(base, 'l-base', base.toFixed(1))}${ln(goal, 'l-goal', goal.toFixed(1))}${bars}</svg></div>
    <div class="gz-legend"><span><i class="lg-base"></i>1주차 기준</span><span><i class="lg-goal"></i>목표 절반</span>${top.map(([t, c]) => pill(`${ERR_KO[t]} ${c}건`)).join('')}</div></section>`;
}
R.grow = () => {
  const mocks = `<section class="card"><h2 class="h2">모의고사 기록</h2>${DB.mocks.length ? `<div class="rowlist">${DB.mocks.slice().sort((a, b) => a.date < b.date ? 1 : -1).slice(0, 6).map(m => `<div class="row"><span style="width:3.2em" class="num">${md(m.date)}</span><span class="grow cap">${{ 'ielts.org': 'IELTS.org', bc: 'British Council', cambridge: 'Cambridge', app: '앱 안' }[m.src]}</span><span class="num">${['L', 'R', 'W', 'S'].filter(s => m[s] != null).map(s => `${s} ${m[s]}`).join(', ')}</span></div>`).join('')}</div>` : '<p class="cap">공식 모의고사 원점수를 넣으면 3주 동안 L·R 게이지가 그 점수를 기준으로 해요.</p>'}${btn('모의 점수 입력', 'mockSheet', { cls: 'pri block', icon: 'plus' })}</section>`;
  const fullMocks = DB.mocks.filter(m => m.src !== 'app' && m.L != null && m.R != null).length, stories = DB.stories.filter(s => !s.draft && s.mine && s.mine.length > 40).length, t2types = new Set(DB.attempts.filter(a => a.kind === 't2' && a.meta && a.meta.type).map(a => a.meta.type)).size;
  const ready = `<section class="card"><div class="row" style="min-height:0"><h2 class="h2 grow">시험 준비</h2><span class="cap num">최고 연속 ${DB.streak.best}일, 프리즈 ${DB.streak.freezes}개</span></div><div class="rowlist">${[['풀 모의고사 4회', fullMocks, 4], ['스토리 뱅크 6편', stories, 6], ['T2 5유형 연습', t2types, 5]].map(([l, v, n]) => `<div class="row"><span style="width:8.5em">${l}</span>${bar(v / n, v >= n ? 'ok' : '')}<span class="num cap" style="width:3em;text-align:right">${Math.min(v, n)}/${n}</span></div>`).join('')}</div></section>`;
  const wk = Object.entries(DB.weekly).sort((a, b) => a[0] < b[0] ? 1 : -1).slice(0, 4);
  const weekly = wk.length ? `<section class="card"><h2 class="h2">주간 리뷰 기록</h2><div class="rowlist">${wk.map(([w, x]) => `<div class="row"><span class="num" style="width:3em">${w.slice(5)}</span>${bar(x.days / 7, 'ok')}<span class="cap">활동 ${x.days}일, ${x.minutes}분, 초점 ${ERR_KO[x.focus] || '없음'}</span></div>`).join('')}</div></section>` : '';
  const tr = errTrend(), full = / span"/.test(tr);   // the chart runs full width; its one-line empty state sits in the columns
  if (innerWidth < 700) return `${header()}<div class="masonry">${growCard()}${heatCard()}${tr}${gaugeCard()}${mocks}${ready}${weekly}</div>`;
  return `${header()}${growCard()}${full ? tr : ''}<div class="page"><div class="col">${heatCard()}${full ? '' : tr}${gaugeCard()}${mocks}${ready}${weekly}</div><div class="col">${fillCard('시험까지 일정', schedRows(60), `<span class="cap num">${esc(md(PLAN().test))} 시험</span>`)}</div></div>`;
};

/* ---------- 컨텍스트 패널 (≥1100) ---------- */
function renderPanel() {
  const p = $('#panel'); if (!DB.profile || innerWidth < 1100) { p.innerHTML = ''; return; }
  const k = today(), kind = missionKind(), bl = missionBlocks(kind), st = dayRec(k).steps || {}, W = WEEK(k), ft = S.focusType(PLAN(), k, DB.errors, focusOv(k));
  const errs = DB.errors.filter(e => e.wrong && e.right).slice(-3).reverse();
  p.innerHTML = `<section class="card tight"><h2 class="h3">오늘 진행</h2>${progRows(bl, st)}${bar(bl.filter(b => st[b.id] === 1).length / bl.length)}</section>
    <section class="card tight"><h2 class="h3">이번 주 문법 · ${ERR_KO[ft]}</h2><p class="cap">${esc(GRAM_TIP[ft] || '')}</p><p class="cap">W${W.n} ${esc(W.gramKo)}</p></section>
    ${errs.length ? `<section class="card tight"><h2 class="h3">최근 오류 3개</h2>${errs.map(e => `<div class="stack" style="gap:2px;padding:6px 0;border-top:1px solid var(--line)"><span class="cap">${ERR_KO[e.type] || e.type}</span><span><s class="faint">${esc(e.wrong)}</s> → <b>${esc(e.right)}</b></span></div>`).join('')}</section>` : ''}
    ${/^(train|grow)$/.test(TAB) ? fillCard('오늘 볼 단어', wordRows()) : fillCard('다가오는 일정', schedRows(), `<span class="cap num">${esc(md(PLAN().test))} 시험</span>`, 280)}`;
}
/** today's steps with their state: done, skipped (건너뜀), current, to do */
const progRows = (bl, st, cur = -1) => `<div class="tiles" style="--tw:140px">${bl.map((b, i) => `<div class="row" style="min-height:40px"><span class="${st[b.id] === 1 ? 'ok-t' : st[b.id] === 2 ? 'no-t' : i === cur ? 'up' : 'faint'}">${ico(st[b.id] === 1 ? 'circle-check' : st[b.id] === 2 ? 'skip-forward' : i === cur ? 'play' : 'clock', 's16')}</span><span class="grow">${blockName(b)}</span><span class="cap num">${st[b.id] === 2 ? '건너뜀' : i === cur ? '지금' : b.min + '분'}</span></div>`).join('')}</div>`;

/* ---------- 설정 ---------- */
const CUES = ['출근 버스에 타면', '점심 먹고 자리에 앉으면', '퇴근 버스에 타면', '자기 전 폰 충전기 꽂을 때'];
const seg = (name, cur, opts) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button data-act="set" data-k="${name}" data-v="${v}" aria-pressed="${String(cur) === String(v)}">${l}</button>`).join('')}</div>`;
R.set = () => {
  const p = DB.profile, st = DB.settings, key = G.getKey(), used = G.usedToday(DB);
  const voices = VOICES.filter(v => /^en/.test(v.lang)).sort((a, b) => (/GB|AU/.test(b.lang) - /GB|AU/.test(a.lang)));
  const exam = `<section class="card"><h2 class="h2">시험과 목표</h2><label class="fld">시험일<input class="inp" type="date" id="sTest" value="${p.testDate}" data-act="setDate"></label>
    <span class="cap">목표 프로필</span>${seg('target', p.target, [['min', '최소 6.5'], ['safe', '목표 6.5'], ['stretch', '스트레치 7.0']])}<p class="cap">목표: L·R 7.0, W·S 6.0 → overall 6.5. 한 영역이 0.5 떨어져도 6.5가 유지돼요.</p></section>`;
  const amount = `<section class="card"><h2 class="h2">하루 분량</h2><span class="cap">평일 분량</span>${seg('weekdayMin', p.weekdayMin, [[25, '25분'], [30, '30분'], [40, '40분']])}
    <span class="cap">새 단어 순서</span>${seg('vocabSrc', DB.settings.vocabSrc, [['hk', '해커스 DAY 순서'], ['base', '기본 단어장 먼저']])}<span class="cap">평일 새 카드</span>${seg('newPerDay', p.newPerDay, [[8, '8'], [10, '10'], [12, '12']])}<span class="cap">뜻 공개까지 (초)</span>${seg('revealSec', p.revealSec, [[2, '2'], [3, '3'], [4, '4'], [5, '5']])}</section>`;
  const rhythm = `<section class="card"><h2 class="h2">하루 리듬</h2><span class="cap">하루가 바뀌는 시각 (이 시각 전 공부는 전날로 쳐요)</span>${seg('dayStart', st.dayStart, [[0, '자정'], [3, '03시'], [4, '04시'], [5, '05시']])}
    <span class="cap">밤 22시부터 첫 버튼</span>${seg('nightMin', st.nightMin, [[true, '5분 미션'], [false, '평소 미션']])}
    <span class="cap">하루 쉬고 돌아온 날</span>${seg('comebackPlus', st.comebackPlus, [[true, '연속 +1'], [false, '연속 유지']])}</section>`;
  const anchor = `<section class="card"><h2 class="h2">습관 앵커 (if-then)</h2><div class="wrap">${CUES.map(c => `<button class="chip" data-act="cue" data-v="${c}" aria-pressed="${p.anchor.cue === c}">${c}</button>`).join('')}</div>
    <label class="fld">직접 입력<input class="inp" id="sCue" value="${CUES.includes(p.anchor.cue) ? '' : esc(p.anchor.cue)}" placeholder="예: 약국 문 닫고 나오면" data-act="cueText"></label>
    <div class="kw" style="grid-template-columns:minmax(0,1fr) 9em"><label class="fld">예비 앵커<input class="inp" id="sBackup" value="${esc(p.anchor.backup)}" data-act="backupText"></label><label class="fld">앵커 시각<input class="inp" type="time" id="sTime" value="${p.anchor.time}" data-act="timeText"></label></div>
    <span class="cap">두 번째 알림</span>${seg('second', st.second, [['22:30', '22:30'], ['23:30', '23:30'], ['00:30', '00:30']])}
    ${btn('캘린더에 알림 넣기 (.ics)', 'ics', { cls: 'line block', icon: 'calendar' })}<p class="cap">매일 앵커 시각과 ${esc(st.second)}에 한 번씩 알려 줘요. 삼성·구글 캘린더에서 열면 돼요.</p></section>`;
  const gem = `<section class="card"><h2 class="h2">제미나이 채점</h2>${key ? '' : '<div class="card warn tight" style="box-shadow:none">키가 없으면 자가 점검 체크리스트로 채점해요.</div>'}
    <label class="fld">API 키 (이 기기에만 저장, 백업 제외)<input class="inp" type="password" id="sKey" value="${esc(key)}" autocomplete="off" data-act="keyText" placeholder="AIza…"></label>
    <label class="fld">모델 ID (비우면 자동)<input class="inp" id="sModel" value="${esc(st.gmodel)}" placeholder="gemini-3.8-flash" data-act="modelText"></label>
    <div class="row"><span>오늘 사용량</span>${bar(used / G.DAY_MAX)}<span class="num">${used}/${G.DAY_MAX}</span></div><p class="cap">무료 등급은 입력한 글과 녹음을 학습에 쓸 수 있어요. 이름·주소 같은 개인정보는 넣지 마세요.</p></section>`;
  const bk = `<section class="card"><h2 class="h2">백업</h2><p class="cap">드라이브 "IELTS 백업" 폴더에 12시간마다, 또는 바뀌면 자동으로 올려요. 녹음 파일은 올리지 않아요. 암호는 FITQUEST와 같은 것을 써요.</p>
    <label class="fld">백업 암호<input class="inp" type="password" id="bkTok" value="${esc(BK.BK.token || '')}" autocomplete="new-password"></label>
    <details><summary class="cap" style="min-height:44px;display:flex;align-items:center">다른 백업 서버 쓰기 (보통은 비워 두세요)</summary><input class="inp" id="bkUrl" type="url" value="${esc(BK.BK.url || '')}" placeholder="https://script.google.com/macros/s/…/exec"></details>
    <p class="cap" id="bkStat" role="status">${esc(BK.bkStatText())}</p>
    <div class="kw">${btn('지금 백업', 'bkNow', { cls: 'line sm', icon: 'upload' })}${btn('드라이브 복원', 'bkLoad', { cls: 'line sm', icon: 'download' })}
    ${btn('JSON 내보내기', 'exportJson', { cls: 'line sm', icon: 'download' })}<label class="btn line sm" for="impFile">${ico('upload')}JSON 가져오기</label></div><input type="file" id="impFile" accept="application/json,.json" hidden></section>`;
  const voice = `<section class="card"><h2 class="h2">음성과 테마</h2><label class="fld">영어 음성 (영국·호주 우선)<select class="inp" id="sVoice" data-act="voiceSel"><option value="">자동</option>${voices.map(v => `<option ${st.voiceEn === v.name ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select></label>
    <span class="cap">말하기 속도</span>${seg('rate', st.rate, [[0.8, '0.8×'], [0.9, '0.9×'], [1, '1.0×']])}<span class="cap">테마 (밤에 자동: 22시부터 06시까지 다크)</span>${seg('theme', st.theme, [['auto', '밤에 자동'], ['system', '시스템'], ['light', '라이트'], ['dark', '다크']])}</section>`;
  const lic = `<section class="card"><h2 class="h2">출처·라이선스</h2><ul class="cap" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px">
    <li>NGSL/NAWL © Browne, Culligan &amp; Phillips, CC BY-SA 4.0. 한국어 뜻과 예문은 이 앱의 2차 저작물이며 같은 라이선스(CC BY-SA 4.0)로 공유함.</li>
    <li>섀도잉의 VOA Learning English 오디오와 대본은 미국 정부 저작물로 퍼블릭 도메인이에요. 클립마다 출처를 표시해요.</li>
    <li>IELTS 문항은 공식 사이트 링크만 둬요. IELTS.org·British Council·Cambridge 문항과 채점 기준 원문은 앱에 넣지 않아요.</li>
    <li>해커스 영상은 외부 링크로만 연결해요.</li><li>ts-fsrs © Open Spaced Repetition, MIT License. 아이콘 lucide (ISC), 글꼴 Pretendard (OFL).</li>
    <li>콘텐츠: ${FILES.every(f => C.src[f] === 'real') ? '모두 본 파일' : FILES.filter(f => C.src[f] !== 'real').map(f => `${f} ${C.src[f] === 'sample' ? '샘플' : '없음'}`).join(' · ')}</li></ul></section>`;
  return `<header class="hdr"><button class="btn icon ghost" data-go="today" aria-label="뒤로">${ico('chevron-left', 's24')}</button><span class="title">설정</span></header><div class="masonry">${exam}${amount}${rhythm}${anchor}${gem}${voice}${lic}</div>`;
};

/* ---------- 온보딩 (최대 4탭 → 첫 카드) ---------- */
let OB = { i: 0, test: '2026-11-28', cue: '', min: 30 };
function renderOnb() {
  document.body.classList.add('onb-on'); $('#nav').hidden = true; $('#panel').innerHTML = '';
  const dots = `<header class="onb-hdr">${LOGO}<span>밴드업</span><span class="cap num">${OB.i + 1}/4</span><div class="dots" aria-hidden="true">${[0, 1, 2, 3].map(i => `<i class="${i <= OB.i ? 'on' : ''}"></i>`).join('')}</div></header>`;
  const steps = [
    () => `<h1 class="h1">시험일을 확인해요</h1><p class="mut">IELTS Academic overall 6.5까지 역산해서 매일 할 일을 정해 드려요.</p><label class="fld">시험일<input class="inp" type="date" id="obDate" value="${OB.test}"></label>${btn('다음', 'obNext', { cls: 'pri lg block' })}`,
    () => `<h1 class="h1">언제 5분을 할까요?</h1><p class="mut">"[상황]하면 → 5분 미션". 하나만 고르면 돼요.</p><div class="stack">${CUES.map(c => `<button class="opt" data-act="obCue" data-v="${c}">${ico('target')}${c}</button>`).join('')}<button class="opt" data-act="obCue" data-v="">${ico('pencil')}직접 입력 (설정에서)</button></div><p class="cap">예비 앵커: 밤 12시 전 충전기 꽂을 때</p>`,
    () => `<h1 class="h1">평일에 몇 분 할까요?</h1><p class="mut">바쁜 날은 언제든 5분으로 바꿀 수 있어요.</p><div class="stack">${[[25, '25분, 단어와 영역 하나'], [30, '30분, 기본'], [40, '40분, 넉넉히']].map(([m, l]) => `<button class="opt" data-act="obMin" data-v="${m}" aria-pressed="${m === 30}">${ico('clock')}${l}</button>`).join('')}</div>`,
    () => `<h1 class="h1">진단은 어떻게 할까요?</h1><p class="mut">어휘 30개, 리스닝 10문항, 리딩 6문항, 스피킹 1분. 약 10분이에요.</p><div class="stack"><button class="opt" data-act="obDiag" data-v="split" aria-pressed="true">${ico('calendar')}오늘 미션에 나눠서 (1~3일차)</button><button class="opt" data-act="obDiag" data-v="now">${ico('timer')}진단 10분 지금 하기</button></div>`
  ];
  const lab = [['시험일', OB.i > 0 ? md(OB.test) : ''], ['5분 앵커', OB.i > 1 ? OB.cue || '설정에서 직접 입력' : ''], ['평일 분량', OB.i > 2 ? OB.min + '분' : ''], ['진단 방식', '']];
  const sum = `<section class="card tight" aria-label="설정 순서"><div class="rowlist">${lab.map(([l, v], i) => `<div class="row" style="min-height:44px"><span class="rc ${v ? 'ok' : i === OB.i ? 'cur' : ''}">${v ? ico('check', 's16') : `<span class="num">${i + 1}</span>`}</span><span class="${v || i === OB.i ? '' : 'mut'}">${l}</span>${v ? `<b>${esc(v)}</b>` : i === OB.i ? '<span class="cap">지금</span>' : ''}</div>`).join('')}</div><p class="cap">마치면 바로 첫 미션 카드가 열려요. 모두 설정에서 바꿀 수 있어요.</p></section>`;
  $('#main').innerHTML = `<div class="onb">${dots}${steps[OB.i]()}${sum}</div>`;
}
function finishOnb(diag) {
  const k = today();
  DB.profile = { start: k > '2026-09-28' ? k : '2026-09-28', testDate: OB.test, target: 'safe', weekdayMin: OB.min, newPerDay: 10, revealSec: 3, anchor: { cue: OB.cue, backup: '밤 12시 전 충전기 꽂을 때', time: '07:40' }, createdAt: Date.now(), diag };
  DB.streak = S.newStreak();   // 온보딩 완료 → 프리즈 1개
  DB.flags.firstDay = k; save();
  TAB = 'today'; render();
  if (diag === 'now') runSeq([{ id: 'diagVocab', act: 'diagVocab', diagPart: 'v' }, ...DIAG_PARTS[1][1].map(b => ({ ...b, diagPart: 'l' })), ...DIAG_PARTS[2][1].map(b => ({ ...b, diagPart: 'rs' }))], '진단 10분');
  else openMission(missionKind());
}

/* ---------- 주간 리뷰 · 다시 시작 · 모의 점수 ---------- */
function weekStats(mon) {
  let days = 0, secs = 0; for (let i = 0; i < 7; i++) { const d = DB.days[addDays(mon, i)]; if (d && d.kind) days++; if (d) secs += d.secs || 0; }
  const errs = {}; for (const e of DB.errors) { const d = dayKey(new Date(e.ts)); if (d >= mon && d <= addDays(mon, 6)) errs[e.type] = (errs[e.type] || 0) + 1; }
  const learned = DB.revlog.filter(r => { const d = dayKey(new Date(r[1])); return d >= mon && d <= addDays(mon, 6); }), kept = learned.filter(r => r[2] !== 'Again').length;
  return { days, minutes: Math.round(secs / 60), errs, words: new Set(learned.map(r => r[0])).size, recall: learned.length ? kept / learned.length : 0 };
}
function reviewView(s) {
  const k = today(), mon = addDays(mondayOf(k), dow(k) === 1 ? -7 : 0), prev = addDays(mon, -7), a = weekStats(mon), b = weekStats(prev);
  const top = Object.entries(a.errs).sort((x, y) => y[1] - x[1]).slice(0, 3);
  const nextFocus = s.focus || S.topErrorType(DB.errors, mon, addDays(mon, 6)) || S.focusType(PLAN(), addDays(mon, 7), DB.errors);
  s.focus = nextFocus;
  const g = S.gauges(DB, k), story = ['person', 'place', 'object', 'event', 'skill', 'change'].find(t => !DB.stories.some(x => x.kind === t && x.mine && !x.draft));
  return { title: '주간 리뷰', body: `<section class="card"><h2 class="h2">지난주 ${md(mon)}–${md(addDays(mon, 6))}</h2>${metrics([['활동', a.days, '일'], ['공부', a.minutes, '분'], ['단어', a.words, '개'], ['기억률', Math.round(a.recall * 100), '%']]) || '<p class="cap">지난주 기록이 아직 없어요. 이번 주 첫날부터 쌓여요.</p>'}</section>
    <section class="card"><h2 class="h2">게이지</h2><div class="gz">${['L', 'R', 'W', 'S'].map(x => `<div class="gz-row"><b>${x}</b>${g[x].none ? `<span class="gz-none">${pill('진단 전')}</span>` : track(g[x], `<i class="gz-tgt" style="left:${X(g.target[x])}"></i>`)}<span class="v num">${g[x].none ? '' : `${g[x].lo.toFixed(1)}–${g[x].hi.toFixed(1)}`}</span></div>`).join('')}<div class="gz-scale"><span></span>${axis()}<span></span></div></div></section>
    ${top.length ? `<section class="card side"><h2 class="h2">오류 Top 3</h2><div class="wrap">${top.map(([t, n]) => pill(`${ERR_KO[t] || t} ${n}건${b.errs[t] ? `, 전주 ${b.errs[t]}건` : ''}`, 'warn')).join('')}</div></section>` : ''}
    <section class="card side"><h2 class="h2">다음 주 문법 초점</h2>${top.length ? '' : '<p class="cap">지난주 기록된 오류가 없어요. 이번 주 초점을 골라요.</p>'}<div class="wrap chipgrid">${S.GRAM_TYPES.map(t => `<button class="chip" data-act="rvFocus" data-v="${t}" aria-pressed="${nextFocus === t}">${ERR_KO[t]}</button>`).join('')}</div>${story ? `<p class="cap">이번 주 스토리 제안: ${{ person: '사람', place: '장소', object: '물건', event: '사건', skill: '기술', change: '변화' }[story]} 이야기 1편 내 이야기로 바꾸기</p>` : ''}</section>`,
    foot: { label: '다음 주 시작 (+30 XP)', act: 'rvDone' } };
}
function mockForm(prefix = 'm') {
  return `<div class="kw"><label class="fld">날짜<input class="inp" type="date" id="${prefix}Date" value="${today()}"></label><label class="fld">출처<select class="inp" id="${prefix}Src"><option value="ielts.org">IELTS.org</option><option value="bc">British Council</option><option value="cambridge">Cambridge</option><option value="app">앱 안</option></select></label>
    <label class="fld">Listening 원점수 /40<input class="inp" id="${prefix}L" inputmode="numeric" placeholder="예: 27"></label><label class="fld">Reading 원점수 /40<input class="inp" id="${prefix}R" inputmode="numeric" placeholder="예: 26"></label>
    <label class="fld">Writing 밴드<input class="inp" id="${prefix}W" inputmode="decimal" placeholder="선택"></label><label class="fld">Speaking 밴드<input class="inp" id="${prefix}S" inputmode="decimal" placeholder="선택"></label></div>`;
}
function readMock(prefix = 'm') {
  const n = (id, max) => { const v = $('#' + prefix + id).value.trim(); if (!v) return null; const x = +v; return isFinite(x) && x >= 0 && x <= max ? x : NaN; };
  const m = { date: $('#' + prefix + 'Date').value || today(), src: $('#' + prefix + 'Src').value, L: n('L', 40), R: n('R', 40), W: n('W', 9), S: n('S', 9) };
  if ([m.L, m.R, m.W, m.S].some(Number.isNaN)) { toast('원점수는 0~40, 밴드는 0~9로 넣어 주세요', 'warn'); return null; }
  if ([m.L, m.R, m.W, m.S].every(v => v == null)) { toast('점수를 하나 이상 넣어 주세요', 'warn'); return null; }
  if (m.W != null) m.W = S.clampBand(m.W); if (m.S != null) m.S = S.clampBand(m.S);
  DB.mocks.push(m); gain(XP.mock * ['L', 'R', 'W', 'S'].filter(s => m[s] != null).length); save();
  return m;
}

/* ================= stage: mission player & drills (full-screen focus mode) ================= */
const A = {};          // activities: { init(opts) → state, view(state) → { title, body, foot:{label, act, dis, icon}, alt:{label, act}, split, dark } , acts:{} }
let ACT = null, SEQ = null, stageT0 = 0;
const timers = [];
const every = (ms, fn) => { const t = setInterval(fn, ms); timers.push(t); return t; };
const later = (ms, fn) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
const clearTimers = () => { while (timers.length) { const t = timers.pop(); clearInterval(t); clearTimeout(t); } };
function addSecs() { if (stageT0) { dayRec().secs += Math.round((Date.now() - stageT0) / 1000); stageT0 = Date.now(); } }
let stageRet = null;   // the control that opened the player, as a selector (the tab is re-rendered on close)
function startAct(name, opts = {}, onDone) {
  clearTimers(); stopAudio(); recCancel();
  if ($('#stage').hidden) { const o = document.activeElement, d = o && o.dataset || {}; stageRet = d.act ? `[data-act="${d.act}"]${d.a ? `[data-a="${d.a}"]` : ''}${d.v ? `[data-v="${CSS.escape(d.v)}"]` : ''}` : d.go ? `[data-go="${d.go}"]` : null; }
  ACT = { name, opts, onDone, s: null }; ACT.s = A[name].init(opts, ACT) || {};
  if (!stageT0) stageT0 = Date.now();
  $('#stage').hidden = false; document.body.style.overflow = 'hidden'; $('#app').inert = true;   // the page behind the player is out of the tab order
  draw();
}
/** session strip under the task card: this session's results, the next mission step, this week's grammar tip (planner §6.3③) */
function sessionStrip(v) {
  const r = v.res, k = today(), ft = S.focusType(PLAN(), k, DB.errors, focusOv(k));
  const nx = SEQ && SEQ.blocks.slice(SEQ.i + 1).find(b => !SEQ.done[b.id]);
  const res = r ? `<div class="res" aria-label="이번 세션 결과">${Array.from({ length: r.total }, (_, i) => { const x = r.list[i]; return `<span class="rc ${x ? (x.ok ? 'ok' : 'no') : i === r.list.length ? 'cur' : ''}" title="${esc(x ? x.t || '' : '')}">${x ? ico(x.ok ? 'check' : 'rotate-ccw', 's16') : `<span class="num">${i + 1}</span>`}</span>`; }).join('')}</div>` : '';
  const tip = v.tip === false || res ? '' : `<b>이번 주 문법: ${ERR_KO[ft]}</b> ${esc(GRAM_TIP[ft] || '')}`;
  return res || nx || tip ? `<div class="strip">${res}${nx || tip ? `<p class="cap">${nx ? `다음 단계 <b>${esc(blockName(nx))}</b>. ` : ''}${tip}</p>` : ''}</div>` : '';
}
function draw() {
  if (!ACT) return;
  const a = A[ACT.name], v = a.view(ACT.s, ACT.opts), st = $('#stage');
  const prog = SEQ ? `<div class="st-prog" aria-hidden="true">${SEQ.blocks.map((b, i) => `<i class="${SEQ.done[b.id] === 1 ? 'on' : SEQ.done[b.id] === 2 ? 'skip' : i === SEQ.i ? 'cur' : ''}"></i>`).join('')}</div>` : '';
  const f = v.foot, alt = v.alt || (SEQ && SEQ.mission ? { label: '이 단계 건너뛰기', act: 'skipStep' } : null);
  const foot = `<div class="st-foot ${v.split ? 'full' : ''}">${f ? `<button class="btn pri lg block" data-act="${f.act}" ${f.dis ? 'disabled' : ''} ${f.x || ''}>${f.icon ? ico(f.icon) : ''}${f.label}</button>` : ''}${alt ? `<button class="btn ghost" data-act="${alt.act}">${alt.label}</button>` : ''}</div>`;
  st.className = 'stage' + (v.dark || /class="card recbox/.test(v.body) ? ' dark-stage' : '');   // 라디오·녹음 화면은 늘 어둡게
  const keep = st.querySelector('.st-body'), sc = keep ? keep.scrollTop : 0, duo = innerWidth >= 700 && !v.split, cx = duo ? stageCtx(v) : null;
  st.innerHTML = `<div class="st-top"><button class="btn icon ghost" data-act="close" aria-label="닫기">${ico('x', 's24')}</button><span class="ttl" id="stTtl">${esc(SEQ ? `${SEQ.title}: ${v.title}` : v.title)}</span><span id="stClock" class="pill num" ${v.clock ? '' : 'hidden'}>${v.clock || ''}</span></div>${prog}
    <div class="st-body">${duo ? `<div class="st-inner duo"><div class="st-main">${v.body}${cx.left}${foot}</div><aside class="st-side" aria-label="참고">${v.side || ''}${cx.right}</aside></div>`
      : `<div class="st-inner ${v.split ? 'split' : ''}" ${v.cols && innerWidth >= 700 ? `style="grid-template-columns:${v.cols}"` : ''}>${v.body}${v.split || v.noStrip ? '' : sessionStrip(v)}${foot}</div>`}</div>`;
  const inner = st.querySelector('.st-inner');
  if (duo) { const side = st.querySelector('.st-side'); side.prepend(...st.querySelectorAll('.st-main > .side')); fitStage(); }   // cards marked .side (model answers, results, references) sit in the context column
  else { fitLists(st);   // phone: the task card takes the free height (AC-H2): the activity's own .task card, else the last card
    if (!v.split && !inner.querySelector('.task')) { const cs = inner.querySelectorAll(':scope > .card'); cs.length && cs[cs.length - 1].classList.add('task'); } }
  if (v.keepScroll) st.querySelector('.st-body').scrollTop = sc;
  if (!st.contains(document.activeElement)) st.focus({ preventScroll: true });   // focus stays inside the dialog when a step redraws
  a.after && a.after(ACT.s);
}
/** ≥700: the context column is as tall as the visible stage body, and both columns' lists keep only the rows that fit */
function fitStage() {
  const st = $('#stage'), body = st.querySelector('.st-body'), side = st.querySelector('.st-side'); if (!side) return;
  side.style.height = (body.clientHeight - parseFloat(getComputedStyle(body).paddingTop) - 20) + 'px';
  const lf = st.querySelector('.st-main > .fill'); if (lf) lf.hidden = false;
  fitLists(st);
  if (lf && body.scrollHeight > body.clientHeight + 1) lf.hidden = true;   // no room under a tall task: no half-hidden list behind the button
}
/** ≥700 context for a one-column step: related errors under the task; beside it the step's own reference, today's steps, this session and today's words */
function stageCtx(v) {
  const r = v.res, n = r ? r.list.length : 0;
  const sess = r && r.total >= 5 ? fillCard('이번 세션', Array.from({ length: r.total }, (_, i) => { const x = r.list[i], lab = (v.labels || [])[i] || '';
    return `<div class="sit"><span class="rc ${x ? (x.ok ? 'ok' : 'no') : i === n ? 'cur' : ''}">${x ? ico(x.ok ? 'check' : 'rotate-ccw', 's16') : `<span class="num">${i + 1}</span>`}</span><span class="grow ${x || i === n ? '' : 'mut'}">${lab || (x && x.t ? `<span lang="en">${esc(x.t)}</span>` : x ? (x.ok ? '맞음' : '다시') : i === n ? '지금' : '대기')}</span></div>`; }), `<span class="cap num">${n}/${r.total}</span>`, 150).replace('card fill', 'card fill nat') : '';
  const errs = fillCard(v.errTitle || '관련 오류와 교정', errRows(v.errTypes), '', 180), left = v.fill ? fillCard(v.fill.title, v.fill.rows, v.fill.extra || '') : errs;
  const steps = SEQ ? `<section class="card tight"><div class="row" style="min-height:0"><h2 class="h3 grow">오늘 진행</h2><span class="cap num">${SEQ.blocks.filter(b => SEQ.done[b.id] === 1).length}/${SEQ.blocks.length}</span></div>${progRows(SEQ.blocks, SEQ.done, SEQ.i)}</section>` : '';
  return { left, right: steps + sess + (left !== errs ? errs : v.skipWords ? fillCard('이어서 볼 단어', wordRows(40, v.skipWords), '', 180) : fillCard('오늘 볼 단어', wordRows(), '', 180)) };
}
const redraw = () => draw();
function closeStage(toTab) {
  clearTimers(); stopAudio(); recCancel(); addSecs(); stageT0 = 0; ACT = null; SEQ = null;
  $('#stage').hidden = true; $('#stage').innerHTML = ''; document.body.style.overflow = ''; $('#app').inert = false;
  save(); if (toTab) TAB = toTab; render(); BK.bkRun(() => DB).catch(() => {});
  const r = stageRet && $(stageRet + ':not([disabled])'); (r && r.checkVisibility() ? r : $('#main')).focus({ preventScroll: true }); stageRet = null;
}
/* one activity finished (standalone): credit the day, XP toast, back to the tab */
function standaloneDone(res = {}) {
  if (res.credit !== false) { const fresh = creditDay('std'); if (fresh) toast(`오늘 인정 · 연속 ${DB.streak.cur}일`); else if (res.xp) toast(`+${res.xp} XP`); }
  else if (res.xp) toast(`+${res.xp} XP`);
  closeStage();
}
function run(name, opts = {}) { SEQ = null; startAct(name, opts, standaloneDone); }

/* ---------- mission player ---------- */
function openMission(kind) {
  const k = today(), away = S.awayDays(DB.streak, k);
  if (kind === 'comeback' && away >= 3 && DB.flags.restartShown !== k) { DB.flags.restartShown = k; DB.flags.xp2 = k; save(); SEQ = null; return startAct('restart', {}, () => openMission('comeback')); }
  if (kind === 'comeback') DB.flags.cb = k;
  DB.flags.mission = { day: k, kind }; save();
  SEQ = { mission: true, kind, blocks: missionBlocks(kind), title: kindLabel(kind), done: dayRec(k).steps };
  nextStep();
}
function runSeq(blocks, title) { SEQ = { mission: false, kind: 'seq', blocks, title, done: {} }; nextStep(); }
function nextStep() {
  const i = SEQ.blocks.findIndex(b => !SEQ.done[b.id]);
  if (i < 0) return finishSeq();
  SEQ.i = i; const b = SEQ.blocks[i];
  startAct(b.act, b.opts || {}, res => stepDone(b, res));
}
function stepDone(b, res = {}) {
  SEQ.done[b.id] = res.skipped ? 2 : 1; addSecs();
  if (b.diagPart && !res.skipped) { const d = DB.flags.diag = DB.flags.diag || {}; if (DIAG_PARTS.find(p => p[0] === b.diagPart)[1].every(x => SEQ.done[x.id] === 1 || x.id === b.id)) { d[b.diagPart] = today(); DB.flags.diagDay = today(); } }
  if (SEQ.mission) {
    const need = creditAfter(SEQ.kind, SEQ.blocks);
    if (!dayRec().kind && need.every(id => SEQ.done[id] === 1)) {
      creditDay(SEQ.kind === 'wknd' ? 'wknd' : SEQ.kind);
      const x = gain(XP.min); toast(`오늘 인정 · +${x} XP`);
      if (SEQ.kind === 'comeback' && DB.flags.xp2 === today()) DB.flags.xp2 = '';
    }
  }
  save(); nextStep();
}
function finishSeq() {
  const s = SEQ;
  if (s.mission && (s.kind === 'std' || s.kind === 'wknd') && s.blocks.every(b => s.done[b.id] === 1) && !dayRec().stdDone) { dayRec().stdDone = 1; const x = gain(XP.std); setTimeout(() => toast(`미션 완료 · +${x} XP`), 50); }
  if (!s.mission) { creditDay('std'); setTimeout(() => toast('진단을 마쳤어요. 게이지에 반영했어요'), 50); }
  closeStage('today');
}

/* ---------- vocab session (recognition, production, my decks; irregular verbs mixed in on past-tense weeks) ---------- */
/** past-tense focus week: up to 3 irregular-verb cards a day ride along in the word queue (the separate tile is gone) */
function irrMix(k = today()) {
  if (S.focusType(PLAN(), k, DB.errors, focusOv(k)) !== 'tense') return [];
  const q = S.buildQueue(DB.cards, C.irregular.items.map(v => 'irr:' + v.base), now(), { newLimit: 3, reviewCap: 3, newToday: dayRec(k).irrNew || 0, prefix: ['irr:'] });
  return [...q.due, ...q.fresh].slice(0, 3);
}
function vocabList(opts) {
  const mode = opts.mode || 'std';
  if (opts.ids) return opts.ids.slice();
  if (opts.deck === 'myerr') return Object.keys(DB.my).filter(id => DB.my[id].deck === 'err').sort((a, b) => (DB.cards[a] ? DB.cards[a].due : 0) - (DB.cards[b] ? DB.cards[b].due : 0)).slice(0, 15);
  const q = vocabQueue(mode); let list = [...q.due, ...q.fresh];
  const target = opts.n || list.length;
  if (list.length < target && (mode === 'min' || mode === 'comeback')) {   // 모자라면: min 은 새 카드로, comeback 은 곧 만기될 카드로 채움
    const extra = mode === 'min' ? C.ORDER.filter(id => !DB.cards[id] && !list.includes(id)) : [];
    const early = Object.entries(DB.cards).filter(([id]) => /^(nawl|ngsl|my):/.test(id) && !list.includes(id)).sort((a, b) => a[1].due - b[1].due).map(([id]) => id);
    list = list.concat(extra, early);
  }
  list = list.slice(0, target);
  if (mode !== 'min' && mode !== 'comeback') irrMix().forEach((id, i) => list.splice(Math.min(list.length, 3 * (i + 1) + i), 0, id));
  return list;
}
function cardInfo(id) {
  if (id.startsWith('irr:')) { const v = C.IRR[id.slice(4)]; return v && { kind: 'irr', v }; }
  if (id.startsWith('my:')) { const m = DB.my[id]; return m && { kind: m.deck, m }; }
  const nid = id.replace(/:[rp]$/, ''), n = C.NOTE[nid]; return n && { kind: id.endsWith(':p') ? 'prod' : 'rec', n, nid };
}
function blankOf(n) {
  const toks = n.ex.split(' '), stem = n.w.toLowerCase().slice(0, Math.max(3, n.w.length - 2)), i = toks.findIndex(t => t.toLowerCase().replace(/[^a-z-]/g, '').startsWith(stem));
  if (i < 0) return { html: esc(n.ex) + ` <span class="blank">&nbsp;</span>`, ans: n.w };
  const raw = toks[i], ans = raw.replace(/[^A-Za-z'-]/g, ''), tail = raw.slice(raw.indexOf(ans) + ans.length);
  return { html: toks.map((t, j) => j === i ? `<span class="blank">${esc(ans[0])}${'&nbsp;'.repeat(Math.max(3, ans.length - 1))}</span>${esc(tail)}` : esc(t)).join(' '), ans };
}
A.vocab = {
  init(opts) {
    const list = vocabList(opts);
    return { list, i: 0, target: list.length, firsts: new Set(), again: {}, requeued: {}, phase: 'q', early: false, ms: 0, t0: Date.now(), tShow: Date.now(), answer: '', fb: null, xp: 0, mode: opts.mode || 'std', res: [] };
  },
  view(s, opts) {
    const id = s.list[s.i], title = opts.deck === 'myerr' ? '내 오류 카드' : '단어 SRS', res = { total: s.target, list: s.res };
    if (!id) return { title, noStrip: true, body: `<section class="card"><h2 class="h2">오늘 볼 카드가 없어요</h2><p class="cap">내일 새 카드가 들어와요. 라디오 모드로 들어도 좋아요.</p></section>`, foot: { label: '완료', act: 'vDone' } };
    const ci = cardInfo(id); if (!ci) { s.i++; return this.view(s, opts); }
    const cnt = `<span class="cap num">${Math.min(s.firsts.size + 1, s.target)} / ${s.target}${s.list.length > s.target ? `, 다시 보기 ${s.list.length - s.target}` : ''}</span>`;
    const order = [...new Set([...s.firsts, ...s.list.slice(s.i)])].slice(0, s.target), wd = cid => { const c = cardInfo(cid); return !c ? '' : c.n ? c.n.w : c.v ? c.v.base : c.m ? (c.m.right || c.m.back || '') : ''; };
    const labels = order.map((cid, j) => { const c = cardInfo(cid), done = j < s.res.length; return `<b lang="en">${esc(wd(cid))}</b>${done && c && c.n ? ` <span class="mut">${esc(c.n.ko)}</span>` : ''}`; });
    const prev = s.prev && C.NOTE[s.prev], side = prev ? `<section class="card"><div class="row" style="min-height:0"><h2 class="h3 grow">방금 본 단어</h2>${pill(esc(prev.pos))}</div><p class="h2" lang="en">${esc(prev.w)} <span class="mut">${esc(prev.ko)}</span></p><p class="en" lang="en">${esc(prev.ex)}</p><p class="cap">${esc(prev.ex_ko || '')}</p>${(prev.col || []).length ? `<div class="wrap">${prev.col.map(c => `<span class="pill" lang="en">${esc(c)}</span>`).join('')}</div>` : ''}</section>` : '';
    if (ci.kind === 'rec') {
      const n = ci.n, rev = s.phase === 'rev';
      const body = `<section class="card fc task reveal"><div class="t-top">${cnt}${pill(n.deck === 'hackers' ? `해커스 DAY ${n.day}` : { core: 'Core', listening: 'Listening', reading: 'Reading' }[n.deck] || '')}</div>
        <div class="fc-mid"><p class="w" lang="en">${esc(n.w)}</p><p class="pos">${esc(n.pos)}</p>
        <div class="say ${rev ? 'off' : ''}" aria-hidden="true"><svg class="ring" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21"/><circle id="fcT" cx="24" cy="24" r="21"/></svg>${ico('mic', 's24')}</div>
        <p class="cap say-t">${rev ? '' : '소리 내 말해 보세요'}</p>
        <button class="btn line sm" data-act="vPlay">${ico('volume-2')}다시 듣기</button></div>
        <div class="mean t-bot ${rev ? '' : 'hid'}" id="fcMean">${rev ? `<span class="ko">${esc(n.ko)}</span><span lang="en">${esc(n.ex)}</span><span class="cap">${esc(n.ex_ko || '')}</span><span class="cap" lang="en">${esc((n.col || []).join(', '))}</span>${n.deck === 'hackers' ? `<a class="linkbtn" href="https://www.youtube.com/watch?v=rWZG4_idwr8&t=${Math.max(0, Math.floor(n.ts) - 1)}s" target="_blank" rel="noopener">${ico('external-link', 's16')}해커스 영상 DAY ${n.day}에서 이 단어 듣기</a>` : ''}` : '<span class="cap">뜻을 떠올려 보세요</span>'}</div></section>`;
      return { title, body, res, labels, side, skipWords: order.map(x => x.replace(/:[rp]$/, '')), foot: rev ? { label: s.early ? '맞았어요' : '알았어요', act: 'vRate', x: 'data-ok="1"' } : { label: '안다', act: 'vKnow' }, alt: rev ? { label: s.early ? '틀렸어요' : '몰랐어요', act: 'vRateNo' } : { label: '뜻 보기', act: 'vShow' } };
    }
    let prompt = '', ko = '';
    if (ci.kind === 'prod') { const b = blankOf(ci.n); s.key = b.ans; prompt = `<p class="en" lang="en">${b.html}</p>`; ko = ci.n.ex_ko || ci.n.ko; }
    else if (ci.kind === 'irr') { s.key = ci.v.past; prompt = `<p class="w" lang="en">${esc(ci.v.base)}</p><p class="cap">과거형을 써 보세요 (${esc(ci.v.ko)})</p>`; }
    else if (ci.kind === 'err') { s.key = ci.m.right; prompt = `<p class="cap">고쳐 써 보세요: ${ERR_KO[ci.m.type] || ''}</p><p class="en" lang="en"><s>${esc(ci.m.wrong)}</s></p>`; }
    else { s.key = ci.m.back; prompt = `<p class="cap">빈칸 표현을 떠올려 보세요</p><p class="en" lang="en">${esc(ci.m.front)}</p>${ci.m.ko ? `<p class="cap">${esc(ci.m.ko)}</p>` : ''}`; }
    const fb = s.fb ? `<div class="mean t-bot reveal"><span class="fb ${s.fb.ok ? 'ok-t' : 'no-t'}">${s.fb.ok ? '맞았어요' : '정답'}</span><span class="ko" lang="en">${esc(s.key)}${ci.kind === 'irr' ? `, ${esc(ci.v.pp)}` : ''}</span>${ci.kind === 'irr' ? `<span class="cap" lang="en">${esc(ci.v.ex)}</span>` : ci.kind === 'err' && ci.m.why ? `<span class="cap">${esc(ci.m.why)}</span>` : ''}</div>` : `<p class="cap t-bot">${ci.kind === 'irr' ? '이번 주 과거시제 초점이라 불규칙 동사가 섞여 나와요' : '영어로 쓰고 확인을 눌러요'}</p>`;
    return { title, res, labels, side, skipWords: order.map(x => x.replace(/:[rp]$/, '')), body: `<section class="card fc task reveal"><div class="t-top">${cnt}${pill(ci.kind === 'irr' ? '불규칙 과거형' : ci.kind === 'prod' ? '빈칸 산출' : ci.kind === 'err' ? '내 오류' : '내 표현')}</div><div class="fc-mid">${ko ? `<p class="h2">${esc(ko)}</p>` : ''}${prompt}<input class="inp" id="vIn" autocomplete="off" autocapitalize="off" spellcheck="false" lang="en" placeholder="영어로 입력" value="${esc(s.answer)}" ${s.fb ? 'readonly' : ''}></div>${fb}</section>`,
      foot: s.fb ? { label: '다음', act: 'vNext' } : { label: '확인', act: 'vCheck' } };
  },
  after(s) {
    const id = s.list[s.i]; if (!id) return;
    const ci = cardInfo(id);
    if (ci && ci.kind === 'rec' && s.phase === 'q' && !s.started) { s.started = true; s.tShow = Date.now(); vocabAudio(ci.n, s); }
    if (ci && ci.kind !== 'rec' && !s.fb) { const f = $('#vIn'); f && setTimeout(() => f.focus(), 30); if (!s.shown) { s.shown = true; s.tShow = Date.now(); } }
  }
};
async function vocabAudio(n, s) {
  const tok = s.i, rs = (DB.profile.revealSec || 3) * 1000;
  const ok = await playClip(au(n.audio), { to: n.tReveal ? Math.max(.4, n.tReveal - 3.05) : null });
  if (!ok && ACT && ACT.s === s && s.i === tok) { await speak(n.w); if (ACT && ACT.s === s && s.i === tok) await speak(n.w, { keep: true }); }   // TTS fallback only for the card still on screen
  if (!ACT || ACT.s !== s || s.i !== tok || s.phase !== 'q') return;
  s.cd = Date.now(); const ring = $('#fcT'), say = $('.say'); if (ring) { ring.style.transition = `stroke-dashoffset ${rs}ms linear`; requestAnimationFrame(() => { ring.style.strokeDashoffset = '0'; }); } if (say) say.classList.add('go');   // ring timer + one mic pulse: say it aloud (no recording)
  later(rs, () => { if (ACT && ACT.s === s && s.i === tok && s.phase === 'q') { s.phase = 'rev'; s.early = false; draw(); vocabRest(n); } });
}
function vocabRest(n) { if (n.tReveal) playClip(au(n.audio), { from: n.tReveal }); }
function vocabRate(s, rating) {
  const id = s.list[s.i], first = !s.firsts.has(id), prev = DB.cards[id], wasNew = !prev;
  DB.cards[id] = S.review(prev || null, rating, now());
  DB.revlog.push([id, Date.now(), rating, Date.now() - s.tShow]);
  const d = dayRec();
  if (first) { s.res.push({ ok: rating !== 'Again', t: (cardInfo(id) || {}).n ? cardInfo(id).n.w : '' }); }
  if (first) { s.firsts.add(id); if (wasNew) { if (id.startsWith('irr:')) d.irrNew = (d.irrNew || 0) + 1; else d.nw = (d.nw || 0) + 1; } else d.rv = (d.rv || 0) + 1; s.xp += gain(wasNew ? XP.fresh : XP.review) || 0; }
  const nid = id.replace(/:r$/, '');
  if (id.endsWith(':r')) { DB.notes[nid] = DB.notes[nid] || { seen: today() }; if ((rating === 'Good' || rating === 'Easy') && !DB.cards[nid + ':p']) DB.cards[nid + ':p'] = S.emptyCard(new Date(Date.now() + 2 * 864e5)); }
  const reins = s.mode !== 'min' && s.mode !== 'comeback';
  if (reins && rating === 'Again' && (s.again[id] || 0) < 2) { s.again[id] = (s.again[id] || 0) + 1; s.list = S.requeue(s.list, s.i, id, 5); }
  else if (reins && wasNew && first && rating !== 'Again' && !s.requeued[id]) { s.requeued[id] = 1; s.list = S.requeue(s.list, s.i, id, 5); }
  save();
  if (id.endsWith(':r')) s.prev = nid;
  s.i++; s.phase = 'q'; s.early = false; s.started = false; s.cd = 0; s.shown = false; s.fb = null; s.answer = '';
  if (s.i >= s.list.length) return finish({ xp: s.xp, credit: s.firsts.size >= 10 });
  draw();
}
function finish(res) { const a = ACT; if (!a) return; clearTimers(); stopAudio(); a.onDone(res || {}); }
A.vocab.acts = {
  vKnow: s => { s.early = true; s.ms = s.cd ? Date.now() - s.cd : 0; s.phase = 'rev'; draw(); const ci = cardInfo(s.list[s.i]); ci && vocabRest(ci.n); },
  vShow: s => { s.early = false; s.phase = 'rev'; draw(); const ci = cardInfo(s.list[s.i]); ci && vocabRest(ci.n); },
  vRate: s => vocabRate(s, S.rateRecog({ early: s.early, ms: s.ms, correct: true })),
  vRateNo: s => vocabRate(s, S.rateRecog({ early: s.early, ms: s.ms, correct: false })),
  vPlay: s => { const ci = cardInfo(s.list[s.i]); ci && playClip(au(ci.n.audio), { to: ci.n.tReveal ? ci.n.tReveal - 3.05 : null }).then(ok => ok || speak(ci.n.w)); },
  vCheck: s => { const v = ($('#vIn') || {}).value || ''; s.answer = v; const ok = S.canon(v).replace(/[^\w' ]/g, '') === S.canon(s.key).replace(/[^\w' ]/g, '') || (s.list[s.i].startsWith('irr:') && s.key.split('/').some(k => S.canon(v).split(/[\s,/]+/).includes(S.canon(k)))); s.fb = { ok, rating: S.rateProd({ correct: ok, ms: Date.now() - s.tShow }) }; draw(); if (s.list[s.i].startsWith('irr:')) speak(`${cardInfo(s.list[s.i]).v.base}, ${s.key}, ${cardInfo(s.list[s.i]).v.pp}`); },
  vNext: s => vocabRate(s, s.fb.rating),
  vDone: () => finish({ credit: false })
};

/* ---------- diagnosis: vocab check 30 (24 real + 6 fake) ---------- */
const FAKE = ['florvent', 'trasticle', 'plimation', 'morvish', 'cambrious', 'sultentive'];
A.diagVocab = {
  init() { const real = shuffle(C.vocab.items.filter(n => !DB.cards[n.id + ':r'])).slice(0, 24).map(n => ({ w: n.w, id: n.id })); return { items: shuffle([...real, ...FAKE.map(w => ({ w, fake: true }))]), i: 0, yes: [] }; },
  view(s) { const it = s.items[s.i]; return { title: '어휘 체크', body: `<p class="cap num" style="text-align:center">${s.i + 1} / ${s.items.length}</p><section class="card fc"><p class="w" lang="en">${esc(it.w)}</p><p class="cap">뜻을 알면 "안다". 모르면 "모른다". 가짜 단어도 섞여 있어요.</p></section>`, foot: { label: '안다', act: 'dvYes' }, alt: { label: '모른다', act: 'dvNo' } }; },
  acts: {
    dvYes: s => { s.yes.push(s.items[s.i]); A.diagVocab.acts.dvNo(s, true); },
    dvNo: s => { s.i++; if (s.i < s.items.length) return draw();
      const real = s.yes.filter(x => !x.fake), fake = s.yes.filter(x => x.fake).length, n = s.items.filter(x => !x.fake).length;
      for (const x of real) { DB.cards[x.id + ':r'] = S.knownCard(now()); DB.notes[x.id] = { seen: today(), known: 1 }; }
      DB.flags.diagVocab = { known: real.length, of: n, fake, score: Math.max(0, real.length / n - fake / FAKE.length) };
      save(); finish({ credit: false }); }
  }
};

/* ---------- radio mode (hands-free, exposure only, never touches FSRS) ---------- */
A.radio = {
  init() { const q = vocabQueue('full'), ids = [...q.due.filter(x => x.endsWith(':r')), ...q.fresh].map(x => x.replace(/:r$/, '')); const list = ids.length ? ids : C.vocab.items.slice(0, 20).map(n => n.id); return { list, i: 0, playing: false, secs: 0, last: 0, credited: false }; },
  view(s) {
    const n = C.NOTE[s.list[s.i]] || {};
    return { dark: true, noStrip: true, title: '라디오 모드', clock: mmss(s.secs * 1000), body: `<section class="card fc task"><div class="t-top"><span class="cap num">${s.i + 1} / ${s.list.length}</span>${pill('노출만 기록')}</div>
      <div class="fc-mid"><p class="w" lang="en" id="rW">${esc(n.w || '')}</p><p class="pos">${esc(n.pos || '')}</p><p class="ko" id="rKo">${esc(n.ko || '')}</p><p class="en" lang="en" id="rEx">${esc(n.ex || '')}</p>
      <p class="cap">빈 3초 동안 소리 내어 말해 보세요.</p></div>
      <div class="t-bot stack"><div class="row" style="width:100%">${bar(Math.min(1, s.secs / 300), 'ok')}<span class="cap num" id="rSec">${Math.floor(s.secs / 60)}/5분 들으면 가벼운 날</span></div>
      <button class="btn line block" data-act="rNext">${ico('skip-forward')}다음 단어</button></div></section>`, foot: { label: s.playing ? '일시 정지' : '재생', act: 'rToggle', icon: s.playing ? 'pause' : 'play' }, alt: { label: '끝내기', act: 'rEnd' } };
  },
  acts: {
    rToggle: s => { s.playing = !s.playing; if (s.playing) { s.last = Date.now(); radioPlay(s); every(1000, () => radioTick(s)); } else { radioTick(s); stopAudio(); clearTimers(); } draw(); },
    rNext: s => { s.i = (s.i + 1) % s.list.length; if (s.playing) radioPlay(s); else draw(); },
    rEnd: s => { radioTick(s); finish({ credit: false }); }
  }
};
function radioTick(s) { if (!s.playing) return; const t = Date.now(); s.secs += (t - s.last) / 1000; s.last = t; dayRec().radioSecs = (dayRec().radioSecs || 0);
  const el = $('#stClock'); if (el) el.textContent = mmss(s.secs * 1000); const r = $('#rSec'); if (r) r.textContent = `${Math.floor(s.secs / 60)}/5분 들으면 가벼운 날`;
  if (s.secs >= 300 && !s.credited) { s.credited = true; if (!dayRec().kind) { const ok = creditDay('radio'); toast(ok ? '가벼운 날로 인정했어요' : '이번 주 라디오 인정 2회를 다 썼어요. 계속 들어도 좋아요'); } } }
async function radioPlay(s) {
  const tok = ++radioPlay.tok, n = C.NOTE[s.list[s.i]]; if (!n) return;
  if ('mediaSession' in navigator) { try { navigator.mediaSession.metadata = new MediaMetadata({ title: n.w, artist: '밴드업 라디오', album: '오늘의 단어' }); navigator.mediaSession.setActionHandler('nexttrack', () => A.radio.acts.rNext(s)); navigator.mediaSession.setActionHandler('pause', () => s.playing && A.radio.acts.rToggle(s)); navigator.mediaSession.setActionHandler('play', () => !s.playing && A.radio.acts.rToggle(s)); } catch (e) {} }
  const w = $('#rW'); if (w) { w.textContent = n.w; $('#rKo').textContent = n.ko || ''; $('#rEx').textContent = n.ex || ''; }
  let ok = await playClip(au(n.audio));
  if (!ok && tok === radioPlay.tok && s.playing) { await speak(n.w); await speak(n.w, { keep: true }); await sleep(3000); await speak(n.ko, { lang: 'ko-KR', keep: true }); await speak(n.ex, { keep: true }); ok = true; }
  if (tok !== radioPlay.tok || !s.playing || !ACT || ACT.s !== s) return;
  const nt = DB.notes[n.id] = DB.notes[n.id] || { seen: today() }; nt.radio = (nt.radio || 0) + 1; save();   // 노출만 기록
  s.i = (s.i + 1) % s.list.length; radioTick(s); radioPlay(s);
}
radioPlay.tok = 0;

/* ---------- recording helper (shared) ---------- */
let RH = null;   // live recorder handle
function recCancel() { if (RH) { try { RH.cancel(); } catch (e) {} RH = null; } }
async function recToggle(s, key, { maxMs = 0, onStop } = {}) {
  if (RH) { const h = RH; RH = null; const r = await h.stop(); return recSaved(s, h.key || key, r, h.onStop); }   // B1: manual stop uses the onStop saved at start
  if (!REC.canRecord()) { toast('이 브라우저에서는 녹음할 수 없어요', 'warn'); return; }
  stopAudio();
  try {
    s.recOn = key; draw();
    let h = null;
    h = await REC.start({ maxMs, onTick: (ms, lvl) => { const c = $('#recClock'); if (c) c.textContent = mmss(maxMs ? maxMs - ms : ms); const m = $('#recMeter'); if (m) m.style.width = Math.round(lvl * 100) + '%'; },
      onAuto: r => { if (h && RH === h) { RH = null; recSaved(s, key, r, onStop); } } });   // maxMs reached → stopped by the recorder itself
    h.key = key; h.onStop = onStop; RH = h; s.recT0 = Date.now();
  } catch (e) { s.recOn = null; draw(); toast('마이크를 쓸 수 없어요. 권한을 확인해 주세요', 'warn'); }
}
async function recSaved(s, key, r, onStop) {
  if (!ACT || ACT.s !== s) return;
  s.recOn = null; const id = uid();
  s[key] = { id, url: URL.createObjectURL(r.blob), blob: r.blob, mime: r.mime, ms: r.ms, ratio: r.ratio, pauses: r.pauses };
  REC.putRec({ id, ts: Date.now(), blob: r.blob, mime: r.mime, ms: r.ms, kind: ACT.name, graded: false }).catch(() => {});
  s.xp = (s.xp || 0) + (gain(XP.rec) || 0); save();
  onStop ? onStop(s[key]) : draw();
}
const recUI = (s, key, { maxMs = 0, label = '', stats = false } = {}) => {
  const r = s[key], on = s.recOn === key;
  return `<section class="card recbox dark-rec">${label ? `<p class="cap t-top">${label}</p>` : ''}<p class="clock" id="recClock">${on ? mmss(maxMs || 0) : r ? mmss(r.ms) : mmss(maxMs || 0)}</p><div class="meter"><i id="recMeter"></i></div>
    ${r && !on ? `<div class="t-bot stack" style="width:100%"><audio controls src="${r.url}"></audio>${stats ? metrics([['발화 비율', Math.round(r.ratio * 100), '%'], ['0.7초 이상 멈춤', r.pauses, '회']]) : ''}</div>` : `<p class="cap t-bot">${on ? '녹음 중이에요' : '버튼을 누르면 녹음이 시작돼요'}</p>`}</section>`;
};
const recFoot = (s, key, next) => s.recOn === key ? { label: '정지', act: 'recStop', icon: 'square' } : s[key] && next ? next : { label: s[key] ? '다시 녹음' : '녹음', act: 'recGo', icon: 'mic', x: `data-k="${key}"` };
function stressHtml(line) {   // chunks text with '/' breaks; syllables written in CAPS in `stress` are bolded
  const sw = String(line.stress || line.en).split(/\s+/); let j = 0;
  return String(line.chunks || line.en).split(/\s+/).map(t => {
    if (t === '/') return '<span class="faint">/</span>';
    const m = sw[j++] || '', ml = m.replace(/[^A-Za-z]/g, ''), tl = t.replace(/[^A-Za-z]/g, '');
    const run = ml.toLowerCase() === tl.toLowerCase() && /[A-Z]{2,}/.exec(ml); if (!run) return esc(t);
    let li = 0, out = '';
    for (const ch of t) { if (/[A-Za-z]/.test(ch)) { const on = li >= run.index && li < run.index + run[0].length; out += on ? `<b>${esc(ch)}</b>` : esc(ch); li++; } else out += esc(ch); }
    return out.replace(/<\/b><b>/g, '');
  }).join(' ');
}
const shadowAll = () => [...(C.shadow.items || []), ...DB.myShadow];
function weekClip() { const all = shadowAll(); return all.length ? all[(WEEK().n - 1) % all.length] : null; }

/* ---------- shadow1: one sentence, one recording (minimum mission) ---------- */
A.shadow1 = {
  init() { const c = weekClip(); if (!c) return { none: true }; const li = c.lines[(dow(today()) + 6) % 7 % c.lines.length]; return { c, li }; },
  view(s) {
    if (s.none) return { title: '섀도잉 1문장', body: '<section class="card"><p>섀도잉 대본이 아직 없어요.</p></section>', foot: { label: '넘어가기', act: 'sh1Done' } };
    return { title: '섀도잉 1문장', side: `<section class="card"><div class="row" style="min-height:0"><h2 class="h3 grow">이번 주 클립 전체</h2>${pill(esc(s.c.title))}</div><div class="stack en" lang="en">${s.c.lines.map(l => `<p class="${l === s.li ? '' : 'mut'}">${stressHtml(l)}</p>`).join('')}</div></section>`, body: `<section class="card"><span class="cap">이번 주 클립: ${esc(s.c.title)}</span><p class="en" lang="en">${stressHtml(s.li)}</p><p class="cap">${esc(s.li.ko || '')}</p>${btn('들어 보기', 'sh1Play', { cls: 'line block', icon: 'volume-2' })}</section>${recUI(s, 'r1', { maxMs: 15000, label: '굵은 곳에 힘을 주고, / 에서 끊어 읽어요' })}`,
      foot: recFoot(s, 'r1', { label: '완료', act: 'sh1Done', icon: 'check' }) };
  },
  acts: { sh1Play: s => speak(s.li.en, { rate: .9 }), sh1Done: s => { if (s.r1) addAttempt({ skill: 'S', kind: 'shadow', ref: s.c.id, secs: Math.round(s.r1.ms / 1000) }); save(); finish({ xp: s.xp }); } }
};

/* ---------- shadow studio, 3 steps: repeat-listen (auto) → record → A/B (original, then mine) ---------- */
A.shadow = {
  init(opts) { const c = opts.id ? shadowAll().find(x => x.id === opts.id) : weekClip(); return c ? { c, ph: 0, rate: 1 } : { none: true }; },
  view(s) {
    if (s.none) return { title: '섀도잉', body: '<section class="card"><p>섀도잉 대본이 아직 없어요.</p></section>', foot: { label: '넘어가기', act: 'shDone' } };
    const stepN = ['반복 듣기', '녹음', 'A/B 비교'];
    const body = `${s.score ? shadowScore(s.score) : ''}<section class="card task flow"><div class="row" style="min-height:0"><h2 class="h2 grow">${esc(s.c.title)}</h2>${pill(s.c.src === 'voa' ? 'VOA' : s.c.src === 'public-domain' ? '퍼블릭 도메인' : s.c.src === 'mine' ? '내 답' : '자작')}${shadowAll().length > 1 && s.ph === 0 ? `<button class="linkbtn" data-act="shClip">다른 클립</button>` : ''}</div>
      <ol class="steps3" aria-label="단계">${stepN.map((p, i) => `<li class="${i === s.ph ? 'cur' : i < s.ph ? 'done' : ''}">${i < s.ph ? ico('check', 's16') : `<span class="num">${i + 1}</span>`}${p}</li>`).join('')}</ol>
      <div class="stack en" lang="en">${s.c.lines.map(l => `<p>${stressHtml(l)}</p>`).join('')}</div>
      ${s.ph === 0 ? `<div class="row"><div class="seg grow" role="group" aria-label="속도">${[[.8, '0.8×'], [1, '1.0×']].map(([v, l]) => `<button data-act="shRate" data-v="${v}" aria-pressed="${s.rate === v}">${l}</button>`).join('')}</div>${btn('다시 듣기', 'shPlay', { cls: 'line', icon: 'repeat' })}</div>` : ''}
      ${s.c.credit ? `<p class="cap">${esc(s.c.credit)}</p>` : ''}</section>
      ${s.ph >= 1 ? recUI(s, 'rs', { maxMs: 60000, label: s.ph === 1 ? '스크립트를 보며 한 번에 녹음해요' : '원본 다음에 내 녹음이 이어서 나와요' }).replace('class="card recbox', 'class="card side recbox') : ''}${s.ph === 2 ? btn('원본, 내 녹음 이어 듣기', 'shAB', { cls: 'line block', icon: 'play' }) : ''}`;
    const scoreable = s.ph === 2 && s.rs && !s.score && G.getKey();   // 1005: after the take, the score is the next step
    const foot = s.ph === 0 ? { label: '녹음 시작', act: 'shRec', icon: 'mic' } : s.ph === 1 ? (s.recOn ? { label: '정지', act: 'recStop', icon: 'square' } : { label: '녹음 시작', act: 'shRec', icon: 'mic' })
      : scoreable ? { label: s.grading ? '점수 내는 중…' : '발음 점수 받기', act: 'shScore', icon: 'sparkles', dis: s.grading } : { label: '완료', act: 'shDone', icon: 'check' };
    return { title: '섀도잉 스튜디오', body, foot, keepScroll: true, alt: s.ph === 2 && !s.grading ? (scoreable ? { label: '점수 없이 완료', act: 'shDone' } : { label: '다시 녹음', act: 'shRec' }) : undefined };
  },
  after(s) { if (!s.none && s.ph === 0 && !s.auto) { s.auto = 1; A.shadow.acts.shPlay(s); }   // step 1 starts by itself
    if (s.score && !s.scoreShown) { s.scoreShown = 1; const b = $('#stage .st-body'); if (b && innerWidth < 700) b.scrollTop = 0; } },
  acts: {
    shRate: (s, e) => { s.rate = +e.dataset.v; draw(); A.shadow.acts.shPlay(s); },
    shClip: s => { const all = shadowAll(), i = all.findIndex(x => x.id === s.c.id); Object.assign(s, { c: all[(i + 1) % all.length], rs: null, auto: 0 }); draw(); },
    shPlay: async s => { if (s.c.audio && await playClip(au(s.c.audio), { rate: s.rate })) return; for (let i = 0; i < s.c.lines.length; i++) { await speak(s.c.lines[i].en, { rate: s.rate * (DB.settings.rate || 1), keep: i > 0 }); if (!ACT || ACT.s !== s) return; } },
    shScore: s => shadowGrade(s, 'rs', s.c.lines.map(l => l.en).join(' ')),
    shRec: s => { if (s.grading) return; s.ph = 1; s.score = null; s.scoreShown = 0; stopAudio(); recToggle(s, 'rs', { maxMs: 60000, onStop: () => { s.ph = 2; draw(); A.shadow.acts.shAB(s); } }); },
    shAB: async s => { await A.shadow.acts.shPlay(s); if (!ACT || ACT.s !== s || !s.rs) return; const a = new Audio(s.rs.url); a.play().catch(() => {}); },
    shDone: s => { if (s.grading) return; if (s.rs && s.savedFor !== s.rs.id) addAttempt({ skill: 'S', kind: 'shadow', ref: s.c.id, secs: Math.round(s.rs.ms / 1000) }); save(); finish({ xp: s.xp }); }   // a scored take was saved when its score came back
  }
};

/* ================= Listening ================= */
const PRED_KO = { name: '이름', number: '숫자', 'plural-noun': '복수', noun: '명사', adj: '형용사', date: '시간', money: '금액', place: '장소', verb: '동사', other: '기타' };
/** Clue reading (the video's method): the words around the blank and the word limit suggest what kind of answer fits.
 *  → up to 3 suggestions [{ v, why }] ranked by the clues; the 4th chip is always "기타". */
const CLUES = [
  [/[£$€]\s*____|____\s*(pounds|dollars|p\b)|\b(fee|cost|price|charge|rent|pay)\b/i, 'money', '£ 기호나 요금 말'],
  [/\b(date|day|time|when|birth|starts?|begins?|opens?|closes?|year|month|at ____$|until|deadline)\b/i, 'date', '시간·날짜를 묻는 말'],
  [/\b(number|no\.|phone|mobile|age|minimum|maximum|how many|flat|room|code|capacity|size)\b|A NUMBER/i, 'number', '번호·나이·수량 말'],
  [/\b(name|surname|called|who|researcher|author|led by|contact)\b/i, 'name', '사람을 묻는 칸'],
  [/____\s+(road|street|lane|avenue|square|park|centre|center|building|hall)\b|\b(address|street|road|located|location|where|venue|station|depot|meet at)\b/i, 'place', '장소·주소 말'],
  [/\b(bring|some|several|many|two|three|four|own|all the|lots of)\s+(\w+\s+)?____|____s\b/i, 'plural-noun', '복수 신호(bring, some, own)'],
  [/\b(a|an|the)\s+(\w+\s+)?____|\bby\s+____/i, 'noun', 'a/an/the 나 by 뒤'],
  [/\b(to|should|must|will|can|please|always|never)\s+____|____\s+(it|them)\b/i, 'verb', 'to, 조동사, 명령문 자리'],
  [/\b(is|are|was|very|more|quite|too)\s+____/i, 'adj', 'be동사나 very 뒤']
];
function predChips(q) {
  const lim = /^(A )?NUMBER( ONLY)?$|^NUMBERS? ONLY/.test(String(q.limit || '').trim()) ? ' A NUMBER' : '';   // "ONE WORD AND/OR A NUMBER" says nothing about the type
  const out = []; for (const [re, v, why] of CLUES) if (re.test(q.prompt + lim) && !out.some(x => x.v === v)) out.push({ v, why });
  for (const v of ['noun', 'number', 'plural-noun']) if (out.length < 3 && !out.some(x => x.v === v)) out.push({ v, why: '' });
  return out.slice(0, 3);
}
const leastUsed = (items, kind) => { const n = id => DB.attempts.filter(a => a.ref === id).length; return items.slice().sort((a, b) => n(a.id) - n(b.id))[0]; };
const VOICE_BY = { Daniel: 'Daniel', Karen: 'Karen', Moira: 'Moira', Samantha: 'Samantha' };
async function playScript(item, s) {
  if (await playClip(au(item.audio))) return;
  const vmap = {}; for (const v of item.voices || []) vmap[v.role] = v.name;
  for (let i = 0; i < item.script.length; i++) { const l = item.script[i]; await speak(l.text, { voice: VOICE_BY[vmap[l.spk]] || '', keep: i > 0 }); if (!ACT || ACT.s !== s) return; }
}
const mcqOpts = p => { const m = [...String(p).matchAll(/(?:^|\s)([A-D])[.)]\s/g)].map(x => x[1]); return m.length >= 2 ? m : null; };
A.listen = {
  init(opts) {
    const W = WEEK(), items = C.listening.items, parts = opts.part ? [opts.part] : W.n <= 2 ? [1, 2] : W.n <= 4 ? [2, 3] : [3, 4];
    const it = leastUsed(items.filter(x => parts.includes(x.part)).length ? items.filter(x => parts.includes(x.part)) : items);
    if (!it) return { none: true };
    const qs = opts.diag ? it.questions.slice(0, 5) : it.questions, gate = qs.some(q => q.predict && (q.type === 'form' || q.type === 'note'));
    return { it, qs, gate, pred: {}, ph: gate ? 'predict' : 'listen', ans: {}, res: null, played: 0 };
  },
  view(s) {
    if (s.none) return { title: 'Listening', body: '<section class="card"><p>리스닝 콘텐츠가 아직 없어요.</p></section>', foot: { label: '넘어가기', act: 'lDone' } };
    const it = s.it, allPred = s.qs.every(q => !q.predict || s.pred[q.n]), lims = [...new Set(s.qs.map(q => q.limit))], lim1 = lims.length === 1 ? lims[0] : null;
    const qhtml = s.qs.map(q => {
      const r = s.res && s.res[q.n], opts = q.type === 'mcq' && mcqOpts(q.prompt);
      const pred = s.ph === 'predict' && q.predict ? `<div class="wrap pred" role="group" aria-label="${q.n}번 빈칸 유형">${[...predChips(q), { v: 'other' }].map(({ v }) => `<button class="chip" data-act="lPred" data-n="${q.n}" data-v="${v}" aria-pressed="${s.pred[q.n] === v}">${PRED_KO[v]}</button>`).join('')}</div>` : '';
      const inp = s.ph === 'predict' ? '' : opts ? `<div class="wrap">${opts.map(o => `<button class="chip ${r ? (o === q.answer[0] ? 'ok' : s.ans[q.n] === o ? 'no' : '') : ''}" data-act="lMcq" data-n="${q.n}" data-v="${o}" aria-pressed="${s.ans[q.n] === o}" ${r ? 'disabled' : ''}>${o}</button>`).join('')}</div>`
        : `<input class="inp" data-q="${q.n}" value="${esc(s.ans[q.n] || '')}" ${r ? 'readonly' : ''} autocomplete="off" autocapitalize="off" spellcheck="false" lang="en" placeholder="답 (${esc(q.limit || '')})">`;
      const fb = r ? `<p class="${r.ok ? 'ok-t' : 'no-t'}" style="margin:0;font-weight:700">${r.ok ? '정답' : r.tag === 'spelling' ? `거의 맞았어요 · 철자 ${esc(q.answer[0])}` : r.tag === 'wordlimit' ? `단어 수 초과 · 정답 ${esc(q.answer[0])}` : r.tag === 'plural' ? `단·복수 · 정답 ${esc(q.answer[0])}` : `정답 ${esc(q.answer[0])}`}${s.pred[q.n] && q.predict ? `, 예측 ${s.pred[q.n] === q.predict ? '맞음' : '다름'}` : ''}</p>${q.predict && (predChips(q).find(x => x.v === q.predict) || {}).why ? `<p class="cap">예측 단서: ${esc(predChips(q).find(x => x.v === q.predict).why)} → ${PRED_KO[q.predict]}</p>` : ''}${q.trap_ko ? `<p class="cap">${esc(q.trap_ko)}</p>` : ''}` : '';
      return `<div class="q"><span><b class="num">${q.n}.</b> <span lang="en">${esc(q.prompt)}</span>${q.limit && q.limit !== lim1 ? ` <span class="cap">${esc(q.limit)}</span>` : ''}</span>${pred}${inp}${fb}</div>`;
    }).join('');
    const clue = t => { let h = esc(t); const words = s.qs.flatMap(q => q.answer).filter(w => w && w.length > 2); for (const w of words) h = h.replace(new RegExp(`\\b(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi'), '<mark>$1</mark>'); return h.replace(/\b(a|an|by|per month|per|actually|sorry|make that)\b/gi, '<b>$1</b>'); };
    const script = s.res ? `<section class="card pane"><h2 class="h3">스크립트 · 단서 단어</h2><div class="stack en" lang="en">${it.script.map(l => `<p style="margin:0"><span class="cap">${esc(l.spk)}</span> ${clue(l.text)}</p>`).join('')}</div></section>` : '';
    const head = `<section class="card pane"><div class="row" style="min-height:0"><h2 class="h2 grow" lang="en">${esc(it.title)}</h2>${pill('Part ' + it.part)}</div>
      ${lim1 ? `<p class="cap">모든 빈칸: <b lang="en">${esc(lim1)}</b></p>` : ''}${s.ph === 'predict' ? '<p class="cap">빈칸 앞뒤 단서를 보고 들어갈 말의 종류를 골라요. 모두 고르면 재생이 열려요.</p>' : `<p class="cap">${s.res ? `${Object.values(s.res).filter(r => r.ok).length} / ${s.qs.length} 정답` : '들으면서 답을 써요. 재생은 두 번까지.'}</p>`}
      ${s.ph !== 'predict' ? btn(`재생 ${s.played}/2`, 'lPlay', { cls: 'line block', icon: 'play', dis: s.played >= 2 }) : ''}
      <div class="qs">${qhtml}</div></section>`;
    const foot = s.ph === 'predict' ? { label: '예측 완료 · 듣기로', act: 'lGate', dis: !allPred } : s.res ? { label: '완료', act: 'lDone', icon: 'check' } : { label: '채점', act: 'lCheck' };
    const guide = `<section class="card"><div class="row" style="min-height:0"><h2 class="h3 grow">빈칸 단서 읽는 법</h2>${lim1 ? pill(esc(lim1)) : ''}</div><div class="tiles" style="--tw:240px">${CLUES.map(([, v, why]) => `<div class="row" style="padding:6px 0;min-height:44px">${pill(PRED_KO[v], 'pri')}<span class="grow cap">${why}</span></div>`).join('')}</div></section>`;
    return { title: 'Listening', body: head + script, side: guide, errTypes: ['spelling', 'wordlimit', 'plural', 'number'], split: !!s.res, foot, keepScroll: true };
  },
  acts: {
    lPred: (s, e) => { s.pred[e.dataset.n] = e.dataset.v; draw(); },
    lGate: s => { s.ph = 'listen'; draw(); },
    lPlay: s => { if (s.ph === 'predict' || s.played >= 2) return; s.played++; draw(); playScript(s.it, s); },
    lMcq: (s, e) => { s.ans[e.dataset.n] = e.dataset.v; draw(); },
    lCheck: s => {
      $$('[data-q]').forEach(i => { s.ans[i.dataset.q] = i.value; });
      s.res = {}; let c = 0, pc = 0, pt = 0; const att = addAttempt({ skill: 'L', kind: 'form', ref: s.it.id, meta: { part: s.it.part } });
      for (const q of s.qs) {
        const r = S.checkAnswer(s.ans[q.n] || '', q, q.limit); s.res[q.n] = r; if (r.ok) c++;
        if (q.predict && s.pred[q.n]) { pt++; if (s.pred[q.n] === q.predict) pc++; }
        if (!r.ok && (s.ans[q.n] || '').trim()) logErr(r.tag && r.tag !== 'blank' ? r.tag : 'other', s.ans[q.n], q.answer[0], q.trap_ko || '', att.id);
      }
      att.score = { c, t: s.qs.length }; att.meta.pred = { c: pc, t: pt }; s.xp = gain(XP.lr * s.qs.length); save(); stopAudio(); draw();
    },
    lDone: s => finish({ xp: s.xp, credit: !s.none })
  }
};

/* ---------- dictation: 5 sentences, 2 plays, 0.8×/1.0×, word diff ---------- */
const DICT_FOCUS = { number: '숫자', spelling: '철자', date: '날짜', money: '금액', linking: '연음' };
const DICT_TIP = { number: '숫자는 아라비아 숫자로 써요.', spelling: '철자를 불러 주면 글자 그대로 써요.', date: '날짜는 21 March 처럼 써요.', money: '금액은 12.50 처럼 써요.', linking: '붙어서 들리는 말(want to, going to)도 원래 단어로 풀어 써요.' };
A.dict = {
  init() { const all = C.dictation.items; if (!all.length) return { none: true }; const i0 = DB.flags.dictIdx || 0; return { items: [0, 1, 2, 3, 4].map(k => all[(i0 + k) % all.length]).filter((x, i, a) => a.indexOf(x) === i), i: 0, plays: 0, rate: 1, done: [], xp: 0 }; },
  view(s) {
    if (s.none) return { title: '받아쓰기', body: '<section class="card"><p>받아쓰기 문장이 아직 없어요.</p></section>', foot: { label: '넘어가기', act: 'dDone' } };
    const it = s.items[s.i], r = s.done[s.i];
    return { title: '받아쓰기', errTypes: ['number', 'spelling', 'article', 'plural'], labels: s.items.map((x, j) => s.done[j] ? `<span lang="en">${esc(x.text)}</span>` : esc(DICT_FOCUS[x.focus] || '받아쓰기')),
      side: `<section class="card"><h2 class="h3">받아쓰기 규칙</h2><div class="tiles" style="--tw:260px">${Object.entries(DICT_TIP).map(([t, tip]) => `<div class="row" style="align-items:flex-start;padding:8px 0;min-height:44px">${pill(DICT_FOCUS[t], t === it.focus ? 'pri' : '')}<span class="grow cap">${tip}</span></div>`).join('')}</div></section>`,
      res: { total: s.items.length, list: s.done.filter(Boolean).map(d => ({ ok: d.ok })) }, body: `<section class="card task"><div class="t-top"><span class="cap num">${s.i + 1} / ${s.items.length}</span>${pill(esc(DICT_FOCUS[it.focus] || '받아쓰기'), 'pri')}</div>
      <div class="row"><div class="seg grow">${[[.8, '0.8×'], [1, '1.0×']].map(([v, l]) => `<button data-act="dRate" data-v="${v}" aria-pressed="${s.rate === v}">${l}</button>`).join('')}</div>${btn(`듣기 ${s.plays}/2`, 'dPlay', { cls: 'line', icon: 'volume-2', dis: s.plays >= 2 })}</div>
      <textarea class="inp dict" id="dIn" lang="en" autocapitalize="off" spellcheck="false" placeholder="들은 문장을 그대로 써요" ${r ? 'readonly' : ''}>${esc(r ? r.typed : '')}</textarea>
      ${r ? `<div class="t-bot stack"><p class="en diff" lang="en">${r.ops.map(o => `<span class="${o.t}">${esc(o.w)}</span>`).join(' ')}</p><p class="${r.ok ? 'ok-t' : 'no-t'}" style="font-weight:700">${r.ok ? '완벽해요' : '빠진 말은 줄이 그어진 부분이에요' + (r.tags.length ? ': ' + r.tags.map(t => ERR_KO[t]).join(', ') : '')}</p></div>` : `<p class="basis t-bot"><b>이 문장의 초점: ${esc(DICT_FOCUS[it.focus] || '받아쓰기')}</b> ${DICT_TIP[it.focus] || ''} 두 번까지 들을 수 있어요.</p>`}</section>`,
      foot: r ? { label: s.i + 1 < s.items.length ? '다음 문장' : '완료', act: 'dNext' } : { label: '확인', act: 'dCheck' } };
  },
  acts: {
    dRate: (s, e) => { s.rate = +e.dataset.v; draw(); },
    dPlay: async s => { if (s.plays >= 2) return; s.plays++; draw(); const it = s.items[s.i]; if (!await playClip(au(it.audio), { rate: s.rate })) speak(it.text, { rate: s.rate }); },
    dCheck: s => {
      const it = s.items[s.i], typed = $('#dIn').value, ops = S.diffWords(it.text, typed), ok = ops.every(o => o.t === 'eq'), tags = new Set();
      ops.forEach((o, j) => { if (o.t !== 'del') return; const w = o.w.toLowerCase().replace(/[^\w]/g, ''), ins = (ops[j + 1] && ops[j + 1].t === 'ins' ? ops[j + 1].w : ops[j - 1] && ops[j - 1].t === 'ins' ? ops[j - 1].w : '').toLowerCase().replace(/[^\w]/g, '');
        tags.add(/^\d/.test(w) || S.canon(w) !== w ? 'number' : /^(a|an|the)$/.test(w) ? 'article' : ins && (ins + 's' === w || w + 's' === ins) ? 'plural' : 'spelling'); });
      s.done[s.i] = { typed, ops, ok, tags: [...tags] };
      for (const t of tags) logErr(t, typed, it.text, '받아쓰기');
      s.xp += gain(XP.dict) || 0; save(); draw();
    },
    dNext: s => { if (s.i + 1 < s.items.length) { s.i++; s.plays = 0; return draw(); }
      DB.flags.dictIdx = ((DB.flags.dictIdx || 0) + s.items.length) % C.dictation.items.length;
      addAttempt({ skill: 'L', kind: 'dict', ref: s.items[0].id, meta: { sent: { c: s.done.filter(d => d.ok).length, t: s.items.length } } }); save(); finish({ xp: s.xp }); },
    dDone: () => finish({ credit: false })
  }
};

/* ---------- spelling & number drill (generated, unlimited) ---------- */
const NAMES = ['Gheeson', 'Whitfield', 'Jagger', 'Rees', 'Ibbotson', 'Yeats', 'Agnew', 'Kearney', 'Haddow', 'Eggleton'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const NW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const nw = n => n < 20 ? NW[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + NW[n % 10] : '');
const ORD = n => ({ 1: 'first', 2: 'second', 3: 'third', 5: 'fifth', 8: 'eighth', 9: 'ninth', 12: 'twelfth', 20: 'twentieth', 30: 'thirtieth' }[n] || (n > 20 && n % 10 ? TENS[Math.floor(n / 10)] + '-' + ({ 1: 'first', 2: 'second', 3: 'third', 5: 'fifth', 8: 'eighth', 9: 'ninth' }[n % 10] || NW[n % 10] + 'th') : nw(n) + 'th'));
const spellOut = w => { const L = w.toUpperCase().split(''), out = []; for (let i = 0; i < L.length; i++) { if (L[i] === L[i + 1]) { out.push('double ' + L[i]); i++; } else out.push(L[i]); } return out.join(', '); };
const digitsOut = d => { const out = []; for (let i = 0; i < d.length; i++) { const w = d[i] === '0' ? 'oh' : NW[+d[i]]; if (d[i] === d[i + 1]) { out.push('double ' + w); i++; } else out.push(w); } return out.join(', '); };
function drillItem() {
  const t = pick(['name', 'phone', 'date', 'money', 'teen']);
  if (t === 'name') { const w = pick(NAMES); return { t, say: `The name is ${w}. ${spellOut(w)}.`, key: w, hint: '이름 철자' }; }
  if (t === 'phone') { const d = '07' + Array.from({ length: 9 }, () => pick('0123456789'.split('').concat(['5', '5', '0']))).join(''); return { t, say: `My number is ${digitsOut(d)}.`, key: d, hint: '전화번호 (숫자만)' }; }
  if (t === 'date') { const n = 1 + Math.floor(Math.random() * 30), m = pick(MONTHS); return { t, say: `The course starts on the ${ORD(n)} of ${m}.`, key: `${n} ${m}`, hint: '날짜 (예: 21 March)' }; }
  if (t === 'money') { const p = 5 + Math.floor(Math.random() * 90), c = pick([0, 20, 50, 75, 99]); return { t, say: `It costs ${nw(p)} pounds${c ? ' ' + nw(c) : ''}.`, key: `${p}.${String(c).padStart(2, '0')}`, hint: '금액 (예: 12.50)' }; }
  const b = 3 + Math.floor(Math.random() * 7), teen = Math.random() < .5, n = teen ? 10 + b : b * 10; return { t, say: `The room number is ${nw(n)}.`, key: String(n), hint: '숫자 (13과 30처럼 강세 구분)' };
}
const DRILL_TIP = { name: '"double L"은 LL, 비슷한 소리 B/V, M/N, A/E/I 에 주의해요. 대문자는 상관없어요.', phone: '숫자만 써요. "oh"는 0, "double five"는 55, "triple one"은 111이에요.', date: '"the twenty-first of March"는 21 March 처럼 숫자와 달 이름으로 써요.', money: '"twelve pounds fifty"는 12.50 처럼 점으로 써요. £ 기호는 없어도 돼요.', teen: 'thirTEEN 처럼 -teen 은 뒤에, THIRty 처럼 -ty 는 앞에 강세가 와요.' };
function drillOk(it, v) {
  const x = String(v).toLowerCase().replace(/[£,\s]/g, '');
  if (it.t === 'date') { const [n, m] = it.key.split(' '), num = (String(v).match(/\d+/) || [''])[0], mon = MONTHS.find(M => String(v).toLowerCase().includes(M.toLowerCase().slice(0, 3))); return num === n && mon === m; }
  if (it.t === 'money') return x === it.key || x === it.key.replace(/\.00$/, '');
  return x === it.key.toLowerCase();
}
A.drill = {
  init() { return { items: Array.from({ length: 10 }, drillItem), i: 0, res: [], xp: 0 }; },
  view(s) {
    const it = s.items[s.i], r = s.res[s.i];
    return { title: '철자·숫자 드릴', errTypes: ['spelling', 'number'], labels: s.items.map((x, j) => s.res[j] ? `${esc(x.hint)} · <b lang="en">${esc(x.key)}</b>` : esc(x.hint)),
      side: `<section class="card"><h2 class="h3">들을 때 규칙</h2><div class="tiles" style="--tw:260px">${Object.entries(DRILL_TIP).map(([t, tip]) => `<div class="row" style="align-items:flex-start;padding:8px 0;min-height:44px">${pill({ name: '이름', phone: '전화', date: '날짜', money: '금액', teen: '숫자' }[t], t === it.t ? 'pri' : '')}<span class="grow cap">${tip}</span></div>`).join('')}</div></section>`,
      res: { total: s.items.length, list: s.res.filter(Boolean).map(x => ({ ok: x.ok })) }, body: `<section class="card task"><div class="t-top"><span class="cap num">${s.i + 1} / ${s.items.length}, 정답 ${s.res.filter(x => x && x.ok).length}</span>${pill(it.hint, 'pri')}</div>
      <div class="fc-mid">${btn('다시 듣기', 'drPlay', { cls: 'line', icon: 'volume-2' })}
      <input class="inp big-inp" id="drIn" lang="en" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="들은 대로" value="${esc(r ? r.v : '')}" ${r ? 'readonly' : ''}></div>
      ${r ? `<div class="t-bot stack"><p class="${r.ok ? 'ok-t' : 'no-t'}" style="font-weight:700">${r.ok ? '정답' : '정답 ' + esc(it.key)}</p><p class="cap" lang="en">${esc(it.say)}</p></div>` : `<p class="basis t-bot"><b>들을 때 규칙</b> ${DRILL_TIP[it.t]}</p>`}</section>`,
      foot: r ? { label: s.i + 1 < s.items.length ? '다음' : '완료', act: 'drNext' } : { label: '확인', act: 'drCheck' } };
  },
  after(s) { if (!s.res[s.i] && !s.spoke) { s.spoke = 1; speak(s.items[s.i].say, { rate: .95 }); } },
  acts: {
    drPlay: s => speak(s.items[s.i].say, { rate: .95 }),
    drCheck: s => { const v = $('#drIn').value, ok = drillOk(s.items[s.i], v); s.res[s.i] = { v, ok }; if (!ok && v.trim()) logErr(s.items[s.i].t === 'name' ? 'spelling' : 'number', v, s.items[s.i].key, '철자·숫자 드릴'); if (ok) s.xp += gain(1) || 0; save(); draw(); },
    drNext: s => { if (s.i + 1 < s.items.length) { s.i++; s.spoke = 0; return draw(); } addAttempt({ skill: 'L', kind: 'form', ref: 'drill', meta: { drill: { c: s.res.filter(x => x.ok).length, t: s.items.length } } }); save(); finish({ xp: s.xp }); }
  }
};

/* ================= Reading ================= */
const CAUSE = [['reading-ng', 'FALSE와 NG 혼동'], ['reading-qual', 'some/all 한정어 함정'], ['reading-bg', '배경지식을 끌어옴'], ['reading-find', '근거를 못 찾음']];
const romanOf = h => String(h).trim().split(/\s+/)[0];
A.read = {
  init(opts) {
    const W = WEEK(), items = C.reading.items.filter(x => !opts.len || x.len === opts.len);
    const it = leastUsed(items.length ? items : C.reading.items); if (!it) return { none: true };
    const qs = opts.diag ? it.questions.filter(q => q.type === 'tfng').slice(0, 6) : it.questions;
    const timed = opts.timed != null ? opts.timed : opts.minutes ? true : W.n >= 3;
    return { it, qs, ans: {}, cause: {}, timed, mins: opts.minutes || it.minutes || 20, t0: Date.now(), qT: Date.now(), tab: 'p', hl: null };
  },
  view(s) {
    if (s.none) return { title: 'Reading', body: '<section class="card"><p>리딩 지문이 아직 없어요.</p></section>', foot: { label: '넘어가기', act: 'rdDone' } };
    const it = s.it, left = s.mins * 60000 - (Date.now() - s.t0);
    const paras = it.paras.map(p => { let t = esc(p.text); if (s.hl && s.hl.para === p.label && s.hl.quote) { const q = esc(s.hl.quote); t = t.includes(q) ? t.replace(q, `<mark id="ev">${q}</mark>`) : `<mark id="ev">${t}</mark>`; } return `<p><span class="lab">${esc(p.label)}</span>${t}</p>`; }).join('');
    const H = it.headings || [];
    const qhtml = s.qs.map(q => {
      const a = s.ans[q.n], ok = a != null && String(a) === String(q.answer);
      if (q.type === 'heading') return `<div class="q" id="q${q.n}"><span><b class="num">${q.n}.</b> 단락 <b>${esc(q.para)}</b>의 제목</span><select class="inp" data-act="rdHead" data-n="${q.n}" ${a != null ? 'disabled' : ''}><option value="">고르기</option>${H.map(h => `<option value="${esc(romanOf(h))}" ${a === romanOf(h) ? 'selected' : ''}>${esc(h)}</option>`).join('')}</select>${a != null ? `<p class="${ok ? 'ok-t' : 'no-t'}" style="margin:0;font-weight:700">${ok ? '정답' : '정답 ' + esc(q.answer)}</p>${ok ? '' : `<p class="cap">${esc(q.why_ko)}</p>`}` : ''}</div>`;
      return `<div class="q" id="q${q.n}"><span><b class="num">${q.n}.</b> <span lang="en">${esc(q.stmt)}</span></span><div class="wrap">${['TRUE', 'FALSE', 'NOT GIVEN'].map(v => `<button class="chip ${a != null ? (v === q.answer ? 'ok' : a === v ? 'no' : '') : ''}" data-act="rdTf" data-n="${q.n}" data-v="${v}" ${a != null ? 'disabled' : ''}>${v}</button>`).join('')}</div>
        ${a != null ? `<p class="${ok ? 'ok-t' : 'no-t'}" style="margin:0;font-weight:700">${ok ? '정답' : '정답 ' + q.answer}</p><p class="cap">${esc(q.why_ko)}</p><button class="linkbtn ev-link" data-act="rdEv" data-n="${q.n}">${ico('eye', 's16')}근거 보기</button>${ok ? '' : `<div class="wrap" role="group" aria-label="틀린 이유">${CAUSE.map(([t, l]) => `<button class="chip" data-act="rdCause" data-n="${q.n}" data-v="${t}" aria-pressed="${s.cause[q.n] === t}">${l}</button>`).join('')}</div>`}` : ''}</div>`;
    }).join('');
    const done = s.qs.filter(q => s.ans[q.n] != null).length;
    const tabs = `<div class="seg phonetabs full" role="tablist">${[['p', '지문'], ['q', `문항 ${done}/${s.qs.length}`]].map(([k, l]) => `<button data-act="rdTab" data-v="${k}" aria-pressed="${s.tab === k}">${l}</button>`).join('')}</div>`;
    const body = `${tabs}<section class="card pane passage" data-hide="${s.tab === 'q' ? 1 : 0}"><div class="row" style="min-height:0"><h2 class="h2 grow" lang="en">${esc(it.title)}</h2>${pill(it.len === 'long' ? '긴 지문' : '짧은 지문')}</div><div class="en en-measure" lang="en">${paras}</div></section>
      <section class="card pane" data-hide="${s.tab === 'p' ? 1 : 0}"><div class="row" style="min-height:0"><h2 class="h2 grow">문항</h2><button class="chip" data-act="rdTimed" aria-pressed="${s.timed}">${ico('timer', 's16')}${s.timed ? '시간 재는 중' : '시간 재기'}</button><button class="chip" id="skipChip" data-act="rdSkip" hidden>넘어가기</button></div>${H.length ? `<details><summary class="cap" style="min-height:44px;display:flex;align-items:center">제목 목록 ${H.length}개</summary><ul class="cap" lang="en" style="margin:0;padding-left:18px">${H.map(h => `<li>${esc(h)}</li>`).join('')}</ul></details>` : ''}${qhtml}</section>`;
    return { title: 'Reading', clock: s.timed ? mmss(left) : '', split: true, body, foot: { label: done === s.qs.length ? '완료' : `끝내기 (${done}/${s.qs.length})`, act: 'rdDone' }, keepScroll: true };
  },
  after(s) {
    if (s.ticking || s.none) return; s.ticking = 1;
    every(1000, () => { const c = $('#stClock'); if (s.timed && c) { const left = s.mins * 60000 - (Date.now() - s.t0); c.textContent = mmss(left); if (left <= 0 && !s.over) { s.over = 1; toast('시간이 끝났어요. 남은 문항은 넘어가도 돼요'); } }
      const k = $('#skipChip'); if (k) k.hidden = !(Date.now() - s.qT > 90000 && s.qs.some(q => s.ans[q.n] == null)); });
  },
  acts: {
    rdTab: (s, e) => { s.tab = e.dataset.v; draw(); },
    rdTimed: s => { s.timed = !s.timed; s.t0 = Date.now(); draw(); },
    rdTf: (s, e) => { const q = s.qs.find(x => x.n == e.dataset.n); s.ans[q.n] = e.dataset.v; s.qT = Date.now(); s.hl = q.evidence || null; s.xp = (s.xp || 0) + (gain(XP.lr) || 0); draw(); const m = $('#ev'); m && m.scrollIntoView({ block: 'center' }); },
    rdHead: (s, e) => { if (!e.value) return; const q = s.qs.find(x => x.n == e.dataset.n); s.ans[q.n] = e.value; s.qT = Date.now(); s.hl = { para: q.para, quote: '' }; s.xp = (s.xp || 0) + (gain(XP.lr) || 0); draw(); },
    rdEv: (s, e) => { const q = s.qs.find(x => x.n == e.dataset.n); s.hl = q.evidence; s.tab = 'p'; draw(); const m = $('#ev'); m && m.scrollIntoView({ block: 'center' }); },
    rdCause: (s, e) => { const n = e.dataset.n, q = s.qs.find(x => x.n == n); if (!s.cause[n]) logErr(e.dataset.v, `${q.stmt} → ${s.ans[n]}`, q.answer, q.why_ko); s.cause[n] = e.dataset.v; save(); draw(); },
    rdSkip: s => { const q = s.qs.find(x => s.ans[x.n] == null); s.qT = Date.now(); const el = q && $('#q' + q.n); el && el.scrollIntoView({ block: 'center' }); },
    rdDone: s => {
      if (s.none) return finish({ credit: false });
      const by = {}; for (const q of s.qs) { if (s.ans[q.n] == null) continue; const k = q.type === 'heading' ? 'heading' : 'tfng'; by[k] = by[k] || { c: 0, t: 0 }; by[k].t++; if (String(s.ans[q.n]) === String(q.answer)) by[k].c++; }
      const c = Object.values(by).reduce((a, x) => a + x.c, 0), t = Object.values(by).reduce((a, x) => a + x.t, 0);
      if (t) addAttempt({ skill: 'R', kind: by.heading ? 'head' : 'tfng', ref: s.it.id, score: { c, t }, timed: s.timed, secs: Math.round((Date.now() - s.t0) / 1000), meta: { by } });
      save(); finish({ xp: s.xp, credit: t > 0 });
    }
  }
};

/* ================= Grammar ================= */
const gnorm = s => S.canon(s).replace(/[^\w'\s—-]/g, '').replace(/\s+/g, ' ').trim();
A.quiz = {
  init(opts) {
    const k = today(), W = WEEK(), from = addDays(k, -14), cnt = {}; for (const e of DB.errors) if (dayKey(new Date(e.ts)) >= from) cnt[e.type] = (cnt[e.type] || 0) + 1;
    const focus = S.focusType(PLAN(), k, DB.errors, focusOv(k));
    const learned = opts.type ? [opts.type] : [...new Set([...S.learnedTypes(W.n), focus])];
    return { qs: S.pickQuiz(C.grammar.items, cnt, learned, opts.type || focus, Math.random, opts.n || 5), i: 0, res: [], focus, xp: 0, type: opts.type };
  },
  view(s) {
    const q = s.qs[s.i]; if (!q) return { title: '오류 퀴즈', body: '<section class="card"><p>문법 문항이 아직 없어요.</p></section>', foot: { label: '넘어가기', act: 'gDone' } };
    const r = s.res[s.i], lab = { mcq: '고르기', cloze: '빈칸', fix: '고쳐 쓰기', ko2en: '영어로' }[q.kind];
    return { title: s.type ? `1분 교정: ${ERR_KO[s.type]}` : '오류 퀴즈', tip: false, errTypes: s.type ? [s.type] : S.GRAM_TYPES, labels: s.qs.map((x, j) => s.res[j] ? `${esc(ERR_KO[x.type])} · <b lang="en">${esc(x.answer)}</b>` : `${esc(ERR_KO[x.type])} · ${{ mcq: '고르기', cloze: '빈칸', fix: '고쳐 쓰기', ko2en: '영어로' }[x.kind]}`), res: { total: s.qs.length, list: s.res.filter(Boolean).map(x => ({ ok: x.ok })) }, body: `<section class="card task"><div class="t-top"><span class="cap num">${s.i + 1} / ${s.qs.length}</span>${pill(ERR_KO[q.type], 'pri')}${pill(lab)}</div>
      <p class="en q-big" ${q.kind === 'ko2en' ? '' : 'lang="en"'}>${esc(q.kind === 'ko2en' ? (q.prompt_ko || q.prompt) : q.prompt)}</p>
      ${q.kind === 'mcq' ? `<div class="wrap">${q.options.map(o => `<button class="chip ${r ? (gnorm(o) === gnorm(q.answer) ? 'ok' : r.v === o ? 'no' : '') : ''}" data-act="gSel" data-v="${esc(o)}" aria-pressed="${s.sel === o}" ${r ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>`
        : `<input class="inp" id="gIn" lang="en" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(r ? r.v : q.kind === 'fix' ? q.prompt : '')}" ${r ? 'readonly' : ''}>`}
      ${r ? `<div class="t-bot stack"><p class="${r.ok ? 'ok-t' : 'no-t'}" style="font-weight:700">${r.ok ? '정답' : '정답: ' + esc(q.answer)}</p><p class="cap">${esc(q.why_ko)}</p></div>` : `<p class="basis t-bot"><b>${ERR_KO[q.type]} 규칙</b> ${esc(GRAM_TIP[q.type] || '')} ${{ mcq: '하나를 골라요.', cloze: '빈칸에 들어갈 말을 영어로 써요.', fix: '틀린 곳을 고쳐 문장 전체를 써요.', ko2en: '한국어 문장을 영어로 써요.' }[q.kind] || ''}</p>`}</section>`,
      foot: r ? { label: s.i + 1 < s.qs.length ? '다음' : '완료', act: 'gNext' } : q.kind === 'mcq' ? { label: '확인', act: 'gPick', dis: !s.sel, x: `data-v="${esc(s.sel || '')}"` } : { label: '확인', act: 'gCheck' }, alt: r || q.kind !== 'mcq' ? undefined : { label: '모르겠어요', act: 'gUnk' } };
  },
  acts: {
    gSel: (s, e) => { s.sel = e.dataset.v; draw(); }, gPick: s => A.quiz.grade(s, s.sel || ''), gUnk: s => A.quiz.grade(s, ''),
    gCheck: s => A.quiz.grade(s, $('#gIn').value),
    gNext: s => { s.sel = null; if (s.i + 1 < s.qs.length) { s.i++; return draw(); } addAttempt({ skill: 'G', kind: 'quiz', ref: s.qs.map(q => q.id).join(','), score: { c: s.res.filter(r => r.ok).length, t: s.qs.length } }); save(); finish({ xp: s.xp }); },
    gDone: () => finish({ credit: false })
  },
  grade(s, v) { const q = s.qs[s.i], ok = !!v && gnorm(v) === gnorm(q.answer); s.res[s.i] = { v, ok }; if (!ok) logErr(q.type, v || '(모름)', q.answer, q.why_ko); else s.xp += gain(2) || 0; save(); draw(); }
};

/* ---------- 1005 발음 점수 (Saylo식): Gemini hears the take, the app counts the words it found against the script ---------- */
async function shadowGrade(s, key, text) {
  const r = s[key]; if (!r || s.grading) return;
  if (!G.getKey()) return toast('제미나이 키가 없어요. 설정에서 넣으면 발음 점수가 나와요. 녹음은 저장돼 있어요', 'warn', 4500);
  s.grading = true; draw();
  try {
    const res = await G.grade(DB, save, [{ inline_data: { mime_type: r.mime, data: await REC.blobToB64(r.blob) } }, { text: G.shadowPrompt(text) }], S.normShadow, sec => toast(`잠시 뒤 차례로 채점해요 · ${sec}초`, '', 4000));
    if (!ACT || ACT.s !== s || s[key] !== r) return;   // closed, or re-recorded while scoring: this score belongs to no take on screen
    const prev = DB.attempts.filter(a => a.kind === 'shadow' && a.meta && a.meta.acc != null).slice(-1)[0];
    s.score = { ...res, ...S.shadowAcc(text, res.transcript), prev: prev ? prev.meta.acc : null };
    addAttempt({ skill: 'S', kind: 'shadow', ref: s.c.id, secs: Math.round(r.ms / 1000), meta: { acc: s.score.acc, rhythm: s.score.rhythm } }); s.savedFor = r.id; save();   // on the chart even if the player is closed with X
    REC.markGraded(r.id).catch(() => {});
  } catch (e) { toast(e.message || '점수를 내지 못했어요. 녹음은 저장돼 있어요', 'warn', 5000); }
  finally { s.grading = false; if (ACT && ACT.s === s) draw(); }
}
const shadowScore = sc => { const d = sc.prev == null ? null : sc.acc - sc.prev, miss = sc.ops.filter(o => o.t === 'del').length;
  return `<section class="card side reveal" aria-labelledby="scTitle"><p class="sr" role="status">발음 점수 ${sc.acc}%</p><div class="row" style="min-height:0"><h2 class="h2 grow" id="scTitle">발음 점수</h2><span class="big num">${sc.acc}%</span></div>
    <p class="en sh-ops" lang="en">${sc.ops.filter(o => o.t !== 'ins').map(o => o.t === 'eq' ? esc(o.w) : `<mark>${esc(o.w)}<span class="sr"> (안 들림)</span></mark>`).join(' ')}</p>
    <p class="cap">${miss ? `밑줄 친 ${miss}단어가 들리지 않았어요. 그 부분만 다시 따라 해 보세요.` : '모든 단어가 들렸어요.'}</p>
    <div class="metrics"><div><span class="cap">리듬·강세</span><b class="num">${sc.rhythm}<small>/100</small></b></div>${d == null ? '' : `<div><span class="cap">지난번보다</span><b class="num ${d >= 0 ? 'ok-t' : 'no-t'}">${d >= 0 ? '↑ ' + d : '↓ ' + -d}</b></div>`}</div>
    ${sc.notes_ko.length ? `<ul class="cap bul">${sc.notes_ko.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}</section>`; };

/* ---------- 1005 AI 대화 3턴 (Lucida식): Lucy asks a Part 3 question aloud → I answer by voice → ≤2 fixes in Korean, one 6.5 sentence, her follow-up ---------- */
A.talk = {
  init() { const q = leastUsed(C.p3); return q ? { q, ref: q.id, cur: q.q, turns: [] } : { none: true }; },
  view(s) {
    if (s.none) return { title: 'AI 대화', body: '<section class="card"><p>대화 질문이 아직 없어요.</p></section>', foot: { label: '넘어가기', act: 'tkDone' } };
    if (!G.getKey()) return { title: 'AI 대화 3턴', body: `<section class="card task"><h2 class="h2">AI 대화는 제미나이 키가 있어야 해요</h2><p>Lucy가 내 답을 듣고 고쳐 주려면 무료 제미나이 키가 필요해요. 설정에서 한 번 넣으면 계속 써요.</p></section>`,
      foot: { label: '키 넣으러 가기', act: 'aiOn', icon: 'settings' }, noStrip: true };
    const n = s.turns.length, key = 'ra' + n, done = n >= 3, pend = s[key];
    const lucy = (t, i) => `<div class="tk-l"><div class="tk-hd"><span class="tk-who">Lucy</span><button class="btn icon ghost sm" data-act="tkSay" data-i="${i}" aria-label="Lucy 말 다시 듣기">${ico('volume-2')}</button></div><p lang="en">${esc(t)}</p></div>`;
    const turn = (t, i) => `${lucy(t.q, i)}<div class="tk-me"><span class="sr">나:</span><p lang="en">${esc(t.transcript)}</p>${t.fixes.map(f => `<p class="cap tk-fix"><span><s class="faint" lang="en">${esc(f.wrong)}</s> → <b lang="en">${esc(f.right)}</b></span>${f.why_ko ? `<span>${esc(f.why_ko)}</span>` : ''}</p>`).join('')}
      ${t.better ? `<p class="tk-better"><span class="cap">이렇게 말하면 6.5</span><span lang="en">${esc(t.better)}</span></p>` : ''}</div>`;
    const wait = pend && !s.recOn ? `<div class="tk-me"><span class="sr">나:</span><p class="mut">${s.grading ? '보냈어요. Lucy가 듣는 중…' : '녹음했어요. 아직 Lucy에게 전달되지 않았어요.'}</p>${s.grading ? '' : '<button class="linkbtn" data-act="tkRec">다시 녹음</button>'}</div>${s.grading ? '<div class="tk-l tk-dots" aria-hidden="true"><i></i><i></i><i></i></div>' : ''}` : '';
    const log = `<section class="card task flow tk" role="log" aria-live="polite"><div class="row" style="min-height:0">${pill('Part 3 대화', 'pri')}<span class="cap grow">${done ? '대화 끝' : `답 ${n + 1}/3`}</span></div>
      ${s.turns.map(turn).join('')}${done ? (s.closing ? lucy(s.closing, 3) : '') : lucy(s.cur, n) + wait}</section>`;
    const bands = s.turns.map(t => t.band).filter(Boolean), avg = bands.length ? S.roundBand(bands.reduce((a, b) => a + b, 0) / bands.length) : null;
    const end = done ? `<section class="card side reveal"><div class="row" style="min-height:0"><h2 class="h2 grow">오늘 대화</h2>${avg ? `<span class="big num">${avg.toFixed(1)}</span><span class="cap">대략</span>` : ''}</div>
      <p class="cap">고칠 것 ${s.turns.reduce((a, t) => a + t.fixes.length, 0)}개는 오늘의 약점과 오류 카드에 넣었어요.</p>
      ${s.shadowId ? `<p class="cap ok-t">${ico('circle-check', 's16')} 6.5 문장을 섀도잉 스튜디오에 넣었어요</p>` : btn('6.5 문장 섀도잉에 넣기', 'tkShadow', { cls: 'line block', icon: 'repeat' })}</section>` : '';
    const tips = `<section class="card side"><h3 class="h3">답이 길어지는 순서</h3><div class="wrap">${EXPAND.map(([k, e]) => `<span class="pill" lang="en"><b>${k}</b> ${esc(e)}</span>`).join('')}</div><p class="cap">답 하나에 이유 하나, 예시 하나. 20~40초면 충분해요.</p></section>`;
    const rec = done ? '' : recUI(s, key, { maxMs: 60000, label: '질문을 듣고 20~40초로 답해요' });
    const foot = done ? (s.shadowId && !SEQ ? { label: '지금 따라 하기', act: 'tkFollow', icon: 'repeat' } : { label: '완료', act: 'tkDone', icon: 'check' })
      : s.recOn === key ? { label: '답 끝내기', act: 'recStop', icon: 'square' } : pend ? { label: s.grading ? '듣는 중…' : '다시 보내기', act: 'tkSend', icon: 'rotate-ccw', dis: s.grading } : { label: '말하기', act: 'tkRec', icon: 'mic' };
    const alt = s.grading || s.recOn ? null : done ? (s.shadowId && !SEQ ? { label: '완료', act: 'tkDone' } : null) : n || s.recorded ? { label: '여기까지 하기', act: 'tkDone' } : null;
    return { title: 'AI 대화 3턴', body: log + rec + end, side: tips, keepScroll: true, foot, alt: alt || undefined };
  },
  after(s) { if (!s.none && !s.said && G.getKey()) { s.said = 1; speak(s.cur); } const b = $('#stage .st-body'); if (b && (s.turns.length || s.grading) && innerWidth < 700) b.scrollTop = b.scrollHeight; },   // phone: the newest line and the mic stay in view
  acts: {
    tkSay: (s, e) => { const i = +e.dataset.i; speak(i < s.turns.length ? s.turns[i].q : i === 3 ? s.closing : s.cur); },
    tkRec: s => { if (s.grading) return; delete s['ra' + s.turns.length]; recToggle(s, 'ra' + s.turns.length, { maxMs: 60000, onStop: () => { s.recorded = 1; talkGrade(s); } }); },
    tkSend: s => talkGrade(s),
    tkShadow: s => { if (addMyShadow('AI 대화: ' + s.q.q.slice(0, 30), s.turns.map(t => t.better).filter(Boolean).join(' '))) { s.shadowId = DB.myShadow.at(-1).id; draw(); } },
    tkFollow: s => { const id = s.shadowId; talkSave(s); finish({ xp: s.xp }); later(0, () => run('shadow', { id })); },
    tkDone: s => { if (s.grading) return; talkSave(s); finish({ xp: s.xp, credit: s.turns.length > 0 || !!s.recorded }); }   // a recorded answer counts even when Gemini could not reply (no lost day)
  }
};
function talkSave(s) {
  if (s.saved || !(s.turns.length || s.recorded)) return; s.saved = 1;
  const bands = s.turns.map(t => t.band).filter(Boolean);
  addAttempt({ skill: 'S', kind: 'talk', ref: s.ref, words: s.turns.reduce((a, t) => a + wc(t.transcript), 0), secs: Math.round(s.turns.reduce((a, t) => a + (t.ms || 0), 0) / 1000), meta: { turns: s.turns.length, band: bands.length ? bands.reduce((a, b) => a + b, 0) / bands.length : null } });
  save();
}
async function talkGrade(s) {
  const i = s.turns.length, r = s['ra' + i]; if (!r || s.grading) return;
  s.grading = true; draw();
  try {
    const res = await G.grade(DB, save, [{ inline_data: { mime_type: r.mime, data: await REC.blobToB64(r.blob) } }, { text: G.talkPrompt(s.turns, s.cur, i + 1) }], S.normTalk, sec => toast(`잠시 뒤 차례로 들어요 · ${sec}초`, '', 4000));
    if (!ACT || ACT.s !== s || s['ra' + i] !== r) return;   // closed or re-recorded meanwhile: nothing is written
    REC.markGraded(r.id).catch(() => {});
    s.turns.push({ q: s.cur, ...res, ms: r.ms }); delete s['ra' + i];
    for (const f of res.fixes) logErr(f.type, f.wrong, f.right, f.why_ko, 'talk', true);
    if (s.turns.length < 3) s.cur = res.reply; else s.closing = res.reply;
    s.xp = (s.xp || 0) + (gain(XP.recGraded - XP.rec) || 0); save();
    speak(res.reply);
  } catch (e) { toast((e.message || 'Lucy가 답하지 못했어요') + '. 녹음은 그대로 있어요. 다시 보내기를 눌러 주세요', 'warn', 5500); }
  finally { s.grading = false; if (ACT && ACT.s === s) draw(); }
}

/* ================= Speaking ================= */
const CRIT_KO = { TR: '과제 응답', TA: '과제 달성', CC: '일관성·응집성', LR: '어휘', GRA: '문법 범위·정확성', FC: '유창성·일관성', P: '발음' };
const accordion = (criteria, open) => Object.entries(criteria).map(([k, c], i) => `<details class="acc" ${i < +open ? 'open' : ''}><summary><span>${k} · ${CRIT_KO[k] || ''}</span><span class="num">${(c.band - .5).toFixed(1)}–${c.band.toFixed(1)}</span>${ico('chevron-down')}</summary><div>${c.evidence.map(q => `<blockquote lang="en">${esc(q)}</blockquote>`).join('')}${c.fix_ko ? `<p class="cap">${esc(c.fix_ko)}</p>` : ''}</div></details>`).join('');
const errList = errs => errs.length ? `<div class="rowlist">${errs.map(e => `<div class="row" style="align-items:flex-start;padding:8px 0">${pill(ERR_KO[e.type] || e.type)}<span class="grow"><s class="faint" lang="en">${esc(e.wrong)}</s> → <b lang="en">${esc(e.right)}</b>${e.why_ko ? `<br><span class="cap">${esc(e.why_ko)}</span>` : ''}${e.fixed != null ? `<br><span class="${e.fixed ? 'ok-t' : 'no-t'} cap">${e.fixed ? '고쳤어요' : '아직 남아 있어요'}</span>` : ''}</span></div>`).join('')}</div>` : '<p class="cap">표시된 오류가 없어요</p>';
function speakResult(r) {
  const fill = Object.values(r.fillers).reduce((a, b) => a + b, 0);
  return `<section class="card side reveal"><div class="row" style="min-height:0"><h2 class="h2 grow">채점 결과</h2><span class="big num">${(r.overall - .5).toFixed(1)}–${r.overall.toFixed(1)}</span></div>
    <div class="metrics"><div><span class="cap">분당 단어</span><b>${r.wpm}</b></div><div><span class="cap">필러</span><b>${fill}회</b></div><div><span class="cap">긴 멈춤</span><b>${r.long_pauses}회</b></div></div>
    <h3 class="h3">말한 그대로</h3><blockquote lang="en">${esc(r.transcript)}</blockquote>${fill ? `<p class="cap">${Object.entries(r.fillers).map(([k, v]) => `${esc(k)} ${v}`).join(' · ')}</p>` : ''}
    <div>${accordion(r.criteria, true)}</div><h3 class="h3">오류</h3>${errList(r.errors)}${r.pron_notes_ko.length ? `<h3 class="h3">발음 메모</h3><ul class="cap" style="margin:0;padding-left:18px">${r.pron_notes_ko.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
    <h3 class="h3">내 답을 밴드 7로</h3><blockquote lang="en" id="model7">${esc(r.model_answer)}</blockquote>${btn('섀도잉 카드로', 'toShadow', { cls: 'line block', icon: 'repeat', x: 'data-g="1"' })}</section>`;
}
async function gradeSpeech(s, key, part, question, kind) {
  const r = s[key]; if (!r || s.grading) return;
  if (!G.getKey()) return toast('제미나이 키가 없어요. 설정에서 넣으면 채점돼요. 녹음은 저장돼 있어요', 'warn', 4500);
  s.grading = true; draw(); toast('채점하는 중이에요', '', 8000);
  try {
    const b64 = await REC.blobToB64(r.blob);
    const res = await G.grade(DB, save, [{ inline_data: { mime_type: r.mime, data: b64 } }, { text: G.speakingPrompt(part, question) }], G.normSpeaking, sec => toast(`잠시 뒤 차례로 채점해요 · ${sec}초`, '', 4000));
    s.result = res; REC.markGraded(r.id).catch(() => {});
    const att = addAttempt({ skill: 'S', kind, ref: s.ref || '', band: { crit: Object.fromEntries(Object.entries(res.criteria).map(([k, c]) => [k, c.band])), overall: res.overall, lo: res.overall - .5, hi: res.overall }, words: wc(res.transcript), secs: Math.round(r.ms / 1000), meta: { transcript: res.transcript, wpm: res.wpm, fillers: res.fillers, recId: r.id } });
    for (const e of res.errors) logErr(e.type, e.wrong, e.right, e.why_ko, att.id, true);
    s.xp = (s.xp || 0) + (gain(XP.recGraded - XP.rec) || 0); save(); $('#toast').innerHTML = '';
  } catch (e) { toast(e.message || '채점하지 못했어요. 녹음은 저장돼 있어요', 'warn', 5000); }
  finally { s.grading = false; draw(); }
}
const gradeBtn = (s, key) => s[key] && !s.result && !s.recOn ? btn(s.grading ? '채점 중…' : '제미나이로 채점', 'sGrade', { cls: 'line block', icon: 'sparkles', dis: s.grading, x: `data-k="${key}"` }) : '';
/** bundled model answer card (works without a Gemini key): text + "섀도잉 카드로" */
const modelCard = (s, id, text, label = '모범 답') => `<section class="card side"><div class="row" style="min-height:0"><h3 class="h3 grow">${label}</h3>${pill('밴드 7 예시')}</div><p class="en" lang="en">${esc(text)}</p>
  ${(s.shadowed || {})[id] ? `<p class="cap ok-t">${ico('circle-check', 's16')} 섀도잉 스튜디오에 넣었어요</p>` : btn('섀도잉 카드로', 'toShadow', { cls: 'line block', icon: 'repeat', x: `data-id="${esc(id)}"` })}</section>`;
function nextP1() { return leastUsed(C.p1); }
const P1_ROLE = ['답', '이유', '내 예시'];
const P1_STEPS = ['질문을 한국어로 이해', '업그레이드 표현 보기', '한국어를 보고 영어로 말한 다음 공개', '대본 가리기', '느리게, 빠르게 녹음', '모범 답을 섀도잉 카드로'];
const p1Steps = cur => `<section class="card"><h2 class="h3">Part 1 여섯 단계</h2><ol class="tiles" style="--tw:220px;list-style:none;padding:0;margin:0">${P1_STEPS.map((t, i) => `<li class="row" style="min-height:44px"><span class="rc ${i < cur ? 'ok' : i === cur ? 'cur' : ''}">${i < cur ? ico('check', 's16') : `<span class="num">${i + 1}</span>`}</span><span class="grow ${i > cur ? 'mut' : ''}">${t}</span></li>`).join('')}</ol></section>`;
/* Part 1, 윤성원 6 steps with the bundled 3-sentence model: ① question in Korean ② upgrade chips ③ Korean prompt → say it in English → reveal
   ④ hide the script ⑤ record slow, then fast ⑥ into the shadow deck. No typing, no key needed. */
A.p1 = {
  init(opts) { const q = nextP1(); return q ? { q, ref: q.id, sent: S.sentences(q.sample), shown: 0, ph: opts.quick ? 'quick' : 'build', peek: false, quick: !!opts.quick } : { none: true }; },
  view(s) {
    if (s.none) return { title: 'Part 1', body: '<section class="card"><p>Part 1 문항이 아직 없어요.</p></section>', foot: { label: '넘어가기', act: 'p1Done' } };
    const q = s.q, qc = `<section class="card qhead"><div class="stack">${pill('Part 1, ' + esc(q.topic), 'pri')}<p class="h1" lang="en">${esc(q.q)}</p>${q.q_ko ? `<p class="mut">${esc(q.q_ko)}</p>` : ''}</div>${btn('질문 듣기', 'p1Say', { cls: 'line sm', icon: 'volume-2' })}</section>`;
    if (s.ph === 'quick') return { title: '진단: Speaking', body: qc + recUI(s, 'rq', { maxMs: 60000, label: '1분 동안 편하게 답해요' }) + gradeBtn(s, 'rq') + (s.result ? speakResult(s.result) : ''), foot: recFoot(s, 'rq', { label: '완료', act: 'p1Done', icon: 'check' }) };
    const hi = t => { let h = esc(t); for (const u of q.upgrades || []) h = h.replace(new RegExp(`(${u.better.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i'), '<b class="up">$1</b>'); return h; };
    if (s.ph === 'build') {
      const ups = (q.upgrades || []).map(u => `<span class="pill up-pill" lang="en">${esc(u.plain)} → <b>${esc(u.better)}</b></span>`).join('');
      const rows = s.sent.map((en, i) => `<div class="p1s ${i < s.shown ? 'on' : i === s.shown ? 'cur' : ''}"><span class="p1r">${P1_ROLE[i]}</span><div><p>${esc((q.sample_ko || [])[i] || '')}</p>${i < s.shown ? `<p class="en reveal" lang="en">${hi(en)}</p>` : i === s.shown ? '<p class="cap">영어로 소리 내 말한 다음 공개해요</p>' : ''}</div></div>`).join('');
      return { title: 'Part 1 세 문장', side: p1Steps(s.shown < 3 ? 2 : 3), body: `${qc}<section class="card task flow"><div class="wrap"><span class="cap">업그레이드 표현</span>${ups}</div>${rows}</section>`,
        foot: s.shown < 3 ? { label: `${P1_ROLE[s.shown]} 말하고 공개`, act: 'p1Show', icon: 'eye' } : { label: '대본 가리고 녹음하기', act: 'p1Hide', icon: 'eye-off' } };
    }
    const peek = `<section class="card tight"><div class="row">${ico('eye-off')}<span class="grow">${s.peek ? `<span lang="en">${esc(q.sample)}</span>` : '대본을 가렸어요'}</span><button class="chip" data-act="p1Peek" aria-pressed="${s.peek}">잠깐 보기</button></div></section>`;
    if (s.ph === 'slow') return { title: '느리게 한 번', side: p1Steps(4), body: qc + peek + recUI(s, 'rs', { maxMs: 45000, label: '느리게, 또박또박' }), foot: recFoot(s, 'rs', { label: '빠르게 한 번', act: 'p1Fast', icon: 'arrow-right' }) };
    return { title: '빠르게 한 번', side: p1Steps(s.rf ? 5 : 4), body: qc + peek + recUI(s, 'rf', { maxMs: 30000, label: '자연스러운 속도로' }) + (s.rf && !s.recOn ? modelCard(s, q.id, q.sample) : '') + gradeBtn(s, 'rf') + (s.result ? speakResult(s.result) : ''), foot: recFoot(s, 'rf', { label: '완료', act: 'p1Done', icon: 'check' }) };
  },
  acts: {
    p1Say: s => speak(s.q.q), p1Show: s => { s.shown = Math.min(3, s.shown + 1); draw(); speak(s.sent[s.shown - 1], { rate: .9 }); },
    p1Hide: s => { s.ph = 'slow'; draw(); }, p1Peek: s => { s.peek = !s.peek; draw(); }, p1Fast: s => { s.ph = 'fast'; s.peek = false; draw(); },
    p1Done: s => { if (!s.none && !s.result && (s.rf || s.rq)) addAttempt({ skill: 'S', kind: 'p1', ref: s.q.id, secs: Math.round(((s.rf || s.rq).ms) / 1000) }); save(); finish({ xp: s.xp, credit: !s.none }); }
  }
};
const KW = ['past', 'present', 'feeling', 'why', '자유', '자유'];
A.p2 = {
  init(opts) { seedStories(); const c = pick(C.p2); return c ? { c, ref: c.id, kw: ['', '', '', '', '', ''], ph: 'prep', t0: Date.now(), thenP3: !!opts.thenP3, p3: C.p3.filter(q => q.p2 === c.id).slice(0, 2), p3i: 0 } : { none: true }; },
  view(s) {
    if (s.none) return { title: 'Part 2', body: '<section class="card"><p>큐카드가 아직 없어요.</p></section>', foot: { label: '넘어가기', act: 'p2Done' } };
    const c = s.c, st = DB.stories.find(x => x.kind === c.story && x.mine);
    const card = `<section class="card"><div class="row" style="min-height:0">${pill('Part 2 큐카드', 'pri')}${st ? `<span class="pill ok">${ico('book-marked', 's16')}${st.draft ? '스토리 초안' : '내 스토리'}: ${esc(STORY_KO[c.story])}</span>` : pill(`어울리는 스토리: ${STORY_KO[c.story] || c.story}`)}</div>
      <p class="h2" lang="en">${esc(c.card)}</p><ul lang="en" class="bul">${c.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul><p lang="en" class="mut">${esc(c.explain)}</p>${st && st.keys && st.keys.length && s.ph === 'prep' ? `<p class="cap">키워드: ${esc(st.keys.join(', '))}</p>` : ''}</section>`;
    if (s.ph === 'prep') return { title: 'Part 2: 1분 준비', split: true, cols: 'minmax(0, 1fr) minmax(0, 1.5fr)', clock: mmss(60000 - (Date.now() - s.t0)), body: `<div class="pane col">${card}${st ? `<section class="card tight"><details class="acc story-peek"><summary><span class="stack" style="gap:2px"><span>${st.draft ? '스토리 초안' : '내 스토리'}: ${esc(st.title || STORY_KO[c.story])}</span><span class="cap peek-1" lang="en">${esc(S.sentences(st.mine)[0] || '')}</span></span><span></span>${ico('chevron-down')}</summary><div><p class="en" lang="en">${esc(st.mine)}</p></div></details></section>` : ''}</div>` + `<section class="card pane"><h3 class="h3">키워드 패드</h3><div class="kw grow-kw">${KW.map((k, i) => `<label class="fld">${k}<input class="inp" data-kw="${i}" value="${esc(s.kw[i])}" lang="en" autocomplete="off"></label>`).join('')}</div><p class="cap">1분이 지나면 바로 2분 녹음이 시작돼요.</p></section>`, foot: { label: '바로 말하기', act: 'p2Go', icon: 'mic' } };
    if (s.ph === 'rec' || s.ph === 'review') {
      const kws = s.kw.filter(Boolean).length ? `<section class="card tight"><p class="cap" lang="en">${esc(s.kw.filter(Boolean).join(', '))}</p></section>` : '';
      return { title: s.ph === 'rec' ? 'Part 2: 2분 말하기' : 'Part 2: 다시 듣기', dark: s.ph === 'rec', body: card + kws + recUI(s, 'r2', { maxMs: 120000, label: s.ph === 'rec' ? '2분이 되면 자동으로 멈춰요' : '내 답을 다시 들어 봐요', stats: true }) + (s.ph === 'review' ? modelCard(s, c.id, c.sample) + gradeBtn(s, 'r2') + (s.result ? speakResult(s.result) : '') : ''),
        foot: s.ph === 'rec' ? { label: '끝내기', act: 'recStop', icon: 'square' } : s.thenP3 && s.p3.length ? { label: 'Part 3로', act: 'p2P3', icon: 'arrow-right' } : { label: '완료', act: 'p2Done', icon: 'check' } };
    }
    const q = s.p3[s.p3i], key = 'p3r' + s.p3i;
    return { title: `Part 3: ${s.p3i + 1}/${s.p3.length}`, body: p3Card(q) + recUI(s, key, { maxMs: 90000, label: '3~5문장, 이유와 예시까지' }) + (s[key] && !s.recOn ? modelCard(s, q.id, q.sample) : ''), foot: recFoot(s, key, s.p3i + 1 < s.p3.length ? { label: '다음 질문', act: 'p2P3Next', icon: 'arrow-right' } : { label: '완료', act: 'p2Done', icon: 'check' }) };
  },
  after(s) {
    const pk = $('.story-peek'); if (pk && innerWidth >= 700) pk.open = true;   // wide screens show the story beside the pad; phones keep it one tap away
    if (s.none || s.ph !== 'prep' || s.prepT) return;
    s.prepT = 1; every(1000, () => { const c = $('#stClock'); if (c && s.ph === 'prep') c.textContent = mmss(60000 - (Date.now() - s.t0)); });
    later(60000, () => { if (ACT && ACT.s === s && s.ph === 'prep') A.p2.acts.p2Go(s); });
  },
  acts: {
    p2Go: s => { s.ph = 'rec'; clearTimers(); recToggle(s, 'r2', { maxMs: 120000, onStop: () => { s.ph = 'review'; draw(); } }); },
    p2P3: s => { s.ph = 'p3'; draw(); }, p2P3Next: s => { s.p3i++; draw(); },
    p2Done: s => { if (!s.none && s.r2 && !s.result) addAttempt({ skill: 'S', kind: 'p2', ref: s.c.id, secs: Math.round(s.r2.ms / 1000) }); save(); finish({ xp: s.xp, credit: !s.none }); }
  }
};
const EXPAND = [['이유', 'The main reason is that'], ['예시', 'For example,'], ['대조', 'On the other hand,'], ['결과', 'As a result,']];
const p3Card = q => `<section class="card"><div class="row" style="min-height:0">${pill('Part 3', 'pri')}${btn('질문 듣기', 'p3Say', { cls: 'line sm', icon: 'volume-2', x: `data-q="${esc(q.q)}"` })}</div><p class="h2" lang="en">${esc(q.q)}</p><div class="wrap">${EXPAND.map(([k, v]) => `<span class="pill" title="${esc(v)}">${k}: <span lang="en">${esc(v)}</span></span>`).join('')}</div></section>`;
const R432 = [120000, 90000, 60000];
A['432'] = {
  init() { const c = pick(C.p2); return c ? { c, ref: c.id, r: -1 } : { none: true }; },
  view(s) {
    if (s.none) return { title: '4/3/2', body: '<section class="card"><p>큐카드가 아직 없어요.</p></section>', foot: { label: '넘어가기', act: 'k3Done' } };
    const rows = [0, 1, 2].map(i => { const x = s['k' + i]; return `<div class="row"><b class="num" style="width:3em">${mmss(R432[i])}</b>${x ? `<span class="grow">발화 ${Math.round(x.ratio * 100)}% · 멈춤 ${x.pauses}회</span>${bar(x.ratio, 'ok')}` : `<span class="grow cap">${s.r === i ? '녹음 중' : '대기'}</span>`}</div>`; }).join('');
    const on = s.r >= 0 && s.r < 3 && s.recOn;
    return { title: '4/3/2 유창성', dark: !!on, clock: '', body: `<section class="card"><p class="h2" lang="en">${esc(s.c.card)}</p>${s.r < 0 ? `<ul lang="en" class="bul">${s.c.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul><p lang="en" class="mut">${esc(s.c.explain)}</p>` : ''}<p class="cap">같은 카드를 2:00, 1:30, 1:00으로 세 번 말해요. 시간이 줄어도 내용은 그대로예요.</p><div class="rowlist t-bot" id="k3rows">${rows}</div></section>
      ${s.r >= 0 && s.r < 3 ? recUI(s, 'k' + s.r, { maxMs: R432[s.r], label: `${s.r + 1}회차 · ${mmss(R432[s.r])}` }) : ''}${s.k2 ? gradeBtn(s, 'k2') + (s.result ? speakResult(s.result) : '') : ''}`,
      foot: s.r < 0 ? { label: '2:00 말하기 시작', act: 'k3Go', icon: 'mic' } : on ? { label: '이번 회차 끝내기', act: 'recStop', icon: 'square' } : s.k2 ? { label: '완료', act: 'k3Done', icon: 'check' } : { label: '다음 회차', act: 'k3Go', icon: 'mic' } };
  },
  acts: {
    k3Go: s => { const i = s.r = Math.min(2, s.r + 1); recToggle(s, 'k' + i, { maxMs: R432[i], onStop: () => { draw(); if (i < 2) later(1500, () => { if (ACT && ACT.s === s && s.r === i) A['432'].acts.k3Go(s); }); } }); },
    k3Done: s => { if (!s.none && s.k2) addAttempt({ skill: 'S', kind: '432', ref: s.c.id, meta: { rounds: [0, 1, 2].map(i => s['k' + i] && { ratio: s['k' + i].ratio, pauses: s['k' + i].pauses }) } }); save(); finish({ xp: s.xp, credit: !s.none }); }
  }
};
const STORY_KINDS = [['person', '사람'], ['place', '장소'], ['object', '물건'], ['event', '사건'], ['skill', '기술'], ['change', '변화']], STORY_KO = Object.fromEntries(STORY_KINDS);
/** first visit: each of the 6 story types starts as a draft seeded from a bundled P2 model answer of that type */
function seedStories() {
  let n = 0;
  for (const [k] of STORY_KINDS) { if (DB.stories.some(x => x.kind === k)) continue; const c = C.p2.find(x => x.story === k); if (!c) continue;
    DB.stories.push({ id: uid(), kind: k, title: c.card.replace(/^Describe (.)/, (_, a) => a.toUpperCase()), keys: [], mine: c.sample, polished: '', updated: 0, draft: true, from: c.id }); n++; }
  if (n) save();
}
/** "내 이야기로 바꾸기": only nouns and names are editable. Slots = proper nouns mid-sentence and the noun after my/our. */
function storySlots(text) {
  const out = [], seen = new Set(), add = w => { const k = w.toLowerCase(); if (!seen.has(k) && out.length < 8) { seen.add(k); out.push(w); } };
  for (const m of String(text).matchAll(/(?<![.!?]\s|^)\b([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+)*)/g)) if (!/^(I|I'm|I'd|I've|If|It|The|This|That|When|What|At|In|On|My|He|She|We|They|After|Before|Years|Some)$/.test(m[1])) add(m[1]);
  for (const m of String(text).matchAll(/\b(?:my|our)\s+([a-z]+)/g)) if (!/^(own|first|best|life|mind|head|way|job|work|time)$/.test(m[1])) add(m[1]);
  return out;
}
const applySlots = (text, slots) => Object.entries(slots || {}).reduce((t, [w, v]) => v && v.trim() ? t.replace(new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), v.trim()) : t, text);
A.story = {
  init() { seedStories(); return { edit: null }; },
  view(s) {
    if (!s.edit) return { title: '스토리 뱅크', noStrip: true, body: `<section class="card task"><h2 class="h2">스토리 6편</h2><div class="rowlist">${STORY_KINDS.map(([k, l]) => { const x = DB.stories.find(y => y.kind === k); return `<button class="row st-row" data-act="stEdit" data-v="${k}"><b class="st-k">${l}</b><span class="grow">${x ? esc((x.title || x.mine.slice(0, 30)).replace(/^./, c => c.toUpperCase())) : '아직 비어 있어요'}</span>${x && x.draft ? pill('초안') : x && x.polished ? pill('교정됨', 'ok') : x ? pill('내 이야기', 'ok') : ''}${ico('chevron-right')}</button>`; }).join('')}</div><p class="basis t-bot"><b>큐카드는 무작위로 나와요</b> 모범 이야기를 초안으로 넣어 두었어요. 명사와 이름만 내 것으로 바꾸면 내 이야기가 되고, 외운 문장 대신 이야기를 기억해 두면 어떤 카드에도 풀어 말할 수 있어요.</p></section>`, foot: { label: '완료', act: 'stDone' } };
    const x = s.edit, L = STORY_KO[x.kind], slots = s.slotWords || [];
    return { title: `스토리: ${L}`, noStrip: true, body: `<section class="card"><label class="fld">제목<input class="inp" data-st="title" value="${esc(x.title)}" placeholder="예: 우리 동네 작은 공원"></label>
      ${slots.length ? `<h3 class="h3">내 이야기로 바꾸기</h3><p class="cap">아래 명사와 이름만 바꾸면 돼요. 비워 두면 그대로예요.</p><div class="kw">${slots.map(w => `<label class="fld"><span lang="en">${esc(w)}</span><input class="inp" data-slot="${esc(w)}" lang="en" value="${esc((x.slots || {})[w] || '')}" autocomplete="off" placeholder="${esc(w)}"></label>`).join('')}</div>` : ''}</section>
      <section class="card task side"><h3 class="h3">미리 보기</h3><p class="en" lang="en" id="stPrev">${esc(applySlots(x.mine, x.slots))}</p>
      <details class="acc"><summary><span>문장 전체 고치기</span><span></span>${ico('chevron-down')}</summary><div><textarea class="inp" data-st="mine" lang="en" rows="6">${esc(x.mine)}</textarea><p class="cap">이름·주소 같은 개인정보는 넣지 마세요. 제미나이 무료 등급은 입력을 학습에 써요.</p>
      ${btn(s.busy ? '교정하는 중…' : '제미나이로 오류만 고친 버전', 'stPolish', { cls: 'line block', icon: 'sparkles', dis: s.busy || !x.mine })}</div></details></section>
      ${x.polished ? `<section class="card side"><h3 class="h3">교정 버전 (내 아이디어 그대로)</h3><p class="en" lang="en">${esc(x.polished)}</p>${btn('섀도잉 카드로', 'stShadow', { cls: 'line block', icon: 'repeat' })}</section>` : ''}`, foot: { label: '내 이야기로 저장', act: 'stSave' }, alt: { label: '목록으로', act: 'stBack' } };
  },
  acts: {
    stEdit: (s, e) => { const k = e.dataset.v, x = DB.stories.find(y => y.kind === k) || { id: uid(), kind: k, title: '', keys: [], mine: '', polished: '', updated: 0 }; s.edit = JSON.parse(JSON.stringify(x)); s.edit.slots = s.edit.slots || {}; s.slotWords = x.draft ? storySlots(x.mine) : []; draw(); },
    stSave: s => { const x = s.edit; x.mine = applySlots(x.mine, x.slots); delete x.slots; x.draft = false; x.updated = Date.now(); if (!x.keys.length) x.keys = S.franklinHints(x.mine).flat().slice(0, 6); const i = DB.stories.findIndex(y => y.kind === x.kind); if (i >= 0) DB.stories[i] = x; else DB.stories.push(x); save(); toast('저장했어요'); s.edit = null; draw(); },
    stBack: s => { s.edit = null; draw(); },
    stPolish: async s => {
      const x = s.edit; if (!G.getKey()) return toast('제미나이 키가 없어요. 설정에서 넣어 주세요', 'warn');
      s.busy = true; draw();
      try { const r = await G.grade(DB, save, [{ text: G.storyPrompt(x.kind, applySlots(x.mine, x.slots)) }], G.normStory); x.polished = r.polished; for (const e of r.errors) logErr(e.type, e.wrong, e.right, e.why_ko, null, true); save(); }
      catch (e) { toast(e.message, 'warn', 5000); } finally { s.busy = false; draw(); }
    },
    stShadow: s => { addMyShadow(s.edit.title || '내 스토리', s.edit.polished); },
    stDone: () => finish({ credit: DB.stories.some(x => x.updated && dayKey(new Date(x.updated)) === today()) })
  }
};
function addMyShadow(title, text, kos = []) {
  const lines = S.sentences(text).map((en, i) => ({ en, ko: kos[i] || '', stress: en, chunks: en.replace(/, /g, ', / ') }));
  if (!lines.length) return false;
  DB.myShadow.push({ id: 'my-' + uid(), src: 'mine', credit: '내 답을 밴드 7로 다듬은 예시', title, level: 2, lines, audio: '' }); save();
  toast('섀도잉 스튜디오에 넣었어요'); return true;
}

/* ================= Writing ================= */
const PAL = ['#155EEF', '#0E9384', '#DC6803', '#7A5AF8'], PAL5 = [...PAL, '#E4608A'];
function chartSvg(t) {
  const d = t.data || {}, W = 420, H = 250, L = 40, B = 34, T = 14, Rr = 22;
  if (t.kind === 'table') { const cols = d.columns || ['', ...(d.xLabels || [])], rows = d.rows || (d.series || []).map(x => [x.name, ...x.values]), td = (v, i) => `<td class="${i ? 'num' : ''}" style="text-align:${i ? 'right' : 'left'};padding:8px;border-bottom:1px solid var(--line)">${esc(v)}</td>`;
    return `<table class="en" style="width:100%;border-collapse:collapse;font-size:var(--f2)"><thead><tr>${cols.map((c, i) => `<th style="text-align:${i ? 'right' : 'left'};padding:8px;border-bottom:1px solid var(--line-2)">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(td).join('')}</tr>`).join('')}</tbody></table><p class="cap">${esc(d.units || '')}</p>`; }
  if (t.kind === 'process') { const st = (d.steps || []).map((x, i) => typeof x === 'string' ? { n: i + 1, label: x, detail: '' } : x);
    return `<ol class="stack" style="margin:0;padding:0;list-style:none">${st.map((x, i) => `<li class="row" style="align-items:flex-start;min-height:44px"><span class="pill pri num">${x.n}</span><span lang="en" class="grow"><b>${esc(x.label)}</b>${x.detail ? `<br><span class="cap">${esc(x.detail)}</span>` : ''}</span>${i < st.length - 1 ? ico('chevron-down', 's16') : d.cycle ? ico('repeat', 's16') : ''}</li>`).join('')}</ol>`; }
  if (t.kind === 'map') {
    const MC = { road: '#9AA1AE', path: '#C9A227', park: '#3FA66B', water: '#3B82F6', parking: '#A0A7B4', building: '#7A5AF8', shop: '#DC6803', housing: '#E4608A' };
    const one = (m, fb) => { if (Array.isArray(m)) return `<div class="card tight" style="box-shadow:none"><h4 class="h3">${fb}</h4><ul lang="en" style="margin:0;padding-left:18px">${m.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
      return `<figure style="margin:0"><figcaption class="h3" style="margin-bottom:6px">${esc(m.label || fb)}</figcaption><svg viewBox="0 0 360 360" role="img" aria-label="${esc(m.label || fb)}" style="border:1px solid var(--line-2);border-radius:var(--rs);background:var(--hover)">${m.features.map(f => `<rect x="${f.x * 3.6}" y="${f.y * 3.6}" width="${f.w * 3.6}" height="${f.h * 3.6}" rx="5" fill="${MC[f.type] || '#8A919E'}" opacity=".85"/>`).join('')}${m.features.map(f => `<text x="${(f.x + f.w / 2) * 3.6}" y="${(f.y + f.h / 2) * 3.6 + 4}" text-anchor="middle" class="mapt">${esc(f.name)}</text>`).join('')}</svg></figure>`; };
    return `<div class="kw">${one(d.before, '이전')}${one(d.after, '현재')}</div>`;
  }
  if (t.kind === 'pie') {
    const charts = d.charts || [{ label: '', slices: d.xLabels.map((n, i) => ({ name: n, value: d.series[0].values[i] })) }], names = [...new Set(charts.flatMap(c => c.slices.map(x => x.name)))], col = n => PAL5[names.indexOf(n) % PAL5.length];
    const pie = c => { const tot = c.slices.reduce((a, x) => a + x.value, 0); let a0 = -Math.PI / 2; return `<figure style="margin:0;text-align:center"><svg viewBox="0 0 220 220" role="img" aria-label="${esc(c.label)}">${c.slices.map(x => { const a1 = a0 + x.value / tot * Math.PI * 2, lg = a1 - a0 > Math.PI ? 1 : 0, m = (a0 + a1) / 2, p = `M110 110 L${110 + 100 * Math.cos(a0)} ${110 + 100 * Math.sin(a0)} A100 100 0 ${lg} 1 ${110 + 100 * Math.cos(a1)} ${110 + 100 * Math.sin(a1)}Z`, lab = x.value / tot > .06 ? `<text x="${110 + 64 * Math.cos(m)}" y="${114 + 64 * Math.sin(m)}" text-anchor="middle" style="fill:#fff;font-weight:700">${x.value}</text>` : ''; a0 = a1; return `<path d="${p}" fill="${col(x.name)}" stroke="var(--card)" stroke-width="2"/>${lab}`; }).join('')}</svg>${c.label ? `<figcaption class="h3">${esc(c.label)}</figcaption>` : ''}</figure>`; };
    return `<div class="kw" style="grid-template-columns:repeat(${charts.length},1fr)">${charts.map(pie).join('')}</div><div class="gz-legend">${names.map(n => `<span><i style="height:10px;background:${col(n)};border-radius:999px"></i>${esc(n)}</span>`).join('')}<span class="sp"></span><span>${esc(d.units || '')}</span></div>`;
  }
  const all = d.series.flatMap(s => s.values), mx = Math.max(...all) * 1.1, mn = t.kind === 'bar' ? 0 : Math.max(0, Math.min(...all) * .8), X = i => L + (W - L - Rr) * (t.kind === 'bar' ? (i + .5) / d.xLabels.length : i / (d.xLabels.length - 1)), Y = v => T + (H - T - B) * (1 - (v - mn) / (mx - mn || 1));
  const grid = [0, .25, .5, .75, 1].map(f => { const v = mn + (mx - mn) * f; return `<line class="ax" x1="${L}" x2="${W - Rr}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end">${+v.toFixed(1)}</text>`; }).join('');
  const xl = d.xLabels.map((x, i) => `<text x="${X(i)}" y="${H - 12}" text-anchor="middle">${esc(x)}</text>`).join('');
  const bw = (W - L - Rr) / d.xLabels.length * .7 / d.series.length;
  const marks = d.series.map((s, k) => t.kind === 'bar' ? s.values.map((v, i) => `<rect x="${X(i) - bw * d.series.length / 2 + k * bw}" y="${Y(v)}" width="${bw - 2}" height="${Y(mn) - Y(v)}" rx="3" fill="${PAL[k % 4]}"/>`).join('') : `<polyline fill="none" stroke="${PAL[k % 4]}" stroke-width="2.5" points="${s.values.map((v, i) => `${X(i)},${Y(v)}`).join(' ')}"/>${s.values.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" fill="${PAL[k % 4]}"/>`).join('')}`).join('');
  const leg = `<div class="gz-legend">${d.series.map((s, k) => `<span><i style="height:10px;background:${PAL[k % 4]};border-radius:999px"></i>${esc(s.name)}</span>`).join('')}<span class="sp"></span><span>${esc(d.units || '')}</span></div>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(d.title || '')}">${grid}${xl}${marks}</svg>${leg}`;
}
const T2_SKEL = [['서론', '주제 다시 쓰기 한 문장, 입장 한 문장'], ['본문 1', 'Topic, Explain, Example, Consequence'], ['본문 2', '두 번째 이유를 같은 TEEC 순서로'], ['결론', '입장을 다른 말로 한 번 더, 새 논점은 넣지 않아요']];
const T2TYPES = [['opinion', '의견형'], ['discussion', '토론형'], ['adv-disadv', '장단점형'], ['problem-solution', '문제해결형'], ['two-part', '두 질문형']];
const CHECKS = ['개요가 있어요 (T2는 입장, T1은 숫자 없는 핵심 2개)', '4단락이에요', '모든 질문에 답했어요', '다섯 가지 오류(과거·to부정사·관사·be·전치사)를 점검했어요'];
const paras = t => String(t || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
function pickTask(task) { const list = task === 't1' ? C.t1 : C.t2; const W = WEEK(); if (task === 't1') { const kinds = W.n <= 4 ? ['line', 'bar'] : ['process', 'table', 'pie', 'map', 'line', 'bar']; return leastUsed(list.filter(x => kinds.includes(x.kind)).length ? list.filter(x => kinds.includes(x.kind)) : list); } return leastUsed(list); }
function writingAct(task) {
  const goal = task === 't1' ? 150 : 250, target = task === 't1' ? 170 : 270, mins = task === 't1' ? 20 : 40;
  return {
    init(opts) { const it = pickTask(task); if (!it) return { none: true }; const dr = (DB.flags.draft || {})[it.id] || ''; return { it, ph: task === 't1' ? 'overview' : 'plan', text: dr, plan: { type: '', all: false, pos: '', b1: '', b2: '' }, ov: ['', ''], t0: Date.now(), timed: opts.timed }; },
    view(s) {
      if (s.none) return { title: 'Writing', body: '<section class="card"><p>과제가 아직 없어요.</p></section>', foot: { label: '넘어가기', act: 'wQuit' } };
      const it = s.it, n = wc(s.text), T = task.toUpperCase();
      const task$ = `<section class="card pane"><div class="row" style="min-height:0">${pill('Task ' + (task === 't1' ? 1 : 2), 'pri')}${task === 't2' ? pill((T2TYPES.find(x => x[0] === it.type) || [0, ''])[1]) : pill(it.kind)}</div><p class="en" lang="en">${esc(it.prompt)}</p>${task === 't1' ? `<div class="chart">${chartSvg(it)}</div>` : ''}</section>`;
      const withErr = h => `<div class="pane col">${h.replace('card pane', 'card')}${fillCard('관련 오류와 교정', errRows(S.GRAM_TYPES), '', 180).replace('card fill', 'card fill wide-only')}</div>`;
      if (s.ph === 'overview') return { title: 'T1 · 개요 먼저', split: true, body: withErr(task$) + `<section class="card pane"><h3 class="h3">추세 두 개를 숫자 없이 한 문장씩</h3>${[0, 1].map(i => `<textarea class="inp ov" data-ov="${i}" lang="en" rows="3" placeholder="Overall, …">${esc(s.ov[i])}</textarea>`).join('')}${s.ov.some(x => /\d/.test(x)) ? '<div class="card warn tight" style="box-shadow:none">개요에는 숫자를 빼요. 숫자는 본문에서.</div>' : ''}<p class="cap">${esc(it.overview_hint_ko || '')}</p></section>`, foot: { label: '20분 쓰기 시작', act: 'wWrite', icon: 'timer' } };
      if (s.ph === 'plan') return { title: 'T2 · 5분 계획', clock: mmss(300000 - (Date.now() - s.t0)), split: true, body: withErr(task$.replace(/<\/section>$/, `${it.plan_ko ? `<p class="basis"><b>이 과제의 계획</b> ${esc(it.plan_ko)}</p>` : ''}<ol class="skel">${T2_SKEL.map(([h, t]) => `<li><b>${h}</b><span>${t}</span></li>`).join('')}</ol></section>`)) + `<section class="card pane"><span class="cap">유형</span><div class="wrap">${T2TYPES.map(([k, l]) => `<button class="chip" data-act="wType" data-v="${k}" aria-pressed="${s.plan.type === k}">${l}</button>`).join('')}</div>
        <label class="chk"><input type="checkbox" data-act="wAll" ${s.plan.all ? 'checked' : ''}>모든 질문에 답할 계획이에요</label><label class="fld">입장 한 줄<input class="inp" data-pl="pos" lang="en" value="${esc(s.plan.pos)}" placeholder="I strongly believe that…"></label>
        <label class="fld">본문 1 · Topic, Explain, Example, Consequence<textarea class="inp" data-pl="b1" lang="en" rows="3" style="min-height:88px">${esc(s.plan.b1)}</textarea></label><label class="fld">본문 2 · TEEC<textarea class="inp" data-pl="b2" lang="en" rows="3" style="min-height:88px">${esc(s.plan.b2)}</textarea></label></section>`, foot: { label: '40분 쓰기 시작', act: 'wWrite', icon: 'timer' } };
      if (s.ph === 'write') { const pl = s.plan, mine = [pl.pos, pl.b1, pl.b2, ''];   // wide screens: my 5-minute plan fills the task pane beside the editor
        const planHtml = task === 't2' ? `<ol class="skel wide-only" aria-label="내 계획">${T2_SKEL.map(([h, t], i) => `<li><b>${h}</b><span${mine[i] ? ' lang="en"' : ''}>${esc(mine[i] || t)}</span></li>`).join('')}</ol>` : '';
        return { title: `${T} · 쓰기`, clock: mmss(mins * 60000 - (Date.now() - s.t1)), split: true, body: task$.replace(/<\/section>$/, planHtml + '</section>') + `<section class="card pane"><div class="row" style="min-height:0"><span class="grow cap">목표 ${target}단어 이상 · 단락 사이는 빈 줄</span><span id="wCount" class="pill ${n < goal ? 'warn' : 'ok'} num">${n}단어</span></div><textarea class="inp essay" id="wText" lang="en" spellcheck="false" placeholder="Write here…">${esc(s.text)}</textarea></section>`, foot: { label: '제출', act: 'wSubmit', icon: 'check' } }; }
      if (s.ph === 'check') return { title: `${T} · 자가 점검`, split: true, body: `<section class="card pane"><div class="card warn tight" style="box-shadow:none">제미나이 키가 없어서 체크리스트로 점검해요.</div>${CHECKS.map((c, i) => `<label class="chk"><input type="checkbox" data-act="wChk" data-i="${i}" ${s.chk && s.chk[i] ? 'checked' : ''}>${c}</label>`).join('')}<h3 class="h3">내 글 · ${n}단어</h3><p class="en" lang="en" style="white-space:pre-wrap">${esc(s.text)}</p></section><section class="card pane"><h3 class="h3">모범 답안</h3><p class="en" lang="en" style="white-space:pre-wrap">${esc(it.model || '')}</p></section>`, foot: { label: '완료', act: 'wFinish', dis: !(s.chk && CHECKS.every((_, i) => s.chk[i])) } };
      if (s.ph === 'result') { const r = s.res, wp = paras(s.text)[r.weakest_paragraph - 1] || '';
        return { title: `${T} · 채점 결과`, split: true, body: `<section class="card pane"><div class="row" style="min-height:0"><h2 class="h2 grow">밴드</h2><span class="big num">${(r.overall - .5).toFixed(1)}–${r.overall.toFixed(1)}</span></div><p class="cap">${esc(r.summary_ko)}</p><div>${accordion(r.criteria, innerWidth >= 700 ? 2 : 1)}</div></section>
          <section class="card pane"><h3 class="h3">고칠 것 Top 3</h3><ol style="margin:0;padding-left:20px">${r.top_fixes_ko.map(f => `<li>${esc(f)}</li>`).join('')}</ol><h3 class="h3">오류</h3>${errList(r.errors)}<h3 class="h3">가장 약한 단락 (${r.weakest_paragraph}) → 밴드 7</h3><blockquote lang="en">${esc(wp)}</blockquote><blockquote lang="en">${esc(r.rewrite_band7)}</blockquote></section>`,
          foot: { label: '약한 단락 다시 쓰기', act: 'wRewrite', icon: 'pencil' }, alt: { label: '나중에 (완료 안 됨)', act: 'wQuit' } }; }
      if (s.ph === 'rewrite') { const r = s.res; return { title: `${T} · 약한 단락 다시 쓰기`, split: true, body: `<section class="card pane"><h3 class="h3">고칠 오류</h3>${errList(r.errors)}<h3 class="h3">밴드 7 참고</h3><blockquote lang="en">${esc(r.rewrite_band7)}</blockquote></section><section class="card pane"><p class="cap">베끼지 말고 내 문장으로 다시 써요. 다시 채점하지 않고 고친 곳만 확인해요.</p><textarea class="inp essay" id="rwText" lang="en" spellcheck="false" style="min-height:220px">${esc(s.rw != null ? s.rw : paras(s.text)[r.weakest_paragraph - 1] || '')}</textarea></section>`, foot: { label: '제출', act: 'wRwSubmit', icon: 'check' } }; }
      const r = s.res; return { title: `${T} · 재작성 확인`, split: true, body: `<section class="card pane"><h3 class="h3">바뀐 곳</h3><p class="en diff" lang="en">${s.diff.map(o => `<span class="${o.t}">${esc(o.w)}</span>`).join(' ')}</p></section><section class="card pane"><h3 class="h3">오류 로그 확인</h3>${errList(s.fixed)}</section>`, foot: { label: '완료', act: 'wFinish', icon: 'check' } };
    },
    after(s) {
      if (s.none || s.tick) return; s.tick = 1;
      every(1000, () => { const c = $('#stClock'); if (!c) return; if (s.ph === 'plan') c.textContent = mmss(300000 - (Date.now() - s.t0)); else if (s.ph === 'write') { const left = mins * 60000 - (Date.now() - s.t1); c.textContent = mmss(left); if (left <= 0 && !s.over) { s.over = 1; toast('시간이 끝났어요. 마무리하고 제출해요'); } } });
    },
    acts: {
      wType: (s, e) => { s.plan.type = e.dataset.v; draw(); }, wAll: (s, e) => { s.plan.all = e.checked; },
      wWrite: s => { s.ph = 'write'; s.t1 = Date.now(); draw(); },
      wChk: (s, e) => { s.chk = s.chk || {}; s.chk[e.dataset.i] = e.checked; draw(); },
      wSubmit: async s => {
        s.text = $('#wText').value; saveDraft(s);
        if (wc(s.text) < 20) return toast('조금 더 써 주세요', 'warn');
        s.att = s.att || addAttempt({ skill: 'W', kind: task, ref: s.it.id, words: wc(s.text), secs: Math.round((Date.now() - s.t1) / 1000), timed: true, meta: { text: s.text, type: s.it.type || s.it.kind, plan: s.plan, done: false } });
        s.xp = s.xp || gain(task === 't1' ? XP.t1 : XP.t2); save();
        if (!G.getKey()) { s.ph = 'check'; return draw(); }
        toast('채점하는 중이에요', '', 15000); $('[data-act="wSubmit"]').disabled = true;
        try {
          const r = await G.grade(DB, save, [{ text: G.writingPrompt(task, s.it.prompt, s.text) }], G.normWriting, sec => toast(`잠시 뒤 차례로 채점해요 · ${sec}초`, '', 4000));
          s.res = r; s.att.band = { crit: Object.fromEntries(Object.entries(r.criteria).map(([k, c]) => [k, c.band])), overall: r.overall, lo: r.overall - .5, hi: r.overall }; s.att.meta.grade = r;
          for (const e of r.errors) logErr(e.type, e.wrong, e.right, e.why_ko, s.att.id, true);
          save(); $('#toast').innerHTML = ''; s.ph = 'result'; draw();
        } catch (e) { toast(e.nokey ? '제미나이 키가 없어요' : e.message, 'warn', 5000); draw(); }
      },
      wRewrite: s => { s.ph = 'rewrite'; draw(); },
      wRwSubmit: s => { const rw = $('#rwText').value, ps = paras(s.text), wi = s.res.weakest_paragraph - 1, orig = ps[wi] || ''; s.rw = rw; s.diff = S.diffWords(orig, rw); ps[wi] = rw; s.fixed = S.fixedErrors(s.res.errors, ps.join('\n\n')); s.att.meta.rewrite = rw; s.xp += gain(XP.rewrite) || 0; s.ph = 'done'; save(); draw(); },
      wFinish: s => { if (s.att) { s.att.meta.done = true; if (s.chk) s.att.meta.selfcheck = true; } if (DB.flags.draft) delete DB.flags.draft[s.it.id]; save(); finish({ xp: s.xp }); },
      wQuit: s => finish({ xp: s.xp, credit: !!s.att })
    }
  };
}
function saveDraft(s) { DB.flags.draft = DB.flags.draft || {}; DB.flags.draft[s.it.id] = s.text; save(); }
A.t1 = writingAct('t1'); A.t2 = writingAct('t2');

/* ---------- Franklin: read → hints → (next day) rebuild → LCS diff → 내 표현 cards ---------- */
A.franklin = {
  init() {
    const p = DB.flags.franklin;
    if (p && S.franklinOpen(p.day, today())) return { ph: 'rebuild', p, text: '' };
    if (p) return { ph: 'wait', p };
    const mine = DB.attempts.filter(a => a.meta && a.meta.grade && a.meta.grade.rewrite_band7).slice(-3).map(a => ({ id: 'mine-' + a.id, text: a.meta.grade.rewrite_band7, task: a.kind }));
    const used = new Set(DB.attempts.filter(a => a.kind === 'franklin').map(a => a.ref)), pool = [...mine, ...C.fr].filter(x => !used.has(x.id));
    const m = pool[0] || C.fr[0]; return m ? { ph: 'read', m } : { none: true };
  },
  view(s) {
    if (s.none) return { title: 'Franklin', body: '<section class="card"><p>모범 단락이 아직 없어요.</p></section>', foot: { label: '넘어가기', act: 'frQuit' } };
    const hintsHtml = h => `<ol class="stack en" lang="en" style="margin:0;padding-left:20px">${h.map(x => `<li>${esc(x.join(' · '))}</li>`).join('')}</ol>`;
    if (s.ph === 'read') return { title: 'Franklin · 읽기', body: `<section class="card"><div class="row" style="min-height:0">${pill(s.m.id.startsWith('mine') ? '내 글의 밴드 7 재작성' : '모범 단락', 'pri')}</div><p class="en" lang="en">${esc(s.m.text)}</p><p class="cap">천천히 두 번 읽어요. 내일 키워드만 보고 다시 써요.</p></section>`, foot: { label: '다 읽었어요 · 힌트 만들기', act: 'frRead' } };
    if (s.ph === 'wait') return { title: 'Franklin · 내일 열려요', body: `<section class="card"><h2 class="h2">${ico('lock')} 재구성은 내일 열려요</h2><p class="cap">${md(s.p.day)}에 읽었어요. 하루가 지나야 기억에서 꺼내 쓰는 연습이 돼요.</p>${hintsHtml(s.p.hints)}</section>`, foot: { label: '확인', act: 'frQuit' } };
    if (s.ph === 'rebuild') return { title: 'Franklin · 재구성', split: true, body: `<section class="card pane"><h3 class="h3">문장별 키워드</h3>${hintsHtml(s.p.hints)}</section><section class="card pane"><textarea class="inp essay" id="frText" lang="en" spellcheck="false" style="min-height:240px" placeholder="키워드만 보고 단락을 다시 써요">${esc(s.text)}</textarea></section>`, foot: { label: '원문과 비교', act: 'frCompare' } };
    return { title: 'Franklin · 비교', split: true, body: `<section class="card pane"><h3 class="h3">원문 기준 비교</h3><p class="en diff" lang="en">${s.ops.map(o => `<span class="${o.t}">${esc(o.w)}</span>`).join(' ')}</p><p class="cap">줄 그어진 곳이 빠진 표현이에요.</p></section><section class="card pane"><h3 class="h3">"내 표현" 덱에 넣은 청크 ${s.chunks.length}개</h3><ul lang="en" style="margin:0;padding-left:18px">${s.chunks.map(c => `<li>${esc(c.chunk)}</li>`).join('') || '<li class="cap">빠진 표현이 없어요</li>'}</ul></section>`, foot: { label: '완료', act: 'frDone', icon: 'check' } };
  },
  acts: {
    frRead: s => { DB.flags.franklin = { id: s.m.id, text: s.m.text, day: today(), hints: S.franklinHints(s.m.text) }; save(); finish({ credit: true }); },
    frCompare: s => {
      s.text = $('#frText').value; s.ops = S.diffWords(s.p.text, s.text); s.chunks = S.missedChunks(s.ops).filter(c => S.contentChunk(c.chunk)).slice(0, 8);
      for (const c of s.chunks) { const id = 'my:exp:' + uid(); DB.my[id] = { deck: 'exp', front: c.ctx.replace(c.chunk, '___'), back: c.chunk, src: s.p.id }; DB.cards[id] = S.emptyCard(now()); }
      addAttempt({ skill: 'W', kind: 'franklin', ref: s.p.id, words: wc(s.text), meta: { missed: s.chunks.length } });
      s.xp = gain(XP.franklin); DB.flags.franklin = null; save(); s.ph = 'diff'; draw();
    },
    frDone: s => finish({ xp: s.xp }), frQuit: () => finish({ credit: false })
  }
};

/* ================= mock input · restart · weekly review ================= */
A.mockInput = {
  init(opts) { return { diag: !!opts.diag }; },
  view(s) {
    const off = (C.links.items || []).filter(l => l.kind === 'official');
    return { title: s.diag ? '진단 모의고사' : '공식 모의고사', body: `<section class="card side"><h2 class="h2">${s.diag ? 'IELTS.org 샘플 L·R 한 세트' : 'L·R 90분 (공식 자료)'}</h2><p class="cap">${s.diag ? '먼저 시간 제한 없이 풀고, 다시 채점해서 원점수를 넣어요.' : '공식 자료로 풀고 원점수만 넣어요. 문항은 앱에 복사하지 않아요.'}</p><div class="rowlist">${off.map(l => `<a class="row linkbtn" href="${esc(l.url)}" target="_blank" rel="noopener">${ico('external-link', 's16')}${esc(l.title)}</a>`).join('')}</div></section><section class="card">${mockForm('k')}</section>`, foot: { label: '저장', act: 'mkSave' } };
  },
  acts: { mkSave: () => { if (readMock('k')) finish({ credit: true }); } }
};
A.restart = {
  init() { return {}; },
  view() { return { title: '다시 시작', body: `<section class="card"><h1 class="h1">다시 시작해요. 최고 기록 ${DB.streak.best}일은 그대로예요.</h1><p class="mut">오늘은 3분이면 돼요. 첫 미션은 XP 2배예요.</p><h2 class="h2">언제 5분을 할까요?</h2><div class="stack">${CUES.map(c => `<button class="opt" data-act="rsCue" data-v="${c}" aria-pressed="${DB.profile.anchor.cue === c}">${ico('target')}${c}</button>`).join('')}</div><p class="basis t-bot"><b>오늘은 가볍게</b> 새 카드 없이 복습 5장과 섀도잉 1문장이에요. 복습도 30장까지만 보여 줘요.</p></section>`, foot: { label: '3분으로 이어가기', act: 'rsGo', icon: 'play' } }; },
  acts: { rsCue: (s, e) => { DB.profile.anchor.cue = e.dataset.v; save(); draw(); }, rsGo: () => finish({}) }
};
A.review = {
  init() { return {}; },
  view(s) { return reviewView(s); },
  acts: {
    rvFocus: (s, e) => { s.focus = e.dataset.v; s.set = true; draw(); },
    rvDone: s => { const k = today(), mon = addDays(mondayOf(k), dow(k) === 1 ? -7 : 0), w = isoWeek(mon), st = weekStats(mon); if (!DB.weekly[w]) gain(XP.week); DB.weekly[w] = { at: Date.now(), focus: s.focus, set: !!s.set, minutes: st.minutes, days: st.days }; DB.flags.reviewShown = k; save(); finish({ credit: dow(k) === 0 }); }
  }
};
A.myerr = { init: () => A.vocab.init({ deck: 'myerr' }), view: (s) => A.vocab.view(s, { deck: 'myerr' }), after: s => A.vocab.after(s), acts: A.vocab.acts };

/* ================= actions ================= */
function focusOv(k = today()) { const r = DB.weekly[isoWeek(addDays(mondayOf(k), -7))]; return r && r.set ? r.focus : null; }
const setProf = (k, v) => { DB.profile[k] = v; save(); };
const ACTS = {
  chip: e => { DB.flags.chip = e.dataset.k; DB.flags.chipDay = today(); save(); render(); },
  start: () => openMission(missionKind()),
  vocabGo: () => run('vocab', { mode: 'full' }),
  fixType: e => run('quiz', { type: e.dataset.v, n: 3 }),
  radioGo: () => run('radio'),
  extra: () => { DB.flags.extra = today(); save(); render(); },
  run: e => { const a = e.dataset.a; if (a === 'readShort') return run('read', { len: 'short', timed: true }); if (a === 'p2') return run('p2', { thenP3: true }); run(a); },
  tileList: e => { const T = TILES[e.dataset.s]; sheet(`<div class="row"><h2 class="h2 grow">${T.name}</h2><button class="btn icon ghost" data-act="closeSheet" aria-label="닫기">${ico('x')}</button></div><div class="stack">${T.list.map(([a, l]) => `<button class="opt" data-act="runSheet" data-a="${a}">${ico('play')}${l}</button>`).join('')}</div>`); },
  runSheet: e => { closeSheet(); ACTS.run(e); },
  closeSheet: () => closeSheet(),
  mockSheet: () => sheet(`<div class="row"><h2 class="h2 grow">모의 점수 입력</h2><button class="btn icon ghost" data-act="closeSheet" aria-label="닫기">${ico('x')}</button></div>${mockForm('m')}${btn('저장', 'mockSave', { cls: 'pri lg block' })}`),
  mockSave: () => { const m = readMock('m'); if (!m) return; closeSheet(); if (!dayRec().kind) creditDay('std'); render(); toast('모의 점수를 넣었어요. 게이지에 반영했어요'); },
  set: e => { const k = e.dataset.k, v = e.dataset.v;
    if (k in SET0) { DB.settings[k] = v === 'true' ? true : v === 'false' ? false : k === 'rate' || k === 'dayStart' ? +v : v; S.setDayStart(DB.settings.dayStart); lastDay = today(); applyTheme(); if (k === 'vocabSrc') buildOrder(); }
    else setProf(k, k === 'target' ? v : +v);
    save(); render(); toast('저장했어요'); },
  setDate: e => { if (!/^\d{4}-\d{2}-\d{2}$/.test(e.value) || e.value <= today()) return toast('오늘 이후 날짜를 골라 주세요', 'warn'); setProf('testDate', e.value); render(); toast('일정을 다시 계산했어요'); },
  cue: e => { DB.profile.anchor.cue = e.dataset.v; save(); render(); toast('저장했어요'); },
  cueText: e => { if (e.value.trim()) { DB.profile.anchor.cue = e.value.trim().slice(0, 40); save(); render(); toast('저장했어요'); } },
  backupText: e => { DB.profile.anchor.backup = e.value.trim().slice(0, 40); save(); toast('저장했어요'); },
  timeText: e => { if (e.value) { DB.profile.anchor.time = e.value; save(); toast('저장했어요'); } },
  ics: () => { const txt = S.buildIcs({ time: DB.profile.anchor.time, cue: DB.profile.anchor.cue, second: DB.settings.second, url: location.origin + location.pathname, start: today() }), a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/calendar' })); a.download = 'bandup-5min.ics'; document.body.appendChild(a); a.click(); a.remove(); toast('캘린더 파일을 만들었어요'); },
  keyText: e => { G.setKey(e.value); render(); if (e.value && !DB.flags.gemNote) { DB.flags.gemNote = 1; save(); toast('무료 등급은 입력을 학습에 쓸 수 있어요. 개인정보는 넣지 마세요', '', 5000); } else toast('저장했어요'); },
  modelText: e => { DB.settings.gmodel = e.value.trim(); save(); toast('저장했어요'); },
  voiceSel: e => { DB.settings.voiceEn = e.value; save(); speak('This is how I sound.'); },
  bkNow: async () => { const m = BK.bkSet($('#bkUrl').value, $('#bkTok').value); if (m === 'off') { render(); return toast('자동 백업을 껐어요'); } if (m) return toast(m, 'warn', 4500); toast('백업하는 중…', '', 20000); try { await BK.bkRun(() => DB, true); toast('드라이브에 백업했어요'); } catch (e) { toast(BK.bkErr(e), 'warn', 4500); } const s = $('#bkStat'); if (s) s.textContent = BK.bkStatText(); },
  bkLoad: async () => { const m = BK.bkSet($('#bkUrl').value, $('#bkTok').value); if (m) return toast(m === 'off' ? '백업 암호를 넣어 주세요' : m, 'warn'); toast('드라이브에서 찾는 중…', '', 8000); try { const r = await BK.bkLatest(); $('#toast').innerHTML = ''; if (!r.data) return toast('드라이브에 백업이 아직 없어요'); ACTS._pending = r.data; const at = new Date(r.savedAt); sheet(`<h2 class="h2">드라이브 기록을 불러올까요?</h2><p class="mut">${at.getMonth() + 1}월 ${at.getDate()}일 백업, ${r.data.xp || 0} XP. 지금 이 기기의 기록은 이 백업으로 바뀌어요.</p>${btn('불러오기', 'bkRestoreGo', { cls: 'pri lg block' })}${btn('취소', 'closeSheet', { cls: 'ghost block' })}`); } catch (e) { toast(BK.bkErr(e), 'warn', 4500); } },
  bkRestoreGo: () => { const d = ACTS._pending; if (!d) return closeSheet(); replaceDB(d); BK.bkMarkSynced(DB); closeSheet(); toast('드라이브 기록을 불러왔어요'); },
  exportJson: () => { BK.exportFile(DB); toast('JSON 파일로 내보냈어요'); },
  obNext: () => { const v = $('#obDate').value; if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || v <= today()) return toast('오늘 이후 날짜를 골라 주세요', 'warn'); OB.test = v; OB.i = 1; renderOnb(); },
  obCue: e => { OB.cue = e.dataset.v; OB.i = 2; renderOnb(); },
  obMin: e => { OB.min = +e.dataset.v; OB.i = 3; renderOnb(); },
  obDiag: e => finishOnb(e.dataset.v),
  close: () => { if (ACT && ACT.name === 'review') { DB.flags.reviewShown = today(); save(); } closeStage(); },
  skipStep: () => { if (!SEQ) return closeStage(); clearTimers(); stopAudio(); recCancel(); ACT.onDone({ skipped: true }); },
  recGo: (e) => { const s = ACT.s, k = e.dataset.k; const max = { r1: 15000, rq: 60000, rs: ACT.name === 'shadow' ? 60000 : 45000, rf: 30000 }[k]; recToggle(s, k, { maxMs: /^p3r/.test(k) ? 90000 : max || 0 }); },
  recStop: () => { if (RH) recToggle(ACT.s, ACT.s.recOn); },
  sGrade: e => { const s = ACT.s, k = e.dataset.k, n = ACT.name; const part = n === 'p1' ? 1 : 2, q = n === 'p1' ? s.q.q : s.c.card + ' ' + (s.c.bullets || []).join('; '); gradeSpeech(s, k, part, q, n === '432' ? '432' : n); },
  // "섀도잉 카드로": the graded band-7 answer (data-g), or the bundled model answer of a P1/P2/P3 item (data-id), no key needed
  toShadow: e => { const s = ACT && ACT.s; if (!s) return;
    if (e.dataset.g) { if (s.result && addMyShadow('내 답: ' + (s.q ? s.q.q : s.c ? s.c.card : '').slice(0, 30), s.result.model_answer)) e.disabled = true; return; }
    const id = e.dataset.id, it = [...C.p1, ...C.p2, ...C.p3].find(x => x.id === id); if (!it) return;
    if (addMyShadow('모범 답: ' + (it.q || it.card).slice(0, 34), it.sample, it.sample_ko || [])) { s.shadowed = { ...(s.shadowed || {}), [id]: 1 }; draw(); } },
  p3Say: e => speak(e.dataset.q),
  aiOn: () => { if (ACT) closeStage(); TAB = 'set'; render(); scrollTo(0, 0); const k = $('#sKey'); if (k) { k.scrollIntoView({ block: 'center' }); k.focus({ preventScroll: true }); } }
};
function replaceDB(d) { DB = Object.assign(blank(), d); DB.settings = { ...SET0, ...DB.settings }; S.setDayStart(DB.settings.dayStart); if (C.BASE) buildOrder(); G.useSettings(DB.settings); save(); applyTheme(); render(); }
/** theme: auto = dark from 22:00 to 06:00, otherwise the system setting (default); system; light; dark */
const nightTheme = (d = now()) => d.getHours() >= 22 || d.getHours() < 6;
function applyTheme() {
  const t = DB.settings.theme, eff = t === 'auto' ? (nightTheme() ? 'dark' : 'system') : t;
  if (eff === 'system') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = eff;
  const dark = eff === 'dark' || (eff === 'system' && matchMedia('(prefers-color-scheme: dark)').matches); $('#themeColor').content = dark ? '#0B0D12' : '#F5F6F8';
}
setInterval(applyTheme, 60000);

/* ================= events ================= */
document.addEventListener('click', e => {
  const go = e.target.closest('[data-go]');
  if (go) { TAB = go.dataset.go; closeSheet(); render(); scrollTo(0, 0); return; }
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) { if (el.type === 'checkbox') handle(el); return; }
  handle(el);
});
document.addEventListener('change', e => { const el = e.target.closest('[data-act]'); if (el && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && el.type !== 'checkbox') handle(el); if (e.target.id === 'impFile') importFile(e.target); });
function handle(el) {
  const a = el.dataset.act, own = ACT && A[ACT.name].acts && A[ACT.name].acts[a];
  try { if (own) own(ACT.s, el); else if (ACTS[a]) ACTS[a](el); } catch (err) { console.warn(err); toast('문제가 생겼어요. 다시 시도해 주세요', 'warn'); }
}
document.addEventListener('input', e => {
  const t = e.target; if (!ACT) return; const s = ACT.s;
  if (t.id === 'wText') { s.text = t.value; const n = wc(t.value), c = $('#wCount'), goal = ACT.name === 't1' ? 150 : 250; if (c) { c.textContent = n + '단어'; c.className = `pill ${n < goal ? 'warn' : 'ok'} num`; } clearTimeout(s.dT); s.dT = setTimeout(() => saveDraft(s), 800); }
  else if (t.dataset.f) s.f[t.dataset.f] = t.value;
  else if (t.dataset.kw) s.kw[t.dataset.kw] = t.value;
  else if (t.dataset.ov) s.ov[t.dataset.ov] = t.value;
  else if (t.dataset.pl) s.plan[t.dataset.pl] = t.value;
  else if (t.dataset.slot && s.edit) { s.edit.slots[t.dataset.slot] = t.value; const pv = $('#stPrev'); if (pv) pv.textContent = applySlots(s.edit.mine, s.edit.slots); }
  else if (t.dataset.st && s.edit) { s.edit[t.dataset.st] = t.dataset.st === 'keys' ? t.value.split(',').map(x => x.trim()).filter(Boolean) : t.value; const pb = $('[data-act=stPolish]'); if (pb && !s.busy) pb.disabled = !s.edit.mine; }
  else if (t.id === 'frText') s.text = t.value;
  else if (t.id === 'rwText') s.rw = t.value;
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && ACT && e.target.tagName === 'INPUT' && !e.isComposing) { const f = $('.st-foot .btn.pri'); if (f && !f.disabled) { e.preventDefault(); f.click(); } } if (e.key === 'Escape') { if (!$('#sheet').hidden) closeSheet(); else if (ACT) { e.preventDefault(); ACTS.close(); } } });
$('#scrim').addEventListener('click', closeSheet);
async function importFile(inp) {
  const f = inp.files && inp.files[0]; if (!f) return;
  try { const d = BK.parseImport(await f.text()); replaceDB(d); toast('JSON 파일에서 불러왔어요'); } catch (e) { toast(e.message, 'warn'); } inp.value = '';
}
let lastW = innerWidth;   // 1005: the phone keyboard only changes the height — re-rendering then replaced the focused field and closed the keyboard
addEventListener('resize', () => { clearTimeout(render.t); render.t = setTimeout(() => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || ''), wChanged = innerWidth !== lastW; lastW = innerWidth;
  if (typing || !wChanged && innerWidth < 700) return;
  if (DB.profile && !ACT) render(); else if (ACT) fitStage(); }, 150); });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
let lastDay = today();
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && today() !== lastDay) { lastDay = today(); dayStart(); if (!ACT) render(); } });

/* ================= boot ================= */
function dayStart() {
  if (!DB.profile) return;
  const k = today(); S.settle(DB.streak, k);
  if (DB.flags.dayInit !== k) { DB.flags.dayInit = k; if (DB.streak.last && S.awayDays(DB.streak, k) >= 1) DB.flags.cb = k; }
  save();
}
window.BANDUP = { get DB() { return DB; }, S, C, save, render, replaceDB, openMission, run, gauges: () => S.gauges(DB, today()), get ACT() { return ACT; } };   // test/debug handle
(async () => {
  applyTheme();
  await loadContent();
  dayStart(); render();
  document.fonts && document.fonts.ready.then(() => ACT ? fitStage() : fitLists());   // row heights change when Pretendard arrives
  document.body.dataset.ready = '1';
  if (!DB.profile && BK.bkOn()) {   // 1005: 새로 깔아서 비어 있으면 드라이브 백업에서 자동으로 되살림
    try { const r = await BK.bkLatest(); if (r.data && !DB.profile) { replaceDB(r.data); BK.bkMarkSynced(DB); dayStart(); render(); toast('드라이브 백업에서 기록을 되살렸어요'); } } catch (e) {}
  }
  if (DB.profile) {
    BK.bkRun(() => DB).catch(() => {});
    const k = today(), mon = addDays(mondayOf(k), -7);
    if (dow(k) === 1 && DB.flags.reviewShown !== k && !DB.weekly[isoWeek(mon)] && Object.keys(DB.days).some(d => d >= mon && d < k && DB.days[d].kind)) { SEQ = null; startAct('review', {}, () => closeStage()); }
  }
})();
