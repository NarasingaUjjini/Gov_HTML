/**
 * QuizEngine - Core quiz functionality for all three modes
 * Handles question selection, navigation, scoring, and mode-specific behavior
 */
class QuizEngine {
    constructor(questionManager, progressTracker) {
        this.questionManager = questionManager;
        this.progressTracker = progressTracker;
        
        // Current quiz state
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.answers = [];
        this.mode = null;
        this.unitId = null;
        this.startTime = null;
        this.isActive = false;
        
        // Timer for practice tests
        this.timer = null;
        
        // Event callbacks
        this.onQuestionChange = null;
        this.onAnswerSubmit = null;
        this.onQuizComplete = null;
        this.onModeSpecificEvent = null;
        this.onTimerTick = null;
        this.onTimerWarning = null;
    }

    /**
     * Start a new quiz in the specified mode
     * @param {string} mode - Quiz mode: 'unit', 'practice', or 'study'
     * @param {number|null} unitId - Unit ID for unit mode (1-5), null for other modes
     * @param {Object} options - Additional options for quiz configuration
     */
    startQuiz(mode, unitId = null, options = {}) {
        if (!['unit', 'practice', 'study'].includes(mode)) {
            throw new Error('Mode must be "unit", "practice", or "study"');
        }

        if (mode === 'unit' && (!unitId || unitId < 1 || unitId > 5)) {
            throw new Error('Unit mode requires a valid unit ID (1-5)');
        }

        // Initialize quiz state
        this.mode = mode;
        this.unitId = unitId;
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.startTime = new Date();
        this.isActive = true;

        // Load questions based on mode
        this.questions = this.loadQuestionsForMode(mode, unitId, options);
        
        if (this.questions.length === 0) {
            throw new Error('No questions available for the selected criteria');
        }

        // Initialize timer for practice tests
        if (mode === 'practice') {
            this.initializePracticeTimer();
        }

        // Create quiz session object
        this.currentQuiz = {
            id: this.generateQuizId(),
            mode: mode,
            unitId: unitId,
            questions: this.questions.map(q => q.id),
            startTime: this.startTime,
            totalQuestions: this.questions.length,
            currentQuestion: 0,
            answers: [],
            isComplete: false,
            timerState: this.timer ? this.timer.serialize() : null
        };

        // Save session to progress tracker
        this.progressTracker.saveCurrentSession(this.currentQuiz);

        console.log(`Started ${mode} quiz with ${this.questions.length} questions`);
        
        // Trigger question change event
        this.triggerQuestionChange();
    }

    /**
     * Load questions based on quiz mode and parameters
     * @param {string} mode - Quiz mode
     * @param {number|null} unitId - Unit ID for unit mode
     * @param {Object} options - Additional options
     * @returns {Array} Array of Question objects
     */
    loadQuestionsForMode(mode, unitId, options) {
        switch (mode) {
            case 'unit':
                // Unit mode: questions from specific unit
                const unitQuestions = this.questionManager.getQuestionsByUnit(unitId);
                const unitCount = options.questionCount || Math.min(20, unitQuestions.length);
                return this.questionManager.getRandomQuestions(unitCount, [unitId]);

            case 'practice':
                // Practice mode: exactly 55 questions distributed across all units (or all available)
                const availableCount = this.questionManager.questions.length;
                const practiceCount = Math.min(55, availableCount);
                return this.questionManager.getRandomDistributedQuestions(practiceCount);

            case 'study':
                // Study mode: unlimited questions, start with a batch
                const studyCount = options.questionCount || 10;
                return this.questionManager.getRandomQuestions(studyCount);

            default:
                throw new Error(`Unknown quiz mode: ${mode}`);
        }
    }

    /**
     * Initialize timer for practice tests
     */
    initializePracticeTimer() {
        // Load Timer class if not already available
        if (typeof Timer === 'undefined') {
            console.error('Timer class not found. Make sure timer.js is loaded.');
            return;
        }

        this.timer = new Timer();
        
        // Set up timer event handlers
        this.timer.onTick = (data) => {
            this.handleTimerTick(data);
        };
        
        this.timer.onTimeUp = () => {
            this.handleTimeUp();
        };
        
        this.timer.onWarning = (data) => {
            this.handleTimerWarning(data);
        };
        
        // Start 80-minute timer
        this.timer.start(80);
        
        console.log('Practice test timer initialized: 80 minutes');
    }

