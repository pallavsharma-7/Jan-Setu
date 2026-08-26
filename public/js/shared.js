/**
 * Jan-Setu Shared UI Helpers
 * Common navigation state, status badges, alert utilities, and widget components.
 */

document.addEventListener('DOMContentLoaded', () => {
  JanSetuUI.initNavigation();
  JanSetuUI.initStatusWidget();
});

const JanSetuUI = {
  /**
   * Automatically highlights active page in top navigation bar based on current URL path
   */
  initNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.gov-nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (currentPath === href || (href !== '/' && currentPath.startsWith(href)))) {
        link.classList.add('active');
      }
    });
  },

  /**
   * Returns a standard HTML badge string for given status
   */
  getStatusBadgeHTML(status) {
    if (!status) return `<span class="badge badge-pending">PENDING</span>`;
    const s = String(status).toLowerCase();
    
    if (s === 'online' || s === 'verified' || s === 'completed' || s === 'clear' || s === 'success') {
      return `<span class="badge badge-online"><span class="status-indicator online"></span>${s.toUpperCase()}</span>`;
    } else if (s === 'offline' || s === 'rejected' || s === 'danger' || s === 'error') {
      return `<span class="badge badge-offline"><span class="status-indicator offline"></span>${s.toUpperCase()}</span>`;
    } else if (s === 'queued' || s === 'warning') {
      return `<span class="badge badge-queued"><span class="status-indicator queued"></span>${s.toUpperCase()}</span>`;
    } else {
      return `<span class="badge badge-pending">${s.toUpperCase()}</span>`;
    }
  },

  /**
   * Render alert box HTML string
   */
  getAlertHTML(type, title, message) {
    return `
      <div class="alert alert-${type}">
        ${title ? `<strong>${title}</strong> ` : ''}${message}
      </div>
    `;
  },

  /**
   * Quick status widget updates (if container exists on page)
   */
  async initStatusWidget() {
    const widgetEl = document.getElementById('dept-status-widget');
    if (!widgetEl) return;

    try {
      const statusData = await JanSetuAPI.getServiceStatus();
      widgetEl.innerHTML = Object.entries(statusData).map(([dept, status]) => `
        <div class="flex-between" style="padding: 0.4rem 0; border-bottom: 1px dashed var(--color-border-light);">
          <span style="font-weight: 500; font-size: 0.85rem; text-transform: capitalize;">${dept} Service</span>
          ${this.getStatusBadgeHTML(status)}
        </div>
      `).join('');
    } catch (e) {
      console.warn('Status widget error:', e);
    }
  },

  /**
   * Helper to format ISO timestamp cleanly
   */
  formatDate(isoString) {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (e) {
      return isoString;
    }
  }
};

window.JanSetuUI = JanSetuUI;
