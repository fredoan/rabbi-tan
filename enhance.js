/* ============================================================
   enhance.js — Améliorations transverses (partagé)
   Inclus par : index, actualites, biographie, services, galerie,
                boutique, article
   ============================================================ */
import { initAutoTracking } from "./engagement.js";

const ONG_LINKS = [
  { label: "🏠 Accueil ONG", href: "https://ongvivremieux.netlify.app/" },
  { label: "🛍️ Boutique ONG", href: "https://ongvivremieux.netlify.app/#boutique" },
  { label: "📅 Planner", href: "https://ongvivremieux.netlify.app/#planner" },
  { label: "📦 Produits", href: "https://ongvivremieux.netlify.app/#produits" }
];

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
    <button id="rt-ong-banner-close" aria-label="Fermer">✕</button>
  `;
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
    </div>
  `;
  // Insérer avant la section "contact" si elle existe, sinon à la fin
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

/* ---------- 4. Auto-tracking de la page ---------- */
function autoDetectPageName() {
  const path = location.pathname.split("/").pop() || "index";
  return path.replace(".html", "").replace(/[^a-z0-9-]/gi, "") || "index";
}

/* ---------- 5. Enrichir le carrousel produits (boutique + index) ---------- */
export async function mountProductCarousel(selector, opts = {}) {
  const wrap = document.querySelector(selector);
  if (!wrap) return;

  const { products } = await import("./products-data.js");
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  // duplication pour marquee infini
  const display = [...shuffled, ...shuffled];

  const track = document.createElement("div");
  track.className = "rt-carousel-track";
  track.innerHTML = display.map(p => `
    <a class="rt-product-card" href="boutique.html#product-${p.id}" data-no-track="false">
      <span class="rt-product-emoji">${p.emoji}</span>
      <div class="rt-product-name">${p.name}</div>
      <div class="rt-product-price">${p.price || "Sur commande"}</div>
      <span class="rt-product-cta">Voir / Commander</span>
    </a>
  `).join("");
  wrap.innerHTML = "";
  wrap.appendChild(track);
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  injectOngBanner();
  injectOngFooterLink();
  initAutoTracking(autoDetectPageName());
});
