"use strict";

const BackupManager = (() => {
  function setMessage(text, isError = false) {
    const message = document.querySelector("#backup-message");
    message.textContent = text;
    message.classList.toggle("form-message--error", isError);
  }

  async function createBackup() {
    const [schedules, settings] = await Promise.all([
      window.TeachingDatabase.getAllSchedules(),
      window.TeachingDatabase.getAllSettings(),
    ]);

    return {
      app: "Personal Teaching Schedule",
      version: 1,
      exportedAt: new Date().toISOString(),
      schedules,
      settings,
    };
  }

  async function downloadBackup() {
    try {
      const backup = await createBackup();
      const content = JSON.stringify(backup, null, 2);
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `teaching-schedule-backup-${date}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage("Backup berhasil diunduh.");
    } catch (error) {
      setMessage("Backup gagal dibuat.", true);
      console.error("Gagal membuat backup:", error);
    }
  }

  function isValidSchedule(schedule) {
    const requiredTextFields = ["hari", "jamMulai", "jamSelesai", "kelas", "mataPelajaran", "sesi"];
    const periodStart = schedule?.jamKeMulai ?? schedule?.jamKe;
    const periodEnd = schedule?.jamKeSelesai ?? schedule?.jamKe;
    const hasNoPeriod = periodStart === undefined && periodEnd === undefined;
    const hasValidPeriod = Number.isInteger(Number(periodStart))
      && Number.isInteger(Number(periodEnd))
      && Number(periodStart) >= 1
      && Number(periodEnd) <= 6
      && Number(periodStart) <= Number(periodEnd);

    return schedule
      && typeof schedule === "object"
      && requiredTextFields.every((field) => typeof schedule[field] === "string" && schedule[field].trim())
      && (hasNoPeriod || hasValidPeriod);
  }

  function validateBackup(backup) {
    return backup
      && backup.app === "Personal Teaching Schedule"
      && backup.version === 1
      && Array.isArray(backup.schedules)
      && backup.schedules.every(isValidSchedule)
      && Array.isArray(backup.settings)
      && backup.settings.every((setting) => (
        setting && typeof setting.key === "string" && typeof setting.value === "string"
      ));
  }

  async function restoreBackup(file) {
    try {
      const backup = JSON.parse(await file.text());

      if (!validateBackup(backup)) {
        setMessage("File backup tidak valid atau tidak kompatibel.", true);
        return;
      }

      if (!window.confirm("Restore akan mengganti seluruh jadwal dan pengaturan saat ini. Lanjutkan?")) return;

      await window.TeachingDatabase.replaceBackupData(backup);
      setMessage("Backup berhasil dipulihkan. Memuat ulang aplikasi...");
      window.setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      setMessage("File backup tidak dapat dibaca.", true);
      console.error("Gagal memulihkan backup:", error);
    }
  }

  async function resetAllData() {
    const firstConfirmation = window.confirm("Semua jadwal dan pengaturan akan dihapus. Apakah Anda yakin?");
    if (!firstConfirmation) return;

    const secondConfirmation = window.confirm("Konfirmasi terakhir: data yang dihapus tidak dapat dikembalikan tanpa file backup.");
    if (!secondConfirmation) return;

    try {
      await window.TeachingDatabase.clearAllData();
      setMessage("Semua data berhasil direset. Memuat ulang aplikasi...");
      window.setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      setMessage("Semua data gagal direset.", true);
      console.error("Gagal mereset data:", error);
    }
  }

  function initialize() {
    const downloadButton = document.querySelector("#download-backup-button");
    const restoreButton = document.querySelector("#restore-backup-button");
    const resetButton = document.querySelector("#reset-data-button");
    const fileInput = document.querySelector("#backup-file-input");

    if (!downloadButton || !restoreButton || !resetButton || !fileInput) return;

    downloadButton.addEventListener("click", downloadBackup);
    restoreButton.addEventListener("click", () => fileInput.click());
    resetButton.addEventListener("click", resetAllData);
    fileInput.addEventListener("change", async () => {
      const [file] = fileInput.files;
      if (file) await restoreBackup(file);
      fileInput.value = "";
    });
  }

  return Object.freeze({ initialize });
})();

window.BackupManager = BackupManager;
