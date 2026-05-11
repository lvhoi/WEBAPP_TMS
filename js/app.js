/* =====================================================
   TMS Logistics PWA — Application logic
   ===================================================== */

'use strict';

// ── Service Worker registration ──────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[SW] Registered, scope:', reg.scope))
      .catch(err => console.warn('[SW] Registration failed:', err));
  });
}

// ── Offline banner ────────────────────────────────────
const offlineBanner = document.getElementById('offline-banner');
function setOnlineState() {
  offlineBanner.classList.toggle('visible', !navigator.onLine);
}
window.addEventListener('online',  setOnlineState);
window.addEventListener('offline', setOnlineState);
setOnlineState();

// ── Sample data ───────────────────────────────────────
const DATA = {
  shipments: [
    { id: 'TMS-20240001', origin: 'Hà Nội', dest: 'TP.HCM',     status: 'delivered',  date: '10/05/2024', weight: '320 kg', driver: 'Nguyễn Văn A', eta: '10/05 · 14:30' },
    { id: 'TMS-20240002', origin: 'Đà Nẵng', dest: 'Hải Phòng', status: 'in-transit', date: '11/05/2024', weight: '180 kg', driver: 'Trần Thị B',   eta: '12/05 · 09:00' },
    { id: 'TMS-20240003', origin: 'TP.HCM',  dest: 'Cần Thơ',   status: 'in-transit', date: '11/05/2024', weight: '95 kg',  driver: 'Lê Văn C',     eta: '11/05 · 18:00' },
    { id: 'TMS-20240004', origin: 'Hà Nội',  dest: 'Đà Nẵng',   status: 'pending',    date: '12/05/2024', weight: '540 kg', driver: 'Phạm Thị D',   eta: '14/05 · 10:00' },
    { id: 'TMS-20240005', origin: 'Hải Phòng', dest: 'Hà Nội',  status: 'pending',    date: '12/05/2024', weight: '210 kg', driver: 'Hoàng Văn E',  eta: '13/05 · 12:00' },
    { id: 'TMS-20240006', origin: 'TP.HCM',  dest: 'Vũng Tàu',  status: 'delivered',  date: '09/05/2024', weight: '67 kg',  driver: 'Nguyễn Thị F', eta: '09/05 · 16:45' },
    { id: 'TMS-20240007', origin: 'Huế',     dest: 'Đà Lạt',    status: 'cancelled',  date: '10/05/2024', weight: '130 kg', driver: 'Vũ Văn G',     eta: '–' },
  ],
  drivers: [
    { name: 'Nguyễn Văn A', phone: '0912-345-678', status: 'on-route',  vehicle: 'Xe tải 5T\nBKS: 51C-12345',  initials: 'NA' },
    { name: 'Trần Thị B',   phone: '0923-456-789', status: 'on-route',  vehicle: 'Xe tải 3.5T\nBKS: 43A-67890', initials: 'TB' },
    { name: 'Lê Văn C',     phone: '0934-567-890', status: 'on-route',  vehicle: 'Xe tải 2T\nBKS: 72C-11223',  initials: 'LC' },
    { name: 'Phạm Thị D',   phone: '0945-678-901', status: 'available', vehicle: 'Xe đầu kéo\nBKS: 29A-44556', initials: 'PD' },
    { name: 'Hoàng Văn E',  phone: '0956-789-012', status: 'available', vehicle: 'Xe tải 5T\nBKS: 15C-99001',  initials: 'HE' },
    { name: 'Nguyễn Thị F', phone: '0967-890-123', status: 'offline',   vehicle: 'Xe tải 1T\nBKS: 51D-33447',  initials: 'NF' },
    { name: 'Vũ Văn G',     phone: '0978-901-234', status: 'available', vehicle: 'Xe tải 3.5T\nBKS: 29B-55678', initials: 'VG' },
  ],
  routes: [
    {
      name: 'Tuyến Bắc–Nam Express',
      badge: 'in-transit',
      distance: '1,726 km',
      duration: '~28 giờ',
      stops: [
        { label: 'Kho Hà Nội – Hoàng Mai',    time: '06:00',  state: 'done' },
        { label: 'Trạm nghỉ Ninh Bình',        time: '08:30',  state: 'done' },
        { label: 'Kho trung chuyển Đà Nẵng',   time: '16:00',  state: 'active' },
        { label: 'Trạm dừng Quy Nhơn',         time: '21:00',  state: 'pending' },
        { label: 'Kho TP.HCM – Bình Dương',    time: '+1 10:00', state: 'pending' },
      ],
    },
    {
      name: 'Tuyến TP.HCM – Đồng bằng',
      badge: 'pending',
      distance: '185 km',
      duration: '~4 giờ',
      stops: [
        { label: 'Kho TP.HCM – Quận 12',  time: '07:00',  state: 'pending' },
        { label: 'Kho Cần Thơ – Ninh Kiều', time: '11:00', state: 'pending' },
      ],
    },
    {
      name: 'Tuyến Hải Phòng – Hà Nội',
      badge: 'pending',
      distance: '102 km',
      duration: '~2.5 giờ',
      stops: [
        { label: 'Kho Hải Phòng – Lê Chân', time: '08:00',  state: 'pending' },
        { label: 'Trạm kiểm soát Hải Dương', time: '09:00', state: 'pending' },
        { label: 'Kho Hà Nội – Long Biên',  time: '10:30',  state: 'pending' },
      ],
    },
  ],
};

