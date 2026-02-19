import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Hooks/useAuth';
import './NavBar.css';

const NavBar = ({ user }) => {
  const { signIn, signUp, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Close modal on Escape key
  useEffect(() => {
    if (!showAuthModal) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowAuthModal(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAuthModal]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <>
      <nav className="nav-bar">
        <Link to="/" className="nav-logo">
          <span>Q</span>
        </Link>

        <div className="nav-auth">
          {user ? (
            <>
              <span className="user-email">{user.email.split('@')[0]}</span>
              <button className="sign-out-btn" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <button
              className="sign-in-btn"
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{isSignUp ? 'Create Account' : 'Sign In'}</h3>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleAuth}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <p>
              {isSignUp ? 'Have an account?' : 'Need an account?'}{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>

            <button className="close-btn" onClick={() => setShowAuthModal(false)}>
              x
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
