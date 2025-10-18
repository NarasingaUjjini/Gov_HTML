# Design Document

## Overview

The AP Government Quiz Tool is a client-side web application built with HTML, CSS, and JavaScript that provides three distinct study modes for AP United States Government students. The application features a clean, professional interface inspired by hamstudy.org with comprehensive progress tracking and analytics. The tool operates entirely in the browser using local storage for persistence, making it easily embeddable in existing websites.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │   Application   │    │      Data       │
│     Layer       │◄──►│     Layer       │◄──►│     Layer       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│                      │                      │
├─ Dashboard UI        ├─ Quiz Engine         ├─ Question Bank
├─ Quiz Interface      ├─ Progress Tracker    ├─ User Progress
├─ Progress Charts     ├─ Timer Manager       ├─ Local Storage
└─ Navigation          └─ Analytics Engine    └─ Session Data
```

### Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Data Storage**: Browser Local Storage
- **Charts**: Canvas API or lightweight charting library (Chart.js)
- **Responsive Design**: CSS Grid and Flexbox
- **No external dependencies** for core functionality

## Components and Interfaces

### 1. Application Controller (`app.js`)

**Purpose**: Main application orchestrator and state management

**Key Methods**:
- `init()`: Initialize application and load saved data
- `navigateToMode(mode)`: Handle navigation between study modes
- `loadQuestions()`: Load and organize question bank by units
- `saveProgress()`: Persist user progress to local storage

### 2. Dashboard Component (`dashboard.js`)

**Purpose**: Main landing page with progress overview and mode selection

**Features**:
- Unit progress visualization (bar chart similar to hamstudy.org)
- Three mode selection buttons with icons
- Practice test score progression graph
- Overall statistics display

**Interface**:
```javascript
class Dashboard {
  render()
  updateProgressChart(unitData)
  updateScoreGraph(testScores)
  handleModeSelection(mode)
}
```

### 3. Quiz Engine (`quiz-engine.js`)

**Purpose**: Core quiz functionality for all three modes

**Features**:
- Question selection and randomization
- Answer validation and scoring
- Progress tracking within sessions
- Mode-specific behavior handling

**Interface**:
```javascript
class QuizEngine {
  startQuiz(mode, unitId = null)
  loadQuestion(questionId)
  submitAnswer(answer)
  calculateScore()
  endQuiz()
}
```

### 4. Timer Manager (`timer.js`)

**Purpose**: Handle timed practice test functionality

**Features**:
- 80-minute countdown timer
- Visual timer display
- Auto-submit when time expires
- Warning notifications

**Interface**:
```javascript
class Timer {
  start(duration)
  pause()
  resume()
  stop()
  getTimeRemaining()
  onTimeUp(callback)
}
```

### 5. Progress Tracker (`progress.js`)

**Purpose**: Track and calculate user performance metrics

**Features**:
- Unit-specific aptitude calculation
- Question exposure tracking ("seen" metrics)
- Practice test score history
- Performance analytics

**Interface**:
```javascript
class ProgressTracker {
  updateUnitProgress(unitId, correct, total)
  recordPracticeTest(score, unitBreakdown)
  getUnitAptitude(unitId)
  getOverallProgress()
}
```

### 6. Question Manager (`questions.js`)

**Purpose**: Handle question bank operations and organization

**Features**:
- Question loading and parsing
- Unit-based filtering
- Random question selection
- Question validation

**Interface**:
```javascript
class QuestionManager {
  loadQuestions(questionData)
  getQuestionsByUnit(unitId)
  getRandomQuestions(count, units = null)
  validateQuestion(question)
}
```

## Data Models

### Question Model
```javascript
{
  id: "unique_identifier",
  unit: 1-5, // AP Gov unit number
  question: "Question text",
  options: ["A", "B", "C", "D"], // Multiple choice options
  correct: 0-3, // Index of correct answer
  explanation: "Explanation text (optional)"
}
```

### User Progress Model
```javascript
{
  units: {
    1: { seen: 45, correct: 38, total: 50 },
    2: { seen: 32, correct: 28, total: 45 },
    // ... units 3-5
  },
  practiceTests: [
    {
      date: "2024-01-15",
      score: 42,
      total: 55,
      unitBreakdown: { 1: 8, 2: 9, 3: 7, 4: 9, 5: 9 }
    }
  ],
  currentSession: {
    mode: "unit|practice|study",
    unitId: 1, // if unit mode
    currentQuestion: 5,
    answers: [],
    startTime: timestamp
  }
}
```

### Application State Model
```javascript
{
  currentMode: "dashboard|unit|practice|study",
  selectedUnit: 1-5, // for unit mode
  questions: [], // loaded question bank
  userProgress: UserProgressModel,
  timer: TimerState,
  currentQuiz: QuizSession
}
```

## User Interface Design

### Layout Structure

**Main Container**:
- Header with application title and navigation
- Content area that switches between dashboard and quiz modes
- Footer with minimal branding (optional)

**Dashboard Layout** (inspired by hamstudy.org):
```
┌─────────────────────────────────────────┐
│           AP Government Study Tool       │
├─────────────────────────────────────────┤
│  📚 Unit Quiz    ⏱️ Practice Test       │
│                                         │
│  📖 Study Mode                          │
├─────────────────────────────────────────┤
│     Exam Study Progress                 │
│  ████████████████████████████████████   │
│  Unit 1: 85%  Unit 2: 72%  Unit 3: 91% │
│  Unit 4: 68%  Unit 5: 79%              │
├─────────────────────────────────────────┤
│     Practice Test Score Progression     │
│  [Line Chart showing scores over time]  │
└─────────────────────────────────────────┘
```

**Quiz Interface Layout**:
```
┌─────────────────────────────────────────┐
│  Question 15 of 55        Timer: 45:32  │
├─────────────────────────────────────────┤
│                                         │
│  Which of the following best describes  │
│  the concept of federalism?             │
│                                         │
│  ○ A) Central government has all power  │
│  ○ B) Power shared between levels       │
│  ○ C) States have complete autonomy     │
│  ○ D) Local governments rule all        │
│                                         │
├─────────────────────────────────────────┤
│  [Previous] [Next] [Submit] [End Quiz]  │
└─────────────────────────────────────────┘
```

### Color Scheme and Typography

**Primary Colors** (inspired by hamstudy.org):
- Primary Blue: #4A90E2 (buttons, headers)
- Light Blue: #E8F4FD (progress bars, backgrounds)
- Success Green: #7ED321 (correct answers)
- Warning Orange: #F5A623 (timer warnings)
- Error Red: #D0021B (incorrect answers)
- Neutral Gray: #9B9B9B (secondary text)

**Typography**:
- Headers: Clean sans-serif (Arial, Helvetica, sans-serif)
- Body text: Readable font size (16px minimum)
- Question text: Slightly larger (18px) for readability

## Error Handling

### Client-Side Error Management

**Local Storage Errors**:
- Graceful degradation when storage is unavailable
- Fallback to session-only data
- User notification of limited functionality

**Question Loading Errors**:
- Validation of question format and completeness
- Error messages for malformed questions
- Fallback to default question set if available

**Timer Errors**:
- Automatic recovery from timer interruptions
- Background tab handling for accurate timing
- Manual time adjustment capabilities

**Navigation Errors**:
- Prevention of data loss during mode switches
- Confirmation dialogs for destructive actions
- State recovery mechanisms

### User Experience Error Handling

**Progress Loss Prevention**:
- Auto-save functionality every 30 seconds
- Warning dialogs before navigation
- Recovery options for interrupted sessions

**Input Validation**:
- Real-time validation of user selections
- Clear error messaging
- Guided correction suggestions

## Testing Strategy

### Unit Testing Approach

**Core Components Testing**:
- Quiz Engine: Question selection, scoring logic, mode switching
- Progress Tracker: Calculation accuracy, data persistence
- Timer Manager: Countdown accuracy, event handling
- Question Manager: Filtering, randomization, validation

**Test Framework**: Jest or similar lightweight testing framework

### Integration Testing

**User Flow Testing**:
- Complete quiz workflows for each mode
- Progress tracking across sessions
- Data persistence and recovery
- Cross-browser compatibility

**Performance Testing**:
- Large question bank handling (1000+ questions)
- Local storage capacity limits
- Responsive design across devices

### User Acceptance Testing

**Functionality Validation**:
- All three study modes work as specified
- Progress tracking accuracy
- Timer functionality in practice tests
- Question randomization and unit filtering

**Usability Testing**:
- Interface intuitive for target users (high school students)
- Clear navigation between modes
- Accessible design for various abilities
- Mobile-friendly responsive design

### Browser Compatibility Testing

**Target Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile Browsers**:
- iOS Safari
- Chrome Mobile
- Samsung Internet

**Testing Scenarios**:
- Local storage functionality
- Timer accuracy across browsers
- CSS rendering consistency
- JavaScript ES6+ feature support