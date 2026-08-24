import React from 'react';
import { User, AlertCircle, X } from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  authTab,
  setAuthTab,
  authForm,
  setAuthForm,
  authError,
  setAuthError,
  authLoading,
  handleAuthSubmit
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              background: 'var(--color-brand-light)',
              color: 'var(--color-brand)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              border: '1px solid var(--color-brand-border)'
            }}
          >
            <User size={22} />
          </div>
          <h2 style={{ fontSize: '19px', fontWeight: 700 }}>
            {authTab === 'login' ? "Welcome Back to Pathfinder" : "Create Your Free Account"}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {authTab === 'login'
              ? "Sign in to access Skill Assessment and save your target career paths."
              : "Get custom learning paths grounded in 623 Coursera offerings."}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${authTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setAuthTab('login');
              setAuthError('');
            }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${authTab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setAuthTab('register');
              setAuthError('');
            }}
          >
            Create Account
          </button>
        </div>

        {authError && (
          <div className="auth-error">
            <AlertCircle size={15} />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit}>
          {authTab === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Alex Morgan"
                required
                value={authForm.name}
                onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="name@company.com"
              required
              value={authForm.email}
              onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              required
              minLength={6}
              value={authForm.password}
              onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={authLoading}
          >
            {authLoading
              ? "Processing..."
              : authTab === 'login'
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <div
          style={{
            marginTop: '18px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-subtle)'
          }}
        >
          {authTab === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setAuthError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-brand)',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Sign up free
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setAuthError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-brand)',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
