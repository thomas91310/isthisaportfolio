(() => {
  const path = (window.location.pathname.replace(/\/+$/, "") || "/").toLowerCase();
  const segment = path.split("/").filter(Boolean).pop() || "index";

  const matchers = {
    home: () => segment === "index" || path === "/" || path === "",
    projects: () => segment === "projects" || segment === "projects.html",
    writing: () => path.includes("/writing"),
    experience: () => segment === "experience" || segment === "experience.html",
  };

  document.querySelectorAll(".site-nav a[data-nav]").forEach((link) => {
    const key = link.getAttribute("data-nav");
    if (key && matchers[key]?.()) link.classList.add("is-active");
  });

  const main = document.querySelector(".site-main");
  if (main && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    main.classList.add("is-entering");
  }

  const gallery = document.querySelector("[data-project-gallery]");
  if (!gallery) return;

  const styles = getComputedStyle(document.documentElement);
  const min = Number.parseFloat(styles.getPropertyValue("--project-size-min")) || 148;
  const max = Number.parseFloat(styles.getPropertyValue("--project-size-max")) || 260;
  const span = Math.max(0, max - min);

  gallery.querySelectorAll(".project-item").forEach((item) => {
    const size = Math.round(min + Math.random() * span);
    item.style.setProperty("--project-size", `${size}px`);
  });
})();
