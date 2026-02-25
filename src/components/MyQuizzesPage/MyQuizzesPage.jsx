import React, { useState, useEffect } from 'react';
import { quizzes } from '../../services/supabase';
import './MyQuizzesPage.css';

function MyQuizzesPage({ user, onRetakeQuiz, onNavigateHome, showToast }) {
  const [quizList, setQuizList] = useState([]);
  const [attemptsMap, setAttemptsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const { error: err } = await quizzes.delete(user.id, deleteTarget.id);
      if (err) throw err;
      setQuizList((prev) => prev.filter((q) => q.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast('Quiz deleted');
    } catch (err) {
      setDeleteError('Failed to delete quiz. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

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
              <div className="quiz-card-actions">
                <button
                  className="retake-btn"
                  onClick={() => onRetakeQuiz(quiz.id, quiz.questions)}
                >
                  Retake
                </button>
                <button
                  className="delete-btn"
                  onClick={() => setDeleteTarget(quiz)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => { if (!deleting) setDeleteTarget(null); }}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Quiz</h3>
            <p>Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This will also remove all attempt history for this quiz.</p>
            {deleteError && <div className="error-message">{deleteError}</div>}
            <div className="delete-modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyQuizzesPage;
