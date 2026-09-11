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
        input.value = query;
        updateCharCount();
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    });
  });

  // Scroll to bottom of initial message
  scrollToBottom();
}

function updateCharCount() {
  const input = document.getElementById('chat-input');
  const counter = document.getElementById('char-count');
  if (input && counter) {
    const len = input.value.length;
    counter.textContent = ${len}/2000;
  }
}

function autoResizeInput(el) {
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
  const message = input.value.trim();

  if (!message) return;

  // Append citizen message to UI
  appendMessage('user', message, 'Citizen');
  conversationHistory.push({ role: 'user', content: message });

  // Clear input
  input.value = '';
  updateCharCount();
  input.style.height = 'auto';

  // Set loading state
  isProcessing = true;
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = <span class="loading-spinner"></span>;
  }

  // Show typing indicator
  const typingId = showTypingIndicator();
  scrollToBottom();

  try {
    const res = await JanSetuAPI.sendChatMessage(message, conversationHistory);
    removeTypingIndicator(typingId);

    if (res && res.reply) {
      appendMessage('assistant', res.reply, 'Jan-Setu Assistant', res.source);
      conversationHistory.push({ role: 'assistant', content: res.reply });
    } else {
      appendMessage(
        'assistant',
        'I am unable to answer this query at the moment. Please refer to our [Services Catalog](/pages/services/) or [Application Tracker](/pages/tracking/).',
        'Jan-Setu Assistant',
        'fallback'
      );
    }
  } catch (err) {
    console.error('Chat submit error:', err);
    removeTypingIndicator(typingId);
    appendMessage(
      'assistant',
      'A network error occurred while connecting to the Jan-Setu AI Service. Please check your connection and try again.',
      'Jan-Setu Assistant',
      'error'
    );
  } finally {
    isProcessing = false;
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = Send;
    }
    scrollToBottom();
    input.focus();
  }
}

function appendMessage(role, text, senderName, source = null) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const row = document.createElement('div');
  row.className = chat-message-row ;

  const formattedContent = parseSimpleMarkdown(text);
  const sourceBadge = source ? <span class="msg-source-badge"></span> : '';

  row.innerHTML = 
    <div class="msg-avatar" title="">
      
    </div>
    <div class="msg-bubble-container">
      <div class="msg-bubble">
        
      </div>
      <div class="msg-meta">
        <span></span>
        
        
      </div>
    </div>
  ;

  container.appendChild(row);
  scrollToBottom();
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return null;

  const id = 	yping-;
  const row = document.createElement('div');
  row.id = id;
  row.className = 'chat-message-row assistant';
  row.innerHTML = 
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
  ;

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
    'Namaste! Welcome to **Jan-Setu Citizen Assistant**.\n\nI can assist you with understanding our unified public services, required documents, tracking your application across departments, and using our simulated Demo Wallet.\n\nHow can I help you today?',
    'Jan-Setu Assistant',
    'knowledge_base'
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

  // Headers (### Header)
  escaped = escaped.replace(/^### (.*?)$/gm, '<h4></h4>');
  escaped = escaped.replace(/^## (.*?)$/gm, '<h3></h3>');

  // Bold (**text**)
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong></strong>');

  // Code (code)
  escaped = escaped.replace(/([^]+)/g, '<code style="background: rgba(0,0,0,0.06); padding: 1px 4px; border-radius: 3px;"></code>');

  // Markdown links ([title](url))
  escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href=""></a>');

  // Bullet items (- item or * item)
  const lines = escaped.split('\n');
  let inList = false;
  let html = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bulletMatch = line.match(/^[\*\-]\s+(.*)$/);
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);

    if (bulletMatch) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += <li></li>;
    } else if (numMatch) {
      if (!inList) {
        html += '<ol>';
        inList = true;
      }
      html += <li></li>;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      if (line.trim().length > 0) {
        if (line.startsWith('<h3>') || line.startsWith('<h4>')) {
          html += line;
        } else {
          html += <p></p>;
        }
      }
    }
  }

  if (inList) {
    html += '</ul>';
  }

  return html;
}
