const THEME_KEY = "leetcode-design-quest-theme";
const menu = document.querySelector("#reader-menu");
const searchDialog = document.querySelector("#reader-search");
const searchInput = document.querySelector("#reader-search-input");
const searchResults = document.querySelector("#reader-search-results");
const themeButton = document.querySelector("#reader-theme");
let searchIndex = [];

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
setTheme(localStorage.getItem(THEME_KEY) || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
