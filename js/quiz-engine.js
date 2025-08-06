/**
     * Sélection d'une réponse avec passage automatique à la question suivante
     */
    selectAnswerAndAdvance(answerIndex) {
        // Sélectionner la réponse
        this.selectAnswer(answerIndex, true);
        
        // Attendre un peu pour l'animation puis passer à la question suivante
        setTimeout(() => {
            if (this.currentQuestion < this.config.questions.length - 1) {
                this.nextQuestionWithSlide();
            } else {
                this.completeQuiz();
            }
        }, 800); // Délai pour voir la sélection
    }
    
    /**
     * Question suivante avec animation de glissement
     */
    nextQuestionWithSlide() {
        const container = document.querySelector('.quiz-content');
        
        // Animation de sortie
        container.classList.add('slide-out-left');
        
        setTimeout(() => {
            // Changer de question
            this.currentQuestion++;
            this.renderQuestion();
            this.updateProgress();
            
            // Animation d'entrée
            container.classList.remove('slide-out-left');
            container.classList.add('slide-in-right');
            
            // Nettoyer les classes d'animation
            setTimeout(() => {
                container.classList.remove('slide-in-right');
            }, 400);
            
            this.scrollToTop();
        }, 200);
    }/**
 * Introxpection - Moteur de quiz réutilisable
 * Système de quiz modulaire pour tous les tests de personnalité
 */

class QuizEngine {
    constructor(config) {
        this.config = config;
        this.currentQuestion = 0;
        this.answers = {};
        this.scores = {};
        this.isComplete = false;
        
        // Initialiser les scores pour chaque profil
        this.config.profiles.forEach(profile => {
            this.scores[profile.id] = 0;
        });
        
        this.init();
    }
    
    /**
     * Initialisation du quiz
     */
    init() {
        this.renderQuestion();
        this.updateProgress();
        this.bindEvents();
        this.addAnimations();
    }
    
