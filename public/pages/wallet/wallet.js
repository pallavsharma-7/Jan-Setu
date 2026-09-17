/**
 * Jan-Setu Citizen Wallet & Simulated Payment - Frontend Logic
 * Implements balance management, top-up, application fee settlement, and transaction log.
 */

let currentWalletData = null;
let allTransactions = [];
let allApplications = [];

document.addEventListener('DOMContentLoaded', () => {
  initWallet();
});

async function initWallet() {
  setupEventListeners();
  await loadWalletData();
  await loadApplicationsForPayment();
  await loadTransactions();
  checkUrlParams();
}

function setupEventListeners() {
  const topupForm = document.getElementById('wallet-topup-form');
  const payForm = document.getElementById('wallet-pay-form');
  const filterType = document.getElementById('txn-filter-type');
  const searchInput = document.getElementById('txn-search-input');
  const btnReset = document.getElementById('btn-reset-wallet');
  const quickPills = document.querySelectorAll('.quick-pill-btn');
  const appSelect = document.getElementById('pay-application-select');

  if (topupForm) {
    topupForm.addEventListener('submit', handleTopupSubmit);
  }

  if (payForm) {
    payForm.addEventListener('submit', handlePaySubmit);
  }

  if (filterType) {
    filterType.addEventListener('change', () => loadTransactions());
  }

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => loadTransactions(), 300);
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', handleResetWallet);
  }

  quickPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const amount = pill.getAttribute('data-amount');
      const topupInput = document.getElementById('topup-amount-input');
      if (topupInput && amount) {
        topupInput.value = amount;
        topupInput.focus();
      }
    });
  });

  if (appSelect) {
    appSelect.addEventListener('change', handleAppSelectionChange);
  }
}

async function loadWalletData() {
  try {
    const res = await JanSetuAPI.getWallet();
    if (res && res.success && res.wallet) {
      currentWalletData = res.wallet;
      renderWalletSummary(res.wallet);
    }
  } catch (err) {
    console.error('Failed to load wallet:', err);
  }
}

function renderWalletSummary(wallet) {
  const balanceEl = document.getElementById('wallet-balance-display');
  const holderEl = document.getElementById('wallet-holder-name');
  const accNumEl = document.getElementById('wallet-acc-number');
  const totalInEl = document.getElementById('wallet-total-in');
  const totalOutEl = document.getElementById('wallet-total-out');

  if (balanceEl) balanceEl.textContent = JanSetuUI.formatCurrency(wallet.balance);
  if (holderEl) holderEl.textContent = wallet.accountHolder || 'Aarav Sharma';
  if (accNumEl) accNumEl.textContent = wallet.accountNumber || 'JS-WAL-8820-2026';
  if (totalInEl) totalInEl.textContent = JanSetuUI.formatCurrency(wallet.totalCredited || 0);
  if (totalOutEl) totalOutEl.textContent = JanSetuUI.formatCurrency(wallet.totalDebited || 0);
}

