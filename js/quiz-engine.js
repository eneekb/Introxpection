/**
 * Introxpection - Moteur de quiz réutilisable
 * Version corrigée et simplifiée
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
        
        console.log('QuizEngine initialisé avec', config.questions.length, 'questions');
        this.init();
    }
    
    /**
     * Initialisation du quiz
     */
    init() {
        console.log('Initialisation du quiz...');
        try {
            this.renderQuestion();
            this.updateProgress();
            this.bindEvents();
            console.log('Quiz initialisé avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
        }
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
        
        console.log('Rendu question', this.currentQuestion + 1);
        
        const questionHTML = `
            <div class="question-container fade-in">
                <h2 class="question-text">${question.text}</h2>
            </div>
            
            <div class="answers-container">
                ${question.answers.map((answer, index) => `
                    <div class="answer-option" 
                         data-answer-index="${index}"
                         role="button"
                         tabindex="0">
                        <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
                        <span class="answer-text">${answer.text}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="navigation-container">
                ${this.currentQuestion > 0 ? `
                    <button class="prev-question-btn">← Précédente</button>
                ` : ''}
            </div>
            
            <div class="auto-advance-hint">
                💡 Clique sur ta réponse pour continuer
            </div>
        `;
        
        container.innerHTML = questionHTML;
        
        // Restaurer la réponse sélectionnée si elle existe
        const savedAnswer = this.answers[this.currentQuestion];
        if (savedAnswer !== undefined) {
            this.markAnswerSelected(savedAnswer);
        }
        
        this.bindQuestionEvents();
    }
    
    /**
     * Marquer une réponse comme sélectionnée visuellement
     */
    markAnswerSelected(answerIndex) {
        const answerOptions = document.querySelectorAll('.answer-option');
        answerOptions.forEach(option => option.classList.remove('selected'));
        
        if (answerOptions[answerIndex]) {
            answerOptions[answerIndex].classList.add('selected');
        }
    }
    
    /**
     * Mise à jour de la barre de progression
     */
    updateProgress() {
        const progressBar = document.querySelector('.progress-bar');
        const currentQuestionSpan = document.querySelector('.current-question');
        const totalQuestionsSpan = document.querySelector('.total-questions');
        
        if (progressBar) {
            const progress = ((this.currentQuestion + 1) / this.config.questions.length) * 100;
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
        console.log('Binding des événements...');
        
        // Bouton retour vers l'accueil
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            console.log('Bouton retour trouvé');
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clic sur retour accueil');
                if (confirm('Veux-tu vraiment quitter ce test ? Tes réponses seront perdues.')) {
                    window.location.href = '../index.html';
                }
            });
        } else {
            console.warn('Bouton retour non trouvé');
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
     * Sélection d'une réponse avec passage automatique à la question suivante
     */
    selectAnswerAndAdvance(answerIndex) {
        console.log('Réponse sélectionnée:', answerIndex);
        
        // Sauvegarder la réponse
        this.answers[this.currentQuestion] = answerIndex;
        
        // Marquer visuellement
        this.markAnswerSelected(answerIndex);
        
        // Calculer les scores
        this.updateScores();
        
        // Effet visuel de sélection
        const selectedOption = document.querySelectorAll('.answer-option')[answerIndex];
        if (selectedOption) {
            selectedOption.style.transform = 'scale(1.05)';
            setTimeout(() => {
                selectedOption.style.transform = '';
            }, 200);
        }
        
        // Attendre un peu puis passer à la question suivante
        setTimeout(() => {
            if (this.currentQuestion < this.config.questions.length - 1) {
                this.nextQuestion();
            } else {
                this.completeQuiz();
            }
        }, 800);
    }
    
    /**
     * Question suivante
     */
    nextQuestion() {
        this.currentQuestion++;
        this.renderQuestion();
        this.updateProgress();
        this.scrollToTop();
    }
    
    /**
     * Question précédente
     */
    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.renderQuestion();
            this.updateProgress();
            this.scrollToTop();
        }
    }
    
    /**
     * Mise à jour des scores basée sur les réponses
     */
    updateScores() {
        const question = this.config.questions[this.currentQuestion];
        const answerIndex = this.answers[this.currentQuestion];
        
        if (answerIndex !== undefined && question.answers[answerIndex].scores) {
            const answer = question.answers[answerIndex];
            
            // Ajouter les points pour chaque profil
            Object.keys(answer.scores).forEach(profileId => {
                if (this.scores[profileId] !== undefined) {
                    this.scores[profileId] += answer.scores[profileId];
                }
            });
        }
    }
    
    /**
     * Recalculer tous les scores
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
     * Finalisation du quiz
     */
    completeQuiz() {
        this.isComplete = true;
        this.recalculateScores();
        
        console.log('Scores finaux:', this.scores);
        
        // Trouver le profil avec le score le plus élevé
        const winningProfile = this.getWinningProfile();
        console.log('Profil gagnant:', winningProfile);
        
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
                alert(shareText);
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
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
    
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Fonction utilitaire pour initialiser un quiz
 */
function initQuiz(config) {
    console.log('initQuiz appelée avec:', config);
    
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
    
    console.log('Configuration valide, création du QuizEngine...');
    
    // Créer et retourner l'instance
    return new QuizEngine(config);
}

// Export pour utilisation modulaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuizEngine, initQuiz };
}
