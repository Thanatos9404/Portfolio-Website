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
    // Ensure all 5 projects are rendered with correct data
    const projects = [
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
            title: "MoodMentor - Mental Health Predictor",
            description: "Anonymous mental health assessment tool built in Streamlit using custom ML models and TTS with fully animated, accessible UI for early mental health intervention.",
            tech: ["Streamlit", "Custom ML Model", "TTS", "Python", "Scikit-learn"],
            status: "Under Development",
            impact: "Early mental health assessment",
            github: null,
            demo: null,
            thumbnail: "assets/images/moodmentor.png",
            customModel: true
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
        
        const statusBadge = project.status ? `<div class="project-status ${project.status.toLowerCase().replace(' ', '-')}">${project.status}</div>` : '';
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
            <div class="project-image" style="background-image: url('${project.thumbnail}'); background-size: cover; background-position: center; background-repeat: no-repeat;">
                <div class="project-type-badge">${project.tech[0]}</div>
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
                    ${project.tech.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
                </div>
                <div class="project-stats">
                    <div class="stat">
                        <span class="stat-label">Impact:</span>
                        <span class="stat-value">${project.impact}</span>
                    </div>
                </div>
            </div>
        `;
        
        projectsGrid.appendChild(projectCard);
        
        addAIProjectHoverEffects(projectCard);
    });
    
    // Update project counter in about stats
    updateProjectCounter(projects.length);
}

function updateProjectCounter(count) {
    const statItems = document.querySelectorAll('.stat-item');
    if (statItems.length >= 2) {
        const projectStat = statItems[1];
        const projectH3 = projectStat.querySelector('h3');
        if (projectH3) {
            projectH3.textContent = `${count}+`;
        }
    }
}

function addAIProjectHoverEffects(card) {
    card.addEventListener('mouseenter', () => {
        gsap.to(card, {
            y: -15,
            scale: 1.02,
            rotateX: 5,
            rotateY: 5,
            duration: 0.3,
            ease: "power2.out"
        });
        
        createHoverParticles(card);
    });
    
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            y: 0,
            scale: 1,
            rotateX: 0,
            rotateY: 0,
            duration: 0.3,
            ease: "power2.out"
        });
    });
}

function createHoverParticles(element) {
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'hover-particle';
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: #6366f1;
            border-radius: 50%;
            left: ${rect.left + Math.random() * rect.width}px;
            top: ${rect.top + Math.random() * rect.height}px;
            pointer-events: none;
            z-index: 1000;
        `;
        
        document.body.appendChild(particle);
        
        gsap.to(particle, {
            y: -50,
            x: (Math.random() - 0.5) * 100,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            onComplete: () => {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            }
        });
    }
}

function setupMLSkillAnimations() {
    // Enhanced skills with all requested additions
    const skills = [
        // Programming Languages
        { name: 'Python', level: 95, category: 'Programming' },
        { name: 'C', level: 70, category: 'Programming' },
        { name: 'HTML', level: 90, category: 'Programming' },
        { name: 'CSS', level: 90, category: 'Programming' },
        { name: 'JavaScript', level: 75, category: 'Programming' },
        
        // AI/ML Frameworks
        { name: 'TensorFlow', level: 85, category: 'AI/ML' },
        { name: 'PyTorch', level: 80, category: 'AI/ML' },
        { name: 'Scikit-learn', level: 90, category: 'AI/ML' },
        { name: 'Keras', level: 85, category: 'AI/ML' },
        { name: 'HuggingFace', level: 92, category: 'AI/ML' },
        
        // Computer Vision & NLP
        { name: 'OpenCV', level: 88, category: 'Computer Vision' },
        { name: 'MediaPipe', level: 85, category: 'Computer Vision' },
        { name: 'NLTK', level: 82, category: 'NLP' },
        { name: 'Dlib', level: 75, category: 'Computer Vision' },
        { name: 'IndicTrans', level: 78, category: 'NLP' },
        
        // Data Science & Tools
        { name: 'Streamlit', level: 94, category: 'Web Development' },
        { name: 'Flask', level: 87, category: 'Web Development' },
        { name: 'Matplotlib', level: 88, category: 'Data Science' },
        { name: 'Seaborn', level: 75, category: 'Data Science' },
        { name: 'Jupyter', level: 90, category: 'Data Science' },
        { name: 'Pandas', level: 93, category: 'Data Science' },
        { name: 'NumPy', level: 91, category: 'Data Science' },
        { name: 'TTS', level: 82, category: 'AI/ML' }
    ];
    
    enhanceSkillBars(skills);
}

