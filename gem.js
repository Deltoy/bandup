/* Gemini grading. gemModels/gemCall are copied from FITQUEST app.js (0927) — only the storage keys, the settings
   source and the fallback tail changed (Gemini 2.0 is retired → gemini-3.8-flash, gemini-3.5-flash-lite, gemini-3.1-flash-lite).
   Around them: a usage guard (20 calls/day, 5/min, queued), one retry on bad JSON, and response validation (srs.js). */
import { normWriting, normSpeaking, ERR_TYPES, dayKey } from './srs.js';

export const KEY = 'bandup.key';   // never inside bandup.db → never exported or backed up
export const getKey = () => { try { return (localStorage.getItem(KEY) || '').trim(); } catch (e) { return ''; } };
export const setKey = k => { try { k ? localStorage.setItem(KEY, k.trim()) : localStorage.removeItem(KEY); } catch (e) {} };
export const DAY_MAX = 20, MIN_MAX = 5;
let SETTINGS = { gmodel: '' };
export const useSettings = s => { SETTINGS = s; };

/* ---- copied from FITQUEST ---- */
const GEM_PREF = 'gemini-3.8-flash';   // 0928 기본 3.8
export async function gemModels(key) {
  let found = [];
  try {
    const c = JSON.parse(localStorage.getItem('bandup.gmodels') || 'null');
    if (c && Date.now() - c.at < 7 * 864e5) found = c.list;
    else {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${encodeURIComponent(key)}`), j = await r.json().catch(() => ({}));
      const ver = n => (n.match(/gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1] * 1;
      found = (j.models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).map(m => String(m.name).replace(/^models\//, ''))
        .filter(n => /^gemini-\d+(\.\d+)?-flash(-lite)?$/.test(n)).sort((a, b) => (/lite/.test(a) - /lite/.test(b)) || ver(b) - ver(a));
      if (found.length) localStorage.setItem('bandup.gmodels', JSON.stringify({ at: Date.now(), list: found }));
    }
  } catch (e) {}
  const ok = localStorage.getItem('bandup.gmodelOK');
  return [...new Set([SETTINGS.gmodel, GEM_PREF, ok, ...found, 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'].filter(Boolean))];
}
export async function gemCall(key, parts, errMsg) {
  let lastErr = '쓸 수 있는 제미나이 모델을 찾지 못했어요';
  for (const m of await gemModels(key)) {
    let r;
    try { r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent?key=${encodeURIComponent(key)}`, { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { response_mime_type: 'application/json', temperature: .2 } }) }); }
    catch (e) { throw new Error(navigator.onLine === false ? '인터넷에 연결되어 있지 않아요. 쓴 글과 녹음은 저장돼 있어요' : '제미나이에 연결하지 못했어요. 잠시 후 다시 해 주세요'); }   // network failure → Korean, never "Failed to fetch"
    const j = await r.json().catch(() => ({})), em = (j.error && j.error.message) || '';
    if (r.status === 404 || (r.status === 400 && /not (found|supported)|is not available|unsupported model/i.test(em))) { lastErr = `${m} 없음`; continue; }   // 이 키로 없는 모델 → 다음(낮은) 모델
    if (!r.ok) throw new Error(r.status === 400 || r.status === 403 ? (em || errMsg).slice(0, 120) : r.status === 429 ? '무료 사용량을 넘었어요. 잠시 후 다시 해 주세요' : r.status >= 500 ? '제미나이 서버가 잠시 답하지 않아요. 잠시 후 다시 해 주세요' : em || `채점하지 못했어요 (${r.status})`);
    try { localStorage.setItem('bandup.gmodelOK', m); } catch (e) {}
    const txt = ((j.candidates || [])[0]?.content?.parts || []).map(p => p.text || '').join('');
    return JSON.parse(txt.replace(/^```json|```$/g, ''));
  }
  throw new Error(lastErr);
}
/* ---- end copy ---- */

/* usage guard: db.gem = { day, calls }; per-minute window kept in memory; calls wait in a queue */
const recent = [];
let chain = Promise.resolve();
export const usedToday = db => (db.gem && db.gem.day === dayKey() ? db.gem.calls : 0);
const sleep = ms => new Promise(r => setTimeout(r, ms));
function guarded(db, save, onWait, fn) {
  const run = async () => {
    if (usedToday(db) >= DAY_MAX) throw new Error(`오늘 채점 ${DAY_MAX}회를 다 썼어요. 쓴 글과 녹음은 저장돼 있어요. 내일 다시 채점할 수 있어요`);
    for (;;) { const now = Date.now(); while (recent.length && now - recent[0] > 60000) recent.shift(); if (recent.length < MIN_MAX) break; onWait && onWait(Math.ceil((60000 - (now - recent[0])) / 1000)); await sleep(Math.min(5000, 60000 - (now - recent[0]) + 50)); }
    recent.push(Date.now());
    db.gem = { day: dayKey(), calls: usedToday(db) + 1 }; save();
    return fn();
  };
  const p = chain.then(run, run); chain = p.catch(() => {}); return p;
}
/** grade(db, save, parts, norm) → validated object. Bad JSON / wrong shape → one retry, then a Korean error. */
export async function grade(db, save, parts, norm, onWait) {
  const key = getKey(); if (!key) throw Object.assign(new Error('제미나이 키가 없어요'), { nokey: true });
  for (let i = 0; i < 2; i++) {
    let raw;
    try { raw = await guarded(db, save, onWait, () => gemCall(key, parts, '키를 확인해 주세요')); }
    catch (e) { if (e instanceof SyntaxError && i === 0) continue; if (e instanceof SyntaxError) throw new Error('채점 결과를 읽지 못했어요. 쓴 글은 저장돼 있어요'); throw e; }
    try { return norm(raw); } catch (e) { if (i === 1) throw new Error('채점 결과를 읽지 못했어요. 쓴 글은 저장돼 있어요'); }
  }
}

