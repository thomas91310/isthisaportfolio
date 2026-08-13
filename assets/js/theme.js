/* Day/night theme. Loaded synchronously from <head> so the field is already
   correct at first paint. */
(function () {
  var KEY = "theme";
  var DAY = "vellum";
  var NIGHT = "venom";
  var TAG = "theme:";

  function valid(value) {
    return value === DAY || value === NIGHT ? value : null;
  }

  /* Records carry the time of the choice: "<theme>|<epoch ms>". Three stores
     are used because none works everywhere — cookies are dead on file://,
     localStorage is blocked there by some browsers, and window.name only
     spans one tab. Without the timestamp, a store that missed an update could
     revive an old theme later, which reads as the mode changing on its own. */
  function parse(raw) {
    if (!raw) return null;
    var parts = String(raw).split("|");
    var theme = valid(parts[0]);
    if (!theme) return null;
    var at = parseInt(parts[1], 10);
    return { theme: theme, at: isNaN(at) ? 0 : at };
  }

  function fromLocal() {
    try {
      return parse(localStorage.getItem(KEY));
    } catch (e) {
      return null;
    }
  }

  function fromCookie() {
    var match = document.cookie.match(/(?:^|;\s*)theme=([^;]*)/);
    return match ? parse(decodeURIComponent(match[1])) : null;
  }

  function fromName() {
    try {
      return window.name.indexOf(TAG) === 0
        ? parse(window.name.slice(TAG.length))
        : null;
    } catch (e) {
      return null;
    }
  }

  function mostRecent() {
    var records = [fromLocal(), fromCookie(), fromName()];
    var best = null;
    for (var i = 0; i < records.length; i++) {
      if (records[i] && (!best || records[i].at > best.at)) best = records[i];
    }
    return best;
  }

  function store(record) {
    var raw = record.theme + "|" + record.at;
    try {
      localStorage.setItem(KEY, raw);
    } catch (e) {
      /* ignore */
    }
    try {
      document.cookie =
        KEY +
        "=" +
        encodeURIComponent(raw) +
        ";path=/;max-age=31536000;samesite=lax";
    } catch (e) {
      /* ignore */
    }
    try {
      if (!window.name || window.name.indexOf(TAG) === 0) {
        window.name = TAG + raw;
      }
    } catch (e) {
      /* ignore */
    }
  }

  function paint(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btns = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", String(theme === NIGHT));
      btns[i].setAttribute(
        "aria-label",
        theme === NIGHT ? "Switch to day theme" : "Switch to night theme"
      );
    }
  }

  /* Adopt the newest record and copy it back everywhere, so disagreeing
     stores converge instead of taking turns winning. */
  function sync() {
    var record = mostRecent();
    if (record) store(record);
    paint(record ? record.theme : new Date().getHours() >= 18 ? NIGHT : DAY);
  }

  sync();

  document.addEventListener("DOMContentLoaded", sync);

  /* Back/forward restores the page with whatever attribute it had then. */
  window.addEventListener("pageshow", sync);

  /* Another tab made a choice. */
  window.addEventListener("storage", function (event) {
    if (!event || event.key === null || event.key === KEY) sync();
  });

  document.addEventListener("click", function (event) {
    var btn =
      event.target && event.target.closest
        ? event.target.closest("[data-theme-toggle]")
        : null;
    if (!btn) return;
    var next =
      document.documentElement.getAttribute("data-theme") === NIGHT
        ? DAY
        : NIGHT;
    store({ theme: next, at: Date.now() });
    paint(next);
  });
})();
