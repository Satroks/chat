// Chat Widget Script - Wersja z dodanym wskaźnikiem pisania
(function() {
    // Create and inject styles
    const styles = `
        /* --- Podstawowe style widgetu --- */
        .n8n-chat-widget {
            --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        .n8n-chat-widget .chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: none;
            width: 380px;
            height: 600px;
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
            border: 1px solid rgba(133, 79, 255, 0.2);
            overflow: hidden;
            font-family: inherit;
            flex-direction: column; /* Dodane dla pewności */
        }
        .n8n-chat-widget .chat-container.position-left {
            right: auto;
            left: 20px;
        }
        .n8n-chat-widget .chat-container.open {
            display: flex;
            /* flex-direction: column; Usunięte - już jest w .chat-container */
        }
        .n8n-chat-widget .brand-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(133, 79, 255, 0.1);
            position: relative;
            flex-shrink: 0; /* Dodane */
        }
        .n8n-chat-widget .close-button {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--chat--color-font);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s, opacity 0.2s; /* Dodano opacity */
            font-size: 20px;
            opacity: 0.6;
        }
        .n8n-chat-widget .close-button:hover {
            opacity: 1;
        }
        .n8n-chat-widget .brand-header img {
            width: 32px;
            height: 32px;
            border-radius: 4px; /* Dodane */
        }
        .n8n-chat-widget .brand-header span {
            font-size: 18px;
            font-weight: 500;
            color: var(--chat--color-font);
        }
        .n8n-chat-widget .new-conversation {
            /* Usunięto absolute positioning - będzie zarządzane przez JS */
            display: flex; /* Zmienione na flex dla łatwiejszego centrowania */
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100%;
            padding: 20px;
            text-align: center;
        }
        /* Dodano kontener dla treści powitalnej, aby nagłówek mógł być na górze */
         .n8n-chat-widget .new-conversation-content {
             max-width: 300px;
         }
        .n8n-chat-widget .welcome-text {
            font-size: 24px;
            font-weight: 600;
            color: var(--chat--color-font);
            margin-bottom: 24px;
            line-height: 1.3;
        }
        .n8n-chat-widget .new-chat-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 16px 24px;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: transform 0.3s;
            font-weight: 500;
            font-family: inherit;
            margin-bottom: 12px;
        }
        .n8n-chat-widget .new-chat-btn:hover {
            transform: scale(1.02);
        }
        .n8n-chat-widget .message-icon {
            width: 20px;
            height: 20px;
        }
        .n8n-chat-widget .response-text {
            font-size: 14px;
            color: var(--chat--color-font);
            opacity: 0.7;
            margin: 0;
        }
        .n8n-chat-widget .chat-interface {
            display: none; /* Domyślnie ukryty */
            flex-direction: column;
            height: 100%;
        }
        .n8n-chat-widget .chat-interface.active {
            display: flex; /* Pokazuje interfejs czatu */
        }
        .n8n-chat-widget .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: var(--chat--color-background);
            display: flex;
            flex-direction: column;
        }
        .n8n-chat-widget .chat-message {
            padding: 12px 16px;
            margin: 8px 0;
            border-radius: 12px;
            max-width: 80%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.5;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* Dodane */
        }
        .n8n-chat-widget .chat-message.user {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            align-self: flex-end;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2);
            border: none;
        }
        .n8n-chat-widget .chat-message.bot {
            background: var(--chat--color-background);
            border: 1px solid rgba(133, 79, 255, 0.2);
            color: var(--chat--color-font);
            align-self: flex-start;
            /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); Usunięte - jest w .chat-message */
        }
        /* --- Wskaźnik pisania --- */
        .n8n-chat-widget .typing-indicator {
            width: 42px;
            height: 18px;
            background: var(--chat--color-background);
            border: 1px solid rgba(133, 79, 255, .2);
            border-radius: 12px;
            padding: 4px 6px;
            display: flex;
            gap: 4px;
            align-items: center;
            justify-content: center;
            margin: 8px 0;
            align-self: flex-start; /* Wyrównanie jak wiadomość bota */
        }
        .n8n-chat-widget .typing-indicator span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--chat--color-font);
            opacity: .4;
            animation: blink 1.4s infinite both;
        }
        .n8n-chat-widget .typing-indicator span:nth-child(2) { animation-delay: .2s; }
        .n8n-chat-widget .typing-indicator span:nth-child(3) { animation-delay: .4s; }
        @keyframes blink { 0%, 80%, 100% { opacity: .4; } 40% { opacity: 1; } }

        .n8n-chat-widget .chat-input {
            padding: 16px;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
            display: flex;
            gap: 8px;
            flex-shrink: 0; /* Dodane */
        }
        .n8n-chat-widget .chat-input textarea {
            flex: 1;
            padding: 12px;
            border: 1px solid rgba(133, 79, 255, 0.2);
            border-radius: 8px;
            background: var(--chat--color-background);
            color: var(--chat--color-font);
            resize: none;
            font-family: inherit;
            font-size: 14px;
            min-height: 40px; /* Dodane */
            max-height: 100px; /* Dodane */
            overflow-y: auto; /* Dodane */
        }
        .n8n-chat-widget .chat-input textarea::placeholder {
            color: var(--chat--color-font);
            opacity: 0.6;
        }
        .n8n-chat-widget .chat-input button {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0 20px;
            cursor: pointer;
            transition: transform 0.2s;
            font-family: inherit;
            font-weight: 500;
            align-self: flex-end; /* Dodane */
        }
        .n8n-chat-widget .chat-input button:hover {
            transform: scale(1.05);
        }
        .n8n-chat-widget .chat-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3);
            z-index: 999;
            transition: transform 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .n8n-chat-widget .chat-toggle.position-left {
            right: auto;
            left: 20px;
        }
        .n8n-chat-widget .chat-toggle:hover {
            transform: scale(1.05);
        }
        .n8n-chat-widget .chat-toggle svg {
            width: 24px;
            height: 24px;
            fill: currentColor;
        }
        .n8n-chat-widget .chat-footer {
            padding: 8px;
            text-align: center;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
            flex-shrink: 0; /* Dodane */
        }
        .n8n-chat-widget .chat-footer a {
            color: var(--chat--color-primary);
            text-decoration: none;
            font-size: 12px;
            opacity: 0.8;
            transition: opacity 0.2s;
            font-family: inherit;
        }
        .n8n-chat-widget .chat-footer a:hover {
            opacity: 1;
        }
    `;

    // Load Geist font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // --- Default Configuration (nieco ulepszona wersja) ---
     const defaultConfig = {
        webhook: {
            url: '', // Użytkownik MUSI to podać
            route: ''
        },
        branding: {
            logo: 'https://via.placeholder.com/32x32/854fff/ffffff?text=C', // Domyślne logo
            name: 'Chatbot',
            welcomeText: 'Cześć! Jak mogę Ci dzisiaj pomóc?',
            responseTimeText: 'Zwykle odpowiadamy w ciągu kilku minut.',
            poweredBy: {
                text: 'Powered by n8n', // Zmieniono domyślny tekst
                link: 'https://n8n.io' // Zmieniono domyślny link
            }
        },
        style: {
            primaryColor: '#854fff', // Domyślne kolory
            secondaryColor: '#6b3fd4',
            position: 'right',
            backgroundColor: '#ffffff',
            fontColor: '#333333'
        }
    };

    // --- Merge User Config with Defaults (proste łączenie) ---
    const userConfig = window.ChatWidgetConfig || {};
    const config = {
        webhook: { ...defaultConfig.webhook, ...(userConfig.webhook || {}) },
        branding: { ...defaultConfig.branding, ...(userConfig.branding || {}) },
        style: { ...defaultConfig.style, ...(userConfig.style || {}) }
    };
     // Ustawienie domyślnego poweredBy jeśli nie zostało nadpisane
     config.branding.poweredBy = userConfig.branding?.poweredBy ?? defaultConfig.branding.poweredBy;


    // Prevent multiple initializations
    if (window.N8NChatWidgetInitialized) {
        console.warn("Chat widget already initialized.");
        return;
    }
    window.N8NChatWidgetInitialized = true;

    // Sprawdzenie czy URL webhooka jest podany
    if (!config.webhook.url) {
        console.error("Chat Widget Error: Webhook URL is not configured (window.ChatWidgetConfig.webhook.url)");
        return; // Zatrzymanie inicjalizacji
    }

    let currentSessionId = '';

    // --- Create Widget Container ---
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';

    // Set CSS variables for colors
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

    // --- Create Chat Container ---
    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;

    // --- Build HTML Structure using innerHTML (jak w oryginale) ---
    // Zmodyfikowano strukturę, aby oddzielić widok powitalny od interfejsu czatu
    const initialHTML = `
        <div class="new-conversation"> <div class="brand-header">
                ${config.branding.logo ? `<img src="${config.branding.logo}" alt="${config.branding.name} Logo">` : ''}
                <span>${config.branding.name}</span>
                <button type="button" class="close-button" aria-label="Zamknij czat">×</button>
            </div>
            <div class="new-conversation-content">
                <h2 class="welcome-text">${config.branding.welcomeText}</h2>
                <button type="button" class="new-chat-btn">
                    <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
                    </svg>
                    Wyślij nam wiadomość
                </button>
                <p class="response-text">${config.branding.responseTimeText}</p>
            </div>
        </div>
        <div class="chat-interface"> <div class="brand-header">
                ${config.branding.logo ? `<img src="${config.branding.logo}" alt="${config.branding.name} Logo">` : ''}
                <span>${config.branding.name}</span>
                <button type="button" class="close-button" aria-label="Zamknij czat">×</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="Wpisz wiadomość..." rows="1" aria-label="Pole tekstowe wiadomości"></textarea>
                <button type="submit" aria-label="Wyślij wiadomość">Wyślij</button>
            </div>
            <div class="chat-footer">
                <a href="${config.branding.poweredBy.link}" target="_blank" rel="noopener noreferrer">${config.branding.poweredBy.text}</a>
            </div>
        </div>
    `;
    chatContainer.innerHTML = initialHTML;

    // --- Create Toggle Button ---
    const toggleButton = document.createElement('button');
    toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
    toggleButton.setAttribute('type', 'button');
    toggleButton.setAttribute('aria-label', 'Otwórz czat');
    toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>`;

    // --- Append elements to the DOM ---
    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    // --- Get Element References (PO dodaniu do DOM) ---
    const newConversationView = chatContainer.querySelector('.new-conversation');
    const chatInterfaceView = chatContainer.querySelector('.chat-interface');
    const newChatBtn = newConversationView.querySelector('.new-chat-btn');
    const messagesContainer = chatInterfaceView.querySelector('.chat-messages');
    const textarea = chatInterfaceView.querySelector('textarea');
    const sendButton = chatInterfaceView.querySelector('button[type="submit"]');
    const closeButtons = chatContainer.querySelectorAll('.close-button');

    // --- Utility Functions ---
    function generateUUID() {
         // Użyj crypto jeśli dostępne, prosty fallback inaczej
        if (crypto && crypto.randomUUID) {
            return crypto.randomUUID();
        } else {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    }

    // *** NOWA FUNKCJA: Pokazywanie wskaźnika pisania ***
    function showTypingIndicator() {
        // Usuń poprzedni wskaźnik, jeśli istnieje
        const existingIndicator = messagesContainer.querySelector('.typing-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const el = document.createElement('div');
        el.className = 'typing-indicator';
        el.innerHTML = '<span></span><span></span><span></span>';
        el.setAttribute('aria-live', 'polite');
        el.setAttribute('aria-label', 'Bot pisze...');
        messagesContainer.appendChild(el);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Przewiń na dół
        return el; // Zwróć element, aby można go było usunąć
    }

    // *** NOWA FUNKCJA: Dodawanie wiadomości (dla uproszczenia) ***
     function addMessageToUI(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`; // 'user' lub 'bot'
        messageDiv.textContent = text; // Bezpieczniejsze niż innerHTML
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Przewiń na dół
    }

    // --- Core API Functions ---
    async function startNewConversation() {
        currentSessionId = generateUUID();
        console.log("Starting new conversation, Session ID:", currentSessionId);

        // Przełącz widoki
        newConversationView.style.display = 'none';
        chatInterfaceView.classList.add('active'); // Użyjemy klasy do pokazania interfejsu
        textarea.focus();

        // *** POKAŻ WSKAŹNIK PISANIA ***
        const typingEl = showTypingIndicator();

        const requestData = { // Zmieniono na obiekt zamiast tablicy
            action: "loadPreviousSession",
            sessionId: currentSessionId,
            route: config.webhook.route,
            metadata: {
                userId: "",
                url: window.location.href // Dodano URL strony
            }
        };

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

             // *** USUŃ WSKAŹNIK PISANIA ***
             typingEl.remove();

            if (!response.ok) {
                console.error('Error starting conversation - Server responded with status:', response.status);
                // Można dodać komunikat błędu w UI
                 addMessageToUI(`Błąd: ${response.status}`, 'bot'); // Prosty komunikat błędu
                return;
            }

            const responseData = await response.json();

            // Przetwarzanie odpowiedzi (podobne jak w oryginale, ale bardziej odporne)
            let botMessage = "Witaj! Jak mogę pomóc?"; // Domyślna wiadomość
             if (responseData) {
                 // Sprawdź różne możliwe struktury odpowiedzi
                 if (responseData.output) {
                     botMessage = Array.isArray(responseData.output) ? responseData.output.join('\n') : responseData.output;
                 } else if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
                     botMessage = responseData[0].output;
                 } else {
                      console.warn("Received unexpected response structure:", responseData);
                 }
             }

            addMessageToUI(botMessage, 'bot');

        } catch (error) {
             // *** USUŃ WSKAŹNIK PISANIA (w razie błędu sieciowego) ***
             if(typingEl && typingEl.parentNode) { // Sprawdź czy element wciąż istnieje
                 typingEl.remove();
             }
            console.error('Error starting conversation:', error);
            // Można dodać komunikat błędu w UI
             addMessageToUI('Błąd połączenia. Spróbuj ponownie później.', 'bot');
        }
    }

    async function sendMessage(message) {
        // Dodaj wiadomość użytkownika do UI od razu
        addMessageToUI(message, 'user');
        textarea.value = ''; // Wyczyść pole tekstowe
        textarea.style.height = 'auto'; // Zresetuj wysokość textarea
        textarea.focus();

        // *** POKAŻ WSKAŹNIK PISANIA ***
        const typingEl = showTypingIndicator();

        const messageData = {
            action: "sendMessage",
            sessionId: currentSessionId,
            route: config.webhook.route,
            chatInput: message,
            metadata: {
                userId: "",
                url: window.location.href // Dodano URL strony
            }
        };

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });

            // *** USUŃ WSKAŹNIK PISANIA ***
            typingEl.remove();

            if (!response.ok) {
                console.error('Error sending message - Server responded with status:', response.status);
                 addMessageToUI(`Błąd wysyłania: ${response.status}`, 'bot');
                return;
            }

            const responseData = await response.json();

            // Przetwarzanie odpowiedzi bota
            let botMessage = "Przepraszam, nie zrozumiałem."; // Domyślna odpowiedź
            if (responseData) {
                 if (responseData.output) {
                     botMessage = Array.isArray(responseData.output) ? responseData.output.join('\n') : responseData.output;
                 } else if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
                     botMessage = responseData[0].output;
                 } else {
                      console.warn("Received unexpected response structure:", responseData);
                 }
             }

            addMessageToUI(botMessage, 'bot');

        } catch (error) {
            // *** USUŃ WSKAŹNIK PISANIA (w razie błędu sieciowego) ***
             if(typingEl && typingEl.parentNode) {
                 typingEl.remove();
             }
            console.error('Error sending message:', error);
             addMessageToUI('Błąd połączenia podczas wysyłania.', 'bot');
        }
    }

    // --- Event Listeners ---
    newChatBtn.addEventListener('click', startNewConversation);

    sendButton.addEventListener('click', () => {
        const message = textarea.value.trim();
        if (message) {
            sendMessage(message);
            // Czyszczenie textarea przeniesione do sendMessage
        }
    });

    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = textarea.value.trim();
            if (message) {
                sendMessage(message);
                 // Czyszczenie textarea przeniesione do sendMessage
            }
        }
    });

     // Automatyczne dostosowanie wysokości textarea
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    });

    toggleButton.addEventListener('click', () => {
        const isOpen = chatContainer.classList.toggle('open');
         toggleButton.setAttribute('aria-label', isOpen ? 'Zamknij czat' : 'Otwórz czat');
         if (isOpen) {
             // Ustaw fokus na odpowiednim elemencie po otwarciu
             if (chatInterfaceView.classList.contains('active')) {
                 textarea.focus();
             } else {
                 newChatBtn.focus();
             }
         }
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            chatContainer.classList.remove('open');
            toggleButton.setAttribute('aria-label', 'Otwórz czat');
        });
    });

    console.log("N8N Chat Widget (with Typing Indicator) Initialized");

})();
