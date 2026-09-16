(function () {
  "use strict";

  /* ---------- language toggle ---------- */
  var root = document.documentElement;
  var body = document.body;
  var toggleBtn = document.getElementById("langToggle");
  var STORAGE_KEY = "taha-site-lang";

  function applyLang(lang) {
    root.setAttribute("data-lang", lang);
    body.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "fa" ? "fa" : "en");
    root.setAttribute("dir", lang === "fa" ? "rtl" : "ltr");
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (saved === "en" || saved === "fa") applyLang(saved);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      var current = root.getAttribute("data-lang") === "fa" ? "fa" : "en";
      applyLang(current === "fa" ? "en" : "fa");
    });
  }

  /* ---------- live Tehran clock ---------- */
  var clockEls = [
    document.getElementById("tehranClock"),
    document.getElementById("tehranClockFooter")
  ].filter(Boolean);

  function tick() {
    if (!clockEls.length) return;
    try {
      var formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Tehran",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
      var value = formatter.format(new Date());
      clockEls.forEach(function (el) { el.textContent = value; });
    } catch (e) {
      /* Intl / timezone unsupported: leave placeholder */
    }
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- count-up stats, once, on scroll into view ---------- */
  var statNums = document.querySelectorAll(".stat-num[data-count]");
  if (statNums.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseInt(el.getAttribute("data-count"), 10) || 0;
          var start = null;
          var duration = 900;

          function step(ts) {
            if (start === null) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = String(target);
            }
          }
          requestAnimationFrame(step);
          observer.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );
    statNums.forEach(function (el) { observer.observe(el); });
  } else {
    statNums.forEach(function (el) {
      el.textContent = el.getAttribute("data-count");
    });
  }

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
