// Chat Widget Script
(function() {
    // Create and inject styles
    const styles = `
        /* ... CAŁY ORYGINALNY BLOK CSS ... */
        /* Upewnij się, że jest tu cały blok CSS z oryginalnego kodu */

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
        }

        .n8n-chat-widget .chat-container.position-left {
            right: auto;
            left: 20px;
        }

        .n8n-chat-widget .chat-container.open {
            display: flex;
            flex-direction: column;
        }

        /* Styl dla obu nagłówków */
        .n8n-chat-widget .brand-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(133, 79, 255, 0.1);
            position: relative;
            flex-shrink: 0; /* Zapobiega kurczeniu się nagłówka */
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
            transition: color 0.2s;
            font-size: 20px;
            opacity: 0.6;
        }

        .n8n-chat-widget .close-button:hover {
            opacity: 1;
        }

        .n8n-chat-widget .brand-header img {
            width: 32px;
            height: 32px;
        }

        .n8n-chat-widget .brand-header span {
            font-size: 18px;
            font-weight: 500;
            color: var(--chat--color-font);
        }

        /* Kontener dla ekranu powitalnego */
        .n8n-chat-widget .welcome-container {
             /* Ten kontener będzie ukrywany/pokazywany */
             flex-grow: 1; /* Zajmuje dostępną przestrzeń */
             display: flex; /* Umożliwia wyśrodkowanie */
             align-items: center; /* Wyśrodkowanie w pionie */
             justify-content: center; /* Wyśrodkowanie w poziomie */
             position: relative; /* Dla pozycjonowania .new-conversation */
        }

        .n8n-chat-widget .new-conversation {
            /* Usunięto position: absolute */
            padding: 20px;
            text-align: center;
            width: 100%;
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

        /* Kontener interfejsu czatu */
        .n8n-chat-widget .chat-interface {
            display: none; /* Ukryty domyślnie */
            flex-direction: column;
            height: 100%; /* Zajmuje całą wysokość .chat-container */
            width: 100%; /* Zajmuje całą szerokość .chat-container */
            position: absolute; /* Pozycjonowany absolutnie wewnątrz .chat-container */
            top: 0;
            left: 0;
            background: var(--chat--color-background); /* Tło na wypadek prześwitywania */
        }

        .n8n-chat-widget .chat-interface.active {
            display: flex; /* Pokazywany gdy aktywny */
        }

        .n8n-chat-widget .chat-messages {
            flex: 1; /* Rozciąga się, zajmując dostępną przestrzeń */
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
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .n8n-chat-widget .chat-message.system-warning {
            text-align: center;
            font-style: italic;
            font-size: 12px;
            color: grey;
            padding: 10px 0;
            margin: 5px 0;
            background: none;
            border: none;
            box-shadow: none;
            max-width: 100%;
            align-self: center;
        }

        .n8n-chat-widget .chat-input {
            padding: 16px;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
            display: flex;
            gap: 8px;
            flex-shrink: 0; /* Zapobiega kurczeniu się */
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
            max-height: 100px; /* Ograniczenie wysokości pola tekstowego */
            overflow-y: auto; /* Pasek przewijania, gdy tekst jest dłuższy */
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
            align-self: flex-end; /* Wyrównaj przycisk do dołu, jeśli textarea rośnie */
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
            flex-shrink: 0; /* Zapobiega kurczeniu się */
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

    // Default configuration
    const defaultConfig = {
        webhook: { url: '', route: '' },
        branding: { logo: '', name: '', welcomeText: '', responseTimeText: '', poweredBy: { text: 'Powered by VISIO', link: 'https://getvisio.digital' } },
        style: { primaryColor: '', secondaryColor: '', position: 'right', backgroundColor: '#ffffff', fontColor: '#333333' }
    };

    // Merge user config with defaults
    const config = window.ChatWidgetConfig ?
        {
            webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
            branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
            style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style }
        } : defaultConfig;

    // Prevent multiple initializations
    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    let currentSessionId = '';

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';

    // Set CSS variables for colors
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;

    // Zmiana struktury HTML dla łatwiejszego ukrywania/pokazywania
    // Nagłówek jest teraz stały, ukrywamy tylko kontener powitalny
    chatContainer.innerHTML = `
        <div class="brand-header">
             <img src="${config.branding.logo}" alt="${config.branding.name}">
             <span>${config.branding.name}</span>
             <button class="close-button">×</button>
        </div>
        <div class="welcome-container"> ${/* Kontener na ekran powitalny */''}
            <div class="new-conversation">
                 <h2 class="welcome-text">${config.branding.welcomeText}</h2>
                 <button class="new-chat-btn">
                     <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                         <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
                     </svg>
                     Send us a message
                 </button>
                 <p class="response-text">${config.branding.responseTimeText}</p>
            </div>
        </div>
        <div class="chat-interface"> ${/* Interfejs czatu - początkowo ukryty */''}
            ${/* Nagłówek nie jest już potrzebny wewnątrz .chat-interface */''}
             <div class="chat-messages"></div>
             <div class="chat-input">
                 <textarea placeholder="Type your message here..." rows="1"></textarea>
                 <button type="submit">Send</button>
             </div>
             <div class="chat-footer">
                 <a href="${config.branding.poweredBy.link}" target="_blank">${config.branding.poweredBy.text}</a>
             </div>
        </div>
    `;

    const toggleButton = document.createElement('button');
    toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
    toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>`;

    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    // Selektory elementów
    const welcomeContainer = chatContainer.querySelector('.welcome-container'); // Nowy selektor
    const newChatBtn = chatContainer.querySelector('.new-chat-btn');
    const chatInterface = chatContainer.querySelector('.chat-interface');
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]');
    const closeButtons = chatContainer.querySelectorAll('.close-button'); // Teraz tylko jeden przycisk X

    // --- Logika timera bezczynności (bez zmian) ---
    let inactivityTimer = null;
    let warningTimer = null;
    const inactivityTimeoutDuration = 60000; // 60 sekund w ms
    const warningTimeoutBeforeClose = 10000; // 10 sekund w ms
    const warningTimeoutDuration = inactivityTimeoutDuration - warningTimeoutBeforeClose; // 50 sekund
    const norwegianWarningMessage = "Vinduet lukkes om 10 sekunder på grunn av inaktivitet.";
    const warningMessageClass = 'system-warning';

    function removeWarningMessage() {
        const existingWarning = messagesContainer.querySelector(`.chat-message.${warningMessageClass}`);
        if (existingWarning) { existingWarning.remove(); }
    }
    function showInactivityWarning() {
        removeWarningMessage();
        const warningDiv = document.createElement('div');
        warningDiv.className = `chat-message ${warningMessageClass}`;
        warningDiv.textContent = norwegianWarningMessage;
        messagesContainer.appendChild(warningDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    function closeChatWindow() {
        if (chatContainer.classList.contains('open')) {
             chatContainer.classList.remove('open');
             stopInactivityTimer();
        }
    }
    function stopInactivityTimer() {
        clearTimeout(warningTimer); clearTimeout(inactivityTimer);
        warningTimer = null; inactivityTimer = null;
        removeWarningMessage();
    }
    function resetInactivityTimer() {
        stopInactivityTimer();
        if (chatContainer.classList.contains('open')) {
            try {
                warningTimer = setTimeout(showInactivityWarning, warningTimeoutDuration);
                inactivityTimer = setTimeout(closeChatWindow, inactivityTimeoutDuration);
            } catch(e) { console.error("Błąd podczas ustawiania timerów bezczynności:", e); }
        }
    }
    // --- Koniec Logiki timera bezczynności ---

    function generateUUID() { return crypto.randomUUID(); }

    // --- Poprawiona funkcja startNewConversation ---
    async function startNewConversation() {
        console.log("startNewConversation called"); // Log testowy
        currentSessionId = generateUUID();
        const data = [{
            action: "loadPreviousSession", sessionId: currentSessionId,
            route: config.webhook.route, metadata: { userId: "" }
        }];

        // Pokaż jakiś wskaźnik ładowania (opcjonalne)
        newChatBtn.disabled = true;
        newChatBtn.textContent = 'Łączenie...';

        try {
            console.log("Wysyłanie żądania do:", config.webhook.url); // Log URL
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            console.log("Odpowiedź status:", response.status); // Log statusu

            if (!response.ok) {
                 // Zaloguj treść błędu, jeśli serwer ją zwrócił
                let errorBody = 'Brak treści błędu';
                try { errorBody = await response.text(); } catch(e){}
                console.error("Błąd odpowiedzi serwera:", response.status, errorBody);
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
            }

            const responseData = await response.json();
            console.log("Otrzymano odpowiedź:", responseData); // Log odpowiedzi

            // Ukryj kontener powitalny i pokaż interfejs czatu
            if (welcomeContainer) {
                welcomeContainer.style.display = 'none';
            } else {
                console.error("Nie znaleziono welcomeContainer do ukrycia!");
            }
            if (chatInterface) {
                 chatInterface.classList.add('active');
            } else {
                console.error("Nie znaleziono chatInterface do aktywacji!");
            }


            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            // Sprawdzanie odpowiedzi (bez zmian)
            if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
                botMessageDiv.textContent = responseData[0].output;
            } else if (responseData.output) {
                botMessageDiv.textContent = responseData.output;
            } else {
                console.warn("Nieoczekiwany format odpowiedzi przy starcie:", responseData);
                botMessageDiv.textContent = "Witaj! W czym mogę pomóc?";
            }
            messagesContainer.innerHTML = ''; // Wyczyść ewentualne poprzednie wiadomości
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            resetInactivityTimer(); // Resetuj timer po udanym rozpoczęciu
            setTimeout(() => textarea.focus(), 0); // Ustaw fokus na textarea

        } catch (error) {
            console.error('Błąd krytyczny podczas rozpoczynania nowej konwersacji:', error);
            // Poinformuj użytkownika o błędzie w bardziej widoczny sposób
             const errorTextElement = chatContainer.querySelector('.response-text');
             if(errorTextElement) {
                 errorTextElement.textContent = "Błąd połączenia. Spróbuj ponownie później.";
                 errorTextElement.style.color = "red";
             }
             // Przywróć przycisk do stanu początkowego
             newChatBtn.disabled = false;
             newChatBtn.innerHTML = `
                 <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                     <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
                 </svg>
                 Send us a message`;
        }
    }

    // --- Funkcja sendMessage (bez większych zmian, poza usuniętym resetem timera) ---
    async function sendMessage(message) {
        if (!currentSessionId) { console.error("Brak ID sesji."); return; }
        const messageData = {
            action: "sendMessage", sessionId: currentSessionId,
            route: config.webhook.route, chatInput: message, metadata: { userId: "" }
        };

        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-message user';
        userMessageDiv.textContent = message;
        messagesContainer.appendChild(userMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        resetInactivityTimer(); // Resetuj timer przy wysyłaniu

        try {
            textarea.disabled = true; sendButton.disabled = true;
            const response = await fetch(config.webhook.url, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            if (Array.isArray(data) && data.length > 0 && data[0].output) {
                 botMessageDiv.textContent = data[0].output;
             } else if (data.output) {
                 botMessageDiv.textContent = data.output;
             } else {
                 console.warn("Nieoczekiwany format odpowiedzi:", data);
                 botMessageDiv.textContent = "Przepraszamy, błąd odpowiedzi.";
             }
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            // USUNIĘTO resetInactivityTimer() stąd
        } catch (error) {
            console.error('Błąd podczas wysyłania wiadomości:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'chat-message bot';
            errorDiv.textContent = "Nie udało się wysłać wiadomości.";
            errorDiv.style.color = 'red';
            messagesContainer.appendChild(errorDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } finally {
            textarea.disabled = false; sendButton.disabled = false;
            textarea.focus();
        }
    }

    // --- Event Listenery (niewielkie zmiany dla nowej struktury HTML) ---
    newChatBtn.addEventListener('click', startNewConversation);

    sendButton.addEventListener('click', () => {
        const message = textarea.value.trim();
        if (message && !sendButton.disabled) {
            sendMessage(message); textarea.value = ''; textarea.style.height = 'auto';
        }
    });

    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = textarea.value.trim();
            if (message && !sendButton.disabled) {
                sendMessage(message); textarea.value = ''; textarea.style.height = 'auto';
            }
        }
    });

    textarea.addEventListener('input', () => {
        resetInactivityTimer();
        // Dopasowanie wysokości textarea
        textarea.style.height = 'auto'; // Zresetuj wysokość
        const maxHeight = 100; // Maksymalna wysokość z CSS
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`; // Ustaw wysokość, ale nie więcej niż max
    });

    toggleButton.addEventListener('click', () => {
        const isOpen = chatContainer.classList.contains('open');
        chatContainer.classList.toggle('open');
        if (!isOpen) {
            resetInactivityTimer();
             // Jeśli interfejs czatu jest aktywny (nie ekran powitalny), ustaw fokus
             if(chatInterface.classList.contains('active')) {
                 setTimeout(() => textarea.focus(), 0);
             }
        } else {
            stopInactivityTimer();
        }
    });

    // Przycisk zamykania jest teraz tylko jeden w głównym .brand-header
    closeButtons.forEach(button => { // Mimo że jest jeden, pętla nie zaszkodzi
         button.addEventListener('click', () => {
             closeChatWindow();
         });
    });

})(); // Koniec IIFE
