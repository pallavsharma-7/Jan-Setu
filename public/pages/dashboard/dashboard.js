/**
 * Jan-Setu Department Operations Dashboard Script
 * Author: RUCHA (Engineer - Dashboard + Audit)
 *
 * Responsibilities:
 * - Fetch application statistics and registries via JanSetuAPI wrapper
 * - Render operational KPIs, service distribution, verification throughput, and live status
 * - Provide interactive search, filtering (by status and service), and sorting on applications
 * - Stream recent inter-departmental audit events
 * - Handle loading, empty, and error states gracefully
 * - Escape dynamic HTML outputs via JanSetuUI.escapeHtml for secure rendering
 */

const DashboardApp = (function () {
  'use strict';

  // Internal State
  let state = {
    applications: [],
    stats: null,
    serviceStatuses: {},
    isLoading: true,
    error: null,
    filters: {
      search: '',
      status: 'all',
      serviceId: 'all',
      sort: 'newest'
    }
  };

  /**
   * Initialize Dashboard Application
   */
  async function init() {
    state.isLoading = true;
    state.error = null;
    hideErrorBanner();

    try {
      // Parallel fetch of statistics, applications list, and service statuses
      const [statsData, appsData, statusesData] = await Promise.all([
        JanSetuAPI.getDashboardStats(),
        JanSetuAPI.getApplications(),
        JanSetuAPI.getServiceStatus()
      ]);

      state.stats = statsData || {};
      state.applications = Array.isArray(appsData) ? appsData : [];
      state.serviceStatuses = statusesData || {};
      state.isLoading = false;

      renderDashboard();
    } catch (err) {
      console.error('Dashboard initialization failed:', err);
      state.isLoading = false;
      state.error = err.message || 'Failed to load dashboard data';
      showErrorBanner(state.error);
    }
  }

  /**
   * Refresh all dashboard data on demand
   */
  async function refreshData() {
    const refreshBtn = document.getElementById('btn-refresh-dashboard');
    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '<span>&#x23F3;</span> Refreshing...';
    }

    await init();

    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = '<span>&#x21bb;</span> Refresh Data';
    }
  }

  /**
   * Render all dashboard components
   */
  function renderDashboard() {
    renderKPIs();
    renderDepartmentStatuses();
    renderVerificationThroughput();
    renderServiceDistribution();
    renderApplicationsTable();
    renderRecentActivity();
  }

  /**
   * 1. Render Top KPI Metrics
   */
  function renderKPIs() {
    const stats = state.stats || {};
    const total = stats.totalApplications !== undefined ? stats.totalApplications : state.applications.length;
    const byStatus = stats.byStatus || { completed: 0, processing: 0, queued: 0, rejected: 0 };

    const totalEl = document.getElementById('kpi-total-apps');
    const completedEl = document.getElementById('kpi-completed-apps');
    const completedPctEl = document.getElementById('kpi-completed-pct');
    const processingEl = document.getElementById('kpi-processing-apps');
    const queuedEl = document.getElementById('kpi-queued-apps');

    if (totalEl) totalEl.textContent = total;
    if (completedEl) completedEl.textContent = byStatus.completed || 0;
    if (processingEl) processingEl.textContent = byStatus.processing || 0;
    if (queuedEl) queuedEl.textContent = byStatus.queued || 0;

    if (completedPctEl) {
      const pct = total > 0 ? Math.round(((byStatus.completed || 0) / total) * 100) : 0;
      completedPctEl.textContent = `${pct}% Cleared`;
    }
  }

  /**
   * 2. Render Department Service Health Badges
   */
  function renderDepartmentStatuses() {
    const statuses = state.serviceStatuses || {};
    const depts = ['identity', 'revenue', 'tax', 'municipal'];
    let allOnline = true;

    depts.forEach(dept => {
      const badgeEl = document.getElementById(`status-badge-${dept}`);
      const st = (statuses[dept] || 'online').toLowerCase();
      if (st !== 'online') allOnline = false;

      if (badgeEl) {
        badgeEl.className = `badge badge-${st === 'online' ? 'online' : 'offline'}`;
        badgeEl.textContent = st.toUpperCase();
      }
    });

    const allBadge = document.getElementById('dept-all-status-badge');
    if (allBadge) {
      if (allOnline) {
        allBadge.className = 'badge badge-online';
        allBadge.innerHTML = '<span class="status-indicator online"></span>ALL SERVICES ONLINE';
      } else {
        allBadge.className = 'badge badge-queued';
        allBadge.innerHTML = '<span class="status-indicator queued"></span>PARTIAL DEGRADATION';
      }
    }
  }

  /**
   * 3. Render Verification Stages Throughput
   */
  function renderVerificationThroughput() {
    const total = state.applications.length || 1;
    const vStats = state.stats ? state.stats.verifications : null;

    const depts = [
      { key: 'identity', countId: 'v-count-identity', barId: 'v-bar-identity' },
      { key: 'revenue', countId: 'v-count-revenue', barId: 'v-bar-revenue', alias: 'address' },
      { key: 'tax', countId: 'v-count-tax', barId: 'v-bar-tax' },
      { key: 'municipal', countId: 'v-count-municipal', barId: 'v-bar-municipal' }
    ];

    depts.forEach(item => {
      let verifiedCount = 0;
      const key = item.alias || item.key;

      if (vStats && vStats[key]) {
        verifiedCount = vStats[key].verified || 0;
      } else {
        // Fallback calculation from applications array
        verifiedCount = state.applications.filter(app => 
          app.verifications && app.verifications[key] === 'verified'
        ).length;
      }

      const pct = Math.min(100, Math.round((verifiedCount / total) * 100));
      const countEl = document.getElementById(item.countId);
      const barEl = document.getElementById(item.barId);

      if (countEl) countEl.textContent = `${verifiedCount} / ${state.applications.length} Verified (${pct}%)`;
      if (barEl) barEl.style.width = `${pct}%`;
    });
  }

  /**
   * 4. Render Applications by Public Service
   */
  function renderServiceDistribution() {
    const container = document.getElementById('services-distribution-container');
    if (!container) return;

    const services = state.stats && Array.isArray(state.stats.byService) && state.stats.byService.length > 0
      ? state.stats.byService
      : [
          { id: 'business-reg', name: 'Business Registration (Unified)', department: 'Municipal & Revenue', count: 0 },
          { id: 'income-cert', name: 'Income Certificate Issuance', department: 'Revenue Service', count: 0 },
          { id: 'trade-license', name: 'Trade License Renewal', department: 'Municipal Service', count: 0 },
          { id: 'property-tax-clearance', name: 'Property Tax Clearance', department: 'Tax Service', count: 0 }
        ];

    // Recalculate counts if needed
    services.forEach(srv => {
      srv.count = state.applications.filter(app => app.serviceId === srv.id || app.service === srv.name).length;
    });

    const total = state.applications.length || 1;

    container.innerHTML = services.map(srv => {
      const pct = Math.round((srv.count / total) * 100);
      return `
        <div class="service-dist-item">
          <div class="service-dist-header">
            <div>
              <span>${JanSetuUI.escapeHtml(srv.name)}</span>
              <span class="service-dist-dept">&nbsp;&bull;&nbsp;${JanSetuUI.escapeHtml(srv.department)}</span>
            </div>
            <span><strong>${srv.count}</strong> apps (${pct}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * 5. Filter & Sort Applications
   */
  function getFilteredApplications() {
    const { search, status, serviceId, sort } = state.filters;
    let list = [...state.applications];

    // 1. Text Search Filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(app => {
        const id = (app.id || '').toLowerCase();
        const name = (app.applicant && app.applicant.name ? app.applicant.name : '').toLowerCase();
        const email = (app.applicant && app.applicant.email ? app.applicant.email : '').toLowerCase();
        const phone = (app.applicant && app.applicant.phone ? app.applicant.phone : '').toLowerCase();
        const service = (app.service || '').toLowerCase();
        return id.includes(q) || name.includes(q) || email.includes(q) || phone.includes(q) || service.includes(q);
      });
    }

    // 2. Status Filter
    if (status && status !== 'all') {
      list = list.filter(app => (app.status || '').toLowerCase() === status.toLowerCase());
    }

    // 3. Service Type Filter
    if (serviceId && serviceId !== 'all') {
      list = list.filter(app => app.serviceId === serviceId || app.service === serviceId);
    }

    // 4. Sorting
    list.sort((a, b) => {
      if (sort === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (sort === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      } else if (sort === 'status') {
        return (a.status || '').localeCompare(b.status || '');
      } else if (sort === 'name') {
        const nameA = (a.applicant && a.applicant.name) || '';
        const nameB = (b.applicant && b.applicant.name) || '';
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    return list;
  }

  /**
   * 6. Render Applications Registry Table
   */
  function renderApplicationsTable() {
    const tbody = document.getElementById('applications-table-body');
    const countBadge = document.getElementById('applications-count-badge');
    const emptyBox = document.getElementById('applications-empty-state');
    if (!tbody) return;

    const filtered = getFilteredApplications();

    if (countBadge) {
      countBadge.className = 'badge badge-online';
      countBadge.textContent = `${filtered.length} of ${state.applications.length} Records`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyBox) emptyBox.style.display = 'block';
      return;
    }

    if (emptyBox) emptyBox.style.display = 'none';

    tbody.innerHTML = filtered.map(app => {
      const applicantName = (app.applicant && app.applicant.name) || 'Anonymous';
      const applicantEmail = (app.applicant && app.applicant.email) || 'N/A';
      const applicantPhone = (app.applicant && app.applicant.phone) || 'N/A';
      const serviceName = app.service || 'Business Registration';
      const statusBadge = JanSetuUI.getStatusBadgeHTML(app.status || 'processing');
      const docsCount = Array.isArray(app.documents) ? app.documents.length : 0;
      const formattedDate = JanSetuUI.formatDate(app.createdAt);

      // Verifications Mini Pills (Identity, Address, Tax, Municipal)
      const v = app.verifications || {};
      const vPills = [
        { label: 'I', key: 'identity', state: v.identity || 'pending', title: 'Identity Verification' },
        { label: 'A', key: 'address', state: v.address || 'pending', title: 'Address / Revenue Verification' },
        { label: 'T', key: 'tax', state: v.tax || 'pending', title: 'Tax Compliance' },
        { label: 'M', key: 'municipal', state: v.municipal || 'pending', title: 'Municipal Clearance' }
      ].map(p => `
        <span class="verify-pill v-${p.state.toLowerCase()}" title="${p.title}: ${p.state.toUpperCase()}">${p.label}</span>
      `).join('');

      return `
        <tr>
          <td>
            <div class="flex" style="gap: 0.35rem;">
              <a href="/pages/tracking/?id=${encodeURIComponent(app.id)}" class="app-id-link" title="Open in Application Tracker">
                ${JanSetuUI.escapeHtml(app.id)}
              </a>
              <button class="copy-btn" title="Copy Application ID" onclick="DashboardApp.copyId('${JanSetuUI.escapeHtml(app.id)}')">Copy</button>
            </div>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--color-navy-dark);">${JanSetuUI.escapeHtml(applicantName)}</div>
            <div style="font-size: 0.75rem; color: var(--color-text-light);">${JanSetuUI.escapeHtml(applicantEmail)} &bull; ${JanSetuUI.escapeHtml(applicantPhone)}</div>
          </td>
          <td>
            <div style="font-weight: 500;">${JanSetuUI.escapeHtml(serviceName)}</div>
            <div style="font-size: 0.75rem; color: var(--color-text-light);">Code: ${JanSetuUI.escapeHtml(app.serviceId || 'business-reg')}</div>
          </td>
          <td>${statusBadge}</td>
          <td>
            <div class="verify-pills" title="Verification Progress (I: Identity, A: Address, T: Tax, M: Municipal)">
              ${vPills}
            </div>
          </td>
          <td>
            <span class="badge ${docsCount > 0 ? 'badge-verified' : 'badge-pending'}" style="font-size: 0.72rem;">
              ${docsCount} ${docsCount === 1 ? 'Doc' : 'Docs'}
            </span>
          </td>
          <td>
            <span style="font-size: 0.8rem; color: var(--color-text-muted);">${formattedDate}</span>
          </td>
          <td style="text-align: right;">
            <div class="flex gap-1" style="justify-content: flex-end;">
              <a href="/pages/tracking/?id=${encodeURIComponent(app.id)}" class="btn btn-outline btn-sm" title="Track this application">
                Track &rarr;
              </a>
              <a href="/pages/audit/?applicationId=${encodeURIComponent(app.id)}" class="btn btn-outline btn-sm" title="View Audit Logs for this app">
                Audit
              </a>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * 7. Render Recent Inter-Departmental Activity
   */
  function renderRecentActivity() {
    const stream = document.getElementById('recent-activity-stream');
    if (!stream) return;

    const recentLogs = state.stats && Array.isArray(state.stats.recentAuditLogs) && state.stats.recentAuditLogs.length > 0
      ? state.stats.recentAuditLogs
      : [];

    if (recentLogs.length === 0) {
      stream.innerHTML = `
        <li class="activity-item" style="color: var(--color-text-light); font-size: 0.85rem;">
          No recent activity logs recorded yet.
        </li>
      `;
      return;
    }

    stream.innerHTML = recentLogs.slice(0, 6).map(log => {
      const resultBadge = JanSetuUI.getStatusBadgeHTML(log.result || 'verified');
      const timeStr = log.timestamp || 'Just now';
      const appId = log.applicationId && log.applicationId !== 'N/A'
        ? `<a href="/pages/tracking/?id=${encodeURIComponent(log.applicationId)}" style="font-family: monospace; font-weight: 600;">${JanSetuUI.escapeHtml(log.applicationId)}</a>`
        : '<span style="color: var(--color-text-light);">System Event</span>';

      return `
        <li class="activity-item">
          <div class="activity-main">
            <div class="activity-title">${JanSetuUI.escapeHtml(log.request || 'Interoperability Query')}</div>
            <div class="activity-meta">
              <span><strong>${JanSetuUI.escapeHtml(log.department || 'Jan-Setu Gateway')}</strong></span>
              <span>&bull;</span>
              <span>Ref: ${appId}</span>
              <span>&bull;</span>
              <span>${JanSetuUI.escapeHtml(timeStr)}</span>
            </div>
          </div>
          <div>
            ${resultBadge}
          </div>
        </li>
      `;
    }).join('');
  }

  /**
   * Filter Event Listeners Trigger
   */
  function applyFilters() {
    const searchInput = document.getElementById('filter-search');
    const statusSelect = document.getElementById('filter-status');
    const serviceSelect = document.getElementById('filter-service');
    const sortSelect = document.getElementById('filter-sort');

    if (searchInput) state.filters.search = searchInput.value;
    if (statusSelect) state.filters.status = statusSelect.value;
    if (serviceSelect) state.filters.serviceId = serviceSelect.value;
    if (sortSelect) state.filters.sort = sortSelect.value;

    renderApplicationsTable();
  }

  /**
   * Reset Filters
   */
  function resetFilters() {
    state.filters = {
      search: '',
      status: 'all',
      serviceId: 'all',
      sort: 'newest'
    };

    const searchInput = document.getElementById('filter-search');
    const statusSelect = document.getElementById('filter-status');
    const serviceSelect = document.getElementById('filter-service');
    const sortSelect = document.getElementById('filter-sort');

    if (searchInput) searchInput.value = '';
    if (statusSelect) statusSelect.value = 'all';
    if (serviceSelect) serviceSelect.value = 'all';
    if (sortSelect) sortSelect.value = 'newest';

    renderApplicationsTable();
  }

  /**
   * Copy Application ID to Clipboard
   */
  async function copyId(id) {
    const ok = await JanSetuUI.copyToClipboard(id);
    if (ok) {
      alert(`Application ID "${id}" copied to clipboard.`);
    }
  }

  /**
   * Error Banner Helpers
   */
  function showErrorBanner(msg) {
    const banner = document.getElementById('dashboard-error-banner');
    const msgEl = document.getElementById('dashboard-error-message');
    if (banner) {
      if (msgEl) msgEl.textContent = msg || 'An error occurred while loading dashboard data.';
      banner.style.display = 'block';
    }
  }

  function hideErrorBanner() {
    const banner = document.getElementById('dashboard-error-banner');
    if (banner) banner.style.display = 'none';
  }

  // Public Interface
  return {
    init,
    refreshData,
    applyFilters,
    resetFilters,
    copyId
  };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  DashboardApp.init();
});
