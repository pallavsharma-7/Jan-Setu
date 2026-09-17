/**
 * Jan-Setu Core Data Layer & Mock Departmental Services
 * In-memory state management, orchestration logic, and mock service responses.
 * 
 * DISCLAIMER: This is a local simulation prototype for hackathon demonstration.
 * No connection to real citizen records or production government infrastructure.
 */

// Initial Departmental Service Statuses
let serviceStatuses = {
  identity: "online",
  revenue: "online",
  tax: "online",
  municipal: "online"
};

// Available Departmental Services Catalog
const availableServices = [
  {
    id: "business-reg",
    name: "Business Registration (Unified)",
    department: "Municipal & Revenue",
    description: "Single-window clearance for commercial enterprise registration across departments.",
    fee: 150,
    feeDisplay: "₹150 (Simulated Demo)",
    requiredDocs: ["Address Proof (.docx/.pdf)", "Business Name", "Identity Verification"],
    estimatedTime: "Simulated Instant (Parallel Orchestration)",
    active: true
  },
  {
    id: "income-cert",
    name: "Income Certificate Issuance",
    department: "Revenue Service",
    description: "Revenue-verified annual income certificate generation.",
    fee: 50,
    feeDisplay: "₹50 (Simulated Demo)",
    requiredDocs: ["Income Declaration", "Residence Proof", "Citizen Identity"],
    estimatedTime: "Simulated Instant",
    active: true
  },
  {
    id: "trade-license",
    name: "Trade License Renewal",
    department: "Municipal Service",
    description: "Annual commercial clearance and operating permit renewal.",
    fee: 250,
    feeDisplay: "₹250 (Simulated Demo)",
    requiredDocs: ["Establishment Lease", "Safety Declaration", "Prior License Number"],
    estimatedTime: "Simulated Instant",
    active: true
  },
  {
    id: "property-tax-clearance",
    name: "Property Tax Clearance",
    department: "Tax Service",
    description: "Unified property tax assessment and clearance certificate.",
    fee: 100,
    feeDisplay: "₹100 (Simulated Demo)",
    requiredDocs: ["Property Assessment ID", "Last Assessment Receipt"],
    estimatedTime: "Simulated Instant",
    active: true
  }
];

// Audit Event Log Storage
let auditLogs = [
  {
    id: "AUD-1007",
    timestamp: "2026-08-26 14:15:15",
    department: "Tax Service",
    request: "Tax Compliance Check",
    purpose: "Commercial tax clearance for Trade License",
    result: "Queued (Pending Sync)",
    applicationId: "JS-2026-003"
  },
  {
    id: "AUD-1006",
    timestamp: "2026-08-26 14:15:04",
    department: "Identity Service",
    request: "Citizen Identity Verification",
    purpose: "Trade license renewal identity check",
    result: "Verified",
    applicationId: "JS-2026-003"
  },
  {
    id: "AUD-1005",
    timestamp: "2026-08-26 11:30:20",
    department: "Tax Service",
    request: "Tax Compliance Check",
    purpose: "Income verification against tax filings",
    result: "Verified (Clear)",
    applicationId: "JS-2026-002"
  },
  {
    id: "AUD-1004",
    timestamp: "2026-08-26 11:30:12",
    department: "Revenue Service",
    request: "Residence Status Verification",
    purpose: "Address validation for Income Certificate",
    result: "Verified",
    applicationId: "JS-2026-002"
  },
  {
    id: "AUD-1003",
    timestamp: "2026-08-26 11:30:05",
    department: "Identity Service",
    request: "Citizen Identity Verification",
    purpose: "Income certificate issuance validation",
    result: "Verified",
    applicationId: "JS-2026-002"
  },
  {
    id: "AUD-1002",
    timestamp: "2026-08-26 10:00:15",
    department: "Revenue Service",
    request: "Residence Status Verification",
    purpose: "Address validation for Business Registration",
    result: "Verified",
    applicationId: "JS-2026-001"
  },
  {
    id: "AUD-1001",
    timestamp: "2026-08-26 10:00:05",
    department: "Identity Service",
    request: "Citizen Identity Verification",
    purpose: "Initial application verification",
    result: "Verified",
    applicationId: "JS-2026-001"
  }
];

