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
    
    if (s === 'online' || s === 'verified' || s === 'completed' || s === 'clear' || s === 'success' || s === 'uploaded') {
      return `<span class="badge badge-online"><span class="status-indicator online"></span>${s.toUpperCase()}</span>`;
    } else if (s === 'offline' || s === 'rejected' || s === 'danger' || s === 'error') {
      return `<span class="badge badge-offline"><span class="status-indicator offline"></span>${s.toUpperCase()}</span>`;
    } else if (s === 'queued' || s === 'warning') {
      return `<span class="badge badge-queued"><span class="status-indicator queued"></span>${s.toUpperCase()}</span>`;
    } else if (s === 'processing' || s === 'in_progress') {
      return `<span class="badge badge-processing"><span class="status-indicator" style="background-color: var(--color-info);"></span>${s.toUpperCase()}</span>`;
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
   * Safe HTML escaping utility for citizen/API data rendering
   */
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Copy text to clipboard with modern navigator API and textarea fallback
   */
  async copyToClipboard(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.warn('Clipboard API failed, using fallback:', err);
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('Fallback clipboard copy failed:', err);
      return false;
    }
  },

  /**
   * Format bytes or file size cleanly
   */
  formatFileSize(bytes) {
    if (!bytes && bytes !== 0) return 'Unknown size';
    if (typeof bytes === 'string' && (bytes.includes('KB') || bytes.includes('MB') || bytes.includes('B'))) {
      return bytes;
    }
    const num = Number(bytes);
    if (isNaN(num)) return String(bytes);
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(2)} MB`;
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
