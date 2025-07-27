export function loadUI() {
    console.log('Loading Yashvardhan\'s AI-themed UI components');
    initializeAIComponents();
    setupAIInteractions();
    setupMLAnimations();
    setupRealTimeUpdates();
}

function initializeAIComponents() {
    console.log('Initializing AI-themed UI components...');
    setupAIProjectShowcase();
    setupMLSkillAnimations();
    setupAchievementSystem();
    setupAIContactForm();
    setupCodingAnimation();
}

function setupAIProjectShowcase() {
    // Updated projects array with MindScope replacing MoodMentor
    const projects = [
        {
            title: "MindScope - Mental Health Companion",
            description: "AI-powered mental health companion app built with React and Next.js, featuring mood tracking, AI chat support, journaling with sentiment analysis, and crisis resources. Uses Llama 3.3-70B model via Together API for empathetic AI responses.",
            tech: ["React", "Next.js", "Together API", "Llama 3.3", "Sentiment Analysis", "Local Storage"],
            status: "Live",
            impact: "Supporting mental wellness with AI",
            github: "https://github.com/Thanatos9404/MindScope",
            demo: "https://www.youtube.com/watch?v=kxeXPPel3gM",
            live: "https://mindscope-yt.vercel.app/",
            thumbnail: "assets/images/ms.jpg",
            customModel: true
        },
        {
            title: "BharatVaani - AI News Companion",
            description: "Multilingual AI-powered news summaries using HuggingFace Transformers with Flask backend, featuring What-If generator and TTS capabilities for breaking language barriers in news consumption.",
            tech: ["Python", "Flask", "HuggingFace", "TTS", "NewsAPI", "NLTK"],
            status: "Live",
            impact: "Addresses regional news accessibility",
            github: "https://github.com/Thanatos9404/BharatVaani",
            demo: "https://www.youtube.com/watch?v=wvOa9x7HVoI",
            thumbnail: "assets/images/bv.png"
        },
        {
            title: "Gesture-Controlled Media Player",
            description: "OpenCV-based media controller using hand gesture recognition for users with physical limitations or multitasking scenarios, featuring real-time hand tracking.",
            tech: ["OpenCV", "Python", "MediaPipe", "Computer Vision", "Tkinter"],
            status: "Completed",
            impact: "Accessibility for disabled users",
            github: "https://github.com/Thanatos9404/Gesture-Controlled-Media-Player",
            demo: "https://www.youtube.com/watch?v=8zGOxWsqTt4",
            thumbnail: "assets/images/gcmp.png"
        },
        {
            title: "AI Cheating Detector",
            description: "Real-time proctoring system using facial landmark detection and head tracking to flag suspicious behavior during online exams with advanced computer vision.",
            tech: ["Dlib", "OpenCV", "Python", "Facial Recognition", "Machine Learning"],
            status: "Completed",
            impact: "Online exam security",
            github: "https://github.com/Thanatos9404/Cheating-Detection-Proctoring-App",
            demo: "https://www.youtube.com/watch?v=9dKg8s2H-30",
            thumbnail: "assets/images/cdpa.png"
        },
        {
            title: "AI News Summarizer",
            description: "Advanced NLP-based news summarization tool using transformer models for extracting key information from news articles with support for multiple languages and customizable summary lengths.",
            tech: ["NLP", "Python", "Transformers", "Streamlit", "BeautifulSoup", "NLTK"],
            status: "Completed",
            impact: "Quick information consumption",
            github: "https://github.com/Thanatos9404/AI-News-Summarizer",
            demo: "https://www.youtube.com/watch?v=Kx9tlg1aa4A",
            thumbnail: "assets/images/ans.png"
        }
    ];

    enhanceProjectCards(projects);
}

