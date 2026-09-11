/**
 * Jan-Setu Application Flow Client Script
 * Author: TANISHKA (Frontend Engineer - Application Flow)
 *
 * Responsibilities:
 * - Service selection & pre-population from URL
 * - Form validation (Applicant details, demo safe fields)
 * - Citizen review & consent workflow
 * - Application submission via POST /api/applications
 * - Loading states & duplicate submission prevention
 * - Confirmation screen & Application ID presentation
 */

(function () {
  'use strict';

  // State
  let services = [];
  let currentStep = 1;
  let isSubmitting = false;
  let submittedApplication = null;
  let attachedDocuments = [
    {
      id: 'DOC-001',
      name: 'AddressProof.docx',
      type: 'docx',
      size: '102 KB',
      uploadState: 'uploaded',
      verificationState: 'pending'
    }
  ];

  // DOM Elements
  const stepNodes = {
    1: document.getElementById('step-node-1'),
    2: document.getElementById('step-node-2'),
    3: document.getElementById('step-node-3')
  };

  const stepViews = {
    1: document.getElementById('step-view-1'),
    2: document.getElementById('step-view-2'),
    3: document.getElementById('step-view-3')
  };

  // Form Fields
  const serviceSelect = document.getElementById('service-select');
  const applicantNameInput = document.getElementById('applicant-name');
  const applicantMobileInput = document.getElementById('applicant-mobile');
  const applicantEmailInput = document.getElementById('applicant-email');
  const applicantAddressInput = document.getElementById('applicant-address');
  const applicantNotesInput = document.getElementById('applicant-notes');
  const consentCheckbox = document.getElementById('consent-checkbox');

  // Document Upload DOM Elements (Palak)
  const docUploadDropzone = document.getElementById('doc-upload-dropzone');
  const docFileInput = document.getElementById('doc-file-input');
  const attachedDocsContainer = document.getElementById('attached-docs-container');
  const attachedDocsCount = document.getElementById('attached-docs-count');

  // Error Messages
  const errorElements = {
    service: document.getElementById('err-service'),
    name: document.getElementById('err-name'),
    mobile: document.getElementById('err-mobile'),
    email: document.getElementById('err-email'),
    address: document.getElementById('err-address'),
    consent: document.getElementById('err-consent'),
    documents: document.getElementById('err-documents')
  };

  const generalErrorBanner = document.getElementById('general-error-banner');
  const generalErrorMessage = document.getElementById('general-error-message');

  // Buttons
  const btnFillDemo = document.getElementById('btn-fill-demo');
  const btnToStep2 = document.getElementById('btn-to-step-2');
  const btnBackToStep1 = document.getElementById('btn-back-to-step-1');
  const btnSubmitApplication = document.getElementById('btn-submit-application');
  const submitBtnText = document.getElementById('submit-btn-text');
  const submitBtnSpinner = document.getElementById('submit-btn-spinner');
  const btnCopyAppId = document.getElementById('btn-copy-app-id');
  const copyBtnText = document.getElementById('copy-btn-text');
  const btnNewApplication = document.getElementById('btn-new-application');

  // Sidebar Elements
  const serviceSummaryEmpty = document.getElementById('service-summary-empty');
  const serviceSummaryContent = document.getElementById('service-summary-content');
  const sidebarCategory = document.getElementById('sidebar-service-category');
  const sidebarName = document.getElementById('sidebar-service-name');
  const sidebarDept = document.getElementById('sidebar-service-dept');
  const sidebarDesc = document.getElementById('sidebar-service-desc');
  const sidebarFee = document.getElementById('sidebar-service-fee');
  const sidebarTime = document.getElementById('sidebar-service-time');
  const sidebarAdaptersList = document.getElementById('sidebar-adapters-list');
  const sidebarDataMinimizationText = document.getElementById('sidebar-data-minimization-text');

  // Review Elements
  const reviewServiceName = document.getElementById('review-service-name');
  const reviewServiceDept = document.getElementById('review-service-dept');
  const reviewApplicantName = document.getElementById('review-applicant-name');
  const reviewApplicantMobile = document.getElementById('review-applicant-mobile');
  const reviewApplicantEmail = document.getElementById('review-applicant-email');
  const reviewApplicantAddress = document.getElementById('review-applicant-address');
  const reviewApplicantNotes = document.getElementById('review-applicant-notes');
  const reviewApplicantDocs = document.getElementById('review-applicant-docs');

  // Confirmation Elements
  const confirmedAppId = document.getElementById('confirmed-app-id');
  const confirmedServiceName = document.getElementById('confirmed-service-name');
  const confirmedApplicantName = document.getElementById('confirmed-applicant-name');
  const confirmedApplicantMobile = document.getElementById('confirmed-applicant-mobile');
  const confirmedStatus = document.getElementById('confirmed-status');
  const confirmedDate = document.getElementById('confirmed-date');
  const linkTrackApp = document.getElementById('link-track-app');

  /**
   * Initialize Application Module
   */
  async function init() {
    setupEventListeners();
    setupDocumentUploadHandlers();
    renderAttachedDocuments();
    await loadServices();
    checkUrlParameters();
  }

  /**
   * Load available services from backend
   */
  async function loadServices() {
    try {
      services = await window.JanSetuAPI.getServices();
      populateServiceDropdown(services);
    } catch (err) {
      console.error('[ApplicationFlow] Failed to load services:', err);
      showGeneralError('Unable to load services registry. Please refresh the page or verify the server.');
    }
  }

  /**
   * Populate the service dropdown
   */
  function populateServiceDropdown(servicesList) {
    serviceSelect.innerHTML = '<option value="">-- Choose a Simulated Service --</option>';
    servicesList.forEach(service => {
      const option = document.createElement('option');
      option.value = service.id;
      option.textContent = `${service.name} (${service.department})`;
      serviceSelect.appendChild(option);
    });
  }

  /**
   * Check for query parameters (?serviceId=... or ?service=...)
   */
  function checkUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const serviceIdParam = params.get('serviceId') || params.get('service') || params.get('id');

    if (serviceIdParam) {
      const matched = services.find(s =>
        s.id.toLowerCase() === serviceIdParam.toLowerCase() ||
        s.code?.toLowerCase() === serviceIdParam.toLowerCase()
      );

      if (matched) {
        serviceSelect.value = matched.id;
        updateServiceSidebar(matched);
      }
    }
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Service selection change
    serviceSelect.addEventListener('change', onServiceChange);

    // Fill demo citizen button
    btnFillDemo.addEventListener('click', fillDemoCitizenData);

    // Step navigation
    btnToStep2.addEventListener('click', onProceedToReview);
    btnBackToStep1.addEventListener('click', () => goToStep(1));

    // Submit button
    btnSubmitApplication.addEventListener('click', onSubmitApplication);

    // Copy ID button
    btnCopyAppId.addEventListener('click', onCopyApplicationId);

    // Submit another application
    btnNewApplication.addEventListener('click', onResetApplication);

    // Setup Document Upload Handlers (Palak)
    setupDocumentUploadHandlers();
  }

  /**
   * Setup Document Upload Click and Drag/Drop Handlers (Palak)
   */
  function setupDocumentUploadHandlers() {
    if (!docUploadDropzone || !docFileInput) return;

    docUploadDropzone.addEventListener('click', () => {
      docFileInput.click();
    });

    docUploadDropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        docFileInput.click();
      }
    });

    docFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleDocumentFileUpload(e.target.files);
        docFileInput.value = ''; // Reset input to allow selecting same file again
      }
    });

    // Drag and Drop
    ['dragenter', 'dragover'].forEach(eventName => {
      docUploadDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        docUploadDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      docUploadDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        docUploadDropzone.classList.remove('dragover');
      });
    });

    docUploadDropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleDocumentFileUpload(e.dataTransfer.files);
      }
    });
  }

  /**
   * Handle Client-side Document Upload & Validation (Palak)
   */
  function handleDocumentFileUpload(fileList) {
    clearFieldError('documents');
    const allowedExtensions = ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    let addedCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split('.').pop().toLowerCase();

      if (!allowedExtensions.includes(ext)) {
        showFieldError('documents', `File "${file.name}" has an unsupported format. Allowed types: .pdf, .docx, .doc, .jpg, .png`);
        return;
      }

      if (file.size > maxSizeBytes) {
        showFieldError('documents', `File "${file.name}" exceeds the maximum allowed size of 5 MB.`);
        return;
      }

      const formattedSize = window.JanSetuUI.formatFileSize(file.size);
      const docId = `DOC-${Date.now().toString().slice(-3)}${i}`;

      attachedDocuments.push({
        id: docId,
        name: file.name,
        type: ext,
        size: formattedSize,
        uploadState: 'uploaded',
        verificationState: 'pending'
      });
      addedCount++;
    }

    if (addedCount > 0) {
      renderAttachedDocuments();
    }
  }

  /**
   * Remove an attached document (Palak)
   */
  window.removeAttachedDocument = function(index) {
    if (index >= 0 && index < attachedDocuments.length) {
      attachedDocuments.splice(index, 1);
      renderAttachedDocuments();
      if (attachedDocuments.length === 0) {
        showFieldError('documents', 'Please attach at least one supporting document.');
      } else {
        clearFieldError('documents');
      }
    }
  };

  /**
   * Render attached documents list in UI (Palak)
   */
  function renderAttachedDocuments() {
    if (!attachedDocsContainer) return;

    attachedDocsCount.textContent = attachedDocuments.length;

    if (attachedDocuments.length === 0) {
      attachedDocsContainer.innerHTML = `
        <div style="text-align: center; color: var(--color-text-light); font-size: 0.82rem; padding: 0.75rem; border: 1px dashed var(--color-border); border-radius: var(--radius-sm);">
          No documents attached yet. Click the upload box above to select your document proofs.
        </div>
      `;
      return;
    }

    attachedDocsContainer.innerHTML = attachedDocuments.map((doc, idx) => {
      const typeClass = `type-${escapeHtml(doc.type).toLowerCase()}`;
      return `
        <div class="attached-doc-item">
          <div class="doc-info-left">
            <span class="doc-type-badge ${typeClass}">${escapeHtml(doc.type)}</span>
            <div class="doc-meta">
              <div class="doc-name" title="${escapeHtml(doc.name)}">${escapeHtml(doc.name)}</div>
              <div class="doc-sub">
                <span>${escapeHtml(doc.size)}</span>
                <span>&bull;</span>
                <span style="color: var(--color-success, #15803d); font-weight: 600;">Uploaded (Simulated)</span>
              </div>
            </div>
          </div>
          <div class="doc-actions-right">
            <button type="button" class="btn-remove-doc" onclick="removeAttachedDocument(${idx})" aria-label="Remove document ${escapeHtml(doc.name)}">
              Remove
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Handle Service Selection Change
   */
  function onServiceChange() {
    const selectedId = serviceSelect.value;
    const selectedService = services.find(s => s.id === selectedId);
    updateServiceSidebar(selectedService);

    // Provide contextual default document if only sample default exists
    if (attachedDocuments.length === 1 && (attachedDocuments[0].name === 'AddressProof.docx' || attachedDocuments[0].name.startsWith('Sample_'))) {
      if (selectedId === 'income-cert') {
        attachedDocuments = [{ id: 'DOC-001', name: 'IncomeProof_Form16.pdf', type: 'pdf', size: '180 KB', uploadState: 'uploaded', verificationState: 'pending' }];
      } else if (selectedId === 'trade-license') {
        attachedDocuments = [{ id: 'DOC-001', name: 'EstablishmentLease.pdf', type: 'pdf', size: '220 KB', uploadState: 'uploaded', verificationState: 'pending' }];
      } else if (selectedId === 'property-tax-clearance') {
        attachedDocuments = [{ id: 'DOC-001', name: 'PropertyTaxReceipt.pdf', type: 'pdf', size: '140 KB', uploadState: 'uploaded', verificationState: 'pending' }];
      } else {
        attachedDocuments = [{ id: 'DOC-001', name: 'AddressProof.docx', type: 'docx', size: '102 KB', uploadState: 'uploaded', verificationState: 'pending' }];
      }
      renderAttachedDocuments();
    }
  }

  /**
   * Update the sidebar summary panel with service details
   */
  function updateServiceSidebar(service) {
    if (!service) {
      serviceSummaryEmpty.style.display = 'block';
      serviceSummaryContent.style.display = 'none';
      return;
    }

    serviceSummaryEmpty.style.display = 'none';
    serviceSummaryContent.style.display = 'block';

    sidebarCategory.textContent = service.category || 'Public Service';
    sidebarName.textContent = service.name;
    sidebarDept.textContent = service.department;
    sidebarDesc.textContent = service.description;
    sidebarFee.textContent = service.processingFee || 'Free';
    sidebarTime.textContent = service.estimatedDays || '1-3 Days';

    if (service.dataMinimizationNotice) {
      sidebarDataMinimizationText.textContent = service.dataMinimizationNotice;
    }

    // Populate adapters list
    sidebarAdaptersList.innerHTML = '';
    const adapters = service.requiredAdapters || [
      'Identity Verification Service',
      'Municipal Service'
    ];

    adapters.forEach(adapterName => {
      const li = document.createElement('li');
      li.className = 'adapter-item';
      li.innerHTML = `
        <span class="adapter-icon" aria-hidden="true">&bull;</span>
        <span>${escapeHtml(adapterName)} (Simulated)</span>
      `;
      sidebarAdaptersList.appendChild(li);
    });
  }

  /**
   * Quick fill demo data for testing / presentation
   */
  function fillDemoCitizenData() {
    applicantNameInput.value = 'Aarav Sharma';
    applicantMobileInput.value = '9876543210';
    applicantEmailInput.value = 'aarav.sharma@example.com';
    applicantAddressInput.value = '42, Shanti Nagar, Ward 12, Pune, Maharashtra - 411001';
    applicantNotesInput.value = 'Demo business registration application for commercial services evaluation.';

    attachedDocuments = [
      {
        id: 'DOC-001',
        name: 'AddressProof.docx',
        type: 'docx',
        size: '102 KB',
        uploadState: 'uploaded',
        verificationState: 'pending'
      }
    ];
    renderAttachedDocuments();

    if (!serviceSelect.value && services.length > 0) {
      serviceSelect.value = services[0].id;
      updateServiceSidebar(services[0]);
    }

    // Clear any previous error indicators
    Object.keys(errorElements).forEach(clearFieldError);
    hideGeneralError();
  }

  /**
   * Validate Step 1 Form
   */
  function validateStep1() {
    let isValid = true;
    hideGeneralError();

    // 1. Service Selection
    if (!serviceSelect.value) {
      showFieldError('service', 'Please select a simulated public service from the list.');
      isValid = false;
    } else {
      clearFieldError('service');
    }

    // 2. Full Name
    const nameVal = applicantNameInput.value.trim();
    if (!nameVal) {
      showFieldError('name', 'Applicant name is required.');
      isValid = false;
    } else if (nameVal.length < 2) {
      showFieldError('name', 'Applicant name must be at least 2 characters.');
      isValid = false;
    } else {
      clearFieldError('name');
    }

    // 3. Mobile Number
    const mobileVal = applicantMobileInput.value.trim();
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileVal) {
      showFieldError('mobile', 'Mobile number is required for verification.');
      isValid = false;
    } else if (!mobileRegex.test(mobileVal) && mobileVal.length !== 10) {
      showFieldError('mobile', 'Please enter a valid 10-digit mobile number (e.g. 9876543210).');
      isValid = false;
    } else {
      clearFieldError('mobile');
    }

    // 4. Email Address (Optional, but validate format if entered)
    const emailVal = applicantEmailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailVal && !emailRegex.test(emailVal)) {
      showFieldError('email', 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearFieldError('email');
    }

    // 5. Premises Address
    const addressVal = applicantAddressInput.value.trim();
    if (!addressVal) {
      showFieldError('address', 'Premises/residential address is required for jurisdiction routing.');
      isValid = false;
    } else if (addressVal.length < 5) {
      showFieldError('address', 'Please enter a complete address (minimum 5 characters).');
      isValid = false;
    } else {
      clearFieldError('address');
    }

    // 6. Documents Validation (Palak)
    if (attachedDocuments.length === 0) {
      showFieldError('documents', 'Please attach at least one supporting document.');
      isValid = false;
    } else {
      clearFieldError('documents');
    }

    return isValid;
  }

  /**
   * Proceed from Step 1 to Step 2 (Review)
   */
  function onProceedToReview() {
    if (!validateStep1()) {
      // Focus first invalid element
      const firstInvalid = document.querySelector('.form-control.is-invalid');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    const selectedService = services.find(s => s.id === serviceSelect.value);

    // Populate Review Summary Table
    reviewServiceName.textContent = selectedService ? selectedService.name : serviceSelect.value;
    reviewServiceDept.textContent = selectedService ? selectedService.department : 'General Department';
    reviewApplicantName.textContent = applicantNameInput.value.trim();
    reviewApplicantMobile.textContent = applicantMobileInput.value.trim();
    reviewApplicantEmail.textContent = applicantEmailInput.value.trim() || 'Not Provided';
    reviewApplicantAddress.textContent = applicantAddressInput.value.trim();
    reviewApplicantNotes.textContent = applicantNotesInput.value.trim() || 'None';

    // Populate Attached Documents in Review (Palak)
    if (reviewApplicantDocs) {
      reviewApplicantDocs.innerHTML = attachedDocuments.map(d =>
        `<div style="margin-bottom: 3px;"><strong>${escapeHtml(d.name)}</strong> (${escapeHtml(d.type.toUpperCase())}, ${escapeHtml(d.size)})</div>`
      ).join('');
    }

    goToStep(2);
  }

  /**
   * Submit Application to Backend
   */
  async function onSubmitApplication() {
    hideGeneralError();

    // Verify Consent
    if (!consentCheckbox.checked) {
      showFieldError('consent', 'You must give consent to allow Jan-Setu to coordinate simulated departmental verification.');
      consentCheckbox.focus();
      return;
    } else {
      clearFieldError('consent');
    }

    if (isSubmitting) return;

    const selectedService = services.find(s => s.id === serviceSelect.value);
    const payload = {
      serviceId: serviceSelect.value,
      service: selectedService ? selectedService.name : 'Public Service Application',

      applicantName: applicantNameInput.value.trim(),
      applicantEmail: applicantEmailInput.value.trim(),
      applicantPhone: applicantMobileInput.value.trim(),

      applicant: {
        name: applicantNameInput.value.trim(),
        email: applicantEmailInput.value.trim(),
        phone: applicantMobileInput.value.trim(),
        mobile: applicantMobileInput.value.trim(),
        address: applicantAddressInput.value.trim()
      },

      documents: attachedDocuments.map(d => ({
        id: d.id,
        name: d.name,
        type: d.type,
        size: d.size,
        uploadState: d.uploadState || 'uploaded',
        verificationState: d.verificationState || 'pending'
      })),

      notes: applicantNotesInput.value.trim(),
      consent: true
    };
    // Set Submitting State
    setSubmittingState(true);

    try {
      const responseData = await window.JanSetuAPI.createApplication(payload);
      submittedApplication = responseData;

      // Populate Confirmation Screen
      displayConfirmation(responseData);

      // Move to Step 3
      goToStep(3);
    } catch (err) {
      console.error('[ApplicationFlow] Submission error:', err);
      const friendlyMsg = err.message || 'Unable to submit the application right now. Please try again.';
      showGeneralError(friendlyMsg);
      // Scroll to general error banner
      generalErrorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      setSubmittingState(false);
    }
  }

  /**
   * Display Confirmation details
   */
function displayConfirmation(app) {
  confirmedAppId.textContent = app.id || 'JS-2026-000';
  confirmedServiceName.textContent = app.service || 'Simulated Service';

  confirmedApplicantName.textContent =
    app.applicant ? app.applicant.name : '';

  confirmedApplicantMobile.textContent =
    app.applicant
      ? (app.applicant.phone || app.applicant.mobile || '')
      : '';

  confirmedStatus.textContent =
    app.status || 'Processing';

  confirmedDate.textContent =
    window.JanSetuUI.formatDate(
      app.createdAt || new Date().toISOString()
    );

  // Update tracking link
  linkTrackApp.href =
    `/pages/tracking/?id=${encodeURIComponent(app.id)}`;

  // Update Demo Wallet fee settlement link (Palak)
  const linkPayWallet = document.getElementById('link-pay-wallet-app');
  if (linkPayWallet && app.id) {
    const fee = app.feeAmount || 150;
    linkPayWallet.href = `/pages/wallet/?appId=${encodeURIComponent(app.id)}&amount=${encodeURIComponent(fee)}`;
  }
}

  /**
   * Copy Application ID to clipboard
   */
  async function onCopyApplicationId() {
    const idToCopy = confirmedAppId.textContent;
    const success = await window.JanSetuUI.copyToClipboard(idToCopy);

    if (success) {
      copyBtnText.textContent = 'Copied to Clipboard!';
      btnCopyAppId.style.backgroundColor = 'rgba(16, 185, 129, 0.4)';
      btnCopyAppId.style.borderColor = '#10b981';

      setTimeout(() => {
        copyBtnText.textContent = 'Copy Application ID';
        btnCopyAppId.style.backgroundColor = '';
        btnCopyAppId.style.borderColor = '';
      }, 2500);
    }
  }

  /**
   * Reset the application form for another submission
   */
  function onResetApplication() {
    document.getElementById('application-form-step1').reset();
    consentCheckbox.checked = false;
    submittedApplication = null;
    attachedDocuments = [
      {
        id: 'DOC-001',
        name: 'AddressProof.docx',
        type: 'docx',
        size: '102 KB',
        uploadState: 'uploaded',
        verificationState: 'pending'
      }
    ];
    renderAttachedDocuments();
    hideGeneralError();
    Object.keys(errorElements).forEach(clearFieldError);
    onServiceChange();
    goToStep(1);
  }

  /**
   * Switch Active Step View
   */
  function goToStep(stepNumber) {
    currentStep = stepNumber;

    // Update step progress indicator
    for (let i = 1; i <= 3; i++) {
      stepNodes[i].classList.remove('active', 'completed');
      stepViews[i].style.display = 'none';

      if (i < stepNumber) {
        stepNodes[i].classList.add('completed');
      } else if (i === stepNumber) {
        stepNodes[i].classList.add('active');
        stepNodes[i].setAttribute('aria-current', 'step');
      } else {
        stepNodes[i].removeAttribute('aria-current');
      }
    }

    // Show current step view
    stepViews[stepNumber].style.display = 'block';

    // Scroll to top of progress bar
    document.querySelector('.step-indicator-bar').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Update UI for Submitting State
   */
  function setSubmittingState(submitting) {
    isSubmitting = submitting;
    btnSubmitApplication.disabled = submitting;
    btnBackToStep1.disabled = submitting;

    if (submitting) {
      submitBtnText.textContent = 'Submitting to Jan-Setu...';
      submitBtnSpinner.style.display = 'inline-block';
    } else {
      submitBtnText.textContent = 'Submit Application →';
      submitBtnSpinner.style.display = 'none';
    }
  }

  /**
   * Show Field Validation Error
   */
  function showFieldError(fieldName, message) {
    const errorEl = errorElements[fieldName];
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }

    let inputControl = null;
    if (fieldName === 'service') inputControl = serviceSelect;
    else if (fieldName === 'name') inputControl = applicantNameInput;
    else if (fieldName === 'mobile') inputControl = applicantMobileInput;
    else if (fieldName === 'email') inputControl = applicantEmailInput;
    else if (fieldName === 'address') inputControl = applicantAddressInput;

    if (inputControl) {
      inputControl.classList.add('is-invalid');
    }
  }

  /**
   * Clear Field Validation Error
   */
  function clearFieldError(fieldName) {
    const errorEl = errorElements[fieldName];
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }

    let inputControl = null;
    if (fieldName === 'service') inputControl = serviceSelect;
    else if (fieldName === 'name') inputControl = applicantNameInput;
    else if (fieldName === 'mobile') inputControl = applicantMobileInput;
    else if (fieldName === 'email') inputControl = applicantEmailInput;
    else if (fieldName === 'address') inputControl = applicantAddressInput;

    if (inputControl) {
      inputControl.classList.remove('is-invalid');
    }
  }

  /**
   * Show General Error Banner
   */
  function showGeneralError(message) {
    generalErrorMessage.textContent = message;
    generalErrorBanner.style.display = 'flex';
  }

  /**
   * Hide General Error Banner
   */
  function hideGeneralError() {
    generalErrorBanner.style.display = 'none';
  }

  /**
   * Utility: Escape HTML
   */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