    /**
     * Handle timer tick events
     * @param {Object} data - Timer tick data
     */
    handleTimerTick(data) {
        // Update quiz session with timer state
        if (this.currentQuiz) {
            this.currentQuiz.timerState = this.timer.serialize();
            this.progressTracker.saveCurrentSession(this.currentQuiz);
        }
        
        // Trigger timer tick callback for UI updates
        if (this.onTimerTick) {
            this.onTimerTick(data);
        }
    }

    /**
     * Handle timer expiration (auto-submit)
     */
    handleTimeUp() {
        console.log('Practice test time expired - auto-submitting');
        
        // Trigger warning callback
        if (this.onTimerWarning) {
            this.onTimerWarning({
                type: 'time_expired',
                message: 'Time is up! Your test has been automatically submitted.'
            });
        }
        
        // Auto-submit the quiz
        try {
            const results = this.endQuiz();
            
            // Trigger mode-specific event for auto-submit
            if (this.onModeSpecificEvent) {
                this.onModeSpecificEvent({
                    type: 'auto_submit',
                    reason: 'time_expired',
                    results: results
                });
            }
        } catch (error) {
            console.error('Failed to auto-submit quiz:', error);
        }
    }

    /**
     * Handle timer warning events
     * @param {Object} data - Timer warning data
     */
    handleTimerWarning(data) {
        console.log(`Timer warning: ${data.threshold} minutes remaining`);
        
        // Trigger warning callback for UI notifications
        if (this.onTimerWarning) {
            this.onTimerWarning({
                type: 'time_warning',
                threshold: data.threshold,
                remaining: data.remaining,
                formatted: data.formatted,
                message: this.getWarningMessage(data.threshold)
            });
        }
    }

    /**
     * Get appropriate warning message for time threshold
     * @param {number} threshold - Minutes remaining
     * @returns {string} Warning message
     */
    getWarningMessage(threshold) {
        switch (threshold) {
            case 30:
                return '30 minutes remaining. You\'re halfway through the test.';
            case 15:
                return '15 minutes remaining. Consider reviewing your answers.';
            case 5:
                return '5 minutes remaining. Make sure all questions are answered.';
            case 1:
                return '1 minute remaining! The test will auto-submit when time expires.';
            default:
                return `${threshold} minutes remaining.`;
        }
    }

    /**
     * Get current timer state
     * @returns {Object|null} Timer state or null if no timer
     */
    getTimerState() {
        return this.timer ? this.timer.getStats() : null;
    }

    /**
     * Pause the timer (for practice tests)
     */
    pauseTimer() {
        if (this.timer && this.mode === 'practice') {
            this.timer.pause();
            console.log('Practice test timer paused');
        }
    }

    /**
     * Resume the timer (for practice tests)
     */
    resumeTimer() {
        if (this.timer && this.mode === 'practice') {
            this.timer.resume();
            console.log('Practice test timer resumed');
        }
    }

    /**
     * Navigate to a specific question by index
     * @param {number} questionIndex - Index of question to navigate to
     */
    navigateToQuestion(questionIndex) {
        if (!this.isActive) {
            throw new Error('No active quiz session');
        }

        if (questionIndex < 0 || questionIndex >= this.questions.length) {
            throw new Error('Invalid question index');
        }

        this.currentQuestionIndex = questionIndex;
        this.currentQuiz.currentQuestion = questionIndex;
        
        // Update session
        this.progressTracker.saveCurrentSession(this.currentQuiz);
        
        // Trigger question change event
        this.triggerQuestionChange();
    }

