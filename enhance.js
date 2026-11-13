/* ============================================================
   enhance.js — Version complète et définitive
   Bannière ONG + bloc ONG + carrousel + stats publiques
   + stats hero + partages produits
   ============================================================ */
import { initAutoTracking, getGlobalStats } from "./engagement.js";
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

/* ---------- 1. Bannière ONG (dismissible) ---------- */
function injectOngBanner() {
  if (localStorage.getItem("rt_ong_dismissed") === "1") return;
  if (document.getElementById("rt-ong-banner")) return;
  const div = document.createElement("div");
  div.id = "rt-ong-banner";
  div.setAttribute("role", "region");
  div.setAttribute("aria-label", "Découvrez l'ONG Vivre Mieux");
  div.innerHTML = `
    <span>✨ Découvrez notre ONG partenaire : <a href="https://ongvivremieux.netlify.app/" target="_blank" rel="noopener">Vivre Mieux</a> — boutique, planner et produits spirituels</span>
    <button id="rt-ong-banner-close" aria-label="Fermer">✕</button>`;
  document.body.prepend(div);
  document.body.classList.add("rt-ong-active");
  document.getElementById("rt-ong-banner-close").addEventListener("click", () => {
    div.remove();
    document.body.classList.remove("rt-ong-active");
    localStorage.setItem("rt_ong_dismissed", "1");
  });
}

/* ---------- 2. Bloc ONG (uniquement sur index.html) ---------- */
export function injectOngBlock() {
  const main = document.querySelector("main");
  if (!main || document.getElementById("rt-ong-block")) return;
  const section = document.createElement("section");
  section.id = "rt-ong-block";
  section.setAttribute("aria-label", "ONG Vivre Mieux");
  section.innerHTML = `
    <div class="rt-ong-inner">
      <span class="rt-ong-tag">✦ Notre ONG partenaire</span>
      <h2 class="rt-ong-title">ONG Vivre Mieux</h2>
      <p class="rt-ong-desc">
        Promotion des valeurs endogènes positives, accompagnement social et spirituel.
        Découvrez la boutique, le planner et les produits solidaires de notre ONG partenaire.
      </p>
      <div class="rt-ong-links">
        <a href="https://ongvivremieux.netlify.app/" target="_blank" rel="noopener" class="rt-ong-link primary">Découvrir l'ONG →</a>
        <a href="https://ongvivremieux.netlify.app/#boutique" target="_blank" rel="noopener" class="rt-ong-link">🛍️ Boutique</a>
        <a href="https://ongvivremieux.netlify.app/#planner" target="_blank" rel="noopener" class="rt-ong-link">📅 Planner</a>
        <a href="https://ongvivremieux.netlify.app/#produits" target="_blank" rel="noopener" class="rt-ong-link">📦 Produits</a>
      </div>
    </div>`;
  const contact = main.querySelector("#contact");
  if (contact) contact.parentNode.insertBefore(section, contact);
  else main.appendChild(section);
}

/* ---------- 3. Lien ONG dans le footer ---------- */
function injectOngFooterLink() {
  const footerNav = document.querySelector("footer .footer-col ul");
  if (!footerNav || footerNav.querySelector('[data-ong]')) return;
  const li = document.createElement("li");
  li.innerHTML = `<a href="https://ongvivremieux.netlify.app/" target="_blank" rel="noopener" class="rt-footer-ong" data-ong="1">🌿 ONG Vivre Mieux</a>`;
  footerNav.appendChild(li);
}

/* ---------- 4. Badge compteur dans le hero ---------- */
export async function injectHeroStats() {
  const heroBtns = document.querySelector('#hero .hero-btns');
  if (!heroBtns || document.querySelector('.rt-hero-stats-badge')) return;

  const badge = document.createElement('div');
  badge.className = 'rt-hero-stats-badge';
  badge.innerHTML = `<span class="rt-hero-stats-icon">👁️</span><span class="rt-hero-stats-text">Chargement…</span>`;
  heroBtns.parentNode.insertBefore(badge, heroBtns.nextSibling);

  try {
    // Compte uniquement les articles PUBLIÉS (pas les brouillons)
    const artSnap = await getDocs(collection(db, "articles"));
    const publishedCount = artSnap.docs.filter(d => d.data().publie === true).length;

    const stats = await getGlobalStats();
    const views = stats.vues.toLocaleString('fr-FR');

    let text;
    if (publishedCount > 0 && stats.vues > 0) {
      text = `Déjà +${views} visite${stats.vues > 1 ? 's' : ''} — ${publishedCount} article${publishedCount > 1 ? 's' : ''} publié${publishedCount > 1 ? 's' : ''}`;
    } else if (stats.vues > 0) {
      text = `Déjà +${views} visite${stats.vues > 1 ? 's' : ''}`;
    } else if (publishedCount > 0) {
      text = `${publishedCount} article${publishedCount > 1 ? 's' : ''} publié${publishedCount > 1 ? 's' : ''}`;
    } else {
      text = "Rejoignez notre communauté";
    }
    badge.querySelector('.rt-hero-stats-text').textContent = text;
    console.log('[hero-stats] Vue:', stats.vues, '| Articles publiés:', publishedCount);
  } catch (e) {
    console.warn("[hero-stats] Erreur:", e);
    badge.querySelector('.rt-hero-stats-text').textContent = "Rejoignez notre communauté";
  }
}

