// Chat Widget Script with idle‑close + typing indicator
(function() {
    // ==========================
    // 1. GLOBALS & CONFIGS
    // ==========================
    let idleTimer = null;           // ➊ auto‑close timer
    const IDLE_LIMIT = 60_000;      // 60 s
    let currentSessionId = "";      // existing variable (moved up for clarity)

    // Helper => restart the idle timer whenever user/bot aktywność
    function resetIdleTimer() {
        clearTimeout(idleTimer);
        if (chatContainer && chatContainer.classList.contains("open")) {
            idleTimer = setTimeout(() => {
                chatContainer.classList.remove("open");
            }, IDLE_LIMIT);
        }
    }

    // ==========================
    // 2. STYLES (CSS)
    // ==========================
    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        /* …———‑‑‑‑‑‑‑‑ existing styles cut for brevity ———… */

        /* === BOT TYPING INDICATOR ================================== */
        .n8n-chat-widget .typing-indicator{
            width:42px;height:18px;
            background:var(--chat--color-background);
            border:1px solid rgba(133,79,255,.2);
            border-radius:12px;padding:4px 6px;
            display:flex;gap:4px;align-items:center;justify-content:center;
            margin:8px 0;
        }
        .n8n-chat-widget .typing-indicator span{
            width:6px;height:6px;border-radius:50%;
            background:var(--chat--color-font);opacity:.4;
            animation:blink 1.4s infinite both;
        }
        .n8n-chat-widget .typing-indicator span:nth-child(2){animation-delay:.2s;}
        .n8n-chat-widget .typing-indicator span:nth-child(3){animation-delay:.4s;}
        @keyframes blink{0%,80%,100%{opacity:.4;}40%{opacity:1;}}
    `;

    // ==========================
    // 3. FONT LOAD & STYLE INJECTION
    // ==========================
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = "https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css";
    document.head.appendChild(fontLink);

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // ==========================
    // 4. DEFAULT CONFIG + MERGE WITH USER CONFIG
    // ==========================
    const defaultConfig = {
        webhook: { url: "", route: "" },
        branding: {
            logo: "",
            name: "",
            welcomeText: "",
            responseTimeText: "",
            poweredBy: { text: "Powered by VISIO", link: "https://getvisio.digital" }
        },
        style: {
            primaryColor: "",
            secondaryColor: "",
            position: "right",
            backgroundColor: "#ffffff",
            fontColor: "#333333"
        }
    };

    const config = window.ChatWidgetConfig ? {
        webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
        branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
        style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style }
    } : defaultConfig;

    if (window.N8NChatWidgetInitialized) return; // prevent duplicates
    window.N8NChatWidgetInitialized = true;

    // ==========================
    // 5. DOM STRUCTURE (unchanged apart from variable hoist)
    // ==========================
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "n8n-chat-widget";
    // set CSS vars
    widgetContainer.style.setProperty("--n8n-chat-primary-color", config.style.primaryColor);
    widgetContainer.style.setProperty("--n8n-chat-secondary-color", config.style.secondaryColor);
    widgetContainer.style.setProperty("--n8n-chat-background-color", config.style.backgroundColor);
    widgetContainer.style.setProperty("--n8n-chat-font-color", config.style.fontColor);

    const chatContainer = document.createElement("div");
    chatContainer.className = `chat-container${config.style.position === "left" ? " position-left" : ""}`;

    /* —— existing HTML templates (brand header, welcome screen, chat interface) —— */
    const newConversationHTML = `
        <div class="brand-header">
            <img src="${config.branding.logo}" alt="${config.branding.name}">
            <span>${config.branding.name}</span>
            <button class="close-button">×</button>
        </div>
        <div class="new-conversation">
            <h2 class="welcome-text">${config.branding.welcomeText}</h2>
            <button class="new-chat-btn">
                <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>
                Send us a message
            </button>
            <p class="response-text">${config.branding.responseTimeText}</p>
        </div>`;

    const chatInterfaceHTML = `
        <div class="chat-interface">
            <div class="brand-header">
                <img src="${config.branding.logo}" alt="${config.branding.name}">
                <span>${config.branding.name}</span>
                <button class="close-button">×</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="Type your message here..." rows="1"></textarea>
                <button type="submit">Send</button>
            </div>
            <div class="chat-footer">
                <a href="${config.branding.poweredBy.link}" target="_blank">${config.branding.poweredBy.text}</a>
            </div>
        </div>`;

    chatContainer.innerHTML = newConversationHTML + chatInterfaceHTML;

    const toggleButton = document.createElement("button");
    toggleButton.className = `chat-toggle${config.style.position === "left" ? " position-left" : ""}`;
    toggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>`;

    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    // ==========================
    // 6. ELEMENT REFERENCES
    // ==========================
    const newChatBtn = chatContainer.querySelector('.new-chat-btn');
    const chatInterface = chatContainer.querySelector('.chat-interface');
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]');

    // ==========================
    // 7. UTILITIES
    // ==========================
    function generateUUID() { return crypto.randomUUID(); }

    // Typing indicator utility ➋
    function showTyping() {
        const el = document.createElement('div');
        el.className = 'typing-indicator';
        el.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(el);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return el; // return element for later removal
    }

    // ==========================
    // 8. CORE FUNCTIONS
    // ==========================
    async function startNewConversation() {
        currentSessionId = generateUUID();
        const data = [{
            action: 'loadPreviousSession',
            sessionId: currentSessionId,
            route: config.webhook.route,
            metadata: { userId: '' }
        }];

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const responseData = await response.json();

            chatContainer.querySelector('.brand-header').style.display = 'none';
            chatContainer.querySelector('.new-conversation').style.display = 'none';
            chatInterface.classList.add('active');

            const botDiv = document.createElement('div');
            botDiv.className = 'chat-message bot';
            botDiv.textContent = Array.isArray(responseData) ? responseData[0].output : responseData.output;
            messagesContainer.appendChild(botDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            resetIdleTimer(); // ➊ timer
        } catch (err) { console.error('Error:', err); }
    }

    async function sendMessage(message) {
        const payload = {
            action: 'sendMessage',
            sessionId: currentSessionId,
            route: config.webhook.route,
            chatInput: message,
            metadata: { userId: '' }
        };

        // user bubble
        const userDiv = document.createElement('div');
        userDiv.className = 'chat-message user';
        userDiv.textContent = message;
        messagesContainer.appendChild(userDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // show typing indicator ➋
        const typingEl = showTyping();

        try {
            const res = await fetch(config.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            typingEl.remove(); // remove indicator ➋
            const botDiv = document.createElement('div');
            botDiv.className = 'chat-message bot';
            botDiv.textContent = Array.isArray(data) ? data[0].output : data.output;
            messagesContainer.appendChild(botDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (err) {
            typingEl.remove();
            console.error('Error:', err);
        }
        resetIdleTimer(); // ➊ timer
    }

    // ==========================
    // 9. EVENT LISTENERS
    // ==========================
    newChatBtn.addEventListener('click', startNewConversation);

    sendButton.addEventListener('click', () => {
        const msg = textarea.value.trim();
        if (msg) {
            sendMessage(msg);
            textarea.value = '';
        }
    });

    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const msg = textarea.value.trim();
            if (msg) {
                sendMessage(msg);
                textarea.value = '';
            }
        }
    });

    toggleButton.addEventListener('click', () => {
        chatContainer.classList.toggle('open');
        resetIdleTimer(); // ➊ timer
    });

    chatContainer.querySelectorAll('.close-button').forEach(btn => {
        btn.addEventListener('click', () => {
            chatContainer.classList.remove('open');
        });
    });
})();
