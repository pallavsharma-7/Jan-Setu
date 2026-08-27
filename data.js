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
    active: true
  },
  {
    id: "income-cert",
    name: "Income Certificate Issuance",
    department: "Revenue Service",
    description: "Revenue-verified annual income certificate generation.",
    active: true
  },
  {
    id: "trade-license",
    name: "Trade License Renewal",
    department: "Municipal Service",
    description: "Annual commercial clearance and operating permit renewal.",
    active: true
  },
  {
    id: "property-tax-clearance",
    name: "Property Tax Clearance",
    department: "Tax Service",
    description: "Unified property tax assessment and clearance certificate.",
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

module.exports = {
  serviceStatuses,
  availableServices,
  auditLogs,
  applications,
  mockVerifyIdentity,
  mockVerifyAddress,
  mockVerifyTax,
  mockVerifyMunicipal,
  orchestrateApplication,
  createNewApplication,
  updateServiceStatus,
  addDocumentToApplication,
  addAuditRecord,
  getDashboardStats
};
