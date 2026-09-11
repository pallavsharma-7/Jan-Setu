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
| `/api/applications` | `GET` / `POST` | List all applications or submit new unified application |
| `/api/applications/:id` | `GET` | Get detailed application status & verification breakdown |
| `/api/dashboard/stats` | `GET` | Retrieve aggregated department operational metrics & KPIs |
| `/api/verify/identity` | `POST` | Trigger simulated Identity Service check |
| `/api/verify/address` | `POST` | Trigger simulated Revenue/Address Service check |
| `/api/verify/tax` | `POST` | Trigger simulated Tax Service check |
| `/api/verify/municipal` | `POST` | Trigger simulated Municipal Service check |
| `/api/audit` | `GET` | Access transparent audit trail of departmental data accesses with search/filter |
| `/api/monitoring` | `GET` | Retrieve real-time system monitoring metrics & adapter telemetry |
| `/api/monitoring/reorchestrate` | `POST` | Trigger pipeline re-sync across queued requests |
| `/api/monitoring/probe/:department` | `POST` | Trigger live diagnostic health probe on a department adapter |
| `/api/chat` | `POST` | AI Citizen Assistant service guidance and platform FAQ |
| `/api/wallet` | `GET` | Retrieve Demo Digital Wallet balance and summary |
| `/api/wallet/topup` | `POST` | Top-up simulated demo funds |
| `/api/wallet/pay` | `POST` | Settle simulated public service / application fee |
| `/api/wallet/transactions` | `GET` | List simulated wallet credit & debit transaction history |
| `/api/wallet/reset` | `POST` | Reset demo wallet state to initial prototype grant |

---

## 6. AI Citizen Assistant & Environment Configuration

Jan-Setu features a built-in **Citizen AI Assistant** at `/pages/chatbot/` designed specifically for public service discovery, eligibility explanations, document guidance, and navigation assistance.

### Server-Side AI Security & Fallback
- **Server-Side Execution**: All AI model calls occur strictly on the server backend (`POST /api/chat`). No API keys or credentials are ever sent to or exposed in browser JavaScript.
- **Environment Variable**: `AI_API_KEY` (or `GEMINI_API_KEY`).
- **Local Development**: Copy `.env.example` to `.env` and set `AI_API_KEY=your_key_here`. Real `.env` files are ignored by Git.
- **Production (Render)**: Set the `AI_API_KEY` environment variable in your Render dashboard under the existing **Jan-Setu** service settings.
- **Resilient Fallback Engine**: If no `AI_API_KEY` is configured or if network access is unavailable, the assistant seamlessly utilizes Jan-Setu's built-in deterministic knowledge base to answer questions about available services, documents, and application tracking with zero server downtime.

---

## 7. Simulated Digital Wallet & Demo Payments

Jan-Setu provides a **Demo Digital Wallet** at `/pages/wallet/` allowing citizens to experience digital fee settlement without real financial risks:
- **Strictly Simulated**: Does NOT process real money, connect to real banks, or store banking credentials, CVVs, or UPI PINs.
- **Features**: Real-time balance display, simulated top-ups (+₹100, +₹500, +₹1,000, +₹2,500), simulated application fee payments, and downloadable demo receipts.
- **In-Memory Storage**: Demo wallet balance and transaction logs are maintained in-memory and reset when the server restarts or via the Reset button.

---

## 8. Simulated Departmental Services & Normalized Responses

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

## 9. Demo Application & Testing

- **Demo Application ID**: `JS-2026-001`
- **Demo Citizen Name**: Aarav Sharma
- **Service**: Business Registration (Unified)
- **Automated Verification**: Run `node test.js` or `npm test` to execute all 15 automated integration, AI, and wallet test suites.

---

## 10. Team Ownership & Branch Workflow

| Developer | Feature / Page | Target Branch | Status |
| :--- | :--- | :--- | :--- |
| **PALLAV** | Core Architecture, Server, API & Shared Design System | `pallav-core` | COMPLETED |
| **PATHIKA** | Home Page & Services Catalog | `pathika-home-services` | COMPLETED |
| **TANISHKA** | Application Submission Form & Workflow | `tanishka-application` | COMPLETED |
| **PALAK** | Documents Tracking, AI Citizen Assistant & Demo Wallet | `palak-ai-wallet` | COMPLETED |
| **RUCHA** | Department Officer Dashboard & Audit Log Viewer | `rucha-dashboard-audit` | COMPLETED |
| **PARTH** | Interoperability Health Monitoring & Service Toggles | `parth-monitoring` | COMPLETED |

---

### Render Deployment
- **Production Branch**: `pallav-core`
- **Render Service**: `Jan-Setu`
- **Auto-Deploy**: Enabled — automatically triggers deployment upon push to `pallav-core`.
