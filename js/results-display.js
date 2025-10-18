/**
 * ResultsDisplay - Handles the display of quiz results and performance analytics
 * Creates detailed results screens for all quiz modes with comprehensive metrics
 */
class ResultsDisplay {
    constructor(container) {
        this.container = container;
        this.scoringEngine = new ScoringEngine();
    }

    /**
     * Display comprehensive quiz results
     * @param {Object} quizResults - Results from QuizEngine.endQuiz()
     * @param {Object} progressData - User progress data from ProgressTracker
     */
    displayResults(quizResults, progressData) {
        // Calculate comprehensive score using ScoringEngine
        const questions = quizResults.questions.map(q => q.question);
        const answers = quizResults.questions.map(q => q.answer);
        
        const scoreData = this.scoringEngine.calculateScore(questions, answers, quizResults.mode);
        const displayData = this.scoringEngine.generateResultsDisplay(scoreData);
        
        // Clear container and create results layout
        this.container.innerHTML = '';
        
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'results-container';
        
        // Create header
        const header = this.createResultsHeader(displayData, quizResults);
        resultsContainer.appendChild(header);
        
        // Create main content based on mode
        const mainContent = this.createMainContent(displayData, quizResults, scoreData);
        resultsContainer.appendChild(mainContent);
        
        // Create recommendations section
        const recommendations = this.createRecommendationsSection(displayData.recommendations);
        resultsContainer.appendChild(recommendations);
        
        // Create action buttons
        const actions = this.createActionButtons(quizResults.mode);
        resultsContainer.appendChild(actions);
        
        this.container.appendChild(resultsContainer);
    }

    /**
     * Create results header with score summary
     * @param {Object} displayData - Formatted display data
     * @param {Object} quizResults - Original quiz results
     * @returns {HTMLElement} Header element
     */
    createResultsHeader(displayData, quizResults) {
        const header = document.createElement('div');
        header.className = 'results-header';
        
        const modeTitle = this.getModeTitle(quizResults.mode, quizResults.unitId);
        const performanceClass = this.getPerformanceClass(displayData.summary.performance);
        
        header.innerHTML = `
            <h2 class="results-title">${modeTitle} Results</h2>
            <div class="score-summary ${performanceClass}">
                <div class="main-score">
                    <span class="score-number">${displayData.summary.score}</span>
                    <span class="score-percentage">${displayData.summary.percentage}</span>
                </div>
                <div class="performance-level">
                    ${this.getPerformanceText(displayData.summary.performance)}
                </div>
            </div>
            ${this.createTimingInfo(quizResults)}
        `;
        
        return header;
    }

    /**
     * Get mode-specific title
     * @param {string} mode - Quiz mode
     * @param {number} unitId - Unit ID for unit mode
     * @returns {string} Display title
     */
    getModeTitle(mode, unitId) {
        switch (mode) {
            case 'unit':
                const unitNames = {
                    1: "Unit 1: Foundations of American Democracy",
                    2: "Unit 2: Interactions Among Branches of Government",
                    3: "Unit 3: Civil Liberties and Civil Rights", 
                    4: "Unit 4: American Political Ideologies and Beliefs",
                    5: "Unit 5: Political Participation"
                };
                return unitNames[unitId] || `Unit ${unitId}`;
            case 'practice':
                return 'Practice Test';
            case 'study':
                return 'Study Session';
            default:
                return 'Quiz';
        }
    }

    /**
     * Get CSS class for performance level
     * @param {string} performance - Performance level
     * @returns {string} CSS class name
     */
    getPerformanceClass(performance) {
        const classMap = {
            'excellent': 'performance-excellent',
            'good': 'performance-good',
            'satisfactory': 'performance-satisfactory',
            'needs_improvement': 'performance-needs-improvement',
            'needs_significant_improvement': 'performance-poor'
        };
        return classMap[performance] || 'performance-neutral';
    }

