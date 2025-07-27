import * as THREE from './three.module.js';
import { initThreeScene } from './three-scene.js';
import { loadUI } from './ui.js';

// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// Initialize AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100,
    easing: 'ease-out-cubic'
});

class Portfolio {
    constructor() {
        this.currentMusicIndex = 0;
        this.musicFiles = ['lofi-1.mp3', 'lofi-2.mp3', 'lofi-3.mp3', 'lofi-4.mp3'];
        this.gameRunning = false;
        this.gameLoopId = null;
        this.snakeKeyHandler = null;
        this.gameKeys = {}; // Track game-specific keys
        this.init();
    }

    init() {
        this.setupLoader();
        this.setupAudio();
        this.setupGSAP();
        this.setupNavigation();
        this.setupSmoothTrailCursor();
        this.setupFormHandling();
        this.setupSkillBars();
        this.setupSmoothScroll();
        this.setupMusicControl();
        this.setupChatbot();
        this.setupTypingEffect();
        initThreeScene();
        loadUI();

        // Force auto-play after short delay
        setTimeout(() => this.forceAutoPlay(), 1000);
    }

    forceAutoPlay() {
        const backgroundAudio = document.getElementById('backgroundAudio');
        const audioIcon = document.querySelector('.audio-icon');
        const audioToggle = document.getElementById('audioToggle');

        if (backgroundAudio && audioIcon && audioToggle) {
            // Try immediate play
            backgroundAudio.play().then(() => {
                audioIcon.textContent = '🔊';
                audioToggle.classList.add('playing');
                console.log('Music auto-started successfully');
            }).catch(() => {
                // If immediate play fails, set up click listener
                const playOnInteraction = () => {
                    backgroundAudio.play().then(() => {
                        audioIcon.textContent = '🔊';
                        audioToggle.classList.add('playing');
                    });
                    document.removeEventListener('click', playOnInteraction);
                    document.removeEventListener('keydown', playOnInteraction);
                };
                document.addEventListener('click', playOnInteraction);
                document.addEventListener('keydown', playOnInteraction);
            });
        }
    }

    setupLoader() {
        setTimeout(() => {
            const loader = document.querySelector('.loading-screen');
            if (loader) {
                gsap.to(loader, {
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    onComplete: () => {
                        loader.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }
                });
            }
        }, 2000);

        window.addEventListener('load', () => {
            const loader = document.querySelector('.loading-screen');
            if (loader) {
                gsap.to(loader, {
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    onComplete: () => {
                        loader.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }
                });
            }
        });
    }

