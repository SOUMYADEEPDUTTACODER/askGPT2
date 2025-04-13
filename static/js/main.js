document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesContainer = document.getElementById('messages');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const typingIndicator = document.getElementById('typingIndicator');
    const newChatBtn = document.getElementById('newChatBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const chatHistory = document.getElementById('chatHistory');
    
    let currentChatId = null;
    let isTyping = false;

    // Load chat history on page load
    loadChatHistory();

    // Auto-resize textarea
    const autoResize = (textarea) => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
        sendButton.disabled = !textarea.value.trim();
    };

    // Create message element
    const createMessageElement = (content, isUser) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        // Format code blocks
        const formattedContent = content.replace(/```([\s\S]*?)```/g, (match, code) => {
            const language = code.split('\n')[0].trim() || 'plaintext';
            const codeContent = code.split('\n').slice(1).join('\n').trim();
            return `<div class="code-block"><button class="copy-button" onclick="copyCode(this)">Copy</button><pre><code class="language-${language}">${codeContent}</code></pre></div>`;
        });

        messageDiv.innerHTML = formattedContent;
        return messageDiv;
    };

    // Add message to chat
    const addMessage = (content, isUser) => {
        const messageElement = createMessageElement(content, isUser);
        messagesContainer.appendChild(messageElement);
        messageElement.scrollIntoView({ behavior: 'smooth' });
        hljs.highlightAll();
    };

    // Load chat history
    async function loadChatHistory() {
        try {
            const response = await fetch('/api/chats');
            const chats = await response.json();
            
            chatHistory.innerHTML = '';
            chats.forEach(chat => {
                const chatElement = createChatHistoryElement(chat);
                chatHistory.appendChild(chatElement);
            });
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    // Create chat history element
    function createChatHistoryElement(chat) {
        const chatElement = document.createElement('div');
        chatElement.className = 'chat-history-item';
        chatElement.dataset.chatId = chat.id;
        
        // Get the first message as preview
        const preview = chat.messages[0]?.content || 'New Chat';
        const truncatedPreview = preview.length > 30 ? preview.substring(0, 30) + '...' : preview;
        
        chatElement.innerHTML = `
            <div class="chat-preview">
                <i class="fas fa-comment"></i>
                <span>${truncatedPreview}</span>
            </div>
            <div class="chat-date">${new Date(chat.created_at).toLocaleDateString()}</div>
        `;

        chatElement.addEventListener('click', () => loadChat(chat.id));
        return chatElement;
    }

    // Load specific chat
    async function loadChat(chatId) {
        try {
            const response = await fetch(`/api/chats/${chatId}`);
            const chat = await response.json();
            
            currentChatId = chatId;
            messagesContainer.innerHTML = '';
            welcomeScreen.style.display = 'none';
            
            chat.messages.forEach(msg => {
                addMessage(msg.content, msg.is_user);
            });
        } catch (error) {
            console.error('Error loading chat:', error);
        }
    }

    // Send message
    const sendMessage = () => {
        const message = messageInput.value.trim();
        if (!message) return;

        // Hide welcome screen
        welcomeScreen.style.display = 'none';

        // Add user message
        addMessage(message, true);

        // Clear input
        messageInput.value = '';
        autoResize(messageInput);
        sendButton.disabled = true;

        // Show typing indicator
        typingIndicator.style.display = 'block';

        // Emit message to server
        socket.emit('send_message', {
            message,
            chat_id: currentChatId
        });
    };

    // Event listeners
    messageInput.addEventListener('input', () => {
        autoResize(messageInput);
        sendButton.disabled = !messageInput.value.trim();
    });

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendButton.addEventListener('click', sendMessage);

    newChatBtn.addEventListener('click', () => {
        currentChatId = null;
        messagesContainer.innerHTML = '';
        welcomeScreen.style.display = 'block';
    });

    logoutBtn.addEventListener('click', () => {
        window.location.href = '/logout';
    });

    // Socket events
    socket.on('receive_message', (data) => {
        typingIndicator.style.display = 'none';
        currentChatId = data.chat_id;
        addMessage(data.message, false);
        loadChatHistory(); // Refresh chat history after new message
    });

    socket.on('error', (data) => {
        typingIndicator.style.display = 'none';
        alert(data.message);
    });

    // Copy code function
    window.copyCode = (button) => {
        const codeBlock = button.nextElementSibling;
        const code = codeBlock.textContent;
        navigator.clipboard.writeText(code).then(() => {
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = 'Copy';
            }, 2000);
        });
    };
}); 