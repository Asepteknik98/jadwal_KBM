"use strict";

const ScheduleManager = (() => {
  const DAY_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  let schedules = [];
  let editingScheduleId = null;

  function getElements() {
    return {
      dialog: document.querySelector("#schedule-dialog"),
      form: document.querySelector("#schedule-form"),
      list: document.querySelector("#schedule-list"),
      weeklyList: document.querySelector("#weekly-schedule-list"),
      weeklyCount: document.querySelector("#weekly-schedule-count"),
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

  function formatTeachingPeriod(schedule) {
    const start = schedule.jamKeMulai ?? schedule.jamKe;
    const end = schedule.jamKeSelesai ?? schedule.jamKe;

    if (!start || !end) return "Jam ke belum diatur";
    return Number(start) === Number(end) ? `Jam ke-${start}` : `Jam ke-${start}–${end}`;
  }

  function formatTimeInput(event) {
    const input = event.currentTarget;
    const digits = input.value.replace(/\D/g, "").slice(0, 4);

    input.value = digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
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
          <span class="schedule-item__day">${escapeHtml(schedule.hari)} · ${escapeHtml(schedule.sesi)} · ${escapeHtml(formatTeachingPeriod(schedule))}</span>
          <h3>${escapeHtml(schedule.kelas)}</h3>
          <p>${escapeHtml(schedule.mataPelajaran)}</p>
        </div>
        <div class="schedule-item__actions">
          <button class="button button--small button--secondary" type="button" data-action="edit" data-id="${schedule.id}">Edit</button>
          <button class="button button--small button--danger" type="button" data-action="delete" data-id="${schedule.id}">Hapus</button>
        </div>
      </article>
    `).join("");
  }

  function renderWeeklySchedule() {
    const { weeklyList, weeklyCount } = getElements();
    if (!weeklyList || !weeklyCount) return;

    const activeSchedules = sortSchedules(schedules.filter((schedule) => schedule.statusAktif !== false));
    weeklyCount.textContent = `${activeSchedules.length} jadwal`;

    const today = ["Minggu", ...DAY_ORDER, "Sabtu"][new Date().getDay()];

    weeklyList.innerHTML = DAY_ORDER.map((day) => {
      const daySchedules = activeSchedules.filter((schedule) => schedule.hari === day);
      const scheduleItems = daySchedules.length
        ? daySchedules.map((schedule) => `
            <details class="weekly-item" data-accordion-level="schedule">
              <summary class="weekly-item__summary">
                <span class="weekly-item__time">${escapeHtml(schedule.jamMulai)}–${escapeHtml(schedule.jamSelesai)}</span>
                <strong>${escapeHtml(schedule.kelas)}</strong>
                <span class="weekly-item__session">${escapeHtml(schedule.sesi)}</span>
                <span class="dropdown-chevron" aria-hidden="true"></span>
              </summary>
              <div class="weekly-item__detail">
                <span><strong>Mata Pelajaran</strong>${escapeHtml(schedule.mataPelajaran)}</span>
                <span><strong>Jam Pelajaran</strong>${escapeHtml(formatTeachingPeriod(schedule))}</span>
              </div>
            </details>
          `).join("")
        : '<p class="weekday-empty">Tidak ada jadwal</p>';

      return `
        <details class="weekday-dropdown" data-accordion-level="day" ${day === today ? "open" : ""}>
          <summary class="weekday-dropdown__summary">
            <strong>${day}</strong>
            <span>${daySchedules.length} jadwal</span>
            <span class="dropdown-chevron" aria-hidden="true"></span>
          </summary>
          <div class="weekday-schedules">${scheduleItems}</div>
        </details>
      `;
    }).join("");
  }

  function handleWeeklyAccordion(event) {
    const openedDropdown = event.target;
    if (!(openedDropdown instanceof HTMLDetailsElement) || !openedDropdown.open) return;

    const level = openedDropdown.dataset.accordionLevel;
    const { weeklyList } = getElements();

    weeklyList.querySelectorAll(`details[data-accordion-level="${level}"][open]`).forEach((dropdown) => {
      if (dropdown !== openedDropdown) dropdown.open = false;
    });
  }

  function openForm(schedule = null) {
    const { dialog, form, formError, title } = getElements();
    editingScheduleId = schedule?.id ?? null;
    form.reset();
    formError.textContent = "";
    title.textContent = schedule ? "Edit Jadwal" : "Tambah Jadwal";

    if (schedule) {
      Object.entries(schedule).forEach(([key, value]) => {
        const field = form.elements.namedItem(key);
        if (field) field.value = value ?? "";
      });

      form.elements.namedItem("jamKeMulai").value = schedule.jamKeMulai ?? schedule.jamKe ?? "";
      form.elements.namedItem("jamKeSelesai").value = schedule.jamKeSelesai ?? schedule.jamKe ?? "";
    }

    dialog.showModal();
  }

  function closeForm() {
    editingScheduleId = null;
    getElements().dialog.close();
  }

  function readFormData(form) {
    const data = new FormData(form);

    return {
      ...(editingScheduleId !== null ? { id: editingScheduleId } : {}),
      hari: data.get("hari").trim(),
      jamMulai: data.get("jamMulai"),
      jamSelesai: data.get("jamSelesai"),
      jamKeMulai: Number(data.get("jamKeMulai")),
      jamKeSelesai: Number(data.get("jamKeSelesai")),
      kelas: data.get("kelas").trim(),
      mataPelajaran: data.get("mataPelajaran").trim(),
      sesi: data.get("sesi").trim(),
      statusAktif: true,
    };
  }

  function validateSchedule(schedule, form) {
    const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

    if (
      (schedule.jamMulai && !timePattern.test(schedule.jamMulai))
      || (schedule.jamSelesai && !timePattern.test(schedule.jamSelesai))
    ) {
      return "Gunakan format waktu 24 jam HH:MM, contoh 10:40 dan 12:20.";
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return "Lengkapi semua kolom wajib dengan benar.";
    }

    if (schedule.jamSelesai <= schedule.jamMulai) {
      return "Jam selesai harus lebih akhir dari jam mulai.";
    }

    if (schedule.jamKeSelesai < schedule.jamKeMulai) {
      return "Jam Ke Selesai tidak boleh lebih kecil dari Jam Ke Mulai.";
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
    renderWeeklySchedule();
    window.dispatchEvent(new CustomEvent("schedules:changed"));
  }

  async function initialize() {
    const elements = getElements();
    if (!elements.form || !elements.list) return;

    elements.addButton.addEventListener("click", () => openForm());
    elements.closeButton.addEventListener("click", closeForm);
    elements.cancelButton.addEventListener("click", closeForm);
    elements.dialog.addEventListener("close", () => {
      editingScheduleId = null;
    });
    elements.form.addEventListener("submit", handleSubmit);
    elements.form.elements.namedItem("jamMulai").addEventListener("input", formatTimeInput);
    elements.form.elements.namedItem("jamSelesai").addEventListener("input", formatTimeInput);
    elements.list.addEventListener("click", handleListClick);
    elements.weeklyList.addEventListener("toggle", handleWeeklyAccordion, true);

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
