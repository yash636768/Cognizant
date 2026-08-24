import React, { useState } from 'react';
import {
  Check,
  AlertCircle,
  Sparkles,
  Info,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Layers,
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
  expandedAnalysis,
  toggleAnalysis,
  onSwitchTrack
}) {
  const selectedTitle = results?.selected_career?.title || "Data Scientist";

  // Find market trends for the current selected role with clean fallback
  const currentMarket = ROLE_MARKET_TRENDS[selectedTitle] || {
    avgCtc: "₹12 - 26 LPA",
    salaryBracket: "₹6L Entry • ₹45L+ Senior",
    usdRange: "$115k - $155k USD",
    demand: "High Demand (+24% YoY)",
    sentiment: "Active Hiring Market",
    trendingSkills: ["Python", "SQL", "Cloud", "Modern Frameworks"]
  };

  // Find candidate careers from backend evaluation
  const allCandidates = results?.career_candidates || [];

  // Filter alternative tracks (different from current selected role)
  const alternativeCandidates = allCandidates.filter(
    c => c.title?.toLowerCase() !== selectedTitle.toLowerCase()
  );

  // Top 3 alternative tracks
  const topThreeAlternatives = alternativeCandidates.slice(0, 3);

  return (
    <div className="animate-fade-in">
      {/* CAREER READINESS PANEL */}
      {results && results.selected_career && (
        <div className="panel" style={{ marginBottom: '24px' }}>
          {/* Header */}
          <div className="panel-header">
            <div>
              <span className="tag tag-brand" style={{ marginBottom: '6px' }}>Your Target Path</span>
              <h2 className="panel-title" style={{ fontSize: '22px' }}>{results.selected_career.title}</h2>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-brand)' }}>
                {results.selected_career.match_percentage}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Skill Match Score</div>
            </div>
          </div>

          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.6 }}>
            {results.selected_career.description}
          </p>

          {/* 1. Skills Possessed vs Skills Needed */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              background: 'var(--bg-app)',
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              marginBottom: '16px'
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--status-success-text)',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Check size={15} /> Skills You Possess ({results.selected_career.matched_core_skills.length})
                <InfoTooltip text="These are skills from your assessment that match the core requirements of this target career track." align="left" />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {results.selected_career.matched_core_skills.length > 0 ? (
                  results.selected_career.matched_core_skills.map(s => (
                    <span key={s} className="tag tag-success">{s}</span>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>None matched yet</span>
                )}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--status-warning-text)',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <AlertCircle size={15} /> What You Need Next ({results.selected_career.missing_core_skills.length})
                <InfoTooltip text="These are the crucial skills currently missing from your profile required to achieve full career readiness for this role." align="right" />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {results.selected_career.missing_core_skills.map(s => (
                  <span key={s} className="tag tag-warning">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 2. MARKET TRENDS & KEY STATS (SIMPLE ONE-LINE STRIP) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              padding: '12px 18px',
              background: 'var(--bg-app)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              fontSize: '13px',
              marginBottom: topThreeAlternatives.length > 0 ? '16px' : '0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Avg CTC:</span>
              <strong style={{ color: 'var(--color-brand)', fontWeight: 700 }}>{currentMarket.avgCtc}</strong>
              <span style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>({currentMarket.salaryBracket})</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Market Demand:</span>
              <span className="tag tag-success" style={{ fontSize: '11px', padding: '2px 8px', fontWeight: 600 }}>
                {currentMarket.demand}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Trending Skills:</span>
              <strong style={{ color: 'var(--text-heading)', fontSize: '12px' }}>
                {currentMarket.trendingSkills.slice(0, 4).join(', ')}
              </strong>
            </div>
          </div>

          {/* 3. TOP 3 RELATED TRACK SUGGESTIONS (WITH ONE-LINE REASONS) */}
          {topThreeAlternatives.length > 0 && onSwitchTrack && (
            <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="var(--color-brand)" />
                Top 3 Alternative Tracks for Your Skills:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                {topThreeAlternatives.map((track) => {
                  const reason = getTrackSuggestionReason(track);
                  return (
                    <div
                      key={track.career_key || track.title}
                      style={{
                        background: 'var(--bg-app)',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-default)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '13px', color: 'var(--text-heading)' }}>
                            {track.title}
                          </strong>
                          <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '2px' }}>
                            {track.matched_core_skills?.length || 0} skills match • {track.missing_core_skills?.length || 0} missing
                          </div>
                        </div>

                        <span
                          className={`tag ${track.match_percentage >= 35 ? 'tag-success' : 'tag-brand'}`}
                          style={{ fontSize: '11px', fontWeight: 700 }}
                        >
                          {track.match_percentage}%
                        </span>
                      </div>

                      {/* One line suggestion why we choose this */}
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        💡 <span style={{ color: 'var(--text-body)' }}>{reason}</span>
                      </p>

                      <button
                        type="button"
                        onClick={() => onSwitchTrack(track.title)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '11px', padding: '4px 8px', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        Switch Track <ArrowRight size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RECOMMENDED COURSES CATALOG */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px'
          }}
        >
          <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-heading)' }}>
            Courses Picked for Your Next Step ({results ? results.recommendations.length : 0})
          </h3>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Grounded on <strong style={{ color: 'var(--text-heading)' }}>coursera_course_dataset_v3.csv</strong>
          </div>
        </div>

        {loading ? (
          <div className="panel" style={{ padding: '52px', textAlign: 'center' }}>
            <Sparkles
              className="animate-spin"
              size={30}
              color="var(--color-brand)"
              style={{ margin: '0 auto 14px' }}
            />
            <div style={{ color: 'var(--text-muted)' }}>
              Calculating vector matches &amp; RAG explanations...
            </div>
          </div>
        ) : results && results.recommendations ? (
          <div>
            {results.recommendations.map((rec) => (
              <div key={rec.course_id} className="course-card">
                <div className="course-header">
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}
                    >
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
                        <span
                          key={trimmed}
                          className={isGap ? "tag tag-warning" : "tag tag-brand"}
                          style={{ fontSize: '11px' }}
                        >
                          {isGap ? `🎯 ${trimmed}` : trimmed}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border-default)'
                  }}
                >
                  <button
                    type="button"
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
                  <div
                    style={{
                      marginTop: '14px',
                      background: 'var(--bg-app)',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-default)',
                      fontSize: '13px',
                      color: 'var(--text-body)'
                    }}
                  >
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
  );
}
