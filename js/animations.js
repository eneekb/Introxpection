/**
 * Introxpection - Animations et interactions
 * Effets visuels pour améliorer l'expérience utilisateur
 */

class QuizAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupIntersectionObserver();
        this.setupHoverEffects();
        this.setupScrollAnimations();
        this.setupParticleEffects();
        this.setupLoadingAnimations();
    }
    
    /**
     * Observer d'intersection pour les animations au scroll
     */
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observer tous les éléments avec la classe 'animate-on-scroll'
        document.querySelectorAll('.test-card, .mini-test-card, .stat-item').forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }
    
    /**
     * Effets de survol améliorés
     */
    setupHoverEffects() {
        // Effet de parallax léger sur les cartes de test
        document.querySelectorAll('.test-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = (y - centerY) / centerY * 5;
                    const rotateY = (centerX - x) / centerX * 5;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
        
        // Effet de pulsation sur les boutons
        document.querySelectorAll('.test-btn, .nav-btn, .action-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.addPulseEffect(btn);
            });
        });
    }
    
    /**
     * Animations de scroll
     */
    setupScrollAnimations() {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Parallax header
            const header = document.querySelector('.header');
            if (header) {
                const parallaxSpeed = 0.5;
                header.style.transform = `translateY(${currentScrollY * parallaxSpeed}px)`;
            }
            
            // Animation de la barre de progression sticky
            const progressContainer = document.querySelector('.progress-container');
            if (progressContainer) {
                if (currentScrollY > 100) {
                    progressContainer.classList.add('scrolled');
                } else {
                    progressContainer.classList.remove('scrolled');
                }
            }
            
            lastScrollY = currentScrollY;
        });
    }
    
    /**
     * Effets de particules subtiles
     */
    setupParticleEffects() {
        // Particules flottantes dans le header
        this.createFloatingParticles();
        
        // Effet de confetti lors de la completion d'un quiz
        this.setupConfettiTrigger();
    }
    
    /**
     * Particules flottantes
     */
    createFloatingParticles() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float-particle ${3 + Math.random() * 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            
            header.appendChild(particle);
        }
    }
    
    /**
     * Configuration des animations de chargement
     */
    setupLoadingAnimations() {
        // Animation de la barre de progression
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateProgressBar(bar);
                    }
                });
            });
            observer.observe(bar);
        });
        
        // Animation des chiffres de statistiques
        this.animateCounters();
    }
    
    /**
     * Animation des compteurs de statistiques
     */
    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent);
            const duration = 1000; // 1 seconde
            const steps = 60; // 60 fps
            const increment = target / steps;
            let current = 0;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= target) {
                                current = target;
                                clearInterval(timer);
                            }
                            counter.textContent = Math.floor(current);
                        }, duration / steps);
                        
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(counter);
        });
    }
    
    /**
     * Animation de la barre de progression
     */
    animateProgressBar(bar) {
        const targetWidth = bar.dataset.progress || '0%';
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.transition = 'width 1s ease-out';
            bar.style.width = targetWidth;
        }, 100);
    }
    
    /**
     * Effet de pulsation
     */
    addPulseEffect(element) {
        element.style.animation = 'pulse 0.6s ease-in-out';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }
    
    /**
     * Système de confetti
     */
    setupConfettiTrigger() {
        // Déclencher les confetti quand les résultats apparaissent
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && 
                        node.classList && 
                        node.classList.contains('results-container')) {
                        this.triggerConfetti();
                    }
                });
            });
        });
        
        const quizContent = document.querySelector('.quiz-content');
        if (quizContent) {
            observer.observe(quizContent, { childList: true, subtree: true });
        }
    }
    
    /**
     * Effet de confetti
     */
    triggerConfetti() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return; // Respecter les préférences d'accessibilité
        }
        
        const colors = ['#6B73FF', '#FFB3BA', '#BAFFC9', '#FFF'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * window.innerWidth}px;
                top: -10px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: confetti-fall ${2 + Math.random() * 2}s ease-out forwards;
                transform: rotate(${Math.random() * 360}deg);
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 4000);
        }
    }
    
    /**
     * Animation de typing pour les textes
     */
    static typeWriter(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        
        const timer = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            
            if (i > text.length) {
                clearInterval(timer);
            }
        }, speed);
    }
    
    /**
     * Effet de shake pour les erreurs
     */
    static shake(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
    
    /**
     * Animation de bounce
     */
    static bounce(element) {
        element.style.animation = 'bounce 0.6s ease';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }
}

/**
 * Système de transitions de page
 */
class PageTransitions {
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
    }
    
    static slideIn(element, direction = 'up', duration = 300) {
        const transforms = {
            up: 'translateY(20px)',
            down: 'translateY(-20px)',
            left: 'translateX(20px)',
            right: 'translateX(-20px)'
        };
        
        element.style.transform = transforms[direction];
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.transform = 'translate(0)';
            element.style.opacity = '1';
        }, 10);
    }
    
    static fadeOut(element, duration = 300) {
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        element.style.opacity = '0';
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }
}

// Ajout des styles CSS pour les animations via JavaScript
const animationStyles = `
    @keyframes float-particle {
        0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.3;
        }
        50% { 
            transform: translateY(-20px) rotate(180deg); 
            opacity: 0.8;
        }
    }
    
    @keyframes confetti-fall {
        0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }
    
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease-out;
    }
    
    .animate-on-scroll.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .progress-container.scrolled {
        box-shadow: var(--shadow-md);
    }
    
    @media (prefers-reduced-motion: reduce) {
        .animate-on-scroll,
        .floating-particle,
        .test-card {
            animation: none !important;
            transition: none !important;
        }
    }
`;

// Injecter les styles
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

// Initialiser les animations quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.quizAnimations = new QuizAnimations();
});

// Export pour utilisation modulaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuizAnimations, PageTransitions };
}
