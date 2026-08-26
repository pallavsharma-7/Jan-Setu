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

// 5. GET /api/applications/:id - Fetch application details by ID
router.get('/applications/:id', (req, res) => {
  const appId = req.params.id;
  const app = data.applications[appId];
  if (!app) {
    return res.status(404).json({ error: "Application not found", id: appId });
  }
  res.json(app);
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

// 10. GET /api/audit - Retrieve access audit log
router.get('/audit', (req, res) => {
  res.json(data.auditLogs);
});

module.exports = router;
