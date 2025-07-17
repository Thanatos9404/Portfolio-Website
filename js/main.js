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
            <button id="musicToggle" class="music-btn">
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
            <button id="chatbotToggle" class="chatbot-btn">
                <span class="chatbot-icon">💬</span>
            </button>
            <div id="chatbotWindow" class="chatbot-window">
                <div class="chatbot-header">
                    <span>AI Assistant</span>
                    <button id="chatbotClose">×</button>
                </div>
                <div class="chatbot-messages" id="chatbotMessages">
                    <div class="bot-message">Hi! I'm Yashvardhan's AI assistant. How can I help you?</div>
                </div>
                <div class="chatbot-input">
                    <input type="text" id="chatbotInput" placeholder="Type your message...">
                    <button id="chatbotSend">Send</button>
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
        
        this.initializeChatbot();
    }

    initializeChatbot() {
        const chatbotToggle = document.getElementById('chatbotToggle');
        const chatbotWindow = document.getElementById('chatbotWindow');
        const chatbotClose = document.getElementById('chatbotClose');
        const chatbotInput = document.getElementById('chatbotInput');
        const chatbotSend = document.getElementById('chatbotSend');
        
        let isOpen = false;
        
        chatbotToggle.addEventListener('click', () => {
            isOpen = !isOpen;
            gsap.to(chatbotWindow, {
                opacity: isOpen ? 1 : 0,
                scale: isOpen ? 1 : 0,
                duration: 0.3,
                ease: "power2.out"
            });
            chatbotWindow.style.display = isOpen ? 'block' : 'none';
        });
        
        chatbotClose.addEventListener('click', () => {
            isOpen = false;
            gsap.to(chatbotWindow, {
                opacity: 0,
                scale: 0,
                duration: 0.3,
                ease: "power2.out"
            });
            chatbotWindow.style.display = 'none';
        });
        
        const sendMessage = () => {
            const message = chatbotInput.value.trim();
            if (message) {
                this.addChatMessage(message, 'user');
                chatbotInput.value = '';
                
                setTimeout(() => {
                    this.addChatMessage(this.generateAIResponse(message), 'bot');
                }, 1000);
            }
        };
        
        chatbotSend.addEventListener('click', sendMessage);
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    addChatMessage(message, sender) {
        const chatbotMessages = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        messageDiv.textContent = message;
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    generateAIResponse(message) {
        const responses = {
            'projects': 'Yashvardhan has worked on 5 amazing AI/ML projects including BharatVaani, MoodMentor, Gesture-Controlled Media Player, AI Cheating Detector, and AI News Summarizer!',
            'skills': 'He\'s skilled in Python, TensorFlow, PyTorch, OpenCV, MediaPipe, Streamlit, Flask, HuggingFace, and many more AI/ML technologies.',
            'contact': 'You can reach Yashvardhan at yashvt9404@gmail.com',
            'education': 'He\'s pursuing BCA at Birla Institute of Technology, Mesra with a CGPA of 9.3/10.0',
            'achievements': 'Smart India Hackathon 2024 selection, 1st Prize in Website Design Competition, 15+ certifications, and 5-star Python rating on HackerRank!'
        };
        
        const lowerMessage = message.toLowerCase();
        
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }
        
        return 'That\'s interesting! Feel free to explore the portfolio to learn more about Yashvardhan\'s work and achievements.';
    }

    setupGSAP() {
        gsap.from('.navbar', {
            y: -100,
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        });

        const heroTl = gsap.timeline();
        heroTl.from('.hero-title', {
            y: 100,
            opacity: 0,
            duration: 1,
            delay: 0.5,
            ease: "power2.out"
        })
        .from('.hero-subtitle', {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        }, '-=0.5')
        .from('.hero-buttons', {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        }, '-=0.5');

        gsap.utils.toArray('.section:not(.hero)').forEach((section, index) => {
            if (section) {
                gsap.from(section, {
                    y: 50,
                    opacity: 0,
                    duration: 1,
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none none'
                    }
                });
            }
        });

        ScrollTrigger.create({
            start: 'top -80',
            end: 99999,
            toggleClass: {
                className: 'scrolled',
                targets: '.navbar'
            }
        });

        gsap.utils.toArray('.stat-item h3').forEach(stat => {
            if (stat) {
                const finalValue = stat.textContent;
                const numericValue = parseFloat(finalValue) || 0;
                
                ScrollTrigger.create({
                    trigger: stat,
                    start: 'top 80%',
                    onEnter: () => {
                        gsap.from(stat, {
                            textContent: 0,
                            duration: 2,
                            ease: "power2.out",
                            snap: { textContent: numericValue > 10 ? 1 : 0.1 },
                            stagger: 0.1
                        });
                    }
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
        }

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (hamburger && navMenu) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        });
    }

    setupSmoothTrailCursor() {
        // Check if device supports cursor and is not mobile
        if (window.innerWidth <= 768 || 'ontouchstart' in window) {
            document.body.style.cursor = 'auto';
            return;
        }
        
        // Mouse position tracking
        let mouseX = 0;
        let mouseY = 0;
        
        // Create main cursor
        const cursor = document.createElement('div');
        cursor.className = 'cursor-trail';
        document.body.appendChild(cursor);
        
        // Create trail dots
        const trailLength = 6;
        const trails = [];
        
        for (let i = 0; i < trailLength; i++) {
            const dot = document.createElement('div');
            dot.className = 'cursor-trail-dot';
            dot.style.opacity = (trailLength - i) / trailLength * 0.7;
            dot.style.width = `${8 - i}px`;
            dot.style.height = `${8 - i}px`;
            document.body.appendChild(dot);
            
            trails.push({
                element: dot,
                x: 0,
                y: 0,
                currentX: 0,
                currentY: 0
            });
        }
        
        // Mouse move event
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Update main cursor position immediately
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });
        
        // Animate trail with smooth following
        const animateTrail = () => {
            let prevX = mouseX;
            let prevY = mouseY;
            
            trails.forEach((trail, index) => {
                // Calculate smooth following with delay
                const delay = (index + 1) * 0.1;
                trail.currentX += (prevX - trail.currentX) * (0.3 - delay * 0.02);
                trail.currentY += (prevY - trail.currentY) * (0.3 - delay * 0.02);
                
                // Update position
                trail.element.style.left = trail.currentX + 'px';
                trail.element.style.top = trail.currentY + 'px';
                
                // Set previous position for next dot
                prevX = trail.currentX;
                prevY = trail.currentY;
            });
            
            requestAnimationFrame(animateTrail);
        };
        
        // Start animation
        animateTrail();
        
        // Hover effects
        const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-chip, input, textarea, .timeline-icon, .social-link');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.classList.add('active');
                
                trails.forEach(trail => {
                    trail.element.style.transform = 'translate(-50%, -50%) scale(1.5)';
                    trail.element.style.transition = 'transform 0.3s ease';
                });
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.classList.remove('active');
                
                trails.forEach(trail => {
                    trail.element.style.transform = 'translate(-50%, -50%) scale(1)';
                });
            });
        });
        
        // Click ripple effect
        document.addEventListener('click', (e) => {
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: fixed;
                width: 40px;
                height: 40px;
                border: 2px solid #6366f1;
                border-radius: 50%;
                left: ${e.clientX}px;
                top: ${e.clientY}px;
                transform: translate(-50%, -50%);
                pointer-events: none;
                z-index: 9997;
                opacity: 1;
            `;
            
            document.body.appendChild(ripple);
            
            // Animate ripple
            let scale = 0;
            let opacity = 1;
            
            const animateRipple = () => {
                scale += 0.1;
                opacity -= 0.05;
                
                ripple.style.transform = `translate(-50%, -50%) scale(${scale})`;
                ripple.style.opacity = opacity;
                
                if (opacity > 0) {
                    requestAnimationFrame(animateRipple);
                } else {
                    if (document.body.contains(ripple)) {
                        document.body.removeChild(ripple);
                    }
                }
            };
            
            animateRipple();
        });
        
        console.log('Smooth trail cursor initialized');
    }


    setupFormHandling() {
        const form = document.querySelector('.contact-form');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            fetch('https://formspree.io/f/meozqqoj', {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    submitBtn.textContent = 'Message Sent!';
                    submitBtn.style.background = 'linear-gradient(45deg, #10b981, #059669)';
                    this.showNotification('Message sent successfully!', 'success');
                    form.reset();
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(error => {
                this.showNotification('Failed to send message. Please try again.', 'error');
            })
            .finally(() => {
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 2000);
            });
        });
    }

    setupSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        ScrollTrigger.create({
            trigger: '.skills',
            start: 'top 80%',
            onEnter: () => {
                skillBars.forEach(bar => {
                    const progress = bar.getAttribute('data-progress');
                    if (progress) {
                        gsap.to(bar, {
                            width: `${progress}%`,
                            duration: 1.5,
                            ease: "power2.out",
                            delay: Math.random() * 0.5
                        });
                    }
                });
            }
        });
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                
                if (targetId === '#' || !targetId) return;
                
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        gsap.fromTo(notification, 
            { opacity: 0, y: -50 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
        
        setTimeout(() => {
            gsap.to(notification, {
                opacity: 0,
                y: -50,
                duration: 0.5,
                ease: "power2.in",
                onComplete: () => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }
            });
        }, 3000);
    }
}

class YashvardhanPortfolio extends Portfolio {
    constructor() {
        super();
        this.setupAIAnimations();
        this.setupProjectInteractions();
        this.setupTechStack();
        this.setupCreativeAchievements();
        this.setupLogoMinigame();
    }

    setupLogoMinigame() {
        const logo = document.querySelector('.logo-link');
        if (logo) {
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                this.startSnakeGame();
            });
        }
    }

    startSnakeGame() {
        const gameContainer = document.createElement('div');
        gameContainer.className = 'snake-game-container';
        gameContainer.innerHTML = `
            <div class="snake-game">
                <div class="game-header">
                    <h3>YVT Snake Game</h3>
                    <button id="closeGame">×</button>
                </div>
                <canvas id="snakeCanvas" width="400" height="400"></canvas>
                <div class="game-controls">
                    <p>Score: <span id="score">0</span></p>
                    <p>Use arrow keys to play</p>
                </div>
            </div>
        `;
        
        gameContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        document.body.appendChild(gameContainer);
        
        this.initializeSnakeGame(gameContainer);
        
        document.getElementById('closeGame').addEventListener('click', () => {
            this.gameRunning = false;
            if (this.gameLoopId) {
                clearTimeout(this.gameLoopId);
            }
            if (this.snakeKeyHandler) {
                document.removeEventListener('keydown', this.snakeKeyHandler);
            }
            document.body.removeChild(gameContainer);
        });
    }

    initializeSnakeGame(gameContainer) {
        const canvas = document.getElementById('snakeCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        
        let snake = [{x: 10, y: 10}];
        let direction = {x: 0, y: 0};
        let food = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20)
        };
        let score = 0;
        this.gameRunning = true;
        
        const gameLoop = () => {
            if (!this.gameRunning) return;
            
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            if (direction.x !== 0 || direction.y !== 0) {
                const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
                
                if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
                    this.gameOver(score, gameContainer);
                    return;
                }
                
                if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                    this.gameOver(score, gameContainer);
                    return;
                }
                
                snake.unshift(head);
                
                if (head.x === food.x && head.y === food.y) {
                    score++;
                    scoreElement.textContent = score;
                    food = {
                        x: Math.floor(Math.random() * 20),
                        y: Math.floor(Math.random() * 20)
                    };
                } else {
                    snake.pop();
                }
            }
            
            ctx.fillStyle = '#6366f1';
            snake.forEach(segment => {
                ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
            });
            
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(food.x * 20, food.y * 20, 18, 18);
            
            this.gameLoopId = setTimeout(gameLoop, 150);
        };
        
        this.snakeKeyHandler = (e) => {
            if (!this.gameRunning) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    if (direction.y === 0) direction = {x: 0, y: -1};
                    break;
                case 'ArrowDown':
                    if (direction.y === 0) direction = {x: 0, y: 1};
                    break;
                case 'ArrowLeft':
                    if (direction.x === 0) direction = {x: -1, y: 0};
                    break;
                case 'ArrowRight':
                    if (direction.x === 0) direction = {x: 1, y: 0};
                    break;
            }
        };
        
        document.addEventListener('keydown', this.snakeKeyHandler);
        
        gameLoop();
    }

    gameOver(score, gameContainer) {
        this.gameRunning = false;
        const gameOverScreen = document.createElement('div');
        gameOverScreen.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 10001;
        `;
        gameOverScreen.innerHTML = `
            <h3>Game Over!</h3>
            <p>Your score: ${score}</p>
            <button onclick="this.parentElement.remove()" style="
                background: #6366f1;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">Close</button>
        `;
        gameContainer.appendChild(gameOverScreen);
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
                title: "BharatVaani - AI News Companion",
                description: "Multilingual AI-powered news summaries using HuggingFace Transformers with Flask backend, featuring What-If generator and TTS capabilities for breaking language barriers in news consumption.",
                tech: ["Python", "Flask", "HuggingFace", "TTS", "NewsAPI", "NLTK"],
                github: "https://github.com/Thanatos9404/BharatVaani",
                demo: "https://www.youtube.com/watch?v=wvOa9x7HVoI",
                thumbnail: "assets/images/bv.png",
                type: "AI/ML"
            },
            {
                title: "MoodMentor - Mental Health Predictor",
                description: "Anonymous mental health assessment tool built in Streamlit using custom ML models and TTS with fully animated, accessible UI for early mental health intervention.",
                tech: ["Streamlit", "Custom ML Model", "TTS", "Python", "Scikit-learn"],
                github: null,
                demo: null,
                thumbnail: "assets/images/moodmentor.png",
                type: "Healthcare AI",
                status: "Under Development",
                customModel: true
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

        console.log('Rendering projects:', projectsData.length); // Debug log
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
            const customModelBadge = project.customModel ? `<div class="custom-model-badge">Custom ML Model</div>` : '';
            
            const linksHTML = project.status === 'Under Development' ? 
                `<div class="project-links">
                    <span class="project-link disabled">Under Development</span>
                </div>` :
                `<div class="project-links">
                    <a href="${project.demo}" class="project-link" target="_blank" rel="noopener noreferrer">Watch Demo</a>
                    <a href="${project.github}" class="project-link" target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>`;
            
            projectCard.innerHTML = `
                <div class="project-image" style="background-image: url('${project.thumbnail}'); background-size: cover; background-position: center; background-repeat: no-repeat; min-height: 200px;">
                    <div class="project-type-badge">${project.type}</div>
                    ${statusBadge}
                    ${customModelBadge}
                    <div class="project-overlay">
                        ${linksHTML}
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
            
            projectsGrid.appendChild(projectCard);
            this.addProjectHoverEffects(projectCard);
        });
        
        console.log('Projects rendered. Grid children count:', projectsGrid.children.length);
    }

    addProjectHoverEffects(card) {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                y: -15,
                scale: 1.02,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                y: 0,
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }

    setupTechStack() {
        const techStack = [
            'Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenCV', 'NLTK',
            'HuggingFace', 'Streamlit', 'Flask', 'Pandas', 'NumPy',
            'Matplotlib', 'Seaborn', 'Jupyter', 'MediaPipe', 'Firebase'
        ];
        
        this.createFloatingTechBadges(techStack);
    }

    createFloatingTechBadges(technologies) {
        const techContainer = document.createElement('div');
        techContainer.className = 'floating-tech-stack';
        techContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            pointer-events: none;
            z-index: 1;
            opacity: 0.04;
        `;
        
        document.body.appendChild(techContainer);
        
        technologies.forEach((tech, index) => {
            const badge = document.createElement('div');
            badge.className = 'tech-badge';
            badge.textContent = tech;
            badge.style.cssText = `
                position: absolute;
                background: linear-gradient(45deg, #6366f1, #8b5cf6);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
            `;
            
            techContainer.appendChild(badge);
            
            gsap.to(badge, {
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50,
                rotation: Math.random() * 180,
                duration: 25 + Math.random() * 15,
                repeat: -1,
                yoyo: true,
                ease: "none"
            });
        });
    }

    setupCreativeAchievements() {
        const achievements = [
            { text: "SIH 2024 🏆", icon: "🏆", color: "#f59e0b" },
            { text: "Python 5⭐", icon: "⭐", color: "#ffcc02" },
            { text: "CGPA 9.3 📚", icon: "📚", color: "#6366f1" },
            { text: "AI Expert 🤖", icon: "🤖", color: "#06b6d4" }
        ];
        
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                this.createSubtleAchievement(achievement);
            }, index * 8000);
        });
    }

    createSubtleAchievement(achievement) {
        const badge = document.createElement('div');
        badge.className = 'subtle-achievement';
        badge.innerHTML = `
            <span class="achievement-text">${achievement.text}</span>
        `;
        
        badge.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: -200px;
            background: ${achievement.color};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            z-index: 100;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(badge);
        
        gsap.to(badge, {
            right: 20,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                setTimeout(() => {
                    gsap.to(badge, {
                        right: -200,
                        duration: 0.5,
                        ease: "power2.in",
                        onComplete: () => {
                            if (document.body.contains(badge)) {
                                document.body.removeChild(badge);
                            }
                        }
                    });
                }, 3000);
            }
        });
    }

    setupDataFlowAnimation() {
        for (let i = 0; i < 4; i++) {
            const particle = document.createElement('div');
            particle.className = 'data-particle';
            particle.style.cssText = `
                position: fixed;
                width: 2px;
                height: 2px;
                background: #6366f1;
                border-radius: 50%;
                pointer-events: none;
                z-index: 1;
                opacity: 0.3;
            `;
            
            document.body.appendChild(particle);
            
            gsap.set(particle, {
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50
            });
            
            gsap.to(particle, {
                y: -50,
                duration: 15 + Math.random() * 10,
                repeat: -1,
                ease: "none",
                delay: Math.random() * 15
            });
        }
    }
}

// Initialize portfolio
new YashvardhanPortfolio();
