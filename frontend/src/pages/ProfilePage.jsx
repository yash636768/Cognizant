import React from 'react';
import {
  User,
  Target,
  LogOut,
  BarChart2,
  Layers,
  Sliders,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Check
} from 'lucide-react';

export default function ProfilePage({
  currentUser,
  targetCareer,
  results,
  currentSkills,
  difficulty,
  duration,
  courseType,
  userQuery,
  navigateToAssessment,
  handleLogout,
  setPage
}) {
  if (!currentUser) return null;

  return (
    <div className="animate-fade-in">
      <div className="profile-page">
        {/* PROFILE HERO */}
        <section className="profile-hero">
          <div className="profile-identity">
            <div className="profile-avatar-large">
              {currentUser.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div>
              <div className="profile-eyebrow">
                <User size={13} />
                Personal Career Profile
              </div>

              <h1 className="profile-name">
                {currentUser.name || 'Pathfinder User'}
              </h1>

              <p className="profile-email">
                {currentUser.email || 'Registered Pathfinder account'}
              </p>
            </div>
          </div>

          <div className="profile-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigateToAssessment()}
            >
              <Target size={14} />
              Update Assessment
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleLogout}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </section>

        {/* PROFILE OVERVIEW */}
        <div className="profile-grid">
          {/* CAREER GOAL */}
          <section className="profile-card profile-career-card">
            <div className="profile-card-header">
              <div className="profile-card-icon">
                <Target size={17} />
              </div>
              <div>
                <h2>Career Goal</h2>
                <p>Your current target direction</p>
              </div>
            </div>

            <div className="profile-career-value">
              {targetCareer || 'Not selected yet'}
            </div>

            <div className="profile-status">
              <span className="profile-status-dot" />
              {results ? 'Assessment completed' : 'Assessment not completed'}
            </div>
          </section>

          {/* PROFILE STATS */}
          <section className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-icon">
                <BarChart2 size={17} />
              </div>
              <div>
                <h2>Career Snapshot</h2>
                <p>Your current Pathfinder data</p>
              </div>
            </div>

            <div className="profile-mini-stats">
              <div>
                <strong>{currentSkills.length}</strong>
                <span>Skills</span>
              </div>

              <div>
                <strong>
                  {results?.recommendations?.length || 0}
                </strong>
                <span>Courses</span>
              </div>

              <div>
                <strong>
                  {results?.selected_career?.match_percentage
                    ? `${results.selected_career.match_percentage}%`
                    : '—'}
                </strong>
                <span>Career Match</span>
              </div>
            </div>
          </section>
        </div>

        {/* SKILLS + PREFERENCES */}
        <div className="profile-grid profile-grid-two">
          <section className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-icon">
                <Layers size={17} />
              </div>
              <div>
                <h2>Your Skills</h2>
                <p>Skills used for career matching</p>
              </div>
            </div>

            <div className="profile-tags">
              {currentSkills.length > 0 ? (
                currentSkills.map((skill) => (
                  <span className="tag tag-brand" key={skill}>
                    {skill}
                  </span>
                ))
              ) : (
                <span className="profile-empty">
                  No skills added yet.
                </span>
              )}
            </div>
          </section>

          <section className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-icon">
                <Sliders size={17} />
              </div>
              <div>
                <h2>Learning Preferences</h2>
                <p>Your current course preferences</p>
              </div>
            </div>

            <div className="profile-preferences">
              <div>
                <span>Difficulty</span>
                <strong>{difficulty}</strong>
              </div>

              <div>
                <span>Duration</span>
                <strong>{duration}</strong>
              </div>

              <div>
                <span>Course Type</span>
                <strong>{courseType}</strong>
              </div>
            </div>
          </section>
        </div>

        {/* PERSONAL GOAL */}
        <section className="profile-card profile-goal-card">
          <div className="profile-card-header">
            <div className="profile-card-icon">
              <Sparkles size={17} />
            </div>
            <div>
              <h2>Career Goal / Query</h2>
              <p>Your personal learning direction</p>
            </div>
          </div>

          <p className="profile-goal-text">
            {userQuery?.trim()
              ? userQuery
              : 'No specific career goal has been added yet. Update your assessment to add one.'}
          </p>
        </section>

        {/* RECOMMENDED COURSES */}
        <section className="profile-card">
          <div className="profile-section-header">
            <div className="profile-card-header">
              <div className="profile-card-icon">
                <BookOpen size={17} />
              </div>
              <div>
                <h2>My Recommended Courses</h2>
                <p>Courses selected for your current career path</p>
              </div>
            </div>

            {results?.recommendations?.length > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setPage('results')}
              >
                View All
                <ArrowRight size={13} />
              </button>
            )}
          </div>

          {results?.recommendations?.length > 0 ? (
            <div className="profile-course-list">
              {results.recommendations.slice(0, 5).map((rec, index) => (
                <div
                  className="profile-course-item"
                  key={rec.id || rec.course_id || index}
                >
                  <div className="profile-course-number">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="profile-course-info">
                    <h3>
                      {rec.course_name ||
                        rec.title ||
                        rec.name ||
                        'Recommended Course'}
                    </h3>

                    <p>
                      {rec.organization ||
                        rec.provider ||
                        'Recommended for your career path'}
                    </p>
                  </div>

                  <div className="profile-course-score">
                    {rec.match_score != null
                      ? `${Math.round(rec.match_score)}%`
                      : rec.match_percentage != null
                        ? `${Math.round(rec.match_percentage)}%`
                        : 'Recommended'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="profile-empty-state">
              <BookOpen size={22} />
              <h3>No recommendations yet</h3>
              <p>
                Complete the skill assessment to generate your
                personalized course roadmap.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigateToAssessment()}
              >
                Start Assessment
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </section>

        {/* MATCHED + MISSING SKILLS */}
        {results?.selected_career && (
          <div className="profile-grid profile-grid-two">
            <section className="profile-card">
              <div className="profile-card-header">
                <div className="profile-card-icon profile-icon-success">
                  <CheckCircle size={17} />
                </div>
                <div>
                  <h2>Matched Skills</h2>
                  <p>Skills aligned with your target role</p>
                </div>
              </div>

              <div className="profile-tags">
                {results.selected_career.matched_core_skills?.length > 0 ? (
                  results.selected_career.matched_core_skills.map((skill) => (
                    <span className="tag tag-success" key={skill}>
                      <Check size={12} />
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="profile-empty">
                    No matched skills available.
                  </span>
                )}
              </div>
            </section>

            <section className="profile-card">
              <div className="profile-card-header">
                <div className="profile-card-icon profile-icon-warning">
                  <AlertCircle size={17} />
                </div>
                <div>
                  <h2>Skills to Improve</h2>
                  <p>Recommended areas for your next step</p>
                </div>
              </div>

              <div className="profile-tags">
                {results.selected_career.missing_core_skills?.length > 0 ? (
                  results.selected_career.missing_core_skills.map((skill) => (
                    <span className="tag tag-warning" key={skill}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="profile-empty">
                    No skill gaps identified.
                  </span>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
