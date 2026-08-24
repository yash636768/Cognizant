import React from 'react';
import {
  Check,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  TrendingUp,
  Star,
  Clock,
  BarChart,
  Users,
  Award
} from 'lucide-react';
import InfoTooltip from '../components/common/InfoTooltip';

const ROLE_MARKET_TRENDS = {
  "Data Scientist": {
    avgCtc: "₹14 - 28 LPA",
    salaryBracket: "₹7L Entry • ₹50L+ Senior",
    usdRange: "$120k - $160k USD",
    demand: "High Demand (+26% YoY)",
    sentiment: "High Valuation for Production ML",
    trendingSkills: ["Python", "SQL", "Scikit-Learn", "Apache Spark", "Tableau & Power BI", "MLOps Pipelines"]
  },
  "AI / Machine Learning Engineer": {
    avgCtc: "₹18 - 35 LPA",
    salaryBracket: "₹9L Entry • ₹65L+ Senior",
    usdRange: "$140k - $190k USD",
    demand: "Very High Demand (+36% YoY)",
    sentiment: "Surging Demand for Agentic & LLM Systems",
    trendingSkills: ["PyTorch", "LangChain & RAG", "Vector DBs (Milvus/Pinecone)", "Docker & Kubernetes", "vLLM"]
  },
  "Cloud Solutions Architect": {
    avgCtc: "₹16 - 32 LPA",
    salaryBracket: "₹8L Entry • ₹55L+ Senior",
    usdRange: "$135k - $180k USD",
    demand: "Very High Demand (+38% YoY)",
    sentiment: "Critical Need for Multi-Cloud & AI Infrastructure",
    trendingSkills: ["AWS & Azure", "Terraform", "Kubernetes", "Serverless Architecture", "Cloud FinOps"]
  },
  "Cybersecurity Engineer": {
    avgCtc: "₹14 - 26 LPA",
    salaryBracket: "₹6L Entry • ₹48L+ Senior",
    usdRange: "$120k - $165k USD",
    demand: "Critical Shortage (+32% YoY)",
    sentiment: "Recession-Proof Defensive Need",
    trendingSkills: ["Zero-Trust", "Cloud Security (CSPM)", "Wireshark & Splunk", "Kali Linux", "Vault"]
  },
  "Full-Stack Web Developer": {
    avgCtc: "₹12 - 24 LPA",
    salaryBracket: "₹5L Entry • ₹42L+ Senior",
    usdRange: "$110k - $150k USD",
    demand: "High Volume (+22% YoY)",
    sentiment: "High Demand for AI-Integrated Web Apps",
    trendingSkills: ["Next.js & React", "TypeScript", "Node.js & Express", "PostgreSQL", "AI API Integration"]
  },
  "Data & Business Analyst": {
    avgCtc: "₹10 - 20 LPA",
    salaryBracket: "₹5L Entry • ₹35L+ Senior",
    usdRange: "$95k - $135k USD",
    demand: "Steady Growth (+20% YoY)",
    sentiment: "Shifting toward Automated AI Analytics",
    trendingSkills: ["Advanced SQL", "Power BI & Tableau", "Excel VBA", "Python Mining", "Snowflake & dbt"]
  },
  "Product & Strategy Leader": {
    avgCtc: "₹20 - 40 LPA",
    salaryBracket: "₹10L Entry • ₹70L+ Senior",
    usdRange: "$145k - $210k USD",
    demand: "High Demand (+18% YoY)",
    sentiment: "Strategic Need for AI Product Roadmaps",
    trendingSkills: ["Product Strategy", "Agile & Scrum", "Data-Driven KPIs", "User Research", "AI Roadmapping"]
  }
};

const getTrackSuggestionReason = (track) => {
  const matchedList = track.matched_core_skills || [];
  const missingList = track.missing_core_skills || [];
  const matchedText = matchedList.length > 0 ? matchedList.slice(0, 2).join(' & ') : '';
  const missingNext = missingList.length > 0 ? missingList[0] : '';
  const trackKey = (track.title || '').toLowerCase();

  if (trackKey.includes('data scientist')) {
    if (matchedText) {
      return `Uses your ${matchedText} foundation; learning ${missingNext || 'Machine Learning'} will get you to full readiness.`;
    }
    return `High-value data trajectory — great pivot once you pick up Python and core statistics.`;
  }

  if (trackKey.includes('machine learning') || trackKey.includes('ai')) {
    if (matchedText) {
      return `Builds directly on your ${matchedText} skills; top choice for transitioning into modern AI & MLOps.`;
    }
    return `Top-paying specialization with massive industry demand for AI engineering talent.`;
  }

  if (trackKey.includes('full-stack') || trackKey.includes('developer')) {
    if (matchedText) {
      return `Applies your ${matchedText} knowledge to backend services; add frontend frameworks to build full apps.`;
    }
    return `Highest volume of active job openings across startups and enterprise engineering teams.`;
  }

  if (trackKey.includes('cloud') || trackKey.includes('architect')) {
    if (matchedText) {
      return `Your ${matchedText} background pairs well with cloud services; focus on ${missingNext || 'AWS/Azure'} next.`;
    }
    return `Fastest growing infrastructure role (+38% YoY) with high demand for cloud systems design.`;
  }

  if (trackKey.includes('cybersecurity') || trackKey.includes('security')) {
    if (matchedText) {
      return `Your ${matchedText} knowledge provides a solid baseline for network security and data defense.`;
    }
    return `Critical shortage domain offering excellent job stability and defensive engineering pay.`;
  }

  if (trackKey.includes('analyst')) {
    if (matchedText) {
      return `You already possess ${matchedText}; fastest trajectory to high-impact reporting and business strategy.`;
    }
    return `High-demand business-facing track turning raw dataset queries into executive decisions.`;
  }

  if (matchedText) {
    return `Directly leverages your ${matchedText} skills with a clear pathway to bridge remaining gaps.`;
  }
  return `Strong complementary career path with high demand in current tech hiring markets.`;
};

