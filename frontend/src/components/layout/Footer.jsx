import React from 'react';

export default function Footer({ setPage, navigateToAssessment }) {
  return (
    <footer className="footer">
      <div className="container footer-content">
        {/* Left */}
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-icon">PF</div>
            <h2>PathFinder</h2>
          </div>

          <p>
            An AI-powered career guidance engine that connects
            your skills and goals with practical learning paths.
          </p>
        </div>

        {/* Platform */}
        <div className="footer-column">
          <h4>Platform</h4>
          <button type="button" onClick={() => setPage("landing")}>
            Overview
          </button>
          <button type="button" onClick={() => navigateToAssessment()}>
            Skill Assessment
          </button>
        </div>

        {/* Career Tracks */}
        <div className="footer-column">
          <h4>Career Tracks</h4>
          <span>Data Scientist</span>
          <span>AI & ML Engineer</span>
          <span>Cloud Architect</span>
        </div>

        {/* Dataset */}
        <div className="footer-column">
          <h4>Dataset</h4>
          <span>623 Courses</span>
          <span>319 Skills</span>
          <span>115 Providers</span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 PathFinder. All rights reserved.</span>
        <span>Data source: Coursera Course Catalog</span>
      </div>
    </footer>
  );
}