    /**
     * Navigate to the next question
     * @returns {boolean} True if navigation was successful, false if at end
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.navigateToQuestion(this.currentQuestionIndex + 1);
            return true;
        }
        return false;
    }

    /**
     * Navigate to the previous question
     * @returns {boolean} True if navigation was successful, false if at beginning
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.navigateToQuestion(this.currentQuestionIndex - 1);
            return true;
        }
        return false;
    }

    /**
     * Submit an answer for the current question
     * @param {number} answerIndex - Selected answer index (0-3)
     */
    submitAnswer(answerIndex) {
        if (!this.isActive) {
            throw new Error('No active quiz session');
        }

        if (answerIndex < 0 || answerIndex > 3) {
            throw new Error('Answer index must be between 0 and 3');
        }

        const currentQuestion = this.getCurrentQuestion();
        const isCorrect = currentQuestion.isCorrect(answerIndex);

        // Store answer
        this.answers[this.currentQuestionIndex] = {
            questionId: currentQuestion.id,
            selectedAnswer: answerIndex,
            isCorrect: isCorrect,
            timestamp: new Date()
        };

        // Update quiz session
        this.currentQuiz.answers = [...this.answers];
        this.progressTracker.saveCurrentSession(this.currentQuiz);

        // Handle mode-specific behavior
        this.handleModeSpecificAnswer(answerIndex, isCorrect);

        // Trigger answer submit event
        if (this.onAnswerSubmit) {
            this.onAnswerSubmit({
                questionIndex: this.currentQuestionIndex,
                answerIndex: answerIndex,
                isCorrect: isCorrect,
                question: currentQuestion
            });
        }

        console.log(`Answer submitted for question ${this.currentQuestionIndex + 1}: ${isCorrect ? 'Correct' : 'Incorrect'}`);
    }

    /**
     * Handle mode-specific behavior after answer submission
     * @param {number} answerIndex - Selected answer index
     * @param {boolean} isCorrect - Whether the answer was correct
     */
    handleModeSpecificAnswer(answerIndex, isCorrect) {
        switch (this.mode) {
            case 'study':
                // Study mode: immediate feedback, can continue indefinitely
                if (this.onModeSpecificEvent) {
                    this.onModeSpecificEvent({
                        type: 'immediate_feedback',
                        isCorrect: isCorrect,
                        correctAnswer: this.getCurrentQuestion().getCorrectAnswer(),
                        explanation: this.getCurrentQuestion().explanation
                    });
                }
                break;

            case 'unit':
            case 'practice':
                // Unit and practice modes: no immediate feedback
                break;
        }
    }

    /**
     * Get the current question object
     * @returns {Question} Current question
     */
    getCurrentQuestion() {
        if (!this.isActive || this.currentQuestionIndex >= this.questions.length) {
            return null;
        }
        return this.questions[this.currentQuestionIndex];
    }

    /**
     * Get the current question number (1-based)
     * @returns {number} Current question number
     */
    getCurrentQuestionNumber() {
        return this.currentQuestionIndex + 1;
    }

    /**
     * Get total number of questions in current quiz
     * @returns {number} Total question count
     */
    getTotalQuestions() {
        return this.questions.length;
    }

    /**
     * Check if there's an answer for the current question
     * @returns {boolean} True if current question has been answered
     */
    isCurrentQuestionAnswered() {
        return this.answers[this.currentQuestionIndex] !== undefined;
    }

    /**
     * Get the selected answer for the current question
     * @returns {number|null} Selected answer index or null if not answered
     */
    getCurrentAnswer() {
        const answer = this.answers[this.currentQuestionIndex];
        return answer ? answer.selectedAnswer : null;
    }

    /**
     * Get current question data (same structure as onQuestionChange event)
     * @returns {Object|null} Current question data or null if no active quiz
     */
    getCurrentQuestionData() {
        if (!this.isActive || this.currentQuestionIndex >= this.questions.length) {
            return null;
        }

        return {
            question: this.getCurrentQuestion(),
            questionIndex: this.currentQuestionIndex,
            questionNumber: this.getCurrentQuestionNumber(),
            totalQuestions: this.getTotalQuestions(),
            isAnswered: this.isCurrentQuestionAnswered(),
            currentAnswer: this.getCurrentAnswer(),
            canGoNext: this.currentQuestionIndex < this.questions.length - 1,
            canGoPrevious: this.currentQuestionIndex > 0
        };
    }

    /**
     * Calculate current quiz score using ScoringEngine
     * @returns {Object} Comprehensive score information
     */
    calculateScore() {
        // Use ScoringEngine for comprehensive scoring if available
        if (typeof ScoringEngine !== 'undefined') {
            const scoringEngine = new ScoringEngine();
            return scoringEngine.calculateScore(this.questions, this.answers, this.mode);
        }
        
        // Fallback to basic scoring
        const answeredQuestions = this.answers.filter(answer => answer !== undefined);
        const correctAnswers = answeredQuestions.filter(answer => answer.isCorrect);
        
        return {
            correct: correctAnswers.length,
            total: answeredQuestions.length,
            totalQuestions: this.questions.length,
            percentage: answeredQuestions.length > 0 ? 
                Math.round((correctAnswers.length / answeredQuestions.length) * 100) : 0,
            unanswered: this.questions.length - answeredQuestions.length
        };
    }

