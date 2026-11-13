/* ============================================================
   engagement.js — Module de tracking et statistiques
   Utilisé par toutes les pages + admin
   ============================================================ */
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, doc, setDoc, updateDoc, increment, collection,
  addDoc, getDocs, getDoc, query, where, orderBy, limit,
  deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAmSVxlrxIWx9AvY_Y1Bz5kUnxDkuDc1uU",
  authDomain: "rabbi-tan-site.firebaseapp.com",
  projectId: "rabbi-tan-site",
  storageBucket: "rabbi-tan-site.firebasestorage.app",
  messagingSenderId: "753320511993",
  appId: "1:753320511993:web:c9535ebf001950b6b81528"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ---------- Empreinte anonyme (par navigateur) ---------- */
function getFingerprint() {
  let fp = localStorage.getItem("rt_fp");
  if (!fp) {
    fp = "fp_" + Math.random().toString(36).slice(2) + "_" + Date.now().toString(36);
    localStorage.setItem("rt_fp", fp);
  }
  return fp;
}

/* ---------- Vues ---------- */
export async function trackView(page, articleId = null) {
  try {
    await addDoc(collection(db, "vues"), {
      page, articleId,
      userAgent: navigator.userAgent.slice(0, 150),
      date: serverTimestamp()
    });
  } catch (e) { /* silencieux */ }
}

/* ---------- Clics ---------- */
export async function trackClick(element, target = "", page = "") {
  try {
    await addDoc(collection(db, "clics"), {
      page: page || location.pathname,
      element: String(element).slice(0, 80),
      target: String(target).slice(0, 200),
      fingerprint: getFingerprint(),
      date: serverTimestamp()
    });
  } catch (e) {}
}

/* ---------- Likes ---------- */
export async function hasLiked(articleId) {
  try {
    const snap = await getDoc(doc(db, "likes", `${articleId}_${getFingerprint()}`));
    return snap.exists();
  } catch (e) { return false; }
}

export async function toggleLike(articleId) {
  const fp = getFingerprint();
  const ref = doc(db, "likes", `${articleId}_${fp}`);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    try { await updateDoc(doc(db, "articles", articleId), { likes: increment(-1) }); } catch (e) {}
    return false;
  } else {
    await setDoc(ref, { articleId, fingerprint: fp, date: serverTimestamp() });
    try { await updateDoc(doc(db, "articles", articleId), { likes: increment(1) }); } catch (e) {}
    return true;
  }
}

/* ---------- Commentaires ---------- */
export async function submitComment(articleId, pseudo, message) {
  const msg = String(message || "").trim().slice(0, 1000);
  const ps  = String(pseudo || "Anonyme").trim().slice(0, 40);
  if (!msg) throw new Error("Message vide");
  await addDoc(collection(db, "comments"), {
    articleId, pseudo: ps, message: msg,
    fingerprint: getFingerprint(),
    date: serverTimestamp()
  });
}

export async function getComments(articleId) {
  const q = query(collection(db, "comments"), where("articleId", "==", articleId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
}

export async function getAllComments() {
  const snap = await getDocs(collection(db, "comments"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
}

export async function replyToComment(commentId, reply) {
  await updateDoc(doc(db, "comments", commentId), {
    reply: String(reply || "").trim().slice(0, 1000),
    replyDate: serverTimestamp()
  });
}

export async function deleteComment(commentId) {
  await deleteDoc(doc(db, "comments", commentId));
}

/* ---------- Stats agrégées ---------- */
export async function getStatsLastDays(days = 30) {
  const since = new Date(); since.setDate(since.getDate() - days + 1);
  const snap = await getDocs(collection(db, "vues"));
  const byDay = {};
  snap.forEach(d => {
    const ts = d.data().date?.toDate?.() || new Date();
    if (ts < since) return;
    const key = ts.toISOString().slice(0, 10);
    byDay[key] = (byDay[key] || 0) + 1;
  });
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: byDay[key] || 0 });
  }
  return out;
}

export async function getStatsByMonth(months = 12) {
  const since = new Date(); since.setMonth(since.getMonth() - months + 1);
  const snap = await getDocs(collection(db, "vues"));
  const byMonth = {};
  snap.forEach(d => {
    const ts = d.data().date?.toDate?.() || new Date();
    if (ts < since) return;
    const key = ts.toISOString().slice(0, 7);
    byMonth[key] = (byMonth[key] || 0) + 1;
  });
  const out = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    out.push({ month: key, count: byMonth[key] || 0 });
  }
  return out;
}

export async function getGlobalStats() {
  const [v, l, c, k, a] = await Promise.all([
    getDocs(collection(db, "vues")),
    getDocs(collection(db, "likes")),
    getDocs(collection(db, "comments")),
    getDocs(collection(db, "clics")),
    getDocs(collection(db, "articles"))
  ]);
  return { vues: v.size, likes: l.size, comments: c.size, clics: k.size, articles: a.size };
}

export async function getTopArticles(n = 5) {
  try {
    const snap = await getDocs(collection(db, "articles"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(x => x.publie)
      .sort((a, b) => (b.vues || 0) - (a.vues || 0))
      .slice(0, n);
  } catch (e) { return []; }
}

/* ---------- Auto-tracking au chargement ---------- */
let _autoInit = false;
export function initAutoTracking(pageName) {
  if (_autoInit) return;
  _autoInit = true;
  trackView(pageName);
  document.addEventListener("click", (e) => {
    const el = e.target.closest("a, button");
    if (!el) return;
    if (el.dataset.noTrack === "true") return;
    const href = el.getAttribute("href") || "";
    const label = el.getAttribute("aria-label") || el.textContent.trim().slice(0, 40) || el.tagName;
    if (href.startsWith("http") || el.tagName === "BUTTON" || href.startsWith("#")) {
      trackClick(label, href, pageName);
    }
  }, { passive: true });
}

export { db };
