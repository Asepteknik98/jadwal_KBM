"use strict";

async function initializeApp() {
  const app = document.querySelector("#app");

  if (!app) {
    console.error("Elemen utama aplikasi tidak ditemukan.");
    return;
  }

  initializeMobileNavigation();
  initializeViewNavigation();

  try {
    await window.TeachingDatabase.open();
    app.dataset.database = "ready";
    await window.ScheduleManager.initialize();
    await window.SettingsManager.initialize();
    window.BackupManager.initialize();
  } catch (error) {
    app.dataset.database = "error";
    console.error("Gagal menyiapkan database aplikasi:", error);
  }

  app.dataset.ready = "true";
}

function initializeViewNavigation() {
  const links = [...document.querySelectorAll("[data-view-target]")];
  const views = [...document.querySelectorAll("[data-view]")];
  const title = document.querySelector("#view-title");
  const viewTitles = {
    dashboard: "Dashboard",
    "jadwal-mingguan": "Jadwal Mingguan",
    "kelola-jadwal": "Kelola Jadwal",
    pengaturan: "Backup & Pengaturan",
  };

  if (!links.length || !views.length || !title) return;

  function showView(viewName, updateHash = true) {
    const targetView = views.find((view) => view.dataset.view === viewName);
    if (!targetView) return;

    views.forEach((view) => {
      view.hidden = view !== targetView;
    });

    links.forEach((link) => {
      const isActive = link.dataset.viewTarget === viewName;
      link.classList.toggle("nav-link--active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    title.textContent = viewTitles[viewName];
    document.title = `${viewTitles[viewName]} | Personal Teaching Schedule`;

    if (updateHash) history.replaceState(null, "", `#${viewName}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showView(link.dataset.viewTarget);
    });
  });

  const initialView = window.location.hash.slice(1);
  showView(viewTitles[initialView] ? initialView : "dashboard", false);
}

function initializeMobileNavigation() {
  const menuButton = document.querySelector(".menu-button");
  const sidebar = document.querySelector("#sidebar");
  const backdrop = document.querySelector(".sidebar-backdrop");

  if (!menuButton || !sidebar || !backdrop) return;

  function setNavigationState(isOpen) {
    document.body.classList.toggle("nav-open", isOpen);
    sidebar.classList.toggle("sidebar--open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Tutup menu navigasi" : "Buka menu navigasi");
    backdrop.tabIndex = isOpen ? 0 : -1;
  }

  menuButton.addEventListener("click", () => {
    setNavigationState(!sidebar.classList.contains("sidebar--open"));
  });

  backdrop.addEventListener("click", () => setNavigationState(false));

  sidebar.addEventListener("click", (event) => {
    if (event.target.closest(".nav-link")) setNavigationState(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNavigationState(false);
  });
}

initializeApp();
