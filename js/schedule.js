"use strict";

const ScheduleManager = (() => {
  const DAY_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  let schedules = [];

  function getElements() {
    return {
      dialog: document.querySelector("#schedule-dialog"),
      form: document.querySelector("#schedule-form"),
      list: document.querySelector("#schedule-list"),
      message: document.querySelector("#schedule-message"),
      formError: document.querySelector("#schedule-form-error"),
      title: document.querySelector("#schedule-dialog-title"),
      addButton: document.querySelector("#add-schedule-button"),
      closeButton: document.querySelector("#close-schedule-dialog"),
      cancelButton: document.querySelector("#cancel-schedule-button"),
    };
  }

  function escapeHtml(value) {
    const element = document.createElement("span");
    element.textContent = String(value ?? "");
    return element.innerHTML;
  }

  function sortSchedules(items) {
    return [...items].sort((first, second) => {
      const dayDifference = DAY_ORDER.indexOf(first.hari) - DAY_ORDER.indexOf(second.hari);
      return dayDifference || first.jamMulai.localeCompare(second.jamMulai);
    });
  }

  function renderSchedules() {
    const { list } = getElements();
    if (!list) return;

    if (!schedules.length) {
      list.innerHTML = `
        <div class="empty-state empty-state--compact">
          <span class="empty-state__icon" aria-hidden="true">▦</span>
          <h3>Belum ada jadwal</h3>
          <p>Tambahkan jadwal mengajar pertama Anda.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = sortSchedules(schedules).map((schedule) => `
      <article class="schedule-item">
        <div class="schedule-item__time">
          <strong>${escapeHtml(schedule.jamMulai)}</strong>
          <span>${escapeHtml(schedule.jamSelesai)}</span>
        </div>
        <div class="schedule-item__content">
          <span class="schedule-item__day">${escapeHtml(schedule.hari)} · ${escapeHtml(schedule.sesi)}</span>
          <h3>${escapeHtml(schedule.kelas)}</h3>
          <p>${escapeHtml(schedule.mataPelajaran)}</p>
          <small>${escapeHtml(schedule.ruangan)} · ${escapeHtml(schedule.jumlahJP)} JP</small>
        </div>
        <div class="schedule-item__actions">
          <button class="button button--small button--secondary" type="button" data-action="edit" data-id="${schedule.id}">Edit</button>
          <button class="button button--small button--danger" type="button" data-action="delete" data-id="${schedule.id}">Hapus</button>
        </div>
      </article>
    `).join("");
  }

  function openForm(schedule = null) {
    const { dialog, form, formError, title } = getElements();
    form.reset();
    formError.textContent = "";
    title.textContent = schedule ? "Edit Jadwal" : "Tambah Jadwal";

    if (schedule) {
      Object.entries(schedule).forEach(([key, value]) => {
        const field = form.elements.namedItem(key);
        if (field) field.value = value ?? "";
      });
    }

    dialog.showModal();
  }

  function closeForm() {
    getElements().dialog.close();
  }

  function readFormData(form) {
    const data = new FormData(form);
    const id = Number(data.get("id"));

    return {
      ...(id ? { id } : {}),
      hari: data.get("hari").trim(),
      jamMulai: data.get("jamMulai"),
      jamSelesai: data.get("jamSelesai"),
      kelas: data.get("kelas").trim(),
      mataPelajaran: data.get("mataPelajaran").trim(),
      ruangan: data.get("ruangan").trim(),
      sesi: data.get("sesi").trim(),
      jumlahJP: Number(data.get("jumlahJP")),
      catatan: data.get("catatan").trim(),
      statusAktif: true,
    };
  }

  function validateSchedule(schedule, form) {
    if (!form.checkValidity()) {
      form.reportValidity();
      return "Lengkapi semua kolom wajib dengan benar.";
    }

    if (schedule.jamSelesai <= schedule.jamMulai) {
      return "Jam selesai harus lebih akhir dari jam mulai.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const { form, formError, message } = getElements();
    const schedule = readFormData(form);
    const validationError = validateSchedule(schedule, form);

    if (validationError) {
      formError.textContent = validationError;
      return;
    }

    const now = new Date().toISOString();
    const existingSchedule = schedules.find((item) => item.id === schedule.id);
    const record = {
      ...schedule,
      createdAt: existingSchedule?.createdAt ?? now,
      updatedAt: now,
    };

    try {
      if (record.id) {
        await window.TeachingDatabase.updateSchedule(record);
        message.textContent = "Jadwal berhasil diperbarui.";
      } else {
        await window.TeachingDatabase.addSchedule(record);
        message.textContent = "Jadwal berhasil ditambahkan.";
      }

      closeForm();
      await loadSchedules();
    } catch (error) {
      formError.textContent = "Jadwal gagal disimpan. Silakan coba lagi.";
      console.error("Gagal menyimpan jadwal:", error);
    }
  }

  async function handleListClick(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = Number(button.dataset.id);
    const schedule = schedules.find((item) => item.id === id);
    if (!schedule) return;

    if (button.dataset.action === "edit") {
      openForm(schedule);
      return;
    }

    if (button.dataset.action === "delete" && window.confirm(`Hapus jadwal ${schedule.kelas} pada hari ${schedule.hari}?`)) {
      try {
        await window.TeachingDatabase.deleteSchedule(id);
        getElements().message.textContent = "Jadwal berhasil dihapus.";
        await loadSchedules();
      } catch (error) {
        getElements().message.textContent = "Jadwal gagal dihapus.";
        console.error("Gagal menghapus jadwal:", error);
      }
    }
  }

  async function loadSchedules() {
    schedules = await window.TeachingDatabase.getAllSchedules();
    renderSchedules();
  }

  async function initialize() {
    const elements = getElements();
    if (!elements.form || !elements.list) return;

    elements.addButton.addEventListener("click", () => openForm());
    elements.closeButton.addEventListener("click", closeForm);
    elements.cancelButton.addEventListener("click", closeForm);
    elements.form.addEventListener("submit", handleSubmit);
    elements.list.addEventListener("click", handleListClick);

    try {
      await loadSchedules();
    } catch (error) {
      elements.message.textContent = "Data jadwal tidak dapat dimuat.";
      console.error("Gagal memuat jadwal:", error);
    }
  }

  return Object.freeze({ initialize });
})();

window.ScheduleManager = ScheduleManager;
