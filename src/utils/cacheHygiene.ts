const APP_CACHE_VERSION = "crm-bom-samaritano-2026-06-22-v4";
const APP_CACHE_VERSION_KEY = "crm_app_cache_version";

const SERVER_MIRROR_KEYS = [
  "members_data",
  "visitors_data",
  "financial_records_data",
  "discipleship_data",
  "discipleship_course_enrollments",
  "discipleship_journeys",
];

export function refreshStaleClientCache() {
  const currentVersion = localStorage.getItem(APP_CACHE_VERSION_KEY);
  if (currentVersion === APP_CACHE_VERSION) return;

  SERVER_MIRROR_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(APP_CACHE_VERSION_KEY, APP_CACHE_VERSION);
}

export async function clearBrowserRuntimeCaches() {
  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith("crm-bom-samaritano-runtime-"))
        .map((cacheName) => caches.delete(cacheName))
    );
  }
}

export async function unregisterServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
}