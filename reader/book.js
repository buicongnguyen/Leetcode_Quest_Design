const THEME_KEY = "leetcode-design-quest-theme";
const SIDEBAR_SCROLL_KEY = "leetcode-design-reader-sidebar-scroll";
const CODE_LANGUAGE_KEY = "leetcode-design-reader-code-language";
const menu = document.querySelector("#reader-menu");
const readerSidebar = document.querySelector("#reader-sidebar");
const searchDialog = document.querySelector("#reader-search");
const searchInput = document.querySelector("#reader-search-input");
const searchResults = document.querySelector("#reader-search-results");
const themeButton = document.querySelector("#reader-theme");
let searchIndex = [];
let sidebarSaveTimer;

function saveSidebarPosition() {
  try {
    sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(readerSidebar.scrollTop));
  } catch {
    // Navigation still works when browser storage is unavailable.
  }
}

function restoreSidebarPosition() {
  let savedPosition = null;
  try {
    const stored = sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
    const parsed = Number(stored);
    if (stored !== null && Number.isFinite(parsed) && parsed >= 0) savedPosition = parsed;
  } catch {
    // Fall back to positioning the active page in view.
  }

  requestAnimationFrame(() => {
    if (savedPosition !== null) {
      readerSidebar.scrollTop = savedPosition;
      return;
    }
    const activePage = readerSidebar.querySelector("a.active");
    if (activePage) readerSidebar.scrollTop = Math.max(0, activePage.offsetTop - readerSidebar.clientHeight / 3);
  });
}

function setTheme(value) {
  const theme = ["light", "dark"].includes(value) ? value : "dark";
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  const light = theme === "light";
  themeButton.setAttribute("aria-pressed", String(light));
  themeButton.setAttribute("aria-label", light ? "Use dark theme" : "Use light theme");
}

function buildOutline() {
  const headings = [...document.querySelectorAll(".reader-article h2[id]")];
  const outline = document.querySelector("#article-outline");
  outline.innerHTML = headings.map(heading => `<a href="#${heading.id}">${heading.textContent}</a>`).join("");
  if (!headings.length) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      outline.querySelectorAll("a").forEach(link => link.classList.toggle("active", link.hash === `#${entry.target.id}`));
    }
  }, { rootMargin: "-15% 0px -75%" });
  headings.forEach(heading => observer.observe(heading));
}

function activateCodeLanguage(group, language, moveFocus = false) {
  const tabs = [...group.querySelectorAll('[role="tab"]')];
  const panels = [...group.querySelectorAll('[role="tabpanel"]')];
  const selected = tabs.find(tab => tab.dataset.codeLanguage === language) || tabs[0];
  if (!selected) return;
  tabs.forEach(tab => {
    const active = tab === selected;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  panels.forEach(panel => { panel.hidden = panel.dataset.codePanel !== selected.dataset.codeLanguage; });
  localStorage.setItem(CODE_LANGUAGE_KEY, selected.dataset.codeLanguage);
  if (moveFocus) selected.focus();
}

function setupCodeWorkbenches() {
  const savedLanguage = localStorage.getItem(CODE_LANGUAGE_KEY) || "python";
  document.querySelectorAll("[data-code-tabs]").forEach(group => {
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    activateCodeLanguage(group, savedLanguage);
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activateCodeLanguage(group, tab.dataset.codeLanguage));
      tab.addEventListener("keydown", event => {
        let nextIndex = null;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex === null) return;
        event.preventDefault();
        activateCodeLanguage(group, tabs[nextIndex].dataset.codeLanguage, true);
      });
    });
    group.querySelector("[data-copy-code]")?.addEventListener("click", async event => {
      const button = event.currentTarget;
      const activeCode = group.querySelector('[role="tabpanel"]:not([hidden]) code');
      if (!activeCode) return;
      try {
        await navigator.clipboard.writeText(activeCode.textContent);
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = "Copy code"; }, 1400);
      } catch {
        button.textContent = "Select and copy";
      }
    });
  });
}

function renderSearch(query) {
  const value = query.trim().toLowerCase();
  const matches = searchIndex.filter(item => !value || `${item.title} ${item.section} ${item.text}`.toLowerCase().includes(value)).slice(0, 12);
  searchResults.innerHTML = matches.length ? matches.map(item => `<a class="search-item" href="${item.href}"><span>${item.section}</span><strong>${item.title}</strong></a>`).join("") : '<p class="search-empty">No matching pages.</p>';
}

async function openSearch() {
  if (!searchIndex.length) searchIndex = await fetch("search-index.json").then(response => response.json());
  searchInput.value = "";
  renderSearch("");
  searchDialog.showModal();
  requestAnimationFrame(() => searchInput.focus());
}

menu.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  menu.setAttribute("aria-expanded", String(open));
});
readerSidebar.addEventListener("scroll", () => {
  clearTimeout(sidebarSaveTimer);
  sidebarSaveTimer = setTimeout(saveSidebarPosition, 80);
}, { passive: true });
document.querySelectorAll(".book-tree a").forEach(link => link.addEventListener("click", saveSidebarPosition));
window.addEventListener("pagehide", saveSidebarPosition);
document.querySelector("#reader-search-open").addEventListener("click", openSearch);
searchInput.addEventListener("input", event => renderSearch(event.target.value));
themeButton.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
searchDialog.addEventListener("click", event => { if (event.target === searchDialog) searchDialog.close(); });
document.addEventListener("keydown", event => {
  const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
  if (event.key === "/" && !typing && !searchDialog.open) { event.preventDefault(); openSearch(); }
  if (event.key === "Escape" && document.body.classList.contains("menu-open")) { document.body.classList.remove("menu-open"); menu.setAttribute("aria-expanded", "false"); }
});

buildOutline();
restoreSidebarPosition();
setupCodeWorkbenches();
setTheme(localStorage.getItem(THEME_KEY) || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
