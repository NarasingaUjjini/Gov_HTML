/**
 * ScoringEngine - Comprehensive scoring and analytics system
 * Handles scoring algorithms for all quiz modes and detailed performance metrics
 */
class ScoringEngine {
    constructor() {
        // Unit names for display purposes
        this.unitNames = {
            1: "Foundations of American Democracy",
            2: "Interactions Among Branches of Government", 
            3: "Civil Liberties and Civil Rights",
            4: "American Political Ideologies and Beliefs",
            5: "Political Participation"
        };
    }

    /**
     * Calculate comprehensive score for any quiz mode
     * @param {Array} questions - Array of Question objects
     * @param {Array} answers - Array of answer objects with isCorrect property
     * @param {string} mode - Quiz mode ('unit', 'practice', 'study')
     * @returns {Object} Comprehensive score data
     */
    calculateScore(questions, answers, mode) {
        const validAnswers = answers.filter(answer => answer !== undefined);
        const correctAnswers = validAnswers.filter(answer => answer.isCorrect);
        
        const baseScore = {
            correct: correctAnswers.length,
            total: validAnswers.length,
            totalQuestions: questions.length,
            percentage: validAnswers.length > 0 ? 
                Math.round((correctAnswers.length / validAnswers.length) * 100) : 0,
            unanswered: questions.length - validAnswers.length
        };

        // Add mode-specific scoring details
        switch (mode) {
            case 'unit':
                return this.calculateUnitScore(questions, answers, baseScore);
            case 'practice':
                return this.calculatePracticeScore(questions, answers, baseScore);
            case 'study':
                return this.calculateStudyScore(questions, answers, baseScore);
            default:
                return baseScore;
        }
    }

    /**
     * Calculate unit-specific quiz score
     * @param {Array} questions - Array of Question objects
     * @param {Array} answers - Array of answer objects
     * @param {Object} baseScore - Base score calculation
     * @returns {Object} Unit quiz score with detailed metrics
     */
    calculateUnitScore(questions, answers, baseScore) {
        const unitId = questions.length > 0 ? questions[0].unit : null;
        
        return {
            ...baseScore,
            mode: 'unit',
            unitId: unitId,
            unitName: this.unitNames[unitId] || 'Unknown Unit',
            aptitudeScore: baseScore.percentage,
            performance: this.getPerformanceLevel(baseScore.percentage),
            recommendations: this.getUnitRecommendations(baseScore.percentage, unitId)
        };
    }

    /**
     * Calculate practice test score with unit breakdown
     * @param {Array} questions - Array of Question objects
     * @param {Array} answers - Array of answer objects
     * @param {Object} baseScore - Base score calculation
     * @returns {Object} Practice test score with unit analysis
     */
    calculatePracticeScore(questions, answers, baseScore) {
        const unitBreakdown = this.calculateUnitBreakdown(questions, answers);
        const unitAnalysis = this.analyzeUnitPerformance(unitBreakdown);
        
        return {
            ...baseScore,
            mode: 'practice',
            unitBreakdown: unitBreakdown,
            unitAnalysis: unitAnalysis,
            apScore: this.estimateAPScore(baseScore.percentage),
            performance: this.getPerformanceLevel(baseScore.percentage),
            strengths: unitAnalysis.strengths,
            weaknesses: unitAnalysis.weaknesses,
            recommendations: this.getPracticeRecommendations(unitAnalysis)
        };
    }

    /**
     * Calculate study mode score with learning analytics
     * @param {Array} questions - Array of Question objects
     * @param {Array} answers - Array of answer objects
     * @param {Object} baseScore - Base score calculation
     * @returns {Object} Study mode score with learning metrics
     */
    calculateStudyScore(questions, answers, baseScore) {
        const unitBreakdown = this.calculateUnitBreakdown(questions, answers);
        const learningProgress = this.calculateLearningProgress(questions, answers);
        
        return {
            ...baseScore,
            mode: 'study',
            unitBreakdown: unitBreakdown,
            learningProgress: learningProgress,
            performance: this.getPerformanceLevel(baseScore.percentage),
            recommendations: this.getStudyRecommendations(learningProgress)
        };
    }