function enhanceProjectCards(projects) {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

    projectsGrid.innerHTML = '';

    projects.forEach((project, index) => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card ai-enhanced';
        projectCard.setAttribute('data-aos', 'fade-up');
        projectCard.setAttribute('data-aos-delay', `${index * 100}`);

        const statusBadge = project.status ? `<div class="project-status-badge ${project.status.toLowerCase()}">${project.status}</div>` : '';
        const customModelBadge = project.customModel ? '<div class="custom-model-badge">Custom AI Model</div>' : '';
        
        const liveLink = project.live ? `<a href="${project.live}" target="_blank" class="project-link" rel="noopener">Live App</a>` : '';
        const demoLink = project.demo ? `<a href="${project.demo}" target="_blank" class="project-link" rel="noopener">Demo</a>` : '';
        const githubLink = project.github ? `<a href="${project.github}" target="_blank" class="project-link" rel="noopener">GitHub</a>` : '<span class="project-link disabled">Private Repo</span>';

        projectCard.innerHTML = `
            <div class="project-image" style="background-image: url('${project.thumbnail}');">
                ${statusBadge}
                ${customModelBadge}
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
                    ${project.tech.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-impact">
                    <small><strong>Impact:</strong> ${project.impact}</small>
                </div>
            </div>
        `;

        // Enhanced hover effects
        projectCard.addEventListener('mouseenter', () => {
            createParticleEffect(projectCard);
        });

        // Add click ripple effect
        projectCard.addEventListener('click', (e) => {
            createRippleEffect(e, projectCard);
        });

        projectsGrid.appendChild(projectCard);
    });
}

function createParticleEffect(element) {
    for (let i = 0; i < 3; i++) {
        const particle = document.createElement('div');
        particle.className = 'ai-particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: #6366f1;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: particleFloat 2s ease-out forwards;
        `;
        
        element.style.position = 'relative';
        element.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }
}

function createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1000;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

function setupMLSkillAnimations() {
    const skillCategories = document.querySelectorAll('.skill-category');
    
    skillCategories.forEach((category, index) => {
        // Add AI-themed animations
        category.addEventListener('mouseenter', () => {
            category.style.transform = 'translateY(-5px) scale(1.02)';
            category.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.2)';
        });
        
        category.addEventListener('mouseleave', () => {
            category.style.transform = 'translateY(0) scale(1)';
            category.style.boxShadow = 'none';
        });
        
        // Animate skill bars with AI effect
        const skillBars = category.querySelectorAll('.skill-progress');
        skillBars.forEach((bar, skillIndex) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            const width = bar.getAttribute('data-width') || '90%';
                            bar.style.width = width;
                            bar.style.background = 'linear-gradient(45deg, #6366f1, #8b5cf6, #06b6d4)';
                            bar.style.backgroundSize = '300% 300%';
                            bar.style.animation = 'gradientShift 2s ease-in-out infinite';
                        }, skillIndex * 200);
                    }
                });
            });
            observer.observe(bar);
        });
    });
}

function setupAchievementSystem() {
    const achievements = [
        { text: "🏆 5-Star Python Programmer on HackerRank!", delay: 3000 },
        { text: "🎯 5+ AI/ML Projects Completed!", delay: 6000 },
        { text: "🚀 BIT Mesra Computer Applications Student!", delay: 9000 },
        { text: "💡 Custom ML Models Deployed!", delay: 12000 },
        { text: "🌟 Multilingual AI Systems Developer!", delay: 15000 }
    ];
    
    achievements.forEach((achievement, index) => {
        setTimeout(() => {
            showFloatingAchievement(achievement.text);
        }, achievement.delay);
    });
}

function showFloatingAchievement(text) {
    const achievement = document.createElement('div');
    achievement.className = 'floating-achievement';
    achievement.textContent = text;
    achievement.style.cssText = `
        position: fixed;
        top: 20px;
        left: -300px;
        background: linear-gradient(45deg, #6366f1, #8b5cf6);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-weight: 500;
        z-index: 1000;
        font-size: 0.9rem;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        animation: achievementSlide 8s ease-in-out forwards;
    `;
    
    document.body.appendChild(achievement);
    
    setTimeout(() => {
        if (document.body.contains(achievement)) {
            document.body.removeChild(achievement);
        }
    }, 8000);
}

function setupAIContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    const inputs = contactForm.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.style.borderColor = '#6366f1';
            input.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
        });
        
        input.addEventListener('blur', () => {
            input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            input.style.boxShadow = 'none';
        });
        
        // AI typing effect for placeholders
        input.addEventListener('input', () => {
            if (input.value.length > 0) {
                input.style.background = 'rgba(99, 102, 241, 0.05)';
            } else {
                input.style.background = 'rgba(255, 255, 255, 0.1)';
            }
        });
    });
}

function setupCodingAnimation() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    // Create coding animation overlay
    const codeOverlay = document.createElement('div');
    codeOverlay.className = 'code-animation-overlay';
    codeOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2;
        opacity: 0.1;
    `;
    
    const codeSnippets = [
        'import tensorflow as tf',
        'from transformers import pipeline',
        'import pandas as pd',
        'model = tf.keras.Sequential()',
        'classifier = pipeline("sentiment-analysis")',
        'df = pd.read_csv("data.csv")',
        'model.compile(optimizer="adam")',
        'predictions = model.predict(X_test)'
    ];
    
    setInterval(() => {
        if (Math.random() > 0.7) {
            const codeLine = document.createElement('div');
            codeLine.className = 'floating-code';
            codeLine.textContent = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
            codeLine.style.cssText = `
                position: absolute;
                color: #6366f1;
                font-family: 'Courier New', monospace;
                font-size: 0.8rem;
                left: ${Math.random() * 80}%;
                top: ${Math.random() * 80}%;
                animation: codeFloat 5s linear forwards;
                pointer-events: none;
            `;
            
            codeOverlay.appendChild(codeLine);
            
            setTimeout(() => {
                if (codeLine.parentNode) {
                    codeLine.parentNode.removeChild(codeLine);
                }
            }, 5000);
        }
    }, 2000);
    
    heroSection.appendChild(codeOverlay);
}

function setupAIInteractions() {
    // Enhanced scroll animations for AI theme
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Add AI particle effect
                if (entry.target.classList.contains('project-card')) {
                    setTimeout(() => {
                        createAIParticles(entry.target);
                    }, 300);
                }
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    document.querySelectorAll('.project-card, .skill-category, .stat-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

function createAIParticles(element) {
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'ai-particle';
        particle.style.cssText = `
            position: absolute;
            width: 3px;
            height: 3px;
            background: #6366f1;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: aiParticleFloat 3s ease-out forwards;
        `;
        
        element.style.position = 'relative';
        element.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 3000);
    }
}

function setupMLAnimations() {
    // Neural network visualization in hero section
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        const neuralNet = document.createElement('div');
        neuralNet.className = 'neural-network';
        neuralNet.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.1;
        `;
        
        // Create neural network nodes
        for (let i = 0; i < 12; i++) {
            const node = document.createElement('div');
            node.className = 'neural-node';
            node.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: #6366f1;
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: neuralPulse ${2 + Math.random() * 2}s ease-in-out infinite;
            `;
            neuralNet.appendChild(node);
        }
        
        heroContent.style.position = 'relative';
        heroContent.appendChild(neuralNet);
    }
}

