"use strict";

const SettingsManager = (() => {
  const DEFAULT_SETTINGS = Object.freeze({
    userName: "",
    schoolName: "SMK Jaya Buana",
  });

  async function loadSettings() {
    const records = await window.TeachingDatabase.getAllSettings();
    const settings = { ...DEFAULT_SETTINGS };

    records.forEach(({ key, value }) => {
      if (key in settings) settings[key] = value;
    });

    document.querySelector("#user-name").value = settings.userName;
    document.querySelector("#school-name").value = settings.schoolName;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.querySelector("#settings-message");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const settings = [
      { key: "userName", value: data.get("userName").trim() },
      { key: "schoolName", value: data.get("schoolName").trim() },
    ];

    try {
      await window.TeachingDatabase.saveSettings(settings);
      message.textContent = "Pengaturan berhasil disimpan.";
    } catch (error) {
      message.textContent = "Pengaturan gagal disimpan.";
      console.error("Gagal menyimpan pengaturan:", error);
    }
  }

  async function initialize() {
    const form = document.querySelector("#settings-form");
    if (!form) return;

    form.addEventListener("submit", handleSubmit);

    try {
      await loadSettings();
    } catch (error) {
      document.querySelector("#settings-message").textContent = "Pengaturan gagal dimuat.";
      console.error("Gagal memuat pengaturan:", error);
    }
  }

  return Object.freeze({ initialize, loadSettings });
})();

window.SettingsManager = SettingsManager;
