/**
 * Jan-Setu Inter-Departmental Audit Log Client Script
 * Author: RUCHA (Engineer - Dashboard + Audit)
 *
 * Responsibilities:
 * - Read filter parameters from URL query strings (?applicationId=JS-2026-001)
 * - Fetch audit event logs via JanSetuAPI.getAudit()
 * - Render event chronology, department badges, citizen-consent purpose notes, and results
 * - Provide interactive search, department filtering, outcome filtering, and chronological sorting
 * - Support deep modal inspection of structured JSON logs with export/copy capabilities
 * - Escape dynamic outputs with JanSetuUI.escapeHtml
 */

const AuditApp = (function () {
  'use strict';

  // Internal State
  let state = {
    logs: [],
    isLoading: true,
    error: null,
    filters: {
      search: '',
      department: 'all',
      result: 'all',
      sort: 'newest'
    },
    selectedLog: null
  };

  /**
   * Initialize Audit Page
   */
  async function init() {
    state.isLoading = true;
    state.error = null;
    hideErrorBanner();

    // Check for pre-populated URL parameters
    const params = new URLSearchParams(window.location.search);
    const appId = params.get('applicationId') || params.get('appId') || params.get('id');
    const searchQ = params.get('search');
    const dept = params.get('department') || params.get('dept');

    if (appId) {
      state.filters.search = appId;
      const searchInput = document.getElementById('audit-filter-search');
      if (searchInput) searchInput.value = appId;
    } else if (searchQ) {
      state.filters.search = searchQ;
      const searchInput = document.getElementById('audit-filter-search');
      if (searchInput) searchInput.value = searchQ;
    }

    if (dept) {
      state.filters.department = dept;
      const deptSelect = document.getElementById('audit-filter-dept');
      if (deptSelect) deptSelect.value = dept;
    }

    try {
      const logsData = await JanSetuAPI.getAudit();
      state.logs = Array.isArray(logsData) ? logsData : [];
      state.isLoading = false;

      renderAudit();
    } catch (err) {
      console.error('Audit log fetch error:', err);
      state.isLoading = false;
      state.error = err.message || 'Failed to fetch audit logs';
      showErrorBanner(state.error);
    }
  }

  /**
   * Refresh Audit Data
   */
  async function refreshData() {
    const btn = document.getElementById('btn-refresh-audit');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Refreshing...';
    }

    await init();

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Refresh Logs';
    }
  }

  /**
   * Render all audit components
   */
  function renderAudit() {
    renderMetrics();
    renderTable();
  }

  /**
   * 1. Render Summary Metrics
   */
  function renderMetrics() {
    const total = state.logs.length;
    const verified = state.logs.filter(l => (l.result || '').toLowerCase().includes('verified')).length;
    const queued = state.logs.filter(l => (l.result || '').toLowerCase().includes('queued')).length;

    const totalEl = document.getElementById('stat-total-events');
    const verifiedEl = document.getElementById('stat-verified-events');
    const queuedEl = document.getElementById('stat-queued-events');

    if (totalEl) totalEl.textContent = total;
    if (verifiedEl) verifiedEl.textContent = verified;
    if (queuedEl) queuedEl.textContent = queued;
  }

  /**
   * 2. Filter & Sort Audit Logs
   */
  function getFilteredLogs() {
    const { search, department, result, sort } = state.filters;
    let list = [...state.logs];

    // Text Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(log => {
        const id = (log.id || '').toLowerCase();
        const appId = (log.applicationId || '').toLowerCase();
        const dept = (log.department || '').toLowerCase();
        const req = (log.request || '').toLowerCase();
        const purp = (log.purpose || '').toLowerCase();
        const res = (log.result || '').toLowerCase();
        return id.includes(q) || appId.includes(q) || dept.includes(q) || req.includes(q) || purp.includes(q) || res.includes(q);
      });
    }

    // Department Filter
    if (department && department !== 'all') {
      const d = department.toLowerCase();
      list = list.filter(log => (log.department || '').toLowerCase().includes(d));
    }

    // Result Filter
    if (result && result !== 'all') {
      const r = result.toLowerCase();
      list = list.filter(log => (log.result || '').toLowerCase().includes(r));
    }

    // Sort Order
    list.sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime() || 0;
      const timeB = new Date(b.timestamp || 0).getTime() || 0;
      return sort === 'oldest' ? timeA - timeB : timeB - timeA;
    });

    return list;
  }

  /**
   * 3. Render Audit Table Rows
   */
  function renderTable() {
    const tbody = document.getElementById('audit-table-body');
    const countBadge = document.getElementById('audit-count-badge');
    const emptyBox = document.getElementById('audit-empty-state');
    if (!tbody) return;

    const filtered = getFilteredLogs();

    if (countBadge) {
      countBadge.className = 'badge badge-online';
      countBadge.textContent = `${filtered.length} of ${state.logs.length} Events`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyBox) emptyBox.style.display = 'block';
      return;
    }

    if (emptyBox) emptyBox.style.display = 'none';

    tbody.innerHTML = filtered.map(log => {
      const resultBadge = JanSetuUI.getStatusBadgeHTML(log.result || 'verified');
      const timeStr = log.timestamp || 'N/A';
      const hasApp = log.applicationId && log.applicationId !== 'N/A';

      const appLink = hasApp
        ? `<a href="/pages/tracking/?id=${encodeURIComponent(log.applicationId)}" class="app-id-link" title="Track ${JanSetuUI.escapeHtml(log.applicationId)}">
             ${JanSetuUI.escapeHtml(log.applicationId)}
           </a>`
        : `<span style="color: var(--color-text-light); font-size: 0.8rem; font-style: italic;">Platform Event</span>`;

      return `
        <tr>
          <td>
            <span class="audit-id-badge" title="Immutable Event Reference">${JanSetuUI.escapeHtml(log.id)}</span>
          </td>
          <td>
            <span style="font-size: 0.82rem; font-weight: 500; color: var(--color-text-muted);">${JanSetuUI.escapeHtml(timeStr)}</span>
          </td>
          <td>${appLink}</td>
          <td>
            <span class="audit-dept-tag">
              <span class="status-indicator online"></span>
              ${JanSetuUI.escapeHtml(log.department || 'Jan-Setu Gateway')}
            </span>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--color-navy-dark);">${JanSetuUI.escapeHtml(log.request || 'Verification Query')}</div>
            <div class="audit-purpose-box">
              <strong>Purpose:</strong> ${JanSetuUI.escapeHtml(log.purpose || 'Citizen Application Consent')}
            </div>
          </td>
          <td>${resultBadge}</td>
          <td style="text-align: right;">
            <button class="btn btn-outline btn-sm" onclick="AuditApp.openModal('${JanSetuUI.escapeHtml(log.id)}')">
              Details
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Apply User Filters
   */
  function applyFilters() {
    const searchInput = document.getElementById('audit-filter-search');
    const deptSelect = document.getElementById('audit-filter-dept');
    const resultSelect = document.getElementById('audit-filter-result');
    const sortSelect = document.getElementById('audit-filter-sort');

    if (searchInput) state.filters.search = searchInput.value;
    if (deptSelect) state.filters.department = deptSelect.value;
    if (resultSelect) state.filters.result = resultSelect.value;
    if (sortSelect) state.filters.sort = sortSelect.value;

    renderTable();
  }

  /**
   * Reset All Filters
   */
  function resetFilters() {
    state.filters = {
      search: '',
      department: 'all',
      result: 'all',
      sort: 'newest'
    };

    const searchInput = document.getElementById('audit-filter-search');
    const deptSelect = document.getElementById('audit-filter-dept');
    const resultSelect = document.getElementById('audit-filter-result');
    const sortSelect = document.getElementById('audit-filter-sort');

    if (searchInput) searchInput.value = '';
    if (deptSelect) deptSelect.value = 'all';
    if (resultSelect) resultSelect.value = 'all';
    if (sortSelect) sortSelect.value = 'newest';

    // Clear URL query params without reloading
    window.history.replaceState({}, document.title, window.location.pathname);

    renderTable();
  }

  /**
   * Open Record Details Modal
   */
  function openModal(logId) {
    const log = state.logs.find(l => l.id === logId);
    if (!log) return;

    state.selectedLog = log;
    const modal = document.getElementById('audit-modal');
    const titleEl = document.getElementById('modal-event-title');
    const idEl = document.getElementById('modal-event-id');
    const statusEl = document.getElementById('modal-event-status');
    const timeEl = document.getElementById('modal-event-time');
    const jsonEl = document.getElementById('modal-raw-json');

    if (titleEl) titleEl.textContent = log.request || 'Audit Log Event';
    if (idEl) idEl.textContent = log.id;
    if (statusEl) statusEl.innerHTML = JanSetuUI.getStatusBadgeHTML(log.result);
    if (timeEl) timeEl.textContent = `Recorded: ${log.timestamp} | Department: ${log.department} | Application: ${log.applicationId || 'N/A'}`;
    if (jsonEl) jsonEl.textContent = JSON.stringify(log, null, 2);

    if (modal) modal.style.display = 'flex';
  }

  /**
   * Close Details Modal
   */
  function closeModal() {
    const modal = document.getElementById('audit-modal');
    if (modal) modal.style.display = 'none';
    state.selectedLog = null;
  }

  /**
   * Copy Modal JSON
   */
  async function copyModalJSON() {
    if (!state.selectedLog) return;
    const jsonStr = JSON.stringify(state.selectedLog, null, 2);
    const ok = await JanSetuUI.copyToClipboard(jsonStr);
    if (ok) {
      alert('Event JSON copied to clipboard.');
    }
  }

  /**
   * Export All Filtered Logs to JSON
   */
  async function exportJSON() {
    const filtered = getFilteredLogs();
    const jsonStr = JSON.stringify(filtered, null, 2);
    const ok = await JanSetuUI.copyToClipboard(jsonStr);
    if (ok) {
      alert(`Exported ${filtered.length} audit records as formatted JSON to clipboard.`);
    }
  }

  /**
   * Error Handling
   */
  function showErrorBanner(msg) {
    const banner = document.getElementById('audit-error-banner');
    const msgEl = document.getElementById('audit-error-message');
    if (banner) {
      if (msgEl) msgEl.textContent = msg || 'Failed to load audit logs.';
      banner.style.display = 'block';
    }
  }

  function hideErrorBanner() {
    const banner = document.getElementById('audit-error-banner');
    if (banner) banner.style.display = 'none';
  }

  return {
    init,
    refreshData,
    applyFilters,
    resetFilters,
    openModal,
    closeModal,
    copyModalJSON,
    exportJSON
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  AuditApp.init();
});
