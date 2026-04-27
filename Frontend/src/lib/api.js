export const extractApiError = (errorData, fallbackMessage = "Something went wrong") => {
  if (!errorData || typeof errorData !== "object") {
    return fallbackMessage;
  }

  if (typeof errorData.detail === "string" && errorData.detail.trim()) {
    return errorData.detail;
  }

  if (typeof errorData.error === "string" && errorData.error.trim()) {
    return errorData.error;
  }

  if (Array.isArray(errorData.non_field_errors) && errorData.non_field_errors[0]) {
    return errorData.non_field_errors[0];
  }

  for (const value of Object.values(errorData)) {
    if (Array.isArray(value) && value[0]) {
      return value[0];
    }

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallbackMessage;
};

export const normalizeEmail = (value) => value.trim().toLowerCase();

export const normalizeText = (value) => value.trim();

export const resolveBackendUrl = () => {
  const configuredUrl = (import.meta.env.VITE_BACKEND_URL || "").trim();
  const { protocol, hostname } = window.location;

  // In dev, prefer same-origin requests and let Vite proxy /api and /media.
  // This avoids host/cookie mismatches (localhost vs 127.0.0.1 vs LAN IP).
  if (import.meta.env.DEV) {
    return "";
  }

  if (!configuredUrl) {
    return "";
  }

  try {
    const backend = new URL(configuredUrl);
    const frontendHost = hostname;
    const loopbackHosts = new Set(["localhost", "127.0.0.1"]);
    const isFrontendLoopback = loopbackHosts.has(frontendHost);

    // Keep localhost and 127.0.0.1 aligned to avoid session-cookie mismatch
    // when frontend is opened on one loopback host and backend is configured on the other.
    // Do not retarget to LAN hosts here (that can cause connection-refused when backend
    // is only bound to loopback).
    if (
      loopbackHosts.has(backend.hostname) &&
      loopbackHosts.has(frontendHost) &&
      frontendHost
    ) {
      backend.hostname = frontendHost;
    }

    // If backend is configured as loopback but frontend is opened from LAN/prod host,
    // prefer same-origin API routing (for example via reverse proxy) instead of an
    // unreachable loopback URL.
    if (loopbackHosts.has(backend.hostname) && !isFrontendLoopback) {
      return "";
    }

    // Prevent mixed-content failures when frontend is served over HTTPS.
    if (protocol === "https:" && backend.protocol === "http:") {
      backend.protocol = "https:";
    }

    return backend.origin;
  } catch {
    return configuredUrl;
  }
};