export default function ResultsPage({
  results,
  loading,
  onSwitchTrack,
  setPage
}) {
  const selectedTitle = results?.selected_career?.title || "Data Scientist";

  // Market trends for current role
  const currentMarket = ROLE_MARKET_TRENDS[selectedTitle] || {
    avgCtc: "₹12 - 26 LPA",
    salaryBracket: "₹6L Entry • ₹45L+ Senior",
    usdRange: "$115k - $155k USD",
    demand: "High Demand (+24% YoY)",
    sentiment: "Active Hiring Market",
    trendingSkills: ["Python", "SQL", "Cloud", "Modern Frameworks"]
  };

  // Alternative career candidates
  const allCandidates = results?.career_candidates || [];
  const alternativeCandidates = allCandidates.filter(
    c => c.title?.toLowerCase() !== selectedTitle.toLowerCase()
  );
  const topThreeAlternatives = alternativeCandidates.slice(0, 3);

  const recommendations = results?.recommendations || [];
  const matchPct = results?.selected_career?.match_percentage || 0;
  const matchedSkillsCount = results?.selected_career?.matched_core_skills?.length || 0;
  const missingSkillsCount = results?.selected_career?.missing_core_skills?.length || 0;

  return (
    <div className="results-page animate-fade-in">
      {/* 1. TOP NAV BAR */}
      <div className="results-top-nav">
        <button
          type="button"
          onClick={() => (setPage ? setPage('input') : null)}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={14} />
          Back to Assessment
        </button>
      </div>

      {/* 2. HERO CAREER READINESS EXECUTIVE SUMMARY */}
      {results && results.selected_career && (
        <div className="results-hero-card">
          <div className="results-hero-header">
            <div>
              <span className="tag tag-brand" style={{ marginBottom: '6px' }}>
                <Award size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Target Career Path
              </span>
              <h1 className="results-hero-title">{results.selected_career.title}</h1>
            </div>

            <div className="results-match-widget">
              <div className="results-match-score">
                {matchPct}%
              </div>
              <div className="results-match-label">
                {matchPct >= 75 ? 'Strong Fit' : matchPct >= 40 ? 'Moderate Fit' : 'Growth Track'}
              </div>
            </div>
          </div>

          <p className="results-hero-desc">
            {results.selected_career.description}
          </p>

          {/* 3. SKILLS GRID (Possessed vs What You Need Next) */}
          <div className="results-skills-grid">
            <div className="results-skill-card">
              <div className="results-skill-card-header">
                <div className="results-skill-card-title possessed">
                  <Check size={16} />
                  <span>Skills You Possess</span>
                  <InfoTooltip
                    text="These are skills from your assessment that match the core requirements of this target career track."
                    align="left"
                  />
                </div>
              </div>

              <div className="results-tags-wrap">
                {matchedSkillsCount > 0 ? (
                  results.selected_career.matched_core_skills.map(s => (
                    <span key={s} className="results-chip possessed">
                      <Check size={12} />
                      {s}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>None matched yet</span>
                )}
              </div>
            </div>

            <div className="results-skill-card">
              <div className="results-skill-card-header">
                <div className="results-skill-card-title needed">
                  <AlertCircle size={16} />
                  <span>What You Need Next</span>
                  <InfoTooltip
                    text="These are the crucial skills currently missing from your profile required to achieve full career readiness for this role."
                    align="right"
                  />
                </div>
              </div>

              <div className="results-tags-wrap">
                {missingSkillsCount > 0 ? (
                  results.selected_career.missing_core_skills.map(s => (
                    <span key={s} className="results-chip needed">
                      🎯 {s}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--status-success-text)' }}>
                    All core skills acquired!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 4. MARKET COMPENSATION & DEMAND STRIP */}
          <div className="results-stats-strip">
            <div className="results-stat-box">
              <div className="results-stat-icon brand">
                <Briefcase size={18} />
              </div>
              <div className="results-stat-info">
                <span className="results-stat-label">Market Compensation</span>
                <span className="results-stat-val">
                  {currentMarket.avgCtc} <span style={{ fontSize: '11px', color: 'var(--text-subtle)', fontWeight: 400 }}>({currentMarket.salaryBracket})</span>
                </span>
              </div>
            </div>

            <div className="results-stat-box">
              <div className="results-stat-icon success">
                <TrendingUp size={18} />
              </div>
              <div className="results-stat-info">
                <span className="results-stat-label">Hiring Velocity</span>
                <span className="results-stat-val" style={{ color: 'var(--status-success-text)' }}>
                  {currentMarket.demand}
                </span>
              </div>
            </div>
          </div>

          {/* 5. TOP ALTERNATIVE CAREER PATHS */}
          {topThreeAlternatives.length > 0 && onSwitchTrack && (
            <div className="results-alt-tracks-container">
              <div className="results-alt-header">
                <Sparkles size={16} color="var(--color-brand)" />
                <span>Alternative Career Tracks for Your Skillset:</span>
              </div>

              <div className="results-alt-grid">
                {topThreeAlternatives.map((track) => {
                  const reason = getTrackSuggestionReason(track);
                  return (
                    <div key={track.career_key || track.title} className="results-alt-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '13.5px', color: 'var(--text-heading)' }}>
                            {track.title}
                          </strong>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)', marginTop: '2px' }}>
                            {track.matched_core_skills?.length || 0} skills match • {track.missing_core_skills?.length || 0} gap
                          </div>
                        </div>

                        <span
                          className={`tag ${track.match_percentage >= 35 ? 'tag-success' : 'tag-brand'}`}
                          style={{ fontSize: '11px', fontWeight: 700 }}
                        >
                          {track.match_percentage}%
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                        💡 <span style={{ color: 'var(--text-body)' }}>{reason}</span>
                      </p>

                      <button
                        type="button"
                        onClick={() => onSwitchTrack(track.title)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          fontSize: '11.5px',
                          padding: '5px 10px',
                          alignSelf: 'flex-start',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        Switch to This Path <ArrowRight size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. RECOMMENDED COURSES CATALOG */}
      <section className="results-catalog-section">
        {loading ? (
          <div className="panel" style={{ padding: '52px', textAlign: 'center' }}>
            <Sparkles
              className="animate-spin"
              size={30}
              color="var(--color-brand)"
              style={{ margin: '0 auto 14px' }}
            />
            <div style={{ color: 'var(--text-muted)' }}>
              Calculating neural matches &amp; precision learning roadmap...
            </div>
          </div>
        ) : recommendations.length > 0 ? (
          <div>
            {recommendations.map((rec) => {
              const matchPercent = Math.round(rec.final_score * 100);

              return (
                <div key={rec.course_id} className="course-card-enhanced">
                  <div className="course-card-top-row">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span className="tag tag-brand">{rec.organization}</span>
                        <span className="tag tag-success">{rec.type}</span>
                      </div>
                      <h3 className="course-card-title-text">{rec.title}</h3>
                    </div>

                    <div className="match-score-badge" style={{ fontSize: '15px', fontWeight: 800 }}>
                      {matchPercent}%
                    </div>
                  </div>

                  {/* Metadata items */}
                  <div className="course-card-meta-grid">
                    <div className="course-card-meta-item">
                      <Star size={13} color="#f59e0b" fill="#f59e0b" />
                      <span><strong>{rec.rating}</strong> / 5.0</span>
                      <span style={{ color: 'var(--text-subtle)', fontSize: '11.5px' }}>
                        ({(rec.review_count || 0).toLocaleString()} reviews)
                      </span>
                    </div>

                    <div className="course-card-meta-item">
                      <BarChart size={13} color="var(--text-muted)" />
                      <span>Level: <strong>{rec.difficulty}</strong></span>
                    </div>

                    <div className="course-card-meta-item">
                      <Clock size={13} color="var(--text-muted)" />
                      <span>Duration: <strong>{rec.duration}</strong></span>
                    </div>

                    <div className="course-card-meta-item">
                      <Users size={13} color="var(--text-muted)" />
                      <span>Enrolled: <strong>{(rec.enrolled_count || 0).toLocaleString()}</strong></span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="course-card-skills-section">
                    <div className="course-card-skills-label">Skills Covered in this Course:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {rec.skills.split(',').map((s) => {
                        const trimmed = s.trim();
                        const isGap = rec.matched_gap_skills && rec.matched_gap_skills.includes(trimmed);
                        return (
                          <span
                            key={trimmed}
                            className={isGap ? "tag tag-warning" : "tag tag-brand"}
                            style={{ fontSize: '11px', fontWeight: isGap ? 700 : 500 }}
                          >
                            {isGap ? `🎯 ${trimmed}` : trimmed}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="course-card-footer-row">
                    <div className="course-card-score-pill">
                      <span>Match Quality:</span>
                      <strong style={{ color: matchPercent >= 75 ? 'var(--status-success-text)' : 'var(--color-brand)' }}>
                        {matchPercent >= 80 ? 'Exceptional Fit' : matchPercent >= 65 ? 'High Relevance' : 'Good Fit'}
                      </strong>
                    </div>

                    <a
                      href={rec.course_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      View on Coursera <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}
