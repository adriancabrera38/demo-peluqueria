/* ONDA · extras: antes/después, filtro de reseñas y tarjeta de fidelidad. IIFE, sin dependencias. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function safe(fn, n) { try { fn(); } catch (e) { if (window.console) console.warn("[onda extras] " + n, e); } }

  /* Antes / después: arrastrar la barra */
  function initBA() {
    $$("[data-ba]").forEach(function (ba) {
      var range = $("[data-ba-range]", ba);
      function set(v) { ba.style.setProperty("--pos", v + "%"); }
      range.addEventListener("input", function () { set(range.value); });
      set(range.value);
      // pequeña demostración la primera vez que se ve
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (en) {
          if (!en[0].isIntersecting) return; io.disconnect();
          var t0 = performance.now();
          (function anim(now) {
            var t = (now - t0) / 1600; if (t > 1) { set(50); range.value = 50; return; }
            var v = 50 + Math.sin(t * Math.PI * 2) * 28; set(v); range.value = v; requestAnimationFrame(anim);
          })(t0);
        }, { threshold: 0.4 });
        io.observe(ba);
      }
    });
  }

  /* Reseñas por tema */
  function initReviews() {
    var chips = $("[data-rev-chips]"), list = $("[data-reviews]"); if (!chips || !list) return;
    var items = $$(".review", list);
    chips.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-topic]"); if (!b) return;
      $$("button", chips).forEach(function (x) { x.classList.toggle("is-on", x === b); });
      var t = b.getAttribute("data-topic");
      items.forEach(function (it) {
        var show = t === "todas" || (" " + it.getAttribute("data-topic") + " ").indexOf(" " + t + " ") > -1;
        it.classList.toggle("is-hidden", !show);
        if (show) { it.classList.remove("pop"); void it.offsetWidth; it.classList.add("pop"); }
      });
    });
  }

  /* Tarjeta de sellos */
  function initStamps() {
    var card = $("[data-stamps]"); if (!card) return;
    var st = $$(".st", card), count = $("[data-stamp-count]", card), msg = $("[data-stamp-msg]", card);
    function n() { return st.filter(function (s) { return s.classList.contains("on"); }).length; }
    function upd() {
      var k = n(); count.textContent = k;
      msg.textContent = k >= 10 ? "¡Tu próximo corte es gratis! 🎉" : k === 9 ? "Te falta 1 visita para tu corte gratis." : "Te faltan " + (10 - k) + " visitas para tu corte gratis.";
    }
    card.addEventListener("click", function () {
      var next = st.filter(function (s) { return !s.classList.contains("on"); })[0];
      if (!next) { st.forEach(function (s, i) { s.classList.toggle("on", i < 1); }); upd(); return; }
      next.classList.add("on", "stamp");
      setTimeout(function () { next.classList.remove("stamp"); }, 500);
      upd();
    });
    upd();
  }

  function boot() { safe(initBA, "ba"); safe(initReviews, "reviews"); safe(initStamps, "stamps"); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
