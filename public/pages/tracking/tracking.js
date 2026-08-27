/**
 * Jan-Setu Application Tracking Client Script
 * Author: PALAK (Frontend Engineer - Documents & Application Tracking)
 *
 * Responsibilities:
 * - Read application ID from URL query parameters (?id=JS-2026-001)
 * - Fetch application details via GET /api/applications/:id using JanSetuAPI wrapper
 * - Render dynamic citizen tracking view (Application header, Applicant details, Document status, 4-Department verifications, Timeline)
 * - Handle empty, loading, not-found (404), and server error states cleanly
 * - Support prototype document attachment and live status refresh
 * - Provide secure output rendering via JanSetuUI.escapeHtml
 */

(function () {
  'use strict';

  // State
  let currentApplicationId = null;
  let currentApplication = null;
  let isFetching = false;

  // View Containers
  const viewLoading = document.getElementById('view-loading');
  const viewEmpty = document.getElementById('view-empty');
  const viewError = document.getElementById('view-error');
  const viewApplication = document.getElementById('view-application');

  // Input & Error Elements
  const trackingInput = document.getElementById('tracking-id-input');
  const errorTitle = document.getElementById('error-title');
  const errorMessage = document.getElementById('error-message');

  // Display Elements
  const displayAppId = document.getElementById('display-app-id');
  const displayAppService = document.getElementById('display-app-service');
  const displayAppCreated = document.getElementById('display-app-created');
  const displayAppUpdated = document.getElementById('display-app-updated');
  const displayAppConsent = document.getElementById('display-app-consent');
  const displayStatusBadge = document.getElementById('display-status-badge');
  const appHeaderContainer = document.getElementById('app-header-container');

  // Applicant Profile Display
  const displayApplicantName = document.getElementById('display-applicant-name');
  const displayApplicantMobile = document.getElementById('display-applicant-mobile');
  const displayApplicantEmail = document.getElementById('display-applicant-email');
  const displayApplicantAddress = document.getElementById('display-applicant-address');
  const displayServiceDept = document.getElementById('display-service-dept');
  const displayApplicantNotes = document.getElementById('display-applicant-notes');

  // Verification Display Elements
  const displayVerifiedCount = document.getElementById('display-verified-count');
  const cardVerifyIdentity = document.getElementById('card-verify-identity');
  const cardVerifyAddress = document.getElementById('card-verify-address');
  const cardVerifyTax = document.getElementById('card-verify-tax');
  const cardVerifyMunicipal = document.getElementById('card-verify-municipal');

  const badgeVerifyIdentity = document.getElementById('badge-verify-identity');
  const badgeVerifyAddress = document.getElementById('badge-verify-address');
  const badgeVerifyTax = document.getElementById('badge-verify-tax');
  const badgeVerifyMunicipal = document.getElementById('badge-verify-municipal');

  const resultVerifyIdentity = document.getElementById('result-verify-identity');
  const resultVerifyAddress = document.getElementById('result-verify-address');
  const resultVerifyTax = document.getElementById('result-verify-tax');
  const resultVerifyMunicipal = document.getElementById('result-verify-municipal');

  // Documents Display Elements
  const displayDocumentsTbody = document.getElementById('display-documents-tbody');
  const displayDocsSummaryCount = document.getElementById('display-docs-summary-count');

  // Timeline & Guidance Display
  const displayTimelineContainer = document.getElementById('display-timeline-container');
  const displayGuidanceBox = document.getElementById('display-guidance-box');
  const displayGuidanceTitle = document.getElementById('display-guidance-title');
  const displayGuidanceText = document.getElementById('display-guidance-text');

  // Modal Elements
  const attachDocModal = document.getElementById('attach-doc-modal');
  const modalDocName = document.getElementById('modal-doc-name');
  const modalDocType = document.getElementById('modal-doc-type');
  const modalDocSize = document.getElementById('modal-doc-size');
  const btnSaveDoc = document.getElementById('btn-save-doc');

  /**
   * Initialize Tracking Page
   */
  async function init() {
    window.addEventListener('popstate', onPopState);
    const appIdFromUrl = getAppIdFromUrl();

    if (appIdFromUrl) {
      if (trackingInput) trackingInput.value = appIdFromUrl;
      await loadApplication(appIdFromUrl);
    } else {
      showView('empty');
    }
  }

  /**
   * Extract application ID from URL (?id=... or ?appId=...)
   */
  function getAppIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('appId') || params.get('applicationId');
  }

  /**
   * Handle browser navigation history changes
   */
  async function onPopState() {
    const appId = getAppIdFromUrl();
    if (appId) {
      if (trackingInput) trackingInput.value = appId;
      await loadApplication(appId, false);
    } else {
      showView('empty');
    }
  }

  /**
   * Load and Render Application by ID
   */
  async function loadApplication(appId, updateHistory = true) {
    if (!appId || !appId.trim()) {
      showView('empty');
      return;
    }

    const cleanId = appId.trim();
    currentApplicationId = cleanId;

    if (updateHistory) {
      const newUrl = `${window.location.pathname}?id=${encodeURIComponent(cleanId)}`;
      window.history.pushState({ id: cleanId }, '', newUrl);
    }

    showView('loading');
    isFetching = true;

    try {
      const app = await window.JanSetuAPI.getApplication(cleanId);

      if (!app || app.error) {
        if (app && app.error === 'Application not found') {
          showErrorState(
            'Application Not Found',
            `No application matching tracking ID "${escapeHtml(cleanId)}" was found in the Jan-Setu gateway. Please verify the ID or submit a new service application.`
          );
        } else {
          showErrorState(
            'Gateway Communication Error',
            app?.error || 'Unable to retrieve application details from the server. Please check your network or try again.'
          );
        }
        return;
      }

      currentApplication = app;
      renderApplication(app);
      showView('application');

    } catch (err) {
      console.error('[Tracker] Fetch error:', err);
      showErrorState(
        'System Unavailable',
        'Could not communicate with the Jan-Setu API service. Please verify that the backend server is running.'
      );
    } finally {
      isFetching = false;
    }
  }

  /**
   * Render Full Application Details
   */
  function renderApplication(app) {
    const escape = window.JanSetuUI ? window.JanSetuUI.escapeHtml : escapeHtml;
    const formatDate = window.JanSetuUI ? window.JanSetuUI.formatDate : (d) => d;
    const getBadgeHTML = window.JanSetuUI ? window.JanSetuUI.getStatusBadgeHTML : (s) => `<span>${s}</span>`;

    // 1. Application Header
    displayAppId.textContent = app.id || 'N/A';
    displayAppService.textContent = app.service || 'Simulated Public Service';
    displayAppCreated.textContent = formatDate(app.createdAt);
    displayAppUpdated.textContent = formatDate(app.updatedAt);
    displayAppConsent.textContent = app.consent ? 'Explicit Consent Captured' : 'Pending';

    // Application Status Pill & Header Class
    const status = (app.status || 'processing').toLowerCase();
    appHeaderContainer.className = `app-header-card status-${status}`;
    displayStatusBadge.innerHTML = `
      <span class="status-pill-big status-${status}">
        <span class="status-indicator ${status === 'completed' ? 'online' : (status === 'rejected' ? 'offline' : 'queued')}"></span>
        ${escape(status.toUpperCase())}
      </span>
    `;

    // 2. Applicant Profile
    const applicant = app.applicant || {};
    displayApplicantName.textContent = applicant.name || 'Citizen Applicant';
    displayApplicantMobile.textContent = applicant.phone || applicant.mobile || 'Not Provided';
    displayApplicantEmail.textContent = applicant.email || 'Not Provided';
    displayApplicantAddress.textContent = applicant.address || 'Address on record';
    displayServiceDept.textContent = app.serviceId || 'Municipal & Revenue Interoperability';
    displayApplicantNotes.textContent = app.notes || 'Standard Citizen Service Submission';

    // 3. Department Verifications
    renderVerificationStatuses(app);

    // 4. Documents List
    renderDocumentsTable(app.documents || []);

    // 5. Timeline History
    renderTimeline(app.timeline || []);

    // 6. Citizen Guidance
    renderGuidance(status);
  }

  /**
   * Render Department Verification Status Cards (4 Departments)
   */
  function renderVerificationStatuses(app) {
    const v = app.verifications || { identity: 'pending', address: 'pending', tax: 'pending', municipal: 'pending' };
    const vr = app.verificationResults || {};
    const escape = window.JanSetuUI ? window.JanSetuUI.escapeHtml : escapeHtml;
    const getBadgeHTML = window.JanSetuUI ? window.JanSetuUI.getStatusBadgeHTML : (s) => `<span>${s}</span>`;

    // Calculate verified count
    const verifiedTotal = Object.values(v).filter(st => st === 'verified').length;
    displayVerifiedCount.textContent = `${verifiedTotal}/4 VERIFIED`;
    displayVerifiedCount.className = verifiedTotal === 4 ? 'badge badge-completed' : (verifiedTotal > 0 ? 'badge badge-online' : 'badge badge-pending');

    // Helper to update a department card
    const updateCard = (cardEl, badgeEl, resultEl, state, defaultDetail, resultObj, formatResultFn) => {
      const s = (state || 'pending').toLowerCase();
      cardEl.className = `dept-verify-card state-${s}`;
      badgeEl.innerHTML = getBadgeHTML(s);

      if (s === 'verified' && resultObj) {
        resultEl.innerHTML = formatResultFn(resultObj);
        resultEl.style.display = 'block';
      } else if (s === 'queued') {
        resultEl.innerHTML = '<span style="color: var(--color-warning); font-weight: 600;">Request queued (Service offline)</span>';
        resultEl.style.display = 'block';
      } else if (s === 'rejected') {
        resultEl.innerHTML = '<span style="color: var(--color-danger); font-weight: 600;">Verification rejected</span>';
        resultEl.style.display = 'block';
      } else {
        resultEl.innerHTML = '<span style="color: var(--color-text-light);">Awaiting adapter query</span>';
        resultEl.style.display = 'block';
      }
    };

    // 1. Identity Service
    updateCard(
      cardVerifyIdentity,
      badgeVerifyIdentity,
      resultVerifyIdentity,
      v.identity,
      'Citizen Identity check',
      vr.identity,
      (res) => `<strong>Matched:</strong> ${escape(res.name || app.applicant?.name)} &bull; ID Verified`
    );

    // 2. Revenue / Address Service
    updateCard(
      cardVerifyAddress,
      badgeVerifyAddress,
      resultVerifyAddress,
      v.address,
      'Address & jurisdiction check',
      vr.address,
      (res) => `<strong>Confirmed:</strong> ${escape(res.applicantName || app.applicant?.name)} &bull; Residence Match`
    );

    // 3. Tax Service
    updateCard(
      cardVerifyTax,
      badgeVerifyTax,
      resultVerifyTax,
      v.tax,
      'Tax compliance clearance',
      vr.tax,
      (res) => `<strong>Tax Status:</strong> ${escape(res.taxStatus || 'Clear')} &bull; Compliance Assessed`
    );

    // 4. Municipal Service
    updateCard(
      cardVerifyMunicipal,
      badgeVerifyMunicipal,
      resultVerifyMunicipal,
      v.municipal,
      'Zoning and trade clearance',
      vr.municipal,
      (res) => `<strong>Zoning:</strong> ${res.zoneApproved ? 'Approved' : 'Pending'} &bull; Municipal Tax: ${escape(res.propertyTaxStatus || 'Cleared')}`
    );
  }

  /**
   * Render Documents Table
   */
  function renderDocumentsTable(docs) {
    const escape = window.JanSetuUI ? window.JanSetuUI.escapeHtml : escapeHtml;
    const getBadgeHTML = window.JanSetuUI ? window.JanSetuUI.getStatusBadgeHTML : (s) => `<span>${s}</span>`;

    displayDocsSummaryCount.textContent = `Total Documents: ${docs.length}`;

    if (!docs || docs.length === 0) {
      displayDocumentsTbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--color-text-muted); padding: 1.5rem;">
            No documents attached to this application record.
          </td>
        </tr>
      `;
      return;
    }

    displayDocumentsTbody.innerHTML = docs.map(doc => {
      const type = (doc.type || (doc.name.includes('.') ? doc.name.split('.').pop() : 'pdf')).toLowerCase();
      const typeClass = `tag-${type}`;
      const uploadState = doc.uploadState || 'uploaded';
      const verifyState = doc.verificationState || 'pending';

      return `
        <tr>
          <td>
            <div class="doc-name-cell">
              <span class="doc-icon-tag ${typeClass}">${escape(type.toUpperCase())}</span>
              <span title="${escape(doc.name)}">${escape(doc.name)}</span>
            </div>
          </td>
          <td>
            <span style="font-weight: 500; text-transform: uppercase; font-size: 0.78rem;">${escape(type)}</span>
          </td>
          <td>
            <span style="color: var(--color-text-muted);">${escape(doc.size || '120 KB')}</span>
          </td>
          <td>
            ${getBadgeHTML(uploadState)}
          </td>
          <td>
            ${getBadgeHTML(verifyState)}
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Render Chronological Application Timeline
   */
  function renderTimeline(timeline) {
    const escape = window.JanSetuUI ? window.JanSetuUI.escapeHtml : escapeHtml;
    const formatDate = window.JanSetuUI ? window.JanSetuUI.formatDate : (d) => d;

    if (!timeline || timeline.length === 0) {
      displayTimelineContainer.innerHTML = `
        <div style="color: var(--color-text-muted); font-size: 0.85rem;">
          No timeline events recorded yet.
        </div>
      `;
      return;
    }

    displayTimelineContainer.innerHTML = timeline.map(item => `
      <div class="timeline-item">
        <div class="timeline-timestamp">${escape(formatDate(item.timestamp))}</div>
        <div class="timeline-title">
          <span class="timeline-event-dept">${escape(item.department || 'Jan-Setu Gateway')}</span>
          <div>${escape(item.action || 'Workflow Event')}</div>
        </div>
        <div class="timeline-detail">${escape(item.detail || '')}</div>
      </div>
    `).join('');
  }

  /**
   * Render Next Steps Guidance Box
   */
  function renderGuidance(status) {
    if (status === 'completed') {
      displayGuidanceTitle.textContent = 'Application Completed & Verified';
      displayGuidanceText.textContent = 'All participating departmental adapters have completed their verification checks. Your application has been approved and registered across municipal and revenue systems.';
      displayGuidanceBox.style.borderLeftColor = 'var(--color-success, #15803d)';
    } else if (status === 'queued') {
      displayGuidanceTitle.textContent = 'Application Safely Queued';
      displayGuidanceText.textContent = 'One or more simulated department adapters are currently offline for maintenance. Jan-Setu has safely queued your request and will resume automated orchestration as soon as the service recovers.';
      displayGuidanceBox.style.borderLeftColor = 'var(--color-warning, #b45309)';
    } else if (status === 'rejected') {
      displayGuidanceTitle.textContent = 'Action Required';
      displayGuidanceText.textContent = 'One or more departmental verification checks could not be cleared. Please check the document status section and ensure your submitted proofs match official records.';
      displayGuidanceBox.style.borderLeftColor = 'var(--color-danger, #b91c1c)';
    } else {
      displayGuidanceTitle.textContent = 'Verification in Progress';
      displayGuidanceText.textContent = 'Jan-Setu is actively coordinating automated verification queries with participating department adapters. You do not need to submit documents separately.';
      displayGuidanceBox.style.borderLeftColor = 'var(--color-teal, #005f73)';
    }
  }

  /**
   * Switch Active View State
   */
  function showView(viewName) {
    viewLoading.style.display = viewName === 'loading' ? 'block' : 'none';
    viewEmpty.style.display = viewName === 'empty' ? 'block' : 'none';
    viewError.style.display = viewName === 'error' ? 'block' : 'none';
    viewApplication.style.display = viewName === 'application' ? 'block' : 'none';
  }

  /**
   * Display Error State
   */
  function showErrorState(title, message) {
    errorTitle.textContent = title;
    errorMessage.textContent = message;
    showView('error');
  }

  /**
   * Helper: Escape HTML
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // GLOBAL ACTIONS & EVENT HANDLERS
  // =========================================================================

  /**
   * Handle Search Form Submission
   */
  window.handleTrackingSearch = function (event) {
    if (event) event.preventDefault();
    const val = trackingInput ? trackingInput.value.trim() : '';
    if (val) {
      loadApplication(val);
    } else {
      showView('empty');
    }
  };

  /**
   * Quick Track Chip Click
   */
  window.quickTrack = function (id) {
    if (trackingInput) trackingInput.value = id;
    loadApplication(id);
  };

  /**
   * Refresh Current Application Status
   */
  window.refreshApplicationStatus = async function () {
    if (!currentApplicationId) return;
    await loadApplication(currentApplicationId, false);
  };

  /**
   * Copy Tracking ID to Clipboard
   */
  window.copyTrackingId = async function () {
    const btn = document.getElementById('btn-copy-id');
    if (!currentApplicationId) return;

    const success = await window.JanSetuUI.copyToClipboard(currentApplicationId);
    if (success && btn) {
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.style.backgroundColor = '#dcfce7';
      btn.style.color = '#15803d';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
        btn.style.color = '';
      }, 2000);
    }
  };

  /**
   * Print Summary Receipt
   */
  window.printTrackingSummary = function () {
    window.print();
  };

  /**
   * Open Attach Document Modal
   */
  window.openAttachDocModal = function () {
    if (!attachDocModal) return;
    modalDocName.value = '';
    modalDocSize.value = '185 KB';
    attachDocModal.style.display = 'flex';
    modalDocName.focus();
  };

  /**
   * Close Attach Document Modal
   */
  window.closeAttachDocModal = function () {
    if (attachDocModal) attachDocModal.style.display = 'none';
  };

  /**
   * Submit Attached Document to Application
   */
  window.handleAttachDocumentSubmit = async function (event) {
    if (event) event.preventDefault();
    if (!currentApplicationId) return;

    const docName = modalDocName.value.trim();
    const docType = modalDocType.value;
    const docSize = modalDocSize.value.trim() || '185 KB';

    if (!docName) {
      alert('Please enter a document title.');
      return;
    }

    btnSaveDoc.disabled = true;
    btnSaveDoc.textContent = 'Attaching...';

    try {
      const result = await window.JanSetuAPI.addDocument(currentApplicationId, {
        name: docName,
        type: docType,
        size: docSize,
        uploadState: 'uploaded',
        verificationState: 'pending'
      });

      if (result && result.success) {
        closeAttachDocModal();
        await loadApplication(currentApplicationId, false);
      } else {
        alert(result?.error || 'Failed to attach document. Please try again.');
      }
    } catch (err) {
      console.error('Document attachment failed:', err);
      alert('Error uploading document. Please verify server connection.');
    } finally {
      btnSaveDoc.disabled = false;
      btnSaveDoc.textContent = 'Attach Document →';
    }
  };

  // Close modal on Escape key or overlay click
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && attachDocModal && attachDocModal.style.display !== 'none') {
      closeAttachDocModal();
    }
  });

  if (attachDocModal) {
    attachDocModal.addEventListener('click', (e) => {
      if (e.target === attachDocModal) {
        closeAttachDocModal();
      }
    });
  }

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