function enhanceSkillBars(skills) {
    const skillsGrid = document.querySelector('.skills-grid');
    if (!skillsGrid) return;
    
    // Group skills by category
    const groupedSkills = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(skill);
        return acc;
    }, {});
    
    skillsGrid.innerHTML = '';
    
    Object.entries(groupedSkills).forEach(([category, categorySkills], index) => {
        const skillCategory = document.createElement('div');
        skillCategory.className = 'skill-category ai-enhanced';
        skillCategory.setAttribute('data-aos', 'fade-up');
        skillCategory.setAttribute('data-aos-delay', `${index * 100}`);
        
        skillCategory.innerHTML = `
            <h3>${category}</h3>
            <div class="skill-items">
                ${categorySkills.map(skill => `
                    <div class="skill-item">
                        <div class="skill-header">
                            <span class="skill-name">${skill.name}</span>
                            <span class="skill-percentage">${skill.level}%</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress" data-progress="${skill.level}">
                                <div class="skill-glow"></div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        skillsGrid.appendChild(skillCategory);
    });
    
    // Animate skill bars when in view
    ScrollTrigger.create({
        trigger: '.skills',
        start: 'top 80%',
        onEnter: () => {
            document.querySelectorAll('.skill-progress').forEach((bar, index) => {
                const progress = bar.getAttribute('data-progress');
                gsap.to(bar, {
                    width: `${progress}%`,
                    duration: 1.5,
                    ease: "power2.out",
                    delay: index * 0.1
                });
            });
        }
    });
}

function setupAchievementSystem() {
    // Achievement system is handled in main.js
    console.log('Achievement system loaded');
}

function setupAIContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            validateAIInput(e.target);
        });
        
        input.addEventListener('focus', (e) => {
            createFocusEffect(e.target);
        });
    });
    
    form.addEventListener('submit', handleAIFormSubmission);
}

function validateAIInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let message = '';
    
    switch(input.type) {
        case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            message = isValid ? '✓ Valid email' : '✗ Invalid email format';
            break;
        case 'text':
            isValid = value.length >= 2;
            message = isValid ? '✓ Looks good' : '✗ Too short';
            break;
        default:
            isValid = value.length >= 10;
            message = isValid ? '✓ Good message' : '✗ Message too short';
    }
    
    showValidationMessage(input, message, isValid);
}

function showValidationMessage(input, message, isValid) {
    let messageElement = input.parentNode.querySelector('.validation-message');
    
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.className = 'validation-message';
        input.parentNode.appendChild(messageElement);
    }
    
    messageElement.textContent = message;
    messageElement.style.color = isValid ? '#10b981' : '#ef4444';
    messageElement.style.fontSize = '0.8rem';
    messageElement.style.marginTop = '5px';
}

function createFocusEffect(input) {
    const rect = input.getBoundingClientRect();
    
    for (let i = 0; i < 3; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 2px;
            height: 2px;
            background: #6366f1;
            border-radius: 50%;
            left: ${rect.left + Math.random() * rect.width}px;
            top: ${rect.top + Math.random() * rect.height}px;
            pointer-events: none;
            z-index: 1000;
        `;
        
        document.body.appendChild(particle);
        
        gsap.to(particle, {
            y: -30,
            x: (Math.random() - 0.5) * 50,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            onComplete: () => {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            }
        });
    }
}

function handleAIFormSubmission(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.innerHTML = `
        <div class="ai-loading">
            <div class="loading-dots">
                <div></div><div></div><div></div>
            </div>
            Processing with AI...
        </div>
    `;
    
    submitBtn.disabled = true;
    
    // Submit to Formspree
    fetch('https://formspree.io/f/meozqqoj', {
        method: 'POST',
        body: new FormData(e.target),
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            submitBtn.textContent = 'Message Sent Successfully!';
            submitBtn.style.background = 'linear-gradient(45deg, #10b981, #059669)';
            createSuccessAnimation();
            e.target.reset();
        } else {
            throw new Error('Form submission failed');
        }
    })
    .catch(error => {
        submitBtn.textContent = 'Failed to send. Please try again.';
        submitBtn.style.background = 'linear-gradient(45deg, #ef4444, #dc2626)';
    })
    .finally(() => {
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
        }, 3000);
    });
}

function createSuccessAnimation() {
    const successElement = document.createElement('div');
    successElement.innerHTML = '🎉 Message sent successfully!';
    successElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #10b981, #059669);
        color: white;
        padding: 20px 40px;
        border-radius: 50px;
        font-weight: bold;
        font-size: 1.2rem;
        z-index: 1000;
        opacity: 0;
        scale: 0;
    `;
    
    document.body.appendChild(successElement);
    
    gsap.to(successElement, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)"
    });
    
    setTimeout(() => {
        gsap.to(successElement, {
            opacity: 0,
            scale: 0,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                if (document.body.contains(successElement)) {
                    document.body.removeChild(successElement);
                }
            }
        });
    }, 3000);
}

