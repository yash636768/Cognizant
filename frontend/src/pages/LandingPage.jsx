import React from 'react';
import {
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { CAREER_TRACKS } from '../constants';

export default function LandingPage({
  stats,
  navigateToAssessment,
  setPage,
  handleSelectCareerFromLanding
}) {
  return (
    <div className="landing-page animate-fade-in">
      {/* INTRO — OUTSIDE THE GLASS BOX */}
      <div className="landing-intro">
        <h1>
          Your career shouldn't be a guess.
        </h1>

        <p>
          Pathfinder understands your skills, interests, and target roles to
          help you discover the right career path and pinpoint exactly what to
          learn next — grounded directly in <strong>623 Coursera offerings</strong>.
        </p>
      </div>

      {/* MAIN GLASS BOX */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-actions">
            <button
              type="button"
              onClick={() => navigateToAssessment()}
              className="landing-primary-btn"
            >
              Discover My Career
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.querySelector('.career-paths-panel');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="landing-secondary-btn"
            >
              Explore Career Tracks
            </button>
          </div>

          <div className="landing-dataset-note">
            <CheckCircle size={14} />
            Built using the provided Coursera Courses &amp; Skills dataset (623 courses, 115 educational providers).
          </div>
        </div>

        <div className="landing-pipeline">
          <div className="landing-step">
            <div className="landing-step-num">STEP 01</div>
            <h3>Student Profile</h3>
            <p>Input your technical background normalized against our 319-skill taxonomy.</p>
          </div>
          <div className="landing-step">
            <div className="landing-step-num">STEP 02</div>
            <h3>Career Direction</h3>
            <p>Calculates match percentage across 7 target profiles to identify top role alignment.</p>
          </div>
          <div className="landing-step">
            <div className="landing-step-num">STEP 03</div>
            <h3>Skill Gap Analysis</h3>
            <p>Pinpoints exact missing core and supporting competencies needed for promotion.</p>
          </div>
          <div className="landing-step">
            <div className="landing-step-num">STEP 04</div>
            <h3>Learning Path</h3>
            <p>SentenceTransformer vector search ranks courses with transparent RAG explanations.</p>
          </div>
        </div>

        <div className="landing-metrics">
          <div className="landing-metric">
            <div>
              <div className="landing-metric-label">Courses Analyzed</div>
              <div className="landing-metric-value">{stats ? stats.total_courses : 623}</div>
              <div className="landing-metric-sub">Ground-Truth Coursera Dataset</div>
            </div>
          </div>
          <div className="landing-metric">
            <div>
              <div className="landing-metric-label">Skills Extracted</div>
              <div className="landing-metric-value">{stats ? stats.total_skills_identified : 319}</div>
              <div className="landing-metric-sub">Canonical Skill Taxonomy</div>
            </div>
          </div>
          <div className="landing-metric">
            <div>
              <div className="landing-metric-label">Educational Institutions</div>
              <div className="landing-metric-value">{stats ? stats.total_organizations : 115}</div>
              <div className="landing-metric-sub">IBM, Google, UPenn &amp; More</div>
            </div>
          </div>
          <div className="landing-metric">
            <div>
              <div className="landing-metric-label">Dataset Mean Rating</div>
              <div className="landing-metric-value">4.64 / 5.0</div>
              <div className="landing-metric-sub">Verified Student Reviews</div>
            </div>
          </div>
        </div>
      </section>

      <section className="career-paths-panel">
        <div className="career-paths-heading">
          <h2>Explore Target Career Paths</h2>
          <p>Select a role below to assess your current readiness and discover your custom course roadmap.</p>
        </div>

        <div className="career-path-grid">
          {CAREER_TRACKS.map((track) => {
            const IconComp = track.icon;
            return (
              <div
                key={track.id}
                className="career-path-card"
                onClick={() => handleSelectCareerFromLanding(track.title)}
              >
                <div className="career-path-icon">
                  <IconComp size={34} strokeWidth={2.1} />
                </div>

                <div className="career-path-content">
                  <span className="career-course-count">{track.count}</span>
                  <h3>{track.title}</h3>
                  <p>{track.desc}</p>
                  <div className="career-path-link">
                    Assess Skill Readiness <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
