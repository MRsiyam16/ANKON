document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const heroContainer = document.querySelector('.hero-container');
    const heroHeading = document.getElementById('hero-heading');
    const subHeading = document.querySelector('.hero-subheading');
    
    const chatContainer = document.getElementById('chat-container');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const btnAnalyze = document.getElementById('btn-analyze');

    const API_KEY = 'AIzaSyA6bEaB8YOQnNlK1woO2-HQVPPHAU1L9Do';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

    let isExpanded = false;
    let messageHistory = [];
    let leads = JSON.parse(localStorage.getItem('ankon_leads') || '{}');

    const SYSTEM_PROMPT = `You are the ANKON Design AI Consultant. You are professional, human-like, and efficient. Your goal is to understand the user's design problem and gather essential contact information: Full Name, Email, Website URL, and WhatsApp/Contact Number. Acknowledge the user's problem with expert insight, then naturally bridge to asking for these details so you can provide a detailed analysis. Be concise and never use emojis.`;

    // 1. Entrance Sequence
    heroHeading.style.opacity = '0';
    heroHeading.style.transform = 'translateY(30px)';
    subHeading.style.opacity = '0';
    subHeading.style.transform = 'translateY(20px)';

    setTimeout(() => {
        window.scrollTo(0, 0); // Reset scroll position so it always starts at top
        loader.classList.add('swipe-up');
        setTimeout(() => {
            heroContainer.classList.add('visible');
            document.body.style.overflow = 'auto';
        }, 300);

        setTimeout(() => {
            heroHeading.style.opacity = '1';
            heroHeading.style.transform = 'translateY(0)';
            heroHeading.style.transition = 'all 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
        }, 800);

        setTimeout(() => {
            subHeading.style.opacity = '1';
            subHeading.style.transform = 'translateY(0)';
            subHeading.style.transition = 'all 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
        }, 1100);
    }, 2500);

    // Typewriter animation for placeholder
    const placeholders = [
        "My conversion rate is dropping...",
        "I need a complete brand redesign...",
        "We want to build a high-end web app...",
        "How can we improve our user experience?"
    ];
    let placeholderIdx = 0;
    let charIdx = placeholders[0].length;
    let isDeleting = true;
    let typeSpeed = 2000; // Pause at start before deleting

    const typePlaceholder = () => {
        if (isExpanded) {
            userInput.setAttribute('placeholder', 'Type your message...');
            return;
        }

        const currentText = placeholders[placeholderIdx];
        
        if (isDeleting) {
            userInput.setAttribute('placeholder', currentText.substring(0, charIdx - 1));
            charIdx--;
            typeSpeed = 50;
        } else {
            userInput.setAttribute('placeholder', currentText.substring(0, charIdx + 1));
            charIdx++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIdx === currentText.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            placeholderIdx = (placeholderIdx + 1) % placeholders.length;
            typeSpeed = 500; // Pause before typing new text
        }

        setTimeout(typePlaceholder, typeSpeed);
    };

    setTimeout(typePlaceholder, 3000); // Start after entrance animation

    // 2. Chat Logic
    const addMessage = (role, text) => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', role);
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        messageHistory.push({
            role: role === 'user' ? 'user' : 'model',
            parts: [{ text: text }]
        });
    };

    const expandChat = () => {
        if (!isExpanded) {
            chatContainer.classList.add('expanded');
            isExpanded = true;
        }
    };

    const getAIResponse = async () => {
        const userText = userInput.value.trim();
        if (!userText) return;

        addMessage('user', userText);
        userInput.value = '';
        expandChat();

        // Show a temporary loading state
        const loadingMsg = document.createElement('div');
        loadingMsg.classList.add('message', 'ai');
        loadingMsg.textContent = 'Analysing structure...';
        chatMessages.appendChild(loadingMsg);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: SYSTEM_PROMPT }]
                    },
                    contents: messageHistory
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const aiText = data.candidates[0].content.parts[0].text;
                chatMessages.removeChild(loadingMsg);
                addMessage('ai', aiText);
                
                // Lead extraction logic
                extractLeads(userText + " " + aiText);
            } else {
                throw new Error(data.error?.message || 'Empty response from AI');
            }
        } catch (error) {
            console.error('AI Error:', error);
            chatMessages.removeChild(loadingMsg);
            addMessage('ai', 'A structural error occurred in the consultation pipeline.');
        }
    };

    const extractLeads = (text) => {
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-z]{2,})/gi;
        const phoneRegex = /(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
        const budgetRegex = /(?:budget|investment|around|of|is)\s*(?:[\$€£]?\s*\d+(?:[.,]\d+)?\s*[kK]?\s*(?:-|to)?\s*(?:[\$€£]?\s*\d+(?:[.,]\d+)?\s*[kK]?)?)/gi;
        const timelineRegex = /(?:timeline|live|by|within|in|start|launch|around)\s*(?:\d+\s*(?:month|week|day)s?|immediately|asap|this quarter|next quarter|by\s+[A-Z][a-z]+)/gi;

        const emails = text.match(emailRegex);
        const urls = text.match(urlRegex);
        const phones = text.match(phoneRegex);
        const budget = text.match(budgetRegex);
        const timeline = text.match(timelineRegex);

        if (emails) leads.email = emails[0];
        if (urls && !urls[0].includes('@')) leads.website = urls[0];
        if (phones && phones[0].length > 7) leads.phone = phones[0];
        if (budget) leads.budget = budget[0].replace(/budget|investment|is|of/i, '').trim();
        if (timeline) leads.timeline = timeline[0].replace(/timeline|live|start/i, '').trim();

        // Basic name detection (improved)
        const nameMatch = text.match(/(?:my name is|i am|this is|i'm|im)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
        if (nameMatch) leads.name = nameMatch[1];

        localStorage.setItem('ankon_leads', JSON.stringify(leads));
        
        if (Object.keys(leads).length > 0) {
            console.log('--- LEAD CAPTURED ---', leads);
            
            // Sync with server
            fetch('/save-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leads: leads,
                    history: messageHistory
                })
            })
            .then(res => res.json())
            .then(data => console.log('Lead synced to server:', data))
            .catch(err => console.error('Lead sync failed:', err));
        }
    };

    btnAnalyze.addEventListener('click', getAIResponse);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') getAIResponse();
    });

    // 3. Scroll Effects
    let isTicking = false;
    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                
                // Hero Visibility Toggle (No Fade)
                if (scrollY > windowHeight) {
                    heroContainer.style.visibility = 'hidden';
                    heroContainer.style.pointerEvents = 'none';
                } else {
                    heroContainer.style.visibility = 'visible';
                    heroContainer.style.pointerEvents = 'all';
                    heroContainer.style.opacity = '1'; // Ensure it's opaque
                }
                
                // Background Color Toggle
                if (scrollY > windowHeight * 0.1) {
                    document.body.classList.add('scrolled');
                } else {
                    document.body.classList.remove('scrolled');
                }
                
                isTicking = false;
            });
            isTicking = true;
        }
    }, { passive: true });

    // 4. Framer Motion (Vanilla) Animations
    if (window.Motion) {
        const { animate, inView, stagger, spring } = window.Motion;

        // Portfolio Cards Staggered Entrance
        const portCards = document.querySelectorAll('.port-card');
        
        // Hide initially
        portCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
        });

        inView('.portfolio-showcase', () => {
            animate(
                portCards,
                { opacity: 1, transform: 'translateY(0px)' },
                { 
                    delay: stagger(0.15),
                    duration: 0.8,
                    easing: [0.16, 1, 0.3, 1] 
                }
            );
        }, { margin: "-100px" });

        // Hover Physics (Spring)
        portCards.forEach(card => {
            const image = card.querySelector('.port-image');
            
            card.addEventListener('mouseenter', () => {
                animate(
                    image, 
                    { scale: 0.96 }, 
                    { type: "spring", stiffness: 300, damping: 20 }
                );
            });
            
            card.addEventListener('mouseleave', () => {
                animate(
                    image, 
                    { scale: 1 }, 
                    { type: "spring", stiffness: 300, damping: 20 }
                );
            });
        });
        // Services Staggered Entrance
        const serviceItems = document.querySelectorAll('.service-item');
        
        serviceItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
        });

        inView('.services', () => {
            animate(
                serviceItems,
                { opacity: 1, transform: 'translateY(0px)' },
                { 
                    delay: stagger(0.1),
                    duration: 0.8,
                    easing: [0.16, 1, 0.3, 1] 
                }
            );
        }, { margin: "-100px" });

        // --- Testimonials Slider Logic ---
        const testSlider = document.getElementById('test-slider');
        const testCards = document.querySelectorAll('.test-card');
        const testDots = document.querySelectorAll('.dot');
        const testPrevBtn = document.getElementById('test-prev');
        const testNextBtn = document.getElementById('test-next');
        let currentTestIdx = 0;

        // Initial States
        const testHeader = document.querySelector('.test-header');
        const testWrapper = document.querySelector('.test-slider-wrapper');
        
        if (testHeader) {
            testHeader.style.opacity = '0';
            testHeader.style.transform = 'translateY(30px)';
        }
        if (testWrapper) {
            testWrapper.style.opacity = '0';
            testWrapper.style.transform = 'scale(0.98)';
        }

        function updateTestSlider() {
            if (!testSlider || testCards.length === 0) return;

            // Only move slider if in mobile/slider mode (width <= 1024)
            if (window.innerWidth <= 1024) {
                animate(
                    testSlider,
                    { x: `-${currentTestIdx * 100}%` },
                    { duration: 0.8, easing: [0.16, 1, 0.3, 1] }
                );
            } else {
                // Reset position on desktop grid
                testSlider.style.transform = 'none';
            }

            // Update Dots
            testDots.forEach((dot, i) => {
                if (i === currentTestIdx) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });

            // Card Emphasis Animation
            testCards.forEach((card, i) => {
                const isActive = i === currentTestIdx;
                animate(
                    card,
                    { 
                        opacity: isActive ? 1 : 0.3, 
                        scale: isActive ? 1 : 0.95,
                        filter: isActive ? "blur(0px)" : "blur(4px)" 
                    },
                    { duration: 0.6 }
                );
            });
        }

        if (testNextBtn) {
            testNextBtn.onclick = () => {
                currentTestIdx = (currentTestIdx + 1) % testCards.length;
                updateTestSlider();
            };
        }

        if (testPrevBtn) {
            testPrevBtn.onclick = () => {
                currentTestIdx = (currentTestIdx - 1 + testCards.length) % testCards.length;
                updateTestSlider();
            };
        }

        testDots.forEach((dot, i) => {
            dot.onclick = () => {
                currentTestIdx = i;
                updateTestSlider();
            };
        });

        inView('.testimonials', () => {
            animate(
                testHeader,
                { opacity: 1, transform: 'translateY(0px)' },
                { duration: 1, easing: [0.16, 1, 0.3, 1] }
            );
            animate(
                testWrapper,
                { opacity: 1, transform: 'scale(1)' },
                { delay: 0.2, duration: 1, easing: [0.16, 1, 0.3, 1] }
            );
            // Initialize slider state
            updateTestSlider();
        }, { margin: "-100px" });
    }
});

