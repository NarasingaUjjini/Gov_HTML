/**
 * Question class for AP Government quiz questions
 * Handles validation and data structure for individual questions
 */
class Question {
    constructor(data) {
        this.id = data.id;
        this.unit = data.unit;
        this.question = data.question;
        this.options = data.options;
        this.correct = data.correct;
        this.explanation = data.explanation || '';
        
        this.validate();
    }

    /**
     * Validates the question data according to AP Gov format requirements
     * @throws {Error} If validation fails
     */
    validate() {
        // Validate required fields
        if (!this.id || typeof this.id !== 'string') {
            throw new Error('Question must have a valid string ID');
        }

        // Validate unit (must be 1-5 for AP Gov units)
        if (!Number.isInteger(this.unit) || this.unit < 1 || this.unit > 5) {
            throw new Error('Unit must be an integer between 1 and 5');
        }

        // Validate question text
        if (!this.question || typeof this.question !== 'string' || this.question.trim().length === 0) {
            throw new Error('Question text must be a non-empty string');
        }

        // Validate options (must be array of 4 strings)
        if (!Array.isArray(this.options) || this.options.length !== 4) {
            throw new Error('Options must be an array of exactly 4 choices');
        }

        for (let i = 0; i < this.options.length; i++) {
            if (typeof this.options[i] !== 'string' || this.options[i].trim().length === 0) {
                throw new Error(`Option ${i + 1} must be a non-empty string`);
            }
        }

        // Validate correct answer index
        if (!Number.isInteger(this.correct) || this.correct < 0 || this.correct > 3) {
            throw new Error('Correct answer must be an integer between 0 and 3');
        }

        // Validate explanation (optional but must be string if provided)
        if (this.explanation && typeof this.explanation !== 'string') {
            throw new Error('Explanation must be a string if provided');
        }
    }

    /**
     * Checks if the provided answer is correct
     * @param {number} answerIndex - The selected answer index (0-3)
     * @returns {boolean} True if answer is correct
     */
    isCorrect(answerIndex) {
        return answerIndex === this.correct;
    }

    /**
     * Gets the correct answer text
     * @returns {string} The correct answer option
     */
    getCorrectAnswer() {
        return this.options[this.correct];
    }

    /**
     * Gets the unit name based on unit number
     * @returns {string} The unit name
     */
    getUnitName() {
        const unitNames = {
            1: 'Foundations of American Democracy',
            2: 'Interactions Among Branches of Government',
            3: 'Civil Liberties and Civil Rights',
            4: 'American Political Ideologies and Beliefs',
            5: 'Political Participation'
        };
        return unitNames[this.unit] || 'Unknown Unit';
    }

    /**
     * Returns a plain object representation of the question
     * @returns {Object} Question data as plain object
     */
    toJSON() {
        return {
            id: this.id,
            unit: this.unit,
            question: this.question,
            options: [...this.options],
            correct: this.correct,
            explanation: this.explanation
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Question;
}