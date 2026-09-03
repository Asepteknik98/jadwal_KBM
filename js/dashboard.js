"use strict";

const DashboardManager = (() => {
  const INDONESIAN_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  let clockTimer = null;
  let schedules = [];

  function escapeHtml(value) {
    const element = document.createElement("span");
    element.textContent = String(value ?? "");
    return element.innerHTML;
  }

  function getCurrentMinutes(date = new Date()) {
    return (date.getHours() * 60) + date.getMinutes();
  }

  function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return (hours * 60) + minutes;
  }

  function getTodaySchedules(date = new Date()) {
    const today = INDONESIAN_DAYS[date.getDay()];
    return schedules
      .filter((schedule) => schedule.hari === today && schedule.statusAktif !== false)
      .sort((first, second) => first.jamMulai.localeCompare(second.jamMulai));
  }

  function updateClock() {
    const now = new Date();
    const dateElement = document.querySelector("#current-date");
    const timeElement = document.querySelector("#current-time");

    dateElement.textContent = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now);
    timeElement.textContent = new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);

    renderCurrentSchedule(now);
  }

  function renderTodaySchedules() {
    const now = new Date();
    const today = INDONESIAN_DAYS[now.getDay()];
    const todaySchedules = getTodaySchedules(now);
    const count = todaySchedules.length;
    const countElement = document.querySelector("#today-schedule-count");
    const badge = document.querySelector("#today-schedule-badge");
    const dayName = document.querySelector("#today-day-name");
    const dayStatus = document.querySelector("#today-day-status");
    const list = document.querySelector("#today-schedule-list");

    countElement.textContent = count;
    badge.textContent = `${count} jadwal`;
    dayName.textContent = today;
    dayStatus.textContent = count ? "Ada jadwal mengajar" : "Tidak ada jadwal";

    if (!count) {
      list.innerHTML = '<p class="panel__message">Tidak ada jadwal mengajar hari ini.</p>';
      return;
    }

    list.innerHTML = todaySchedules.map((schedule) => `
      <article class="today-item">
        <div class="today-item__time">
          <strong>${escapeHtml(schedule.jamMulai)}–${escapeHtml(schedule.jamSelesai)}</strong>
          <span>${schedule.jamKe ? `Jam ke-${escapeHtml(schedule.jamKe)}` : "Jam ke belum diatur"}</span>
        </div>
        <div class="today-item__detail">
          <strong>${escapeHtml(schedule.kelas)}</strong>
          <span>${escapeHtml(schedule.mataPelajaran)}</span>
        </div>
        <span class="weekly-item__session">${escapeHtml(schedule.sesi)}</span>
      </article>
    `).join("");
  }

  function renderCurrentSchedule(now = new Date()) {
    const currentMinutes = getCurrentMinutes(now);
    const current = getTodaySchedules(now).find((schedule) => (
      timeToMinutes(schedule.jamMulai) <= currentMinutes
      && timeToMinutes(schedule.jamSelesai) >= currentMinutes
    ));
    const container = document.querySelector("#current-schedule");
    const dot = document.querySelector("#current-status-dot");

    dot.classList.toggle("status-dot--active", Boolean(current));

    if (!current) {
      container.innerHTML = '<p class="panel__message">Tidak ada kelas yang sedang berlangsung.</p>';
      return;
    }

    container.innerHTML = `
      <strong class="current-schedule__class">${escapeHtml(current.kelas)}</strong>
      <span>${escapeHtml(current.mataPelajaran)}</span>
      <small>${escapeHtml(current.jamMulai)}–${escapeHtml(current.jamSelesai)} · ${escapeHtml(current.sesi)}</small>
    `;
  }

  async function refreshSchedules() {
    try {
      schedules = await window.TeachingDatabase.getAllSchedules();
      renderTodaySchedules();
      renderCurrentSchedule();
    } catch (error) {
      document.querySelector("#today-schedule-list").innerHTML = '<p class="panel__message">Jadwal hari ini gagal dimuat.</p>';
      console.error("Gagal memuat data dashboard:", error);
    }
  }

  async function initialize() {
    if (!document.querySelector("#current-date")) return;

    updateClock();
    clockTimer = window.setInterval(updateClock, 1000);
    window.addEventListener("schedules:changed", refreshSchedules);
    await refreshSchedules();
  }

  return Object.freeze({ initialize });
})();

window.DashboardManager = DashboardManager;