function setupRealTimeUpdates() {
    // Simulate real-time AI processing
    const stats = document.querySelectorAll('.stat-item h3');
    
    stats.forEach((stat, index) => {
        if (stat.textContent.includes('+')) {
            const baseNumber = parseInt(stat.textContent.replace('+', ''));
            let currentNumber = 0;
            
            const increment = () => {
                if (currentNumber < baseNumber) {
                    currentNumber++;
                    stat.textContent = currentNumber + '+';
                    setTimeout(increment, 50);
                }
            };
            
            // Start animation when element comes into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(increment, index * 200);
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(stat);
        }
    });
}

// Add CSS animations to the document
const style = document.createElement('style');
style.textContent = `
    @keyframes particleFloat {
        0% { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-50px) scale(0); opacity: 0; }
    }
    
    @keyframes achievementSlide {
        0%, 15% { left: -300px; }
        20%, 80% { left: 20px; }
        85%, 100% { left: -300px; }
    }
    
    @keyframes codeFloat {
        0% { transform: translateY(0); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateY(-100px); opacity: 0; }
    }
    
    @keyframes aiParticleFloat {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(0) translateY(-30px); opacity: 0; }
    }
    
    @keyframes neuralPulse {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.5); opacity: 1; }
    }
    
    @keyframes ripple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(4); opacity: 0; }
    }
    
    @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
    }
    
    .project-impact {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        color: #a0a0a0;
        font-size: 0.9rem;
    }
    
    .tech-tag {
        transition: all 0.3s ease;
    }
    
    .tech-tag:hover {
        background: rgba(99, 102, 241, 0.3) !important;
        transform: translateY(-2px);
    }
    
    .project-status-badge {
        position: absolute;
        top: 15px;
        left: 15px;
        padding: 5px 12px;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: 500;
        z-index: 10;
    }
    
    .project-status-badge.live {
        background: rgba(16, 185, 129, 0.9);
        color: white;
    }
    
    .project-status-badge.completed {
        background: rgba(99, 102, 241, 0.9);
        color: white;
    }
`;

document.head.appendChild(style);
