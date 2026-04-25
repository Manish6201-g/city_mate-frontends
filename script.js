// ============================================================
// CityMate - Shared Frontend Utilities
// ============================================================

// ─── THEME ───
function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// ─── MOBILE MENU ───
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const menu = document.querySelector('.mobile-menu');
  if (!hamburger || !menu) return;

  hamburger.addEventListener('click', () => {
    menu.classList.toggle('open');
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('open'));
  });
}

// ─── TOAST NOTIFICATIONS ───
function initToasts() {
  if (document.getElementById('toasts-container')) return;
  const container = document.createElement('div');
  container.id = 'toasts-container';
  container.className = 'toasts-container';
  document.body.appendChild(container);
}

function showToast(message, type = 'success', duration = 4000) {
  initToasts();
  const container = document.getElementById('toasts-container');

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ'}</span>
    <span>${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// ─── LOADING STATE ───
function setLoading(btn, isLoading) {
  if (!btn) return;
  if (isLoading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span>';
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || btn.innerText;
  }
}

// ─── FORM VALIDATION ───
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── ANIMATE ON SCROLL ───
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initScrollAnimations();
});

// ============================================================
// GUIDES & STAYS DATA
// ============================================================
const guidesData = [
  { id: 1, city: 'Delhi', name: 'Raj Food Walk Guide', expertise: 'Street Food', price: 500, duration: '4 hrs', rating: 4.9, image: '🍲', details: 'Chandni Chowk, Paranthe Wali Gali expert' },
  { id: 2, city: 'Delhi', name: 'Amit History Expert', expertise: 'Monuments', price: 500, duration: '4 hrs', rating: 4.8, image: '🏛️', details: 'India Gate, Qutub Minar specialist' },
  { id: 3, city: 'Delhi', name: 'Priya Markets Guide', expertise: 'Shopping', price: 400, duration: '3 hrs', rating: 4.7, image: '🛍️', details: 'Sarojini Nagar, Karol Bagh markets' },
  { id: 4, city: 'Mumbai', name: 'Vikram Marine Drive', expertise: 'Coast & Culture', price: 600, duration: '4 hrs', rating: 4.9, image: '🌊', details: 'Marine Drive, Chowpatty Beach walks' },
  { id: 5, city: 'Mumbai', name: 'Sneha Street Food', expertise: 'Vada Pav & More', price: 450, duration: '3 hrs', rating: 4.8, image: '🌮', details: 'Juhu Beach, Bandra food trails' },
  { id: 6, city: 'Bangalore', name: 'Kiran Pub Crawl', expertise: 'Nightlife', price: 550, duration: '4 hrs', rating: 4.7, image: '🍻', details: 'MG Road, Indiranagar pubs' },
  { id: 7, city: 'Bangalore', name: 'Lakshmi Gardens', expertise: 'Nature & Parks', price: 400, duration: '3 hrs', rating: 4.6, image: '🌳', details: 'Lalbagh, Cubbon Park walks' },
  { id: 8, city: 'Agra', name: 'Taj Sunrise Guide', expertise: 'Taj Mahal', price: 700, duration: '4 hrs', rating: 4.9, image: '🏰', details: 'Sunrise Taj, Mehtab Bagh views' },
  { id: 9, city: 'Jaipur', name: 'Pink City Walk', expertise: 'History', price: 500, duration: '4 hrs', rating: 4.8, image: '🏯', details: 'Hawa Mahal, Amber Fort tours' },
  { id: 10, city: 'Goa', name: 'Beach Party Guide', expertise: 'Nightlife & Beach', price: 800, duration: '5 hrs', rating: 4.7, image: '🏖️', details: 'Baga, Anjuna beach experiences' }
];

const staysData = [
  { id: 1, city: 'Delhi', name: 'Paharganj Budget Stay', price: 800, rating: 4.2, image: '🏨', details: 'Near New Delhi Railway, clean basic room' },
  { id: 2, city: 'Delhi', name: 'Karol Bagh Homestay', price: 900, rating: 4.5, image: '🏠', details: 'Family run, near markets' },
  { id: 3, city: 'Mumbai', name: 'Colaba Budget Hotel', price: 1100, rating: 4.3, image: '🏨', details: 'Near Gateway of India, AC room' },
  { id: 4, city: 'Bangalore', name: 'Koramangala PG', price: 850, rating: 4.1, image: '🏠', details: 'Near pubs/tech area' },
  { id: 5, city: 'Agra', name: 'Taj Ganj Homestay', price: 950, rating: 4.4, image: '🏨', details: '5 min walk to Taj Mahal' },
  { id: 6, city: 'Jaipur', name: 'Bani Park Hotel', price: 1000, rating: 4.3, image: '🏨', details: 'Near Pink City' },
  { id: 7, city: 'Goa', name: 'Anjuna Beach Hut', price: 1200, rating: 4.6, image: '🏖️', details: 'Beachfront budget stay' }
];

// ─── RENDER GUIDES ───
function renderGuides(filtered = guidesData) {
  const list = document.getElementById('guides-list');
  if (!list) return;
  list.innerHTML = filtered.map(g => `
    <div class="item-card" data-animate>
      <div class="item-emoji">${g.image}</div>
      <div class="item-city">${g.city}</div>
      <h3 class="item-name">${g.name}</h3>
      <p class="item-meta">${g.expertise} · ${g.details}</p>
      <div class="item-footer">
        <span class="item-price">₹${g.price}<small>/${g.duration}</small></span>
        <span class="item-rating">⭐ ${g.rating}</span>
      </div>
      <a href="booking-form.html?type=guide&name=${encodeURIComponent(g.name)}&city=${encodeURIComponent(g.city)}" class="btn-small">Book Now</a>
    </div>
  `).join('');
  // Re-init animations for newly injected content
  if (window.initScrollAnimations) initScrollAnimations();
}

function filterGuides() {
  const query = (document.getElementById('guideSearch')?.value || '').toLowerCase();
  const filtered = guidesData.filter(g =>
    g.city.toLowerCase().includes(query) ||
    g.name.toLowerCase().includes(query) ||
    g.expertise.toLowerCase().includes(query)
  );
  renderGuides(filtered);
}

// ─── RENDER STAYS ───
function renderStays(filtered = staysData) {
  const list = document.getElementById('stays-list');
  if (!list) return;
  list.innerHTML = filtered.map(s => `
    <div class="item-card" data-animate>
      <div class="item-emoji">${s.image}</div>
      <div class="item-city">${s.city}</div>
      <h3 class="item-name">${s.name}</h3>
      <p class="item-meta">${s.details}</p>
      <div class="item-footer">
        <span class="item-price">₹${s.price}<small>/night</small></span>
        <span class="item-rating">⭐ ${s.rating}</span>
      </div>
      <a href="booking-form.html?type=stay&name=${encodeURIComponent(s.name)}&city=${encodeURIComponent(s.city)}" class="btn-small">Book Now</a>
    </div>
  `).join('');
  if (window.initScrollAnimations) initScrollAnimations();
}

function filterStays() {
  const query = (document.getElementById('staysSearch')?.value || '').toLowerCase();
  const filtered = staysData.filter(s =>
    s.city.toLowerCase().includes(query) ||
    s.name.toLowerCase().includes(query) ||
    s.price.toString().includes(query)
  );
  renderStays(filtered);
}

// Make functions globally available
window.toggleTheme = toggleTheme;
window.showToast = showToast;
window.setLoading = setLoading;
window.validateEmail = validateEmail;
window.renderGuides = renderGuides;
window.renderStays = renderStays;
window.filterGuides = filterGuides;
window.filterStays = filterStays;

