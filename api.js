// ============================================================
// CityMate API Client
// ============================================================

const API_BASE_URL = window.API_URL || 'http://localhost:3001';

function getToken() { return localStorage.getItem('cm_token'); }

/** Generic fetch wrapper with error handling */
async function api(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  // Add auth token for admin routes
  if (endpoint.startsWith('/api/admin/')) {
    const token = getToken();
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('cm_token');
        if (window.location.pathname.includes('admin')) {
          window.location.href = '/login.html';
        }
      }
      throw new Error(data?.message || `HTTP ${res.status}`);
    }
    return data;
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Please check your internet connection.');
    }
    throw err;
  }
}

// ─── PUBLIC API ───

export const bookService = (data) => api('/api/book', { method: 'POST', body: data });
export const submitReview = (data) => api('/api/review', { method: 'POST', body: data });
export const fetchReviews = () => api('/api/reviews');
export const submitContact = (data) => api('/api/contact', { method: 'POST', body: data });

// ─── AUTH ───

export const loginAdmin = (email, password) =>
  api('/api/admin/login', { method: 'POST', body: { email, password } });

// ─── ADMIN API ───

export const getStats = () => api('/api/admin/stats');
export const getBookings = (params = '') => api(`/api/admin/bookings${params ? '?' + params : ''}`);
export const updateBooking = (id, status) => api(`/api/admin/update/${id}`, { method: 'POST', body: { status } });
export const deleteBooking = (id) => api(`/api/admin/booking/${id}`, { method: 'DELETE' });
export const getAdminReviews = () => api('/api/admin/reviews');
export const deleteReview = (id) => api(`/api/admin/review/${id}`, { method: 'DELETE' });
export const getContacts = () => api('/api/admin/contacts');
export const toggleContact = (id) => api(`/api/admin/contact/${id}/toggle`, { method: 'POST' });

