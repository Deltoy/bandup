/* Recording: MediaRecorder with format detection (webm/opus → mp4 → ogg), Web Audio pause detection,
   and the IndexedDB store "bandup-audio" (newest 30 + graded recordings kept). SpeechRecognition is never run alongside. */
import { speechStats } from './srs.js';

export function pickMime() {
  if (typeof MediaRecorder === 'undefined') return null;
  for (const m of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']) if (MediaRecorder.isTypeSupported(m)) return m;
  return '';
}
export const canRecord = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && typeof MediaRecorder !== 'undefined');

/** start({maxMs, onTick(ms, level), onAuto(result) when maxMs stops it}) → { stop(): Promise<{blob, mime, ms, ratio, pauses}>, cancel() } */
export async function start({ maxMs = 0, onTick, onAuto } = {}) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const mime = pickMime(), mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined), chunks = [];
  mr.ondataavailable = e => e.data && e.data.size && chunks.push(e.data);
  const AC = window.AudioContext || window.webkitAudioContext, ac = new AC(), src = ac.createMediaStreamSource(stream), an = ac.createAnalyser();
  an.fftSize = 1024; src.connect(an);
  const buf = new Float32Array(an.fftSize), flags = [];
  let floor = 0.01, t0 = Date.now(), done = null;
  const tick = setInterval(() => {
    an.getFloatTimeDomainData(buf); let s = 0; for (const v of buf) s += v * v; const rms = Math.sqrt(s / buf.length);
    floor = Math.max(0.002, Math.min(rms, floor * 1.01 + 1e-5));   // noise floor: drops at once, rises slowly
    flags.push(rms > Math.max(0.012, floor * 3));
    const ms = Date.now() - t0; onTick && onTick(ms, Math.min(1, rms * 8));
    if (maxMs && ms >= maxMs && !done) stop().then(r => onAuto && onAuto(r));
  }, 50);
  mr.start(250);
  const cleanup = () => { clearInterval(tick); stream.getTracks().forEach(t => t.stop()); ac.close().catch(() => {}); };
  function stop() {
    if (done) return done;
    done = new Promise(res => {
      mr.onstop = () => { cleanup(); const type = (mr.mimeType || mime || 'audio/webm').split(';')[0]; const st = speechStats(flags); res({ blob: new Blob(chunks, { type }), mime: type, ms: Date.now() - t0, ratio: st.ratio, pauses: st.pauses }); };
      try { mr.state !== 'inactive' ? mr.stop() : mr.onstop(); } catch (e) { mr.onstop(); }
    });
    return done;
  }
  return { stop, cancel: () => { try { mr.onstop = null; mr.stop(); } catch (e) {} cleanup(); }, get ms() { return Date.now() - t0; } };
}

/* ---- IndexedDB store ---- */
const KEEP = 30;
let dbp = null;
const idb = () => dbp || (dbp = new Promise((res, rej) => { const r = indexedDB.open('bandup-audio', 1); r.onupgradeneeded = () => r.result.createObjectStore('rec', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
const tx = async (mode, fn) => { const d = await idb(); return new Promise((res, rej) => { const t = d.transaction('rec', mode), s = t.objectStore('rec'), out = fn(s); t.oncomplete = () => res(out && out.result !== undefined ? out.result : out); t.onerror = () => rej(t.error); }); };
export const putRec = async rec => { await tx('readwrite', s => s.put(rec)); await prune(); return rec.id; };
export const getRec = id => tx('readonly', s => s.get(id));
export const allRecs = () => tx('readonly', s => s.getAll());
export const markGraded = async id => { const r = await getRec(id); if (r) { r.graded = true; await tx('readwrite', s => s.put(r)); } };
/** keep graded recordings + the newest KEEP ungraded ones */
export async function prune() {
  const all = (await allRecs()).filter(r => !r.graded).sort((a, b) => b.ts - a.ts);
  const drop = all.slice(KEEP); if (drop.length) await tx('readwrite', s => drop.forEach(r => s.delete(r.id)));
  return drop.length;
}
export const clearRecs = () => tx('readwrite', s => s.clear());
export const blobToB64 = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = () => rej(r.error); r.readAsDataURL(b); });