function setupCodingAnimation() {
    const codeLines = [
        "import tensorflow as tf",
        "from transformers import pipeline",
        "import pandas as pd",
        "import numpy as np",
        "model = tf.keras.Sequential([",
        "    tf.keras.layers.Dense(128, activation='relu'),",
        "    tf.keras.layers.Dropout(0.2),",
        "    tf.keras.layers.Dense(10, activation='softmax')",
        "])",
        "model.compile(optimizer='adam',",
        "              loss='sparse_categorical_crossentropy',",
        "              metrics=['accuracy'])",
        "history = model.fit(X_train, y_train, epochs=10)"
    ];
    
    let currentLine = 0;
    
    setInterval(() => {
        if (Math.random() < 0.1) {
            showCodeLine(codeLines[currentLine]);
            currentLine = (currentLine + 1) % codeLines.length;
        }
    }, 1000);
}

function showCodeLine(code) {
    const codeLine = document.createElement('div');
    codeLine.className = 'floating-code-line';
    codeLine.textContent = code;
    codeLine.style.cssText = `
        position: fixed;
        right: -400px;
        top: ${Math.random() * (window.innerHeight - 100)}px;
        background: rgba(26, 26, 26, 0.9);
        color: #6366f1;
        padding: 8px 16px;
        border-radius: 5px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        z-index: 1;
        backdrop-filter: blur(5px);
        border: 1px solid rgba(99, 102, 241, 0.3);
    `;
    
    document.body.appendChild(codeLine);
    
    gsap.to(codeLine, {
        right: 20,
        duration: 2,
        ease: "power2.out"
    });
    
    setTimeout(() => {
        gsap.to(codeLine, {
            right: -400,
            duration: 2,
            ease: "power2.in",
            onComplete: () => {
                if (document.body.contains(codeLine)) {
                    document.body.removeChild(codeLine);
                }
            }
        });
    }, 4000);
}

function setupAIInteractions() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            createButtonParticles(button);
            gsap.to(button, {
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });
}

function createButtonParticles(button) {
    const rect = button.getBoundingClientRect();
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 3px;
            height: 3px;
            background: #6366f1;
            border-radius: 50%;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            pointer-events: none;
            z-index: 1000;
        `;
        
        document.body.appendChild(particle);
        
        const angle = (i / 8) * Math.PI * 2;
        const distance = 50;
        
        gsap.to(particle, {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            }
        });
    }
}

function setupMLAnimations() {
    ScrollTrigger.create({
        trigger: '.about',
        start: 'top center',
        onEnter: () => {
            createMLVisualization();
        }
    });
}

function createMLVisualization() {
    const visualization = document.createElement('div');
    visualization.className = 'ml-visualization';
    visualization.innerHTML = `
        <div class="ml-process">
            <div class="ml-step active">Data Collection</div>
            <div class="ml-step">Preprocessing</div>
            <div class="ml-step">Model Training</div>
            <div class="ml-step">Evaluation</div>
            <div class="ml-step">Deployment</div>
        </div>
    `;
    
    visualization.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(26, 26, 26, 0.9);
        border-radius: 10px;
        padding: 15px;
        z-index: 1000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(99, 102, 241, 0.3);
    `;
    
    document.body.appendChild(visualization);
    
    const steps = visualization.querySelectorAll('.ml-step');
    let currentStep = 0;
    
    setInterval(() => {
        steps.forEach(step => step.classList.remove('active'));
        steps[currentStep].classList.add('active');
        currentStep = (currentStep + 1) % steps.length;
    }, 2000);
    
    setTimeout(() => {
        gsap.to(visualization, {
            opacity: 0,
            y: 50,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                if (document.body.contains(visualization)) {
                    document.body.removeChild(visualization);
                }
            }
        });
    }, 15000);
}

function setupRealTimeUpdates() {
    updateStatsRealTime();
    setInterval(updateStatsRealTime, 30000);
}

function updateStatsRealTime() {
    const statItems = document.querySelectorAll('.stat-item h3');
    
    if (statItems.length >= 3) {
        const certifications = parseInt(statItems[0].textContent) || 15;
        const projects = parseInt(statItems[1].textContent) || 5;
        const cgpa = parseFloat(statItems[2].textContent) || 9.3;
        
        gsap.to(statItems[0], {
            textContent: certifications + Math.floor(Math.random() * 1),
            duration: 1,
            snap: { textContent: 1 }
        });
        
        gsap.to(statItems[1], {
            textContent: projects,
            duration: 1,
            snap: { textContent: 1 }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadUI();
});
