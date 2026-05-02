const API_BASE = 'http://localhost:3000/api';

/* ── Token Management ─────────────────────── */
const Auth = {
  getToken:    () => localStorage.getItem('uniswap_token'),
  setToken:    (t) => localStorage.setItem('uniswap_token', t),
  removeToken: () => localStorage.removeItem('uniswap_token'),

  getUser:     () => { try { return JSON.parse(localStorage.getItem('uniswap_user')); } catch { return null; } },
  setUser:     (u) => localStorage.setItem('uniswap_user', JSON.stringify(u)),
  removeUser:  () => localStorage.removeItem('uniswap_user'),

  isLoggedIn:  () => !!localStorage.getItem('uniswap_token'),

  logout() {
    this.removeToken();
    this.removeUser();
    window.location.href = 'login.html';
  },
};

/* ── Core Fetch Wrapper ───────────────────── */
async function api(method, endpoint, body = null, isFormData = false) {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = isFormData ? body : JSON.stringify(body);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json();

    if (res.status === 401) { Auth.logout(); return; }
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  } catch (err) {
    console.error(`API Error [${method} ${endpoint}]:`, err.message);
    throw err;
  }
}

const GET    = (ep)       => api('GET',    ep);
const POST   = (ep, body) => api('POST',   ep, body);
const PATCH  = (ep, body) => api('PATCH',  ep, body);
const DELETE = (ep)       => api('DELETE', ep);

/* ══════════════════════════════════════════════════════
   AUTH  —  /api/auth
══════════════════════════════════════════════════════ */
const AuthAPI = {

  /* إنشاء حساب جديد */
  async register({ name, email, password, domain, college, year }) {
    const data = await POST('/auth/register', { name, email, password, domain, college, year });
    if (data?.token) { Auth.setToken(data.token); Auth.setUser(data.user); }
    return data;
  },

  /* تسجيل دخول */
  async login(email, password) {
    const data = await POST('/auth/login', { email, password });
    if (data?.token) { Auth.setToken(data.token); Auth.setUser(data.user); }
    return data;
  },

  /* بياناتي */
  getMe: () => GET('/auth/me'),
};

/* ══════════════════════════════════════════════════════
   LISTINGS  —  /api/listings
══════════════════════════════════════════════════════ */
const ListingsAPI = {

  /* كل الإعلانات — optional query params: { domain, type, condition, status, search } */
  getAll(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return GET(`/listings${qs ? '?' + qs : ''}`);
  },

  /* إعلان واحد */
  getOne: (id) => GET(`/listings/${id}`),

  /* إعلاناتي */
  getMy: () => GET('/listings/user/my'),

  /* إضافة إعلان */
  create: (body) => POST('/listings', body),

  /* حذف إعلان */
  delete: (id) => DELETE(`/listings/${id}`),
};

/* ══════════════════════════════════════════════════════
   REQUESTS  —  /api/requests
══════════════════════════════════════════════════════ */
const RequestsAPI = {

  /* إرسال طلب على إعلان */
  send: (listing_id, message) => POST('/requests', { listing_id, message }),

  /* طلباتي (واردة + صادرة) */
  getMy: () => GET('/requests/my'),

  /* قبول طلب */
  accept: (id) => PATCH(`/requests/${id}/accept`),

  /* رفض طلب */
  reject: (id) => PATCH(`/requests/${id}/reject`),

  /* تأكيد التبادل بالكود */
  confirm: (id, code) => PATCH(`/requests/${id}/confirm`, { code }),
};

/* ══════════════════════════════════════════════════════
   MESSAGES  —  /api/messages
══════════════════════════════════════════════════════ */
const MessagesAPI = {

  /* كل المحادثات */
  getAll: () => GET('/messages'),

  /* رسائل محادثة معينة */
  getByRequest: (requestId) => GET(`/messages/${requestId}`),

  /* إرسال رسالة */
  send: (request_id, body) => POST('/messages', { request_id, body }),
};

/* ══════════════════════════════════════════════════════
   NEEDS BOARD  —  /api/needs
══════════════════════════════════════════════════════ */
const NeedsAPI = {

  /* كل الاحتياجات */
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return GET(`/needs${qs ? '?' + qs : ''}`);
  },

  /* نشر احتياج */
  create: (title, domain, is_urgent = false) => POST('/needs', { title, domain, is_urgent }),
};

/* ══════════════════════════════════════════════════════
   RESEARCH HUB  —  /api/hub
══════════════════════════════════════════════════════ */
const HubAPI = {

  /* كل المحتوى */
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return GET(`/hub${qs ? '?' + qs : ''}`);
  },

  /* رفع محتوى */
  create: (body) => POST('/hub', body),

  /* زيادة عداد التحميلات */
  download: (id) => PATCH(`/hub/${id}/download`),
};

/* ══════════════════════════════════════════════════════
   RATINGS  —  /api/ratings
══════════════════════════════════════════════════════ */
const RatingsAPI = {
  /* تقييم بعد صفقة */
  rate: (request_id, rated_id, stars, comment = null) =>
    POST('/ratings', { request_id, rated_id, stars, comment }),
};

/* ══════════════════════════════════════════════════════
   DASHBOARD  —  /api/dashboard
══════════════════════════════════════════════════════ */
const DashboardAPI = {

  /* الإحصائيات */
  getStats: () => GET('/dashboard'),

  /* الإشعارات */
  getNotifications: () => GET('/dashboard/notifications'),

  /* تحديد الإشعارات كمقروءة */
  markRead: () => PATCH('/dashboard/notifications/read'),
};

/* ══════════════════════════════════════════════════════
   UI HELPERS
══════════════════════════════════════════════════════ */

/* Toast Notification */
function showToast(msg, type = 'default') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'toast show' + (type === 'error' ? ' toast-error' : '');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* حماية الصفحات المحمية — ضع في أول سكريبت في صفحات تحتاج تسجيل دخول */
function requireAuth() {
  if (!Auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/* تحديث الناف بار بعد تسجيل الدخول */
function updateNavbar() {
  const user = Auth.getUser();
  if (!user) return;

  /* إخفاء أزرار Login/SignUp وإظهار اسم المستخدم */
  document.querySelectorAll('.nav-actions').forEach(el => {
    el.innerHTML = `
      <a href="dashboard.html" class="btn btn-ghost btn-sm">${user.name}</a>
      <button onclick="Auth.logout()" class="btn btn-outline btn-sm">Logout</button>
    `;
  });
}

/* تنسيق التاريخ */
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(dateStr).toLocaleDateString('en-EG');
}

/* Emoji لكل domain */
function domainEmoji(domain) {
  return { medical: '⚕️', engineering: '⚙️', arts: '📖' }[domain] || '📦';
}

/* Badge class لكل type */
function typeBadgeClass(type) {
  return { donate: 'badge-donate', swap: 'badge-swap', sell: 'badge-sell' }[type] || '';
}

/* ── Export ─────────────────────────────── */
window.Auth         = Auth;
window.AuthAPI      = AuthAPI;
window.ListingsAPI  = ListingsAPI;
window.RequestsAPI  = RequestsAPI;
window.MessagesAPI  = MessagesAPI;
window.NeedsAPI     = NeedsAPI;
window.HubAPI       = HubAPI;
window.RatingsAPI   = RatingsAPI;
window.DashboardAPI = DashboardAPI;
window.showToast    = showToast;
window.requireAuth  = requireAuth;
window.updateNavbar = updateNavbar;
window.timeAgo      = timeAgo;
window.domainEmoji  = domainEmoji;
window.typeBadgeClass = typeBadgeClass;
