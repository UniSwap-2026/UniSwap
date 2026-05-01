// ══════════════════════════════════════════
//  UniSwap — Frontend API Client
//  api.js | Include in every HTML page
// ══════════════════════════════════════════

const BASE_URL = 'http://localhost:3000/api';

// ─────────────────────────────────────────
// Helper — fetch wrapper with auth header
// ─────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('uniswap_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

// ══════════════════════════════════════════
//  AUTH API
// ══════════════════════════════════════════
const AuthAPI = {
  register: (body) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('uniswap_token', data.token);
    localStorage.setItem('uniswap_user', JSON.stringify(data.user));
    return data;
  },

  me: () => apiFetch('/auth/me'),
};

// ══════════════════════════════════════════
//  Auth Helpers  (used across all pages)
// ══════════════════════════════════════════
const Auth = {
  isLoggedIn: () => !!localStorage.getItem('uniswap_token'),

  getUser: () => {
    try { return JSON.parse(localStorage.getItem('uniswap_user')); }
    catch { return null; }
  },

  getToken: () => localStorage.getItem('uniswap_token'),

  logout: () => {
    localStorage.removeItem('uniswap_token');
    localStorage.removeItem('uniswap_user');
    window.location.href = 'login.html';
  },
};

// Redirect to login if not authenticated — call on protected pages
function requireAuth() {
  if (!Auth.isLoggedIn()) window.location.href = 'login.html';
}

// ══════════════════════════════════════════
//  LISTINGS
// ══════════════════════════════════════════
const ListingsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/listings${qs ? '?' + qs : ''}`);
  },
  getOne:  (id)   => apiFetch(`/listings/${id}`),
  getMy:   ()     => apiFetch('/listings/user/my'),
  create:  (body) => apiFetch('/listings', { method: 'POST', body: JSON.stringify(body) }),
  delete:  (id)   => apiFetch(`/listings/${id}`, { method: 'DELETE' }),
};

// ══════════════════════════════════════════
//  REQUESTS
// ══════════════════════════════════════════
const RequestsAPI = {
  send: (listing_id, message) =>
    apiFetch('/requests', { method: 'POST', body: JSON.stringify({ listing_id, message }) }),

  getMy:   ()         => apiFetch('/requests/my'),
  accept:  (id)       => apiFetch(`/requests/${id}/accept`,  { method: 'PATCH' }),
  reject:  (id)       => apiFetch(`/requests/${id}/reject`,  { method: 'PATCH' }),
  confirm: (id, code) =>
    apiFetch(`/requests/${id}/confirm`, { method: 'PATCH', body: JSON.stringify({ code }) }),
};

// ══════════════════════════════════════════
//  MESSAGES
// ══════════════════════════════════════════
const MessagesAPI = {
  getAll:        ()            => apiFetch('/messages'),
  getByRequest:  (requestId)   => apiFetch(`/messages/${requestId}`),
  send:          (request_id, body) =>
    apiFetch('/messages', { method: 'POST', body: JSON.stringify({ request_id, body }) }),
};

// ══════════════════════════════════════════
//  NEEDS BOARD
// ══════════════════════════════════════════
const NeedsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/needs${qs ? '?' + qs : ''}`);
  },
  post: (body) => apiFetch('/needs', { method: 'POST', body: JSON.stringify(body) }),
};

// ══════════════════════════════════════════
//  RESEARCH HUB
// ══════════════════════════════════════════
const HubAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/hub${qs ? '?' + qs : ''}`);
  },
  upload:            (body) => apiFetch('/hub', { method: 'POST', body: JSON.stringify(body) }),
  incrementDownload: (id)   => apiFetch(`/hub/${id}/download`, { method: 'PATCH' }),
};

// ══════════════════════════════════════════
//  RATINGS
// ══════════════════════════════════════════
const RatingsAPI = {
  rate: (body) => apiFetch('/ratings', { method: 'POST', body: JSON.stringify(body) }),
};

// ══════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════
const DashboardAPI = {
  getStats:             () => apiFetch('/dashboard'),
  getNotifications:     () => apiFetch('/dashboard/notifications'),
  markNotificationsRead:() => apiFetch('/dashboard/notifications/read', { method: 'PATCH' }),
};
