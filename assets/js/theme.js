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

  /* Spoken word per mode. Resolved against this script's own URL because pages
     sit at two directory depths, so a page-relative path would miss in
     writing/. */
  var CLIPS = (function () {
    try {
      var src = document.currentScript && document.currentScript.src;
      return src ? new URL("../audio/", src).href : "assets/audio/";
    } catch (e) {
      return "assets/audio/";
    }
  })();

  var clips = {};

  function clip(theme) {
    var name = theme === NIGHT ? "nuit" : "jour";
    if (!clips[name]) {
      var el = new Audio();
      el.preload = "auto";
      el.volume = 0.7;
      el.src = CLIPS + name + ".mp3";
      clips[name] = el;
    }
    return clips[name];
  }

  /* Only ever called from a click, so the autoplay policy is satisfied. Failure
     to play — no codec, no output device, a policy we didn't anticipate — must
     never take the theme switch down with it. */
  function say(theme) {
    try {
      var next = clip(theme);
      var prev = clips[theme === NIGHT ? "jour" : "nuit"];
      /* Toggling fast shouldn't leave the two words talking over each other. */
      if (prev && prev !== next) {
        prev.pause();
        prev.currentTime = 0;
      }
      next.currentTime = 0;
      var played = next.play();
      if (played && played.catch) played.catch(function () {});
    } catch (e) {
      /* ignore */
    }
  }

  var struckTimer = null;

  /* Marks the word just chosen, so the click reads as landing on it. The class
     is dropped on a timer rather than animationend, which never fires for
     readers who asked for reduced motion. */
  function strike(btn, theme) {
    clearTimeout(struckTimer);
    var words = btn.querySelectorAll(".theme-toggle-opt");
    for (var i = 0; i < words.length; i++) words[i].classList.remove("is-struck");

    var word = btn.querySelector(
      '.theme-toggle-opt[data-opt="' + (theme === NIGHT ? "night" : "day") + '"]'
    );
    if (!word) return;
    /* Forces a reflow, without which a repeat click never restarts. */
    void word.offsetWidth;
    word.classList.add("is-struck");
    struckTimer = setTimeout(function () {
      word.classList.remove("is-struck");
    }, 500);
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

  document.addEventListener("DOMContentLoaded", function () {
    sync();
    /* Fetch both clips up front so the first click speaks without lag. */
    clip(DAY);
    clip(NIGHT);
  });

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
    strike(btn, next);
    say(next);
  });
})();
