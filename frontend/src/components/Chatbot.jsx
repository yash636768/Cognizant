import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  X,
  Send,
  Key,
  Settings,
  Trash2,
  Minimize2,
  Maximize2,
  RefreshCw,
  Check,
  AlertTriangle,
  User,
  ChevronDown,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

const cleanTokenString = (str) => {
  if (!str) return '';
  // Strip any non-ASCII characters, zero-width spaces, smart quotes, or unprintable chars
  return str.replace(/[^\x20-\x7E]/g, '').trim();
};

const INVALID_DUMMY_KEY = 'AQ.Ab8RN6IzAzxjpHYNObqbKl-ftwPYtNoKttAxtTyi8bVP_mxqhQ';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const GEMINI_STORAGE_KEY = 'pathfinder_gemini_api_key';
const getTimestamp = () => new Date().toLocaleTimeString([], {
  hour: '2-digit',
  minute: '2-digit'
});

// Smart helper to get active API key
const getActiveApiKey = () => {
  const saved = cleanTokenString(localStorage.getItem(GEMINI_STORAGE_KEY));
  if (saved && saved.length > 10 && saved !== INVALID_DUMMY_KEY) {
    return saved;
  }

  const directKey = cleanTokenString(GEMINI_API_KEY);
  if (directKey && directKey.length > 10 && directKey !== INVALID_DUMMY_KEY) {
    return directKey;
  }

  return '';
};

const STARTER_PROMPTS = [
  "🎯 Start AI Mock Interview for my role",
  "Recommend a learning roadmap for my target role",
  "What skills am I missing for Data Science & AI?",
  "How should I structure my study schedule?"
];

const DEFAULT_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-3.6-flash'];

