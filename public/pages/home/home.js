/**
 * Jan-Setu Home Page Scripts
 * Module: Home (Pathika)
 * Coordinates dynamic service highlights, live department status, and workflow interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  initHomeServiceHighlights();
  initWorkflowStatus();
});

/**
 * Load and display highlighted services from JanSetuAPI.getServices()
 */
async function initHomeServiceHighlights() {
  const container = document.getElementById('home-service-highlights');
  if (!container) return;

  try {
    const services = await JanSetuAPI.getServices();
    if (!services || services.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--color-text-muted); padding: 2rem;">
          No active services available in the catalog currently.
        </div>
      `;
      return;
    }

    // Map department-specific verification summaries
    const metaMap = {
      'business-reg': {
        icon: '🏢',
        scope: 'Identity, Revenue (Address), Tax, Municipal',
        docs: 'Address Proof (.docx/.pdf), Business Name, Identity ID',
        badge: 'Unified 4-Dept Clearance'
      },
      'income-cert': {
        icon: '📄',
        scope: 'Revenue Service & Identity',
        docs: 'Salary / Income Declaration, Residence Proof',
        badge: 'Revenue Verified'
      },
      'trade-license': {
        icon: '🏬',
        scope: 'Municipal Corporation & Zoning',
        docs: 'Establishment Lease, Safety Declaration',
        badge: 'Municipal Clearance'
      },
      'property-tax-clearance': {
        icon: '🏛️',
        scope: 'Tax Assessment & Revenue records',
        docs: 'Property ID, Assessment Receipt',
        badge: 'Tax Clearance'
      }
    };

    container.innerHTML = services.map(srv => {
      const meta = metaMap[srv.id] || {
        icon: '📋',
        scope: srv.department || 'Department Service',
        docs: 'Standard Application Details',
        badge: 'Simulated Service'
      };

      return `
        <div class="highlight-card">
          <div>
            <div class="highlight-header">
              <span class="badge badge-online">${meta.badge}</span>
              <span style="font-size: 0.75rem; color: var(--color-teal); font-weight: 600;">#${srv.id}</span>
            </div>
            <div class="highlight-dept">${srv.department}</div>
            <h3 class="highlight-title">${srv.name}</h3>
            <p class="highlight-desc">${srv.description}</p>
            
            <div class="highlight-meta">
              <div><strong>Coordination:</strong> ${meta.scope}</div>
              <div><strong>Required Proof:</strong> ${meta.docs}</div>
            </div>
          </div>

          <div class="flex-between" style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--color-border-light);">
            <a href="/pages/services/#service-${srv.id}" class="btn btn-outline btn-sm">Learn Details</a>
            <a href="/pages/application/?serviceId=${srv.id}" class="btn btn-primary btn-sm">Apply Now &rarr;</a>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to load highlighted services:', err);
    container.innerHTML = `
      <div style="grid-column: 1 / -1;" class="alert alert-warning">
        Unable to load service highlights from the backend API. Please ensure the Jan-Setu server is running.
      </div>
    `;
  }
}

/**
 * Update the workflow diagram with real-time department health indicators
 */
async function initWorkflowStatus() {
  try {
    const statuses = await JanSetuAPI.getServiceStatus();
    if (!statuses) return;

    ['identity', 'revenue', 'tax', 'municipal'].forEach(dept => {
      const el = document.getElementById(`wf-status-${dept}`);
      if (el && statuses[dept]) {
        const isOnline = statuses[dept] === 'online';
        el.className = `status-indicator ${isOnline ? 'online' : 'offline'}`;
        el.title = `${dept} is currently ${statuses[dept]}`;
      }
    });
  } catch (e) {
    console.warn('Workflow status update error:', e);
  }
}

/**
 * Handle quick tracking lookup from home page
 */
function handleHomeTracking(event) {
  event.preventDefault();
  const input = document.getElementById('home-tracking-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) {
    alert('Please enter a valid Application ID (e.g. JS-2026-001)');
    return;
  }
  // Navigate to Palak's tracking module with application query param
  window.location.href = `/pages/tracking/?id=${encodeURIComponent(val)}`;
}
