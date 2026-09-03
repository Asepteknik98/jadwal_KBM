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

  return Object.freeze({
    name: DATABASE_NAME,
    stores: STORE_NAMES,
    open: openDatabase,
  });
})();

window.TeachingDatabase = TeachingDatabase;