    /**
     * Calculate unit breakdown for multi-unit quizzes
     * @param {Array} questions - Array of Question objects
     * @param {Array} answers - Array of answer objects
     * @returns {Object} Unit breakdown with detailed metrics
     */
    calculateUnitBreakdown(questions, answers) {
        const breakdown = {
            1: { correct: 0, total: 0, percentage: 0 },
            2: { correct: 0, total: 0, percentage: 0 },
            3: { correct: 0, total: 0, percentage: 0 },
            4: { correct: 0, total: 0, percentage: 0 },
            5: { correct: 0, total: 0, percentage: 0 }
        };

        questions.forEach((question, index) => {
            const answer = answers[index];
            if (answer !== undefined) {
                breakdown[question.unit].total++;
                if (answer.isCorrect) {
                    breakdown[question.unit].correct++;
                }
            }
        });

        // Calculate percentages
        Object.keys(breakdown).forEach(unitId => {
            const unit = breakdown[unitId];
            unit.percentage = unit.total > 0 ? 
                Math.round((unit.correct / unit.total) * 100) : 0;
            unit.unitName = this.unitNames[unitId];
        });

        return breakdown;
    }

    /**
     * Analyze unit performance to identify strengths and weaknesses
     * @param {Object} unitBreakdown - Unit breakdown data
     * @returns {Object} Analysis with strengths and weaknesses
     */
    analyzeUnitPerformance(unitBreakdown) {
        const units = Object.keys(unitBreakdown).map(unitId => ({
            unitId: parseInt(unitId),
            ...unitBreakdown[unitId]
        })).filter(unit => unit.total > 0);

        // Sort by percentage to identify strengths and weaknesses
        units.sort((a, b) => b.percentage - a.percentage);

        const strengths = units.filter(unit => unit.percentage >= 70);
        const weaknesses = units.filter(unit => unit.percentage < 60);
        const average = units.length > 0 ? 
            Math.round(units.reduce((sum, unit) => sum + unit.percentage, 0) / units.length) : 0;

        return {
            strengths: strengths.map(unit => ({
                unitId: unit.unitId,
                unitName: unit.unitName,
                percentage: unit.percentage,
                correct: unit.correct,
                total: unit.total
            })),
            weaknesses: weaknesses.map(unit => ({
                unitId: unit.unitId,
                unitName: unit.unitName,
                percentage: unit.percentage,
                correct: unit.correct,
                total: unit.total
            })),
            average: average,
            unitsAttempted: units.length
        };
    }

    /**
     * Calculate learning progress for study mode
     * @param {Array} questions - Array of Question objects
     * @param {Array} answers - Array of answer objects
     * @returns {Object} Learning progress metrics
     */
    calculateLearningProgress(questions, answers) {
        const validAnswers = answers.filter(answer => answer !== undefined);
        
        // Calculate improvement over time (if we have timestamps)
        const timeBasedProgress = this.calculateTimeBasedProgress(validAnswers);
        
        // Calculate difficulty-based performance
        const difficultyAnalysis = this.analyzeDifficultyPerformance(questions, answers);
        
        return {
            questionsAttempted: validAnswers.length,
            improvementTrend: timeBasedProgress.trend,
            recentPerformance: timeBasedProgress.recent,
            difficultyAnalysis: difficultyAnalysis,
            learningVelocity: this.calculateLearningVelocity(validAnswers)
        };
    }

