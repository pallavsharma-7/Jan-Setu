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

// 11. GET /api/monitoring - Retrieve real-time system monitoring & adapter telemetry
router.get('/monitoring', (req, res) => {
  try {
    const monitoringData = data.getMonitoringData();
    res.json(monitoringData);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch monitoring metrics", message: err.message });
  }
});

// 12. POST /api/monitoring/reorchestrate - Trigger pipeline re-sync across queued requests
router.post('/monitoring/reorchestrate', (req, res) => {
  try {
    const result = data.reorchestrateAllQueued();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to re-orchestrate queued requests", message: err.message });
  }
});

// 13. POST /api/monitoring/probe/:department - Trigger live diagnostic health probe
router.post('/monitoring/probe/:department', (req, res) => {
  try {
    const { department } = req.params;
    const probeResult = data.probeDepartmentService(department);
    if (!probeResult.success) {
      return res.status(400).json(probeResult);
    }
    res.json(probeResult);
  } catch (err) {
    res.status(500).json({ error: "Diagnostic probe failed", message: err.message });
  }
});

// -------------------------------------------------------------
// AI CITIZEN ASSISTANT ROUTE (POST /api/chat)
// -------------------------------------------------------------

async function callAIProvider(userMessage, conversationHistory = []) {
  const apiKey = (process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return {
      success: true,
      reply: data.getDeterministicKnowledgeReply(userMessage),
      source: "knowledge-base"
    };
  }

  const systemContext = data.getJanSetuSystemContext();

  // Sanitize and structure conversation history strictly alternating user/model
  const contents = [];
  if (Array.isArray(conversationHistory)) {
    const rawHistory = conversationHistory.slice(-10);
    for (const item of rawHistory) {
      if (!item || !item.content) continue;
      const role = (item.role === 'assistant' || item.role === 'model') ? 'model' : 'user';
      const text = String(item.content).trim();
      if (!text) continue;

      // Avoid consecutive turns with identical roles
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += `\n${text}`;
      } else {
        contents.push({
          role: role,
          parts: [{ text }]
        });
      }
    }
  }

  // Ensure current user message is appended cleanly without duplicate user turn
  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    // If the last history turn is already the exact userMessage, we don't append duplicate
    if (contents[contents.length - 1].parts[0].text !== userMessage) {
      contents.push({
        role: 'model',
        parts: [{ text: "Understood. How can I assist you further?" }]
      });
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });
    }
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });
  }

  const payload = {
    system_instruction: {
      parts: [{ text: systemContext }]
    },
    contents: contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1000
    }
  };

  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-flash'
  ];

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const resJson = await response.json();
        const replyText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText && replyText.trim()) {
          return {
            success: true,
            reply: replyText.trim(),
            source: "ai"
          };
        }
      } else {
        console.warn(`[AI Service] Model ${model} returned HTTP ${response.status}.`);
      }
    } catch (err) {
      console.warn(`[AI Service] Model ${model} request failed (${err.message}).`);
    }
  }

  // Safe fallback to internal knowledge base if API or models fail
  console.info('[AI Service] Provider unavailable or request failed. Engaging deterministic knowledge engine.');
  return {
    success: true,
    reply: data.getDeterministicKnowledgeReply(userMessage),
    source: "knowledge-base"
  };
}

// 14. POST /api/chat - Citizen AI Assistance endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: "Message is required and cannot be empty." });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: "Message is too long. Maximum allowed length is 2000 characters." });
    }

    const result = await callAIProvider(message.trim(), history);
    data.addAuditRecord(
      "Citizen AI Assistant",
      "Citizen Inbound Query",
      "Service Guidance & Platform FAQ",
      `Resolved (${result.source})`,
      "CHAT-QUERY"
    );

    res.json({
      success: true,
      reply: result.reply,
      source: result.source,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Chat endpoint error:", err);
    res.status(500).json({
      error: "Failed to process chat query",
      reply: "I am temporarily experiencing technical difficulties. Please explore our Services catalog or Application Tracker directly."
    });
  }
});

// -------------------------------------------------------------
// PALAK - SIMULATED DIGITAL WALLET / PAYMENT ROUTES
// -------------------------------------------------------------

// 15. GET /api/wallet - Retrieve Demo Digital Wallet state & summary
router.get('/wallet', (req, res) => {
  try {
    const wallet = data.getWalletData();
    res.json({ success: true, wallet });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch wallet data", message: err.message });
  }
});

// 16. POST /api/wallet/topup - Simulated Wallet Top-Up
router.post('/wallet/topup', (req, res) => {
  try {
    const { amount, method, remarks } = req.body || {};
    const result = data.topupWallet({ amount, method, remarks });
    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to top up wallet", message: err.message });
  }
});

// 17. POST /api/wallet/pay - Simulated Service Fee Payment
router.post('/wallet/pay', (req, res) => {
  try {
    const { applicationId, serviceId, amount, purpose } = req.body || {};
    const result = data.payWithWallet({ applicationId, serviceId, amount, purpose });
    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to process simulated payment", message: err.message });
  }
});

// 18. GET /api/wallet/transactions - List Wallet Transactions
router.get('/wallet/transactions', (req, res) => {
  try {
    const transactions = data.getWalletTransactions(req.query);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions", message: err.message });
  }
});

// 19. POST /api/wallet/reset - Reset Demo Wallet state for testing
router.post('/wallet/reset', (req, res) => {
  try {
    const result = data.resetWallet();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to reset wallet", message: err.message });
  }
});

module.exports = router;