// Seed Applications Store
let applications = {
  "JS-2026-001": {
    id: "JS-2026-001",
    service: "Business Registration (Unified)",
    serviceId: "business-reg",
    applicant: {
      name: "Aarav Sharma",
      email: "aarav.sharma@example.gov.in",
      phone: "+91 98765 43210"
    },
    status: "processing", // options: "processing", "completed", "queued", "rejected"
    consent: true,
    paymentStatus: "paid",
    feeAmount: 150,
    paymentReceipt: "REC-2026-9002",
    documents: [
      {
        id: "DOC-001",
        name: "AddressProof.docx",
        type: "docx",
        size: "102 KB",
        uploadState: "uploaded",
        verificationState: "verified"
      }
    ],
    verifications: {
      identity: "verified",
      address: "verified",
      tax: "pending",
      municipal: "pending"
    },
    verificationResults: {
      identity: { name: "Aarav Sharma", verified: true },
      address: { applicantName: "Aarav Sharma", residenceVerified: true },
      tax: null,
      municipal: null
    },
    timeline: [
      { timestamp: "2026-08-26 10:00:00", department: "Jan-Setu Gateway", action: "Application Created", detail: "Consent captured. Interoperability orchestration initiated." },
      { timestamp: "2026-08-26 10:00:02", department: "Demo Wallet Service", action: "Payment Settled", detail: "Simulated fee ₹150.00 settled via Demo Wallet (REC-2026-9002)." },
      { timestamp: "2026-08-26 10:00:05", department: "Identity Service", action: "Identity Check", detail: "Citizen record matched & verified." },
      { timestamp: "2026-08-26 10:00:15", department: "Revenue Service", action: "Address Check", detail: "Residence status confirmed against local revenue records." }
    ],
    createdAt: "2026-08-26T10:00:00Z",
    updatedAt: "2026-08-26T10:00:15Z"
  },
  "JS-2026-002": {
    id: "JS-2026-002",
    service: "Income Certificate Issuance",
    serviceId: "income-cert",
    applicant: {
      name: "Priya Patel",
      email: "priya.patel@example.gov.in",
      phone: "+91 98234 56789"
    },
    status: "completed",
    consent: true,
    paymentStatus: "paid",
    feeAmount: 50,
    paymentReceipt: "REC-2026-8841",
    documents: [
      {
        id: "DOC-002",
        name: "SalarySlip_Form16.pdf",
        type: "pdf",
        size: "245 KB",
        uploadState: "uploaded",
        verificationState: "verified"
      }
    ],
    verifications: {
      identity: "verified",
      address: "verified",
      tax: "verified",
      municipal: "verified"
    },
    verificationResults: {
      identity: { name: "Priya Patel", verified: true },
      address: { applicantName: "Priya Patel", residenceVerified: true },
      tax: { citizen_name: "Priya Patel", taxStatus: "clear" },
      municipal: { citizenName: "Priya Patel", zoneApproved: true, propertyTaxStatus: "cleared" }
    },
    timeline: [
      { timestamp: "2026-08-26 11:30:00", department: "Jan-Setu Gateway", action: "Application Created", detail: "Consent captured. Interoperability orchestration initiated." },
      { timestamp: "2026-08-26 11:30:02", department: "Demo Wallet Service", action: "Payment Settled", detail: "Simulated fee ₹50.00 settled via Demo Wallet (REC-2026-8841)." },
      { timestamp: "2026-08-26 11:30:05", department: "Identity Service", action: "Identity Check", detail: "Citizen record matched & verified." },
      { timestamp: "2026-08-26 11:30:12", department: "Revenue Service", action: "Address Check", detail: "Residence status confirmed against local revenue records." },
      { timestamp: "2026-08-26 11:30:20", department: "Tax Service", action: "Tax Clearance", detail: "Tax filing verified and cleared." },
      { timestamp: "2026-08-26 11:30:25", department: "Municipal Service", action: "Municipal Clearance", detail: "Zoning approved & municipal dues cleared." }
    ],
    createdAt: "2026-08-26T11:30:00Z",
    updatedAt: "2026-08-26T11:30:25Z"
  },
  "JS-2026-003": {
    id: "JS-2026-003",
    service: "Trade License Renewal",
    serviceId: "trade-license",
    applicant: {
      name: "Vikram Malhotra",
      email: "vikram.m@example.gov.in",
      phone: "+91 97123 45678"
    },
    status: "queued",
    consent: true,
    paymentStatus: "pending",
    feeAmount: 250,
    paymentReceipt: null,
    documents: [
      {
        id: "DOC-003",
        name: "ShopLeaseAgreement.pdf",
        type: "pdf",
        size: "380 KB",
        uploadState: "uploaded",
        verificationState: "pending"
      }
    ],
    verifications: {
      identity: "verified",
      address: "verified",
      tax: "queued",
      municipal: "pending"
    },
    verificationResults: {
      identity: { name: "Vikram Malhotra", verified: true },
      address: { applicantName: "Vikram Malhotra", residenceVerified: true },
      tax: null,
      municipal: null
    },
    timeline: [
      { timestamp: "2026-08-26 14:15:00", department: "Jan-Setu Gateway", action: "Application Created", detail: "Consent captured. Interoperability orchestration initiated." },
      { timestamp: "2026-08-26 14:15:04", department: "Identity Service", action: "Identity Check", detail: "Citizen record matched & verified." },
      { timestamp: "2026-08-26 14:15:10", department: "Revenue Service", action: "Address Check", detail: "Residence status confirmed against local revenue records." },
      { timestamp: "2026-08-26 14:15:15", department: "Tax Service", action: "Verification Queued", detail: "Tax Service sync delayed. Request placed in resilient queue." }
    ],
    createdAt: "2026-08-26T14:15:00Z",
    updatedAt: "2026-08-26T14:15:15Z"
  }
};

let appCounter = 4;

// Utility: Record Audit Event
function addAuditRecord(department, request, purpose, result, applicationId = "N/A") {
  const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
  const dateStr = new Date().toISOString().split("T")[0];
  const auditItem = {
    id: `AUD-${Date.now().toString().slice(-5)}`,
    timestamp: `${dateStr} ${timeStr}`,
    department,
    request,
    purpose,
    result,
    applicationId
  };
  auditLogs.unshift(auditItem);
  return auditItem;
}

// -------------------------------------------------------------
// SIMULATED DEPARTMENTAL SERVICES
// -------------------------------------------------------------

/**
 * 1. Identity Service
 * Format: { name, verified }
 */
function mockVerifyIdentity(applicationId) {
  const app = applications[applicationId];
  if (!app) return { error: "Application not found" };

  if (serviceStatuses.identity === "offline") {
    app.verifications.identity = "queued";
    app.status = "queued";
    addAuditRecord("Identity Service", "Identity Verification", "Citizen Validation", "Queued (Service Offline)", applicationId);
    app.timeline.push({
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      department: "Identity Service",
      action: "Verification Queued",
      detail: "Identity Service temporarily unavailable. Request queued."
    });
    return { status: "queued", message: "Identity Service temporarily unavailable. Request queued." };
  }

  // Normal successful response
  const rawResponse = {
    name: app.applicant.name || "Aarav Sharma",
    verified: true
  };

  app.verifications.identity = "verified";
  app.verificationResults.identity = rawResponse;
  addAuditRecord("Identity Service", "Identity Verification", "Citizen Validation", "Verified", applicationId);
  app.timeline.push({
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    department: "Identity Service",
    action: "Identity Verification",
    detail: `Identity verified for ${rawResponse.name}`
  });

  checkAppCompletion(app);
  return { status: "success", data: rawResponse };
}

/**
 * 2. Revenue Service (Address Verification)
 * Format: { applicantName, residenceVerified }
 */
function mockVerifyAddress(applicationId) {
  const app = applications[applicationId];
  if (!app) return { error: "Application not found" };

  if (serviceStatuses.revenue === "offline") {
    app.verifications.address = "queued";
    app.status = "queued";
    addAuditRecord("Revenue Service", "Residence Verification", "Address Validation", "Queued (Service Offline)", applicationId);
    app.timeline.push({
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      department: "Revenue Service",
      action: "Verification Queued",
      detail: "Revenue Service temporarily unavailable. Request queued."
    });
    return { status: "queued", message: "Revenue Service temporarily unavailable. Request queued." };
  }

  // Normal successful response (intentionally different property names)
  const rawResponse = {
    applicantName: app.applicant.name || "Aarav Sharma",
    residenceVerified: true
  };

  app.verifications.address = "verified";
  app.verificationResults.address = rawResponse;
  addAuditRecord("Revenue Service", "Residence Verification", "Address Validation", "Verified", applicationId);
  app.timeline.push({
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    department: "Revenue Service",
    action: "Address Verification",
    detail: `Residence confirmed for ${rawResponse.applicantName}`
  });

  checkAppCompletion(app);
  return { status: "success", data: rawResponse };
}

