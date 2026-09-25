/**
 * Minimal API client for the BCS Compass backend.
 * Automatically attaches access token and refreshes it if expired.
 */

const BASE_URL = 'http://localhost:5000/api';

const STORAGE_KEYS = {
  access: 'bcs_compass_access_token',
  refresh: 'bcs_compass_refresh_token',
  user: 'bcs_compass_user',
};

/* ---------- Token storage ---------- */

export function getAccessToken() {
  return localStorage.getItem(STORAGE_KEYS.access);
}
export function getRefreshToken() {
  return localStorage.getItem(STORAGE_KEYS.refresh);
}
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function setAuth({ accessToken, refreshToken, user }) {
  if (accessToken) localStorage.setItem(STORAGE_KEYS.access, accessToken);
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.refresh, refreshToken);
  if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}
export function clearAuth() {
  localStorage.removeItem(STORAGE_KEYS.access);
  localStorage.removeItem(STORAGE_KEYS.refresh);
  localStorage.removeItem(STORAGE_KEYS.user);
}

/* ---------- Core request helper ---------- */

async function request(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  /* Handle expired access token → refresh once, then retry */
  if (res.status === 401 && auth && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request(path, { method, body, auth, retry: false });
    }
    clearAuth();
    throw new Error('Your session has expired. Please log in again.');
  }

  /* Parse JSON safely */
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      (res.status === 0
        ? 'Unable to reach the server. Please try again.'
        : 'Something went wrong. Please try again.');
    throw new Error(msg);
  }

  return data;
}

/* ---------- Token refresh ---------- */

let refreshPromise = null;

async function tryRefresh() {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data?.accessToken) {
        localStorage.setItem(STORAGE_KEYS.access, data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/* ---------- Public API surface ---------- */

export const authApi = {
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) =>
    request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),
};

export const healthApi = {
  check: () => request('/health', { auth: false }),
};