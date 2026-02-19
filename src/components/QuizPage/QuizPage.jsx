import React, { useState } from 'react';
import './QuizPage.css';

function QuizPage({ quizData, onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [warning, setWarning] = useState('');

  if (!quizData || quizData.length === 0) {
    return (
      <div className="quiz-error">
        <h2>No quiz questions available</h2>
        <p>Please go back and generate a quiz.</p>
      </div>
    );
  }

  const currentQuestion = quizData[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
    setShowFeedback(false);
    setWarning('');
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      setWarning('Please select an answer first');
      return;
    }

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = selectedAnswer;
    setUserAnswers(newUserAnswers);

    setShowFeedback(true);

    // 1.5s delay to show correct/incorrect feedback before advancing
    setTimeout(() => {
      if (currentQuestionIndex < quizData.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setWarning('');
      } else {
        onComplete(newUserAnswers);
      }
    }, 1500);
  };

  const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswerIndex;

  return (
    <div className="quiz-page">
      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${progress}%` }}
          aria-label={`Progress: ${Math.round(progress)}%`}
        ></div>
      </div>

      <p className="question-counter">
        Question {currentQuestionIndex + 1} of {quizData.length}
      </p>

      <div className="question-container">
        <h2>{currentQuestion.question}</h2>

        {warning && <div className="quiz-warning">{warning}</div>}

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

        {showFeedback && (
          <div className={`feedback ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`}>
            {isCorrect ? 'Correct!' : 'Incorrect!'}
            {!isCorrect && (
              <p>The correct answer is: {currentQuestion.options[currentQuestion.correctAnswerIndex]}</p>
            )}
          </div>
        )}

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