/**
 * 3. Tax Service
 * Format: { citizen_name, taxStatus }
 */
function mockVerifyTax(applicationId) {
  const app = applications[applicationId];
  if (!app) return { error: "Application not found" };

  if (serviceStatuses.tax === "offline") {
    app.verifications.tax = "queued";
    app.status = "queued";
    addAuditRecord("Tax Service", "Tax Compliance Check", "Financial Clearance", "Queued (Service Offline)", applicationId);
    app.timeline.push({
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      department: "Tax Service",
      action: "Verification Queued",
      detail: "Tax Service temporarily unavailable. Request queued."
    });
    return { status: "queued", message: "Tax Service temporarily unavailable. Request queued." };
  }

  // Normal successful response (intentionally different property names)
  const rawResponse = {
    citizen_name: app.applicant.name || "Aarav Sharma",
    taxStatus: "clear"
  };

  app.verifications.tax = "verified";
  app.verificationResults.tax = rawResponse;
  addAuditRecord("Tax Service", "Tax Compliance Check", "Financial Clearance", "Verified (Clear)", applicationId);
  app.timeline.push({
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    department: "Tax Service",
    action: "Tax Clearance",
    detail: `Tax status: ${rawResponse.taxStatus} for ${rawResponse.citizen_name}`
  });

  checkAppCompletion(app);
  return { status: "success", data: rawResponse };
}

/**
 * 4. Municipal Service
 * Format: { citizenName, zoneApproved, propertyTaxStatus }
 */
function mockVerifyMunicipal(applicationId) {
  const app = applications[applicationId];
  if (!app) return { error: "Application not found" };

  if (serviceStatuses.municipal === "offline") {
    app.verifications.municipal = "queued";
    app.status = "queued";
    addAuditRecord("Municipal Service", "Zoning & Trade Check", "Municipal Clearance", "Queued (Service Offline)", applicationId);
    app.timeline.push({
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      department: "Municipal Service",
      action: "Verification Queued",
      detail: "Municipal Service temporarily unavailable. Request queued."
    });
    return { status: "queued", message: "Municipal Service temporarily unavailable. Request queued." };
  }

  // Normal successful response (intentionally different property names)
  const rawResponse = {
    citizenName: app.applicant.name || "Aarav Sharma",
    zoneApproved: true,
    propertyTaxStatus: "cleared"
  };

  app.verifications.municipal = "verified";
  app.verificationResults.municipal = rawResponse;
  addAuditRecord("Municipal Service", "Zoning & Trade Check", "Municipal Clearance", "Verified", applicationId);
  app.timeline.push({
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    department: "Municipal Service",
    action: "Municipal Clearance",
    detail: `Zoning approved: ${rawResponse.zoneApproved}, Municipal Tax: ${rawResponse.propertyTaxStatus}`
  });

  checkAppCompletion(app);
  return { status: "success", data: rawResponse };
}

// -------------------------------------------------------------
// ORCHESTRATION WORKFLOW LOGIC
// -------------------------------------------------------------

function checkAppCompletion(app) {
  const v = app.verifications;
  const isAllVerified = (v.identity === "verified" && v.address === "verified" && v.tax === "verified" && v.municipal === "verified");
  const isAnyQueued = (v.identity === "queued" || v.address === "queued" || v.tax === "queued" || v.municipal === "queued");

  if (isAllVerified) {
    app.status = "completed";
    app.updatedAt = new Date().toISOString();
  } else if (isAnyQueued) {
    app.status = "queued";
  } else {
    app.status = "processing";
  }
}

function orchestrateApplication(applicationId) {
  const app = applications[applicationId];
  if (!app) return null;

  // Step 1: Identity
  if (app.verifications.identity !== "verified") {
    mockVerifyIdentity(applicationId);
  }

  // Step 2: Address / Revenue
  if (app.verifications.address !== "verified") {
    mockVerifyAddress(applicationId);
  }

  // Step 3: Tax
  if (app.verifications.tax !== "verified") {
    mockVerifyTax(applicationId);
  }

  // Step 4: Municipal
  if (app.verifications.municipal !== "verified") {
    mockVerifyMunicipal(applicationId);
  }

  return app;
}