/* ---------- 5. Section stats publiques (bas de index) ---------- */
export async function injectLiveStats() {
  const main = document.querySelector("main");
  if (!main || document.getElementById("rt-live-stats")) return;

  const section = document.createElement("section");
  section.id = "rt-live-stats";
  section.setAttribute("aria-label", "Statistiques publiques");
  section.innerHTML = `
    <div class="section-inner" style="padding-top:60px;padding-bottom:60px;">
      <div style="text-align:center;margin-bottom:40px;">
        <span class="section-tag">✦ En direct</span>
        <h2 class="section-title">Notre communauté grandit</h2>
        <div class="section-line"></div>
        <p style="max-width:650px;margin:0 auto;color:var(--text-soft);">
          Rejoignez des milliers de personnes qui consultent ce site chaque jour.
          Ces chiffres sont mis à jour en temps réel.
        </p>
      </div>
      <div class="rt-live-stats-grid">
        <div class="rt-live-stat">
          <div class="rt-live-icon">👁️</div>
          <div class="rt-live-value" id="rt-stat-views">—</div>
          <div class="rt-live-label">Visites totales</div>
        </div>
        <div class="rt-live-stat">
          <div class="rt-live-icon">❤️</div>
          <div class="rt-live-value" id="rt-stat-likes">—</div>
          <div class="rt-live-label">J'aime</div>
        </div>
        <div class="rt-live-stat">
          <div class="rt-live-icon">💬</div>
          <div class="rt-live-value" id="rt-stat-comments">—</div>
          <div class="rt-live-label">Commentaires</div>
        </div>
        <div class="rt-live-stat">
          <div class="rt-live-icon">📰</div>
          <div class="rt-live-value" id="rt-stat-articles">—</div>
          <div class="rt-live-label">Articles publiés</div>
        </div>
      </div>
    </div>`;

  const contact = main.querySelector("#contact");
  if (contact) contact.parentNode.insertBefore(section, contact);
  else main.appendChild(section);

  try {
    const stats = await getGlobalStats();
    animateNumber("rt-stat-views", stats.vues);
    animateNumber("rt-stat-likes", stats.likes);
    animateNumber("rt-stat-comments", stats.comments);
    try {
      const artSnap = await getDocs(collection(db, "articles"));
      const published = artSnap.docs.filter(d => d.data().publie === true).length;
      animateNumber("rt-stat-articles", published);
    } catch (e) {
      animateNumber("rt-stat-articles", stats.articles);
    }
  } catch (e) {
    console.warn("Stats non disponibles :", e);
    document.querySelectorAll(".rt-live-value").forEach(el => el.textContent = "—");
  }
}

function animateNumber(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  const duration = 1600;
  const startTime = performance.now();
  function step(now) {
    const p = Math.min((now - startTime) / duration, 1);
    el.textContent = Math.floor(target * p).toLocaleString("fr-FR");
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString("fr-FR") + " +";
  }
  requestAnimationFrame(step);
}

/* ---------- 6. Boutons partage sur chaque produit ---------- */
export function attachProductShareButtons() {
  const cards = document.querySelectorAll(".product-card");
  if (!cards.length) return;

  cards.forEach(card => {
    if (card.querySelector(".rt-product-share")) return;
    const id = card.id;
    if (!id) return;

    const productName = card.querySelector(".product-name")?.textContent?.trim() || "Produit";
    const shareUrl = `${location.origin}${location.pathname}#${id}`;
    const shareText = `Découvrez "${productName}" de Rabbi TAN — Boutique spirituelle`;

    const shareBar = document.createElement("div");
    shareBar.className = "rt-product-share";
    shareBar.innerHTML = `
      <span class="rt-share-label">Partager :</span>
      <a href="https://wa.me/?text=${encodeURIComponent(shareText + ' — ' + shareUrl)}"
         target="_blank" rel="noopener" class="rt-share-btn wa" title="WhatsApp" aria-label="Partager sur WhatsApp">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.11 1.523 5.836L0 24l6.336-1.506A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
      </a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}"
         target="_blank" rel="noopener" class="rt-share-btn fb" title="Facebook" aria-label="Partager sur Facebook">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </a>
      <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}"
         target="_blank" rel="noopener" class="rt-share-btn tw" title="X / Twitter" aria-label="Partager sur X">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
      <button class="rt-share-btn cp" title="Copier le lien" aria-label="Copier le lien" data-url="${shareUrl}">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
      </button>`;
    shareBar.querySelector(".cp").addEventListener("click", function () {
      navigator.clipboard.writeText(this.dataset.url).then(() => {
        const old = this.innerHTML;
        this.innerHTML = "✅";
        setTimeout(() => this.innerHTML = old, 1500);
      });
    });
    card.appendChild(shareBar);
  });
}

/* ---------- 7. Carrousel produits ---------- */
export async function mountProductCarousel(selector) {
  const wrap = document.querySelector(selector);
  if (!wrap) return;
  const { products } = await import("./products-data.js");
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  const display = [...shuffled, ...shuffled];
  const track = document.createElement("div");
  track.className = "rt-carousel-track";
  track.innerHTML = display.map(p => `
    <a class="rt-product-card" href="boutique.html#product-${p.id}">
      <span class="rt-product-emoji">${p.emoji}</span>
      <div class="rt-product-name">${p.name}</div>
      <div class="rt-product-price">${p.price || "Sur commande"}</div>
      <span class="rt-product-cta">Voir / Commander</span>
    </a>`).join("");
  wrap.innerHTML = "";
  wrap.appendChild(track);
}

/* ---------- Auto-détection de page ---------- */
function autoDetectPageName() {
  const path = location.pathname.split("/").pop() || "index";
  return path.replace(".html", "").replace(/[^a-z0-9-]/gi, "") || "index";
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  injectOngBanner();
  injectOngFooterLink();
  initAutoTracking(autoDetectPageName());

  const page = autoDetectPageName();
  if (page === "index" || page === "") {
    injectHeroStats();
    injectLiveStats();
  }
  if (page === "boutique") {
    setTimeout(attachProductShareButtons, 600);
  }
});
