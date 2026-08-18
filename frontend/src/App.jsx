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
  Code
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

const CAREER_CARDS = [
  { title: "Data Scientist", icon: TrendingUp, count: "340 Courses", desc: "Extract insights using statistics, ML, and Python." },
  { title: "AI / Machine Learning Engineer", icon: Cpu, count: "280 Courses", desc: "Design neural networks, AI algorithms, and ML models." },
  { title: "Cloud Solutions Architect", icon: Globe, count: "290 Courses", desc: "Build infrastructure across AWS, GCP, and Azure." },
  { title: "Cybersecurity Engineer", icon: Shield, count: "160 Courses", desc: "Protect systems, networks, and data from security threats." },
  { title: "Full-Stack Web Developer", icon: Code, count: "210 Courses", desc: "Build end-to-end web applications and modern APIs." },
  { title: "Data & Business Analyst", icon: Briefcase, count: "310 Courses", desc: "Translate complex data into business decisions & dashboards." }
];

export default function App() {
  // Navigation Page State: 'landing' | 'input' | 'results' | 'evaluation'
  const [page, setPage] = useState('landing');
  
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
  
  // Processing & Results state
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [expandedExplanation, setExpandedExplanation] = useState({});

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

  const toggleExplanation = (id) => {
    setExpandedExplanation(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="app-container">
      
      {/* NAVBAR HEADER */}
      <header className="app-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ cursor: 'pointer' }} onClick={() => setPage('landing')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px 12px', background: 'rgba(99,102,241,0.12)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.25)' }}>
                <Compass size={24} color="#818cf8" />
              </div>
              <div>
                <h1 className="brand-title" style={{ fontSize: '1.6rem' }}>
                  PathFinder
                </h1>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Coursera Dataset Advisor
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="tab-group">
            <button 
              onClick={() => setPage('landing')}
              className={`tab-btn ${page === 'landing' ? 'active' : ''}`}
            >
              <Compass size={15} /> Home
            </button>
            <button 
              onClick={() => setPage('input')}
              className={`tab-btn ${page === 'input' ? 'active' : ''}`}
            >
              <Target size={15} /> Skill Assessment
            </button>
            {results && (
              <button 
                onClick={() => setPage('results')}
                className={`tab-btn ${page === 'results' ? 'active' : ''}`}
              >
                <BookOpen size={15} /> Course Results
              </button>
            )}
            <button 
              onClick={() => setPage('evaluation')}
              className={`tab-btn ${page === 'evaluation' ? 'active' : ''}`}
            >
              <BarChart2 size={15} /> Benchmark Metrics
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* PAGE 1: LANDING PAGE */}
      {/* ========================================================================= */}
      {page === 'landing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* HERO BANNER */}
          <div className="card" style={{ padding: '48px 40px', background: 'linear-gradient(135deg, rgba(21, 28, 44, 0.95), rgba(15, 23, 42, 0.95))', textAlign: 'center', border: '1px solid var(--border-light)' }}>
            <span className="pill pill-indigo" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
              Dataset Grounded Career Intelligence
            </span>
            <h2 style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--text-title)', lineHeight: 1.25, maxWidth: '800px', margin: '0 auto 16px' }}>
              Navigate Your Tech Career Path with Real Dataset Grounding
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto 32px', lineHeight: 1.6 }}>
              Assess your current skills, identify exact skill gaps for your dream role, and discover personalized learning roadmaps across <strong>623 real Coursera courses</strong>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button onClick={() => setPage('input')} className="btn-action" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                Start Skill Assessment <ArrowRight size={18} />
              </button>
              <button onClick={() => setPage('evaluation')} className="btn-action" style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-title)', boxShadow: 'none' }}>
                View Benchmark Performance
              </button>
            </div>

            {/* DATASET PROOF STATS */}
            <div className="stats-grid" style={{ maxWidth: '900px', margin: '40px auto 0' }}>
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
                  <div className="stat-lbl">Providers (IBM, Google)</div>
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
          </div>

          {/* EXPLORE POPULAR CAREER PATHS */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--text-title)', marginBottom: '6px' }}>
                Explore Featured Career Tracks
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Select a career track below to immediately analyze your skill readiness and course recommendations.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {CAREER_CARDS.map(card => {
                const IconComponent = card.icon;
                return (
                  <div 
                    key={card.title} 
                    className="card card-hover" 
                    style={{ cursor: 'pointer', padding: '24px' }}
                    onClick={() => handleSelectCareerFromLanding(card.title)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div style={{ padding: '10px', background: 'rgba(99,102,241,0.12)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.25)' }}>
                        <IconComponent size={22} color="#818cf8" />
                      </div>
                      <span className="pill pill-indigo">{card.count}</span>
                    </div>

                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-title)', marginBottom: '8px' }}>
                      {card.title}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      {card.desc}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8', fontWeight: 600, fontSize: '0.85rem' }}>
                      Start Skill Gap Analysis <ArrowRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HOW IT WORKS STEP TIMELINE */}
          <div className="card" style={{ padding: '36px' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--text-title)', marginBottom: '24px', textAlign: 'center' }}>
              How PathFinder Recommends Courses
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 800, fontSize: '1.2rem' }}>
                  1
                </div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-title)', marginBottom: '8px' }}>Select Your Skills</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enter programming languages, tools, and technical concepts you already possess.</p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 800, fontSize: '1.2rem' }}>
                  2
                </div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-title)', marginBottom: '8px' }}>Identify Skill Gaps</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Our engine compares your skills to target career profiles to find missing competencies.</p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(245,158,11,0.15)', color: '#fcd34d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 800, fontSize: '1.2rem' }}>
                  3
                </div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-title)', marginBottom: '8px' }}>FAISS Vector Search</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Generates multi-factor hybrid recommendations with RAG explanations for every course.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 2: SKILL ASSESSMENT & INPUT FORM */}
      {/* ========================================================================= */}
      {page === 'input' && (
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <span className="pill pill-indigo" style={{ marginBottom: '6px' }}>Step 1 of 2</span>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-title)' }}>Build Your Career Profile</h2>
              </div>
              <button onClick={() => setPage('landing')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                <ArrowLeft size={16} /> Back to Home
              </button>
            </div>

            {/* Current Skills Input */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">
                What skills do you currently have?
              </label>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {currentSkills.map(skill => (
                  <span key={skill} className="pill pill-indigo">
                    {skill}
                    <button onClick={() => handleRemoveSkill(skill)} style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', marginLeft: '4px' }}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input 
                  type="text" 
                  className="input-box" 
                  placeholder="Type a skill and press Enter..." 
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddSkill(skillInput)}
                />
                <button onClick={() => handleAddSkill(skillInput)} className="btn-action" style={{ padding: '0 20px' }}>
                  Add
                </button>
              </div>

              {/* Quick Add Suggestions */}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginBottom: '8px' }}>Suggested skills from dataset:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {COMMON_SKILLS.map(s => (
                    <button 
                      key={s} 
                      onClick={() => handleAddSkill(s)}
                      style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid var(--border-light)', 
                        color: 'var(--text-muted)', 
                        padding: '4px 12px', 
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

            {/* Target Career Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">
                What is your target career role?
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

            {/* Preferences */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label className="form-label">Course Difficulty</label>
                <select className="select-box" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  <option value="Any">Any Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="form-label">Study Schedule</label>
                <select className="select-box" value={duration} onChange={e => setDuration(e.target.value)}>
                  <option value="Any">Any Duration</option>
                  <option value="1 - 4 Weeks">1 - 4 Weeks</option>
                  <option value="1 - 3 Months">1 - 3 Months</option>
                  <option value="3 - 6 Months">3 - 6 Months</option>
                </select>
              </div>
            </div>

            {/* Configurable Priorities */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginBottom: '28px' }}>
              <button 
                onClick={() => setShowTuner(!showTuner)}
                style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Sliders size={14} /> {showTuner ? "Hide Priority Weight Settings" : "Customize Priority Weight Settings"}
              </button>

              {showTuner && (
                <div style={{ marginTop: '16px', background: 'rgba(15,23,42,0.8)', padding: '16px', borderRadius: '12px', fontSize: '0.8rem' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Semantic Similarity</span>
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
                      <span>Matching Missing Skill Gap</span>
                      <strong style={{ color: 'var(--text-title)' }}>{Math.round(weights.career_skill_gap_relevance * 100)}%</strong>
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
                      <span>Course Rating Quality</span>
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

            {/* Run Button */}
            <button onClick={handleRunAdvisor} className="btn-action" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
              Generate Recommendations <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 3: COURSE RESULTS & SKILL GAP ANALYSIS */}
      {/* ========================================================================= */}
      {page === 'results' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* TOP NAV & BACK BUTTON */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setPage('input')} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600 }}>
              <ArrowLeft size={16} /> Edit Profile & Skills
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing recommendations for <strong style={{ color: 'var(--text-title)' }}>{targetCareer}</strong>
            </span>
          </div>

          {/* CAREER READINESS CARD */}
          {results && results.selected_career && (
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(21, 28, 44, 0.95), rgba(15, 23, 42, 0.95))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <span className="pill pill-indigo" style={{ marginBottom: '8px' }}>Target Goal</span>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--text-title)' }}>{results.selected_career.title}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818cf8' }}>
                    {results.selected_career.match_percentage}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Skill Readiness Score</div>
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                {results.selected_career.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(15,23,42,0.6)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6ee7b7', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={15} /> Skills You Have ({results.selected_career.matched_core_skills.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {results.selected_career.matched_core_skills.length > 0 ? (
                      results.selected_career.matched_core_skills.map(s => (
                        <span key={s} className="pill pill-emerald">{s}</span>
                      ))
                    ) : <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>None matched yet</span>}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fcd34d', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={15} /> Key Skills To Learn ({results.selected_career.missing_core_skills.length})
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

          {/* COURSE RECOMMENDATIONS CATALOG */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="#818cf8" /> Recommended Courses ({results ? results.recommendations.length : 0})
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Vector Index: <strong style={{ color: 'var(--text-title)' }}>FAISS all-MiniLM-L6-v2</strong>
              </span>
            </div>

            {loading ? (
              <div className="card" style={{ padding: '56px', textAlign: 'center' }}>
                <Sparkles className="animate-spin" size={36} color="#818cf8" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Searching FAISS vector database & matching course catalog...</p>
              </div>
            ) : results && results.recommendations ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {results.recommendations.map((rec) => (
                  <div key={rec.course_id} className="card card-hover">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="pill pill-gray" style={{ fontSize: '0.75rem' }}>Row #{rec.course_id + 1}</span>
                          <span className="pill pill-indigo">{rec.organization}</span>
                          <span className="pill pill-emerald">{rec.type}</span>
                        </div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-title)' }}>{rec.title}</h4>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818cf8' }}>
                          {Math.round(rec.final_score * 100)}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>Match Score</div>
                      </div>
                    </div>

                    {/* Meta Stats */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      <div>⭐ <strong style={{ color: 'var(--text-title)' }}>{rec.rating}</strong> / 5.0 ({rec.review_count.toLocaleString()} reviews)</div>
                      <div>📊 Level: <strong style={{ color: 'var(--text-title)' }}>{rec.difficulty}</strong></div>
                      <div>⏱️ Duration: <strong style={{ color: 'var(--text-title)' }}>{rec.duration}</strong></div>
                      <div>👥 Enrolled: <strong style={{ color: 'var(--text-title)' }}>{rec.enrolled_count.toLocaleString()}</strong></div>
                    </div>

                    {/* Matching Skills */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginBottom: '6px' }}>Skills Covered in Course:</div>
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

                    {/* Footer Links & Explanation */}
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
      )}

      {/* ========================================================================= */}
      {/* PAGE 4: SYSTEM EVALUATION METRICS DASHBOARD */}
      {/* ========================================================================= */}
      {page === 'evaluation' && evaluation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-title)', marginBottom: '8px' }}>
              System Benchmark & Accuracy Metrics
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Quantitative model evaluation results tested across 5 benchmark student profiles against the full dataset.
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

            {/* Benchmark Table */}
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-title)', marginBottom: '16px' }}>Benchmark Profile Results</h3>
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
