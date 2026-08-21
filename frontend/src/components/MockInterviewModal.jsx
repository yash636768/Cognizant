import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Award,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Zap,
  BrainCircuit,
  HelpCircle,
  XCircle
} from 'lucide-react';

const cleanTokenString = (str) => {
  if (!str) return '';
  return str.replace(/[^\x20-\x7E]/g, '').trim();
};

const INVALID_DUMMY_KEY = 'AQ.Ab8RN6IzAzxjpHYNObqbKl-ftwPYtNoKttAxtTyi8bVP_mxqhQ';

const getActiveApiKey = () => {
  const saved = localStorage.getItem('pathfinder_gemini_api_key');
  const cleanSaved = cleanTokenString(saved);
  if (cleanSaved && cleanSaved.length > 10 && cleanSaved !== INVALID_DUMMY_KEY) return cleanSaved;
  return '';
};

const CAREER_OPTIONS = [
  "Data Scientist",
  "AI / Machine Learning Engineer",
  "Cloud Solutions Architect",
  "Cybersecurity Engineer",
  "Full-Stack Web Developer",
  "Data & Business Analyst"
];

export default function MockInterviewModal({ targetCareer, currentSkills, isOpen, onClose, onViewRecommendations }) {
  const [step, setStep] = useState('intro'); // 'intro' | 'loading' | 'question' | 'feedback' | 'results'
  const [targetRole, setTargetRole] = useState(targetCareer || "Data Scientist");
  const [difficulty, setDifficulty] = useState("Intermediate");

  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [lastEvalResult, setLastEvalResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (targetCareer) {
      setTargetRole(targetCareer);
    }
  }, [targetCareer]);

  if (!isOpen) return null;

  const handleFinishInterview = () => {
    const weakTopics = evaluations
      .filter(e => !e.isCorrect)
      .map(e => e.topic);

    if (onViewRecommendations) {
      onViewRecommendations(targetRole, weakTopics);
    } else {
      onClose();
    }
  };

  const handleReset = () => {
    setStep('intro');
    setQuestions([]);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setEvaluations([]);
    setLastEvalResult(null);
    setErrorMessage('');
  };

  const callGeminiApi = async (promptText) => {
    const rawKey = getActiveApiKey();
    if (!rawKey) {
      throw new Error("No Gemini API key found. Please paste your valid API Key in the PathFinder AI Chatbot settings first.");
    }

    const apiKey = cleanTokenString(rawKey);
    const isBearer = apiKey.startsWith('AQ.') || apiKey.startsWith('ya29.');

    const authStrategies = isBearer
      ? [
          (k) => ({ headers: { 'Authorization': `Bearer ${k}` }, param: '' }),
          (k) => ({ headers: {}, param: `?key=${encodeURIComponent(k)}` })
        ]
      : [
          (k) => ({ headers: {}, param: `?key=${encodeURIComponent(k)}` }),
          (k) => ({ headers: { 'x-goog-api-key': k }, param: '' }),
          (k) => ({ headers: { 'Authorization': `Bearer ${k}` }, param: '' })
        ];

    const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-3.6-flash'];
    let lastErr = null;

    for (const model of models) {
      for (const getAuth of authStrategies) {
        const auth = getAuth(apiKey);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent${auth.param}`;
        const headers = { 'Content-Type': 'application/json', ...auth.headers };

        try {
          const res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: promptText }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 2500 }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;
          }

          const errData = await res.json().catch(() => ({}));
          lastErr = new Error(errData.error?.message || `HTTP ${res.status}`);
        } catch (err) {
          lastErr = err;
        }
      }
    }

    throw lastErr || new Error("Failed to connect to Gemini API.");
  };

  const handleStartInterview = async () => {
    setStep('loading');
    setErrorMessage('');

    const knownSkillsStr = currentSkills && currentSkills.length > 0 ? currentSkills.join(', ') : "general tech skills";
    const prompt = `Generate exactly 5 technical Multiple Choice Questions (MCQs) for a '${targetRole}' candidate at '${difficulty}' difficulty.
Candidate known skills: ${knownSkillsStr}.

Format your response strictly as valid JSON with NO extra markdown or comments:
{
  "questions": [
    {
      "id": 1,
      "topic": "Topic Name",
      "question": "Clear scenario technical MCQ question text...",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctOption": "B",
      "explanation": "Detailed explanation of why Option B is correct."
    },
    {
      "id": 2,
      "topic": "Topic Name",
      "question": "Clear scenario technical MCQ question text...",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctOption": "A",
      "explanation": "Detailed explanation of why Option A is correct."
    },
    {
      "id": 3,
      "topic": "Topic Name",
      "question": "Clear scenario technical MCQ question text...",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctOption": "C",
      "explanation": "Detailed explanation of why Option C is correct."
    },
    {
      "id": 4,
      "topic": "Topic Name",
      "question": "Clear scenario technical MCQ question text...",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctOption": "D",
      "explanation": "Detailed explanation of why Option D is correct."
    },
    {
      "id": 5,
      "topic": "Topic Name",
      "question": "Clear scenario technical MCQ question text...",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctOption": "B",
      "explanation": "Detailed explanation of why Option B is correct."
    }
  ]
}`;

    try {
      const responseText = await callGeminiApi(prompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const cleanJsonStr = jsonMatch[0].replace(/\/\/.*$/gm, '');
          const parsed = JSON.parse(cleanJsonStr);
          if (parsed.questions && parsed.questions.length >= 5) {
            setQuestions(parsed.questions.slice(0, 5));
            setCurrentQIndex(0);
            setSelectedOption(null);
            setEvaluations([]);
            setLastEvalResult(null);
            setStep('question');
            return;
          } else if (parsed.questions && parsed.questions.length >= 3) {
            setQuestions(parsed.questions);
            setCurrentQIndex(0);
            setSelectedOption(null);
            setEvaluations([]);
            setLastEvalResult(null);
            setStep('question');
            return;
          }
        } catch (e) {
          console.warn("MCQ JSON parse error:", e);
        }
      }

      // Fallback 5 MCQ Questions
      setQuestions([
        {
          id: 1,
          topic: `${targetRole} Optimization`,
          question: `Which technique is most effective to optimize query execution and search latency in production ${targetRole} systems?`,
          options: {
            "A": "Increase global application log levels",
            "B": "Apply database indexing or vector search quantization",
            "C": "Convert all numeric data types to strings",
            "D": "Disable request connection timeouts"
          },
          correctOption: "B",
          explanation: "Indexing and quantization dramatically reduce lookup complexity from O(N) to O(log N) in production systems."
        },
        {
          id: 2,
          topic: "Model Evaluation & Metrics",
          question: "Which metric is preferred over raw Accuracy when evaluating models on imbalanced datasets?",
          options: {
            "A": "Precision-Recall AUC (PR-AUC)",
            "B": "Mean Absolute Error (MAE)",
            "C": "R-Squared Score (R2)",
            "D": "Total Epoch Count"
          },
          correctOption: "A",
          explanation: "PR-AUC accurately measures performance on minority positive classes without being inflated by negative class dominance."
        },
        {
          id: 3,
          topic: "Architecture & Reliability",
          question: "How do you ensure zero-downtime deployment for high-throughput API microservices?",
          options: {
            "A": "Drop the database before deployment",
            "B": "Use Blue/Green or Canary deployment strategies",
            "C": "Restart all active server nodes simultaneously",
            "D": "Disable SSL certificates during updates"
          },
          correctOption: "B",
          explanation: "Blue/Green and Canary deployments route live traffic incrementally while keeping active nodes running."
        },
        {
          id: 4,
          topic: "Data Pipeline Scalability",
          question: "What is the primary benefit of data partitioning in distributed processing frameworks like Apache Spark?",
          options: {
            "A": "Prevents memory leaks in Python",
            "B": "Enables parallel task execution across cluster nodes",
            "C": "Compresses JSON files into ZIP archives",
            "D": "Encrypts data at rest automatically"
          },
          correctOption: "B",
          explanation: "Partitioning splits datasets into independent subsets, enabling parallel worker node processing."
        },
        {
          id: 5,
          topic: "Production Monitoring",
          question: "What is the most effective metric to detect Data Drift in deployed machine learning models?",
          options: {
            "A": "CPU Fan Speed",
            "B": "Kolmogorov-Smirnov (KS) test or Population Stability Index (PSI)",
            "C": "Git Commit Count",
            "D": "HTTP Response Status Code 200 Ratio"
          },
          correctOption: "B",
          explanation: "KS-Test and PSI compare production input distributions against baseline training distributions to catch statistical drift."
        }
      ]);
      setCurrentQIndex(0);
      setSelectedOption(null);
      setEvaluations([]);
      setLastEvalResult(null);
      setStep('question');
    } catch (err) {
      setErrorMessage(err.message || "Failed to generate MCQ interview questions.");
      setStep('intro');
    }
  };

  const handleSelectOption = (optionKey) => {
    setSelectedOption(optionKey);
  };

  const handleSubmitMcqAnswer = () => {
    if (!selectedOption) return;

    const currentQ = questions[currentQIndex];
    const isCorrect = selectedOption === currentQ.correctOption;

    const evalResult = {
      questionId: currentQ.id,
      topic: currentQ.topic,
      question: currentQ.question,
      selectedOption,
      selectedText: currentQ.options[selectedOption],
      correctOption: currentQ.correctOption,
      correctText: currentQ.options[currentQ.correctOption],
      isCorrect,
      score: isCorrect ? 10 : 0,
      explanation: currentQ.explanation || (isCorrect ? "Correct choice!" : `Option ${currentQ.correctOption} is the correct technical choice.`)
    };

    setEvaluations(prev => [...prev, evalResult]);
    setLastEvalResult(evalResult);
    setStep('feedback');
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setLastEvalResult(null);
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(prev => prev + 1);
      setStep('question');
    } else {
      setStep('results');
    }
  };

  // Calculate Correct Answers count
  const correctCount = evaluations.filter(e => e.isCorrect).length;
  const overallPercent = evaluations.length > 0 ? Math.round((correctCount / evaluations.length) * 100) : 0;

  return (
    <div className="pf-interview-overlay">
      <div className="pf-interview-card">
        {/* Header */}
        <div className="pf-interview-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="pf-interview-icon-wrap">
              <BrainCircuit style={{ width: 22, height: 22, color: '#ffffff' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#1e293b' }}>AI Technical MCQ Assessment (5 Questions)</h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Powered by Google Gemini</span>
            </div>
          </div>
          <button onClick={onClose} className="pf-interview-close-btn">
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="pf-interview-error-alert">
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: INTRO */}
        {step === 'intro' && (
          <div className="pf-interview-body">
            <div className="pf-interview-hero-banner">
              <Sparkles style={{ width: 28, height: 28, color: '#6366f1' }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#1e1b4b' }}>5-Question Technical MCQ Assessment</h4>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475569' }}>
                  Gemini AI will generate 5 dynamic Multiple Choice Questions (MCQs) to evaluate your technical readiness.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>Target Career Track</label>
              <select
                className="input"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
              >
                {CAREER_OPTIONS.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '14px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>Difficulty Level</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                {['Beginner', 'Intermediate', 'Senior'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    className={`pf-interview-diff-btn ${difficulty === lvl ? 'active' : ''}`}
                    onClick={() => setDifficulty(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
              <button type="button" onClick={handleStartInterview} className="btn btn-primary">
                <Sparkles style={{ width: 16, height: 16 }} /> Begin 5-Question MCQ Test
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LOADING */}
        {step === 'loading' && (
          <div className="pf-interview-body" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <RefreshCw className="pf-interview-spin" style={{ width: 36, height: 36, color: '#6366f1', margin: '0 auto 16px' }} />
            <h4 style={{ fontSize: '16px', color: '#1e293b' }}>Generating 5 Technical MCQs...</h4>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Crafting scenario questions for {targetRole} ({difficulty} Level)</p>
          </div>
        )}

        {/* STEP 3: MCQ QUESTION FLOW */}
        {step === 'question' && questions[currentQIndex] && (
          <div className="pf-interview-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="pf-interview-badge">
                Question {currentQIndex + 1} of {questions.length}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#6366f1' }}>
                Topic: {questions[currentQIndex].topic}
              </span>
            </div>

            <div className="pf-interview-qbox" style={{ marginBottom: '18px' }}>
              <HelpCircle style={{ width: 20, height: 20, color: '#6366f1', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: '#0f172a', fontWeight: 600 }}>
                {questions[currentQIndex].question}
              </p>
            </div>

            {/* 4 Clickable Option Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(questions[currentQIndex].options || {}).map(([key, text]) => {
                const isSelected = selectedOption === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectOption(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: `2px solid ${isSelected ? '#6366f1' : '#e2e8f0'}`,
                      background: isSelected ? '#eef2ff' : '#ffffff',
                      color: isSelected ? '#4338ca' : '#1e293b',
                      fontSize: '13px',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: isSelected ? '#6366f1' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {key}
                    </span>
                    <span>{text}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Select 1 option to submit.</span>
              <button
                type="button"
                onClick={handleSubmitMcqAnswer}
                disabled={!selectedOption}
                className="btn btn-primary"
              >
                Submit MCQ Answer <Send style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3.5: LIVE MCQ FEEDBACK */}
        {step === 'feedback' && lastEvalResult && (
          <div className="pf-interview-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="pf-interview-badge">
                Question {currentQIndex + 1} of {questions.length} Evaluation
              </span>
              <span className={`pf-interview-score-chip ${lastEvalResult.isCorrect ? 'high' : 'low'}`} style={{ fontSize: '14px', padding: '4px 12px' }}>
                {lastEvalResult.isCorrect ? "Correct (+10 pts)" : "Incorrect (0 pts)"}
              </span>
            </div>

            <div className="pf-interview-eval-card" style={{ padding: '18px', borderRadius: '16px', background: lastEvalResult.isCorrect ? '#f0fdf4' : '#fef2f2', border: `1.5px solid ${lastEvalResult.isCorrect ? '#bbf7d0' : '#fecaca'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                {lastEvalResult.isCorrect ? (
                  <CheckCircle style={{ width: 22, height: 22, color: '#16a34a' }} />
                ) : (
                  <XCircle style={{ width: 22, height: 22, color: '#dc2626' }} />
                )}
                <h4 style={{ margin: 0, fontSize: '16px', color: lastEvalResult.isCorrect ? '#14532d' : '#7f1d1d' }}>
                  {lastEvalResult.isCorrect ? "Spot on! That's correct." : `Incorrect. Correct Answer: Option ${lastEvalResult.correctOption}`}
                </h4>
              </div>

              <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                <p style={{ margin: '0 0 8px' }}>
                  <strong>Your Choice:</strong> Option {lastEvalResult.selectedOption} — {lastEvalResult.selectedText}
                </p>

                {!lastEvalResult.isCorrect && (
                  <p style={{ margin: '0 0 10px', color: '#15803d' }}>
                    <strong>Correct Option:</strong> Option {lastEvalResult.correctOption} — {lastEvalResult.correctText}
                  </p>
                )}

                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '10px', marginTop: '10px' }}>
                  <strong style={{ color: '#1e293b' }}>AI Technical Explanation:</strong>
                  <p style={{ margin: '4px 0 0', color: '#475569' }}>{lastEvalResult.explanation}</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={handleNextQuestion} className="btn btn-primary">
                {currentQIndex + 1 < questions.length ? (
                  <>Next MCQ Question ({currentQIndex + 2}/{questions.length}) <ArrowRight style={{ width: 14, height: 14 }} /></>
                ) : (
                  <>View Scorecard <Award style={{ width: 14, height: 14 }} /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: FINAL SCORECARD */}
        {step === 'results' && (
          <div className="pf-interview-body">
            <div className="pf-interview-score-header">
              <div className="pf-interview-score-circle">
                <span className="pf-interview-score-val">{correctCount}/{questions.length}</span>
                <span className="pf-interview-score-sub">Correct</span>
              </div>

              <div>
                <h4 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>5-MCQ Assessment Completed!</h4>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475569' }}>
                  Target Track: <strong>{targetRole}</strong> ({difficulty}) — <strong>{overallPercent}% Score</strong>
                </p>
                <div style={{ marginTop: '8px' }}>
                  {overallPercent >= 80 ? (
                    <span className="pf-interview-status-tag ready"><CheckCircle style={{ width: 14, height: 14 }} /> High MCQ Technical Readiness</span>
                  ) : overallPercent >= 60 ? (
                    <span className="pf-interview-status-tag moderate"><Zap style={{ width: 14, height: 14 }} /> Solid Knowledge — Minor Gaps</span>
                  ) : (
                    <span className="pf-interview-status-tag needs-work"><AlertCircle style={{ width: 14, height: 14 }} /> Course Study Recommended</span>
                  )}
                </div>
              </div>
            </div>

            {/* MCQ Breakdown */}
            <div className="pf-interview-results-list">
              <h5 style={{ margin: '16px 0 10px', fontSize: '14px', color: '#334155' }}>MCQ Question Breakdown (5 Questions)</h5>
              {evaluations.map((ev, idx) => (
                <div key={idx} className="pf-interview-eval-card" style={{ borderLeft: `4px solid ${ev.isCorrect ? '#16a34a' : '#dc2626'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px', color: '#1e293b' }}>Q{idx + 1}: {ev.topic}</strong>
                    <span className={`pf-interview-score-chip ${ev.isCorrect ? 'high' : 'low'}`}>
                      {ev.isCorrect ? "Correct (10/10)" : "Incorrect (0/10)"}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 4px' }}>{ev.question}</p>
                  <p style={{ fontSize: '11px', color: ev.isCorrect ? '#15803d' : '#b91c1c', margin: 0 }}>
                    <strong>Choice:</strong> Option {ev.selectedOption} ({ev.selectedText})
                  </p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" onClick={handleReset} className="btn btn-secondary">
                <RefreshCw style={{ width: 14, height: 14 }} /> Retake Assessment
              </button>
              <button type="button" onClick={handleFinishInterview} className="btn btn-primary">
                Done & View Recommendations <ArrowRight style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
