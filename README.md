# JAN-SETU | Core Foundation

Unified Interoperability & Service Orchestration Platform Prototype.

---

### IMPORTANT DISCLAIMER
> **PROTOTYPE SIMULATION ONLY**: Jan-Setu is a functional hackathon prototype designed to demonstrate service orchestration, interoperability, response normalization, and graceful failure queues between independent simulated departmental services.
> 
> **The platform contains NO real government integrations.** It does NOT connect to Aadhaar, DigiLocker, Income Tax systems, production government databases, real citizen records, or live government infrastructure. All departmental interactions are simulated locally.

---

## 1. Project Purpose & Architecture

In traditional government setups, citizens often have to submit separate applications and credentials to multiple independent departments. 

**Jan-Setu** acts as an **Interoperability & Service Orchestration Gateway**:
- **Data Ownership Principle**: Each department owns and maintains its own isolated data records. Jan-Setu does NOT maintain a giant centralized database of citizen data.
- **On-Demand Orchestration**: When a citizen submits a unified request (e.g. *Business Registration*), Jan-Setu requests only minimal required verifications from respective department mock services (Identity, Revenue, Tax, Municipal).
- **Heterogeneous Data Normalization**: Normalizes varied responses from different department APIs into a single status.
- **Graceful Failure Queuing**: If a departmental service goes offline, the workflow queued step does not crash the system. When the service returns online, orchestration resumes.

---

## 2. Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla HTML5, Vanilla CSS3 (Custom Government Portal Design System), Vanilla JavaScript (ES6 `fetch`)
- **Data**: In-memory JSON data layer & mock state
- **Dependencies**: Express, CORS (Zero external frameworks, databases, or cloud services)

---

## 3. Recommended Project Structure

```
Jan-Setu/
├── package.json          # Dependency definitions and run scripts
├── README.md             # Project documentation & run guide
├── server.js             # Core Express server entry point
├── routes.js             # API route endpoints
├── data.js               # In-memory store, mock services & orchestration logic
│
└── public/
    ├── index.html        # Shared foundation landing & interactive verification console
    ├── css/
    │   └── styles.css    # Unified Indian Government digital portal design system
    └── js/
        ├── api.js        # Global API helper wrapper (JanSetuAPI)
        └── shared.js     # Shared navigation, badges, and layout utilities (JanSetuUI)
```

---

## 4. How to Install and Run

### Prerequisites
- Node.js (v14+ recommended)

### Quick Start Commands
```bash
# 1. Install dependencies
npm install

# 2. Start the Jan-Setu server
npm start
```

Access the portal in your browser at:
**`http://localhost:3000`**

---

## 5. Core API Endpoints Contract

All endpoints are local REST endpoints provided by our Express backend:

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/health` | `GET` | System health check |
| `/api/services` | `GET` | List available service catalog |
| `/api/services/status` | `GET` / `POST` | Get or toggle departmental service health (`online` / `offline`) |
| `/api/applications` | `POST` | Submit new unified application & trigger orchestration |
| `/api/applications/:id` | `GET` | Get detailed application status & verification breakdown |
| `/api/verify/identity` | `POST` | Trigger simulated Identity Service check |
| `/api/verify/address` | `POST` | Trigger simulated Revenue/Address Service check |
| `/api/verify/tax` | `POST` | Trigger simulated Tax Service check |
| `/api/verify/municipal` | `POST` | Trigger simulated Municipal Service check |
| `/api/audit` | `GET` | Access transparent audit trail of departmental data accesses |

---

## 6. Simulated Departmental Services & Normalized Responses

1. **Identity Service** (`mockVerifyIdentity`)
   - Normal Response: `{ "name": "Aarav Sharma", "verified": true }`
2. **Revenue Service** (`mockVerifyAddress`)
   - Normal Response: `{ "applicantName": "Aarav Sharma", "residenceVerified": true }`
3. **Tax Service** (`mockVerifyTax`)
   - Normal Response: `{ "citizen_name": "Aarav Sharma", "taxStatus": "clear" }`
4. **Municipal Service** (`mockVerifyMunicipal`)
   - Normal Response: `{ "citizenName": "Aarav Sharma", "zoneApproved": true, "propertyTaxStatus": "cleared" }`

*Note: Property name variations across department responses are intentional to demonstrate Jan-Setu's response normalization engine.*

---

## 7. Demo Application

- **Demo Application ID**: `JS-2026-001`
- **Demo Citizen Name**: Aarav Sharma
- **Service**: Business Registration (Unified)

---

## 8. Team Ownership & Branch Workflow

| Developer | Feature / Page | Target Branch |
| :--- | :--- | :--- |
| **PALLAV** | Core Architecture, Server, API & Shared Design System | `pallav-core` |
| **PATHIKA** | Home Page & Services Catalog | `origin/pallav-core` |
| **TANISHKA** | Application Submission Form & Workflow | `origin/pallav-core` |
| **PALAK** | Document Upload & Application Tracking UI | `origin/pallav-core` |
| **RUCHA** | Department Officer Dashboard & Audit Log Viewer | `origin/pallav-core` |
| **PARTH** | Interoperability Health Monitoring & Service Toggles | `origin/pallav-core` |

---

### Instructions for Team Members Branching from `pallav-core`:
1. Clone the repository and fetch branch: `git fetch origin`
2. Create your branch from `pallav-core`: `git checkout -b feature-<yourname> origin/pallav-core`
3. Use the shared CSS system (`styles.css`) and shared API wrapper (`JanSetuAPI` in `api.js`) for your pages.
4. Keep the shared files (`server.js`, `routes.js`, `data.js`, `styles.css`) intact to prevent merge conflicts.
