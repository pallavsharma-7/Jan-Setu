/**
 * Jan-Setu System Status & Monitoring Client Script
 * Author: PARTH (Engineer - Monitoring & System Health)
 *
 * Responsibilities:
 * - Real-time telemetry ingestion via JanSetuAPI.getMonitoringData()
 * - Live departmental adapter health visualization, status toggles, and diagnostic probes
 * - Queue depth & bottleneck analysis across Identity, Revenue, Tax, and Municipal services
 * - Resilient fault-tolerance simulation controls (outage injection & auto-recovery queue drain)
 * - Orchestration pipeline inspector with verification matrices
 * - API endpoint health matrix and live telemetry stream
 * - Diagnostic JSON modal with one-click copy
 * - Secure HTML escaping via JanSetuUI.escapeHtml
 */

const MonitoringApp = (function () {
  'use strict';

  // Internal State
  let state = {
    telemetry: null,
    pipelineFilter: 'all',
    eventSeverityFilter: 'all',
    autoRefreshInterval: 10,
    autoRefreshTimer: null,
    isLoading: true,
    error: null
  };

  /**
   * Initialize Monitoring Module
   */
  async function init() {
    state.isLoading = true;
    state.error = null;
    hideErrorBanner();

    try {
      const data = await JanSetuAPI.getMonitoringData();
      state.telemetry = data || {};
      state.isLoading = false;

      renderMonitoring();
      setupAutoRefresh();
    } catch (err) {
      console.error('Monitoring initialization failed:', err);
      state.isLoading = false;
      state.error = err.message || 'Failed to communicate with Monitoring API';
      showErrorBanner(state.error);
    }
  }

  /**
   * Setup or restart auto-refresh interval
   */
  function setupAutoRefresh() {
    if (state.autoRefreshTimer) {
      clearInterval(state.autoRefreshTimer);
      state.autoRefreshTimer = null;
    }

    if (state.autoRefreshInterval > 0) {
      state.autoRefreshTimer = setInterval(async () => {
        try {
          const data = await JanSetuAPI.getMonitoringData();
          if (data && !data.error) {
            state.telemetry = data;
            renderMonitoring();
          }
        } catch (e) {
          console.warn('Background auto-refresh error:', e);
        }
      }, state.autoRefreshInterval * 1000);
    }
  }

  /**
   * Handle dropdown change for auto-refresh interval
   */
  function handleAutoRefreshChange(val) {
    state.autoRefreshInterval = parseInt(val, 10) || 0;
    setupAutoRefresh();
  }

  /**
   * Manual refresh on demand with button animation
   */
  async function refreshData() {
    const btn = document.getElementById('btn-refresh-monitoring');
    const icon = document.getElementById('refresh-icon');
    if (btn) btn.disabled = true;
    if (icon) icon.style.display = 'inline-block';

    try {
      const data = await JanSetuAPI.getMonitoringData();
      state.telemetry = data || {};
      renderMonitoring();
    } catch (err) {
      console.error('Manual refresh failed:', err);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  /**
   * Master Render Function
   */
  function renderMonitoring() {
    renderKPIs();
    renderAdapters();
    renderPipelineTable();
    renderEndpointsTable();
    renderEventStream();
  }

  /**
   * 1. Render Top KPI Telemetry Cards
   */
  function renderKPIs() {
    const t = state.telemetry || {};
    const pipeline = t.pipeline || {};
    const runtime = t.runtime || {};
    const adapters = t.adapters || [];

    // Header Status Pill
    const headerStatusEl = document.getElementById('header-system-status');
    if (headerStatusEl) {
      if (t.overallHealth === 'operational') {
        headerStatusEl.className = 'badge badge-online';
        headerStatusEl.innerHTML = '<span class="status-indicator online"></span>SYSTEM TELEMETRY ACTIVE';
      } else if (t.overallHealth === 'degraded') {
        headerStatusEl.className = 'badge badge-queued';
        headerStatusEl.innerHTML = '<span class="status-indicator queued"></span>SYSTEM DEGRADED';
      } else {
        headerStatusEl.className = 'badge badge-offline';
        headerStatusEl.innerHTML = '<span class="status-indicator offline"></span>SYSTEM CRITICAL';
      }
    }

    // System Health KPI Card
    const healthCard = document.getElementById('kpi-system-health-card');
    const healthStatusEl = document.getElementById('kpi-health-status');
    const healthIconEl = document.getElementById('kpi-health-icon');
    const onlineBadgeEl = document.getElementById('kpi-online-adapters-badge');
    const healthSubtextEl = document.getElementById('kpi-health-subtext');

    if (healthCard && healthStatusEl) {
      healthCard.className = `kpi-card ${t.overallHealth || 'operational'}`;
      if (t.overallHealth === 'operational') {
        healthStatusEl.textContent = 'OPERATIONAL';
        healthStatusEl.style.color = 'var(--color-success)';
        if (healthIconEl) healthIconEl.textContent = '✅';
      } else if (t.overallHealth === 'degraded') {
        healthStatusEl.textContent = 'DEGRADED';
        healthStatusEl.style.color = 'var(--color-warning)';
        if (healthIconEl) healthIconEl.textContent = '⚠️';
      } else {
        healthStatusEl.textContent = 'OUTAGE';
        healthStatusEl.style.color = 'var(--color-danger)';
        if (healthIconEl) healthIconEl.textContent = '🛑';
      }

      if (onlineBadgeEl) {
        onlineBadgeEl.className = t.overallHealth === 'operational' ? 'badge badge-online' : 'badge badge-queued';
        onlineBadgeEl.textContent = `${t.onlineAdaptersCount || 0}/${t.totalAdaptersCount || 4} Adapters Online`;
      }
      if (healthSubtextEl) {
        healthSubtextEl.textContent = t.healthLabel || 'Gateway active';
      }
    }

    // Gateway Telemetry Card
    const latencyEl = document.getElementById('kpi-gateway-latency');
    const uptimeEl = document.getElementById('kpi-server-uptime');
    const memoryEl = document.getElementById('kpi-memory-usage');

    if (latencyEl) {
      const activeOnline = adapters.filter(a => a.isOnline);
      const avgLat = activeOnline.length > 0
        ? Math.round(activeOnline.reduce((sum, a) => sum + (a.latencyMs || 0), 0) / activeOnline.length)
        : 0;
      latencyEl.textContent = `~${avgLat || 12} ms`;
    }

    if (uptimeEl) {
      const upSec = runtime.uptimeSeconds || 0;
      uptimeEl.textContent = `Uptime: ${formatUptime(upSec)}`;
    }
    if (memoryEl) {
      memoryEl.textContent = `Heap: ${runtime.heapUsedMB || 0} MB`;
    }

    // Pipeline Throughput Card
    const throughputEl = document.getElementById('kpi-pipeline-throughput');
    const rateEl = document.getElementById('kpi-completion-rate');
    const inFlightEl = document.getElementById('kpi-processing-count');

    if (throughputEl) {
      throughputEl.textContent = `${pipeline.completedCount || 0} / ${pipeline.totalApplications || 0}`;
    }
    if (rateEl) {
      rateEl.textContent = `${pipeline.completionRate || 0}% Cleared`;
      rateEl.className = (pipeline.completionRate || 0) >= 50 ? 'badge badge-online' : 'badge badge-queued';
    }
    if (inFlightEl) {
      inFlightEl.textContent = `${(pipeline.processingCount || 0) + (pipeline.queuedCount || 0)} In Pipeline`;
    }

    // Resilient Queue Depth Card
    const queueCard = document.getElementById('kpi-queue-card');
    const queueDepthEl = document.getElementById('kpi-queue-depth');
    const queueBadgeEl = document.getElementById('kpi-queue-badge');
    const queueSubtextEl = document.getElementById('kpi-queue-subtext');

    const queuedCount = pipeline.queuedCount || 0;
    if (queueDepthEl) {
      queueDepthEl.textContent = queuedCount;
      queueDepthEl.style.color = queuedCount > 0 ? 'var(--color-warning)' : 'var(--color-success)';
    }
    if (queueBadgeEl) {
      if (queuedCount === 0) {
        queueBadgeEl.className = 'badge badge-online';
        queueBadgeEl.textContent = 'Queue Empty (Optimal)';
      } else {
        queueBadgeEl.className = 'badge badge-queued';
        queueBadgeEl.textContent = `${queuedCount} Request(s) Queued`;
      }
    }
    if (queueSubtextEl) {
      const bCounts = pipeline.bottleneckCounts || {};
      const bottleneckNames = Object.entries(bCounts)
        .filter(([k, v]) => v > 0)
        .map(([k, v]) => `${k.toUpperCase()} (${v})`);
      queueSubtextEl.textContent = bottleneckNames.length > 0 ? `Held at: ${bottleneckNames.join(', ')}` : 'Zero bottlenecks';
    }
  }

  /**
   * 2. Render Department Interoperability Adapters
   */
  function renderAdapters() {
    const container = document.getElementById('adapters-container');
    if (!container) return;

    const adapters = (state.telemetry && state.telemetry.adapters) || [];
    if (!adapters.length) {
      container.innerHTML = '<div class="loading-placeholder">No departmental adapters available.</div>';
      return;
    }

    container.innerHTML = adapters.map(adapter => {
      const isOnline = adapter.status === 'online';
      const statusBadgeClass = isOnline ? 'badge-online' : 'badge-offline';
      const indicatorClass = isOnline ? 'online' : 'offline';
      const statusText = isOnline ? 'ONLINE' : 'OFFLINE';

      return `
        <div class="adapter-card ${isOnline ? 'online' : 'offline'}" id="adapter-card-${adapter.id}">
          <div>
            <div class="adapter-header">
              <div class="adapter-title-box">
                <h3>${JanSetuUI.escapeHtml(adapter.name)}</h3>
                <div class="adapter-dept-desc">${JanSetuUI.escapeHtml(adapter.department)}</div>
              </div>
              <span class="badge ${statusBadgeClass}">
                <span class="status-indicator ${indicatorClass}"></span>${statusText}
              </span>
            </div>

            <div class="adapter-endpoint-tag">
              <span>Endpoint:</span> <code>${JanSetuUI.escapeHtml(adapter.endpoint)}</code>
            </div>

            <div class="adapter-telemetry-row">
              <div class="telemetry-cell">
                <span class="telemetry-cell-label">Simulated Latency</span>
                <span class="telemetry-cell-val latency">${isOnline ? `${adapter.latencyMs} ms` : 'Offline'}</span>
              </div>
              <div class="telemetry-cell">
                <span class="telemetry-cell-label">Verified</span>
                <span class="telemetry-cell-val" style="color: var(--color-success);">${adapter.verifiedCount || 0}</span>
              </div>
              <div class="telemetry-cell">
                <span class="telemetry-cell-label">Queued</span>
                <span class="telemetry-cell-val" style="color: ${(adapter.queuedCount || 0) > 0 ? 'var(--color-warning)' : 'var(--color-text-main)'};">${adapter.queuedCount || 0}</span>
              </div>
              <div class="telemetry-cell">
                <span class="telemetry-cell-label">Uptime</span>
                <span class="telemetry-cell-val">${adapter.uptimePct || 99.8}%</span>
              </div>
            </div>
          </div>

          <div class="adapter-footer-actions">
            <button class="btn btn-outline btn-sm" onclick="MonitoringApp.probeDepartment('${adapter.id}')">
              <span>⚡</span> Probe Adapter
            </button>
            <button 
              class="btn-toggle-service ${isOnline ? 'is-online' : 'is-offline'}" 
              onclick="MonitoringApp.toggleAdapterStatus('${adapter.id}', '${adapter.status}')"
            >
              <span>${isOnline ? '⏸️' : '▶️'}</span>
              <span>${isOnline ? 'Simulate Outage (Set Offline)' : 'Bring Online (Drain Queue)'}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Toggle a department service adapter Online <-> Offline
   */
  async function toggleAdapterStatus(deptId, currentStatus) {
    const targetStatus = currentStatus === 'online' ? 'offline' : 'online';
    const cardEl = document.getElementById(`adapter-card-${deptId}`);
    if (cardEl) {
      cardEl.style.opacity = '0.6';
    }

    try {
      const res = await JanSetuAPI.updateServiceStatus(deptId, targetStatus);
      if (res && res.success) {
        showSimulationStatus(`Status updated: ${deptId.toUpperCase()} Service is now ${targetStatus.toUpperCase()}`);
        await refreshData();
      } else {
        alert(`Failed to update status: ${(res && res.error) || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Service toggle failed:', err);
      alert('Error updating service status.');
    }
  }

  /**
   * Diagnostic probe on a single department adapter
   */
  async function probeDepartment(deptId) {
    try {
      const res = await JanSetuAPI.probeDepartment(deptId);
      openProbeModal(res);
    } catch (err) {
      console.error('Probe failed:', err);
      alert('Diagnostic probe failed.');
    }
  }

  /**
   * Probe all 4 department adapters sequentially
   */
  async function probeAllAdapters() {
    const depts = ['identity', 'revenue', 'tax', 'municipal'];
    const results = [];
    for (const d of depts) {
      try {
        const r = await JanSetuAPI.probeDepartment(d);
        results.push(r);
      } catch (e) {
        results.push({ department: d, success: false, error: e.message });
      }
    }
    openMultiProbeModal(results);
    await refreshData();
  }

  /**
   * 3. Interactive Outage Simulation Scenarios
   */
  async function simulateTaxOutage() {
    showSimulationStatus('Simulating Tax Service Outage (Setting Tax to Offline)...');
    try {
      await JanSetuAPI.updateServiceStatus('tax', 'offline');
      await refreshData();
      showSimulationStatus('Tax Service is now OFFLINE. In-flight and new Tax checks will be safely queued.');
    } catch (e) {
      showSimulationStatus('Simulation action failed: ' + e.message);
    }
  }

  async function restoreAllServices() {
    showSimulationStatus('Restoring all 4 Department Adapters to ONLINE and triggering queue drain...');
    try {
      await JanSetuAPI.updateServiceStatus('identity', 'online');
      await JanSetuAPI.updateServiceStatus('revenue', 'online');
      await JanSetuAPI.updateServiceStatus('tax', 'online');
      await JanSetuAPI.updateServiceStatus('municipal', 'online');
      await JanSetuAPI.reorchestrateQueued();
      await refreshData();
      showSimulationStatus('All adapters are ONLINE. Resilient queue drained successfully!');
    } catch (e) {
      showSimulationStatus('Restoration failed: ' + e.message);
    }
  }

  async function triggerReorchestration() {
    showSimulationStatus('Forcing Orchestration Engine re-sync across all queued applications...');
    try {
      const res = await JanSetuAPI.reorchestrateQueued();
      await refreshData();
      const count = res.processedCount || 0;
      showSimulationStatus(`Re-orchestration completed. Re-processed ${count} application(s).`);
    } catch (e) {
      showSimulationStatus('Re-orchestration failed: ' + e.message);
    }
  }

  function showSimulationStatus(msg) {
    const el = document.getElementById('sim-status-message');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => {
      el.style.display = 'none';
    }, 6000);
  }

  /**
   * 4. Orchestration Pipeline & Queue Inspector Table
   */
  function setPipelineFilter(filter, el) {
    state.pipelineFilter = filter;
    const pills = document.querySelectorAll('.filter-pill');
    pills.forEach(p => p.classList.remove('active'));
    if (el) el.classList.add('active');
    renderPipelineTable();
  }

  async function renderPipelineTable() {
    const tbody = document.getElementById('pipeline-table-body');
    if (!tbody) return;

    try {
      const apps = await JanSetuAPI.getApplications();
      let list = Array.isArray(apps) ? apps : [];

      if (state.pipelineFilter !== 'all') {
        list = list.filter(a => (a.status || '').toLowerCase() === state.pipelineFilter.toLowerCase());
      }

      if (!list.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center" style="padding: 2.5rem; color: var(--color-text-light);">
              No applications match filter: <strong>${JanSetuUI.escapeHtml(state.pipelineFilter)}</strong>.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = list.map(app => {
        const v = app.verifications || {};
        const bottleneckDepts = [];
        ['identity', 'revenue', 'tax', 'municipal'].forEach(dept => {
          if (v[dept] === 'queued') bottleneckDepts.push(dept.toUpperCase());
        });

        const bottleneckTag = bottleneckDepts.length > 0
          ? `<span class="badge badge-queued">${bottleneckDepts.join(', ')} (Offline)</span>`
          : `<span style="color: var(--color-text-light); font-size: 0.78rem;">None (Flowing)</span>`;

        return `
          <tr>
            <td>
              <a href="/pages/tracking/?id=${encodeURIComponent(app.id)}" style="font-weight: 700;">
                ${JanSetuUI.escapeHtml(app.id)}
              </a>
            </td>
            <td>
              <div style="font-weight: 600;">${JanSetuUI.escapeHtml((app.applicant && app.applicant.name) || 'Unknown')}</div>
              <div style="font-size: 0.75rem; color: var(--color-text-light);">${JanSetuUI.escapeHtml((app.applicant && app.applicant.phone) || '')}</div>
            </td>
            <td>
              <div style="font-size: 0.85rem;">${JanSetuUI.escapeHtml(app.service || 'General')}</div>
            </td>
            <td>
              ${JanSetuUI.getStatusBadgeHTML(app.status)}
            </td>
            <td>
              ${bottleneckTag}
            </td>
            <td>
              <div class="matrix-badges">
                <span class="matrix-badge ${v.identity || 'pending'}" title="Identity Verification">ID: ${(v.identity || 'P').slice(0, 3)}</span>
                <span class="matrix-badge ${v.address || 'pending'}" title="Revenue/Address Verification">REV: ${(v.address || 'P').slice(0, 3)}</span>
                <span class="matrix-badge ${v.tax || 'pending'}" title="Tax Compliance Verification">TAX: ${(v.tax || 'P').slice(0, 3)}</span>
                <span class="matrix-badge ${v.municipal || 'pending'}" title="Municipal Clearance Verification">MUN: ${(v.municipal || 'P').slice(0, 3)}</span>
              </div>
            </td>
            <td>
              <div class="flex gap-05">
                <a href="/pages/tracking/?id=${encodeURIComponent(app.id)}" class="btn btn-outline btn-sm" style="font-size: 0.72rem; padding: 0.2rem 0.45rem;">
                  Track
                </a>
                <a href="/pages/audit/?applicationId=${encodeURIComponent(app.id)}" class="btn btn-outline btn-sm" style="font-size: 0.72rem; padding: 0.2rem 0.45rem;">
                  Audit
                </a>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } catch (e) {
      console.error('Error rendering pipeline table:', e);
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center" style="padding: 2rem; color: var(--color-danger);">
            Failed to load pipeline applications.
          </td>
        </tr>
      `;
    }
  }

  /**
   * 5. Render API Endpoints Table
   */
  function renderEndpointsTable() {
    const tbody = document.getElementById('endpoints-table-body');
    if (!tbody) return;

    const endpoints = (state.telemetry && state.telemetry.apiEndpoints) || [];
    if (!endpoints.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">No endpoint telemetry available.</td></tr>';
      return;
    }

    tbody.innerHTML = endpoints.map(ep => {
      const isHealthy = ep.status === 'HEALTHY';
      const isOffline = ep.status === 'OFFLINE';
      const badgeClass = isHealthy ? 'badge-online' : (isOffline ? 'badge-offline' : 'badge-queued');

      return `
        <tr>
          <td><span class="method-badge ${ep.method}">${ep.method}</span></td>
          <td><code>${JanSetuUI.escapeHtml(ep.path)}</code></td>
          <td>${JanSetuUI.escapeHtml(ep.target)}</td>
          <td style="font-family: monospace; color: var(--color-teal);">${ep.avgLatency}</td>
          <td><span class="badge ${badgeClass}">${ep.status}</span></td>
        </tr>
      `;
    }).join('');
  }

  /**
   * 6. Render Real-time Telemetry Event Stream
   */
  function handleEventFilterChange(val) {
    state.eventSeverityFilter = val;
    renderEventStream();
  }

  function renderEventStream() {
    const container = document.getElementById('events-stream-list');
    if (!container) return;

    let events = (state.telemetry && state.telemetry.recentEvents) || [];
    if (state.eventSeverityFilter !== 'all') {
      events = events.filter(e => (e.severity || 'info') === state.eventSeverityFilter);
    }

    if (!events.length) {
      container.innerHTML = '<div class="loading-placeholder">No system events match selected severity filter.</div>';
      return;
    }

    container.innerHTML = events.map(evt => {
      const severity = evt.severity || 'info';

      return `
        <div class="event-stream-item severity-${severity}">
          <div class="event-item-main">
            <span class="event-item-dept">[${JanSetuUI.escapeHtml(evt.department)}]</span>
            <span class="event-item-action"><strong>${JanSetuUI.escapeHtml(evt.request)}</strong> &bull; ${JanSetuUI.escapeHtml(evt.purpose || '')}</span>
          </div>
          <div class="event-item-meta">
            ${evt.applicationId && evt.applicationId !== 'N/A' ? `<span class="badge badge-pending" style="font-size: 0.7rem;">${JanSetuUI.escapeHtml(evt.applicationId)}</span>` : ''}
            ${JanSetuUI.getStatusBadgeHTML(evt.result)}
            <span>${JanSetuUI.escapeHtml(evt.timestamp)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * 7. Diagnostics JSON Modal
   */
  function openDiagnosticsModal() {
    const modal = document.getElementById('diagnostics-modal');
    const content = document.getElementById('diagnostics-json-content');
    if (!modal || !content) return;

    content.textContent = JSON.stringify(state.telemetry || {}, null, 2);
    modal.style.display = 'flex';
  }

  function closeDiagnosticsModal() {
    const modal = document.getElementById('diagnostics-modal');
    if (modal) modal.style.display = 'none';
  }

  async function copyDiagnosticsJSON() {
    const content = document.getElementById('diagnostics-json-content');
    const btn = document.getElementById('btn-copy-diagnostics');
    if (!content) return;

    const ok = await JanSetuUI.copyToClipboard(content.textContent);
    if (btn) {
      if (ok) {
        btn.innerHTML = '<span>✅</span> Copied!';
        setTimeout(() => {
          btn.innerHTML = '<span>📋</span> Copy to Clipboard';
        }, 2000);
      } else {
        btn.innerHTML = '<span>❌</span> Copy failed';
      }
    }
  }

  /**
   * 8. Probe Result Modals
   */
  function openProbeModal(probeResult) {
    const modal = document.getElementById('probe-modal');
    const title = document.getElementById('probe-modal-title');
    const body = document.getElementById('probe-modal-body');
    if (!modal || !body) return;

    const isOnline = probeResult.isOnline;
    if (title) {
      title.textContent = `Diagnostic Probe: ${(probeResult.department || '').toUpperCase()} Adapter`;
    }

    body.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <div class="flex-between" style="margin-bottom: 0.5rem;">
          <span style="font-weight: 600;">Adapter Status:</span>
          ${isOnline ? '<span class="badge badge-online">200 OK (ONLINE)</span>' : '<span class="badge badge-offline">503 UNAVAILABLE (OFFLINE)</span>'}
        </div>
        <div class="flex-between" style="margin-bottom: 0.5rem;">
          <span style="font-weight: 600;">Response Latency:</span>
          <span style="font-family: monospace; color: var(--color-teal); font-weight: 700;">${probeResult.latencyMs || 0} ms</span>
        </div>
        <div class="flex-between" style="margin-bottom: 0.5rem;">
          <span style="font-weight: 600;">Timestamp:</span>
          <span style="font-size: 0.8rem; color: var(--color-text-light);">${probeResult.timestamp}</span>
        </div>
      </div>
      <div style="margin-top: 1rem;">
        <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-light); margin-bottom: 0.35rem;">
          Simulated Payload Response:
        </div>
        <pre class="json-code-block" style="max-height: 180px;">${JSON.stringify(probeResult.sampleResponse || {}, null, 2)}</pre>
      </div>
    `;

    modal.style.display = 'flex';
  }

  function openMultiProbeModal(results) {
    const modal = document.getElementById('probe-modal');
    const title = document.getElementById('probe-modal-title');
    const body = document.getElementById('probe-modal-body');
    if (!modal || !body) return;

    if (title) title.textContent = 'All Department Adapters Diagnostic Probe';

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1rem;">
        ${results.map(r => `
          <div class="flex-between" style="padding: 0.5rem 0.75rem; background: var(--color-surface-alt); border-radius: var(--radius-sm); border: 1px solid var(--color-border-light);">
            <span style="font-weight: 700; text-transform: capitalize;">${r.department} Service</span>
            <div class="flex gap-05 align-center">
              <span style="font-family: monospace; font-size: 0.78rem; color: var(--color-teal);">${r.isOnline ? `${r.latencyMs}ms` : '0ms'}</span>
              ${r.isOnline ? '<span class="badge badge-online">HEALTHY</span>' : '<span class="badge badge-offline">OFFLINE</span>'}
            </div>
          </div>
        `).join('')}
      </div>
      <p style="font-size: 0.8rem; color: var(--color-text-light); margin: 0;">
        All adapter diagnostics logged to immutable audit trail.
      </p>
    `;

    modal.style.display = 'flex';
  }

  function closeProbeModal() {
    const modal = document.getElementById('probe-modal');
    if (modal) modal.style.display = 'none';
  }

  /**
   * Utilities
   */
  function formatUptime(seconds) {
    if (!seconds && seconds !== 0) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }

  function showErrorBanner(msg) {
    const el = document.getElementById('monitoring-error-banner');
    const msgEl = document.getElementById('monitoring-error-message');
    if (el) {
      if (msgEl) msgEl.textContent = msg;
      el.style.display = 'block';
    }
  }

  function hideErrorBanner() {
    const el = document.getElementById('monitoring-error-banner');
    if (el) el.style.display = 'none';
  }

  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    init();
  });

  // Public Interface
  return {
    init,
    refreshData,
    handleAutoRefreshChange,
    toggleAdapterStatus,
    probeDepartment,
    probeAllAdapters,
    simulateTaxOutage,
    restoreAllServices,
    triggerReorchestration,
    setPipelineFilter,
    handleEventFilterChange,
    openDiagnosticsModal,
    closeDiagnosticsModal,
    copyDiagnosticsJSON,
    closeProbeModal
  };
})();

// Export to window
window.MonitoringApp = MonitoringApp;
