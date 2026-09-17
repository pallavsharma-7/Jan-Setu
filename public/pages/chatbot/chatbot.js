/**
 * Jan-Setu AI Citizen Assistant - Frontend Logic
 * Implements interactive conversational UI with server-side AI integration & fallback
 */

let conversationHistory = [];
let isProcessing = false;

document.addEventListener('DOMContentLoaded', () => {
  initChatbot();
});

function initChatbot() {
  const form = document.getElementById('chat-input-form');
  const input = document.getElementById('chat-input');
  const btnClear = document.getElementById('btn-clear-chat');
  const chips = document.querySelectorAll('.suggestion-chip');

  if (form) {
    form.addEventListener('submit', handleChatSubmit);
  }

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isProcessing) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    });

    input.addEventListener('input', () => {
      updateCharCount();
      autoResizeInput(input);
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', clearChat);
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      if (query && !isProcessing) {
        if (input) {
          input.value = query;
          updateCharCount();
        }
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    });
  });

  scrollToBottom();
}

function updateCharCount() {
  const input = document.getElementById('chat-input');
  const counter = document.getElementById('char-count');
  if (input && counter) {
    const len = input.value.length;
    counter.textContent = `${len}/2000`;
  }
}

function autoResizeInput(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function scrollToBottom() {
  const container = document.getElementById('chat-messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

async function handleChatSubmit(e) {
  e.preventDefault();
  if (isProcessing) return;

  const input = document.getElementById('chat-input');
  const btnSubmit = document.getElementById('btn-chat-send');
  if (!input) return;

  const message = input.value.trim();
  if (!message) return;

  // Append citizen message to UI
  appendMessage('user', message, 'Citizen');

  // Clear input
  input.value = '';
  updateCharCount();
  input.style.height = 'auto';

  // Set loading state
  isProcessing = true;
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="loading-spinner"></span>';
  }

  // Show typing indicator
  const typingId = showTypingIndicator();
  scrollToBottom();

  try {
    // Send previous history with current query
    const res = await JanSetuAPI.sendChatMessage(message, conversationHistory);
    removeTypingIndicator(typingId);

    // Track user message in history
    conversationHistory.push({ role: 'user', content: message });

    if (res && res.reply) {
      appendMessage('assistant', res.reply, 'Jan-Setu Assistant', res.source);
      conversationHistory.push({ role: 'assistant', content: res.reply });
    } else {
      const fallbackReply = 'I am unable to process this query at the moment. Please refer to our [Services Catalog](/pages/services/) or [Application Tracker](/pages/tracking/).';
      appendMessage('assistant', fallbackReply, 'Jan-Setu Assistant', 'knowledge-base');
      conversationHistory.push({ role: 'assistant', content: fallbackReply });
    }
  } catch (err) {
    console.error('Chat submit error:', err);
    removeTypingIndicator(typingId);
    appendMessage(
      'assistant',
      'A network error occurred while connecting to the Jan-Setu AI Service. Please check your connection and try again.',
      'Jan-Setu Assistant',
      'knowledge-base'
    );
  } finally {
    isProcessing = false;
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = 'Send';
    }
    scrollToBottom();
    if (input) input.focus();
  }
}

function appendMessage(role, text, senderName, source = null) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const row = document.createElement('div');
  row.className = `chat-message-row ${role}`;

  const formattedContent = parseSimpleMarkdown(text);
  let sourceBadge = '';
  if (source === 'ai') {
    sourceBadge = '<span class="msg-source-badge ai-source">AI ASSISTANT</span>';
  } else if (source) {
    sourceBadge = '<span class="msg-source-badge kb-source">KNOWLEDGE BASE</span>';
  }

  const avatarText = role === 'user' ? 'ME' : 'JS';
  const avatarTitle = role === 'user' ? 'Citizen' : 'Jan-Setu Assistant';

  row.innerHTML = `
    <div class="msg-avatar" title="${avatarTitle}">
      ${avatarText}
    </div>
    <div class="msg-bubble-container">
      <div class="msg-bubble">
        ${formattedContent}
      </div>
      <div class="msg-meta">
        <span>${timeStr}</span>
        ${sourceBadge}
        <button type="button" class="btn btn-outline btn-sm" style="padding: 1px 6px; font-size: 0.68rem;" onclick="copyMessageText(this)">Copy</button>
      </div>
    </div>
  `;

  container.appendChild(row);
  scrollToBottom();
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return null;

  const id = `typing-${Date.now()}`;
  const row = document.createElement('div');
  row.id = id;
  row.className = 'chat-message-row assistant';
  row.innerHTML = `
    <div class="msg-avatar">JS</div>
    <div class="msg-bubble-container">
      <div class="msg-bubble" style="padding: 0.5rem 0.8rem;">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(row);
  return id;
}

function removeTypingIndicator(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

function clearChat() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  conversationHistory = [];
  container.innerHTML = '';

  // Re-append default welcome message
  appendMessage(
    'assistant',
    'Namaste! Welcome to **Jan-Setu Citizen Assistant**.\n\nI can assist you with understanding our unified public services, required documents, tracking your application across departments, and using our simulated Citizen Wallet.\n\nHow can I help you today?',
    'Jan-Setu Assistant',
    'knowledge-base'
  );
}

function copyMessageText(btn) {
  const bubble = btn.closest('.msg-bubble-container')?.querySelector('.msg-bubble');
  if (!bubble) return;
  const text = bubble.innerText;
  JanSetuUI.copyToClipboard(text).then(success => {
    if (success) {
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1800);
    }
  });
}

function parseSimpleMarkdown(text) {
  if (!text) return '';
  let escaped = JanSetuUI.escapeHtml(text);

  // Headers (### Header, ## Header)
  escaped = escaped.replace(/^###\s+(.*?)$/gm, '<h4>$1</h4>');
  escaped = escaped.replace(/^##\s+(.*?)$/gm, '<h3>$1</h3>');

  // Bold (**text**)
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Inline Code (`code`)
  escaped = escaped.replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.06); padding: 1px 4px; border-radius: 3px;">$1</code>');

  // Markdown links ([title](url))
  escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Line by line processing for bullet and numbered lists
  const lines = escaped.split('\n');
  let inList = false;
  let inNumList = false;
  let html = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (inList) { html += '</ul>'; inList = false; }
      if (inNumList) { html += '</ol>'; inNumList = false; }
      continue;
    }

    const bulletMatch = line.match(/^[\*\-]\s+(.*)$/);
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);

    if (bulletMatch) {
      if (inNumList) { html += '</ol>'; inNumList = false; }
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${bulletMatch[1]}</li>`;
    } else if (numMatch) {
      if (inList) { html += '</ul>'; inList = false; }
      if (!inNumList) { html += '<ol>'; inNumList = true; }
      html += `<li>${numMatch[2]}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      if (inNumList) { html += '</ol>'; inNumList = false; }
      if (line.startsWith('<h3>') || line.startsWith('<h4>')) {
        html += line;
      } else {
        html += `<p>${line}</p>`;
      }
    }
  }

  if (inList) html += '</ul>';
  if (inNumList) html += '</ol>';

  return html;
}
