"use strict";

const CACHE_NAME = "teaching-schedule-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/variables.css",
  "./css/base.css",
  "./css/layout.css",
  "./css/components.css",
  "./css/responsive.css",
  "./js/database.js",
  "./js/schedule.js",
  "./js/settings.js",
  "./js/backup.js",
  "./js/dashboard.js",
  "./js/pwa.js",
  "./js/app.js",
  "./assets/icons/logo.svg",
  "./assets/icons/favicon.svg",
  "./assets/icons/dashboard.svg",
  "./assets/icons/calendar.svg",
  "./assets/icons/edit.svg",
  "./assets/icons/settings.svg",
  "./assets/icons/pwa-icon-192.svg",
  "./assets/icons/pwa-icon-512.svg",
  "./assets/images/teaching-illustration.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html"))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    })),
  );
});
