/**
 * Minimal API client for the BCS Compass backend.
 * Automatically attaches access token and refreshes it if expired.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STORAGE_KEYS = {
  access: "bcs_compass_access_token",
  refresh: "bcs_compass_refresh_token",
  user: "bcs_compass_user",
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

async function request(
  path,
  { method = "GET", body, auth = true, retry = true } = {},
) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request(path, { method, body, auth, retry: false });
    }
    clearAuth();
    throw new Error("Your session has expired. Please log in again.");
  }

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
        ? "Unable to reach the server. Please try again."
        : "Something went wrong. Please try again.");
    throw new Error(msg);
  }

  return data;
}

let refreshPromise = null;

async function tryRefresh() {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  changePassword: (payload) =>
    request('/auth/change-password', { method: 'POST', body: payload }),

  forgotPassword: (email) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      auth: false,
    }),

  resetPassword: (token, newPassword) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
      auth: false,
    }),
};

export const healthApi = {
  check: () => request("/health", { auth: false }),
};

export const aiApi = {
  analyze: (payload) =>
    request("/ai/analyze", { method: "POST", body: payload }),
  mcq: (payload) => request("/ai/mcq", { method: "POST", body: payload }),
  written: (payload) =>
    request("/ai/written", { method: "POST", body: payload }),
  flashcards: (payload) =>
    request("/ai/flashcards", { method: "POST", body: payload }),
  notes: (payload) => request("/ai/notes", { method: "POST", body: payload }),
  facts: (payload) => request("/ai/facts", { method: "POST", body: payload }),
  memorize: (payload) =>
    request("/ai/memorize", { method: "POST", body: payload }),
  evaluate: (payload) =>
    request("/ai/evaluate", { method: "POST", body: payload }),
  history: () => request("/ai/history"),
};

export const questionApi = {
  save: (questions) =>
    request("/questions", { method: "POST", body: { questions } }),

  saveManual: (payload) =>
    request("/questions/manual", { method: "POST", body: payload }),

  list: (filters = {}) => {
    const qs = new URLSearchParams(filters).toString();
    return request(`/questions${qs ? `?${qs}` : ""}`);
  },
  get: (id) => request(`/questions/${id}`),
  update: (id, payload) =>
    request(`/questions/${id}`, { method: "PATCH", body: payload }),
  remove: (id) => request(`/questions/${id}`, { method: "DELETE" }),
};

export const examApi = {
  build: (config) => request("/exams/build", { method: "POST", body: config }),
  get: (id) => request(`/exams/${id}`),
  list: () => request("/exams"),
};

/* ---------- Study materials (PDF) ---------- */

export const materialApi = {
  upload: async (file, title = "") => {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);

    const res = await fetch(`${BASE_URL}/materials/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.status === 401) {
      const refreshed = await tryRefresh();
      if (refreshed) return materialApi.upload(file, title);
      clearAuth();
      throw new Error("Your session has expired. Please log in again.");
    }

    let data = null;
    try {
      data = await res.json();
    } catch {
      /* ignore */
    }
    if (!res.ok) throw new Error(data?.message || "Upload failed.");
    return data;
  },
  list: () => request("/materials"),
  get: (id) => request(`/materials/${id}`),
  remove: (id) => request(`/materials/${id}`, { method: "DELETE" }),
};

/* ---------- RAG (PDF-based AI) ---------- */

export const ragApi = {
  ask: (payload) => request("/rag/ask", { method: "POST", body: payload }),
  mcq: (payload) => request("/rag/mcq", { method: "POST", body: payload }),
  analyze: (payload) =>
    request("/rag/analyze", { method: "POST", body: payload }),
};

/* ---------- Admin ---------- */

export const adminApi = {
  stats: () => request("/admin/stats"),

  users: (filters = {}) => {
    const qs = new URLSearchParams(filters).toString();
    return request(`/admin/users${qs ? `?${qs}` : ""}`);
  },
  updateRole: (id, role) =>
    request(`/admin/users/${id}`, { method: "PATCH", body: { role } }),

  questions: (filters = {}) => {
    const qs = new URLSearchParams(filters).toString();
    return request(`/admin/questions${qs ? `?${qs}` : ""}`);
  },
  moderate: (id, status) =>
    request(`/admin/questions/${id}`, { method: "PATCH", body: { status } }),
  deleteQuestion: (id) =>
    request(`/admin/questions/${id}`, { method: "DELETE" }),

  generations: (filters = {}) => {
    const qs = new URLSearchParams(filters).toString();
    return request(`/admin/generations${qs ? `?${qs}` : ""}`);
  },

  materials: (filters = {}) => {
    const qs = new URLSearchParams(filters).toString();
    return request(`/admin/materials${qs ? `?${qs}` : ""}`);
  },
};
