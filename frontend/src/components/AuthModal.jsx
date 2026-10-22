import { useState, useEffect } from 'react';
import { Zap, X, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVerity } from '../context/VerityContext';
import './AuthModal.css';

export default function AuthModal({ forceOpen = false }) {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    authNotice,
    login,
    signup
  } = useAuth();

  const { navigateTo } = useVerity();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Reset errors when mode changes
  useEffect(() => {
    setError('');
    setSuccessMsg('');
  }, [authModalMode]);

  const isOpen = isAuthModalOpen || forceOpen;
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        await login(email, password);
        setSuccessMsg('Signed in successfully! Redirecting...');
      } else {
        await signup({ name, email, password });
        setSuccessMsg('Account created successfully! Redirecting...');
      }

      // Automatically open search page once signed in
      setTimeout(() => {
        closeAuthModal();
        navigateTo('search');
      }, 400);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = authModalMode === 'login';

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal}>
      <div className="auth-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="auth-card-header">
          <div className="auth-header-top">
            <div className="auth-brand">
              <div className="auth-brand-logo">
                <Zap size={18} />
              </div>
              <span className="auth-brand-title">Verity</span>
            </div>

            <button
              type="button"
              className="auth-close-btn"
              onClick={closeAuthModal}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <h2 className="auth-card-title">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="auth-card-subtitle">
            {isLogin
              ? 'Enter your credentials to access your dashboard'
              : 'Enter your details below to create your account'}
          </p>

          {/* Tab Switcher */}
          <div className="auth-tab-switch">
            <button
              type="button"
              className={`auth-tab-button ${isLogin ? 'active' : ''}`}
              onClick={() => setAuthModalMode('login')}
            >
              Log In
            </button>
            <button
              type="button"
              className={`auth-tab-button ${!isLogin ? 'active' : ''}`}
              onClick={() => setAuthModalMode('signup')}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Notice Banner (e.g. redirected from dashboard) */}
        {authNotice && (
          <div className="auth-notice-banner">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{authNotice}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-alert-error">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert-success">
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {!isLogin && (
            <div className="auth-input-group">
              <label className="auth-label" htmlFor="auth-name">
                Full Name
              </label>
              <div className="auth-input-container">
                <input
                  id="auth-name"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="auth-text-input"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label className="auth-label" htmlFor="auth-email">
              Email Address
            </label>
            <div className="auth-input-container">
              <input
                id="auth-email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="auth-text-input"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <div className="auth-label">
              <label htmlFor="auth-password">Password</label>
              {isLogin && (
                <span className="auth-forgot-link" onClick={() => alert('Password reset link sent to your email.')}>
                  Forgot password?
                </span>
              )}
            </div>
            <div className="auth-input-container">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={isLogin ? 'Enter your password' : 'At least 6 characters'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="auth-text-input"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="auth-eye-button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-primary-btn"
          >
            {loading ? (
              <span>Please wait...</span>
            ) : isLogin ? (
              <span>Sign In</span>
            ) : (
              <span>Create Account</span>
            )}
          </button>

          <div className="auth-switch-prompt">
            {isLogin ? (
              <>
                Don't have an account?
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => setAuthModalMode('signup')}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => setAuthModalMode('login')}
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
