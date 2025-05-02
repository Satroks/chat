// Chat Widget Script v2 - Zintegrowane funkcje: idle timer, wskaźnik pisania, cooldown, max długość
(function() {
    /* === GLOBAL SETTINGS === */
    const IDLE_LIMIT = 60000; // Auto-zamknięcie po 60 sekundach bezczynności
    const COOLDOWN = 2000; // Minimalny odstęp 2 sekund między wysłanymi wiadomościami
    const MAX_LEN = 500; // Maksymalna długość wiadomości

    let idleTimer = null; // Timer do śledzenia bezczynności
    let lastSendTimestamp = 0; // Czas ostatniego wysłania wiadomości (dla cooldown)
    let currentSessionId = ''; // ID bieżącej sesji czatu

    // Zapobiegaj wielokrotnej inicjalizacji
    if (window.N8NChatWidgetInitialized) {
        console.warn("Chat widget already initialized.");
        return;
    }
    window.N8NChatWidgetInitialized = true;

    /* === CSS === */
    const styles = `
        /* --- Podstawowe style widgetu (takie jak w oryginale) --- */
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
            display: none; /* Ukryty domyślnie, pokazywany przez klasę .open */
            width: 380px;
            height: 600px;
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
            border: 1px solid rgba(133, 79, 255, 0.2);
            overflow: hidden;
            font-family: inherit;
            flex-direction: column; /* Ustawione na stałe, bo .open tylko zmienia display */
        }
        .n8n-chat-widget .chat-container.position-left {
            right: auto;
            left: 20px;
        }
        .n8n-chat-widget .chat-container.open {
            display: flex; /* Pokazuje kontener */
        }
        .n8n-chat-widget .brand-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(133, 79, 255, 0.1);
            position: relative; /* Dla pozycjonowania przycisku zamknięcia */
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
            transition: color 0.2s, opacity 0.2s; /* Dodano opacity do transition */
            font-size: 20px;
            opacity: 0.6;
        }
        .n8n-chat-widget .close-button:hover {
            opacity: 1;
        }
        .n8n-chat-widget .brand-header img {
            width: 32px;
            height: 32px;
            border-radius: 4px; /* Lekkie zaokrąglenie logo */
        }
        .n8n-chat-widget .brand-header span {
            font-size: 18px;
            font-weight: 500;
            color: var(--chat--color-font);
        }

        /* --- Widok nowej konwersacji --- */
        .n8n-chat-widget .new-conversation-view {
             /* Domyślnie widoczny, ukrywany przez JS */
            display: flex;
            flex-direction: column;
            justify-content: center; /* Wyśrodkowanie w pionie */
            align-items: center; /* Wyśrodkowanie w poziomie */
            height: 100%; /* Zajmuje całą dostępną wysokość */
            padding: 20px;
            text-align: center;
            position: relative; /* Potrzebne dla absolutnego pozycjonowania nagłówka */
        }
         /* Nagłówek w widoku nowej konwersacji */
        .n8n-chat-widget .new-conversation-view .brand-header {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            box-sizing: border-box; /* Uwzględnia padding w szerokości */
        }
        .n8n-chat-widget .new-conversation-content {
             /* Kontener na treść powitalną */
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

        /* --- Widok interfejsu czatu --- */
        .n8n-chat-widget .chat-interface-view {
            display: none; /* Domyślnie ukryty, pokazywany przez JS */
            flex-direction: column;
            height: 100%;
        }
        .n8n-chat-widget .chat-interface-view.active {
            display: flex; /* Pokazuje interfejs czatu */
        }
        .n8n-chat-widget .chat-messages {
            flex: 1; /* Zajmuje dostępną przestrzeń */
            overflow-y: auto; /* Scrollowanie dla wiadomości */
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
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* Subtelny cień dla wszystkich wiadomości */
        }
        .n8n-chat-widget .chat-message.user {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            align-self: flex-end; /* Wyrównanie do prawej */
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2);
            border: none;
        }
        .n8n-chat-widget .chat-message.bot {
            background: var(--chat--color-background);
            border: 1px solid rgba(133, 79, 255, 0.2);
            color: var(--chat--color-font);
            align-self: flex-start; /* Wyrównanie do lewej */
            /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); */ /* Usunięto powtórzony cień */
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

        /* --- Input i stopka --- */
        .n8n-chat-widget .chat-input {
            padding: 16px;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
            display: flex;
            gap: 8px;
            flex-shrink: 0; /* Zapobiega kurczeniu się inputa */
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
            min-height: 40px; /* Minimalna wysokość */
            max-height: 100px; /* Maksymalna wysokość przed scrollowaniem */
            overflow-y: auto; /* Scroll wewnątrz textarea */
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
            transition: transform 0.2s, opacity 0.2s;
            font-family: inherit;
            font-weight: 500;
            align-self: flex-end; /* Wyrównanie przycisku do dołu */
        }
        .n8n-chat-widget .chat-input button:hover {
            transform: scale(1.05);
        }
         /* Styl dla nieaktywnego przycisku (cooldown) */
        .n8n-chat-widget .chat-input button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none; /* Wyłącz hover effect */
        }
        .n8n-chat-widget .chat-footer {
            padding: 8px;
            text-align: center;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
            flex-shrink: 0; /* Zapobiega kurczeniu się stopki */
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

        /* --- Przycisk przełączający --- */
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
            z-index: 999; /* Niższy niż kontener czatu */
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
        /* --- Komunikat błędu --- */
        .n8n-chat-widget .error-message {
            background-color: #ffebee; /* Jasnoczerwone tło */
            color: #c62828; /* Ciemnoczerwony tekst */
            padding: 10px 16px;
            margin: 8px 0;
            border-radius: 8px;
            border: 1px solid #ef9a9a; /* Czerwona ramka */
            font-size: 13px;
            align-self: center; /* Wyśrodkowanie */
            max-width: 80%;
            text-align: center;
        }
    `;

    /* === FONT & STYLE INJECTION === */
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);

    /* === CONFIG === */
    // Funkcja do głębokiego łączenia obiektów (prosta wersja)
    function deepMerge(target, source) {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                const targetValue = target[key];
                const sourceValue = source[key];
                if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) && targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
                    deepMerge(targetValue, sourceValue); // Rekurencyjne łączenie dla zagnieżdżonych obiektów
                } else {
                    target[key] = sourceValue; // Nadpisanie wartości
                }
            }
        }
        return target;
    }

    const defaultConfig = {
        webhook: {
            url: '', // WAŻNE: Użytkownik MUSI to podać
            route: '' // Opcjonalne, zależy od konfiguracji webhooka
        },
        branding: {
            logo: 'https://via.placeholder.com/32x32/854fff/ffffff?text=C', // Domyślne logo
            name: 'Chatbot',
            welcomeText: 'Cześć! Jak mogę Ci dzisiaj pomóc?',
            responseTimeText: 'Zwykle odpowiadamy w ciągu kilku minut.',
            poweredBy: {
                text: 'Powered by VISIO',
                link: 'https://getvisio.digital'
            }
        },
        style: {
            primaryColor: '#854fff', // Domyślny kolor główny
            secondaryColor: '#6b3fd4', // Domyślny kolor drugorzędny
            position: 'right', // 'right' lub 'left'
            backgroundColor: '#ffffff',
            fontColor: '#333333'
        }
    };

    // Użyj deepMerge do połączenia konfiguracji
    const userConfig = window.ChatWidgetConfig || {};
    const config = deepMerge(JSON.parse(JSON.stringify(defaultConfig)), userConfig); // Klonowanie defaultConfig przed merge

    // Sprawdzenie czy podano URL webhooka
    if (!config.webhook.url) {
        console.error("Chat Widget Error: Webhook URL is not configured (window.ChatWidgetConfig.webhook.url)");
        // Można dodać wizualny wskaźnik błędu na stronie, jeśli widget nie może działać
        return; // Zatrzymanie inicjalizacji, jeśli URL jest niezbędny
    }


    /* === HTML STRUCTURE === */
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';

    // Ustawienie zmiennych CSS dla kolorów
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

    // Główny kontener czatu (początkowo ukryty)
    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;

    // --- Widok Nowej Konwersacji (New Conversation View) ---
    const newConversationView = document.createElement('div');
    newConversationView.className = 'new-conversation-view';
    newConversationView.innerHTML = `
        <div class="brand-header">
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
    `;

    // --- Widok Interfejsu Czatu (Chat Interface View) ---
    const chatInterfaceView = document.createElement('div');
    chatInterfaceView.className = 'chat-interface-view'; // Domyślnie ukryty (display: none przez CSS)
    chatInterfaceView.innerHTML = `
        <div class="brand-header">
             ${config.branding.logo ? `<img src="${config.branding.logo}" alt="${config.branding.name} Logo">` : ''}
            <span>${config.branding.name}</span>
            <button type="button" class="close-button" aria-label="Zamknij czat">×</button>
        </div>
        <div class="chat-messages">
            </div>
        <div class="chat-input">
            <textarea placeholder="Wpisz wiadomość..." rows="1" aria-label="Pole tekstowe wiadomości"></textarea>
            <button type="submit" aria-label="Wyślij wiadomość">Wyślij</button>
        </div>
        <div class="chat-footer">
            <a href="${config.branding.poweredBy.link}" target="_blank" rel="noopener noreferrer">${config.branding.poweredBy.text}</a>
        </div>
    `;

    // Dodanie widoków do kontenera czatu
    chatContainer.appendChild(newConversationView);
    chatContainer.appendChild(chatInterfaceView);

    // Przycisk przełączający widoczność czatu
    const toggleButton = document.createElement('button');
    toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
    toggleButton.setAttribute('type', 'button');
    toggleButton.setAttribute('aria-label', 'Otwórz czat');
    toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>`;

    // Dodanie kontenera czatu i przycisku przełączającego do głównego kontenera widgetu
    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);

    // Dodanie całego widgetu do body dokumentu
    document.body.appendChild(widgetContainer);

    /* === ELEMENT REFERENCES === */
    // Pobranie referencji do elementów DOM PO ich utworzeniu i dodaniu do dokumentu
    const newChatBtn = newConversationView.querySelector('.new-chat-btn');
    const messagesContainer = chatInterfaceView.querySelector('.chat-messages');
    const textarea = chatInterfaceView.querySelector('textarea');
    const sendButton = chatInterfaceView.querySelector('button[type="submit"]');
    const closeButtons = widgetContainer.querySelectorAll('.close-button'); // Pobranie obu przycisków zamknięcia

    /* === UTILITY FUNCTIONS === */

    // Generowanie UUID (używa crypto jeśli dostępne, fallback dla starszych przeglądarek)
    function generateUUID() {
        if (crypto && crypto.randomUUID) {
            return crypto.randomUUID();
        } else {
            // Prosty fallback (nie jest prawdziwym UUID v4, ale wystarczająco unikalny dla sesji)
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    }

    // Resetowanie timera bezczynności
    function resetIdleTimer() {
        clearTimeout(idleTimer);
        // Uruchom timer tylko jeśli okno czatu jest otwarte
        if (chatContainer.classList.contains('open')) {
            idleTimer = setTimeout(() => {
                console.log("Chat closed due to inactivity.");
                chatContainer.classList.remove('open');
                toggleButton.setAttribute('aria-label', 'Otwórz czat'); // Aktualizacja etykiety ARIA
            }, IDLE_LIMIT);
        }
    }

    // Pokazywanie wskaźnika pisania
    function showTypingIndicator() {
        // Usuń poprzedni wskaźnik, jeśli istnieje
        const existingIndicator = messagesContainer.querySelector('.typing-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const el = document.createElement('div');
        el.className = 'typing-indicator';
        el.innerHTML = '<span></span><span></span><span></span>';
        el.setAttribute('aria-live', 'polite'); // Informuje czytniki ekranu o zmianie
        el.setAttribute('aria-label', 'Bot pisze...');
        messagesContainer.appendChild(el);
        // Przewiń na dół, aby wskaźnik był widoczny
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return el; // Zwróć element, aby można go było później usunąć
    }

     // Dodawanie wiadomości do interfejsu
    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`; // type to 'user' lub 'bot'
        // Proste oczyszczanie tekstu, aby zapobiec wstrzykiwaniu HTML
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        // Przewiń na dół
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Zresetuj timer bezczynności po każdej nowej wiadomości (użytkownika lub bota)
        resetIdleTimer();
    }

     // Dodawanie komunikatu o błędzie do interfejsu
    function addErrorMessage(text) {
        // Usuń poprzednie komunikaty o błędach, aby uniknąć duplikatów
        const existingErrors = messagesContainer.querySelectorAll('.error-message');
        existingErrors.forEach(err => err.remove());

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = text;
        messagesContainer.appendChild(errorDiv);
        // Przewiń na dół
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }


    /* === CORE API FUNCTIONS === */

    // Rozpoczęcie nowej konwersacji
    async function startNewConversation() {
        console.log("Starting new conversation...");
        currentSessionId = generateUUID();
        console.log("Session ID:", currentSessionId);

        // Pokaż interfejs czatu, ukryj widok powitalny
        newConversationView.style.display = 'none';
        chatInterfaceView.classList.add('active');
        textarea.focus(); // Ustaw fokus na polu tekstowym

        // Zresetuj timer bezczynności po rozpoczęciu konwersacji
        resetIdleTimer();

        const typingEl = showTypingIndicator(); // Pokaż wskaźnik pisania od razu

        const requestData = { // Zmieniono strukturę danych zgodnie z przykładem n8n
            sessionId: currentSessionId,
            action: "loadPreviousSession", // Lub inny odpowiedni action
            route: config.webhook.route,
            // Możesz dodać więcej metadanych, jeśli są potrzebne
            metadata: {
                 userId: "", // Można dodać identyfikator użytkownika, jeśli jest dostępny
                 url: window.location.href // Przesłanie URL strony
            }
        };

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData) // Wysyłamy obiekt, nie tablicę
            });

            typingEl.remove(); // Usuń wskaźnik pisania po otrzymaniu odpowiedzi

            if (!response.ok) {
                // Spróbuj odczytać treść błędu z odpowiedzi, jeśli jest dostępna
                let errorText = `Błąd serwera: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorText += ` - ${errorData.message || JSON.stringify(errorData)}`;
                } catch (e) { /* Ignoruj błąd parsowania JSON błędu */ }
                 console.error('Error starting conversation:', errorText);
                addErrorMessage('Przepraszamy, wystąpił błąd podczas rozpoczynania rozmowy.');
                return; // Zakończ funkcję w przypadku błędu
            }

            const responseData = await response.json();

            // Sprawdź, czy odpowiedź zawiera oczekiwane dane
             // Dostosuj logikę do struktury odpowiedzi z Twojego webhooka n8n
            let botMessage = "Witaj! Jak mogę pomóc?"; // Domyślna wiadomość powitalna
            if (responseData && responseData.output) {
                 botMessage = Array.isArray(responseData.output) ? responseData.output.join('\n') : responseData.output;
            } else if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
                 // Obsługa przypadku, gdy odpowiedź jest tablicą
                 botMessage = responseData[0].output;
            } else {
                 console.warn("Received unexpected response structure from webhook:", responseData);
            }

            addMessage(botMessage, 'bot');

        } catch (error) {
            typingEl.remove(); // Usuń wskaźnik pisania również w przypadku błędu sieciowego
            console.error('Network or processing error starting conversation:', error);
            addErrorMessage('Nie można połączyć się z serwerem czatu. Sprawdź połączenie internetowe.');
        }
    }

    // Wysyłanie wiadomości
    async function sendMessage() {
        const message = textarea.value.trim();
        if (!message) return; // Nie wysyłaj pustych wiadomości

        const now = Date.now();

        // Sprawdzenie cooldown
        if (now - lastSendTimestamp < COOLDOWN) {
            console.warn("Cooldown active. Please wait before sending another message.");
            // Można dodać delikatne powiadomienie wizualne, np. potrząśnięcie przyciskiem
            return;
        }

        // Sprawdzenie maksymalnej długości
        if (message.length > MAX_LEN) {
            addErrorMessage(`Wiadomość jest za długa (maksymalnie ${MAX_LEN} znaków).`);
            return;
        }

        lastSendTimestamp = now; // Zaktualizuj czas ostatniego wysłania
        sendButton.disabled = true; // Wyłącz przycisk na czas cooldown

        // Włącz przycisk ponownie po upływie cooldown
        setTimeout(() => {
            sendButton.disabled = false;
        }, COOLDOWN);


        addMessage(message, 'user'); // Dodaj wiadomość użytkownika do UI
        textarea.value = ''; // Wyczyść pole tekstowe
        textarea.style.height = 'auto'; // Zresetuj wysokość textarea
        textarea.focus(); // Utrzymaj fokus

        const typingEl = showTypingIndicator(); // Pokaż wskaźnik pisania

        const requestData = {
            action: "sendMessage",
            sessionId: currentSessionId,
            route: config.webhook.route,
            chatInput: message,
            metadata: {
                 userId: "",
                 url: window.location.href
            }
        };

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData) // Wysyłamy obiekt
            });

            typingEl.remove(); // Usuń wskaźnik pisania

            if (!response.ok) {
                let errorText = `Błąd serwera: ${response.status}`;
                 try { const errorData = await response.json(); errorText += ` - ${errorData.message || JSON.stringify(errorData)}`; } catch (e) {}
                console.error('Error sending message:', errorText);
                addErrorMessage('Nie udało się wysłać wiadomości. Spróbuj ponownie.');
                // Przywróć wiadomość użytkownika do pola tekstowego w razie błędu? (Opcjonalne)
                // textarea.value = message;
                return;
            }

            const responseData = await response.json();

            // Przetwarzanie odpowiedzi bota (dostosuj do struktury odpowiedzi n8n)
            let botMessage = "Przepraszam, nie zrozumiałem."; // Domyślna odpowiedź bota w razie problemu
             if (responseData && responseData.output) {
                 botMessage = Array.isArray(responseData.output) ? responseData.output.join('\n') : responseData.output;
            } else if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
                 botMessage = responseData[0].output;
            } else {
                 console.warn("Received unexpected response structure from webhook:", responseData);
            }

            addMessage(botMessage, 'bot');

        } catch (error) {
            typingEl.remove(); // Usuń wskaźnik pisania w razie błędu sieciowego
            console.error('Network or processing error sending message:', error);
            addErrorMessage('Błąd połączenia podczas wysyłania wiadomości.');
             // Przywróć wiadomość użytkownika do pola tekstowego w razie błędu? (Opcjonalne)
             // textarea.value = message;
        } finally {
             // Upewnij się, że przycisk jest włączony, jeśli cooldown minął przed końcem fetch
             if (Date.now() - lastSendTimestamp >= COOLDOWN) {
                 sendButton.disabled = false;
             }
        }
    }

    /* === EVENT LISTENERS === */

    // Kliknięcie przycisku "Nowa konwersacja"
    newChatBtn.addEventListener('click', startNewConversation);

    // Kliknięcie przycisku "Wyślij"
    sendButton.addEventListener('click', sendMessage);

    // Naciśnięcie Enter w polu tekstowym
    textarea.addEventListener('keypress', (e) => {
        // Wyślij, jeśli naciśnięto Enter bez Shift
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Zapobiegaj dodaniu nowej linii
            sendMessage();
        }
        // Zresetuj timer bezczynności przy każdym naciśnięciu klawisza w textarea
        resetIdleTimer();
    });

     // Automatyczne dostosowanie wysokości textarea
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto'; // Zresetuj wysokość
        textarea.style.height = `${textarea.scrollHeight}px`; // Ustaw nową wysokość
        // Zresetuj timer bezczynności podczas pisania
        resetIdleTimer();
    });


    // Kliknięcie przycisku przełączającego (toggle)
    toggleButton.addEventListener('click', () => {
        const isOpen = chatContainer.classList.toggle('open');
        if (isOpen) {
            toggleButton.setAttribute('aria-label', 'Zamknij czat');
            resetIdleTimer(); // Uruchom timer bezczynności po otwarciu
             // Jeśli interfejs czatu nie jest jeszcze aktywny (nie było rozmowy), ustaw fokus na przycisku nowej rozmowy
             if (!chatInterfaceView.classList.contains('active')) {
                 newChatBtn.focus();
             } else {
                 textarea.focus(); // W przeciwnym razie ustaw fokus na polu tekstowym
             }
        } else {
            toggleButton.setAttribute('aria-label', 'Otwórz czat');
            clearTimeout(idleTimer); // Zatrzymaj timer bezczynności po zamknięciu
        }
    });

    // Kliknięcie przycisków zamknięcia (w obu widokach)
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            chatContainer.classList.remove('open');
            toggleButton.setAttribute('aria-label', 'Otwórz czat');
            clearTimeout(idleTimer); // Zatrzymaj timer bezczynności
        });
    });

    // Resetowanie timera bezczynności przy interakcji z kontenerem czatu
    // (np. kliknięcie, scrollowanie - zapobiega zamknięciu podczas czytania)
    ['click', 'mousemove', 'scroll', 'touchstart'].forEach(eventType => {
        chatContainer.addEventListener(eventType, resetIdleTimer, { passive: true });
    });

    console.log("N8N Chat Widget Initialized Successfully");

})();
