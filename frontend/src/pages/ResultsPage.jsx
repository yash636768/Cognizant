import React from 'react';
import {
  Check,
  AlertCircle,
  Sparkles,
  Info,
  ExternalLink
} from 'lucide-react';

export default function ResultsPage({
  results,
  loading,
  expandedAnalysis,
  toggleAnalysis
}) {
  return (
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

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              background: 'var(--bg-app)',
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)'
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