    /**
     * Rendu de la question courante
     */
    renderQuestion() {
        const question = this.config.questions[this.currentQuestion];
        const container = document.querySelector('.quiz-content');
        
        if (!container) {
            console.error('Container .quiz-content non trouvé');
            return;
        }
        
        const questionHTML = `
            <div class="question-container fade-in">
                <div class="question-number">
                    Question ${this.currentQuestion + 1}/${this.config.questions.length}
                </div>
                <h2 class="question-text">${question.text}</h2>
            </div>
            
            <div class="answers-container">
                ${question.answers.map((answer, index) => `
                    <div class="answer-option" 
                         data-answer-index="${index}"
                         data-answer-letter="${String.fromCharCode(65 + index)}"
                         tabindex="0"
                         role="button"
                         aria-label="Réponse ${String.fromCharCode(65 + index)}: ${answer.text}">
                        <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
                        <span class="answer-text">${answer.text}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="navigation-container">
                ${this.currentQuestion > 0 ? `
                    <button class="prev-question-btn">
                        ← Question précédente
                    </button>
                ` : ''}
            </div>
            
            <div class="auto-advance-hint">
                💡 Clique sur ta réponse pour passer à la question suivante
            </div>
        `;
        
        container.innerHTML = questionHTML;
        
        // Restaurer la réponse sélectionnée si elle existe
        const savedAnswer = this.answers[this.currentQuestion];
        if (savedAnswer !== undefined) {
            this.selectAnswer(savedAnswer, false);
        }
        
        this.bindQuestionEvents();
    }
    
    /**
     * Mise à jour de la barre de progression
     */
    updateProgress() {
        const progressBar = document.querySelector('.progress-bar');
        const currentQuestionSpan = document.querySelector('.current-question');
        const totalQuestionsSpan = document.querySelector('.total-questions');
        
        if (progressBar) {
            const progress = ((this.currentQuestion) / this.config.questions.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
        
        if (currentQuestionSpan) {
            currentQuestionSpan.textContent = this.currentQuestion + 1;
        }
        
        if (totalQuestionsSpan) {
            totalQuestionsSpan.textContent = this.config.questions.length;
        }
    }
    
    /**
     * Gestion des événements globaux
     */
    bindEvents() {
        // Bouton retour vers l'accueil
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (confirm('Veux-tu vraiment quitter ce test ? Tes réponses seront perdues.')) {
                    window.location.href = '../index.html';
                }
            });
        }
        
        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (this.isComplete) return;
            
            // Touches A, B, C, D pour sélectionner les réponses
            const keyCode = e.key.toLowerCase();
            if (['a', 'b', 'c', 'd'].includes(keyCode)) {
                const answerIndex = keyCode.charCodeAt(0) - 97; // a=0, b=1, c=2, d=3
                if (answerIndex < this.config.questions[this.currentQuestion].answers.length) {
                    this.selectAnswerAndAdvance(answerIndex);
                }
            }
            
            // Flèche gauche pour navigation arrière
            if (e.key === 'ArrowLeft' && this.currentQuestion > 0) {
                this.previousQuestion();
            }
            
            // Échap pour retour accueil
            if (e.key === 'Escape') {
                if (confirm('Veux-tu vraiment quitter ce test ? Tes réponses seront perdues.')) {
                    window.location.href = '../index.html';
                }
            }
        });
    }
    
    /**
     * Gestion des événements spécifiques à la question courante
     */
    bindQuestionEvents() {
        // Sélection des réponses avec passage automatique
        const answerOptions = document.querySelectorAll('.answer-option');
        answerOptions.forEach((option, index) => {
            option.addEventListener('click', () => {
                this.selectAnswerAndAdvance(index);
            });
            
            // Support clavier
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectAnswerAndAdvance(index);
                }
            });
        });
        
        // Bouton précédent
        const prevBtn = document.querySelector('.prev-question-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousQuestion());
        }
    }
    
    /**
     * Sélection d'une réponse
     */
    selectAnswer(answerIndex, animate = true) {
        // Désélectionner toutes les options
        const answerOptions = document.querySelectorAll('.answer-option');
        answerOptions.forEach(option => option.classList.remove('selected'));
        
        // Sélectionner la nouvelle option
        const selectedOption = answerOptions[answerIndex];
        if (selectedOption) {
            selectedOption.classList.add('selected');
            
            if (animate) {
                this.addSelectAnimation(selectedOption);
            }
        }
        
        // Sauvegarder la réponse
        this.answers[this.currentQuestion] = answerIndex;
        
        // Calculer les scores
        this.updateScores();
    }
    
    /**
     * Mise à jour des scores basée sur les réponses
     */
    updateScores() {
        const question = this.config.questions[this.currentQuestion];
        const answerIndex = this.answers[this.currentQuestion];
        
        if (answerIndex !== undefined) {
            const answer = question.answers[answerIndex];
            
            // Ajouter les points pour chaque profil
            if (answer.scores) {
                Object.keys(answer.scores).forEach(profileId => {
                    if (this.scores[profileId] !== undefined) {
                        this.scores[profileId] += answer.scores[profileId];
                    }
                });
            }
        }
    }
    
    /**
     * Recalculer tous les scores (utilisé lors de la navigation)
     */
    recalculateScores() {
        // Remettre à zéro
        Object.keys(this.scores).forEach(profileId => {
            this.scores[profileId] = 0;
        });
        
        // Recalculer pour toutes les réponses données
        Object.keys(this.answers).forEach(questionIndex => {
            const question = this.config.questions[questionIndex];
            const answerIndex = this.answers[questionIndex];
            const answer = question.answers[answerIndex];
            
            if (answer && answer.scores) {
                Object.keys(answer.scores).forEach(profileId => {
                    if (this.scores[profileId] !== undefined) {
                        this.scores[profileId] += answer.scores[profileId];
                    }
                });
            }
        });
    }
    
    /**
     * Question suivante
     */
    nextQuestion() {
        if (this.answers[this.currentQuestion] === undefined) {
            this.showWarning('Veuillez sélectionner une réponse avant de continuer.');
            return;
        }
        
        if (this.currentQuestion < this.config.questions.length - 1) {
            this.currentQuestion++;
            this.renderQuestion();
            this.updateProgress();
            this.scrollToTop();
        } else {
            this.completeQuiz();
        }
    }
    
    /**
     * Question précédente avec animation
     */
    previousQuestion() {
        if (this.currentQuestion > 0) {
            const container = document.querySelector('.quiz-content');
            
            // Animation de sortie vers la droite
            container.style.transform = 'translateX(100%)';
            container.style.opacity = '0';
            container.style.transition = 'all 0.3s ease-out';
            
            setTimeout(() => {
                this.currentQuestion--;
                this.renderQuestion();
                this.updateProgress();
                
                // Animation d'entrée depuis la gauche
                container.style.transform = 'translateX(-100%)';
                container.style.opacity = '0';
                
                setTimeout(() => {
                    container.style.transform = 'translateX(0)';
                    container.style.opacity = '1';
                    
                    // Nettoyer les styles inline après l'animation
                    setTimeout(() => {
                        container.style.transform = '';
                        container.style.opacity = '';
                        container.style.transition = '';
                    }, 300);
                }, 50);
                
                this.scrollToTop();
            }, 150);
        }
    }
    
    /**
     * Finalisation du quiz
     */
    completeQuiz() {
        this.isComplete = true;
        this.recalculateScores();
        
        // Trouver le profil avec le score le plus élevé
        const winningProfile = this.getWinningProfile();
        
        // Afficher les résultats
        this.showResults(winningProfile);
        
        // Mettre à jour la progression à 100%
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = '100%';
        }
    }
    
    /**
     * Déterminer le profil gagnant
     */
    getWinningProfile() {
        let maxScore = -1;
        let winningProfileId = null;
        
        Object.keys(this.scores).forEach(profileId => {
            if (this.scores[profileId] > maxScore) {
                maxScore = this.scores[profileId];
                winningProfileId = profileId;
            }
        });
        
        return this.config.profiles.find(profile => profile.id === winningProfileId);
    }
    
    /**
     * Affichage des résultats
     */
    showResults(profile) {
        const container = document.querySelector('.quiz-content');
        
        const resultsHTML = `
            <div class="results-container fade-in">
                <div class="result-icon">${profile.icon}</div>
                <h2 class="result-title">${profile.name}</h2>
                <p class="result-subtitle">${profile.subtitle}</p>
                <div class="result-description">
                    ${profile.description}
                </div>
                
                ${profile.traits ? `
                    <div class="result-traits">
                        ${profile.traits.map(trait => `
                            <div class="trait-item">
                                <div class="trait-label">${trait.label}</div>
                                <div class="trait-value">${trait.value}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="result-actions">
                    <a href="../index.html" class="action-btn primary">
                        Faire un autre test
                    </a>
                    <button class="action-btn secondary" onclick="quizEngine.shareResults()">
                        Partager mes résultats
                    </button>
                    <button class="action-btn secondary" onclick="quizEngine.retakeQuiz()">
                        Refaire ce test
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML = resultsHTML;
        this.scrollToTop();
        
        // Analytics/tracking (optionnel)
        this.trackCompletion(profile);
    }
    
    /**
     * Partage des résultats
     */
    shareResults() {
        const profile = this.getWinningProfile();
        const shareText = `Je viens de faire le test "${this.config.title}" sur Introxpection et je suis : ${profile.name} ! ${profile.subtitle}`;
        
        if (navigator.share) {
            navigator.share({
                title: this.config.title,
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback : copier dans le presse-papier
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('Résultat copié dans le presse-papier !');
            }).catch(() => {
                // Fallback ultime : sélectionner le texte
                const textArea = document.createElement('textarea');
                textArea.value = shareText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification('Résultat copié !');
            });
        }
    }
    
    /**
     * Recommencer le quiz
     */
    retakeQuiz() {
        this.currentQuestion = 0;
        this.answers = {};
        this.isComplete = false;
        
        // Remettre à zéro les scores
        this.config.profiles.forEach(profile => {
            this.scores[profile.id] = 0;
        });
        
        this.renderQuestion();
        this.updateProgress();
        this.scrollToTop();
    }
    
    /**
     * Utilitaires
     */
    showNotification(message) {
        // Notification toast améliorée
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
    
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    addSelectAnimation(element) {
        // Animation de sélection plus élaborée
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Réinitialiser après l'animation
        setTimeout(() => {
            element.style.transform = '';
        }, 300);
        
        // Effet de vibration subtile pour feedback tactile (mobile)
        if (navigator.vibrate && window.navigator.userAgent.match(/(iPhone|iPod|iPad|Android)/)) {
            navigator.vibrate(50);
        }
    }
    
    addAnimations() {
        // Ajout d'animations subtiles aux éléments
        const animatedElements = document.querySelectorAll('.fade-in');
        animatedElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
        });
    }
    
