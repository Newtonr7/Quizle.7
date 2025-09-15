
import React, { useState } from 'react';
import './QuizPage.css';

// Quiz page component that displays questions and handles user interactions
// Manages quiz state, progress tracking, and navigation between questions
function QuizPage({ quizData, onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Validate quiz data
  // This checks the quiz data to ensure it exists and has questions
  // I added the html structure to make it look better
  if (!quizData || quizData.length === 0) {
    return (
      <div className="quiz-error">
        <h2>No quiz questions available</h2>
        <p>Please go back and generate a quiz.</p>
      </div>
    );
  }
  // Get the current question based on the current index
  const currentQuestion = quizData[currentQuestionIndex];

  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    // Prevent selection during feedback
    if (showFeedback) return; 
    setSelectedAnswer(answerIndex);
    // set show feedback to false because user is selecting a new answer
    setShowFeedback(false);
  };

  // Handle navigation to next question
  const handleNext = () => {
    if (selectedAnswer === null) {
      // the alert prompts the user to select an answer if they try to proceed without one
      alert("Please select an answer first");
      return;
    }
    
    // Save the user's answer
    const newUserAnswers = [...userAnswers];
    // This line saves the selected answer at the current question index
    newUserAnswers[currentQuestionIndex] = selectedAnswer;
    setUserAnswers(newUserAnswers);
    
    // Show feedback set true to display correct/incorrect feedback
    setShowFeedback(true);
    
    // Move to next question or show results after delay
    // settimeout function creates a short delay
    setTimeout(() => {
      if (currentQuestionIndex < quizData.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        // Reset selected answer and hide feedback for next question
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        // else call onComplete to show results
        onComplete(newUserAnswers);
      }
      // Delay of 1500 milliseconds (1.5 seconds) for feedback display
    }, 1500);
  };
  
  // Calculate progress percentage
  const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;
  
  // Determine if selected answer is correct
  // I wrote it this way to make it one line and easier to read
  const isCorrect = selectedAnswer === currentQuestion.correctAnswerIndex;
  
  return (
    <div className="quiz-page">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div 
          className="progress" 
          style={{ width: `${progress}%` }}
          aria-label={`Progress: ${Math.round(progress)}%`}
        ></div>
      </div>
      
      {/* Question Counter */}
      <p className="question-counter">
        Question {currentQuestionIndex + 1} of {quizData.length}
      </p>
      
      {/* Question Container */}
      <div className="question-container">
        <h2>{currentQuestion.question}</h2>
        
        {/* Answer Options */}
        <div className="answer-options">
          {currentQuestion.options.map((option, index) => {
            let optionClass = 'answer-option';
            
            if (selectedAnswer === index) {
              optionClass += ' selected';
            }
            
            if (showFeedback) {
              if (index === selectedAnswer) {
                optionClass += isCorrect ? ' correct' : ' incorrect';
              }
              if (index === currentQuestion.correctAnswerIndex) {
                optionClass += ' correct-answer';
              }
            }
           
            return (
              
              <div 
                key={index}
                className={optionClass}
                onClick={() => handleAnswerSelect(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAnswerSelect(index);
                  }
                }}
                aria-pressed={selectedAnswer === index}
              >
                {option}
              </div>
            );
          })}
        </div>
        
        {/* Feedback */}
        {showFeedback && (
          <div className={`feedback ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`}>
            {isCorrect ? 'Correct!' : 'Incorrect!'} 
            {!isCorrect && (
              <p>The correct answer is: {currentQuestion.options[currentQuestion.correctAnswerIndex]}</p>
            )}
          </div>
        )}
        
        {/* Next Button */}
        <button 
          className="next-button"
          onClick={handleNext}
          disabled={selectedAnswer === null}
          type="button"
        >
          {currentQuestionIndex < quizData.length - 1 ? 'Next Question' : 'See Results'}
        </button>
      </div>
    </div>
  );
}

export default QuizPage;