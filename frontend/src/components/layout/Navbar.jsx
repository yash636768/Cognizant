import React from 'react';
import {
  Compass,
  Target,
  BrainCircuit,
  ChevronDown,
  LogIn
} from 'lucide-react';

export default function Navbar({
  page,
  setPage,
  currentUser,
  navigateToAssessment,
  setIsInterviewOpen,
  onOpenAuthModal
}) {
  return (
    <header className="navbar">
      <div className="container nav-content">
        {/* Brand */}
        <button
          type="button"
          className="brand-logo"
          onClick={() => setPage('landing')}
          aria-label="Go to Pathfinder overview"
        >
          <span className="brand-icon">PF</span>
          <span className="brand-name">Pathfinder</span>
        </button>

        {/* Navigation */}
        <nav className="nav-menu" aria-label="Main navigation">
          <button
            type="button"
            onClick={() => setPage('landing')}
            className={`nav-link ${page === 'landing' ? 'active' : ''}`}
          >
            <Compass size={14} />
            Overview
          </button>

          <button
            type="button"
            onClick={() => navigateToAssessment()}
            className={`nav-link ${page === 'input' ? 'active' : ''}`}
          >
            <Target size={14} />
            Skill Assessment
          </button>

          <button
            type="button"
            onClick={() => setIsInterviewOpen(true)}
            className="nav-link"
            title="Practice AI Technical Mock Interview"
            style={{ color: '#6366f1', fontWeight: 600 }}
          >
            <BrainCircuit size={14} />
            AI Mock Interview
          </button>
        </nav>

        {/* User / Auth */}
        <div className="navbar-actions">
          {currentUser ? (
            <button
              type="button"
              className="user-avatar-badge profile-trigger"
              onClick={() => setPage('profile')}
              title="Open your profile"
              aria-label="Open your profile"
            >
              <div className="avatar-circle">
                {currentUser.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span>
                {currentUser.name?.split(' ')[0] || 'Profile'}
              </span>
              <ChevronDown size={13} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="btn btn-primary btn-sm"
            >
              <LogIn size={14} />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
