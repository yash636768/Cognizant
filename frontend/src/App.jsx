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
  X
} from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

const COMMON_SKILLS = [
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

export default function App() {
  const [stats, setStats] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [activeTab, setActiveTab] = useState('recommendations');
  
  // Inputs
  const [currentSkills, setCurrentSkills] = useState(["Python Programming", "Databases & SQL"]);
  const [skillInput, setSkillInput] = useState("");
  const [targetCareer, setTargetCareer] = useState("Data Scientist");
  const [userQuery, setUserQuery] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("Any");
  const [courseType, setCourseType] = useState("Any");
  
  // Weights Tuner
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
  
  // Response states
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [expandedExplanation, setExpandedExplanation] = useState({});

  useEffect(() => {
    fetchStats();
    fetchEvaluation();
    handleSearch();
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

  const handleSearch = async () => {
    setLoading(true);
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

  const toggleExplanation = (id) => {
    setExpandedExplanation(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="app-container">
      
      {/* HEADER SECTION */}
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '10px', background: 'rgba(99,102,241,0.12)', borderRadius: '14px', border: '1px solid rgba(99,102,241,0.25)' }}>
                <Compass size={26} color="#818cf8" />
              </div>
              <h1 className="brand-title">
                PathFinder
              </h1>
              <span className="brand-badge">
                Coursera Dataset Engine
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Personalized career guidance and intelligent course matching grounded in real Coursera data.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="tab-group">
            <button 
              onClick={() => setActiveTab('recommendations')}
              className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
            >
              <Target size={16} /> Course Advisor
            </button>
            <button 
              onClick={() => setActiveTab('evaluation')}
              className={`tab-btn ${activeTab === 'evaluation' ? 'active' : ''}`}
            >
              <BarChart2 size={16} /> System Performance
            </button>
          </div>
        </div>

        {/* DATASET PROOF METRICS BANNER */}
        <div className="stats-grid">
          <div className="stat-item">
            <Database size={20} color="#818cf8" />
            <div>
              <div className="stat-val">{stats ? stats.total_courses : 623}</div>
              <div className="stat-lbl">Courses Analyzed</div>
            </div>
          </div>
          <div className="stat-item">
            <Layers size={20} color="#10b981" />
            <div>
              <div className="stat-val">{stats ? stats.total_skills_identified : 319}</div>
              <div className="stat-lbl">Skills Extracted</div>
            </div>
          </div>
          <div className="stat-item">
            <Award size={20} color="#f59e0b" />
            <div>
              <div className="stat-val">{stats ? stats.total_organizations : 115}</div>
              <div className="stat-lbl">Universities & Companies</div>
            </div>
          </div>
          <div className="stat-item">
            <CheckCircle size={20} color="#38bdf8" />
            <div>
              <div className="stat-val">4.64 / 5.0</div>
              <div className="stat-lbl">Average Rating</div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN TAB 1: COURSE ADVISOR */}
      {activeTab === 'recommendations' && (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '28px' }}>
          
          {/* LEFT SIDE: CONTROLS PANEL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-title)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Target size={18} color="#818cf8" /> Your Career Profile
              </h2>

              {/* Skills Selector */}
              <div style={{ marginBottom: '22px' }}>
                <label className="form-label">
                  Your Current Skills
                </label>
                
                {/* Active Skill Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {currentSkills.map(skill => (
                    <span key={skill} className="pill pill-indigo">
                      {skill}
                      <button 
                        onClick={() => handleRemoveSkill(skill)} 
                        style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', marginLeft: '4px' }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input 
                    type="text" 
                    className="input-box" 
                    placeholder="Add a skill..." 
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSkill(skillInput)}
                  />
                  <button onClick={() => handleAddSkill(skillInput)} className="btn-action" style={{ padding: '0 16px' }}>
                    Add
                  </button>
                </div>

                {/* Popular Skill Presets */}
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginBottom: '8px' }}>Suggested skills:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {COMMON_SKILLS.slice(0, 6).map(s => (
                      <button 
                        key={s} 
                        onClick={() => handleAddSkill(s)}
                        style={{ 
                          background: 'rgba(255,255,255,0.03)', 
                          border: '1px solid var(--border-light)', 
                          color: 'var(--text-muted)', 
                          padding: '4px 10px', 
                          borderRadius: '16px', 
                          fontSize: '0.75rem', 
                          cursor: 'pointer' 
                        }}
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Target Career Dropdown */}
              <div style={{ marginBottom: '22px' }}>
                <label className="form-label">
                  Target Career Role
                </label>
                <select className="select-box" value={targetCareer} onChange={e => setTargetCareer(e.target.value)}>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                  <option value="Cloud Solutions Architect">Cloud Solutions Architect</option>
                  <option value="Cybersecurity Engineer">Cybersecurity Engineer</option>
                  <option value="Full-Stack Web Developer">Full-Stack Web Developer</option>
                  <option value="Data & Business Analyst">Data & Business Analyst</option>
                  <option value="Product & Strategy Leader">Product & Strategy Leader</option>
                </select>
              </div>

              {/* Learning Preferences */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Difficulty</label>
                  <select className="select-box" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                    <option value="Any">Any Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Time Commitment</label>
                  <select className="select-box" value={duration} onChange={e => setDuration(e.target.value)}>
                    <option value="Any">Any Duration</option>
                    <option value="1 - 4 Weeks">1 - 4 Weeks</option>
                    <option value="1 - 3 Months">1 - 3 Months</option>
                    <option value="3 - 6 Months">3 - 6 Months</option>
                  </select>
                </div>
              </div>

              {/* Scoring Weights Tuner Toggle */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '18px', marginBottom: '22px' }}>
                <button 
                  onClick={() => setShowTuner(!showTuner)}
                  style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Sliders size={14} /> {showTuner ? "Hide Weight Priorities" : "Customize Weight Priorities"}
                </button>

                {showTuner && (
                  <div style={{ marginTop: '16px', background: 'rgba(15,23,42,0.8)', padding: '16px', borderRadius: '12px', fontSize: '0.8rem' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Semantic Relevance</span>
                        <strong style={{ color: 'var(--text-title)' }}>{Math.round(weights.semantic_skill_match * 100)}%</strong>
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
                        <span>Missing Skill Match</span>
                        <strong style={{ color: 'var(--text-title)' }}>{Math.round(weights.career_skill_gap_relevance * 100)}%</strong>
                      </div>
                      <input 
                        type="range" min="0" max="0.5" step="0.05" 
                        value={weights.career_skill_gap_relevance}
                        onChange={e => setWeights({...weights, career_skill_gap_relevance: parseFloat(e.target.value)})}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Course Rating Weight</span>
                        <strong style={{ color: 'var(--text-title)' }}>{Math.round(weights.rating * 100)}%</strong>
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

              {/* Submit Search Button */}
              <button onClick={handleSearch} className="btn-action" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? <Sparkles className="animate-spin" size={18} /> : <Search size={18} />}
                Find Recommended Courses
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: RESULTS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* CAREER READINESS CARD */}
            {results && results.selected_career && (
              <div className="card" style={{ background: 'linear-gradient(135deg, rgba(21, 28, 44, 0.95), rgba(15, 23, 42, 0.95))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <span className="pill pill-indigo" style={{ marginBottom: '8px' }}>Career Target</span>
                    <h3 style={{ fontSize: '1.35rem', color: 'var(--text-title)' }}>{results.selected_career.title}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#818cf8' }}>
                      {results.selected_career.match_percentage}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Career Match Readiness</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  {results.selected_career.description}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(15,23,42,0.6)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6ee7b7', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={15} /> Skills You Already Have ({results.selected_career.matched_core_skills.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {results.selected_career.matched_core_skills.length > 0 ? (
                        results.selected_career.matched_core_skills.map(s => (
                          <span key={s} className="pill pill-emerald">{s}</span>
                        ))
                      ) : <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>Add skills to see match</span>}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fcd34d', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={15} /> Key Skills to Learn ({results.selected_career.missing_core_skills.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {results.selected_career.missing_core_skills.map(s => (
                        <span key={s} className="pill pill-amber">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* COURSE RECOMMENDATIONS LIST */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} color="#818cf8" /> Recommended Courses ({results ? results.recommendations.length : 0})
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Dataset: <strong style={{ color: 'var(--text-title)' }}>coursera_course_dataset_v3.csv</strong>
                </span>
              </div>

              {loading ? (
                <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                  <Sparkles className="animate-spin" size={32} color="#818cf8" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Searching FAISS vector index & matching course catalog...</p>
                </div>
              ) : results && results.recommendations ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {results.recommendations.map((rec) => (
                    <div key={rec.course_id} className="card card-hover">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span className="pill pill-gray" style={{ fontSize: '0.75rem' }}>Row #{rec.course_id + 1}</span>
                            <span className="pill pill-indigo">{rec.organization}</span>
                            <span className="pill pill-emerald">{rec.type}</span>
                          </div>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-title)' }}>{rec.title}</h4>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#818cf8' }}>
                            {Math.round(rec.final_score * 100)}%
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>Match Score</div>
                        </div>
                      </div>

                      {/* Course Metadata */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        <div>⭐ <strong style={{ color: 'var(--text-title)' }}>{rec.rating}</strong> / 5.0 ({rec.review_count.toLocaleString()} reviews)</div>
                        <div>📊 Level: <strong style={{ color: 'var(--text-title)' }}>{rec.difficulty}</strong></div>
                        <div>⏱️ Duration: <strong style={{ color: 'var(--text-title)' }}>{rec.duration}</strong></div>
                        <div>👥 Enrolled: <strong style={{ color: 'var(--text-title)' }}>{rec.enrolled_count.toLocaleString()}</strong></div>
                      </div>

                      {/* Skills Covered */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginBottom: '6px' }}>Skills Covered:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {rec.skills.split(',').map(s => {
                            const trimmed = s.trim();
                            const isGap = rec.matched_gap_skills.includes(trimmed);
                            return (
                              <span key={trimmed} className={isGap ? "pill pill-amber" : "pill pill-indigo"} style={{ fontSize: '0.75rem' }}>
                                {isGap ? `🎯 ${trimmed}` : trimmed}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
                        <button 
                          onClick={() => toggleExplanation(rec.course_id)}
                          style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Sparkles size={14} /> {expandedExplanation[rec.course_id] ? "Hide Match Details" : "Why this fits your path"}
                          {expandedExplanation[rec.course_id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        <a 
                          href={rec.course_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-action" 
                          style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}
                        >
                          View Course on Coursera <ExternalLink size={14} />
                        </a>
                      </div>

                      {/* Expandable Explanation Drawer */}
                      {expandedExplanation[rec.course_id] && (
                        <div style={{ marginTop: '14px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-light)', padding: '14px 18px', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-body)' }}>
                          <div style={{ fontWeight: 600, color: '#818cf8', marginBottom: '4px' }}>Recommendation Analysis:</div>
                          <p style={{ lineHeight: 1.5 }}>{rec.rag_explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* MAIN TAB 2: SYSTEM PERFORMANCE & EVALUATION */}
      {activeTab === 'evaluation' && evaluation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-title)', marginBottom: '8px' }}>
              System Benchmark & Accuracy Metrics
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Evaluated across 5 benchmark student profiles against the full 623 course Coursera dataset.
            </p>

            {/* Summary Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Mean Precision@5</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#818cf8' }}>
                  {evaluation.summary_metrics.mean_precision_at_5}
                </div>
              </div>
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Mean NDCG@5</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6ee7b7' }}>
                  {evaluation.summary_metrics.mean_ndcg_at_5}
                </div>
              </div>
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Skill-Gap Coverage</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fcd34d' }}>
                  {evaluation.summary_metrics.mean_skill_gap_coverage_pct}%
                </div>
              </div>
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Provider Diversity</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a5b4fc' }}>
                  {evaluation.summary_metrics.mean_organization_diversity}
                </div>
              </div>
            </div>

            {/* Detailed Benchmark Profiles Table */}
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-title)', marginBottom: '16px' }}>Benchmark Profile Performance</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px' }}>Student Profile</th>
                    <th style={{ padding: '12px' }}>Target Career</th>
                    <th style={{ padding: '12px' }}>Precision@5</th>
                    <th style={{ padding: '12px' }}>NDCG@5</th>
                    <th style={{ padding: '12px' }}>Skill Coverage</th>
                    <th style={{ padding: '12px' }}>Top Recommended Offerings</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluation.profiles.map(p => (
                    <tr key={p.profile_id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 12px', fontWeight: 600, color: 'var(--text-title)' }}>{p.profile_name}</td>
                      <td style={{ padding: '14px 12px', color: '#818cf8' }}>{p.target_career}</td>
                      <td style={{ padding: '14px 12px', fontWeight: 700 }}>{p.precision_at_5}</td>
                      <td style={{ padding: '14px 12px', fontWeight: 700, color: '#6ee7b7' }}>{p.ndcg_at_5}</td>
                      <td style={{ padding: '14px 12px', color: '#fcd34d' }}>{p.skill_gap_coverage_pct}%</td>
                      <td style={{ padding: '14px 12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', marginTop: '48px', padding: '24px 0', borderTop: '1px solid var(--border-light)', color: 'var(--text-faint)', fontSize: '0.85rem' }}>
        <p>PathFinder • Grounded on <code>coursera_course_dataset_v3.csv</code> (623 courses, 12 columns)</p>
      </footer>

    </div>
  );
}
