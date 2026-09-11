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
   * 10. Get Audit Log (with optional filters: { applicationId, department, result, search })
   */
  async getAudit(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.applicationId) query.set('applicationId', params.applicationId);
      if (params.department && params.department !== 'all') query.set('department', params.department);
      if (params.result && params.result !== 'all') query.set('result', params.result);
      if (params.search) query.set('search', params.search);

      const qs = query.toString();
      const url = qs ? `${API_BASE_URL}/audit?${qs}` : `${API_BASE_URL}/audit`;
      const response = await fetch(url);
      return await response.json();
    } catch (err) {
      console.error('API Error (getAudit):', err);
      return [];
    }
  },

  /**
   * 11. Add/Attach Prototype Document to an Application
   */
  async addDocument(applicationId, documentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentData)
      });
      return await response.json();
    } catch (err) {
      console.error('API Error (addDocument):', err);
      return { error: err.message };
    }
  },

  /**
   * 12. Get All Applications (with optional filters: { status, serviceId, search })
   */
  async getApplications(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.status && params.status !== 'all') query.set('status', params.status);
      if (params.serviceId && params.serviceId !== 'all') query.set('serviceId', params.serviceId);
      if (params.search) query.set('search', params.search);

      const qs = query.toString();
      const url = qs ? `${API_BASE_URL}/applications?${qs}` : `${API_BASE_URL}/applications`;
      const response = await fetch(url);
      return await response.json();
    } catch (err) {
      console.error('API Error (getApplications):', err);
      return [];
    }
  },

  /**
   * 13. Get Aggregated Dashboard Statistics
   */
  async getDashboardStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
      return await response.json();
    } catch (err) {
      console.error('API Error (getDashboardStats):', err);
      return {
        totalApplications: 0,
        byStatus: { completed: 0, processing: 0, queued: 0, rejected: 0 },
        byService: [],
        verifications: {
          identity: { verified: 0, queued: 0, pending: 0 },
          address: { verified: 0, queued: 0, pending: 0 },
          tax: { verified: 0, queued: 0, pending: 0 },
          municipal: { verified: 0, queued: 0, pending: 0 }
        },
        serviceStatuses: {},
        totalAuditLogs: 0,
        recentApplications: [],
        recentAuditLogs: []
      };
    }
  },

  /**
   * 14. Retrieve System Telemetry & Interoperability Monitoring Metrics
   */
  async getMonitoringData() {
    try {
      const response = await fetch(`${API_BASE_URL}/monitoring`);
      return await response.json();
    } catch (err) {
      console.error('API Error (getMonitoringData):', err);
      return {
        overallHealth: 'critical',
        healthLabel: 'Failed to communicate with Monitoring Service',
        onlineAdaptersCount: 0,
        totalAdaptersCount: 4,
        adapters: [],
        pipeline: {
          totalApplications: 0,
          completedCount: 0,
          processingCount: 0,
          queuedCount: 0,
          rejectedCount: 0,
          completionRate: 0,
          bottleneckCounts: { identity: 0, revenue: 0, tax: 0, municipal: 0 },
          queuedApplications: [],
          processingApplications: []
        },
        documents: {
          totalDocuments: 0,
          verifiedDocuments: 0,
          pendingDocuments: 0,
          uploadedDocuments: 0
        },
        apiEndpoints: [],
        runtime: {
          nodeVersion: 'N/A',
          uptimeSeconds: 0,
          heapUsedMB: 0,
          heapTotalMB: 0,
          platform: 'N/A',
          serverTimestamp: new Date().toISOString()
        },
        recentEvents: []
      };
    }
  },

  /**
   * 15. Trigger Pipeline Re-sync across Queued Requests
   */
  async reorchestrateQueued() {
    try {
      const response = await fetch(`${API_BASE_URL}/monitoring/reorchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (err) {
      console.error('API Error (reorchestrateQueued):', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * 16. Trigger Live Diagnostic Health Probe on Department Adapter
   */
  async probeDepartment(department) {
    try {
      const response = await fetch(`${API_BASE_URL}/monitoring/probe/${department}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (err) {
      console.error('API Error (probeDepartment):', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * 17. Send Message to Citizen AI Assistant
   */
  async sendChatMessage(message, history = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history })
      });
      return await response.json();
    } catch (err) {
      console.error('API Error (sendChatMessage):', err);
      return {
        success: false,
        error: err.message,
        reply: 'Unable to connect to Jan-Setu AI Service. Please try again or check the Services catalog directly.'
      };
    }
  },

  /**
   * 18. Retrieve Demo Wallet summary & balance
   */
  async getWallet() {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet`);
      return await response.json();
    } catch (err) {
      console.error('API Error (getWallet):', err);
      return { success: false, error: err.message, wallet: { balance: 0, currency: 'INR' } };
    }
  },

  /**
   * 19. Simulated Wallet Top-Up
   */
  async topupWallet(topupData) {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topupData)
      });
      return await response.json();
    } catch (err) {
      console.error('API Error (topupWallet):', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * 20. Settle Simulated Application Fee
   */
  async payWallet(paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      return await response.json();
    } catch (err) {
      console.error('API Error (payWallet):', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * 21. Get Wallet Transactions
   */
  async getWalletTransactions(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.type && params.type !== 'all') query.set('type', params.type);
      if (params.search) query.set('search', params.search);

      const qs = query.toString();
      const url = qs ? `${API_BASE_URL}/wallet/transactions?${qs}` : `${API_BASE_URL}/wallet/transactions`;
      const response = await fetch(url);
      return await response.json();
    } catch (err) {
      console.error('API Error (getWalletTransactions):', err);
      return [];
    }
  },

  /**
   * 22. Reset Demo Wallet
   */
  async resetWallet() {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (err) {
      console.error('API Error (resetWallet):', err);
      return { success: false, error: err.message };
    }
  }
};

// Export to window for global browser scope access
window.JanSetuAPI = JanSetuAPI;