    /**
     * Calculate time-based progress for learning analytics
     * @param {Array} answers - Array of answer objects with timestamps
     * @returns {Object} Time-based progress data
     */
    calculateTimeBasedProgress(answers) {
        if (answers.length < 5) {
            return { trend: 'insufficient_data', recent: 0 };
        }

        // Sort by timestamp
        const sortedAnswers = answers.sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp));

        // Calculate performance in chunks
        const chunkSize = Math.max(5, Math.floor(answers.length / 4));
        const chunks = [];
        
        for (let i = 0; i < sortedAnswers.length; i += chunkSize) {
            const chunk = sortedAnswers.slice(i, i + chunkSize);
            const correct = chunk.filter(a => a.isCorrect).length;
            chunks.push(Math.round((correct / chunk.length) * 100));
        }

        // Determine trend
        let trend = 'stable';
        if (chunks.length >= 2) {
            const first = chunks[0];
            const last = chunks[chunks.length - 1];
            if (last > first + 10) trend = 'improving';
            else if (last < first - 10) trend = 'declining';
        }

        return {
            trend: trend,
            recent: chunks[chunks.length - 1] || 0,
            progression: chunks
        };
    }

    /**
     * Analyze performance by question difficulty
     * @param {Array} questions - Array of Question objects
     * @param {Array} answers - Array of answer objects
     * @returns {Object} Difficulty analysis
     */
    analyzeDifficultyPerformance(questions, answers) {
        // This is a placeholder - in a real implementation, questions would have difficulty ratings
        // For now, we'll simulate difficulty based on unit and question characteristics
        
        const difficultyLevels = { easy: 0, medium: 0, hard: 0 };
        const correctByDifficulty = { easy: 0, medium: 0, hard: 0 };

        questions.forEach((question, index) => {
            const answer = answers[index];
            if (answer !== undefined) {
                // Simulate difficulty assignment (this would be real data in production)
                const difficulty = this.estimateQuestionDifficulty(question);
                difficultyLevels[difficulty]++;
                if (answer.isCorrect) {
                    correctByDifficulty[difficulty]++;
                }
            }
        });

        return {
            easy: {
                correct: correctByDifficulty.easy,
                total: difficultyLevels.easy,
                percentage: difficultyLevels.easy > 0 ? 
                    Math.round((correctByDifficulty.easy / difficultyLevels.easy) * 100) : 0
            },
            medium: {
                correct: correctByDifficulty.medium,
                total: difficultyLevels.medium,
                percentage: difficultyLevels.medium > 0 ? 
                    Math.round((correctByDifficulty.medium / difficultyLevels.medium) * 100) : 0
            },
            hard: {
                correct: correctByDifficulty.hard,
                total: difficultyLevels.hard,
                percentage: difficultyLevels.hard > 0 ? 
                    Math.round((correctByDifficulty.hard / difficultyLevels.hard) * 100) : 0
            }
        };
    }

    /**
     * Estimate question difficulty (placeholder implementation)
     * @param {Object} question - Question object
     * @returns {string} Difficulty level: 'easy', 'medium', or 'hard'
     */
    estimateQuestionDifficulty(question) {
        // This is a simplified heuristic - real implementation would use actual difficulty data
        const questionLength = question.question.length;
        const hasComplexConcepts = /constitution|amendment|federalism|separation|judicial review/i.test(question.question);
        
        if (questionLength > 150 || hasComplexConcepts) return 'hard';
        if (questionLength > 80) return 'medium';
        return 'easy';
    }

    /**
     * Calculate learning velocity (questions per minute, accuracy trend)
     * @param {Array} answers - Array of answer objects with timestamps
     * @returns {Object} Learning velocity metrics
     */
    calculateLearningVelocity(answers) {
        if (answers.length < 2) {
            return { questionsPerMinute: 0, accuracyTrend: 0 };
        }

        const sortedAnswers = answers.sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp));

        const startTime = new Date(sortedAnswers[0].timestamp);
        const endTime = new Date(sortedAnswers[sortedAnswers.length - 1].timestamp);
        const durationMinutes = (endTime - startTime) / (1000 * 60);

        const questionsPerMinute = durationMinutes > 0 ? 
            Math.round((answers.length / durationMinutes) * 10) / 10 : 0;

        // Calculate accuracy trend (recent vs early performance)
        const halfPoint = Math.floor(answers.length / 2);
        const earlyAccuracy = sortedAnswers.slice(0, halfPoint)
            .filter(a => a.isCorrect).length / halfPoint * 100;
        const recentAccuracy = sortedAnswers.slice(halfPoint)
            .filter(a => a.isCorrect).length / (answers.length - halfPoint) * 100;

        return {
            questionsPerMinute: questionsPerMinute,
            accuracyTrend: Math.round(recentAccuracy - earlyAccuracy)
        };
    }

    /**
     * Get performance level description
     * @param {number} percentage - Score percentage
     * @returns {string} Performance level
     */
    getPerformanceLevel(percentage) {
        if (percentage >= 90) return 'excellent';
        if (percentage >= 80) return 'good';
        if (percentage >= 70) return 'satisfactory';
        if (percentage >= 60) return 'needs_improvement';
        return 'needs_significant_improvement';
    }

    /**
     * Estimate AP exam score based on practice test percentage
     * @param {number} percentage - Practice test percentage
     * @returns {number} Estimated AP score (1-5)
     */
    estimateAPScore(percentage) {
        if (percentage >= 85) return 5;
        if (percentage >= 75) return 4;
        if (percentage >= 60) return 3;
        if (percentage >= 50) return 2;
        return 1;
    }

    /**
     * Get recommendations for unit quiz performance
     * @param {number} percentage - Unit quiz percentage
     * @param {number} unitId - Unit ID
     * @returns {Array} Array of recommendation strings
     */
    getUnitRecommendations(percentage, unitId) {
        const recommendations = [];
        const unitName = this.unitNames[unitId];

        if (percentage < 60) {
            recommendations.push(`Review the core concepts in ${unitName}`);
            recommendations.push('Take more practice questions in this unit');
            recommendations.push('Consider reviewing your textbook or class notes');
        } else if (percentage < 80) {
            recommendations.push(`Good progress in ${unitName}! Focus on the areas you missed`);
            recommendations.push('Try a few more practice questions to solidify your knowledge');
        } else {
            recommendations.push(`Excellent work in ${unitName}!`);
            recommendations.push('You\'re ready to move on to other units or take practice tests');
        }

        return recommendations;
    }

    /**
     * Get recommendations for practice test performance
     * @param {Object} unitAnalysis - Unit analysis data
     * @returns {Array} Array of recommendation strings
     */
    getPracticeRecommendations(unitAnalysis) {
        const recommendations = [];

        if (unitAnalysis.weaknesses.length > 0) {
            recommendations.push('Focus on your weaker units:');
            unitAnalysis.weaknesses.forEach(unit => {
                recommendations.push(`• Study ${unit.unitName} (${unit.percentage}% correct)`);
            });
        }

        if (unitAnalysis.strengths.length > 0) {
            recommendations.push('Great job on your stronger areas:');
            unitAnalysis.strengths.forEach(unit => {
                recommendations.push(`• ${unit.unitName} (${unit.percentage}% correct)`);
            });
        }

        if (unitAnalysis.average < 60) {
            recommendations.push('Consider reviewing fundamental concepts across all units');
            recommendations.push('Take unit-specific quizzes to build confidence');
        } else if (unitAnalysis.average >= 80) {
            recommendations.push('You\'re well-prepared! Keep practicing to maintain your level');
        }

        return recommendations;
    }

    /**
     * Get recommendations for study mode performance
     * @param {Object} learningProgress - Learning progress data
     * @returns {Array} Array of recommendation strings
     */
    getStudyRecommendations(learningProgress) {
        const recommendations = [];

        if (learningProgress.improvementTrend === 'improving') {
            recommendations.push('Great progress! You\'re improving over time');
        } else if (learningProgress.improvementTrend === 'declining') {
            recommendations.push('Consider taking a break and reviewing concepts');
        }

        if (learningProgress.questionsAttempted < 20) {
            recommendations.push('Try answering more questions to get better insights');
        }

        if (learningProgress.learningVelocity.questionsPerMinute < 0.5) {
            recommendations.push('Take your time to understand each question thoroughly');
        } else if (learningProgress.learningVelocity.questionsPerMinute > 2) {
            recommendations.push('Consider slowing down to ensure you\'re learning from each question');
        }

        return recommendations;
    }

    /**
     * Generate detailed results display data
     * @param {Object} scoreData - Comprehensive score data
     * @returns {Object} Formatted results for display
     */
    generateResultsDisplay(scoreData) {
        const display = {
            summary: {
                score: `${scoreData.correct}/${scoreData.total}`,
                percentage: `${scoreData.percentage}%`,
                performance: scoreData.performance,
                mode: scoreData.mode
            },
            details: {},
            recommendations: scoreData.recommendations || []
        };

        // Add mode-specific display details
        switch (scoreData.mode) {
            case 'unit':
                display.details = {
                    unitName: scoreData.unitName,
                    aptitudeScore: scoreData.aptitudeScore
                };
                break;

            case 'practice':
                display.details = {
                    estimatedAPScore: scoreData.apScore,
                    unitBreakdown: scoreData.unitBreakdown,
                    strengths: scoreData.strengths,
                    weaknesses: scoreData.weaknesses
                };
                break;

            case 'study':
                display.details = {
                    learningProgress: scoreData.learningProgress,
                    unitBreakdown: scoreData.unitBreakdown
                };
                break;
        }

        return display;
    }

    /**
     * Calculate aptitude score based on historical performance
     * @param {number} correct - Number of correct answers
     * @param {number} total - Total number of questions attempted
     * @param {number} previousCorrect - Previous correct count
     * @param {number} previousTotal - Previous total count
     * @returns {number} Updated aptitude percentage
     */
    calculateAptitude(correct, total, previousCorrect = 0, previousTotal = 0) {
        const totalCorrect = correct + previousCorrect;
        const totalQuestions = total + previousTotal;
        
        if (totalQuestions === 0) return 0;
        
        return Math.round((totalCorrect / totalQuestions) * 100);
    }

    /**
     * Generate analytics summary for dashboard display
     * @param {Object} progressData - User progress data
     * @returns {Object} Analytics summary
     */
    generateAnalyticsSummary(progressData) {
        const summary = {
            overallAptitude: 0,
            totalQuestions: 0,
            unitsCompleted: 0,
            practiceTestsCompleted: progressData.practiceTests ? progressData.practiceTests.length : 0,
            unitProgress: {},
            recentTrend: 'stable'
        };

        // Calculate unit progress
        if (progressData.units) {
            Object.keys(progressData.units).forEach(unitId => {
                const unit = progressData.units[unitId];
                const aptitude = this.calculateAptitude(unit.correct, unit.total);
                
                summary.unitProgress[unitId] = {
                    unitName: this.unitNames[unitId],
                    aptitude: aptitude,
                    questionsAttempted: unit.total,
                    questionsCorrect: unit.correct
                };
                
                summary.totalQuestions += unit.total;
                if (aptitude > 0) summary.unitsCompleted++;
            });
        }

        // Calculate overall aptitude
        const totalCorrect = Object.values(progressData.units || {})
            .reduce((sum, unit) => sum + unit.correct, 0);
        summary.overallAptitude = this.calculateAptitude(totalCorrect, summary.totalQuestions);

        // Calculate recent trend from practice tests
        if (progressData.practiceTests && progressData.practiceTests.length >= 2) {
            const tests = progressData.practiceTests;
            if (tests.length >= 3) {
                const recent = tests.slice(-2);
                const older = tests.slice(-4, -2);
                
                if (older.length > 0) {
                    const recentAvg = recent.reduce((sum, test) => sum + test.percentage, 0) / recent.length;
                    const olderAvg = older.reduce((sum, test) => sum + test.percentage, 0) / older.length;
                    
                    if (recentAvg > olderAvg + 3) summary.recentTrend = 'improving';
                    else if (recentAvg < olderAvg - 3) summary.recentTrend = 'declining';
                }
            } else {
                // For fewer tests, just compare first and last
                const first = tests[0].percentage;
                const last = tests[tests.length - 1].percentage;
                
                if (last > first + 5) summary.recentTrend = 'improving';
                else if (last < first - 5) summary.recentTrend = 'declining';
            }
        }

        return summary;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoringEngine;
}