    setupTypingEffect() {
        const headline = document.getElementById('typed-headline');
        if (headline) {
            const text = headline.textContent;
            headline.textContent = '';
            let i = 0;

            const typeWriter = () => {
                if (i < text.length) {
                    headline.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 50);
                }
            };

            setTimeout(typeWriter, 1000);
        }
    }

    setupAudio() {
        const audioToggle = document.getElementById('audioToggle');
        const backgroundAudio = document.getElementById('backgroundAudio');
        const audioIcon = document.querySelector('.audio-icon');

        if (!audioToggle || !backgroundAudio || !audioIcon) return;

        let isPlaying = false;

        audioToggle.addEventListener('click', () => {
            if (isPlaying) {
                backgroundAudio.pause();
                audioIcon.textContent = '🔇';
                audioToggle.classList.remove('playing');
            } else {
                backgroundAudio.play();
                audioIcon.textContent = '🔊';
                audioToggle.classList.add('playing');
            }
            isPlaying = !isPlaying;
        });
    }

    setupMusicControl() {
        const musicControl = document.createElement('div');
        musicControl.className = 'music-control';
        musicControl.innerHTML = `
            <button id="musicToggle" class="music-btn" title="Change Music">
                <span class="music-icon">🎵</span>
            </button>
        `;
        musicControl.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 30px;
            z-index: 1000;
        `;
        document.body.appendChild(musicControl);

        const musicToggle = document.getElementById('musicToggle');
        const backgroundAudio = document.getElementById('backgroundAudio');

        musicToggle.addEventListener('click', () => {
            this.currentMusicIndex = (this.currentMusicIndex + 1) % this.musicFiles.length;
            backgroundAudio.src = `assets/audio/${this.musicFiles[this.currentMusicIndex]}`;
            backgroundAudio.play();
            this.showMusicNotification(this.musicFiles[this.currentMusicIndex]);
        });
    }

    showMusicNotification(musicFile) {
        const notification = document.createElement('div');
        notification.className = 'music-notification';
        notification.innerHTML = `🎵 Now Playing: ${musicFile.replace('.mp3', '').replace('-', ' ')}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(45deg, #6366f1, #8b5cf6);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
        `;
        document.body.appendChild(notification);

        gsap.to(notification, {
            opacity: 1,
            y: 20,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                setTimeout(() => {
                    gsap.to(notification, {
                        opacity: 0,
                        y: -20,
                        duration: 0.5,
                        onComplete: () => {
                            if (document.body.contains(notification)) {
                                document.body.removeChild(notification);
                            }
                        }
                    });
                }, 2000);
            }
        });
    }

    setupChatbot() {
        const chatbot = document.createElement('div');
        chatbot.className = 'chatbot-container';
        chatbot.innerHTML = `
            <button id="chatbotToggle" class="chatbot-btn" title="AI Assistant">
                <span class="chatbot-icon">🤖</span>
            </button>
            <div id="chatbotWindow" class="chatbot-window">
                <div class="chatbot-header">
                    <span>AI Assistant</span>
                    <button id="closeChatbot">✕</button>
                </div>
                <div id="chatbotMessages" class="chatbot-messages">
                    <div class="bot-message">Hi! I'm your AI assistant. How can I help you today?</div>
                </div>
                <div class="chatbot-input">
                    <input type="text" id="chatbotInput" placeholder="Type your message...">
                    <button id="sendMessage">Send</button>
                </div>
            </div>
        `;
        chatbot.style.cssText = `
            position: fixed;
            bottom: 170px;
            right: 30px;
            z-index: 1000;
        `;
        document.body.appendChild(chatbot);

        const responses = [
            "That's an interesting question! I'm here to help with general inquiries about web development and AI.",
            "I understand your concern. Feel free to ask me anything about technology or programming!",
            "Thanks for reaching out! I'm always happy to chat about AI, web development, or general topics.",
            "Great question! While I can't provide professional advice, I'm here for friendly conversation.",
            "I appreciate you asking! Is there anything specific about technology or programming you'd like to know?"
        ];

        this.setupChatbotEvents(responses);
    }

    setupChatbotEvents(responses) {
        const toggle = document.getElementById('chatbotToggle');
        const window = document.getElementById('chatbotWindow');
        const close = document.getElementById('closeChatbot');
        const input = document.getElementById('chatbotInput');
        const send = document.getElementById('sendMessage');
        const messages = document.getElementById('chatbotMessages');

        toggle.addEventListener('click', () => {
            const isVisible = window.style.display === 'block';
            if (isVisible) {
                gsap.to(window, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => window.style.display = 'none'
                });
            } else {
                window.style.display = 'block';
                gsap.fromTo(window, 
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.3 }
                );
            }
        });

        close.addEventListener('click', () => {
            gsap.to(window, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                onComplete: () => window.style.display = 'none'
            });
        });

        const sendMessage = () => {
            const message = input.value.trim();
            if (message) {
                // Add user message
                const userMsg = document.createElement('div');
                userMsg.className = 'user-message';
                userMsg.textContent = message;
                messages.appendChild(userMsg);

                // Add bot response
                setTimeout(() => {
                    const botMsg = document.createElement('div');
                    botMsg.className = 'bot-message';
                    botMsg.textContent = responses[Math.floor(Math.random() * responses.length)];
                    messages.appendChild(botMsg);
                    messages.scrollTop = messages.scrollHeight;
                }, 1000);

                input.value = '';
                messages.scrollTop = messages.scrollHeight;
            }
        };

        send.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    setupGSAP() {
        // Enhanced animations
        gsap.from(".hero-content", { 
            duration: 1.5, 
            y: 100, 
            opacity: 0, 
            ease: "power3.out",
            delay: 0.5 
        });

        // Scroll-triggered animations
        ScrollTrigger.batch(".project-card", {
            onEnter: (elements) => {
                gsap.from(elements, {
                    opacity: 0,
                    y: 100,
                    stagger: 0.2,
                    duration: 1,
                    ease: "power2.out"
                });
            }
        });
    }

    setupNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close menu when clicking on a link (mobile)
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (window.scrollY > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });

        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupSmoothTrailCursor() {
        // Skip cursor effects on mobile devices
        if (window.innerWidth <= 768) return;

        const cursor = document.createElement('div');
        cursor.className = 'cursor-trail';
        document.body.appendChild(cursor);

        const dots = [];
        for (let i = 0; i < 8; i++) {
            const dot = document.createElement('div');
            dot.className = 'cursor-trail-dot';
            document.body.appendChild(dot);
            dots.push({ element: dot, x: 0, y: 0 });
        }

        let mouseX = 0, mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        document.addEventListener('mousedown', () => {
            cursor.classList.add('active');
        });

        document.addEventListener('mouseup', () => {
            cursor.classList.remove('active');
        });

        // Animate trailing dots
        setInterval(() => {
            dots.forEach((dot, index) => {
                const delay = index * 50;
                setTimeout(() => {
                    dot.x += (mouseX - dot.x) * 0.1;
                    dot.y += (mouseY - dot.y) * 0.1;
                    dot.element.style.left = dot.x + 'px';
                    dot.element.style.top = dot.y + 'px';
                    dot.element.style.opacity = (8 - index) / 8;
                }, delay);
            });
        }, 16);
    }

    setupFormHandling() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showNotification('Thank you for your message! I\'ll get back to you soon.', 'success');
                contactForm.reset();
            });
        }
    }

    setupSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        const animateSkillBars = () => {
            skillBars.forEach(bar => {
                const rect = bar.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const width = bar.getAttribute('data-width') || '90%';
                    bar.style.width = width;
                }
            });
        };

        window.addEventListener('scroll', animateSkillBars);
        animateSkillBars(); // Initial check
    }

    setupSmoothScroll() {
        // Enhanced smooth scrolling for better UX
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        gsap.fromTo(notification, 
            { opacity: 0, x: 100 },
            { opacity: 1, x: 0, duration: 0.5 }
        );

        setTimeout(() => {
            gsap.to(notification, {
                opacity: 0,
                x: 100,
                duration: 0.5,
                onComplete: () => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }
            });
        }, 3000);
    }

    // Fixed Snake Game with proper mobile handling and key isolation
    createSnakeGame() {
        const gameContainer = document.createElement('div');
        gameContainer.className = 'snake-game-container';
        gameContainer.innerHTML = `
            <div class="snake-game">
                <div class="game-header">
                    <h3>Snake Game</h3>
                    <button id="closeGame">✕</button>
                </div>
                <canvas id="snakeCanvas" width="400" height="400"></canvas>
                <div class="game-controls">
                    <p>Score: <span id="score">0</span></p>
                    <p>Use WASD or Arrow Keys to play</p>
                    <div class="mobile-controls" style="display: none;">
                        <button class="control-btn" data-direction="up">↑</button>
                        <div>
                            <button class="control-btn" data-direction="left">←</button>
                            <button class="control-btn" data-direction="down">↓</button>
                            <button class="control-btn" data-direction="right">→</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        gameContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            background: rgba(0, 0, 0, 0.9);
            border-radius: 15px;
            padding: 20px;
        `;

        document.body.appendChild(gameContainer);

        // Show mobile controls on mobile devices
        if (window.innerWidth <= 768) {
            const mobileControls = gameContainer.querySelector('.mobile-controls');
            mobileControls.style.display = 'block';
        }

        const canvas = document.getElementById('snakeCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const closeButton = document.getElementById('closeGame');

        // Game state
        let snake = [{ x: 200, y: 200 }];
        let food = { x: 100, y: 100 };
        let dx = 0, dy = 0;
        let score = 0;
        this.gameRunning = true;

        // Mobile control buttons
        const controlBtns = gameContainer.querySelectorAll('.control-btn');
        controlBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const direction = btn.getAttribute('data-direction');
                this.changeDirection(direction);
            });
        });

        // Game-specific key handler that doesn't interfere with page scrolling
        this.snakeKeyHandler = (e) => {
            // Only handle keys if the game is running and in focus
            if (!this.gameRunning) return;
            
            const key = e.key.toLowerCase();
            let handled = false;

            switch (key) {
                case 'arrowup':
                case 'w':
                    this.changeDirection('up');
                    handled = true;
                    break;
                case 'arrowdown':
                case 's':
                    this.changeDirection('down');
                    handled = true;
                    break;
                case 'arrowleft':
                case 'a':
                    this.changeDirection('left');
                    handled = true;
                    break;
                case 'arrowright':
                case 'd':
                    this.changeDirection('right');
                    handled = true;
                    break;
            }

            // Prevent default only for game keys to avoid page scroll
            if (handled) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        // Add event listener with capture to intercept before page scroll
        document.addEventListener('keydown', this.snakeKeyHandler, true);

        // Set canvas cursor to crosshair
        canvas.style.cursor = 'crosshair';

        closeButton.addEventListener('click', () => {
            this.endSnakeGame(gameContainer);
        });

        // Game functions
        this.changeDirection = (direction) => {
            if (direction === 'up' && dy === 0) { dx = 0; dy = -20; }
            if (direction === 'down' && dy === 0) { dx = 0; dy = 20; }
            if (direction === 'left' && dx === 0) { dx = -20; dy = 0; }
            if (direction === 'right' && dx === 0) { dx = 20; dy = 0; }
        };

        const drawSnake = () => {
            ctx.fillStyle = '#6366f1';
            snake.forEach(segment => {
                ctx.fillRect(segment.x, segment.y, 18, 18);
                ctx.strokeStyle = '#8b5cf6';
                ctx.strokeRect(segment.x, segment.y, 18, 18);
            });
        };

        const drawFood = () => {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(food.x, food.y, 18, 18);
            ctx.strokeStyle = '#dc2626';
            ctx.strokeRect(food.x, food.y, 18, 18);
        };

        const moveSnake = () => {
            const head = { x: snake[0].x + dx, y: snake[0].y + dy };
            snake.unshift(head);

            // Check if food is eaten
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                scoreElement.textContent = score;
                // Generate new food position
                food = {
                    x: Math.floor(Math.random() * 20) * 20,
                    y: Math.floor(Math.random() * 20) * 20
                };
            } else {
                snake.pop();
            }
        };

        const checkCollisions = () => {
            const head = snake[0];
            
            // Wall collision
            if (head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400) {
                return true;
            }
            
            // Self collision
            for (let i = 1; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    return true;
                }
            }
            
            return false;
        };

        const gameLoop = () => {
            if (!this.gameRunning) return;

            ctx.clearRect(0, 0, 400, 400);
            
            if (dx !== 0 || dy !== 0) {
                moveSnake();
                
                if (checkCollisions()) {
                    this.showGameOverScreen(gameContainer, score);
                    return;
                }
            }
            
            drawSnake();
            drawFood();
            
            this.gameLoopId = setTimeout(gameLoop, 150);
        };

        gameLoop();
    }

    showGameOverScreen(gameContainer, score) {
        this.gameRunning = false;
        
        // Clear any existing game loop
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
            this.gameLoopId = null;
        }

        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over-screen';
        gameOverScreen.innerHTML = `
            <div style="text-align: center; color: white; padding: 20px;">
                <h2 style="color: #ef4444; margin-bottom: 10px;">Game Over!</h2>
                <p style="font-size: 1.2rem; margin-bottom: 20px;">Final Score: ${score}</p>
                <button id="playAgain" style="padding: 10px 20px; margin-right: 10px; background: #6366f1; color: white; border: none; border-radius: 5px; cursor: pointer;">Play Again</button>
                <button id="closeGameOver" style="padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
        `;

        gameContainer.appendChild(gameOverScreen);

        document.getElementById('playAgain').addEventListener('click', () => {
            this.endSnakeGame(gameContainer);
            setTimeout(() => this.createSnakeGame(), 100);
        });

        document.getElementById('closeGameOver').addEventListener('click', () => {
            this.endSnakeGame(gameContainer);
        });
    }

    endSnakeGame(gameContainer) {
        this.gameRunning = false;
        
        // Clear game loop
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
            this.gameLoopId = null;
        }

        // Remove key event listener
        if (this.snakeKeyHandler) {
            document.removeEventListener('keydown', this.snakeKeyHandler, true);
            this.snakeKeyHandler = null;
        }

        // Remove game container safely
        if (gameContainer && document.body.contains(gameContainer)) {
            document.body.removeChild(gameContainer);
        }
    }

    setupAIAnimations() {
        this.createEnhancedBackground();
        this.setupMLVisualization();
        this.setupDataFlowAnimation();
    }

    createEnhancedBackground() {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'enhanced-bg';
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            opacity: 0.15;
            z-index: 1;
        `;
        heroSection.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const particles = [];

        for (let i = 0; i < 8; i++) {
            particles.push({
                centerX: window.innerWidth / 2,
                centerY: window.innerHeight / 2,
                radius: 100 + i * 30,
                angle: (i / 8) * Math.PI * 2,
                speed: 0.01 + i * 0.001,
                size: 2 + Math.random() * 2,
                color: `hsl(${240 + Math.random() * 60}, 70%, 60%)`
            });
        }

        const animate = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle, index) => {
                particle.centerX = window.innerWidth / 2;
                particle.centerY = window.innerHeight / 2;
                particle.angle += particle.speed;

                const x = particle.centerX + Math.cos(particle.angle) * particle.radius;
                const y = particle.centerY + Math.sin(particle.angle) * particle.radius;

                ctx.beginPath();
                ctx.arc(x, y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();

                if (index > 0 && Math.abs(particles[index-1].radius - particle.radius) < 50) {
                    const prevX = particle.centerX + Math.cos(particles[index-1].angle) * particles[index-1].radius;
                    const prevY = particle.centerY + Math.sin(particles[index-1].angle) * particles[index-1].radius;
                    const distance = Math.sqrt((x - prevX) ** 2 + (y - prevY) ** 2);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(prevX, prevY);
                        ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 - distance / 500})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            });

            requestAnimationFrame(animate);
        };

        animate();
    }

    setupMLVisualization() {
        // Enhanced skills will be handled in the updated skills section
    }

    setupProjectInteractions() {
        const projectsData = [
            {
                title: "MindScope - Mental Health Companion",
                description: "AI-powered mental health companion app built with React and Next.js, featuring mood tracking, AI chat support, journaling with sentiment analysis, and crisis resources. Uses Llama 3.3-70B model via Together API for empathetic AI responses.",
                tech: ["React", "Next.js", "Together API", "Llama 3.3", "Sentiment Analysis", "Local Storage"],
                github: "https://github.com/Thanatos9404/MindScope",
                demo: "https://www.youtube.com/watch?v=kxeXPPel3gM",
                live: "https://mindscope-yt.vercel.app/",
                thumbnail: "assets/images/ms.jpg",
                type: "Mental Health AI",
                status: "Live"
            },
            {
                title: "BharatVaani - AI News Companion",
                description: "Multilingual AI-powered news summaries using HuggingFace Transformers with Flask backend, featuring What-If generator and TTS capabilities for breaking language barriers in news consumption.",
                tech: ["Python", "Flask", "HuggingFace", "TTS", "NewsAPI", "NLTK"],
                github: "https://github.com/Thanatos9404/BharatVaani",
                demo: "https://www.youtube.com/watch?v=wvOa9x7HVoI",
                thumbnail: "assets/images/bv.png",
                type: "AI/ML"
            },
            {
                title: "Gesture-Controlled Media Player",
                description: "OpenCV-based media controller using hand gesture recognition for users with physical limitations or multitasking scenarios, featuring real-time hand tracking.",
                tech: ["OpenCV", "Python", "MediaPipe", "Computer Vision", "Tkinter"],
                github: "https://github.com/Thanatos9404/Gesture-Controlled-Media-Player",
                demo: "https://www.youtube.com/watch?v=8zGOxWsqTt4",
                thumbnail: "assets/images/gcmp.png",
                type: "Computer Vision"
            },
            {
                title: "AI Cheating Detector",
                description: "Real-time proctoring system using facial landmark detection and head tracking to flag suspicious behavior during online exams with advanced computer vision.",
                tech: ["Dlib", "OpenCV", "Python", "Facial Recognition", "Machine Learning"],
                github: "https://github.com/Thanatos9404/Cheating-Detection-Proctoring-App",
                demo: "https://www.youtube.com/watch?v=9dKg8s2H-30",
                thumbnail: "assets/images/cdpa.png",
                type: "Security AI"
            },
            {
                title: "AI News Summarizer",
                description: "Advanced NLP-based news summarization tool using transformer models for extracting key information from news articles with support for multiple languages and customizable summary lengths.",
                tech: ["NLP", "Python", "Transformers", "Streamlit", "BeautifulSoup", "NLTK"],
                github: "https://github.com/Thanatos9404/AI-News-Summarizer",
                demo: "https://www.youtube.com/watch?v=Kx9tlg1aa4A",
                thumbnail: "assets/images/ans.png",
                type: "NLP"
            }
        ];

        console.log('Rendering projects:', projectsData.length);
        this.renderProjects(projectsData);

        // Force update stats counter after projects are rendered
        setTimeout(() => {
            this.updateProjectStats();
        }, 1000);
    }

    updateProjectStats() {
        const statItems = document.querySelectorAll('.stat-item');
        if (statItems.length >= 2) {
            const projectStat = statItems[1];
            if (projectStat) {
                const h3 = projectStat.querySelector('h3');
                const p = projectStat.querySelector('p');
                if (h3 && p && p.textContent.toLowerCase().includes('project')) {
                    h3.textContent = '5+';
                    console.log('Updated project counter to 5+');
                }
            }
        }
    }

    renderProjects(projects) {
        const projectsGrid = document.querySelector('.projects-grid');
        if (!projectsGrid) {
            console.error('Projects grid not found');
            return;
        }

        console.log('Clearing projects grid and adding', projects.length, 'projects');
        projectsGrid.innerHTML = '';

        projects.forEach((project, index) => {
            console.log(`Rendering project ${index + 1}:`, project.title);
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.setAttribute('data-aos', 'fade-up');
            projectCard.setAttribute('data-aos-delay', `${index * 100}`);

            const statusBadge = project.status ? `<div class="project-status-badge">${project.status}</div>` : '';
            const typeBadge = `<div class="project-type-badge">${project.type}</div>`;
            
            const liveLink = project.live ? `<a href="${project.live}" target="_blank" class="project-link">Live App</a>` : '';
            const demoLink = project.demo ? `<a href="${project.demo}" target="_blank" class="project-link">Demo</a>` : '';
            const githubLink = project.github ? `<a href="${project.github}" target="_blank" class="project-link">GitHub</a>` : '<span class="project-link disabled">Private Repo</span>';

            projectCard.innerHTML = `
                <div class="project-image" style="background-image: url('${project.thumbnail}')">
                    ${typeBadge}
                    ${statusBadge}
                    <div class="project-overlay">
                        <div class="project-links">
                            ${liveLink}
                            ${demoLink}
                            ${githubLink}
                        </div>
                    </div>
                </div>
                <div class="project-content">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-tech">
                        ${project.tech.map(tech => `<span>${tech}</span>`).join('')}
                    </div>
                </div>
            `;

            // Add ripple effect
            projectCard.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                const rect = projectCard.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                projectCard.appendChild(ripple);

                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }, 600);
            });

            projectsGrid.appendChild(projectCard);
        });
    }
}

// Initialize the portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const portfolio = new Portfolio();
    
    // Add Snake Game trigger (you can add this to any button)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'g') {
            e.preventDefault();
            portfolio.createSnakeGame();
        }
    });
    
    // Add click handler for snake game (if you have a button)
    const gameButton = document.getElementById('snakeGameBtn');
    if (gameButton) {
        gameButton.addEventListener('click', () => {
            portfolio.createSnakeGame();
        });
    }
});