    /**
     * Get human-readable performance text
     * @param {string} performance - Performance level
     * @returns {string} Display text
     */
    getPerformanceText(performance) {
        const textMap = {
            'excellent': 'Excellent Work!',
            'good': 'Good Job!',
            'satisfactory': 'Satisfactory',
            'needs_improvement': 'Needs Improvement',
            'needs_significant_improvement': 'Needs Significant Improvement'
        };
        return textMap[performance] || 'Complete';
    }

    /**
     * Create timing information display
     * @param {Object} quizResults - Quiz results with timing data
     * @returns {string} HTML for timing info
     */
    createTimingInfo(quizResults) {
        if (quizResults.mode !== 'practice' || !quizResults.timerStats) {
            return '';
        }
        
        const timeUsed = this.formatDuration(quizResults.timerStats.elapsed);
        const timeRemaining = this.formatDuration(quizResults.timerStats.remaining);
        
        return `
            <div class="timing-info">
                <div class="time-stat">
                    <span class="time-label">Time Used:</span>
                    <span class="time-value">${timeUsed}</span>
                </div>
                <div class="time-stat">
                    <span class="time-label">Time Remaining:</span>
                    <span class="time-value">${timeRemaining}</span>
                </div>
            </div>
        `;
    }

    /**
     * Create main content section based on quiz mode
     * @param {Object} displayData - Formatted display data
     * @param {Object} quizResults - Original quiz results
     * @param {Object} scoreData - Comprehensive score data
     * @returns {HTMLElement} Main content element
     */
    createMainContent(displayData, quizResults, scoreData) {
        const content = document.createElement('div');
        content.className = 'results-main-content';
        
        switch (quizResults.mode) {
            case 'unit':
                content.appendChild(this.createUnitResults(displayData, scoreData));
                break;
            case 'practice':
                content.appendChild(this.createPracticeResults(displayData, scoreData));
                break;
            case 'study':
                content.appendChild(this.createStudyResults(displayData, scoreData));
                break;
        }
        
        return content;
    }

    /**
     * Create unit quiz results display
     * @param {Object} displayData - Formatted display data
     * @param {Object} scoreData - Comprehensive score data
     * @returns {HTMLElement} Unit results element
     */
    createUnitResults(displayData, scoreData) {
        const container = document.createElement('div');
        container.className = 'unit-results';
        
        container.innerHTML = `
            <div class="unit-info">
                <h3>${displayData.details.unitName}</h3>
                <div class="aptitude-display">
                    <div class="aptitude-label">Unit Aptitude</div>
                    <div class="aptitude-score">${displayData.details.aptitudeScore}%</div>
                </div>
            </div>
            
            <div class="question-breakdown">
                <h4>Question Breakdown</h4>
                <div class="breakdown-stats">
                    <div class="stat-item">
                        <span class="stat-label">Correct:</span>
                        <span class="stat-value correct">${scoreData.correct}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Incorrect:</span>
                        <span class="stat-value incorrect">${scoreData.total - scoreData.correct}</span>
                    </div>
                    ${scoreData.unanswered > 0 ? `
                        <div class="stat-item">
                            <span class="stat-label">Unanswered:</span>
                            <span class="stat-value unanswered">${scoreData.unanswered}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        return container;
    }

    /**
     * Create practice test results display
     * @param {Object} displayData - Formatted display data
     * @param {Object} scoreData - Comprehensive score data
     * @returns {HTMLElement} Practice results element
     */
    createPracticeResults(displayData, scoreData) {
        const container = document.createElement('div');
        container.className = 'practice-results';
        
        // Create AP score estimate
        const apScoreSection = document.createElement('div');
        apScoreSection.className = 'ap-score-estimate';
        apScoreSection.innerHTML = `
            <h3>Estimated AP Score</h3>
            <div class="ap-score-display">
                <div class="ap-score-number">${displayData.details.estimatedAPScore}</div>
                <div class="ap-score-description">${this.getAPScoreDescription(displayData.details.estimatedAPScore)}</div>
            </div>
        `;
        container.appendChild(apScoreSection);
        
        // Create unit breakdown
        const unitBreakdown = this.createUnitBreakdownChart(displayData.details.unitBreakdown);
        container.appendChild(unitBreakdown);
        
        // Create strengths and weaknesses
        const analysis = this.createStrengthsWeaknessesDisplay(
            displayData.details.strengths, 
            displayData.details.weaknesses
        );
        container.appendChild(analysis);
        
        return container;
    }