async function loadApplicationsForPayment() {
  const select = document.getElementById('pay-application-select');
  if (!select) return;

  try {
    const apps = await JanSetuAPI.getApplications();
    allApplications = apps || [];

    select.innerHTML = '<option value="">-- Select Application to Pay Fee --</option>';

    if (allApplications.length === 0) {
      select.innerHTML += '<option value="" disabled>No applications available</option>';
      return;
    }

    allApplications.forEach(app => {
      const fee = app.feeAmount || 150;
      const isPaid = app.paymentStatus === 'paid';
      const opt = document.createElement('option');
      opt.value = app.id;
      opt.textContent = `${app.id} - ${app.service || 'Service'} (${isPaid ? 'PAID' : `₹${fee}`})`;
      opt.setAttribute('data-fee', fee);
      opt.setAttribute('data-paid', isPaid ? 'true' : 'false');
      opt.setAttribute('data-service', app.service || '');
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load applications for payment:', err);
  }
}

function handleAppSelectionChange() {
  const select = document.getElementById('pay-application-select');
  const feeInput = document.getElementById('pay-amount-input');
  const statusNote = document.getElementById('pay-app-status-note');
  const btnPay = document.getElementById('btn-wallet-pay');

  if (!select || !feeInput) return;

  const selectedOpt = select.options[select.selectedIndex];
  if (!selectedOpt || !selectedOpt.value) {
    feeInput.value = '';
    if (statusNote) statusNote.style.display = 'none';
    if (btnPay) btnPay.disabled = false;
    return;
  }

  const fee = selectedOpt.getAttribute('data-fee') || '150';
  const isPaid = selectedOpt.getAttribute('data-paid') === 'true';

  feeInput.value = fee;

  if (statusNote) {
    if (isPaid) {
      statusNote.className = 'alert alert-info';
      statusNote.innerHTML = '<strong>Note:</strong> Fee for this application has already been paid in demo session. You may re-pay or test another.';
      statusNote.style.display = 'block';
    } else {
      statusNote.className = 'alert alert-warning';
      statusNote.innerHTML = `<strong>Pending Fee:</strong> Statutory fee of ₹${fee} is due for unified processing.`;
      statusNote.style.display = 'block';
    }
  }
}

function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const appId = params.get('appId');
  const amount = params.get('amount');

  if (appId) {
    const select = document.getElementById('pay-application-select');
    if (select) {
      select.value = appId;
      handleAppSelectionChange();
    }
  }

  if (amount) {
    const feeInput = document.getElementById('pay-amount-input');
    if (feeInput) feeInput.value = amount;
  }
}

async function handleTopupSubmit(e) {
  e.preventDefault();
  const amountInput = document.getElementById('topup-amount-input');
  const methodSelect = document.getElementById('topup-method-select');
  const remarksInput = document.getElementById('topup-remarks-input');
  const msgBox = document.getElementById('topup-msg-box');
  const btnSubmit = document.getElementById('btn-topup-submit');

  const amount = parseFloat(amountInput.value);
  const method = methodSelect ? methodSelect.value : 'Simulated UPI';
  const remarks = remarksInput ? (remarksInput.value.trim() || 'Simulated Citizen Top-Up') : 'Simulated Top-Up';

  if (isNaN(amount) || amount <= 0) {
    showFeedback(msgBox, 'danger', 'Please enter a valid top-up amount greater than ₹0.');
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<span class="loading-spinner"></span> Crediting...';

  try {
    const res = await JanSetuAPI.topupWallet({ amount, method, remarks });
    if (res && res.success) {
      showFeedback(msgBox, 'success', `Successfully credited ₹${amount.toFixed(2)} to Simulated Citizen Wallet!`);
      amountInput.value = '';
      if (remarksInput) remarksInput.value = '';
      await loadWalletData();
      await loadTransactions();
    } else {
      showFeedback(msgBox, 'danger', res.error || 'Failed to complete simulated top-up.');
    }
  } catch (err) {
    showFeedback(msgBox, 'danger', 'Network error during top-up.');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = 'Top Up Wallet';
  }
}

async function handlePaySubmit(e) {
  e.preventDefault();
  const select = document.getElementById('pay-application-select');
  const feeInput = document.getElementById('pay-amount-input');
  const purposeInput = document.getElementById('pay-purpose-input');
  const msgBox = document.getElementById('pay-msg-box');
  const btnPay = document.getElementById('btn-wallet-pay');

  const appId = select ? select.value : '';
  const amount = parseFloat(feeInput.value);
  const purpose = purposeInput ? purposeInput.value.trim() : '';

  if (isNaN(amount) || amount <= 0) {
    showFeedback(msgBox, 'danger', 'Please enter a valid fee amount greater than ₹0.');
    return;
  }

  if (currentWalletData && currentWalletData.balance < amount) {
    showFeedback(
      msgBox,
      'danger',
      `Insufficient Demo Balance (Current: ₹${currentWalletData.balance.toFixed(2)}). Please top up at least ₹${(amount - currentWalletData.balance).toFixed(2)}.`
    );
    return;
  }

  btnPay.disabled = true;
  btnPay.innerHTML = '<span class="loading-spinner"></span> Settling Fee...';

  try {
    const res = await JanSetuAPI.payWallet({
      applicationId: appId || null,
      amount,
      purpose: purpose || (appId ? `Simulated fee settlement for ${appId}` : 'Simulated Public Service Fee')
    });

    if (res && res.success) {
      showFeedback(msgBox, 'success', `Payment of ₹${amount.toFixed(2)} settled successfully! Receipt ID: <strong>${res.receiptId || ''}</strong>`);
      await loadWalletData();
      await loadApplicationsForPayment();
      await loadTransactions();

      // Show Receipt Modal
      if (res.transaction) {
        showReceiptModal(res.transaction);
      }
    } else {
      showFeedback(msgBox, 'danger', res.error || 'Payment failed.');
    }
  } catch (err) {
    showFeedback(msgBox, 'danger', 'Network error during simulated payment.');
  } finally {
    btnPay.disabled = false;
    btnPay.innerHTML = 'Pay Simulated Fee';
  }
}

async function loadTransactions() {
  const tbody = document.getElementById('transactions-tbody');
  const filterType = document.getElementById('txn-filter-type')?.value || 'all';
  const search = document.getElementById('txn-search-input')?.value || '';

  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;"><div class="loading-spinner"></div> Loading transactions...</td></tr>';

  try {
    const list = await JanSetuAPI.getWalletTransactions({ type: filterType, search });
    allTransactions = list || [];

    if (allTransactions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">No simulated transactions found.</td></tr>';
      return;
    }

    tbody.innerHTML = allTransactions.map(txn => {
      const isCredit = txn.type === 'credit';
      const badgeClass = isCredit ? 'txn-badge-credit' : 'txn-badge-debit';
      const amountClass = isCredit ? 'txn-amount-credit' : 'txn-amount-debit';
      const amountSign = isCredit ? '+' : '-';

      return `
        <tr>
          <td><strong style="font-family: monospace; font-size: 0.85rem;">${JanSetuUI.escapeHtml(txn.id)}</strong></td>
          <td style="font-size: 0.82rem; color: var(--color-text-muted);">${JanSetuUI.formatDate(txn.timestamp)}</td>
          <td><span class="badge ${badgeClass}">${txn.type.toUpperCase()}</span></td>
          <td>${JanSetuUI.escapeHtml(txn.description)}</td>
          <td><span style="font-family: monospace; font-size: 0.8rem; color: var(--color-teal);">${JanSetuUI.escapeHtml(txn.referenceId || txn.receiptId || '-')}</span></td>
          <td class="${amountClass}" style="text-align: right;">${amountSign}${JanSetuUI.formatCurrency(txn.amount)}</td>
          <td style="text-align: center;">
            <button type="button" class="btn btn-outline btn-sm" onclick="viewReceiptById('${JanSetuUI.escapeHtml(txn.id)}')">Receipt</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load transactions:', err);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--color-danger); padding: 1.5rem;">Failed to load transaction history.</td></tr>';
  }
}

function viewReceiptById(txnId) {
  const txn = allTransactions.find(t => t.id === txnId);
  if (txn) {
    showReceiptModal(txn);
  }
}

function showReceiptModal(txn) {
  // Remove existing modal if any
  closeReceiptModal();

  const backdrop = document.createElement('div');
  backdrop.className = 'receipt-modal-backdrop';
  backdrop.id = 'receipt-modal-container';

  const isCredit = txn.type === 'credit';

  backdrop.innerHTML = `
    <div class="receipt-modal" role="dialog" aria-labelledby="receipt-title">
      <div class="receipt-header">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <h3 id="receipt-title" style="margin: 0; color: #ffffff; font-size: 1.05rem;">DEMO PAYMENT RECEIPT</h3>
        </div>
        <button type="button" class="btn btn-outline btn-sm" style="color: #ffffff; border-color: rgba(255,255,255,0.4);" onclick="closeReceiptModal()">&times;</button>
      </div>
      <div class="receipt-body">
        <div style="text-align: center; margin-bottom: 1rem; border-bottom: 1px solid var(--color-border-light); padding-bottom: 0.75rem;">
          <div style="font-size: 1.1rem; font-weight: 800; color: var(--color-navy);">JAN-SETU GOVERNMENT GATEWAY</div>
          <div style="font-size: 0.75rem; color: var(--color-text-light); text-transform: uppercase;">Simulated Interoperability & Fee Settlement</div>
        </div>

        <div class="receipt-row">
          <span style="color: var(--color-text-muted);">Receipt No:</span>
          <strong>${JanSetuUI.escapeHtml(txn.receiptId || txn.id)}</strong>
        </div>
        <div class="receipt-row">
          <span style="color: var(--color-text-muted);">Date & Time:</span>
          <span>${JanSetuUI.formatDate(txn.timestamp)}</span>
        </div>
        <div class="receipt-row">
          <span style="color: var(--color-text-muted);">Payer / Citizen:</span>
          <span>Aarav Sharma</span>
        </div>
        <div class="receipt-row">
          <span style="color: var(--color-text-muted);">Transaction Type:</span>
          <span class="badge ${isCredit ? 'txn-badge-credit' : 'txn-badge-debit'}">${txn.type.toUpperCase()}</span>
        </div>
        <div class="receipt-row">
          <span style="color: var(--color-text-muted);">Purpose / Description:</span>
          <span>${JanSetuUI.escapeHtml(txn.description)}</span>
        </div>
        <div class="receipt-row">
          <span style="color: var(--color-text-muted);">Reference / App ID:</span>
          <span style="font-family: monospace;">${JanSetuUI.escapeHtml(txn.referenceId || '-')}</span>
        </div>
        <div class="receipt-row">
          <span style="color: var(--color-text-muted);">Payment Method:</span>
          <span>${JanSetuUI.escapeHtml(txn.method || 'Simulated Digital Payment')}</span>
        </div>

        <div class="receipt-total-row">
          <span>Amount Settled:</span>
          <span>${JanSetuUI.formatCurrency(txn.amount)}</span>
        </div>

        <div style="background: var(--color-warning-bg); border: 1px solid var(--color-warning-border); padding: 0.5rem; border-radius: var(--radius-sm); font-size: 0.72rem; color: var(--color-warning); margin-top: 0.85rem; text-align: center;">
          <strong>PROTOTYPE SIMULATION NOTICE:</strong> This is a demo receipt for hackathon validation. No real financial debit occurred.
        </div>
      </div>
      <div class="receipt-footer">
        <button type="button" class="btn btn-secondary btn-sm" onclick="copyReceiptDetails('${JanSetuUI.escapeHtml(txn.id)}')">Copy Receipt</button>
        <button type="button" class="btn btn-primary btn-sm" onclick="closeReceiptModal()">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
}

function closeReceiptModal() {
  const el = document.getElementById('receipt-modal-container');
  if (el) el.remove();
}

function copyReceiptDetails(txnId) {
  const txn = allTransactions.find(t => t.id === txnId);
  if (!txn) return;

  const text = `JAN-SETU DEMO PAYMENT RECEIPT\nReceipt No: ${txn.receiptId || txn.id}\nDate: ${txn.timestamp}\nAmount: ₹${txn.amount.toFixed(2)}\nDescription: ${txn.description}\nRef ID: ${txn.referenceId || '-'}\nStatus: Completed (Simulated Demo)`;
  JanSetuUI.copyToClipboard(text).then(() => {
    alert('Receipt details copied to clipboard!');
  });
}

async function handleResetWallet() {
  if (!confirm('Are you sure you want to reset the Simulated Wallet to its initial prototype state (₹1,000 balance)?')) {
    return;
  }

  try {
    const res = await JanSetuAPI.resetWallet();
    if (res && res.success) {
      alert('Simulated Wallet successfully reset.');
      await loadWalletData();
      await loadTransactions();
      await loadApplicationsForPayment();
    }
  } catch (err) {
    alert('Failed to reset wallet.');
  }
}

function showFeedback(container, type, html) {
  if (!container) return;
  container.className = `alert alert-${type}`;
  container.innerHTML = html;
  container.style.display = 'block';
  setTimeout(() => {
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}