    /**
     * Get unit breakdown for practice tests using ScoringEngine
     * @returns {Object} Detailed unit breakdown with percentages
     */
    getUnitBreakdown() {
        // Use ScoringEngine for detailed breakdown if available
        if (typeof ScoringEngine !== 'undefined') {
            const scoringEngine = new ScoringEngine();
            return scoringEngine.calculateUnitBreakdown(this.questions, this.answers);
        }
        
        // Fallback to simple breakdown
        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        this.answers.forEach((answer, index) => {
            if (answer && answer.isCorrect) {
                const question = this.questions[index];
                breakdown[question.unit]++;
            }
        });
        
        return breakdown;
    }

    /**
     * Check if all questions have been answered
     * @returns {boolean} True if all questions answered
     */
    isQuizComplete() {
        return this.answers.length === this.questions.length && 
               this.answers.every(answer => answer !== undefined);
    }

    /**
     * End the current quiz and calculate final results
     * @returns {Object} Quiz results
     */
    endQuiz() {
        if (!this.isActive) {
            throw new Error('No active quiz session');
        }

        const endTime = new Date();
        const duration = endTime - this.startTime;
        const score = this.calculateScore();
        
        // Stop timer if running
        let timerStats = null;
        if (this.timer) {
            timerStats = this.timer.getStats();
            this.timer.stop();
        }
        
        // Create results object
        const results = {
            quizId: this.currentQuiz.id,
            mode: this.mode,
            unitId: this.unitId,
            startTime: this.startTime,
            endTime: endTime,
            duration: duration,
            score: score,
            questions: this.questions.map((question, index) => ({
                question: question,
                answer: this.answers[index] || null
            })),
            timerStats: timerStats
        };

        // Add mode-specific results
        if (this.mode === 'practice') {
            results.unitBreakdown = this.getUnitBreakdown();
            results.timeUsed = timerStats ? timerStats.elapsed : duration;
            results.timeRemaining = timerStats ? timerStats.remaining : 0;
        }

        // Update progress tracking
        this.updateProgressTracking(results);

        // Mark quiz as complete
        this.currentQuiz.isComplete = true;
        this.currentQuiz.endTime = endTime;
        this.currentQuiz.results = results;
        
        // Clear current session
        this.progressTracker.clearCurrentSession();
        
        // Cleanup timer
        if (this.timer) {
            this.timer.destroy();
            this.timer = null;
        }
        
        // Deactivate quiz
        this.isActive = false;

        // Trigger completion event
        if (this.onQuizComplete) {
            this.onQuizComplete(results);
        }

        console.log(`Quiz completed: ${score.correct}/${score.total} (${score.percentage}%)`);
        
        return results;
    }

    /**
     * Update progress tracking based on quiz results
     * @param {Object} results - Quiz results
     */
    updateProgressTracking(results) {
        const { score } = results;
        
        switch (this.mode) {
            case 'unit':
                // Update unit-specific progress
                this.progressTracker.updateUnitProgress(
                    this.unitId, 
                    score.correct, 
                    score.total
                );
                break;

            case 'practice':
                // Record practice test and update all unit progress
                this.progressTracker.recordPracticeTest(
                    score.correct,
                    score.total,
                    results.unitBreakdown
                );
                break;

            case 'study':
                // Update progress for all units based on questions answered
                const unitCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                const unitCorrect = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                
                results.questions.forEach(({ question, answer }) => {
                    if (answer) {
                        unitCounts[question.unit]++;
                        if (answer.isCorrect) {
                            unitCorrect[question.unit]++;
                        }
                    }
                });
                
                // Update each unit's progress
                Object.keys(unitCounts).forEach(unitId => {
                    const unit = parseInt(unitId);
                    if (unitCounts[unit] > 0) {
                        this.progressTracker.updateUnitProgress(
                            unit,
                            unitCorrect[unit],
                            unitCounts[unit]
                        );
                    }
                });
                break;
        }
    }