    /**
     * Create study mode results display
     * @param {Object} displayData - Formatted display data
     * @param {Object} scoreData - Comprehensive score data
     * @returns {HTMLElement} Study results element
     */
    createStudyResults(displayData, scoreData) {
        const container = document.createElement('div');
        container.className = 'study-results';
        
        // Learning progress section
        const progressSection = document.createElement('div');
        progressSection.className = 'learning-progress';
        progressSection.innerHTML = `
            <h3>Learning Progress</h3>
            <div class="progress-stats">
                <div class="progress-item">
                    <span class="progress-label">Questions Attempted:</span>
                    <span class="progress-value">${displayData.details.learningProgress.questionsAttempted}</span>
                </div>
                <div class="progress-item">
                    <span class="progress-label">Learning Trend:</span>
                    <span class="progress-value trend-${displayData.details.learningProgress.improvementTrend}">
                        ${this.getTrendText(displayData.details.learningProgress.improvementTrend)}
                    </span>
                </div>
                <div class="progress-item">
                    <span class="progress-label">Recent Performance:</span>
                    <span class="progress-value">${displayData.details.learningProgress.recentPerformance}%</span>
                </div>
            </div>
        `;
        container.appendChild(progressSection);
        
        // Unit breakdown for study mode
        if (Object.keys(displayData.details.unitBreakdown).some(unit => 
            displayData.details.unitBreakdown[unit].total > 0)) {
            const unitBreakdown = this.createUnitBreakdownChart(displayData.details.unitBreakdown);
            container.appendChild(unitBreakdown);
        }
        
        return container;
    }

    /**
     * Create unit breakdown chart
     * @param {Object} unitBreakdown - Unit breakdown data
     * @returns {HTMLElement} Unit breakdown chart element
     */
    createUnitBreakdownChart(unitBreakdown) {
        const container = document.createElement('div');
        container.className = 'unit-breakdown-chart';
        
        const header = document.createElement('h4');
        header.textContent = 'Performance by Unit';
        container.appendChild(header);
        
        const chartContainer = document.createElement('div');
        chartContainer.className = 'breakdown-bars';
        
        Object.keys(unitBreakdown).forEach(unitId => {
            const unit = unitBreakdown[unitId];
            if (unit.total > 0) {
                const barContainer = document.createElement('div');
                barContainer.className = 'unit-bar-container';
                
                barContainer.innerHTML = `
                    <div class="unit-label">Unit ${unitId}</div>
                    <div class="unit-bar">
                        <div class="unit-bar-fill" style="width: ${unit.percentage}%"></div>
                        <div class="unit-bar-text">${unit.correct}/${unit.total} (${unit.percentage}%)</div>
                    </div>
                `;
                
                chartContainer.appendChild(barContainer);
            }
        });
        
        container.appendChild(chartContainer);
        return container;
    }

    /**
     * Create strengths and weaknesses display
     * @param {Array} strengths - Array of strength units
     * @param {Array} weaknesses - Array of weakness units
     * @returns {HTMLElement} Analysis display element
     */
    createStrengthsWeaknessesDisplay(strengths, weaknesses) {
        const container = document.createElement('div');
        container.className = 'strengths-weaknesses';
        
        if (strengths.length > 0) {
            const strengthsSection = document.createElement('div');
            strengthsSection.className = 'strengths-section';
            strengthsSection.innerHTML = `
                <h4 class="strengths-title">Your Strengths</h4>
                <div class="strength-items">
                    ${strengths.map(unit => `
                        <div class="strength-item">
                            <span class="unit-name">${unit.unitName}</span>
                            <span class="unit-score">${unit.percentage}%</span>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(strengthsSection);
        }
        
        if (weaknesses.length > 0) {
            const weaknessesSection = document.createElement('div');
            weaknessesSection.className = 'weaknesses-section';
            weaknessesSection.innerHTML = `
                <h4 class="weaknesses-title">Areas for Improvement</h4>
                <div class="weakness-items">
                    ${weaknesses.map(unit => `
                        <div class="weakness-item">
                            <span class="unit-name">${unit.unitName}</span>
                            <span class="unit-score">${unit.percentage}%</span>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(weaknessesSection);
        }
        
        return container;
    }

