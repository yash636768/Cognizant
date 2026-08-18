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
  Info
} from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

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
  { id: "Data Scientist", title: "Data Scientist", icon: TrendingUp, count: "340 Courses", desc: "Extract insights using statistics, ML algorithms, and Python data pipelines." },
  { id: "AI / Machine Learning Engineer", title: "AI & ML Engineer", icon: Cpu, count: "280 Courses", desc: "Design neural networks, deep learning architectures, and production ML models." },
  { id: "Cloud Solutions Architect", title: "Cloud Architect", icon: Globe, count: "290 Courses", desc: "Architect and manage cloud infrastructure across AWS, GCP, and Azure." },
  { id: "Cybersecurity Engineer", title: "Cybersecurity Engineer", icon: Shield, count: "160 Courses", desc: "Protect systems, networks, and data infrastructure from security vulnerabilities." },
  { id: "Full-Stack Web Developer", title: "Full-Stack Developer", icon: Code, count: "210 Courses", desc: "Build modern web applications, user interfaces, and backend server APIs." },
  { id: "Data & Business Analyst", title: "Data & Business Analyst", icon: Briefcase, count: "310 Courses", desc: "Translate complex datasets into executive dashboards and business strategy." }
];

export default function App() {
  const [page, setPage] = useState('landing'); // 'landing' | 'input' | 'results' | 'evaluation'
  const [stats, setStats] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  
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

  const handleSelectCareerFromLanding = (careerTitle) => {
    setTargetCareer(careerTitle);
    setPage('input');
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
      {/* NAVBAR */}
      <header className="navbar">
        <div className="container nav-content">
          <div className="brand-logo" onClick={() => setPage('landing')}>
            <div className="brand-icon">P</div>
            <span className="brand-name">PathFinder</span>
            <span className="brand-tag">Dataset Grounded</span>
          </div>

          <nav className="nav-menu">
            <button 
              onClick={() => setPage('landing')} 
              className={`nav-link ${page === 'landing' ? 'active' : ''}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setPage('input')} 
              className={`nav-link ${page === 'input' ? 'active' : ''}`}
            >
              Skill Assessment
            </button>
            {results && (
              <button 
                onClick={() => setPage('results')} 
                className={`nav-link ${page === 'results' ? 'active' : ''}`}
              >
                Recommendations
              </button>
            )}
            <button 
              onClick={() => setPage('evaluation')} 
              className={`nav-link ${page === 'evaluation' ? 'active' : ''}`}
            >
              System Evaluation
            </button>
          </nav>
        </div>
      </header>

      <main className="container section">
        
        {/* ========================================================================= */}
        {/* PAGE 1: OVERVIEW / LANDING */}
        {/* ========================================================================= */}
        {page === 'landing' && (
          <div>
            {/* HERO SECTION */}
            <div className="panel" style={{ padding: '40px', marginBottom: '32px' }}>
              <div style={{ maxWidth: '780px' }}>
                <span className="tag tag-brand" style={{ marginBottom: '12px' }}>
                  Coursera Dataset Intelligence Engine
                </span>
                <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.25 }}>
                  Identify Skill Gaps & Find Courses Grounded in Real Data
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
                  Compare your technical background against target career roles, pinpoint missing competencies, and receive multi-factor course recommendations cataloged directly from <strong>623 Coursera offerings</strong>.
                </p>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button onClick={() => setPage('input')} className="btn btn-primary">
                    Start Skill Assessment <ArrowRight size={15} />
                  </button>
                  <button onClick={() => setPage('evaluation')} className="btn btn-secondary">
                    View System Performance Metrics
                  </button>
                </div>
              </div>

              {/* DATASET METRICS GRID */}
              <div className="metrics-row" style={{ marginTop: '32px', marginBottom: 0, paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
                <div className="metric-card">
                  <div className="metric-label">Courses Analyzed</div>
                  <div className="metric-value">{stats ? stats.total_courses : 623}</div>
                  <div className="metric-sub">100% Real Coursera Data</div>
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
            </div>

            {/* FEATURED CAREER TRACKS */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px' }}>Select a Target Role</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Click a role to assess your skill coverage and view recommended course roadmaps.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
                {CAREER_TRACKS.map(track => {
                  const IconComp = track.icon;
                  return (
                    <div 
                      key={track.id} 
                      className="panel" 
                      style={{ cursor: 'pointer', padding: '20px', transition: 'border-color 0.15s ease' }}
                      onClick={() => handleSelectCareerFromLanding(track.title)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ padding: '8px', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                          <IconComp size={18} color="#a5b4fc" />
                        </div>
                        <span className="tag">{track.count}</span>
                      </div>

                      <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>{track.title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                        {track.desc}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-brand)', fontWeight: 500, fontSize: '12px' }}>
                        Assess Skill Readiness <ArrowRight size={13} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HOW IT WORKS */}
            <div className="panel">
              <div className="panel-header" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                <div>
                  <h2 className="panel-title">How Recommendation Intelligence Works</h2>
                  <p className="panel-subtitle">Transparent, explainable recommendation pipeline grounded in vector space search.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-brand)', marginBottom: '6px' }}>STEP 01</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>Skill Tag Selection</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Input your technical competencies which are normalized against our 319-skill dataset taxonomy.</div>
                </div>
                <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--status-success-text)', marginBottom: '6px' }}>STEP 02</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>Skill Gap Analysis</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Calculates skill overlap against domain target profiles to pinpoint exact missing skills.</div>
                </div>
                <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--status-warning-text)', marginBottom: '6px' }}>STEP 03</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>FAISS Hybrid Scoring</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Queries 384-dimensional SentenceTransformer embeddings and ranks courses with RAG explanations.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 2: SKILL ASSESSMENT & INPUT FORM */}
        {/* ========================================================================= */}
        {page === 'input' && (
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Skill Assessment & Preferences</h2>
                  <p className="panel-subtitle">Configure your current background and career targets.</p>
                </div>
                <button onClick={() => setPage('landing')} className="btn btn-ghost btn-sm">
                  <ArrowLeft size={14} /> Back
                </button>
              </div>

              {/* Skill Input */}
              <div className="form-group">
                <label className="form-label">Technical Skills You Currently Have</label>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {currentSkills.map(s => (
                    <span key={s} className="tag tag-brand">
                      {s}
                      <button onClick={() => handleRemoveSkill(s)} className="tag-remove"><X size={12} /></button>
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
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

                <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginBottom: '6px' }}>Suggested dataset skills:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {PRESET_SKILLS.map(s => (
                    <button 
                      key={s} 
                      onClick={() => handleAddSkill(s)}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid var(--border-default)', 
                        color: 'var(--text-muted)', 
                        padding: '2px 8px', 
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

              {/* Target Role Selector */}
              <div className="form-group">
                <label className="form-label">Target Career Goal</label>
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

              {/* Preferences */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-group">
                <div>
                  <label className="form-label">Course Difficulty</label>
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

              {/* Configurable Priority Weights */}
              <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '16px', marginBottom: '20px' }}>
                <button 
                  onClick={() => setShowTuner(!showTuner)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-brand)' }}
                >
                  <Sliders size={13} /> {showTuner ? "Hide Weight Priorities" : "Customize Scoring Weight Priorities"}
                </button>

                {showTuner && (
                  <div style={{ marginTop: '12px', background: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', fontSize: '12px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span>Semantic Vector Match</span>
                        <strong>{Math.round(weights.semantic_skill_match * 100)}%</strong>
                      </div>
                      <input 
                        type="range" min="0" max="0.8" step="0.05" 
                        value={weights.semantic_skill_match}
                        onChange={e => setWeights({...weights, semantic_skill_match: parseFloat(e.target.value)})}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span>Missing Skill Gap Weight</span>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
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

              {/* Action Button */}
              <button onClick={handleRunAdvisor} className="btn btn-primary" style={{ width: '100%' }}>
                Run Course Matcher <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 3: COURSE RECOMMENDATIONS */}
        {/* ========================================================================= */}
        {page === 'results' && (
          <div>
            {/* CAREER READINESS PANEL */}
            {results && results.selected_career && (
              <div className="panel" style={{ marginBottom: '24px' }}>
                <div className="panel-header">
                  <div>
                    <span className="tag tag-brand" style={{ marginBottom: '6px' }}>Target Profile</span>
                    <h2 className="panel-title" style={{ fontSize: '18px' }}>{results.selected_career.title}</h2>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-brand)' }}>
                      {results.selected_career.match_percentage}%
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Readiness Score</div>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {results.selected_career.description}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--status-success-text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={14} /> Skills You Possess ({results.selected_career.matched_core_skills.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {results.selected_career.matched_core_skills.length > 0 ? (
                        results.selected_career.matched_core_skills.map(s => (
                          <span key={s} className="tag tag-success">{s}</span>
                        ))
                      ) : <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>None matched yet</span>}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--status-warning-text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={14} /> Key Skill Gaps to Target ({results.selected_career.missing_core_skills.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)' }}>
                  Recommended Courses ({results ? results.recommendations.length : 0})
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Grounded on <strong style={{ color: 'var(--text-heading)' }}>coursera_course_dataset_v3.csv</strong>
                </div>
              </div>

              {loading ? (
                <div className="panel" style={{ padding: '48px', textAlign: 'center' }}>
                  <Sparkles className="animate-spin" size={28} color="var(--color-brand)" style={{ margin: '0 auto 12px' }} />
                  <div style={{ color: 'var(--text-muted)' }}>Querying FAISS vector index & computing hybrid scores...</div>
                </div>
              ) : results && results.recommendations ? (
                <div>
                  {results.recommendations.map((rec) => (
                    <div key={rec.course_id} className="course-card">
                      <div className="course-header">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
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

                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginBottom: '4px' }}>Skills Covered:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
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

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-default)' }}>
                        <button 
                          onClick={() => toggleAnalysis(rec.course_id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--color-brand)' }}
                        >
                          <Info size={13} /> {expandedAnalysis[rec.course_id] ? "Hide Match Analysis" : "Why this fits your path"}
                        </button>

                        <a 
                          href={rec.course_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          View on Coursera <ExternalLink size={12} />
                        </a>
                      </div>

                      {expandedAnalysis[rec.course_id] && (
                        <div style={{ marginTop: '12px', background: 'var(--bg-app)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', fontSize: '12px', color: 'var(--text-body)' }}>
                          <strong style={{ color: 'var(--color-brand)' }}>Recommendation Analysis:</strong>
                          <p style={{ marginTop: '4px', lineHeight: 1.5 }}>{rec.rag_explanation}</p>
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
        {/* PAGE 4: EVALUATION METRICS DASHBOARD */}
        {/* ========================================================================= */}
        {page === 'evaluation' && evaluation && (
          <div>
            <div className="panel" style={{ marginBottom: '24px' }}>
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">System Benchmark & Accuracy Metrics</h2>
                  <p className="panel-subtitle">Quantitative evaluation across 5 benchmark student profiles against the full Coursera dataset.</p>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="metrics-row">
                <div className="metric-card">
                  <div className="metric-label">Mean Precision@5</div>
                  <div className="metric-value">{evaluation.summary_metrics.mean_precision_at_5}</div>
                  <div className="metric-sub">Top 5 Recommendation Relevance</div>
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
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Benchmark Profile Results</h3>
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

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-default)', padding: '24px 0', marginTop: '40px', color: 'var(--text-subtle)', fontSize: '12px', textAlign: 'center' }}>
        <div className="container">
          PathFinder Recommendation Engine • Grounded on <code>coursera_course_dataset_v3.csv</code> (623 courses, 12 attributes)
        </div>
      </footer>
    </div>
  );
}