function createNewApplication(data) {
  const newId = `JS-2026-${String(appCounter++).padStart(3, '0')}`;
  const now = new Date().toISOString();

  const newApp = {
    id: newId,
    service: data.service || "Business Registration (Unified)",
    serviceId: data.serviceId || "business-reg",
    applicant: {
      name: data.applicantName || "Aarav Sharma",
      email: data.applicantEmail || "aarav.sharma@example.gov.in",
      phone: data.applicantPhone || "+91 98765 43210"
    },
    status: "processing",
    consent: data.consent !== undefined ? Boolean(data.consent) : true,
    paymentStatus: data.paymentStatus || "pending",
    feeAmount: data.feeAmount || (availableServices.find(s => s.id === (data.serviceId || "business-reg"))?.fee || 150),
    paymentReceipt: data.paymentReceipt || null,
    documents: data.documents || [
      {
        id: `DOC-${Date.now().toString().slice(-3)}`,
        name: data.documentName || "AddressProof.docx",
        type: "docx",
        size: "102 KB",
        uploadState: "uploaded",
        verificationState: "pending"
      }
    ],
    verifications: {
      identity: "pending",
      address: "pending",
      tax: "pending",
      municipal: "pending"
    },
    verificationResults: {
      identity: null,
      address: null,
      tax: null,
      municipal: null
    },
    timeline: [
      {
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        department: "Jan-Setu Gateway",
        action: "Application Submitted",
        detail: "Application received with explicit citizen consent."
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  applications[newId] = newApp;
  addAuditRecord("Jan-Setu Gateway", "Application Submission", "New Service Request", "Accepted", newId);

  // Automatically trigger orchestration workflow
  orchestrateApplication(newId);

  return newApp;
}

function updateServiceStatus(serviceName, status) {
  if (serviceStatuses.hasOwnProperty(serviceName)) {
    serviceStatuses[serviceName] = status;
    addAuditRecord("System Monitor", `Service Status Change: ${serviceName}`, "Health Control", `Updated to ${status.toUpperCase()}`);

    // If bringing service back online, re-run orchestration on queued applications
    if (status === "online") {
      Object.keys(applications).forEach(appId => {
        if (applications[appId].status === "queued") {
          orchestrateApplication(appId);
        }
      });
    }

    return { success: true, serviceStatuses };
  }
  return { success: false, error: "Invalid service name" };
}

function addDocumentToApplication(applicationId, docData) {
  const app = applications[applicationId];
  if (!app) return { success: false, status: 404, error: "Application not found" };

  if (!docData || !docData.name) {
    return { success: false, status: 400, error: "Document name is required" };
  }

  const docId = `DOC-${Date.now().toString().slice(-4)}`;
  const newDoc = {
    id: docData.id || docId,
    name: docData.name,
    type: docData.type || (docData.name.includes('.') ? docData.name.split('.').pop().toLowerCase() : 'pdf'),
    size: docData.size || '150 KB',
    uploadState: docData.uploadState || 'uploaded',
    verificationState: docData.verificationState || 'pending'
  };

  if (!Array.isArray(app.documents)) {
    app.documents = [];
  }

  app.documents.push(newDoc);
  app.updatedAt = new Date().toISOString();

  app.timeline.push({
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    department: "Jan-Setu Gateway",
    action: "Document Uploaded",
    detail: `Citizen attached supporting document: ${newDoc.name} (${newDoc.size})`
  });

  addAuditRecord("Jan-Setu Gateway", "Document Attachment", "Supporting Document Upload", "Uploaded", applicationId);

  return { success: true, document: newDoc, application: app };
}

/**
 * Calculate dynamic aggregate statistics for Department Dashboard
 */
function getDashboardStats() {
  const allApps = Object.values(applications);
  const totalApplications = allApps.length;

  const byStatus = {
    completed: 0,
    processing: 0,
    queued: 0,
    rejected: 0
  };

  const byService = {};
  availableServices.forEach(srv => {
    byService[srv.id] = {
      id: srv.id,
      name: srv.name,
      department: srv.department,
      count: 0
    };
  });

  const verifications = {
    identity: { verified: 0, queued: 0, pending: 0, failed: 0 },
    address: { verified: 0, queued: 0, pending: 0, failed: 0 },
    tax: { verified: 0, queued: 0, pending: 0, failed: 0 },
    municipal: { verified: 0, queued: 0, pending: 0, failed: 0 }
  };

  allApps.forEach(app => {
    const status = (app.status || 'processing').toLowerCase();
    if (byStatus.hasOwnProperty(status)) {
      byStatus[status]++;
    } else {
      byStatus.processing++;
    }

    if (app.serviceId && byService[app.serviceId]) {
      byService[app.serviceId].count++;
    } else if (app.service) {
      const match = availableServices.find(s => s.name === app.service || s.id === app.serviceId);
      if (match && byService[match.id]) {
        byService[match.id].count++;
      }
    }

    if (app.verifications) {
      ['identity', 'address', 'tax', 'municipal'].forEach(key => {
        const vState = (app.verifications[key] || 'pending').toLowerCase();
        if (verifications[key] && verifications[key].hasOwnProperty(vState)) {
          verifications[key][vState]++;
        } else if (verifications[key]) {
          verifications[key].pending++;
        }
      });
    }
  });

  const recentApplications = [...allApps]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const recentAuditLogs = auditLogs.slice(0, 10);

  return {
    totalApplications,
    byStatus,
    byService: Object.values(byService),
    verifications,
    serviceStatuses,
    totalAuditLogs: auditLogs.length,
    recentApplications,
    recentAuditLogs
  };
}

/**
 * PARTH - Monitoring Module
 * Aggregates live system telemetry, adapter health, pipeline bottlenecks, and operational stats
 */
function getMonitoringData() {
  const allApps = Object.values(applications);
  const totalApplications = allApps.length;

  // 1. Adapter Statuses & Health Metrics
  const departmentConfigs = [
    {
      id: "identity",
      name: "Identity Service",
      department: "Unique Identification & Civil Registration",
      endpoint: "/api/verify/identity",
      baseLatency: 42
    },
    {
      id: "revenue",
      name: "Revenue Service",
      department: "Land Records & Residence Administration",
      endpoint: "/api/verify/address",
      baseLatency: 58
    },
    {
      id: "tax",
      name: "Tax Service",
      department: "Commercial & Property Tax Directorate",
      endpoint: "/api/verify/tax",
      baseLatency: 76
    },
    {
      id: "municipal",
      name: "Municipal Service",
      department: "Urban Development & Trade Licensing",
      endpoint: "/api/verify/municipal",
      baseLatency: 51
    }
  ];

  let onlineCount = 0;
  const adapters = departmentConfigs.map(dept => {
    const status = serviceStatuses[dept.id] || "offline";
    const isOnline = status === "online";
    if (isOnline) onlineCount++;

    let verifiedCount = 0;
    let queuedCount = 0;
    let pendingCount = 0;

    allApps.forEach(app => {
      const v = app.verifications ? (app.verifications[dept.id] || 'pending') : 'pending';
      if (v === 'verified') verifiedCount++;
      else if (v === 'queued') queuedCount++;
      else pendingCount++;
    });

    const simulatedLatencyMs = isOnline ? dept.baseLatency + Math.floor(Math.random() * 8) : 0;
    const uptimePct = isOnline ? 99.8 : 84.5;

    return {
      id: dept.id,
      name: dept.name,
      department: dept.department,
      endpoint: dept.endpoint,
      status,
      isOnline,
      latencyMs: simulatedLatencyMs,
      verifiedCount,
      queuedCount,
      pendingCount,
      uptimePct
    };
  });

  // Overall Gateway Health Status
  let overallHealth = "operational";
  let healthLabel = "All Department Adapters Operational";
  if (onlineCount === 0) {
    overallHealth = "critical";
    healthLabel = "Critical: All Department Adapters Offline";
  } else if (onlineCount < 4) {
    overallHealth = "degraded";
    healthLabel = `Degraded: ${4 - onlineCount} Department Adapter(s) Offline`;
  }

  // 2. Queue & Pipeline Bottleneck Analysis
  const queuedApplications = [];
  const processingApplications = [];
  let completedCount = 0;
  let queuedCount = 0;
  let processingCount = 0;
  let rejectedCount = 0;

  const bottleneckCounts = {
    identity: 0,
    revenue: 0,
    tax: 0,
    municipal: 0
  };

  allApps.forEach(app => {
    const status = (app.status || 'processing').toLowerCase();
    if (status === 'completed') {
      completedCount++;
    } else if (status === 'queued') {
      queuedCount++;
      // Determine which department caused the queue
      const blockingDepts = [];
      ['identity', 'revenue', 'tax', 'municipal'].forEach(d => {
        if (app.verifications && app.verifications[d] === 'queued') {
          blockingDepts.push(d);
          bottleneckCounts[d]++;
        }
      });

      queuedApplications.push({
        id: app.id,
        service: app.service,
        applicantName: app.applicant ? app.applicant.name : 'Unknown',
        status: app.status,
        blockingDepartments: blockingDepts.length ? blockingDepts : ['service-sync'],
        verifications: app.verifications || {},
        createdAt: app.createdAt,
        updatedAt: app.updatedAt
      });
    } else if (status === 'processing') {
      processingCount++;
      processingApplications.push({
        id: app.id,
        service: app.service,
        applicantName: app.applicant ? app.applicant.name : 'Unknown',
        status: app.status,
        verifications: app.verifications || {},
        createdAt: app.createdAt
      });
    } else if (status === 'rejected') {
      rejectedCount++;
    }
  });

  // 3. Document Tracking Telemetry
  let totalDocuments = 0;
  let verifiedDocuments = 0;
  let pendingDocuments = 0;
  let uploadedDocuments = 0;

  allApps.forEach(app => {
    if (Array.isArray(app.documents)) {
      app.documents.forEach(doc => {
        totalDocuments++;
        if (doc.verificationState === 'verified') verifiedDocuments++;
        else pendingDocuments++;
        if (doc.uploadState === 'uploaded') uploadedDocuments++;
      });
    }
  });

  // 4. API Endpoints Health Matrix
  const apiEndpoints = [
    { method: "GET", path: "/api/health", target: "Core Gateway", status: "HEALTHY", avgLatency: "4ms" },
    { method: "GET", path: "/api/services", target: "Service Catalog", status: "HEALTHY", avgLatency: "6ms" },
    { method: "GET", path: "/api/services/status", target: "Department Registry", status: "HEALTHY", avgLatency: "5ms" },
    { method: "POST", path: "/api/applications", target: "Orchestration Gateway", status: overallHealth === "critical" ? "DEGRADED" : "HEALTHY", avgLatency: "28ms" },
    { method: "GET", path: "/api/applications", target: "Application Store", status: "HEALTHY", avgLatency: "10ms" },
    { method: "GET", path: "/api/dashboard/stats", target: "Analytics Engine", status: "HEALTHY", avgLatency: "12ms" },
    { method: "GET", path: "/api/audit", target: "Immutable Audit Store", status: "HEALTHY", avgLatency: "8ms" },
    { method: "POST", path: "/api/verify/identity", target: "Identity Adapter", status: serviceStatuses.identity === "online" ? "HEALTHY" : "OFFLINE", avgLatency: serviceStatuses.identity === "online" ? "42ms" : "N/A" },
    { method: "POST", path: "/api/verify/address", target: "Revenue Adapter", status: serviceStatuses.revenue === "online" ? "HEALTHY" : "OFFLINE", avgLatency: serviceStatuses.revenue === "online" ? "58ms" : "N/A" },
    { method: "POST", path: "/api/verify/tax", target: "Tax Adapter", status: serviceStatuses.tax === "online" ? "HEALTHY" : "OFFLINE", avgLatency: serviceStatuses.tax === "online" ? "76ms" : "N/A" },
    { method: "POST", path: "/api/verify/municipal", target: "Municipal Adapter", status: serviceStatuses.municipal === "online" ? "HEALTHY" : "OFFLINE", avgLatency: serviceStatuses.municipal === "online" ? "51ms" : "N/A" }
  ];

  // 5. System Runtime Metrics
  const mem = process.memoryUsage();
  const runtime = {
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
    heapUsedMB: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
    heapTotalMB: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
    platform: process.platform,
    serverTimestamp: new Date().toISOString(),
    module: "Monitoring (Parth)",
    foundationBranch: "pallav-core"
  };

  // 6. Recent Monitoring / Telemetry Audit Stream
  const recentEvents = auditLogs.slice(0, 12).map(log => {
    let severity = "info";
    const res = (log.result || '').toLowerCase();
    const dept = (log.department || '').toLowerCase();
    if (res.includes("offline") || res.includes("error") || res.includes("failed")) {
      severity = "error";
    } else if (res.includes("queued") || res.includes("pending")) {
      severity = "warning";
    } else if (res.includes("verified") || res.includes("clear") || res.includes("accepted") || res.includes("online")) {
      severity = "success";
    }

    return {
      ...log,
      severity
    };
  });

  return {
    overallHealth,
    healthLabel,
    onlineAdaptersCount: onlineCount,
    totalAdaptersCount: 4,
    adapters,
    pipeline: {
      totalApplications,
      completedCount,
      processingCount,
      queuedCount,
      rejectedCount,
      completionRate: totalApplications > 0 ? Math.round((completedCount / totalApplications) * 100) : 0,
      bottleneckCounts,
      queuedApplications,
      processingApplications
    },
    documents: {
      totalDocuments,
      verifiedDocuments,
      pendingDocuments,
      uploadedDocuments
    },
    apiEndpoints,
    runtime,
    recentEvents
  };
}

/**
 * Re-run orchestration for all queued applications
 * Used when services recover from simulated offline state
 */
function reorchestrateAllQueued() {
  const queuedAppIds = Object.keys(applications).filter(id => {
    const app = applications[id];
    return app.status === "queued" || 
      (app.verifications && Object.values(app.verifications).some(v => v === "queued" || v === "pending"));
  });

  let processedCount = 0;
  queuedAppIds.forEach(id => {
    orchestrateApplication(id);
    processedCount++;
  });

  addAuditRecord(
    "System Monitor",
    "Orchestration Pipeline Re-sync",
    "Resilient Queue Drain",
    `Re-processed ${processedCount} queued request(s)`,
    queuedAppIds.length > 0 ? queuedAppIds[0] : "N/A"
  );

  return {
    success: true,
    processedCount,
    queuedRemaining: Object.values(applications).filter(a => a.status === "queued").length,
    applications: Object.values(applications)
  };
}

/**
 * Diagnostic health probe for an individual department service adapter
 */
function probeDepartmentService(department) {
  const validDepts = ["identity", "revenue", "tax", "municipal"];
  if (!validDepts.includes(department)) {
    return { success: false, error: "Invalid department identifier" };
  }

  const status = serviceStatuses[department] || "offline";
  const isOnline = status === "online";
  const start = Date.now();
  const latencyMs = isOnline ? Math.floor(Math.random() * 25) + 30 : 0;

  addAuditRecord(
    "System Monitor",
    `Health Probe: ${department}`,
    "Diagnostic Adapter Probe",
    isOnline ? `Healthy (${latencyMs}ms)` : "Offline (503 Service Unavailable)"
  );

  return {
    success: true,
    department,
    status,
    isOnline,
    latencyMs,
    timestamp: new Date().toISOString(),
    sampleResponse: isOnline ? {
      probeStatus: "OK",
      adapter: `${department.toUpperCase()}_ADAPTER`,
      version: "1.0.0-mock",
      ready: true
    } : {
      probeStatus: "SERVICE_OFFLINE",
      adapter: `${department.toUpperCase()}_ADAPTER`,
      ready: false
    }
  };
}

// -------------------------------------------------------------
// PALAK - DEMO WALLET / SIMULATED PAYMENT STATE & OPERATIONS
// -------------------------------------------------------------

let demoWallet = {
  accountHolder: "Aarav Sharma",
  accountNumber: "JS-WAL-8820-2026",
  balance: 1000.00,
  currency: "INR",
  status: "active",
  lastUpdated: new Date().toISOString()
};

let walletTransactions = [
  {
    id: "TXN-2026-9001",
    type: "credit",
    amount: 1000.00,
    category: "Initial Demo Grant",
    method: "Prototype Seed",
    description: "Initial prototype demo balance allocation",
    referenceId: "GRANT-SEED-01",
    receiptId: "REC-2026-9001",
    status: "completed",
    timestamp: "2026-08-26 09:30:00"
  },
  {
    id: "TXN-2026-9002",
    type: "debit",
    amount: 150.00,
    category: "Application Fee",
    method: "Demo Wallet",
    description: "Simulated fee for Business Registration (Unified)",
    referenceId: "JS-2026-001",
    receiptId: "REC-2026-9002",
    status: "completed",
    timestamp: "2026-08-26 10:00:02"
  },
  {
    id: "TXN-2026-9003",
    type: "debit",
    amount: 50.00,
    category: "Application Fee",
    method: "Demo Wallet",
    description: "Simulated fee for Income Certificate Issuance",
    referenceId: "JS-2026-002",
    receiptId: "REC-2026-8841",
    status: "completed",
    timestamp: "2026-08-26 11:30:02"
  }
];

let txnCounter = 9004;

function getWalletData() {
  let totalCredited = 0;
  let totalDebited = 0;

  walletTransactions.forEach(t => {
    if (t.type === "credit") totalCredited += Number(t.amount || 0);
    else if (t.type === "debit") totalDebited += Number(t.amount || 0);
  });

  return {
    ...demoWallet,
    totalCredited: Math.round(totalCredited * 100) / 100,
    totalDebited: Math.round(totalDebited * 100) / 100,
    transactionCount: walletTransactions.length
  };
}

function topupWallet({ amount, method = "Simulated UPI", remarks = "Demo Wallet Top-Up" }) {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { success: false, status: 400, error: "Invalid amount. Top-up amount must be a positive number greater than 0." };
  }
  if (numAmount > 50000) {
    return { success: false, status: 400, error: "Maximum simulated top-up per transaction is ₹50,000." };
  }

  demoWallet.balance = Math.round((demoWallet.balance + numAmount) * 100) / 100;
  demoWallet.lastUpdated = new Date().toISOString();

  const txnId = `TXN-2026-${String(txnCounter++).padStart(4, '0')}`;
  const dateStr = new Date().toISOString().split("T")[0];
  const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
  const refId = `TOPUP-${Date.now().toString().slice(-6)}`;
  const receiptId = `REC-2026-${Date.now().toString().slice(-5)}`;

  const newTxn = {
    id: txnId,
    type: "credit",
    amount: numAmount,
    category: "Wallet Top-Up",
    method: method || "Simulated UPI",
    description: remarks || "Simulated Wallet Top-Up",
    referenceId: refId,
    receiptId: receiptId,
    status: "completed",
    timestamp: `${dateStr} ${timeStr}`
  };

  walletTransactions.unshift(newTxn);

  addAuditRecord(
    "Demo Wallet Service",
    "Simulated Wallet Top-Up",
    "Demo Balance Addition",
    `Credited ₹${numAmount.toFixed(2)} (New Balance: ₹${demoWallet.balance.toFixed(2)})`,
    refId
  );

  return {
    success: true,
    message: `Successfully topped up ₹${numAmount.toFixed(2)} in demo wallet`,
    balance: demoWallet.balance,
    transaction: newTxn,
    wallet: getWalletData()
  };
}

function payWithWallet({ applicationId, serviceId, amount, purpose }) {
  let fee = Number(amount);
  let app = null;

  if (applicationId) {
    app = applications[applicationId];
    if (app && (!fee || isNaN(fee))) {
      fee = app.feeAmount || 150;
    }
  }

  if (isNaN(fee) || fee <= 0) {
    return { success: false, status: 400, error: "Invalid payment amount. Amount must be greater than 0." };
  }

  if (demoWallet.balance < fee) {
    return {
      success: false,
      status: 400,
      error: `Insufficient balance in Demo Wallet. Required: ₹${fee.toFixed(2)}, Available: ₹${demoWallet.balance.toFixed(2)}. Please top up your demo wallet.`,
      required: fee,
      available: demoWallet.balance
    };
  }

  demoWallet.balance = Math.round((demoWallet.balance - fee) * 100) / 100;
  demoWallet.lastUpdated = new Date().toISOString();

  const txnId = `TXN-2026-${String(txnCounter++).padStart(4, '0')}`;
  const receiptId = `REC-2026-${Date.now().toString().slice(-5)}`;
  const dateStr = new Date().toISOString().split("T")[0];
  const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
  const desc = purpose || (app ? `Simulated fee for ${app.service}` : `Simulated Service Payment (${serviceId || 'Standard'})`);

  const newTxn = {
    id: txnId,
    type: "debit",
    amount: fee,
    category: "Application Fee",
    method: "Demo Wallet",
    description: desc,
    referenceId: applicationId || serviceId || "SERVICE-FEE",
    receiptId: receiptId,
    status: "completed",
    timestamp: `${dateStr} ${timeStr}`
  };

  walletTransactions.unshift(newTxn);

  if (app) {
    app.paymentStatus = "paid";
    app.paymentReceipt = receiptId;
    app.updatedAt = new Date().toISOString();
    app.timeline.push({
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      department: "Demo Wallet Service",
      action: "Payment Settled",
      detail: `Simulated statutory fee ₹${fee.toFixed(2)} settled via Demo Wallet (Receipt: ${receiptId})`
    });
  }

  addAuditRecord(
    "Demo Wallet Service",
    "Simulated Fee Settlement",
    "Application Fee Payment",
    `Debited ₹${fee.toFixed(2)} (Receipt: ${receiptId})`,
    applicationId || "N/A"
  );

  return {
    success: true,
    message: `Payment of ₹${fee.toFixed(2)} settled successfully via Demo Wallet`,
    balance: demoWallet.balance,
    receiptId,
    transaction: newTxn,
    application: app || null,
    wallet: getWalletData()
  };
}

function getWalletTransactions(params = {}) {
  let list = [...walletTransactions];
  const { type, search } = params;

  if (type && type !== "all") {
    list = list.filter(t => t.type.toLowerCase() === type.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(t =>
      (t.id && t.id.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.referenceId && t.referenceId.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q)) ||
      (t.receiptId && t.receiptId.toLowerCase().includes(q))
    );
  }

  return list;
}

function resetWallet() {
  demoWallet.balance = 1000.00;
  demoWallet.lastUpdated = new Date().toISOString();
  walletTransactions = [
    {
      id: "TXN-2026-9001",
      type: "credit",
      amount: 1000.00,
      category: "Initial Demo Grant",
      method: "Prototype Seed",
      description: "Initial prototype demo balance allocation",
      referenceId: "GRANT-SEED-01",
      receiptId: "REC-2026-9001",
      status: "completed",
      timestamp: "2026-08-26 09:30:00"
    }
  ];
  return { success: true, balance: demoWallet.balance, wallet: getWalletData() };
}

// -------------------------------------------------------------
// PALAK - AI CITIZEN ASSISTANT KNOWLEDGE CONTEXT & ENGINE
// -------------------------------------------------------------

// -------------------------------------------------------------
// AI CITIZEN ASSISTANT KNOWLEDGE CONTEXT & ENGINE
// -------------------------------------------------------------

function getJanSetuSystemContext() {
  const serviceListText = availableServices.map(s =>
    `- ${s.name} (ID: ${s.id}, Department: ${s.department}): ${s.description}. Required Documents: ${s.requiredDocs ? s.requiredDocs.join(', ') : 'Standard proofs'}. Fee: ${s.feeDisplay || '₹150 (Simulated Demo)'}.`
  ).join('\n');

  return `You are Jan-Setu AI Assistant, the official citizen guidance helper for the Jan-Setu Unified Interoperability & Service Orchestration Platform.

PORTAL OVERVIEW:
Jan-Setu is a modern government interoperability layer that eliminates redundant paperwork. Instead of submitting documents repeatedly to different government offices, a citizen submits one single application. Jan-Setu then coordinates parallel automated verification across 4 independent departmental adapters:
1. Identity Service (Civil verification)
2. Revenue Service (Address and residence proof verification)
3. Tax Service (Tax compliance & clearance checks)
4. Municipal Service (Urban zoning, commercial clearances, trade license checks)

AVAILABLE SERVICES CATALOG:
${serviceListText}

KEY PLATFORM SECTIONS & HOW TO USE:
- Apply for Services: Go to /pages/application/ to submit a unified application with citizen consent.
- Track Application: Go to /pages/tracking/ and enter the Application ID (e.g., JS-2026-001) to view real-time stage progress, document status, and department logs.
- Services Catalog: Go to /pages/services/ to explore all available services, eligibility, and participating adapters.
- Simulated Citizen Wallet: Accessible via the Wallet icon in the top navigation or at /pages/wallet/ to view simulated balance, top up demo funds, and settle application fees.
- Department Dashboard: Go to /pages/dashboard/ for operational metrics and service performance.
- Audit Log: Go to /pages/audit/ for immutable records of every cross-department verification query.
- System Status: Go to /pages/monitoring/ for live adapter telemetry, uptime, and latency.

RULES & BOUNDARIES:
1. Provide concise, clear, polite, and well-structured answers using clean markdown formatting (bullet points, bold text).
2. Clearly explain how to use the portal, what documents are required, and how orchestration works based strictly on Jan-Setu data.
3. State that Jan-Setu is an interoperability demonstration platform and does not connect to real citizen records or live production government infrastructure.
4. Never invent government fees, application statuses, application IDs, or official policies not present in project data.
5. If the user asks about payments or fee settlement, guide them to the simulated Wallet at /pages/wallet/.
6. Do NOT use emojis in your responses.`;
}

function getDeterministicKnowledgeReply(userMessage) {
  const msg = (userMessage || '').toLowerCase().trim();

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('namaste')) {
    return `Namaste! Welcome to **Jan-Setu Citizen Assistant**. I can help you with:
- **Available Government Services** and eligibility
- **Required Documents** for each service
- **How to Apply** through our unified single-window portal
- **How to Track** your application status in real-time
- **Simulated Citizen Wallet** top-up and fee payments
- **Cross-Department Verification** architecture

How may I assist you today?`;
  }

  if (msg.includes('business') || msg.includes('enterprise') || msg.includes('company') || msg.includes('registration')) {
    return `### Business Registration (Unified)
**Department:** Municipal & Revenue Services
**Simulated Fee:** ₹150 (Simulated Demo)
**Required Documents:**
- Address Proof (.docx / .pdf)
- Business Name & Details
- Identity Verification

**How It Works:** Jan-Setu coordinates verifications across Identity, Revenue, Tax, and Municipal services simultaneously.
**Apply now:** Visit [Application Submission](/pages/application/?serviceId=business-reg)`;
  }

  if (msg.includes('income') || msg.includes('salary') || msg.includes('certificate')) {
    return `### Income Certificate Issuance
**Department:** Revenue Service
**Simulated Fee:** ₹50 (Simulated Demo)
**Required Documents:**
- Income Declaration / Salary Slip
- Residence / Address Proof
- Citizen Identity Verification

**How It Works:** Fast-track verification coordinating Revenue and Identity records.
**Apply now:** Visit [Application Submission](/pages/application/?serviceId=income-cert)`;
  }

  if (msg.includes('trade') || msg.includes('license') || msg.includes('shop')) {
    return `### Trade License Renewal
**Department:** Municipal Service
**Simulated Fee:** ₹250 (Simulated Demo)
**Required Documents:**
- Establishment Lease Agreement (.pdf)
- Safety Declaration / Clearance
- Prior License Number

**How It Works:** Automatic municipal zoning check and tax status verification.
**Apply now:** Visit [Application Submission](/pages/application/?serviceId=trade-license)`;
  }

  if (msg.includes('property') || msg.includes('tax') || msg.includes('clearance')) {
    return `### Property Tax Clearance
**Department:** Tax Service
**Simulated Fee:** ₹100 (Simulated Demo)
**Required Documents:**
- Property Assessment ID
- Last Assessment Receipt

**How It Works:** Automated query to Tax Service and local Revenue records.
**Apply now:** Visit [Application Submission](/pages/application/?serviceId=property-tax-clearance)`;
  }

  if (msg.includes('track') || msg.includes('status') || msg.includes('application id') || msg.includes('js-2026')) {
    return `### How to Track an Application
1. Go to the **[Application Tracker](/pages/tracking/)**.
2. Enter your **Application Tracking ID** (e.g., \`JS-2026-001\`, \`JS-2026-002\`, or \`JS-2026-003\`).
3. Click **Track Status** to inspect:
   - Live stage progress (Submission -> Identity -> Revenue -> Tax -> Municipal -> Completion)
   - Supporting document verification state
   - Cross-department orchestration logs
   - Payment status & simulated wallet receipt`;
  }

  if (msg.includes('wallet') || msg.includes('pay') || msg.includes('money') || msg.includes('balance') || msg.includes('topup') || msg.includes('top-up') || msg.includes('fee')) {
    return `### Simulated Citizen Wallet & Payments
Jan-Setu includes an integrated **Simulated Citizen Wallet** for demo fee settlements:
- **Balance & Top-Up:** You start with a sample demo balance (₹1,000) and can top up demo funds anytime.
- **Pay Fees:** You can settle simulated service application fees directly.
- **Transaction History:** All simulated credit and debit transactions are recorded with downloadable demo receipts.
- **Disclaimer:** This is a strictly simulated demo feature and involves **no real money or banking credentials**.

**Access Wallet:** Click the **Wallet icon** in the top navigation or visit the **[Wallet](/pages/wallet/)** page.`;
  }

  if (msg.includes('document') || msg.includes('upload') || msg.includes('proof')) {
    return `### Required Documents Overview
Depending on your service:
- **Business Registration:** Address Proof (.docx/.pdf), Business Name, Identity Verification.
- **Income Certificate:** Income Declaration, Residence Proof, Citizen Identity.
- **Trade License:** Establishment Lease (.pdf), Safety Declaration, Prior License Number.
- **Property Tax Clearance:** Property Assessment ID, Last Assessment Receipt.

You can upload supporting documents during application submission or attach them later on the **[Application Tracker](/pages/tracking/)**.`;
  }

  if (msg.includes('apply') || msg.includes('how to apply') || msg.includes('submit application') || msg.includes('start application')) {
    return `### How to Apply for a Jan-Setu Service
1. **Choose a Service:** Explore our catalog on the **[Services Catalog](/pages/services/)**.
2. **Open Application:** Go to the **[Application Submission](/pages/application/)** page.
3. **Fill Citizen Details:** Provide applicant information and service-specific requirements.
4. **Grant Consent:** Explicitly consent to federated verification across relevant department adapters.
5. **Receive Tracking ID:** Once submitted, you will receive a unique tracking ID (e.g., \`JS-2026-001\`) to monitor real-time orchestration progress.
6. **Settle Fee:** Settle the statutory fee using your **[Citizen Wallet](/pages/wallet/)**.`;
  }

  if (msg.includes('service') || msg.includes('catalog') || msg.includes('all services')) {
    return `### Available Jan-Setu Services
1. **Business Registration (Unified):** Multi-department single-window enterprise clearance.
2. **Income Certificate Issuance:** Fast revenue-verified income certification.
3. **Trade License Renewal:** Commercial operating permit clearance.
4. **Property Tax Clearance:** Municipal property tax assessment and clearance.

**Explore full catalog:** Visit **[Services Catalog](/pages/services/)**.`;
  }

  if (msg.includes('how does it work') || msg.includes('orchestration') || msg.includes('interoperability') || msg.includes('architecture')) {
    return `### How Jan-Setu Works (Interoperability & Orchestration)
1. **Single-Window Request:** The citizen applies once with explicit consent.
2. **Parallel Orchestration:** Jan-Setu simultaneously contacts Identity, Revenue, Tax, and Municipal adapters.
3. **Federated Verification:** Departments verify records within their own boundaries without centralizing citizen databases.
4. **Resilient Offline Handling:** If any department adapter is offline, requests are safely queued and auto-processed upon recovery.
5. **Transparent Audit Trail:** Every verification query is recorded in the **[Audit Log](/pages/audit/)**.`;
  }

  return `Jan-Setu is a unified government interoperability and service orchestration platform.
I can help you with:
- **Services:** Ask about Business Registration, Income Certificate, Trade License, or Property Tax.
- **Application:** Guidance on how to apply and required documents.
- **Tracking:** How to track Application IDs like \`JS-2026-001\`.
- **Citizen Wallet:** How to use the simulated wallet for fee payments.
- **Architecture:** How cross-department verification works.

What specific information would you like to know?`;
}

module.exports = {
  serviceStatuses,
  availableServices,
  auditLogs,
  applications,
  demoWallet,
  walletTransactions,
  mockVerifyIdentity,
  mockVerifyAddress,
  mockVerifyTax,
  mockVerifyMunicipal,
  orchestrateApplication,
  createNewApplication,
  updateServiceStatus,
  addDocumentToApplication,
  addAuditRecord,
  getDashboardStats,
  getMonitoringData,
  reorchestrateAllQueued,
  probeDepartmentService,
  getWalletData,
  topupWallet,
  payWithWallet,
  getWalletTransactions,
  resetWallet,
  getJanSetuSystemContext,
  getDeterministicKnowledgeReply
};