export default function Chatbot({ targetCareer, currentSkills, onOpenInterview }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [apiKey, setApiKey] = useState(() => getActiveApiKey());
  const [tempKey, setTempKey] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [keySavedNotice, setKeySavedNotice] = useState(false);

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'model',
      text: "👋 Hi! I'm **PathFinder AI**, your personal career & learning guide powered by Google Gemini.\n\nAsk me anything about career tracks, skill gaps, course choices, or learning strategies!",
      timestamp: getTimestamp()
    }
  ]);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const cachedModelRef = useRef(null);

  const activeApiKey = getActiveApiKey();

  useEffect(() => {
    if (isOpen && !activeApiKey) {
      setShowKeyConfig(true);
    }
  }, [isOpen, activeApiKey]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, showKeyConfig]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    const cleanKey = cleanTokenString(tempKey);
    if (!cleanKey) return;
    localStorage.setItem(GEMINI_STORAGE_KEY, cleanKey);
    setApiKey(cleanKey);
    setTempKey('');
    setShowKeyConfig(false);
    setKeySavedNotice(true);
    setTimeout(() => setKeySavedNotice(false), 3000);
  };

  const handleClearKey = () => {
    localStorage.removeItem(GEMINI_STORAGE_KEY);
    setApiKey('');
    setTempKey('');
    setShowKeyConfig(true);
  };

  // Helper to build URL & Headers based on key type (Bearer Token vs API Key)
  const getRequestConfig = (key, modelEndpoint) => {
    const cleanKey = cleanTokenString(key);
    const isBearerToken = cleanKey.startsWith('AQ.') || cleanKey.startsWith('ya29.');
    const headers = { 'Content-Type': 'application/json' };
    let url = modelEndpoint
      ? `https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}:generateContent`
      : `https://generativelanguage.googleapis.com/v1beta/models`;

    if (isBearerToken) {
      headers['Authorization'] = `Bearer ${cleanKey}`;
    } else {
      headers['x-goog-api-key'] = cleanKey;
      url += `?key=${encodeURIComponent(cleanKey)}`;
    }

    return { url, headers };
  };

  // Dynamically query available models for the user's key
  const discoverModels = async (key) => {
    try {
      const { url, headers } = getRequestConfig(key, null);
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        const modelList = (data.models || [])
          .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace(/^models\//, ''));

        if (modelList.length > 0) {
          return modelList;
        }
      }
    } catch (err) {
      console.warn("Model discovery notice:", err);
    }
  };

  const callGeminiApi = async (historyMessages, userPrompt) => {
    const keyToUse = getActiveApiKey();
    if (!keyToUse) {
      throw new Error("No Gemini API key configured. Click the key icon above to paste your API Key.");
    }

    // Use cached working model if available for instant responses, otherwise default list
    const candidateModels = cachedModelRef.current
      ? [cachedModelRef.current, ...DEFAULT_MODELS.filter(m => m !== cachedModelRef.current)]
      : DEFAULT_MODELS;

    const systemInstructionText = `You are PathFinder AI, an intelligent, friendly, and expert career guidance advisor embedded in the PathFinder educational recommendation platform.
Your goal is to provide comprehensive, practical, action-oriented, structured advice on skill acquisition, career tracks, online course selection, and learning strategies.
User Context:
- Target Career: ${targetCareer || "Data Scientist & Tech Roles"}
- Current Known Skills: ${currentSkills && currentSkills.length > 0 ? currentSkills.join(", ") : "General beginner skills"}

Guidelines:
1. Format your response cleanly using markdown (bold key points, use bullet lists for steps).
2. Give complete, thorough, detailed answers. Do NOT truncate or cut off mid-sentence.
3. Offer practical next steps or course topic recommendations.`;

    const recentHistory = historyMessages
      .filter(m => m.role === 'user' || m.role === 'model')
      .slice(-8)
      .map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

    recentHistory.push({
      role: 'user',
      parts: [{ text: userPrompt }]
    });

    const isBearer = keyToUse.startsWith('AQ.') || keyToUse.startsWith('ya29.');
    const authStrategies = isBearer
      ? [
          (k) => ({ headers: { 'Authorization': `Bearer ${k}` }, param: '' }),
          (k) => ({ headers: { 'x-goog-api-key': k }, param: '' }),
          (k) => ({ headers: {}, param: `?key=${encodeURIComponent(k)}` })
        ]
      : [
          (k) => ({ headers: { 'x-goog-api-key': k }, param: `?key=${encodeURIComponent(k)}` }),
          (k) => ({ headers: { 'Authorization': `Bearer ${k}` }, param: '' }),
          (k) => ({ headers: {}, param: `?key=${encodeURIComponent(k)}` })
        ];

    let lastError = null;

    for (const model of candidateModels) {
      for (const getAuth of authStrategies) {
        const auth = getAuth(keyToUse);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent${auth.param}`;
        const headers = {
          'Content-Type': 'application/json',
          ...auth.headers
        };

        // 1. Try with systemInstruction (maxOutputTokens: 4096 for full answers)
        try {
          const payload = {
            contents: recentHistory,
            systemInstruction: { parts: [{ text: systemInstructionText }] },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
              topP: 0.95
            }
          };

          const res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const data = await res.json();
            const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              cachedModelRef.current = model; // Cache working model for lightning speed on next calls
              return candidateText;
            }
          }

          // 2. Retry without systemInstruction if 400
          if (res.status === 400) {
            const historyWithMergedSystem = [...recentHistory];
            if (historyWithMergedSystem.length > 0) {
              historyWithMergedSystem[0] = {
                role: 'user',
                parts: [{ text: `[Context: ${systemInstructionText}]\n\n${historyWithMergedSystem[0].parts[0].text}` }]
              };
            }

            const resMerged = await fetch(url, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                contents: historyWithMergedSystem,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 4096,
                  topP: 0.95
                }
              })
            });

            if (resMerged.ok) {
              const dataMerged = await resMerged.json();
              const candidateText = dataMerged.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidateText) {
                cachedModelRef.current = model;
                return candidateText;
              }
            }
          }

          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${res.status}`;
          lastError = new Error(`Model ${model}: ${errMsg}`);
        } catch (err) {
          lastError = err;
        }
      }
    }

    throw lastError || new Error("Failed to connect to Google Gemini API. Please check your token/key.");
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isGenerating) return;

    if (query.includes("Start AI Mock Interview") && onOpenInterview) {
      onOpenInterview();
      return;
    }

    const currentKey = getActiveApiKey();
    if (!currentKey) {
      setShowKeyConfig(true);
      return;
    }

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: getTimestamp()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);

    try {
      const responseText = await callGeminiApi(messages, query);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: responseText,
        timestamp: getTimestamp()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      if (err.message.includes("API key not valid") || err.message.includes("Invalid") || err.message.includes("400") || err.message.includes("403")) {
        localStorage.removeItem(GEMINI_STORAGE_KEY);
        setApiKey('');
        setShowKeyConfig(true);
      }
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `⚠️ **Invalid API Key Error**: ${err.message}.\n\n👉 Please paste your valid key (starts with \`AIzaSy...\`) from [Google AI Studio](https://aistudio.google.com/app/apikey) in the settings box above.`,
        isError: true,
        timestamp: getTimestamp()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        text: "Conversation cleared! How can I assist you with your career goals today?",
        timestamp: getTimestamp()
      }
    ]);
  };

  // Helper to simple-format markdown text
  const renderFormattedText = (content) => {
    if (!content) return null;

    // Split paragraphs
    const paragraphs = content.split('\n\n');

    return paragraphs.map((para, pIdx) => {
      // Lines inside paragraph
      const lines = para.split('\n');

      return (
        <div key={pIdx} style={{ marginBottom: pIdx === paragraphs.length - 1 ? 0 : '8px' }}>
          {lines.map((line, lIdx) => {
            const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
            const cleanLine = isBullet ? line.trim().substring(2) : line;

            // Parse bold (**text**)
            const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
            const parsedElements = parts.map((part, idx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
              }
              return part;
            });

            if (isBullet) {
              return (
                <div key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginLeft: '4px', marginTop: '3px' }}>
                  <span style={{ color: 'var(--primary)', fontSize: '12px', marginTop: '2px' }}>•</span>
                  <span>{parsedElements}</span>
                </div>
              );
            }

            return (
              <span key={lIdx} style={{ display: 'block', marginTop: lIdx > 0 ? '4px' : '0' }}>
                {parsedElements}
              </span>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="pf-chatbot-container">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          className="pf-chatbot-fab"
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          title="Open Pathfinder AI Chatbot"
        >
          <div className="pf-chatbot-fab-icon">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="pf-chatbot-fab-label">AI Advisor</span>
          {apiKey && <span className="pf-chatbot-status-dot" />}
        </button>
      )}

      {/* Main Chat Drawer Window */}
      {isOpen && (
        <div className={`pf-chatbot-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="pf-chatbot-header">
            <div className="pf-chatbot-brand">
              <div className="pf-chatbot-avatar">
                <Bot style={{ width: 18, height: 18, color: '#ffffff' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="pf-chatbot-title">PathFinder AI</span>
                  <span className="pf-chatbot-badge">Gemini</span>
                </div>
                <span className="pf-chatbot-subtitle">
                  {apiKey ? "Ready to advise" : "API Key setup required"}
                </span>
              </div>
            </div>

            <div className="pf-chatbot-actions">
              <button
                className="pf-chatbot-header-btn"
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                title="Gemini API Key Settings"
              >
                <Key style={{ width: 15, height: 15 }} />
              </button>

              <button
                className="pf-chatbot-header-btn"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 style={{ width: 15, height: 15 }} /> : <Minimize2 style={{ width: 15, height: 15 }} />}
              </button>

              <button
                className="pf-chatbot-header-btn"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* API Key Modal / Config Panel Overlay */}
              {showKeyConfig && (
                <div className="pf-chatbot-key-overlay">
                  <div className="pf-chatbot-key-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
                        <Key style={{ width: 16, height: 16, color: 'var(--primary)' }} />
                        <span>Gemini API Key Setup</span>
                      </div>
                      <button
                        onClick={() => setShowKeyConfig(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      >
                        <X style={{ width: 16, height: 16 }} />
                      </button>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
                      Paste your Google Gemini API Key below. Your key stays stored in your browser local storage.
                    </p>

                    <form onSubmit={handleSaveKey}>
                      <input
                        type="password"
                        className="pf-chatbot-key-input"
                        placeholder="Paste AIzaSy... API key"
                        value={tempKey}
                        onChange={(e) => setTempKey(e.target.value)}
                        autoFocus
                      />

                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button type="submit" className="pf-chatbot-btn-primary" style={{ flex: 1 }}>
                          <Check style={{ width: 14, height: 14 }} /> Save API Key
                        </button>
                        {apiKey && (
                          <button
                            type="button"
                            className="pf-chatbot-btn-secondary"
                            onClick={handleClearKey}
                            title="Remove Key"
                          >
                            <Trash2 style={{ width: 14, height: 14, color: 'var(--danger)' }} />
                          </button>
                        )}
                      </div>
                    </form>

                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '11px', color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        Get free Gemini API Key from Google AI Studio <ExternalLink style={{ width: 11, height: 11 }} />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Notice Banner if No API Key */}
              {!apiKey && !showKeyConfig && (
                <div className="pf-chatbot-alert-banner" onClick={() => setShowKeyConfig(true)}>
                  <AlertTriangle style={{ width: 14, height: 14, color: '#d97706' }} />
                  <span>Click to add Gemini API Key & enable AI responses</span>
                </div>
              )}

              {keySavedNotice && (
                <div className="pf-chatbot-success-banner">
                  <Check style={{ width: 14, height: 14 }} /> Gemini API Key saved successfully!
                </div>
              )}

              {/* Messages Body */}
              <div className="pf-chatbot-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`pf-chatbot-msg-row ${msg.role === 'user' ? 'user' : 'model'}`}
                  >
                    {msg.role === 'model' && (
                      <div className="pf-chatbot-msg-avatar">
                        <Bot style={{ width: 14, height: 14, color: '#ffffff' }} />
                      </div>
                    )}

                    <div className={`pf-chatbot-bubble ${msg.role} ${msg.isError ? 'error' : ''}`}>
                      <div className="pf-chatbot-bubble-text">
                        {renderFormattedText(msg.text)}
                      </div>
                      <span className="pf-chatbot-timestamp">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="pf-chatbot-msg-row model">
                    <div className="pf-chatbot-msg-avatar">
                      <Bot style={{ width: 14, height: 14, color: '#ffffff' }} />
                    </div>
                    <div className="pf-chatbot-bubble model loading">
                      <div className="pf-chatbot-typing-dots">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Starter Prompt Chips */}
              {messages.length <= 2 && !isGenerating && (
                <div className="pf-chatbot-starters">
                  {STARTER_PROMPTS.map((promptText, idx) => (
                    <button
                      key={idx}
                      className="pf-chatbot-starter-chip"
                      onClick={() => handleSendMessage(promptText)}
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              )}

              {/* Footer Input Bar */}
              <div className="pf-chatbot-footer">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="pf-chatbot-input-wrap"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    className="pf-chatbot-input"
                    placeholder={apiKey ? "Ask Pathfinder AI..." : "Set API Key first..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isGenerating}
                  />

                  <button
                    type="submit"
                    className="pf-chatbot-send-btn"
                    disabled={!input.trim() || isGenerating}
                    title="Send message"
                  >
                    <Send style={{ width: 15, height: 15 }} />
                  </button>
                </form>

                <div className="pf-chatbot-footer-meta">
                  <span>Context: {targetCareer || "General"}</span>
                  <button
                    onClick={handleClearHistory}
                    className="pf-chatbot-clear-btn"
                    title="Clear Chat History"
                  >
                    <Trash2 style={{ width: 12, height: 12 }} /> Clear chat
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
