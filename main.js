(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var body = document.body;

  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }
  function madridNow() {
    try { return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" })); }
    catch (e) { return new Date(); }
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function toMin(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  function fmtMin(m) { return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function dur(m) { var h = Math.floor(m / 60), r = m % 60; return (h ? h + " h" : "") + (h && r ? " " : "") + (r ? r + " min" : ""); }
  var DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  /* 1. Menú móvil ------------------------------------------------ */
  function initMenu() {
    var b = $(".burger"), m = $("#menu");
    if (!b || !m) return;
    function set(open) {
      b.setAttribute("aria-expanded", String(open));
      b.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      m.classList.toggle("is-open", open);
      m.setAttribute("aria-hidden", String(!open));
    }
    b.addEventListener("click", function () { set(b.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
    document.addEventListener("click", function (e) { if (m.classList.contains("is-open") && !m.contains(e.target) && !b.contains(e.target)) set(false); });
  }

  /* 2. Reveals --------------------------------------------------- */
  function initReveals() {
    var items = $$("[data-reveal]");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("is-revealed"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-revealed"); io.unobserve(e.target); } });
    }, { threshold: 0.01, rootMargin: "0px 0px -5% 0px" });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      $$("[data-reveal]:not(.is-revealed)").forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-revealed"); });
    }, 6000);
  }

  /* 3. Parallax suave de las formas líquidas --------------------- */
  function initGoo() {
    var els = $$("[data-float]");
    if (!els.length || reduced) return;
    var t = false;
    function update() {
      t = false;
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        var k = parseFloat(el.getAttribute("data-float")) || 0.08;
        el.style.translate = "0 " + ((r.top + r.height / 2 - innerHeight / 2) * -k).toFixed(1) + "px";
      });
    }
    window.addEventListener("scroll", function () { if (!t) { t = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* 4. Abierto ahora + día de hoy -------------------------------- */
  function initOpenStatus() {
    if (!data.hours) return;
    var now = madridNow(), day = now.getDay(), min = now.getHours() * 60 + now.getMinutes();
    var open = null;
    (data.hours[day] || []).forEach(function (s) { if (min >= toMin(s[0]) && min < toMin(s[1])) open = s; });
    var text = open ? "Abierto ahora · hasta las " + open[1] : "Ahora cerrado · reserva online 24 h";
    $$("[data-open-status]").forEach(function (el) {
      el.classList.toggle("open", !!open);
      var l = $(".label", el); if (l) l.textContent = text;
    });
    $$('[data-days~="' + day + '"]').forEach(function (el) { el.classList.add("is-today"); });
  }

  /* 5. Firma funcional: reserva paso a paso ---------------------- */
  function initBooking() {
    var root = $("[data-booking]");
    if (!root || root.dataset.bound) return;
    root.dataset.bound = "1";
    var S = { services: [], stylist: "cualquiera", date: null, time: null, month: null };
    var panels = $$(".step-panel", root), bar = $$(".steps-bar li", root);
    var step = 0;
    var err = $(".wiz-err", root);
    var back = $("[data-back]", root), next = $("[data-next]", root), nav = $(".wiz-nav", root);
    var sum = $("[data-summary]");
    var svcById = {}, styById = {};
    (data.services || []).forEach(function (s) { svcById[s.id] = s; });
    (data.stylists || []).forEach(function (s) { styById[s.id] = s; });

    // Preselección desde la URL: reservar.html?servicio=rizos
    var q = /servicio=([a-z-]+)/.exec(location.search);
    if (q) { var box = root.querySelector('input[name="servicio"][value="' + q[1] + '"]'); if (box) box.checked = true; }

    function readServices() { S.services = $$('input[name="servicio"]:checked', root).map(function (i) { return svcById[i.value]; }).filter(Boolean); }
    function totalMin() { return S.services.reduce(function (a, s) { return a + s.min; }, 0); }
    function totalPrice() {
      var extra = (styById[S.stylist] || {}).extra || 0;
      return S.services.reduce(function (a, s) { return a + s.price; }, 0) + (S.services.length ? extra : 0);
    }

    /* ---- calendario ---- */
    var cal = $(".cal", root), calLbl = $("[data-cal-label]", root), prev = $("[data-cal-prev]", root), nxt = $("[data-cal-next]", root);
    var today = madridNow(); today.setHours(0, 0, 0, 0);
    var maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + 60);
    S.month = new Date(today.getFullYear(), today.getMonth(), 1);

    function workingDays() { return (styById[S.stylist] || {}).days || []; }
    function dayOpen(d) {
      var slots = data.hours[d.getDay()] || [];
      if (!(d >= today && d <= maxDate && slots.length && workingDays().indexOf(d.getDay()) > -1)) return false;
      // Hoy solo cuenta si aún queda tiempo antes del cierre (mínimo 1 h de antelación + 30 min de servicio)
      if (d.getTime() === today.getTime()) {
        var n = madridNow(), nowMin = n.getHours() * 60 + n.getMinutes();
        return nowMin + 90 <= toMin(slots[slots.length - 1][1]);
      }
      return true;
    }
    function renderCal() {
      var y = S.month.getFullYear(), m = S.month.getMonth();
      calLbl.textContent = MONTHS[m] + " " + y;
      prev.disabled = y === today.getFullYear() && m === today.getMonth();
      nxt.disabled = new Date(y, m + 1, 1) > maxDate;
      var html = ["L", "M", "X", "J", "V", "S", "D"].map(function (d) { return '<span class="dow" aria-hidden="true">' + d + "</span>"; }).join("");
      var first = (new Date(y, m, 1).getDay() + 6) % 7;
      for (var i = 0; i < first; i++) html += "<span></span>";
      var days = new Date(y, m + 1, 0).getDate();
      for (var d = 1; d <= days; d++) {
        var date = new Date(y, m, d), iso = y + "-" + pad(m + 1) + "-" + pad(d);
        var ok = dayOpen(date);
        var cls = date.getTime() === today.getTime() ? ' class="today"' : "";
        html += '<button type="button"' + cls + ' data-date="' + iso + '" aria-pressed="' + (S.date === iso) + '" aria-label="' + DAYS[date.getDay()] + " " + d + " de " + MONTHS[m] + (ok ? "" : ", no disponible") + '"' + (ok ? "" : " disabled") + ">" + d + "</button>";
      }
      cal.innerHTML = html;
    }
    cal.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-date]"); if (!b || b.disabled) return;
      S.date = b.dataset.date; S.time = null;
      renderCal(); renderTimes(); renderSummary();
    });
    prev.addEventListener("click", function () { S.month = new Date(S.month.getFullYear(), S.month.getMonth() - 1, 1); renderCal(); });
    nxt.addEventListener("click", function () { S.month = new Date(S.month.getFullYear(), S.month.getMonth() + 1, 1); renderCal(); });

    /* ---- horas: huecos de 15 min que caben antes del cierre; ocupación simulada estable ---- */
    var times = $(".times", root);
    function seeded(str) {
      var h = 2166136261;
      for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
      return h >>> 0;
    }
    function renderTimes() {
      if (!S.date) { times.innerHTML = '<p class="times-empty">Elige primero un día en el calendario.</p>'; return; }
      var d = new Date(S.date + "T12:00:00"), need = totalMin() || 30, out = "";
      var nowMin = S.date === today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate()) ? madridNow().getHours() * 60 + madridNow().getMinutes() + 60 : -1;
      (data.hours[d.getDay()] || []).forEach(function (sl) {
        for (var m = toMin(sl[0]); m + need <= toMin(sl[1]); m += 30) {
          var busy = seeded(S.date + S.stylist + m) % 3 === 0 || m < nowMin;
          out += '<button type="button" data-time="' + fmtMin(m) + '" aria-pressed="' + (S.time === fmtMin(m)) + '"' + (busy ? " disabled" : "") + ">" + fmtMin(m) + "</button>";
        }
      });
      times.innerHTML = out || '<p class="times-empty">No quedan huecos para esa duración. Prueba otro día.</p>';
    }
    times.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-time]"); if (!b || b.disabled) return;
      S.time = b.dataset.time; renderTimes(); renderSummary();
    });

    /* ---- resumen ---- */
    function renderSummary() {
      if (!sum) return;
      var st = styById[S.stylist] || {};
      var list = S.services.length ? S.services.map(function (s) { return s.name; }).join(" + ") : "—";
      var when = "—";
      if (S.date) {
        var d = new Date(S.date + "T12:00:00");
        when = DAYS[d.getDay()] + " " + d.getDate() + " de " + MONTHS[d.getMonth()] + (S.time ? " · " + S.time : "");
      }
      $("[data-s-services]", sum).textContent = list;
      $("[data-s-stylist]", sum).textContent = st.name || "—";
      $("[data-s-when]", sum).textContent = when;
      $("[data-s-dur]", sum).textContent = totalMin() ? dur(totalMin()) : "—";
      $("[data-s-total]", sum).textContent = totalPrice() + " €";
      var ex = $("[data-s-extra]", sum);
      if (ex) ex.textContent = st.extra && S.services.length ? "Incluye suplemento de " + st.extra + " € por " + st.name : "";
    }

    /* ---- navegación entre pasos ---- */
    function validate() {
      if (step === 0 && !S.services.length) return "Elige al menos un servicio.";
      if (step === 2 && !S.date) return "Elige un día.";
      if (step === 2 && !S.time) return "Elige una hora.";
      if (step === 3) {
        var ok = true;
        $$("[required]", panels[3]).forEach(function (el) {
          var v = el.value.trim(), msg = "";
          if (!v) msg = "Campo obligatorio";
          else if (el.type === "tel" && v.replace(/\D/g, "").length < 9) msg = "Teléfono no válido";
          else if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = "Email no válido";
          var w = el.closest(".field"); w.classList.toggle("is-invalid", !!msg); $(".err", w).textContent = msg;
          if (msg) ok = false;
        });
        if (!ok) return "Revisa tus datos.";
      }
      return "";
    }
    function show(n) {
      step = n;
      panels.forEach(function (p, i) { p.hidden = i !== n; });
      bar.forEach(function (li, i) { li.classList.toggle("done", i < n); li.classList.toggle("current", i === n); });
      back.disabled = n === 0;
      back.style.visibility = n === 0 || n === panels.length - 1 ? "hidden" : "";
      nav.hidden = n === panels.length - 1;
      $("[data-next-label]", root).textContent = n === 3 ? "Confirmar reserva" : "Continuar";
      err.textContent = "";
      if (n === 2) { renderCal(); renderTimes(); }
      var h = $("h2", panels[n]);
      if (h && root.dataset.started) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
      root.dataset.started = "1";
      var top = root.getBoundingClientRect().top;
      if (top < 80) window.scrollTo({ top: top + scrollY - 120, behavior: reduced ? "auto" : "smooth" });
    }
    next.addEventListener("click", function () {
      readServices();
      var e = validate();
      if (e) { err.textContent = e; return; }
      if (step === 3) {
        next.disabled = true;
        $("[data-next-label]", root).textContent = "Reservando…";
        setTimeout(function () {
          next.disabled = false;
          var n = (root.querySelector("#r-nombre").value.trim().split(" ")[0]) || "";
          $("[data-done-name]", root).textContent = n;
          show(4);
        }, 900);
        return;
      }
      show(step + 1);
    });
    back.addEventListener("click", function () { if (step > 0) show(step - 1); });
    root.addEventListener("change", function (e) {
      if (e.target.name === "servicio") { readServices(); S.time = null; }
      if (e.target.name === "estilista") {
        S.stylist = e.target.value;
        if (S.date && !dayOpen(new Date(S.date + "T00:00:00"))) { S.date = null; S.time = null; }
      }
      err.textContent = "";
      renderSummary();
    });
    readServices(); renderSummary(); show(0);
  }

  /* Arranque ---------------------------------------------------- */
  function boot() {
    safe(initMenu, "initMenu");
    safe(initReveals, "initReveals");
    safe(initGoo, "initGoo");
    safe(initOpenStatus, "initOpenStatus");
    safe(initBooking, "initBooking");
    if (window.gsap && window.ScrollTrigger) { try { gsap.registerPlugin(ScrollTrigger); } catch (_) {} }
    window.__KB_OK = true;
    requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.add("is-loaded"); }); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