// ── Badge helpers ─────────────────────────────────────
const STATUS_META = {
  delivered:  { label: 'Đã giao',   cls: 'badge-success', icon: '📦', bg: '#e8f5e9' },
  'in-transit': { label: 'Đang giao', cls: 'badge-info',    icon: '🚚', bg: '#e3f2fd' },
  pending:    { label: 'Chờ lấy',   cls: 'badge-warning', icon: '⏳', bg: '#fff3e0' },
  cancelled:  { label: 'Đã huỷ',    cls: 'badge-grey',    icon: '✖',  bg: '#f5f5f5' },
};

function badge(status) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return `<span class="badge ${m.cls}">${m.label}</span>`;
}

function shipmentIconWrap(status) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return `<div class="shipment-icon-wrap" style="background:${m.bg}">${m.icon}</div>`;
}

// ── Today greeting ────────────────────────────────────
function renderGreeting() {
  const now   = new Date();
  const hour  = now.getHours();
  const greet = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  const days  = ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];
  const dateStr = `${days[now.getDay()]}, ngày ${now.getDate()} tháng ${now.getMonth()+1} năm ${now.getFullYear()}`;
  document.getElementById('greeting-text').textContent = greet;
  document.getElementById('greeting-date').textContent = dateStr;
}

// ── Render Dashboard ──────────────────────────────────
function renderDashboard() {
  renderGreeting();

  const delivered  = DATA.shipments.filter(s => s.status === 'delivered').length;
  const inTransit  = DATA.shipments.filter(s => s.status === 'in-transit').length;
  const pending    = DATA.shipments.filter(s => s.status === 'pending').length;
  const available  = DATA.drivers.filter(d => d.status === 'available').length;

  document.getElementById('kpi-delivered').textContent  = delivered;
  document.getElementById('kpi-intransit').textContent  = inTransit;
  document.getElementById('kpi-pending').textContent    = pending;
  document.getElementById('kpi-drivers').textContent    = available;

  // Recent shipments (last 4)
  const recent = DATA.shipments.slice(0, 4);
  const listEl = document.getElementById('recent-shipment-list');
  listEl.innerHTML = recent.map(s => `
    <div class="shipment-item">
      ${shipmentIconWrap(s.status)}
      <div class="shipment-info">
        <div class="shipment-id">${s.id}</div>
        <div class="shipment-route">${s.origin} → ${s.dest}</div>
        <div class="shipment-eta">ETA: ${s.eta}</div>
      </div>
      ${badge(s.status)}
    </div>
  `).join('');
}

// ── Render Shipments ──────────────────────────────────
let currentFilter = 'all';

