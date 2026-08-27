/**
 * Jan-Setu Core API Routes
 * Implements standard REST endpoints for interoperability & service orchestration.
 */

const express = require('express');
const router = express.Router();
const data = require('./data');

// 1. GET /api/health - Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: "ok",
    service: "Jan-Setu",
    timestamp: new Date().toISOString(),
    version: "1.0.0-prototype"
  });
});

// 2. GET /api/services - Retrieve catalog of departmental services
router.get('/services', (req, res) => {
  res.json(data.availableServices);
});

// 3. GET /api/services/status - Retrieve health status of department mock services
router.get('/services/status', (req, res) => {
  res.json(data.serviceStatuses);
});

// 3b. POST /api/services/status - Update health status of a department service
router.post('/services/status', (req, res) => {
  const { service, status } = req.body;
  if (!service || !status) {
    return res.status(400).json({ error: "Missing service or status field" });
  }
  const result = data.updateServiceStatus(service, status);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// 4. POST /api/applications - Create a new unified application
router.post('/applications', (req, res) => {
  try {
    const appData = req.body || {};
    const newApp = data.createNewApplication(appData);
    res.status(201).json(newApp);
  } catch (err) {
    res.status(500).json({ error: "Failed to create application", message: err.message });
  }
});

// 4b. GET /api/applications - Retrieve list of all applications
router.get('/applications', (req, res) => {
  try {
    const { status, serviceId, search } = req.query;
    let list = Object.values(data.applications);

    if (status && status !== 'all') {
      list = list.filter(app => (app.status || '').toLowerCase() === status.toLowerCase());
    }

    if (serviceId && serviceId !== 'all') {
      list = list.filter(app => app.serviceId === serviceId || app.service === serviceId);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(app => 
        (app.id && app.id.toLowerCase().includes(q)) ||
        (app.applicant && app.applicant.name && app.applicant.name.toLowerCase().includes(q)) ||
        (app.applicant && app.applicant.email && app.applicant.email.toLowerCase().includes(q)) ||
        (app.applicant && app.applicant.phone && app.applicant.phone.toLowerCase().includes(q)) ||
        (app.service && app.service.toLowerCase().includes(q))
      );
    }

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications", message: err.message });
  }
});

// 4c. GET /api/dashboard/stats - Retrieve aggregated operational statistics
router.get('/dashboard/stats', (req, res) => {
  try {
    const stats = data.getDashboardStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to compute dashboard stats", message: err.message });
  }
});

// 5. GET /api/applications/:id - Fetch application details by ID
router.get('/applications/:id', (req, res) => {
  const appId = req.params.id;
  const app = data.applications[appId];
  if (!app) {
    return res.status(404).json({ error: "Application not found", id: appId });
  }
  res.json(app);
});

// 5b. POST /api/applications/:id/documents - Attach prototype document to application
router.post('/applications/:id/documents', (req, res) => {
  const appId = req.params.id;
  const docData = req.body || {};
  const result = data.addDocumentToApplication(appId, docData);
  if (!result.success) {
    return res.status(result.status || 400).json(result);
  }
  res.status(201).json(result);
});

// 6. POST /api/verify/identity - Invoke Identity Service verification
router.post('/verify/identity', (req, res) => {
  const { applicationId } = req.body;
  if (!applicationId) return res.status(400).json({ error: "applicationId is required" });
  const result = data.mockVerifyIdentity(applicationId);
  res.json(result);
});

// 7. POST /api/verify/address - Invoke Revenue/Address Service verification
router.post('/verify/address', (req, res) => {
  const { applicationId } = req.body;
  if (!applicationId) return res.status(400).json({ error: "applicationId is required" });
  const result = data.mockVerifyAddress(applicationId);
  res.json(result);
});

// 8. POST /api/verify/tax - Invoke Tax Service verification
router.post('/verify/tax', (req, res) => {
  const { applicationId } = req.body;
  if (!applicationId) return res.status(400).json({ error: "applicationId is required" });
  const result = data.mockVerifyTax(applicationId);
  res.json(result);
});

// 9. POST /api/verify/municipal - Invoke Municipal Service verification
router.post('/verify/municipal', (req, res) => {
  const { applicationId } = req.body;
  if (!applicationId) return res.status(400).json({ error: "applicationId is required" });
  const result = data.mockVerifyMunicipal(applicationId);
  res.json(result);
});

// 10. GET /api/audit - Retrieve access audit log with optional search/filtering
router.get('/audit', (req, res) => {
  const { applicationId, department, result, search } = req.query;
  let logs = data.auditLogs;

  if (applicationId) {
    const aid = applicationId.toLowerCase();
    logs = logs.filter(log => log.applicationId && log.applicationId.toLowerCase().includes(aid));
  }

  if (department && department !== 'all') {
    const dept = department.toLowerCase();
    logs = logs.filter(log => log.department && log.department.toLowerCase().includes(dept));
  }

  if (result && result !== 'all') {
    const resQ = result.toLowerCase();
    logs = logs.filter(log => log.result && log.result.toLowerCase().includes(resQ));
  }

  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(log =>
      (log.id && log.id.toLowerCase().includes(q)) ||
      (log.applicationId && log.applicationId.toLowerCase().includes(q)) ||
      (log.department && log.department.toLowerCase().includes(q)) ||
      (log.request && log.request.toLowerCase().includes(q)) ||
      (log.purpose && log.purpose.toLowerCase().includes(q)) ||
      (log.result && log.result.toLowerCase().includes(q))
    );
  }

  res.json(logs);
});

module.exports = router;
