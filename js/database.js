"use strict";

const TeachingDatabase = (() => {
  const DATABASE_NAME = "TeachingScheduleDB";
  const DATABASE_VERSION = 1;
  const STORE_NAMES = Object.freeze({
    schedules: "schedules",
    settings: "settings",
  });

  let databasePromise = null;

  function createStores(database) {
    if (!database.objectStoreNames.contains(STORE_NAMES.schedules)) {
      const schedulesStore = database.createObjectStore(STORE_NAMES.schedules, {
        keyPath: "id",
        autoIncrement: true,
      });

      schedulesStore.createIndex("hari", "hari", { unique: false });
      schedulesStore.createIndex("statusAktif", "statusAktif", { unique: false });
    }

    if (!database.objectStoreNames.contains(STORE_NAMES.settings)) {
      database.createObjectStore(STORE_NAMES.settings, { keyPath: "key" });
    }
  }

  function openDatabase() {
    if (!window.indexedDB) {
      return Promise.reject(new Error("Browser tidak mendukung IndexedDB."));
    }

    if (databasePromise) return databasePromise;

    databasePromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        createStores(request.result);
      };

      request.onsuccess = () => {
        const database = request.result;

        database.onversionchange = () => {
          database.close();
          databasePromise = null;
        };

        resolve(database);
      };

      request.onerror = () => {
        databasePromise = null;
        reject(request.error ?? new Error("Database gagal dibuka."));
      };

      request.onblocked = () => {
        console.warn("Pembaruan database menunggu tab aplikasi lain ditutup.");
      };
    });

    return databasePromise;
  }

  async function runScheduleRequest(mode, operation) {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAMES.schedules, mode);
      const store = transaction.objectStore(STORE_NAMES.schedules);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Operasi jadwal gagal."));
      transaction.onerror = () => reject(transaction.error ?? new Error("Transaksi jadwal gagal."));
    });
  }

  function getAllSchedules() {
    return runScheduleRequest("readonly", (store) => store.getAll());
  }

  function addSchedule(schedule) {
    return runScheduleRequest("readwrite", (store) => store.add(schedule));
  }

  function updateSchedule(schedule) {
    return runScheduleRequest("readwrite", (store) => store.put(schedule));
  }

  function deleteSchedule(id) {
    return runScheduleRequest("readwrite", (store) => store.delete(id));
  }

  return Object.freeze({
    name: DATABASE_NAME,
    stores: STORE_NAMES,
    open: openDatabase,
    getAllSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  });
})();

window.TeachingDatabase = TeachingDatabase;
