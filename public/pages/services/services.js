/**
 * Jan-Setu Services Catalog Scripts
 * Module: Services (Pathika)
 * Connects to GET /api/services and GET /api/services/status via JanSetuAPI wrapper.
 */

let allServices = [];
let currentStatuses = {};

document.addEventListener('DOMContentLoaded', () => {
  initServicesPage();

  // Setup search & filter listeners
  const searchInput = document.getElementById('service-search');
  const deptFilter = document.getElementById('dept-filter');

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  if (deptFilter) {
    deptFilter.addEventListener('change', applyFilters);
  }
});

/**
 * Initialize page by fetching both services catalog and department health
 */
async function initServicesPage() {
  await fetchDepartmentHealth();
  await fetchServicesCatalog();
  
  // Handle direct hash navigation (e.g. #service-business-reg)
  if (window.location.hash) {
    setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        target.style.borderColor = 'var(--color-saffron)';
      }
    }, 300);
  }
}

/**
 * Fetch and render department status bar from GET /api/services/status
 */
async function fetchDepartmentHealth() {
  const container = document.getElementById('dept-status-cards');
  if (!container) return;

  try {
    currentStatuses = await JanSetuAPI.getServiceStatus();

    const depts = [
      { key: 'identity', label: 'Identity Service', role: 'Citizen ID Matching' },
      { key: 'revenue', label: 'Revenue Service', role: 'Address & Residence Validation' },
      { key: 'tax', label: 'Tax Service', role: 'Financial & Tax Clearance' },
      { key: 'municipal', label: 'Municipal Service', role: 'Zoning & Trade Licensing' }
    ];

    container.innerHTML = depts.map(d => {
      const status = currentStatuses[d.key] || 'offline';
      const isOnline = status === 'online';
      const badgeClass = isOnline ? 'badge-online' : 'badge-offline';
      const indClass = isOnline ? 'online' : 'offline';
      const statusLabel = isOnline ? 'ONLINE' : 'TEMPORARILY OFFLINE';

      return `
        <div class="dept-status-card">
          <div>
            <div class="dept-status-card-name">${d.label}</div>
            <div style="font-size: 0.72rem; color: var(--color-text-light);">${d.role}</div>
          </div>
          <div>
            <span class="badge ${badgeClass}"><span class="status-indicator ${indClass}"></span>${statusLabel}</span>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to load department statuses:', err);
    container.innerHTML = `<div style="grid-column: 1 / -1; color: var(--color-danger); font-size: 0.85rem;">Failed to fetch department status.</div>`;
  }
}

/**
 * Fetch service catalog from GET /api/services
 */
async function fetchServicesCatalog() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;

  try {
    allServices = await JanSetuAPI.getServices();
    renderServiceCards(allServices);
    updateDeptFilterOptions(allServices);
  } catch (err) {
    console.error('Failed to fetch services catalog:', err);
    grid.innerHTML = `
      <div class="catalog-empty-state">
        <h3>Unable to load services</h3>
        <p>Could not connect to the Jan-Setu service catalog API (GET /api/services).</p>
        <button class="btn btn-outline btn-sm" onclick="fetchServicesCatalog()">Try Again</button>
      </div>
    `;
  }
}

/**
 * Service metadata specifications for realistic government verification requirements
 */
const serviceMeta = {
  'business-reg': {
    purpose: 'Simulated single-window registration and commercial clearance for new enterprises.',
    departments: ['Identity Service', 'Revenue Service', 'Tax Service', 'Municipal Service'],
    requiredDocs: 'Address Proof (.docx/.pdf), Business Name, Identity Verification',
    estimatedTime: 'Simulated Instant (Parallel Orchestration)',
    fee: 'Simulated Demo (Nil)'
  },
  'income-cert': {
    purpose: 'Issuance of revenue-verified annual household income certificate.',
    departments: ['Identity Service', 'Revenue Service'],
    requiredDocs: 'Income Declaration, Residence Proof, Citizen Identity',
    estimatedTime: 'Simulated Instant',
    fee: 'Simulated Demo (Nil)'
  },
  'trade-license': {
    purpose: 'Annual clearance and municipal operating permit renewal for commercial establishments.',
    departments: ['Municipal Service', 'Tax Service'],
    requiredDocs: 'Establishment Lease, Safety Declaration, Prior License Number',
    estimatedTime: 'Simulated Instant',
    fee: 'Simulated Demo (Nil)'
  },
  'property-tax-clearance': {
    purpose: 'Verification of municipal property tax assessment and issuance of clearance certificate.',
    departments: ['Tax Service', 'Revenue Service'],
    requiredDocs: 'Property Assessment ID, Last Assessment Receipt',
    estimatedTime: 'Simulated Instant',
    fee: 'Simulated Demo (Nil)'
  }
};

/**
 * Render service cards into the DOM
 */
function renderServiceCards(servicesList) {
  const grid = document.getElementById('services-grid');
  const countEl = document.getElementById('service-count');
  if (!grid) return;

  if (countEl) {
    countEl.textContent = `Showing ${servicesList.length} of ${allServices.length} services`;
  }

  if (servicesList.length === 0) {
    grid.innerHTML = `
      <div class="catalog-empty-state">
        <h3>No matching services found</h3>
        <p>Try adjusting your search keyword or selected department filter.</p>
        <button class="btn btn-outline btn-sm" onclick="resetFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = servicesList.map(srv => {
    const meta = serviceMeta[srv.id] || {
      purpose: srv.description || 'Public service facilitation through Jan-Setu gateway.',
      departments: [srv.department || 'Department Service'],
      requiredDocs: 'Standard Citizen Proofs',
      estimatedTime: 'Simulated Instant',
      fee: 'Simulated Demo (Nil)'
    };

    // Calculate if any dependent department is offline
    const isServiceAvailable = srv.active !== false;

    return `
      <article class="catalog-card" id="service-${srv.id}">
        <div>
          <div class="catalog-card-header">
            <div>
              <span class="catalog-dept-badge">${srv.department}</span>
              <h2 class="catalog-service-name">${srv.name}</h2>
            </div>
            <span class="catalog-service-id">#${srv.id}</span>
          </div>

          <p class="catalog-service-desc">${srv.description}</p>

          <div class="catalog-details-box">
            <div class="catalog-detail-row">
              <span class="catalog-detail-label">Purpose:</span>
              <span class="catalog-detail-value">${meta.purpose}</span>
            </div>
            <div class="catalog-detail-row">
              <span class="catalog-detail-label">Coordinated Depts:</span>
              <span class="catalog-detail-value">${meta.departments.join(' • ')}</span>
            </div>
            <div class="catalog-detail-row">
              <span class="catalog-detail-label">Required Proofs:</span>
              <span class="catalog-detail-value">${meta.requiredDocs}</span>
            </div>
            <div class="catalog-detail-row">
              <span class="catalog-detail-label">Service Mode:</span>
              <span class="catalog-detail-value">
                <span class="badge badge-online">Simulated Interoperability</span>
              </span>
            </div>
          </div>
        </div>

        <div class="catalog-card-footer">
          <div class="flex gap-1">
            <span class="badge ${isServiceAvailable ? 'badge-online' : 'badge-offline'}">
              <span class="status-indicator ${isServiceAvailable ? 'online' : 'offline'}"></span>
              ${isServiceAvailable ? 'AVAILABLE FOR APPLICATION' : 'TEMPORARILY UNAVAILABLE'}
            </span>
          </div>

          <div class="flex gap-1">
            <a href="/pages/application/?serviceId=${encodeURIComponent(srv.id)}" class="btn btn-primary btn-sm">
              Apply Now &rarr;
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/**
 * Populate dynamic department filter dropdown
 */
function updateDeptFilterOptions(servicesList) {
  const deptSelect = document.getElementById('dept-filter');
  if (!deptSelect) return;

  const currentVal = deptSelect.value;
  const depts = new Set();
  servicesList.forEach(s => {
    if (s.department) depts.add(s.department);
  });

  deptSelect.innerHTML = '<option value="all">All Departments</option>' + 
    Array.from(depts).map(d => `<option value="${d}">${d}</option>`).join('');

  if (currentVal && Array.from(depts).includes(currentVal)) {
    deptSelect.value = currentVal;
  }
}

/**
 * Filter services by search text and department selector
 */
function applyFilters() {
  const searchInput = document.getElementById('service-search');
  const deptFilter = document.getElementById('dept-filter');

  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
  const selectedDept = deptFilter ? deptFilter.value : 'all';

  const filtered = allServices.filter(srv => {
    const matchesSearch = !query || 
      srv.name.toLowerCase().includes(query) || 
      srv.description.toLowerCase().includes(query) ||
      (srv.department && srv.department.toLowerCase().includes(query)) ||
      srv.id.toLowerCase().includes(query);

    const matchesDept = selectedDept === 'all' || srv.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  renderServiceCards(filtered);
}

/**
 * Reset all filter inputs
 */
function resetFilters() {
  const searchInput = document.getElementById('service-search');
  const deptFilter = document.getElementById('dept-filter');
  if (searchInput) searchInput.value = '';
  if (deptFilter) deptFilter.value = 'all';
  renderServiceCards(allServices);
}

/**
 * Manually refresh health & catalog
 */
async function refreshAll() {
  await fetchDepartmentHealth();
  await fetchServicesCatalog();
}
