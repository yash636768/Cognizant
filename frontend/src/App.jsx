import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Target, 
  BookOpen, 
  Award, 
  BarChart2, 
  Sliders, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Database,
  Search,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  TrendingUp,
  Shield,
  Cpu,
  Globe,
  Code,
  Check,
  Info,
  User,
  LogIn,
  LogOut,
  Lock,
  Mail,
  Zap,
  Filter
} from 'lucide-react';

const API_BASE = "/api";

const PRESET_SKILLS = [
  "Python Programming",
  "Databases & SQL",
  "Data Analysis",
  "Machine Learning",
  "Probability & Statistics",
  "Cloud Computing",
  "Linux & Systems",
  "Cybersecurity & Network Security",
  "Software Engineering & Programming",
  "Web Development",
  "JavaScript",
  "Data Visualization",
  "Leadership & Management"
];

const CAREER_TRACKS = [
  { id: "Data Scientist", title: "Data Scientist", icon: TrendingUp, count: "340 Courses", desc: "Extract actionable insights using statistics, ML algorithms, and data pipelines." },
  { id: "AI / Machine Learning Engineer", title: "AI & ML Engineer", icon: Cpu, count: "280 Courses", desc: "Design neural networks, deep learning architectures, and scalable AI systems." },
  { id: "Cloud Solutions Architect", title: "Cloud Architect", icon: Globe, count: "290 Courses", desc: "Architect and manage cloud infrastructure across AWS, GCP, and Microsoft Azure." },
  { id: "Cybersecurity Engineer", title: "Cybersecurity Engineer", icon: Shield, count: "160 Courses", desc: "Protect systems, cloud networks, and data infrastructure from vulnerabilities." },
  { id: "Full-Stack Web Developer", title: "Full-Stack Developer", icon: Code, count: "210 Courses", desc: "Build modern web applications, user interfaces, and server API backends." },
  { id: "Data & Business Analyst", title: "Data & Business Analyst", icon: Briefcase, count: "310 Courses", desc: "Translate complex datasets into executive dashboards and business strategy." }
];

