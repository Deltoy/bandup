/* Backup — FITQUEST backup.js pattern. (1) Google Drive via the TRENDLAB Apps Script server (fq.gs.js + the ielts patch):
   body { fq:1, app:'ielts', kind:'data'|'latest', token, ... } → Drive folder "IELTS 백업", ielts-YYYY-MM-DD.json, 30 kept.
   (2) JSON export/import that always works without any server. The Gemini key lives in bandup.key and is never included.
   Recordings are never backed up (only the transcripts inside attempts). */
const BK_KEY = 'bandup.backup';
export const BK = (() => { try { return JSON.parse(localStorage.getItem(BK_KEY)) || {}; } catch (e) { return {}; } })();   // { url, token, at, hash }
const bkStore = () => { try { localStorage.setItem(BK_KEY, JSON.stringify(BK)); } catch (e) {} };
export const BK_DEFAULT = 'https://script.google.com/macros/s/AKfycbzV6NiDcEOG_4cGorp0d-aGrl5e_ibqvzII33rQZVSqbcf8NG6SPtvC0V4tyL01ovcJdg/exec';   // 트렌드랩 서버 (FITQUEST 와 같은 곳)
const BK_URL = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/;
export const bkUrl = () => BK.url || BK_DEFAULT;
export const bkOn = () => !!BK.token;
export const hashOf = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 ^ s.charCodeAt(i)) | 0; return h; };
const pad = n => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

export async function bkCall(body) {
  const r = await fetch(bkUrl(), { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ fq: 1, app: 'ielts', token: BK.token, ...body }) });
  const j = await r.json().catch(() => null);
  if (!j || !j.ok) throw new Error((j && j.err) || 'http_' + r.status);
  return j;
}
export const bkErr = e => e && e.message === 'token' ? '백업 암호가 처음 정한 것과 달라요. 설정에서 확인해 주세요' : '드라이브에 연결하지 못했어요. 다음에 다시 시도할게요';

/* 12시간이 지났거나 데이터가 바뀌었으면 올린다. 한 번에 하나만. */
let busy = null;
export function bkRun(getDB, manual) {
  const DB = getDB();
  if (!bkOn() || !DB.profile) return Promise.resolve(false);
  if (busy) return busy;
  busy = (async () => {
    const h = hashOf(JSON.stringify(DB));
    if (manual || Date.now() - (BK.at || 0) > 12 * 36e5 || h !== BK.hash) {
      await bkCall({ kind: 'data', day: today(), data: DB });
      BK.at = Date.now(); BK.hash = h; bkStore();
      return true;
    }
    return false;
  })().finally(() => { busy = null; });
  return busy;
}
export const bkStatText = () => { if (!BK.at) return bkOn() ? '아직 백업하지 않았어요' : '백업 암호를 정하면 자동으로 백업해요'; const d = new Date(BK.at); return `마지막 백업 ${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
/** set url/token from the settings fields → error text or '' */
export function bkSet(url, token) {
  url = (url || '').trim(); token = (token || '').trim();
  if (!token) { delete BK.url; delete BK.token; bkStore(); return 'off'; }
  if (token.length < 4) return '백업 암호를 4자 이상 넣어 주세요';
  if (url && !BK_URL.test(url)) return '주소는 https://script.google.com/macros/s/…/exec 모양이에요';
  if ((url || '') !== (BK.url || '') || token !== BK.token) { if (url) BK.url = url; else delete BK.url; BK.token = token; BK.at = 0; BK.hash = 0; bkStore(); }
  return '';
}
export async function bkLatest() { const j = await bkCall({ kind: 'latest' }); return { data: j.data && j.data.v === 1 && j.data.profile ? j.data : null, savedAt: j.savedAt }; }
export const bkMarkSynced = DB => { BK.at = Date.now(); BK.hash = hashOf(JSON.stringify(DB)); bkStore(); };

/* ---- JSON export / import (no server) ---- */
export function exportFile(DB) {
  const blob = new Blob([JSON.stringify(DB, null, 1)], { type: 'application/json' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `bandup-${today()}.json`; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
/** parse an exported file → DB object (throws a Korean message if it is not a BANDUP v1 backup) */
export function parseImport(text) {
  let d; try { d = JSON.parse(text); } catch (e) { throw new Error('JSON 파일이 아니에요'); }
  if (!d || d.v !== 1 || !d.profile || typeof d.days !== 'object') throw new Error('밴드업 백업 파일이 아니에요');
  delete d.gkey;
  return d;
}