/* ---- prompts: our own summary rubric (content/rubric.json), never the official descriptors ---- */
let RUBRIC = null;
export const useRubric = items => { RUBRIC = items; };
const rubricTable = skill => (RUBRIC || []).filter(r => r.skill === skill).map(r => `${r.crit} (${r.name}) — band 5: ${r.b5} | band 6: ${r.b6} | band 7: ${r.b7}`).join('\n') ||
  (skill === 'writing' ? 'TR/TA: answers all parts with a clear position (7) vs. partly (5). CC: logical progression and flexible linking (7) vs. mechanical (5). LR: range with collocations (7) vs. basic, repetitive (5). GRA: frequent error-free complex sentences (7) vs. frequent errors (5).'
    : 'FC: speaks at length without effort (7) vs. slow with repetition (5). LR: flexible, some idiomatic items (7) vs. limited (5). GRA: mix of complex forms, frequent error-free sentences (7) vs. basic forms with errors (5). P: easy to understand throughout (7) vs. mispronunciations reduce clarity (5).');
const LEARNER = 'The candidate is a Korean adult (current estimate band 5.0 in writing and speaking) whose recurring errors are: past tense (tense), to-infinitive of purpose (toinf), articles (article), missing be-verb (be), prepositions (prep). Grade strictly; do not inflate a low-level answer. Bands in 0.5 steps.';
const TYPES = `Allowed error "type" values: ${ERR_TYPES.slice(0, 10).join(', ')}.`;
export function writingPrompt(task, prompt, text) {
  const t = task === 't1' ? 'T1' : 'T2', c = t === 'T1' ? 'TA' : 'TR';
  return `You are an IELTS Academic writing examiner. ${LEARNER}\nRubric (summary):\n${rubricTable('writing')}\n\nTask ${t} question:\n${prompt}\n\nCandidate answer (paragraphs separated by blank lines):\n${text}\n\n` +
    `Return JSON only, exactly this shape: {"task":"${t}","words":<int>,"criteria":{"${c}":{"band":<0-9>,"evidence":["2-3 short quotes copied from the answer"],"fix_ko":"<Korean, one sentence>"},"CC":{...},"LR":{...},"GRA":{...}},"overall":<0-9>,` +
    `"top_fixes_ko":["3 fixes in Korean, most score-relevant first"],"errors":[{"type":"article","wrong":"exact words from the answer","right":"corrected","why_ko":"Korean"}],"weakest_paragraph":<1-based index>,"rewrite_band7":"that paragraph rewritten at band 7, keeping his ideas","summary_ko":"one Korean sentence"}\n${TYPES} Max 10 errors, copy "wrong" verbatim.`;
}
export function speakingPrompt(part, question) {
  return `You are an IELTS speaking examiner. ${LEARNER}\nRubric (summary):\n${rubricTable('speaking')}\n\nThis is Part ${part}. Question/cue: ${question}\nListen to the attached recording.\n` +
    `Return JSON only: {"transcript":"exactly as spoken, keep fillers (um, uh, actually), do NOT fix grammar","duration_s":<int>,"wpm":<int>,"fillers":{"um":<n>},"long_pauses":<n>,` +
    `"criteria":{"FC":{"band":<0-9>,"evidence":["quotes from the transcript"],"fix_ko":"Korean"},"LR":{...},"GRA":{...},"P":{...}},"overall":<0-9>,"errors":[{"type":"tense","wrong":"...","right":"...","why_ko":"Korean"}],` +
    `"pron_notes_ko":["3 Korean notes"],"upgrades":[{"plain":"important","better":"a must"}],"model_answer":"his answer polished to band 7, keeping his ideas and story"}\n${TYPES} Max 10 errors. Grammar must be judged from what was actually said.`;
}
export const storyPrompt = (kind, text) => `Correct only the grammar and word-choice errors in this short personal story (IELTS speaking practice, topic: ${kind}). Keep his ideas, facts and order; keep it natural spoken English, 120-200 words. Return JSON only: {"polished":"...","errors":[{"type":"article","wrong":"...","right":"...","why_ko":"Korean"}]}\n${TYPES}\n\nStory:\n${text}`;
export const normStory = j => { if (!j || typeof j.polished !== 'string') throw new Error('shape'); return { polished: j.polished.slice(0, 3000), errors: normSpeaking({ criteria: {}, errors: j.errors }).errors }; };
export { normWriting, normSpeaking };
