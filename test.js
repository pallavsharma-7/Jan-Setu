/**
 * Jan-Setu Automated Test & Verification Suite
 * Tests Core Architecture, Department Adapters, Application Orchestration,
 * Resilient Queueing, Audit Trails, and Parth's Monitoring Module.
 */

const http = require('http');
const express = require('express');
const path = require('path');
const cors = require('cors');
const apiRoutes = require('./routes');
const data = require('./data');

// Setup test app on an ephemeral port
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRoutes);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let server;
let port;

function request(method, pathUrl, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: port,
      path: pathUrl,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('  JAN-SETU AUTOMATED INTEGRATION & MONITORING TESTS  ');
  console.log('====================================================\n');

  // Start test server
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      port = server.address().port;
      console.log(`Test server running on port ${port}\n`);
      resolve();
    });
  });

  try {
    // 1. GET /api/health
    console.log('[1/12] Testing Core API Health...');
    const healthRes = await request('GET', '/api/health');
    assert(healthRes.status === 200, 'GET /api/health returns 200');
    assert(healthRes.body.status === 'ok', 'Health status is "ok"');
    assert(healthRes.body.service === 'Jan-Setu', 'Service is "Jan-Setu"');

    // 2. GET /api/services
    console.log('\n[2/12] Testing Service Catalog...');
    const srvRes = await request('GET', '/api/services');
    assert(srvRes.status === 200, 'GET /api/services returns 200');
    assert(Array.isArray(srvRes.body) && srvRes.body.length >= 4, 'Catalog contains >= 4 services');

    // 3. GET /api/services/status
    console.log('\n[3/12] Testing Department Service Statuses...');
    const statusRes = await request('GET', '/api/services/status');
    assert(statusRes.status === 200, 'GET /api/services/status returns 200');
    assert(statusRes.body.identity !== undefined, 'Identity status exists');
    assert(statusRes.body.tax !== undefined, 'Tax status exists');

    // 4. GET /api/monitoring
    console.log('\n[4/12] Testing Monitoring Telemetry (Parth)...');
    const monRes = await request('GET', '/api/monitoring');
    assert(monRes.status === 200, 'GET /api/monitoring returns 200');
    assert(monRes.body.overallHealth !== undefined, 'Overall health field present');
    assert(Array.isArray(monRes.body.adapters) && monRes.body.adapters.length === 4, '4 department adapters monitored');
    assert(monRes.body.pipeline !== undefined, 'Pipeline throughput metrics present');
    assert(monRes.body.runtime !== undefined, 'Runtime telemetry present');
    assert(Array.isArray(monRes.body.apiEndpoints), 'API endpoints matrix present');
    assert(Array.isArray(monRes.body.recentEvents), 'Recent telemetry event stream present');

    // 5. POST /api/monitoring/probe/:department
    console.log('\n[5/12] Testing Diagnostic Health Probes...');
    const probeRes = await request('POST', '/api/monitoring/probe/identity');
    assert(probeRes.status === 200, 'Probe Identity returns 200');
    assert(probeRes.body.success === true, 'Probe success is true');
    assert(probeRes.body.department === 'identity', 'Probe department matches');
    assert(probeRes.body.latencyMs > 0, 'Probe measures latency');

    // Invalid probe
    const badProbeRes = await request('POST', '/api/monitoring/probe/invalid-dept');
    assert(badProbeRes.status === 400, 'Invalid probe department returns 400');

    // 6. Resilient Outage & Queue Simulation
    console.log('\n[6/12] Testing Fault-Tolerance & Resilient Queueing...');
    // Take Tax service offline
    const toggleOffline = await request('POST', '/api/services/status', { service: 'tax', status: 'offline' });
    assert(toggleOffline.status === 200, 'Toggled Tax service offline');
    assert(toggleOffline.body.serviceStatuses.tax === 'offline', 'Tax is confirmed offline');

    // Check monitoring state after outage
    const monDegraded = await request('GET', '/api/monitoring');
    assert(monDegraded.body.overallHealth === 'degraded', 'Overall health changed to "degraded"');
    assert(monDegraded.body.onlineAdaptersCount === 3, 'Online adapters count is 3/4');

    // Submit an application requiring Tax clearance
    const newAppRes = await request('POST', '/api/applications', {
      service: 'Business Registration (Unified)',
      serviceId: 'business-reg',
      applicantName: 'Test Citizen',
      applicantEmail: 'test@example.com',
      applicantPhone: '+91 99999 88888',
      consent: true
    });
    assert(newAppRes.status === 201, 'Application created successfully during outage');
    assert(newAppRes.body.status === 'queued', 'Application safely held in "queued" status');
    assert(newAppRes.body.verifications.tax === 'queued', 'Tax verification marked as queued');
    assert(newAppRes.body.verifications.identity === 'verified', 'Identity verification succeeded in parallel');
    const queuedAppId = newAppRes.body.id;

    // Check monitoring queue metrics
    const monQueued = await request('GET', '/api/monitoring');
    assert(monQueued.body.pipeline.queuedCount >= 1, 'Queue depth reflects queued application');
    assert(monQueued.body.pipeline.bottleneckCounts.tax >= 1, 'Bottleneck correctly identified as Tax');

    // 7. Auto-Recovery & Queue Drain
    console.log('\n[7/12] Testing Auto-Recovery & Queue Drain...');
    // Bring Tax service back online
    const toggleOnline = await request('POST', '/api/services/status', { service: 'tax', status: 'online' });
    assert(toggleOnline.status === 200, 'Toggled Tax service back online');

    // Verify application automatically recovered to completed
    const recoveredAppRes = await request('GET', `/api/applications/${queuedAppId}`);
    assert(recoveredAppRes.status === 200, 'Fetched recovered application');
    assert(recoveredAppRes.body.status === 'completed', 'Application auto-completed upon service restoration');
    assert(recoveredAppRes.body.verifications.tax === 'verified', 'Tax verification cleared');

    // 8. POST /api/monitoring/reorchestrate
    console.log('\n[8/12] Testing Pipeline Re-orchestration...');
    const reRes = await request('POST', '/api/monitoring/reorchestrate');
    assert(reRes.status === 200, 'POST /api/monitoring/reorchestrate returns 200');
    assert(reRes.body.success === true, 'Re-orchestration returned success');

    // 9. Document Upload & Tracking
    console.log('\n[9/12] Testing Document Attachment & Tracking...');
    const docRes = await request('POST', `/api/applications/${queuedAppId}/documents`, {
      name: 'TradeCertificate.pdf',
      type: 'pdf',
      size: '180 KB'
    });
    assert(docRes.status === 201, 'Document attached with 201');
    assert(docRes.body.document.name === 'TradeCertificate.pdf', 'Document attached correctly');

    // 10. GET /api/audit
    console.log('\n[10/12] Testing Immutable Audit Logs & Filtering...');
    const auditRes = await request('GET', '/api/audit');
    assert(auditRes.status === 200, 'GET /api/audit returns 200');
    assert(Array.isArray(auditRes.body) && auditRes.body.length > 0, 'Audit records exist');

    // Filter audit by search
    const filteredAudit = await request('GET', `/api/audit?applicationId=${encodeURIComponent(queuedAppId)}`);
    assert(filteredAudit.status === 200, 'Audit filtered query returns 200');
    assert(filteredAudit.body.every(log => log.applicationId === queuedAppId), 'Filtered audit logs match appId');

    // 11. GET /api/dashboard/stats
    console.log('\n[11/12] Testing Dashboard Aggregated KPIs...');
    const dashRes = await request('GET', '/api/dashboard/stats');
    assert(dashRes.status === 200, 'GET /api/dashboard/stats returns 200');
    assert(dashRes.body.totalApplications > 0, 'Total applications counted');
    assert(dashRes.body.byStatus !== undefined, 'Status breakdown present');

    // 12. Static Frontend Pages Verification
    console.log('\n[12/12] Testing Static Frontend Routes...');
    const homePage = await request('GET', '/');
    assert(homePage.status === 200, 'Home page (/) returns 200');

    const monPage = await request('GET', '/pages/monitoring/');
    assert(monPage.status === 200, 'Monitoring page (/pages/monitoring/) returns 200');

    const dashPage = await request('GET', '/pages/dashboard/');
    assert(dashPage.status === 200, 'Dashboard page (/pages/dashboard/) returns 200');

    const auditPage = await request('GET', '/pages/audit/');
    assert(auditPage.status === 200, 'Audit page (/pages/audit/) returns 200');

    const trackPage = await request('GET', '/pages/tracking/');
    assert(trackPage.status === 200, 'Tracking page (/pages/tracking/) returns 200');

    const appPage = await request('GET', '/pages/application/');
    assert(appPage.status === 200, 'Application page (/pages/application/) returns 200');

    const srvPage = await request('GET', '/pages/services/');
    assert(srvPage.status === 200, 'Services page (/pages/services/) returns 200');

    console.log('\n====================================================');
    console.log('  ALL 12 INTEGRATION & MONITORING TEST SUITES PASSED!  ');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ UNEXPECTED ERROR DURING TESTS:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();
