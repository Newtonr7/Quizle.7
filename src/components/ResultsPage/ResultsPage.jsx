import React from 'react';
import './ResultsPage.css';

function ResultPage({ quizData, userAnswers, onRestart, onNewQuiz }) {
  const correctAnswers = userAnswers.reduce((total, userAnswer, index) => {
    return userAnswer === quizData[index].correctAnswerIndex ? total + 1 : total;
  }, 0);

  const percentage = Math.round((correctAnswers / quizData.length) * 100);

  let message = '';
  if (percentage >= 90) {
    message = "Excellent! You're a quiz master!";
  } else if (percentage >= 70) {
    message = 'Great job! You know your stuff!';
  } else if (percentage >= 50) {
    message = "Not bad! You've got a good foundation.";
  } else {
    message = "Keep learning! You'll do better next time.";
  }

  const handleRestartSameQuiz = () => {
    onRestart(quizData);
  };

  const handleStartNewQuiz = () => {
    onNewQuiz();
  };

  return (
    <div className="result-page">
      <div className="result-content">
      <h2>Quiz Results</h2>

      <div className="score-container">
        <div className="score">
          <span className="score-number">{correctAnswers}</span>
          <span className="score-divider">/</span>
          <span className="total-number">{quizData.length}</span>
        </div>

        <div className="percentage">{percentage}%</div>

        <p className="result-message">{message}</p>
      </div>

      <div className="review-section">
        <h3>Review Questions</h3>

        {quizData.map((question, index) => (
          <div key={index} className="review-question">
            <p className="question-text">
              <strong>Q{index + 1}:</strong> {question.question}
            </p>

            <div className="review-answers">
              {question.options.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className={`review-answer ${optIndex === question.correctAnswerIndex ? 'correct' : ''
                    } ${optIndex === userAnswers[index] &&
                      optIndex !== question.correctAnswerIndex ? 'incorrect' : ''
                    }`}
                >
                  {option}
                  {optIndex === question.correctAnswerIndex &&
                    <span className="answer-marker correct-marker">✓ Correct </span>
                  }
                  {optIndex === userAnswers[index] &&
                    optIndex !== question.correctAnswerIndex &&
                    <span className="answer-marker incorrect-marker">X Your answer</span>
                  }
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="action-buttons">
        <button
          className="restart-same-quiz"
          onClick={handleRestartSameQuiz}
        >
          <span className="restart-icon">↺</span>
          Restart Quiz
        </button>

        <button
          className="restart-button"
          onClick={handleStartNewQuiz}
        >

          <span className="restart-icon">+</span>
          Create New Quiz

        </button>
      </div>
    </div>
    </div>
  );
}

export default ResultPage;
