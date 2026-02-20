import React, { useState, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './Hooks/useAuth';
import { quizzes } from './services/supabase';
import NavBar from './components/NavBar/NavBar';
import HomePage from './components/HomePage/HomePage';
import QuizPage from './components/QuizPage/QuizPage';
import ResultPage from './components/ResultsPage/ResultsPage';
import MyQuizzesPage from './components/MyQuizzesPage/MyQuizzesPage';
import Toast from './components/Toast/Toast';

function AppContent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  if (loading) {
    return (
      <div className="App">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const goToQuiz = (generatedQuiz) => {
    setQuizData(generatedQuiz);
    setUserAnswers([]);
    navigate('/quiz');
  };

  const goToResults = (answers) => {
    setUserAnswers(answers);
    navigate('/results');
  };

  const restartQuiz = () => {
    navigate('/quiz');
  };

  const goToHome = () => {
    navigate('/');
  };

  const retakeQuiz = (quizId, questions) => {
    setQuizData(questions);
    setUserAnswers([]);
    navigate('/quiz');
  };

  const saveQuiz = async (quizName) => {
    const score = userAnswers.reduce((total, userAnswer, index) => {
      return userAnswer === quizData[index].correctAnswerIndex ? total + 1 : total;
    }, 0);

    const { data, error } = await quizzes.save(user.id, quizName, quizData);
    if (error) throw error;

    const quizId = data[0].id;
    const attemptResult = await quizzes.saveAttempt(user.id, quizId, score);
    if (attemptResult.error) throw attemptResult.error;

    showToast('Quiz saved!');
  };

  const goToMyQuizzes = () => {
    navigate('/my-quizzes');
  };

  return (
    <>
      <NavBar user={user} onMyQuizzes={goToMyQuizzes} />
      <div className="App">
        <header className="App-header">
          <h1>Quizle</h1>
          {user && <p>Welcome back, {user.email.split('@')[0]}!</p>}
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage onQuizGenerated={goToQuiz} user={user} />} />
            <Route
              path="/quiz"
              element={
                quizData.length > 0
                  ? <QuizPage quizData={quizData} onComplete={goToResults} />
                  : <Navigate to="/" replace />
              }
            />
            <Route
              path="/results"
              element={
                userAnswers.length > 0
                  ? <ResultPage
                      quizData={quizData}
                      userAnswers={userAnswers}
                      onRestart={restartQuiz}
                      onNewQuiz={goToHome}
                      user={user}
                      onSaveQuiz={saveQuiz}
                    />
                  : <Navigate to="/" replace />
              }
            />
            <Route
              path="/my-quizzes"
              element={
                user
                  ? <MyQuizzesPage
                      user={user}
                      onRetakeQuiz={retakeQuiz}
                      onNavigateHome={goToHome}
                    />
                  : <Navigate to="/" replace />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