    /**
     * Add more questions to study mode (for unlimited studying)
     * @param {number} count - Number of additional questions to add
     */
    addMoreQuestions(count = 10) {
        if (this.mode !== 'study') {
            throw new Error('Can only add questions in study mode');
        }

        const newQuestions = this.questionManager.getRandomQuestions(count);
        this.questions.push(...newQuestions);
        
        // Update quiz session
        this.currentQuiz.questions.push(...newQuestions.map(q => q.id));
        this.currentQuiz.totalQuestions = this.questions.length;
        this.progressTracker.saveCurrentSession(this.currentQuiz);
        
        console.log(`Added ${newQuestions.length} more questions to study mode`);
    }

    /**
     * Pause the current quiz (mainly for timer management)
     */
    pauseQuiz() {
        if (this.isActive) {
            this.currentQuiz.pausedAt = new Date();
            this.progressTracker.saveCurrentSession(this.currentQuiz);
        }
    }

    /**
     * Resume a paused quiz
     */
    resumeQuiz() {
        if (this.isActive && this.currentQuiz.pausedAt) {
            delete this.currentQuiz.pausedAt;
            this.progressTracker.saveCurrentSession(this.currentQuiz);
        }
    }

    /**
     * Load a saved quiz session
     * @param {Object} sessionData - Saved session data
     */
    loadSession(sessionData) {
        if (!sessionData || sessionData.isComplete) {
            throw new Error('Invalid or completed session data');
        }

        // Restore quiz state
        this.mode = sessionData.mode;
        this.unitId = sessionData.unitId;
        this.currentQuestionIndex = sessionData.currentQuestion;
        this.startTime = new Date(sessionData.startTime);
        this.isActive = true;
        this.currentQuiz = sessionData;

        // Reload questions
        this.questions = sessionData.questions.map(questionId => {
            // Find question by ID (this assumes questions are loaded in questionManager)
            return this.questionManager.questions.find(q => q.id === questionId);
        }).filter(q => q !== undefined);

        // Restore answers
        this.answers = sessionData.answers || [];

        // Restore timer for practice tests
        if (this.mode === 'practice' && sessionData.timerState) {
            this.initializePracticeTimer();
            if (this.timer) {
                this.timer.deserialize(sessionData.timerState);
            }
        }

        console.log(`Loaded saved ${this.mode} quiz session`);
        
        // Trigger question change event
        this.triggerQuestionChange();
    }

    /**
     * Generate a unique quiz ID
     * @returns {string} Unique quiz identifier
     */
    generateQuizId() {
        return `quiz_${this.mode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Trigger question change event
     */
    triggerQuestionChange() {
        if (this.onQuestionChange) {
            this.onQuestionChange({
                question: this.getCurrentQuestion(),
                questionIndex: this.currentQuestionIndex,
                questionNumber: this.getCurrentQuestionNumber(),
                totalQuestions: this.getTotalQuestions(),
                isAnswered: this.isCurrentQuestionAnswered(),
                currentAnswer: this.getCurrentAnswer(),
                canGoNext: this.currentQuestionIndex < this.questions.length - 1,
                canGoPrevious: this.currentQuestionIndex > 0
            });
        }
    }

    /**
     * Check if navigation should be warned about (for active timed tests)
     * @returns {boolean} True if navigation warning should be shown
     */
    shouldWarnOnNavigation() {
        return this.isActive && this.mode === 'practice' && this.timer && this.timer.isRunning;
    }

    /**
     * Get navigation warning message
     * @returns {string} Warning message for navigation
     */
    getNavigationWarningMessage() {
        if (!this.shouldWarnOnNavigation()) {
            return '';
        }

        const timeRemaining = this.timer.getFormattedTime();
        return `You are currently taking a timed practice test with ${timeRemaining} remaining. ` +
               `If you leave this page, your progress will be lost and the test will end. ` +
               `Are you sure you want to continue?`;
    }

    /**
     * Get current quiz state for debugging
     * @returns {Object} Current state information
     */
    getState() {
        return {
            isActive: this.isActive,
            mode: this.mode,
            unitId: this.unitId,
            currentQuestionIndex: this.currentQuestionIndex,
            totalQuestions: this.questions.length,
            answeredCount: this.answers.filter(a => a !== undefined).length,
            score: this.calculateScore(),
            startTime: this.startTime,
            timerState: this.getTimerState()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizEngine;
}