function renderShipments(filter) {
  currentFilter = filter ?? currentFilter;

  // Update tab UI
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === currentFilter);
  });

  const query = document.getElementById('shipment-search')?.value?.toLowerCase() ?? '';

  const filtered = DATA.shipments.filter(s => {
    const matchFilter = currentFilter === 'all' || s.status === currentFilter;
    const matchSearch = !query || s.id.toLowerCase().includes(query) ||
      s.origin.toLowerCase().includes(query) || s.dest.toLowerCase().includes(query);
    return matchFilter && matchSearch;
  });

  const list = document.getElementById('shipment-full-list');
  if (!list) return;

  if (filtered.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-sub);padding:32px 0">Không tìm thấy đơn hàng.</p>';
    return;
  }

  list.innerHTML = filtered.map(s => `
    <div class="shipment-card">
      <div class="shipment-card-header">
        <div>
          <div class="shipment-card-id">${s.id}</div>
          <div class="shipment-card-date">${s.date}</div>
        </div>
        ${badge(s.status)}
      </div>
      <div class="shipment-route-line">
        <span class="route-dot origin"></span>
        <span style="font-size:.78rem;color:var(--text-sub)">${s.origin}</span>
        <span class="route-line"></span>
        <span style="font-size:.78rem;color:var(--text-sub)">${s.dest}</span>
        <span class="route-dot dest"></span>
      </div>
      <div class="shipment-card-footer">
        <span class="shipment-weight">⚖ ${s.weight}</span>
        <span class="shipment-driver">🧑‍✈️ ${s.driver}</span>
        <span class="shipment-eta">🕐 ${s.eta}</span>
      </div>
    </div>
  `).join('');
}

// ── Render Drivers ────────────────────────────────────
function renderDrivers() {
  const list = document.getElementById('driver-list');
  if (!list) return;
  list.innerHTML = DATA.drivers.map(d => {
    const statusLabel = d.status === 'on-route' ? 'Đang giao hàng'
      : d.status === 'available' ? 'Sẵn sàng' : 'Offline';
    return `
    <div class="driver-card">
      <div class="driver-avatar">${d.initials}</div>
      <div class="driver-info">
        <div class="driver-name">${d.name}</div>
        <div class="driver-phone">${d.phone}</div>
        <div class="driver-status-line">
          <span class="status-dot ${d.status}"></span>
          <span class="driver-status-text">${statusLabel}</span>
        </div>
      </div>
      <div class="driver-vehicle">${d.vehicle.replace('\n','<br>')}</div>
    </div>`;
  }).join('');
}

// ── Render Routes ─────────────────────────────────────
function renderRoutes() {
  const list = document.getElementById('route-list');
  if (!list) return;
  list.innerHTML = DATA.routes.map(r => {
    const stopsHtml = r.stops.map(st => `
      <li class="route-stop">
        <span class="stop-dot ${st.state}"></span>
        <div class="stop-addr">${st.label}</div>
        <div class="stop-time">${st.time}</div>
      </li>`).join('');
    return `
    <div class="route-card">
      <div class="route-card-header">
        <span class="route-card-name">${r.name}</span>
        ${badge(r.badge)}
      </div>
      <ul class="route-stops">${stopsHtml}</ul>
      <div class="route-card-footer">
        <span>📍 ${r.distance}</span>
        <span>⏱ ${r.duration}</span>
        <span>🚏 ${r.stops.length} điểm dừng</span>
      </div>
    </div>`;
  }).join('');
}

// ── Navigation ────────────────────────────────────────
const VIEWS = ['dashboard', 'shipments', 'drivers', 'routes'];
const HEADERS = {
  dashboard: { icon: '🚚', title: 'TMS Logistics' },
  shipments: { icon: '📦', title: 'Đơn hàng' },
  drivers:   { icon: '🧑‍✈️', title: 'Tài xế' },
  routes:    { icon: '🗺️', title: 'Tuyến đường' },
};

const renderFns = {
  dashboard: renderDashboard,
  shipments: renderShipments,
  drivers:   renderDrivers,
  routes:    renderRoutes,
};

function navigateTo(viewId) {
  if (!VIEWS.includes(viewId)) return;

  // Switch active view
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${viewId}`).classList.add('active');

  // Update nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewId);
  });

  // Update header
  const h = HEADERS[viewId];
  document.getElementById('header-icon').textContent  = h.icon;
  document.getElementById('header-title').textContent = h.title;

  // Scroll to top
  document.getElementById('view-container').scrollTop = 0;

  // Render content
  renderFns[viewId]?.();
}

// ── Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.view));
  });

  // Quick action buttons on dashboard
  document.querySelectorAll('.qa-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.view));
  });

  // Shipment filter tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => renderShipments(tab.dataset.filter));
  });

  // Shipment search
  const searchInput = document.getElementById('shipment-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => renderShipments());
  }

  // Start on dashboard
  navigateTo('dashboard');
});