    /**
     * Create recommendations section
     * @param {Array} recommendations - Array of recommendation strings
     * @returns {HTMLElement} Recommendations element
     */
    createRecommendationsSection(recommendations) {
        const container = document.createElement('div');
        container.className = 'recommendations-section';
        
        if (recommendations.length > 0) {
            container.innerHTML = `
                <h4>Recommendations</h4>
                <ul class="recommendations-list">
                    ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            `;
        }
        
        return container;
    }

    /**
     * Create action buttons for results screen
     * @param {string} mode - Quiz mode
     * @returns {HTMLElement} Action buttons element
     */
    createActionButtons(mode) {
        const container = document.createElement('div');
        container.className = 'results-actions';
        
        const buttons = [];
        
        // Mode-specific action buttons
        switch (mode) {
            case 'unit':
                buttons.push({
                    text: 'Retake Unit Quiz',
                    action: 'retake-unit',
                    class: 'btn-primary'
                });
                buttons.push({
                    text: 'Try Different Unit',
                    action: 'select-unit',
                    class: 'btn-secondary'
                });
                break;
                
            case 'practice':
                buttons.push({
                    text: 'Take Another Practice Test',
                    action: 'new-practice',
                    class: 'btn-primary'
                });
                buttons.push({
                    text: 'Study Weak Areas',
                    action: 'study-weak',
                    class: 'btn-secondary'
                });
                break;
                
            case 'study':
                buttons.push({
                    text: 'Continue Studying',
                    action: 'continue-study',
                    class: 'btn-primary'
                });
                buttons.push({
                    text: 'Take Practice Test',
                    action: 'take-practice',
                    class: 'btn-secondary'
                });
                break;
        }
        
        // Always add return to dashboard button
        buttons.push({
            text: 'Return to Dashboard',
            action: 'dashboard',
            class: 'btn-neutral'
        });
        
        // Create button elements
        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = `results-btn ${button.class}`;
            btn.textContent = button.text;
            btn.setAttribute('data-action', button.action);
            container.appendChild(btn);
        });
        
        return container;
    }

    /**
     * Get AP score description
     * @param {number} score - AP score (1-5)
     * @returns {string} Score description
     */
    getAPScoreDescription(score) {
        const descriptions = {
            5: 'Extremely well qualified',
            4: 'Well qualified', 
            3: 'Qualified',
            2: 'Possibly qualified',
            1: 'No recommendation'
        };
        return descriptions[score] || 'Unknown';
    }

    /**
     * Get trend text for learning progress
     * @param {string} trend - Trend indicator
     * @returns {string} Human-readable trend text
     */
    getTrendText(trend) {
        const trendMap = {
            'improving': 'Improving',
            'declining': 'Declining',
            'stable': 'Stable',
            'insufficient_data': 'Not enough data'
        };
        return trendMap[trend] || 'Unknown';
    }

    /**
     * Format duration in milliseconds to readable format
     * @param {number} milliseconds - Duration in milliseconds
     * @returns {string} Formatted duration
     */
    formatDuration(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Add event listeners for action buttons
     * @param {Function} callback - Callback function for button actions
     */
    addActionListeners(callback) {
        const buttons = this.container.querySelectorAll('.results-btn[data-action]');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                if (callback) {
                    callback(action);
                }
            });
        });
    }

    /**
     * Clear the results display
     */
    clear() {
        this.container.innerHTML = '';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResultsDisplay;
}