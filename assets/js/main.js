
document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Mobile navigation ---------- */
  const b = document.getElementById("menuButton");
  const n = document.getElementById("mainNav");
  if (b && n) {
    b.onclick = () => {
      const open = n.classList.toggle("open");
      b.setAttribute("aria-expanded", open ? "true" : "false");
    };
  }

  /* ---------- Cookie consent banner (Google Consent Mode v2 + CMP) ---------- */
  try {
    const CONSENT_KEY = "dixani_cookie_consent";
    const readSaved = () => {
      try {
        const ls = localStorage.getItem(CONSENT_KEY);
        if (ls) return ls;
      } catch (_) {}
      const m = document.cookie.match(/(?:^|;\s*)dixani_cookie_consent=([^;]+)/);
      return m ? decodeURIComponent(m[1]) : null;
    };

    const parseState = (val) => {
      if (!val) return null;
      if (val === "accepted") return { analytics: true, ads: true, label: "accepted" };
      if (val === "rejected") return { analytics: false, ads: false, label: "rejected" };
      try {
        const obj = JSON.parse(val);
        return { analytics: !!obj.analytics, ads: !!obj.ads, label: val };
      } catch (_) {
        return null;
      }
    };

    const applyGtagConsent = (state) => {
      if (!state || typeof window.gtag !== "function") return;
      window.gtag("consent", "update", {
        ad_storage: state.ads ? "granted" : "denied",
        ad_user_data: state.ads ? "granted" : "denied",
        ad_personalization: state.ads ? "granted" : "denied",
        analytics_storage: state.analytics ? "granted" : "denied"
      });
    };

    let bar = document.getElementById("cookieConsentBanner");
    if (!bar && document.body) {
      bar = document.createElement("aside");
      bar.id = "cookieConsentBanner";
      bar.className = "cookie-banner";
      bar.setAttribute("role", "region");
      bar.setAttribute("aria-label", "Cookie consent");
      bar.innerHTML =
        '<div class="cookie-banner-inner">' +
        '<p>DIXANI uses cookies for analytics and advertising (via Google Analytics and Google AdSense) to measure site usage and serve relevant ads. Rejecting optional cookies will not affect any calculator or template. See our <a href="/privacy/">Privacy Policy</a>.</p>' +
        '<div class="cookie-banner-prefs" id="cookieConsentPrefs" hidden>' +
        '<label><input type="checkbox" checked disabled/> Essential (Tools &amp; Preferences)</label>' +
        '<label><input type="checkbox" id="cookiePrefAnalytics" checked/> Analytics (Google Analytics)</label>' +
        '<label><input type="checkbox" id="cookiePrefAds" checked/> Advertising (Google AdSense)</label>' +
        '</div>' +
        '<div class="cookie-banner-actions">' +
        '<button type="button" class="cookie-btn cookie-btn-manage" id="cookieManageBtn">Manage</button>' +
        '<button type="button" class="cookie-btn cookie-btn-reject" id="cookieRejectBtn">Reject</button>' +
        '<button type="button" class="cookie-btn cookie-btn-accept" id="cookieAcceptBtn">Accept</button>' +
        "</div></div>";
      document.body.appendChild(bar);
    }

    if (bar) {
      const prefsBox = document.getElementById("cookieConsentPrefs");
      const chkAnalytics = document.getElementById("cookiePrefAnalytics");
      const chkAds = document.getElementById("cookiePrefAds");
      const btnAccept = document.getElementById("cookieAcceptBtn");
      const btnReject = document.getElementById("cookieRejectBtn");
      const btnManage = document.getElementById("cookieManageBtn");

      const saveChoice = (val, state) => {
        try { localStorage.setItem(CONSENT_KEY, val); } catch (_) {}
        try {
          document.cookie = CONSENT_KEY + "=" + encodeURIComponent(val) + "; Max-Age=15552000; Path=/; SameSite=Lax";
        } catch (_) {}
        applyGtagConsent(state);
        bar.hidden = true;
        bar.style.display = "none";
        if (prefsBox) prefsBox.hidden = true;
        if (btnManage) btnManage.textContent = "Manage";
      };

      const saved = parseState(readSaved());
      if (saved) {
        applyGtagConsent(saved);
        bar.hidden = true;
        bar.style.display = "none";
        if (chkAnalytics) chkAnalytics.checked = saved.analytics;
        if (chkAds) chkAds.checked = saved.ads;
      } else {
        bar.hidden = false;
        bar.style.display = "";
      }

      if (btnAccept) {
        btnAccept.onclick = () => saveChoice("accepted", { analytics: true, ads: true });
      }
      if (btnReject) {
        btnReject.onclick = () => saveChoice("rejected", { analytics: false, ads: false });
      }
      if (btnManage) {
        btnManage.onclick = () => {
          if (!prefsBox) return;
          if (prefsBox.hidden) {
            prefsBox.hidden = false;
            btnManage.textContent = "Save Selection";
          } else {
            const state = {
              analytics: chkAnalytics ? !!chkAnalytics.checked : false,
              ads: chkAds ? !!chkAds.checked : false
            };
            const val = state.analytics && state.ads
              ? "accepted"
              : (!state.analytics && !state.ads ? "rejected" : JSON.stringify(state));
            saveChoice(val, state);
          }
        };
      }

      document.querySelectorAll("[data-cookie-manage]").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          if (window.googlefc && typeof window.googlefc.showRevocationMessage === "function") {
            window.googlefc.showRevocationMessage();
            return;
          }
          const cur = parseState(readSaved());
          if (cur) {
            if (chkAnalytics) chkAnalytics.checked = cur.analytics;
            if (chkAds) chkAds.checked = cur.ads;
          }
          bar.hidden = false;
          bar.style.display = "";
          if (prefsBox) prefsBox.hidden = false;
          if (btnManage) btnManage.textContent = "Save Selection";
        });
      });
    }
  } catch (_) {}

  /* ---------- Site search ---------- */
  const s = document.getElementById("siteSearch");
  const bt = document.getElementById("siteSearchButton");
  const out = document.getElementById("searchResults");
  if (!s) return;

  const INDEX = Array.isArray(window.DIXANI_SEARCH_INDEX) ? window.DIXANI_SEARCH_INDEX : [];
  const MAX_RESULTS = 8;
  const norm = (t) =>
    String(t || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s+.-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const esc = (t) =>
    String(t || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Split into words; a trailing partial word is kept for live prefix matching.
  const terms = (q) => norm(q).split(" ").filter(Boolean);

  const rx = (w) => new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  const score = (item, words) => {
    const t = norm(item.t);
    const h = norm(item.h1);
    const c = norm(item.c);
    const y = norm(item.y);
    const d = norm(item.d);
    const url = norm(item.u.replace(/\//g, " "));
    let total = 0;

    for (const w of words) {
      let best = 0;
      if (t === w || h === w) best = 100;
      else if (t.startsWith(w)) best = 70;
      else if (rx(w).test(t)) best = 55;
      else if (h.includes(w)) best = 45;
      else if (t.includes(w)) best = 30;
      else if (c.includes(w)) best = 22;
      else if (y.includes(w)) best = 15;
      else if (d.includes(w)) best = 10;
      else if (url.includes(w)) best = 8;

      if (best === 0) {
        // Partial credit so "calc" still surfaces "Calculator" pages.
        if (w.length >= 3 && t.includes(w)) best = 25;
        else if (w.length >= 3 && d.includes(w)) best = 6;
        else return 0;
      }
      total += best;
    }

    // An exact full-phrase hit on the visible title outranks scattered word hits.
    const phrase = words.join(" ");
    if (t === phrase) total += 120;
    else if (t.includes(phrase)) total += 60;
    if (item.u === "/") total -= 5;
    return total;
  };

  const rank = (words) =>
    INDEX.map((item) => ({ item, s: score(item, words) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || a.item.t.localeCompare(b.item.t));

  const close = () => {
    if (!out) return;
    out.hidden = true;
    out.innerHTML = "";
    s.setAttribute("aria-expanded", "false");
  };

  const render = (words) => {
    if (!out) return;
    if (!words.length) return close();
    const hits = rank(words).slice(0, MAX_RESULTS);

    if (!hits.length) {
      out.innerHTML =
        '<p class="search-empty">No results for &ldquo;' +
        esc(words.join(" ")) +
        '&rdquo;. Try <strong>EOQ</strong>, <strong>pallet</strong>, <strong>variance</strong>, <strong>VAT</strong> or <strong>purchase order</strong>, or <a href="#tools">browse all tools</a>.</p>';
    } else {
      out.innerHTML =
        '<ul class="search-list">' +
        hits
          .map(
            ({ item }) =>
              '<li><a href="' +
              esc(item.u) +
              '"><span class="search-hit-title">' +
              esc(item.t) +
              '</span><span class="search-hit-meta">' +
              esc(item.c) +
              " · " +
              esc(item.y) +
              "</span>" +
              (item.d ? '<span class="search-hit-desc">' + esc(item.d) + "</span>" : "") +
              "</a></li>"
          )
          .join("") +
        "</ul>";
    }
    out.hidden = false;
    s.setAttribute("aria-expanded", "true");
    if (typeof out.scrollIntoView === "function") out.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  // Button / Enter: jump straight to a confident match, otherwise show the list.
  const go = () => {
    const words = terms(s.value);
    if (!words.length) {
      s.focus();
      close();
      return;
    }
    const best = rank(words)[0];
    if (best && best.s >= 100) {
      location.href = best.item.u;
      return;
    }
    render(words);
  };

  if (bt) bt.onclick = go;
  s.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      go();
    } else if (e.key === "Escape") {
      close();
    }
  });
  s.addEventListener("input", () => render(terms(s.value)));

  document.addEventListener("click", (e) => {
    if (out && !out.hidden && e.target !== s && !out.contains(e.target) && e.target !== bt) close();
  });
});
