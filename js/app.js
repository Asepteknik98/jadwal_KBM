"use strict";

async function initializeApp() {
  const app = document.querySelector("#app");

  if (!app) {
    console.error("Elemen utama aplikasi tidak ditemukan.");
    return;
  }

  initializeMobileNavigation();

  try {
    await window.TeachingDatabase.open();
    app.dataset.database = "ready";
  } catch (error) {
    app.dataset.database = "error";
    console.error("Gagal menyiapkan database aplikasi:", error);
  }

  app.dataset.ready = "true";
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