export default function App() {
  const [page, setPage] = useState('landing'); // 'landing' | 'input' | 'results' | 'evaluation' | 'profile'
  const [stats, setStats] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pathfinder_token') || '');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Assessment Form Progressive Step (1, 2, 3)
  const [assessmentStep, setAssessmentStep] = useState(1);

  // User Inputs
  const [currentSkills, setCurrentSkills] = useState(["Python Programming", "Databases & SQL"]);
  const [skillInput, setSkillInput] = useState("");
  const [targetCareer, setTargetCareer] = useState("Data Scientist");
  const [userQuery, setUserQuery] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("Any");
  const [courseType, setCourseType] = useState("Any");
  
  // Scoring Weights Priorities
  const [showTuner, setShowTuner] = useState(false);
  const [weights, setWeights] = useState({
    semantic_skill_match: 0.40,
    career_skill_gap_relevance: 0.20,
    rating: 0.10,
    difficulty_fit: 0.10,
    duration_fit: 0.08,
    enrollment_popularity: 0.05,
    review_confidence: 0.04,
    type_preference: 0.03
  });
  
  // Execution State
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [expandedAnalysis, setExpandedAnalysis] = useState({});

  useEffect(() => {
    fetchStats();
    fetchEvaluation();
    if (token) {
      fetchCurrentUser(token);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/dataset-stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Stats API error:", e);
    }
  };

  const fetchEvaluation = async () => {
    try {
      const res = await fetch(`${API_BASE}/evaluation`);
      if (res.ok) {
        const data = await res.json();
        setEvaluation(data);
      }
    } catch (e) {
      console.error("Evaluation API error:", e);
    }
  };

  const fetchCurrentUser = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        localStorage.removeItem('pathfinder_token');
        setToken('');
        setCurrentUser(null);
      }
    } catch (e) {
      console.error("Auth verify error:", e);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const endpoint = authTab === 'login' ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
    const payload = authTab === 'login' 
      ? { email: authForm.email, password: authForm.password }
      : { name: authForm.name, email: authForm.email, password: authForm.password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      localStorage.setItem('pathfinder_token', data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      setAuthModalOpen(false);
      setAuthForm({ name: '', email: '', password: '' });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pathfinder_token');
    setToken('');
    setCurrentUser(null);
  };

  const handleAddSkill = (skillName) => {
    const s = skillName.trim();
    if (s && !currentSkills.includes(s)) {
      setCurrentSkills([...currentSkills, s]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillName) => {
    setCurrentSkills(currentSkills.filter(s => s !== skillName));
  };

  const navigateToAssessment = (targetRole = null) => {
    if (targetRole) {
      setTargetCareer(targetRole);
    }
    if (!currentUser) {
      setAuthError('Please sign in or create a free account to access Skill Assessment.');
      setAuthModalOpen(true);
    } else {
      setAssessmentStep(1);
      setPage('input');
    }
  };

  const handleSelectCareerFromLanding = (careerTitle) => {
    navigateToAssessment(careerTitle);
  };

  const handleRunAdvisor = async () => {
    setLoading(true);
    setPage('results');
    try {
      const res = await fetch(`${API_BASE}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_skills: currentSkills,
          target_career: targetCareer,
          user_query: userQuery,
          preferred_difficulty: difficulty,
          preferred_duration: duration,
          preferred_type: courseType,
          custom_weights: weights,
          top_k: 10
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (e) {
      console.error("Recommend error:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleAnalysis = (id) => {
    setExpandedAnalysis(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      {/* =========================
          PREMIUM NAVBAR
          ========================= */}
      <header className="navbar">
        <div className="container nav-content">
          <button
            type="button"
            className="brand-logo"
            onClick={() => setPage('landing')}
            aria-label="Go to CareerPilot AI overview"
          >
            <span className="brand-icon">CP</span>
            <span className="brand-name">CareerPilot AI</span>
            <span className="brand-tag">AI Career Advisor</span>
          </button>

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

            {results && (
              <button
                type="button"
                onClick={() => setPage('results')}
                className={`nav-link ${page === 'results' ? 'active' : ''}`}
              >
                <BookOpen size={14} />
                Learning Paths
              </button>
            )}

            <button
              type="button"
              onClick={() => setPage('evaluation')}
              className={`nav-link ${page === 'evaluation' ? 'active' : ''}`}
            >
              <BarChart2 size={14} />
              Performance
            </button>
          </nav>

          <div className="navbar-actions">
            {currentUser ? (
              <div className="profile-nav-area">
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
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthError('');
                  setAuthModalOpen(true);
                }}
                className="btn btn-primary btn-sm"
              >
                <LogIn size={14} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container section">
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* PAGE: USER PROFILE */}
        {/* ========================================================================= */}
        {page === 'profile' && currentUser && (
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
                      {currentUser.name || 'CareerPilot User'}
                    </h1>

                    <p className="profile-email">
                      {currentUser.email || 'Registered CareerPilot account'}
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
                      <p>Your current CareerPilot data</p>
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
                        <span
                          className="tag tag-brand"
                          key={skill}
                        >
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
                      <p>
                        Courses selected for your current career path
                      </p>
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
                          <span
                            className="tag tag-success"
                            key={skill}
                          >
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
                          <span
                            className="tag tag-warning"
                            key={skill}
                          >
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
        )}

        {/* PAGE 1: OVERVIEW / LANDING */}
        {/* ========================================================================= */}
        {page === 'landing' && (
          <div className="animate-fade-in">
            {/* HERO SECTION */}
            <section
              className="hero-section panel"
              style={{
                padding: '52px 42px',
                marginBottom: '42px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: '320px',
                  height: '320px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.08)',
                  filter: 'blur(10px)',
                  top: '-150px',
                  right: '-80px',
                  pointerEvents: 'none',
                }}
              />

              <div style={{ maxWidth: '820px', position: 'relative' }}>
                <span
                  className="tag tag-brand"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '18px',
                  }}
                >
                  <Sparkles size={13} />
                  AI-Powered Career Guidance
                </span>

                <h1
                  style={{
                    fontSize: 'clamp(36px, 5vw, 58px)',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    marginBottom: '18px',
                    lineHeight: 1.08,
                    maxWidth: '760px',
                  }}
                >
                  Your career shouldn't be a{' '}
                  <span
                    style={{
                      background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    guess.
                  </span>
                </h1>

                <p
                  style={{
                    fontSize: '15px',
                    color: 'var(--text-muted)',
                    marginBottom: '28px',
                    lineHeight: 1.7,
                    maxWidth: '720px',
                  }}
                >
                  CareerPilot AI understands your skills, interests, and target roles to help you discover the right career path and pinpoint exactly what to learn next — grounded directly in <strong>623 Coursera offerings</strong>.
                </p>

                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => navigateToAssessment()}
                    className="btn btn-primary"
                  >
                    <Sparkles size={15} />
                    Discover My Career
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPage('evaluation')}
                    className="btn btn-secondary"
                  >
                    <BarChart2 size={15} />
                    See How It Works
                  </button>
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-subtle)',
                    marginTop: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                  }}
                >
                  <CheckCircle size={13} color="var(--status-success-text)" />
                  Built using the provided Coursera Courses & Skills dataset (623 courses, 115 educational providers).
                </div>
              </div>

              {/* PIPELINE */}
              <div className="pipeline-stepper">
                <div className="stepper-card">
                  <div className="stepper-num" style={{ color: 'var(--color-brand)' }}>STEP 01</div>
                  <div className="stepper-title">Student Profile</div>
                  <div className="stepper-desc">Input your technical background normalized against our 319-skill taxonomy.</div>
                </div>
                <div className="stepper-card">
                  <div className="stepper-num" style={{ color: 'var(--status-success-text)' }}>STEP 02</div>
                  <div className="stepper-title">Career Direction</div>
                  <div className="stepper-desc">Calculates match percentage across 7 target profiles to identify top role alignment.</div>
                </div>
                <div className="stepper-card">
                  <div className="stepper-num" style={{ color: 'var(--status-warning-text)' }}>STEP 03</div>
                  <div className="stepper-title">Skill Gap Analysis</div>
                  <div className="stepper-desc">Pinpoints exact missing core and supporting competencies needed for promotion.</div>
                </div>
                <div className="stepper-card">
                  <div className="stepper-num" style={{ color: '#7c3aed' }}>STEP 04</div>
                  <div className="stepper-title">Learning Path</div>
                  <div className="stepper-desc">SentenceTransformer vector search ranks courses with transparent RAG explanations.</div>
                </div>
              </div>

              {/* DATASET METRICS */}
              <div
                className="metrics-row"
                style={{
                  marginTop: '32px',
                  marginBottom: 0,
                  paddingTop: '26px',
                  borderTop: '1px solid var(--border-default)',
                }}
              >
                <div className="metric-card">
                  <div className="metric-label">Courses Analyzed</div>
                  <div className="metric-value">{stats ? stats.total_courses : 623}</div>
                  <div className="metric-sub">Ground-Truth Coursera Dataset</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Skills Extracted</div>
                  <div className="metric-value">{stats ? stats.total_skills_identified : 319}</div>
                  <div className="metric-sub">Canonical Skill Taxonomy</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Educational Institutions</div>
                  <div className="metric-value">{stats ? stats.total_organizations : 115}</div>
                  <div className="metric-sub">IBM, Google, UPenn & More</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Dataset Mean Rating</div>
                  <div className="metric-value">4.64 / 5.0</div>
                  <div className="metric-sub">Verified Student Reviews</div>
                </div>
              </div>
            </section>

            {/* FEATURED CAREER TRACKS */}
            <section style={{ marginBottom: '32px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 750, marginBottom: '7px' }}>
                  Explore Target Career Paths
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Select a role below to assess your current readiness and discover your custom course roadmap.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '18px',
                }}
              >
                {CAREER_TRACKS.map((track) => {
                  const IconComp = track.icon;
                  return (
                    <div
                      key={track.id}
                      className="panel"
                      style={{
                        cursor: 'pointer',
                        padding: '22px',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => handleSelectCareerFromLanding(track.title)}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '16px',
                        }}
                      >
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--bg-surface-raised)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-default)',
                          }}
                        >
                          <IconComp size={19} color="var(--color-brand)" />
                        </div>
                        <span className="tag tag-brand">{track.count}</span>
                      </div>

                      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '7px' }}>
                        {track.title}
                      </h3>
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--text-muted)',
                          marginBottom: '18px',
                          lineHeight: 1.6,
                        }}
                      >
                        {track.desc}
                      </p>

                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: 'var(--color-brand)',
                          fontWeight: 600,
                          fontSize: '12px',
                        }}
                      >
                        Assess Skill Readiness
                        <ArrowRight size={13} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
        {/* ========================================================================= */}
        {/* PAGE 2: PROGRESSIVE SKILL ASSESSMENT FORM (AUTH PROTECTED) */}
        {/* ========================================================================= */}
        {page === 'input' && (
          <div style={{ maxWidth: '720px', margin: '0 auto' }} className="animate-fade-in">
            {!currentUser ? (
              <div className="panel" style={{ padding: '48px 32px', textAlign: 'center' }}>
                <div style={{ width: '52px', height: '52px', background: 'var(--color-brand-light)', color: 'var(--color-brand)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                  <Lock size={26} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Sign In Required</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                  Skill Assessment and personalized course recommendations are accessible only to registered users. Please sign in or create a free account to proceed.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => { setAuthError(''); setAuthModalOpen(true); }} className="btn btn-primary">
                    <LogIn size={15} /> Sign In / Create Free Account
                  </button>
                  <button onClick={() => setPage('landing')} className="btn btn-secondary">
                    Return to Overview
                  </button>
                </div>
              </div>
            ) : (
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">Career Assessment & Preferences</h2>
                    <p className="panel-subtitle">Step {assessmentStep} of 3 — Tell us about your background and targets.</p>
                  </div>
                  <button onClick={() => setPage('landing')} className="btn btn-ghost btn-sm">
                    <ArrowLeft size={14} /> Cancel
                  </button>
                </div>

                {/* STEP TRACKER BADGE */}
                <div className="step-tracker">
                  <div className={`step-dot ${assessmentStep >= 1 ? 'active' : ''}`}>1</div>
                  <span style={{ fontSize: '12px', fontWeight: assessmentStep === 1 ? 600 : 400, color: assessmentStep === 1 ? 'var(--text-heading)' : 'var(--text-muted)' }}>Target Role</span>
                  <span style={{ color: 'var(--border-default)' }}>•</span>
                  <div className={`step-dot ${assessmentStep >= 2 ? 'active' : ''}`}>2</div>
                  <span style={{ fontSize: '12px', fontWeight: assessmentStep === 2 ? 600 : 400, color: assessmentStep === 2 ? 'var(--text-heading)' : 'var(--text-muted)' }}>Your Skills</span>
                  <span style={{ color: 'var(--border-default)' }}>•</span>
                  <div className={`step-dot ${assessmentStep >= 3 ? 'active' : ''}`}>3</div>
                  <span style={{ fontSize: '12px', fontWeight: assessmentStep === 3 ? 600 : 400, color: assessmentStep === 3 ? 'var(--text-heading)' : 'var(--text-muted)' }}>Preferences</span>
                </div>

                {/* STEP 1: TARGET ROLE & SPECIFIC FOCUS */}
                {assessmentStep === 1 && (
                  <div>
                    <div className="form-group">
                      <label className="form-label">Target Career Track</label>
                      <select className="select" value={targetCareer} onChange={e => setTargetCareer(e.target.value)}>
                        <option value="Data Scientist">Data Scientist</option>
                        <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                        <option value="Cloud Solutions Architect">Cloud Solutions Architect</option>
                        <option value="Cybersecurity Engineer">Cybersecurity Engineer</option>
                        <option value="Full-Stack Web Developer">Full-Stack Web Developer</option>
                        <option value="Data & Business Analyst">Data & Business Analyst</option>
                        <option value="Product & Strategy Leader">Product & Strategy Leader</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Specific Goal or Query (Optional)</label>
                      <input 
                        type="text" 
                        className="input" 
                        placeholder="e.g. I want to transition into MLOps and deep learning algorithms..."
                        value={userQuery}
                        onChange={e => setUserQuery(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
                      <button onClick={() => setAssessmentStep(2)} className="btn btn-primary">
                        Next: Add Your Skills <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: TECHNICAL SKILLS */}
                {assessmentStep === 2 && (
                  <div>
                    <div className="form-group">
                      <label className="form-label">Technical Skills You Currently Have</label>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        {currentSkills.map(s => (
                          <span key={s} className="tag tag-brand">
                            {s}
                            <button onClick={() => handleRemoveSkill(s)} className="tag-remove"><X size={12} /></button>
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <input 
                          type="text" 
                          className="input" 
                          placeholder="Type a skill name and press Enter..." 
                          value={skillInput}
                          onChange={e => setSkillInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddSkill(skillInput)}
                        />
                        <button onClick={() => handleAddSkill(skillInput)} className="btn btn-secondary">
                          Add
                        </button>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginBottom: '8px' }}>Suggested dataset skills:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {PRESET_SKILLS.map(s => (
                          <button 
                            key={s} 
                            onClick={() => handleAddSkill(s)}
                            style={{ 
                              background: 'transparent', 
                              border: '1px solid var(--border-default)', 
                              color: 'var(--text-muted)', 
                              padding: '3px 10px', 
                              borderRadius: '12px', 
                              fontSize: '11px', 
                              cursor: 'pointer' 
                            }}
                          >
                            + {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                      <button onClick={() => setAssessmentStep(1)} className="btn btn-secondary">
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button onClick={() => setAssessmentStep(3)} className="btn btn-primary">
                        Next: Preferences & Weights <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: PREFERENCES & SCORING PRIORITY */}
                {assessmentStep === 3 && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-group">
                      <div>
                        <label className="form-label">Preferred Difficulty Level</label>
                        <select className="select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                          <option value="Any">Any Level</option>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Time Commitment</label>
                        <select className="select" value={duration} onChange={e => setDuration(e.target.value)}>
                          <option value="Any">Any Duration</option>
                          <option value="1 - 4 Weeks">1 - 4 Weeks</option>
                          <option value="1 - 3 Months">1 - 3 Months</option>
                          <option value="3 - 6 Months">3 - 6 Months</option>
                        </select>
                      </div>
                    </div>

                    {/* Weight Priority Customization */}
                    <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '16px', marginBottom: '24px' }}>
                      <button 
                        onClick={() => setShowTuner(!showTuner)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-brand)' }}
                      >
                        <Sliders size={13} /> {showTuner ? "Hide Weight Priorities" : "Customize Scoring Priority Weights"}
                      </button>

                      {showTuner && (
                        <div style={{ marginTop: '12px', background: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', fontSize: '12px' }}>
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span>Semantic Vector Similarity</span>
                              <strong>{Math.round(weights.semantic_skill_match * 100)}%</strong>
                            </div>
                            <input 
                              type="range" min="0" max="0.8" step="0.05" 
                              value={weights.semantic_skill_match}
                              onChange={e => setWeights({...weights, semantic_skill_match: parseFloat(e.target.value)})}
                              style={{ width: '100%' }}
                            />
                          </div>
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span>Skill Gap Resolution Weight</span>
                              <strong>{Math.round(weights.career_skill_gap_relevance * 100)}%</strong>
                            </div>
                            <input 
                              type="range" min="0" max="0.5" step="0.05" 
                              value={weights.career_skill_gap_relevance}
                              onChange={e => setWeights({...weights, career_skill_gap_relevance: parseFloat(e.target.value)})}
                              style={{ width: '100%' }}
                            />
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span>Rating Quality Weight</span>
                              <strong>{Math.round(weights.rating * 100)}%</strong>
                            </div>
                            <input 
                              type="range" min="0" max="0.3" step="0.02" 
                              value={weights.rating}
                              onChange={e => setWeights({...weights, rating: parseFloat(e.target.value)})}
                              style={{ width: '100%' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <button onClick={() => setAssessmentStep(2)} className="btn btn-secondary">
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button onClick={handleRunAdvisor} className="btn btn-primary">
                        Build My Learning Path <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 3: CAREER MATCH & COURSE RECOMMENDATIONS */}
        {/* ========================================================================= */}
        {page === 'results' && (
          <div className="animate-fade-in">
            {/* CAREER READINESS PANEL */}
            {results && results.selected_career && (
              <div className="panel" style={{ marginBottom: '24px' }}>
                <div className="panel-header">
                  <div>
                    <span className="tag tag-brand" style={{ marginBottom: '6px' }}>Your Target Path</span>
                    <h2 className="panel-title" style={{ fontSize: '20px' }}>{results.selected_career.title}</h2>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-brand)' }}>
                      {results.selected_career.match_percentage}%
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Match Score</div>
                  </div>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.6 }}>
                  {results.selected_career.description}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg-app)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--status-success-text)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={15} /> Skills You Possess ({results.selected_career.matched_core_skills.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {results.selected_career.matched_core_skills.length > 0 ? (
                        results.selected_career.matched_core_skills.map(s => (
                          <span key={s} className="tag tag-success">{s}</span>
                        ))
                      ) : <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>None matched yet</span>}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--status-warning-text)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={15} /> What You Need Next ({results.selected_career.missing_core_skills.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {results.selected_career.missing_core_skills.map(s => (
                        <span key={s} className="tag tag-warning">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RECOMMENDED COURSES CATALOG */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-heading)' }}>
                  Courses Picked for Your Next Step ({results ? results.recommendations.length : 0})
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Grounded on <strong style={{ color: 'var(--text-heading)' }}>coursera_course_dataset_v3.csv</strong>
                </div>
              </div>

              {loading ? (
                <div className="panel" style={{ padding: '52px', textAlign: 'center' }}>
                  <Sparkles className="animate-spin" size={30} color="var(--color-brand)" style={{ margin: '0 auto 14px' }} />
                  <div style={{ color: 'var(--text-muted)' }}>Calculating vector matches & RAG explanations...</div>
                </div>
              ) : results && results.recommendations ? (
                <div>
                  {results.recommendations.map((rec) => (
                    <div key={rec.course_id} className="course-card">
                      <div className="course-header">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span className="tag" style={{ fontSize: '11px' }}>Row #{rec.course_id + 1}</span>
                            <span className="tag tag-brand">{rec.organization}</span>
                            <span className="tag tag-success">{rec.type}</span>
                          </div>
                          <h4 className="course-title">{rec.title}</h4>
                        </div>

                        <div className="match-score-badge">
                          {Math.round(rec.final_score * 100)}%
                        </div>
                      </div>

                      <div className="course-meta">
                        <div>⭐ <strong style={{ color: 'var(--text-heading)' }}>{rec.rating}</strong> / 5.0 ({rec.review_count.toLocaleString()} reviews)</div>
                        <div>Level: <strong style={{ color: 'var(--text-heading)' }}>{rec.difficulty}</strong></div>
                        <div>Duration: <strong style={{ color: 'var(--text-heading)' }}>{rec.duration}</strong></div>
                        <div>Enrolled: <strong style={{ color: 'var(--text-heading)' }}>{rec.enrolled_count.toLocaleString()}</strong></div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginBottom: '6px' }}>Skills Covered:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {rec.skills.split(',').map(s => {
                            const trimmed = s.trim();
                            const isGap = rec.matched_gap_skills.includes(trimmed);
                            return (
                              <span key={trimmed} className={isGap ? "tag tag-warning" : "tag tag-brand"} style={{ fontSize: '11px' }}>
                                {isGap ? `🎯 ${trimmed}` : trimmed}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-default)' }}>
                        <button 
                          onClick={() => toggleAnalysis(rec.course_id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--color-brand)' }}
                        >
                          <Info size={14} /> {expandedAnalysis[rec.course_id] ? "Hide Details" : "Why this course was selected"}
                        </button>

                        <a 
                          href={rec.course_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          View on Coursera <ExternalLink size={13} />
                        </a>
                      </div>

                      {expandedAnalysis[rec.course_id] && (
                        <div style={{ marginTop: '14px', background: 'var(--bg-app)', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', fontSize: '13px', color: 'var(--text-body)' }}>
                          <strong style={{ color: 'var(--color-brand)' }}>Recommendation Explanation:</strong>
                          <p style={{ marginTop: '6px', lineHeight: 1.6 }}>{rec.rag_explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 4: SYSTEM PERFORMANCE DASHBOARD */}
        {/* ========================================================================= */}
        {page === 'evaluation' && evaluation && (
          <div className="animate-fade-in">
            <div className="panel" style={{ marginBottom: '24px' }}>
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">System Performance & Quantitative Metrics</h2>
                  <p className="panel-subtitle">Evaluation benchmarks across 5 benchmark student profiles against the full Coursera dataset.</p>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="metrics-row">
                <div className="metric-card">
                  <div className="metric-label">Mean Precision@5</div>
                  <div className="metric-value">{evaluation.summary_metrics.mean_precision_at_5}</div>
                  <div className="metric-sub">Top-5 Recommendation Relevance</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Mean NDCG@5</div>
                  <div className="metric-value" style={{ color: 'var(--status-success-text)' }}>{evaluation.summary_metrics.mean_ndcg_at_5}</div>
                  <div className="metric-sub">Normalized Discounted Gain</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Skill-Gap Coverage</div>
                  <div className="metric-value" style={{ color: 'var(--status-warning-text)' }}>{evaluation.summary_metrics.mean_skill_gap_coverage_pct}%</div>
                  <div className="metric-sub">Target Skill Gap Resolution</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Provider Diversity</div>
                  <div className="metric-value">{evaluation.summary_metrics.mean_organization_diversity}</div>
                  <div className="metric-sub">Institution Catalog Entropy</div>
                </div>
              </div>

              {/* Detailed Performance Table */}
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>Benchmark Profile Results</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Profile Name</th>
                      <th>Target Career</th>
                      <th>Precision@5</th>
                      <th>NDCG@5</th>
                      <th>Skill Coverage</th>
                      <th>Top Recommended Courses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluation.profiles.map(p => (
                      <tr key={p.profile_id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{p.profile_name}</td>
                        <td style={{ color: 'var(--color-brand)' }}>{p.target_career}</td>
                        <td style={{ fontWeight: 600 }}>{p.precision_at_5}</td>
                        <td style={{ fontWeight: 600, color: 'var(--status-success-text)' }}>{p.ndcg_at_5}</td>
                        <td style={{ color: 'var(--status-warning-text)' }}>{p.skill_gap_coverage_pct}%</td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {p.top_3_recommendations.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* AUTH MODAL */}
      {authModalOpen && (
        <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setAuthModalOpen(false)} 
              style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div style={{ width: '42px', height: '42px', background: 'var(--color-brand-light)', color: 'var(--color-brand)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '1px solid var(--color-brand-border)' }}>
                <User size={22} />
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: 700 }}>
                {authTab === 'login' ? "Welcome Back to CareerPilot AI" : "Create Your Free Account"}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {authTab === 'login' ? "Sign in to access Skill Assessment and save your target career paths." : "Get custom learning paths grounded in 623 Coursera offerings."}
              </p>
            </div>

            <div className="auth-tabs">
              <button 
                className={`auth-tab ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthTab('login'); setAuthError(''); }}
              >
                Sign In
              </button>
              <button 
                className={`auth-tab ${authTab === 'register' ? 'active' : ''}`}
                onClick={() => { setAuthTab('register'); setAuthError(''); }}
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

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={authLoading}>
                {authLoading ? "Processing..." : (authTab === 'login' ? "Sign In" : "Create Account")}
              </button>
            </form>

            <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '13px', color: 'var(--text-subtle)' }}>
              {authTab === 'login' ? (
                <span>Don't have an account? <button onClick={() => { setAuthTab('register'); setAuthError(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-brand)', cursor: 'pointer', fontWeight: 500 }}>Sign up free</button></span>
              ) : (
                <span>Already have an account? <button onClick={() => { setAuthTab('login'); setAuthError(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-brand)', cursor: 'pointer', fontWeight: 500 }}>Sign in</button></span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid var(--border-default)',
          marginTop: '56px',
          padding: '42px 0 24px',
          background: 'var(--bg-surface)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(240px, 1.6fr) repeat(3, minmax(120px, 1fr))',
              gap: '32px',
              paddingBottom: '30px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span className="brand-icon">CP</span>
                <strong style={{ fontSize: '16px', color: 'var(--text-heading)' }}>CareerPilot AI</strong>
              </div>
              <p style={{ maxWidth: '360px', fontSize: '12px', lineHeight: 1.7, color: 'var(--text-muted)', margin: 0 }}>
                An AI-powered career guidance engine that connects your skills and goals with practical learning paths.
              </p>
            </div>

            <div>
              <strong style={{ fontSize: '12px', color: 'var(--text-heading)' }}>Platform</strong>
              <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
                <button type="button" style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }} onClick={() => setPage('landing')}>Overview</button>
                <button type="button" style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }} onClick={() => navigateToAssessment()}>Skill Assessment</button>
                <button type="button" className="footer-link" onClick={() => setPage('evaluation')}>Performance</button>
              </div>
            </div>

            <div>
              <strong style={{ fontSize: '12px', color: 'var(--text-heading)' }}>Career Tracks</strong>
              <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
                {CAREER_TRACKS.slice(0, 3).map((track) => (
                  <button
                    type="button"
                    key={track.id}
                    style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}
                    onClick={() => handleSelectCareerFromLanding(track.title)}
                  >
                    {track.title}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <strong style={{ fontSize: '12px', color: 'var(--text-heading)' }}>Dataset</strong>
              <div style={{ display: 'grid', gap: '8px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>623 Courses</span>
                <span>319 Skills</span>
                <span>115 Providers</span>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--border-default)',
              paddingTop: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              color: 'var(--text-subtle)',
              fontSize: '11px',
            }}
          >
            <span>© {new Date().getFullYear()} CareerPilot AI. All rights reserved.</span>
            <span>Grounded on <code>coursera_course_dataset_v3.csv</code></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
