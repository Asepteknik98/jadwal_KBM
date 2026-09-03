"use strict";

const PwaManager = (() => {
  let installPrompt = null;

  function setStatus(message) {
    const status = document.querySelector("#install-app-status");
    if (status) status.textContent = message;
  }

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  async function installApp() {
    if (!installPrompt) {
      setStatus("Gunakan menu browser lalu pilih Tambahkan ke layar utama.");
      return;
    }

    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    installPrompt = null;

    if (choice.outcome === "accepted") {
      setStatus("Aplikasi sedang dipasang.");
    } else {
      setStatus("Instalasi dibatalkan.");
    }
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      setStatus("Browser ini belum mendukung instalasi aplikasi.");
      return;
    }

    if (!window.isSecureContext) {
      setStatus("Instalasi tersedia setelah website dibuka melalui HTTPS atau localhost.");
      return;
    }

    try {
      await navigator.serviceWorker.register("./sw.js", { scope: "./" });
      if (!installPrompt && !isStandalone()) {
        setStatus("Tekan tombol install. Jika belum tersedia, gunakan menu Tambahkan ke layar utama pada browser.");
      }
    } catch (error) {
      setStatus("Mode offline gagal disiapkan.");
      console.error("Service worker gagal didaftarkan:", error);
    }
  }

  function initialize() {
    const installButton = document.querySelector("#install-app-button");
    if (!installButton) return;

    installButton.addEventListener("click", installApp);

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      installPrompt = event;
      installButton.disabled = false;
      setStatus("Aplikasi siap dipasang di perangkat ini.");
    });

    window.addEventListener("appinstalled", () => {
      installPrompt = null;
      installButton.disabled = true;
      installButton.textContent = "Sudah Terpasang";
      setStatus("Aplikasi berhasil dipasang.");
    });

    if (isStandalone()) {
      installButton.disabled = true;
      installButton.textContent = "Sudah Terpasang";
      setStatus("Anda sedang menggunakan versi aplikasi.");
    }

    registerServiceWorker();
  }

  return Object.freeze({ initialize });
})();

window.PwaManager = PwaManager;