    trackCompletion(profile) {
        // Ici on pourrait ajouter du tracking/analytics
        console.log(`Quiz completed: ${this.config.title}, Result: ${profile.name}`);
        
        // Exemple : localStorage pour les statistiques locales
        const stats = JSON.parse(localStorage.getItem('introxpection_stats') || '{}');
        if (!stats[this.config.id]) {
            stats[this.config.id] = { completions: 0, results: {} };
        }
        
        stats[this.config.id].completions++;
        if (!stats[this.config.id].results[profile.id]) {
            stats[this.config.id].results[profile.id] = 0;
        }
        stats[this.config.id].results[profile.id]++;
        
        localStorage.setItem('introxpection_stats', JSON.stringify(stats));
    }
}

/**
 * Fonction utilitaire pour initialiser un quiz
 */
function initQuiz(config) {
    // Vérifier que la configuration est valide
    if (!config || !config.questions || !config.profiles) {
        console.error('Configuration de quiz invalide');
        return null;
    }
    
    // Valider les questions
    const isValidConfig = config.questions.every(q => 
        q.text && q.answers && q.answers.length >= 2
    );
    
    if (!isValidConfig) {
        console.error('Questions invalides dans la configuration');
        return null;
    }
    
    // Créer et retourner l'instance
    return new QuizEngine(config);
}

/**
 * Configuration globale par défaut
 */
const defaultQuizConfig = {
    showKeyboardHints: true,
    allowBackNavigation: true,
    showProgressBar: true,
    autoSave: false // Pour une future fonctionnalité
};

// Export pour utilisation modulaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuizEngine, initQuiz, defaultQuizConfig };
}
