import React from 'react';
import {
  Lock,
  LogIn,
  ArrowLeft,
  ArrowRight,
  X
} from 'lucide-react';
import { PRESET_SKILLS } from '../constants';
import InfoTooltip from '../components/common/InfoTooltip';

export default function AssessmentPage({
  currentUser,
  assessmentStep,
  setAssessmentStep,
  targetCareer,
  setTargetCareer,
  userQuery,
  setUserQuery,
  currentSkills,
  skillInput,
  setSkillInput,
  handleAddSkill,
  handleRemoveSkill,
  difficulty,
  setDifficulty,
  duration,
  setDuration,
  courseType,
  setCourseType,
  handleRunAdvisor,
  setPage,
  onOpenAuthModal
}) {
  return (
    <div className="assessment-page animate-fade-in">
      {!currentUser ? (
        <div className="panel assessment-login">
          <div className="assessment-lock">
            <Lock size={24} />
          </div>

          <h2>Sign In Required</h2>

          <p>
            Skill Assessment and personalized course recommendations are
            accessible only to registered users. Please sign in or create a
            free account to proceed.
          </p>

          <div className="assessment-login-actions">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="btn btn-primary"
            >
              <LogIn size={15} />
              Sign In / Create Free Account
            </button>

            <button
              type="button"
              onClick={() => setPage('landing')}
              className="btn btn-secondary"
            >
              Return to Overview
            </button>
          </div>
        </div>
      ) : (
        <div className="assessment-container">
          {/* HEADER */}
          <div className="assessment-header">
            <div>
              <h2>Career Assessment & Preferences</h2>
              <p>
                Step {assessmentStep} of 3 — Tell us about your background
                and targets.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPage('landing')}
              className="assessment-cancel"
            >
              <ArrowLeft size={16} />
              Cancel
            </button>
          </div>

          {/* STEP INDICATOR */}
          <div className="assessment-steps">
            <div className={`assessment-step ${assessmentStep >= 1 ? 'active' : ''}`}>
              <span className="assessment-step-number">1</span>
              <span>Target Role</span>
            </div>

            <span className="assessment-step-line" />

            <div className={`assessment-step ${assessmentStep >= 2 ? 'active' : ''}`}>
              <span className="assessment-step-number">2</span>
              <span>Your Skills</span>
            </div>

            <span className="assessment-step-line" />

            <div className={`assessment-step ${assessmentStep >= 3 ? 'active' : ''}`}>
              <span className="assessment-step-number">3</span>
              <span>Preferences</span>
            </div>
          </div>

          {/* STEP 1: TARGET ROLE & GOAL */}
          {assessmentStep === 1 && (
            <div className="assessment-form">
              <div className="assessment-field">
                <label>
                  Target Career Track
                  <InfoTooltip text="Select the target job profile you want to prepare for. Pathfinder maps requirements across 7 core tech disciplines." align="left" />
                </label>
                <select
                  className="assessment-select"
                  value={targetCareer}
                  onChange={(e) => setTargetCareer(e.target.value)}
                >
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                  <option value="Cloud Solutions Architect">Cloud Solutions Architect</option>
                  <option value="Cybersecurity Engineer">Cybersecurity Engineer</option>
                  <option value="Full-Stack Web Developer">Full-Stack Web Developer</option>
                  <option value="Data & Business Analyst">Data & Business Analyst</option>
                  <option value="Product & Strategy Leader">Product & Strategy Leader</option>
                </select>
              </div>

              <div className="assessment-field">
                <label>
                  Additional (Optional)
                  <InfoTooltip text="Optional details to refine recommendations (e.g. sub-skills like MLOps, Next.js, Cloud Security, or career transition goals)." align="left" />
                </label>
                <input
                  type="text"
                  className="assessment-input"
                  placeholder="e.g. I want to transition into MLOps and deep learning algorithms..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                />
              </div>

              <div className="assessment-actions">
                <button
                  type="button"
                  onClick={() => setAssessmentStep(2)}
                  className="btn btn-primary"
                >
                  Next: Add Your Skills
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: YOUR SKILLS */}
          {assessmentStep === 2 && (
            <div className="assessment-form">
              <div className="assessment-field">
                <label>
                  Technical Skills You Currently Have
                  <InfoTooltip text="Enter the technical and professional skills you already possess to evaluate your career match and missing gaps." align="left" />
                </label>

                <div className="selected-skills">
                  {currentSkills.map((skill) => (
                    <span key={skill} className="tag tag-brand">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="tag-remove"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="skill-input-row">
                  <input
                    type="text"
                    className="assessment-input"
                    placeholder="Type a skill name and press Enter..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(skillInput);
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => handleAddSkill(skillInput)}
                    className="btn btn-secondary"
                  >
                    Add
                  </button>
                </div>

                <div className="suggested-skills-label">
                  Suggested dataset skills
                </div>

                <div className="suggested-skills">
                  {PRESET_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddSkill(skill)}
                      className="suggested-skill"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="assessment-actions assessment-actions-between">
                <button
                  type="button"
                  onClick={() => setAssessmentStep(1)}
                  className="btn btn-secondary"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => setAssessmentStep(3)}
                  className="btn btn-primary"
                >
                  Next: Preferences
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PREFERENCES & TUNER */}
          {assessmentStep === 3 && (
            <div className="assessment-form">
              <div className="assessment-preferences">
                <div className="assessment-field">
                  <label>
                    Preferred Difficulty Level
                    <InfoTooltip text="Match your current foundation: Beginner (fundamentals), Intermediate (practical application), or Advanced (deep domain mastery)." align="left" />
                  </label>
                  <select
                    className="assessment-select"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="Any">Any Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="assessment-field">
                  <label>
                    Time Commitment
                    <InfoTooltip text="Select expected course duration: short modules (< 2 hours or 1-4 weeks) or in-depth career tracks (1-3 months or 3-6 months)." align="left" />
                  </label>
                  <select
                    className="assessment-select"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="Any">Any Duration</option>
                    <option value="1 - 4 Weeks">1 - 4 Weeks</option>
                    <option value="1 - 3 Months">1 - 3 Months</option>
                    <option value="3 - 6 Months">3 - 6 Months</option>
                  </select>
                </div>

                <div className="assessment-field">
                  <label>
                    Course Format
                    <InfoTooltip text="Filter by standalone Courses, comprehensive multi-course Specializations, industry-recognized Professional Certificates, or hands-on Guided Projects." align="right" />
                  </label>
                  <select
                    className="assessment-select"
                    value={courseType}
                    onChange={(e) => setCourseType(e.target.value)}
                  >
                    <option value="Any">Any Format</option>
                    <option value="Course">Course</option>
                    <option value="Specialization">Specialization</option>
                    <option value="Professional Certificate">Professional Certificate</option>
                    <option value="Guided Project">Guided Project</option>
                  </select>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="assessment-actions assessment-actions-between">
                <button
                  type="button"
                  onClick={() => setAssessmentStep(2)}
                  className="btn btn-secondary"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleRunAdvisor}
                  className="btn btn-primary"
                >
                  Build My Learning Path
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
