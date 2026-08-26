/**
 * Jan-Setu Core API Helper Library
 * Clean JavaScript wrapper for local Express REST backend endpoints.
 * Shared across all developer pages (Home, Services, Application, Tracking, Audit, Monitoring).
 */

const API_BASE_URL = '/api';

const JanSetuAPI = {
  /**
   * 1. Check system health
   */
  async getHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (err) {
      console.error('API Error (getHealth):', err);
      return { status: 'error', message: err.message };
    }
  },

  /**
   * 2. Retrieve service catalog
   */
  async getServices() {
    try {
      const response = await fetch(`${API_BASE_URL}/services`);
      return await response.json();
    } catch (err) {
      console.error('API Error (getServices):', err);
      return [];
    }
  },

  /**
   * 3. Retrieve department mock service health statuses
   */
  async getServiceStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/services/status`);
      return await response.json();
    } catch (err) {
      console.error('API Error (getServiceStatus):', err);
      return { identity: 'offline', revenue: 'offline', tax: 'offline', municipal: 'offline' };
    }
  },

  /**
   * 3b. Update department service status (Toggle Online / Offline)
   */
  async updateServiceStatus(service, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/services/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, status })
      });
      return await response.json();
    } catch (err) {
      console.error('API Error (updateServiceStatus):', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * 4. Create new application
   */
  async createApplication(applicationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      });
      return await response.json();
    } catch (err) {
      console.error('API Error (createApplication):', err);
      return { error: err.message };
    }
  },

  /**
   * 5. Get application details by ID
   */
  async getApplication(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${id}`);
      return await response.json();
    } catch (err) {
      console.error('API Error (getApplication):', err);
      return { error: err.message };
    }
  },

  /**
   * 6. Verify Identity
   */
  async verifyIdentity(applicationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/verify/identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId })
      });
      return await response.json();
    } catch (err) {
      console.error('API Error (verifyIdentity):', err);
      return { error: err.message };
    }
  },

  /**
   * 7. Verify Address (Revenue)
   */
  async verifyAddress(applicationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/verify/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId })
      });
      return await response.json();
    } catch (err) {
      console.error('API Error (verifyAddress):', err);
      return { error: err.message };
    }
  },

  /**
   * 8. Verify Tax
   */
  async verifyTax(applicationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/verify/tax`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId })
      });
      return await response.json();
    } catch (err) {
      console.error('API Error (verifyTax):', err);
      return { error: err.message };
    }
  },

  /**
   * 9. Verify Municipal
   */
  async verifyMunicipal(applicationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/verify/municipal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId })
      });
      return await response.json();
    } catch (err) {
      console.error('API Error (verifyMunicipal):', err);
      return { error: err.message };
    }
  },

  /**
   * 10. Get Audit Log
   */
  async getAudit() {
    try {
      const response = await fetch(`${API_BASE_URL}/audit`);
      return await response.json();
    } catch (err) {
      console.error('API Error (getAudit):', err);
      return [];
    }
  }
};

// Export to window for global browser scope access
window.JanSetuAPI = JanSetuAPI;
