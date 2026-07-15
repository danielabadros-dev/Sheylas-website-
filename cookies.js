/* Banner de cookies + Google Analytics 4 (solo con consentimiento) */
(function () {
  // ID de medición de GA4 para bysheylaphotography.com (formato G-XXXXXXXXXX).
  // Mientras esté vacío, no se carga ningún script de Google.
  var GA_ID = "G-5EV9YJ418V";

  var STORAGE_KEY = "sheyla-cookie-consent"; // "accepted" | "rejected"

  function getConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {}
    applyConsent();
    hideBanner();
  }

  function loadGa() {
    if (!GA_ID) return;
    window["ga-disable-" + GA_ID] = false;
    if (document.getElementById("ga-script")) {
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted"
    });
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
    var s = document.createElement("script");
    s.id = "ga-script";
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }

  function disableGa() {
    if (!GA_ID) return;
    window["ga-disable-" + GA_ID] = true;
    // Borra las cookies _ga que hubiera dejado una aceptación anterior.
    document.cookie.split("; ").forEach(function (cookie) {
      var name = cookie.split("=")[0];
      if (name === "_ga" || name.indexOf("_ga_") === 0) {
        var expire = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        document.cookie = expire;
        document.cookie = expire + "; domain=." + location.hostname;
      }
    });
  }

  function applyConsent() {
    if (getConsent() === "accepted") {
      loadGa();
    } else {
      disableGa();
    }
  }

  function hideBanner() {
    var banner = document.getElementById("cookie-banner");
    if (banner) banner.remove();
  }

  function showBanner() {
    if (document.getElementById("cookie-banner")) return;
    var banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Aviso de cookies");
    banner.innerHTML =
      '<p class="cookie-banner-text">Usamos cookies analíticas (Google Analytics) para entender cómo se usa la web, solo si nos das permiso. <a href="cookies.html">Más información</a>.</p>' +
      '<div class="cookie-banner-actions">' +
      '<button type="button" id="cookie-reject" class="btn btn-gold-outline btn-sm">Rechazar</button>' +
      '<button type="button" id="cookie-accept" class="btn btn-gold btn-sm">Aceptar</button>' +
      "</div>";
    document.body.appendChild(banner);
    document.getElementById("cookie-accept").addEventListener("click", function () {
      setConsent("accepted");
    });
    document.getElementById("cookie-reject").addEventListener("click", function () {
      setConsent("rejected");
    });
  }

  // Botón "cambiar mi elección" (existe solo en cookies.html).
  var reopen = document.getElementById("cookie-reopen");
  if (reopen) {
    reopen.addEventListener("click", showBanner);
  }

  if (getConsent() === null) {
    showBanner();
  }
  applyConsent();
})();
