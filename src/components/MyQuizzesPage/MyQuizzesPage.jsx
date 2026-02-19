import React, { useState, useEffect } from 'react';
import { quizzes } from '../../services/supabase';
import './MyQuizzesPage.css';

function MyQuizzesPage({ user, onRetakeQuiz, onNavigateHome }) {
  const [quizList, setQuizList] = useState([]);
  const [attemptsMap, setAttemptsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [quizRes, attemptRes] = await Promise.all([
          quizzes.getUserQuizzes(user.id),
          quizzes.getUserAttempts(user.id),
        ]);

        if (quizRes.error) throw quizRes.error;
        if (attemptRes.error) throw attemptRes.error;

        setQuizList(quizRes.data || []);

        const map = {};
        (attemptRes.data || []).forEach((attempt) => {
          if (!map[attempt.quiz_id]) {
            map[attempt.quiz_id] = { bestScore: attempt.score, attemptCount: 0 };
          }
          map[attempt.quiz_id].attemptCount += 1;
          if (attempt.score > map[attempt.quiz_id].bestScore) {
            map[attempt.quiz_id].bestScore = attempt.score;
          }
        });
        setAttemptsMap(map);
      } catch (err) {
        setError('Failed to load quizzes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="my-quizzes-page">
        <div className="my-quizzes-loading">
          <div className="spinner"></div>
          <p>Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-quizzes-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (quizList.length === 0) {
    return (
      <div className="my-quizzes-page">
        <h2>My Quizzes</h2>
        <div className="my-quizzes-empty">
          <p>You haven't created any quizzes yet.</p>
          <button onClick={onNavigateHome}>Create Your First Quiz</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-quizzes-page">
      <h2>My Quizzes</h2>
      <p className="my-quizzes-subtitle">
        {quizList.length} quiz{quizList.length !== 1 ? 'zes' : ''} saved
      </p>
      <div className="quiz-card-list">
        {quizList.map((quiz) => {
          const stats = attemptsMap[quiz.id];
          const questionCount = quiz.questions?.length || 0;

          return (
            <div className="quiz-card" key={quiz.id}>
              <div className="quiz-card-info">
                <h3>{quiz.title}</h3>
                <span className="quiz-card-date">
                  {new Date(quiz.created_at).toLocaleDateString()}
                </span>
                <div className="quiz-card-meta">
                  <span>{questionCount} question{questionCount !== 1 ? 's' : ''}</span>
                  {stats && (
                    <>
                      <span className="meta-separator">|</span>
                      <span>Best: {stats.bestScore}/{questionCount}</span>
                      <span className="meta-separator">|</span>
                      <span>{stats.attemptCount} attempt{stats.attemptCount !== 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                className="retake-btn"
                onClick={() => onRetakeQuiz(quiz.id, quiz.questions)}
              >
                Retake
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyQuizzesPage;
