import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AuthModal from './components/auth/AuthModal';
import LandingPage from './pages/LandingPage';
import AssessmentPage from './pages/AssessmentPage';
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';
import MockInterviewModal from './components/MockInterviewModal';
import Chatbot from './components/Chatbot';
import { DEFAULT_WEIGHTS } from './constants';
import {
  fetchDatasetStats,
  fetchCurrentUser as apiFetchCurrentUser,
  loginUser,
  registerUser,
  fetchRecommendations
} from './services/api';

export default function App() {
  // Navigation & View State
  const [page, setPage] = useState('landing'); // 'landing' | 'input' | 'results' | 'profile'
  const [stats, setStats] = useState(null);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);

  // Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pathfinder_token') || '');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Assessment Wizard State
  const [assessmentStep, setAssessmentStep] = useState(1);
  const [currentSkills, setCurrentSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [targetCareer, setTargetCareer] = useState("Data Scientist");
  const [userQuery, setUserQuery] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("Any");
  const [courseType, setCourseType] = useState("Any");

  // Scoring Weights Priorities
  const [showTuner, setShowTuner] = useState(false);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);

  // Execution & Recommendation Results
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [expandedAnalysis, setExpandedAnalysis] = useState({});

  useEffect(() => {
    loadStats();
    if (token) {
      loadCurrentUser(token);
    }
  }, []);

  const loadStats = async () => {
    try {
      const data = await fetchDatasetStats();
      setStats(data);
    } catch (e) {
      console.error("Stats API error:", e);
    }
  };

  const loadCurrentUser = async (authToken) => {
    try {
      const data = await apiFetchCurrentUser(authToken);
      setCurrentUser(data.user);
    } catch (e) {
      console.error("Auth verify error:", e);
      localStorage.removeItem('pathfinder_token');
      setToken('');
      setCurrentUser(null);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const data = authTab === 'login'
        ? await loginUser(authForm.email, authForm.password)
        : await registerUser(authForm.name, authForm.email, authForm.password);

      localStorage.setItem('pathfinder_token', data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      setAuthModalOpen(false);
      setAuthForm({ name: '', email: '', password: '' });
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pathfinder_token');
    setToken('');
    setCurrentUser(null);
    setCurrentSkills([]);
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
      const data = await fetchRecommendations({
        current_skills: currentSkills,
        target_career: targetCareer,
        user_query: userQuery,
        preferred_difficulty: difficulty,
        preferred_duration: duration,
        preferred_type: courseType,
        custom_weights: weights,
        top_k: 10
      });
      setResults(data);
    } catch (e) {
      console.error("Recommend error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecommendationsFromInterview = async (selectedRole, weakTopics = []) => {
    let roleToUse = targetCareer;
    if (selectedRole) {
      roleToUse = selectedRole;
      setTargetCareer(selectedRole);
    }
    setIsInterviewOpen(false);
    setLoading(true);
    setPage('results');

    let queryText = userQuery;
    if (weakTopics && weakTopics.length > 0) {
      queryText = `Focus on missing skills: ${weakTopics.join(', ')}`;
      setUserQuery(queryText);
    }

    try {
      const data = await fetchRecommendations({
        current_skills: currentSkills,
        target_career: roleToUse,
        user_query: queryText,
        preferred_difficulty: difficulty,
        preferred_duration: duration,
        preferred_type: courseType,
        custom_weights: weights,
        top_k: 10
      });
      setResults(data);
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
      {/* Top Navigation */}
      <Navbar
        page={page}
        setPage={setPage}
        currentUser={currentUser}
        navigateToAssessment={navigateToAssessment}
        setIsInterviewOpen={setIsInterviewOpen}
        onOpenAuthModal={() => {
          setAuthError('');
          setAuthModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="container section">
        {page === 'profile' && currentUser && (
          <ProfilePage
            currentUser={currentUser}
            targetCareer={targetCareer}
            results={results}
            currentSkills={currentSkills}
            difficulty={difficulty}
            duration={duration}
            courseType={courseType}
            userQuery={userQuery}
            handleRemoveSkill={handleRemoveSkill}
            navigateToAssessment={navigateToAssessment}
            handleLogout={handleLogout}
            setPage={setPage}
          />
        )}

        {page === 'landing' && (
          <LandingPage
            stats={stats}
            navigateToAssessment={navigateToAssessment}
            setPage={setPage}
            handleSelectCareerFromLanding={handleSelectCareerFromLanding}
          />
        )}

        {page === 'input' && (
          <AssessmentPage
            currentUser={currentUser}
            assessmentStep={assessmentStep}
            setAssessmentStep={setAssessmentStep}
            targetCareer={targetCareer}
            setTargetCareer={setTargetCareer}
            userQuery={userQuery}
            setUserQuery={setUserQuery}
            currentSkills={currentSkills}
            skillInput={skillInput}
            setSkillInput={setSkillInput}
            handleAddSkill={handleAddSkill}
            handleRemoveSkill={handleRemoveSkill}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            duration={duration}
            setDuration={setDuration}
            showTuner={showTuner}
            setShowTuner={setShowTuner}
            weights={weights}
            setWeights={setWeights}
            handleRunAdvisor={handleRunAdvisor}
            setPage={setPage}
            onOpenAuthModal={() => {
              setAuthError('');
              setAuthModalOpen(true);
            }}
          />
        )}

        {page === 'results' && (
          <ResultsPage
            results={results}
            loading={loading}
            expandedAnalysis={expandedAnalysis}
            toggleAnalysis={toggleAnalysis}
          />
        )}
      </main>

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        authTab={authTab}
        setAuthTab={setAuthTab}
        authForm={authForm}
        setAuthForm={setAuthForm}
        authError={authError}
        setAuthError={setAuthError}
        authLoading={authLoading}
        handleAuthSubmit={handleAuthSubmit}
      />

      {/* Footer */}
      <Footer
        setPage={setPage}
        navigateToAssessment={navigateToAssessment}
      />

      {/* Floating Pathfinder AI Chatbot */}
      <Chatbot
        targetCareer={targetCareer}
        currentSkills={currentSkills}
        onOpenInterview={() => setIsInterviewOpen(true)}
      />

      {/* AI Technical Mock Interview & Skill Verifier Overlay Modal */}
      <MockInterviewModal
        targetCareer={targetCareer}
        currentSkills={currentSkills}
        isOpen={isInterviewOpen}
        onClose={() => setIsInterviewOpen(false)}
        onViewRecommendations={handleViewRecommendationsFromInterview}
      />
    </div>
  );
}
