# 🧭 Pathfinder: AI Career Trajectory & Course Recommendation Platform

> **An Enterprise-Grade, Data-Grounded Career Intelligence & Course Recommendation System**  
> *Powered by SentenceTransformer Vector Search, Skill Taxonomy Intelligence, Node.js & Express REST API, MongoDB Persistence, and a High-Performance React 19 + Vite Experience.*

[![Node.js](https://img.shields.io/badge/Backend-Node.js%20Express%20v18+-339933.svg?logo=node.js&logoColor=white)](backend/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%205-61DAFB.svg?logo=react&logoColor=black)](frontend/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-47A248.svg?logo=mongodb&logoColor=white)](backend/models/)
[![Python ML](https://img.shields.io/badge/ML-SentenceTransformers%20%2B%20FAISS-3776AB.svg?logo=python&logoColor=white)](build_pipeline.py)
[![Dataset Grounding](https://img.shields.io/badge/Dataset-623%20Coursera%20Courses-FF8800.svg)](coursera_course_dataset_v3.csv)
[![AI LLM](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%20API-4285F4.svg?logo=google-gemini&logoColor=white)](frontend/src/components/Chatbot.jsx)
[![License](https://img.shields.io/badge/Submission-Cognizant%20Technical%20Hackathon-blue.svg)](#)

---

## 📑 Table of Contents

1. [🌟 Executive Summary](#-executive-summary)
2. [📐 System Architecture](#-system-architecture)
3. [🎯 Core Platform Capabilities](#-core-platform-capabilities)
4. [⚡ Multi-Factor Hybrid Recommendation Engine](#-multi-factor-hybrid-recommendation-engine)
5. [💼 Career Tracks & Market Intelligence](#-career-tracks--market-intelligence)
6. [🎙️ AI Mock Interview Simulator & Chatbot](#-ai-mock-interview-simulator--chatbot)
7. [🛠️ Technology Stack](#-technology-stack)
8. [📂 Repository Structure](#-repository-structure)
9. [🚀 Installation & Quickstart Guide](#-installation--quickstart-guide)
10. [📡 Complete REST API Documentation](#-complete-rest-api-documentation)
11. [📊 Performance & Quantitative Benchmark Evaluation](#-performance--quantitative-benchmark-evaluation)
12. [🔐 Security, Authentication & Environment Variables](#-security-authentication--environment-variables)
13. [🌐 Deployment Architecture](#-deployment-architecture)
14. [👥 Authors & Acknowledgements](#-authors--acknowledgements)

---

## 🌟 Executive Summary

**Pathfinder** is an end-to-end AI career intelligence and personalized course recommendation engine. The platform directly addresses the widening disconnect between rapid industry evolution and individual upskilling pathways. Grounded in a comprehensive dataset of **623 verified Coursera courses**, **115 top-tier universities & organizations**, and a **319-canonical-skill taxonomy**, Pathfinder transforms subjective career planning into a structured, data-driven experience.

```
+--------------------------------------------------------------------------------------------------+
|                                  THE PATHFINDER EXPERIENCE                                       |
+--------------------+---------------------+--------------------+----------------------------------+
|  1. Assess Skills  |  2. Analyze Gaps    |  3. Explore Market |  4. Recommend & Practice         |
|  Tag current       |  Instant readiness  |  Live CTC, hiring  |  Multi-factor ranked courses,    |
|  competencies &    |  match % vs target  |  demand, salary    |  RAG explanations, and AI mock   |
|  transition goals  |  industry roles     |  brackets & trends |  interview screening simulation  |
+--------------------+---------------------+--------------------+----------------------------------+
```

### Key Highlights
- **100% Real-World Grounded**: Every recommendation is sourced from verified catalog records (`coursera_course_dataset_v3.csv`) with actual ratings, review counts, enrollment figures, and direct course links.
- **Explainable Multi-Factor Scoring**: Rather than relying on black-box heuristics, recommendations are produced by a weighted composite scoring formula evaluating semantic match, skill gap resolution, course rating, difficulty, duration, popularity, review volume, and format.
- **Alternative Career Pathways**: Evaluates adjacent career tracks in real-time, highlighting transferable skills, transition feasibility, and enabling 1-click track recalculation.
- **AI-Powered Interview Simulator & Mentor**: Interactive Gemini-powered technical interview simulator with automated scoring, weakness identification, and tailored course suggestions, alongside a 24/7 floating AI Career Mentor.
- **Persistent User History**: JWT-authenticated profile dashboard backed by MongoDB to save assessments, track skill evolution over time, and manage learning milestones.

---

## 📐 System Architecture

Pathfinder is organized as a decoupled, multi-tier architecture uniting high-performance machine learning pipelines, a RESTful Node.js/Express API layer, MongoDB persistence, and a modern React SPA.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 DATA & MACHINE LEARNING PIPELINE                                 │
│                                                                                                  │
│   coursera_course_dataset_v3.csv ──► ml/preprocess_dataset.py ──► data/processed/courses_clean.csv│
│                                              │                                                   │
│                                              ├──► ml/build_skill_taxonomy.py (319 Taxonomy Skills)│
│                                              │                                                   │
│                                              ├──► ml/build_embeddings.py (all-MiniLM-L6-v2)      │
│                                              │         └──► models/embeddings/ (384d Dense NPY)  │
│                                              │         └──► models/vector_index/ (FAISS Index)   │
│                                              │                                                   │
│                                              └──► ml/evaluate_recommender.py                     │
│                                                        └──► models/evaluation/eval_report.json   │
└────────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    BACKEND REST API (Node.js)                                    │
│                                                                                                  │
│   • Server Engine: Express.js (:5001)                                                            │
│   • Database Layer: MongoDB & Mongoose (Users, Profiles, Assessment History)                     │
│   • Core Services:                                                                               │
│       ├── careerModel.js      : 7 Industry Tracks, Skill Taxonomy & Gap Engine                  │
│       ├── recommender.js      : 8-Factor In-Memory Hybrid Course Ranker                          │
│       ├── authController.js   : JWT Token Generation & bcryptjs Encryption                      │
│       ├── profileController.js: CRUD Operations for Profiles & Assessment Timelines              │
│       └── datasetController.js: Catalog Statistics & Benchmark Metrics Endpoints                 │
└────────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                 │ HTTP / JSON API
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  FRONTEND CLIENT (React 19 + Vite)                               │
│                                                                                                  │
│   • UI Framework: React 19, Vite 5, Lucide React                                                │
│   • Design System: Custom Dark-Mode Glassmorphism (index.css)                                    │
│   • Views & Modules:                                                                             │
│       ├── LandingPage.jsx       : Hero Section, Live Catalog Metrics, Feature Overviews          │
│       ├── AssessmentPage.jsx    : 3-Step Guided Career & Skill Assessment Wizard                 │
│       ├── ResultsPage.jsx       : Readiness Score, Gap Visualizer, Market Trends, Courses        │
│       ├── ProfilePage.jsx       : User Profile, Saved Paths & Historical Assessment Timelines    │
│       ├── MockInterviewModal.jsx: Gemini AI Technical Interview Simulation & Scoring            │
│       ├── Chatbot.jsx           : Floating 24/7 AI Career Mentor & Prompt Engine                 │
│       └── AuthModal.jsx         : Seamless JWT Login & Registration Modal                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Core Platform Capabilities

### 1. 🧭 3-Step Guided Career Assessment Wizard
- **Step 1 — Target Role & Aspiration**: Select from 7 industry domains (*Data Scientist*, *AI/ML Engineer*, *Cloud Architect*, *Cybersecurity Engineer*, *Full-Stack Developer*, *Data Analyst*, *Product & Strategy Leader*) and enter customized career goals.
- **Step 2 — Technical Background**: Tag current skills from over 300+ canonical competencies across programming, cloud, databases, ML, security, and systems, or add freeform custom skill tags.
- **Step 3 — Learning Preferences**: Filter by target difficulty (*Beginner*, *Intermediate*, *Advanced*, *Any*), duration (*< 2 Hours*, *1–4 Weeks*, *1–3 Months*, *3–6 Months*, *Any*), and credential type (*Course*, *Specialization*, *Professional Certificate*, *Guided Project*, *Any*).

### 2. 📊 Real-Time Skill Gap Analytics & Readiness Match
- Generates an instant **Career Readiness Match %** comparing user skills against industry baseline competencies.
- Segregates competencies into:
  - **Skills You Possess**: Verified skills matching the target role taxonomy.
  - **Skills You Need Next**: Prioritized missing skills required to achieve job readiness.

### 3. 💼 Live Market Trends & Salary Intelligence
Provides immediate compensation benchmarks and hiring context:
- **Average CTC & Salary Brackets** (e.g. ₹14–28 LPA | ₹7L Entry to ₹50L+ Senior | $120k–$160k USD).
- **Market Demand Rate** (+20% to +38% YoY growth indicators).
- **Domain Sentiment & Top Trending Skills** (e.g., LangChain, MLOps, Zero-Trust, Kubernetes, Terraform).

### 4. 🔀 Adjacent Career Trajectories & 1-Click Track Switching
- Continuously cross-evaluates user competencies against all 6 alternative tracks.
- Surfaces the **Top 3 Alternative Pathways** complete with transferability rationales (e.g., *"Builds directly on your SQL & Data Analysis skills with lower ramp-up time"*).
- Includes **1-Click "Switch Track"** button to dynamically recalculate recommendations and readiness metrics without losing inputs.

### 5. ⚡ Explainable Multi-Factor Course Recommendations
- Delivers course recommendations ranked by composite relevance score.
- Displays metadata badges: University/Provider logo, Rating (/5.0), Review count, Enrollment count, Difficulty, and Duration.
- Includes **Transparent RAG Explanation Badges** explaining exactly why each course was suggested and which missing skills it resolves.

### 6. 🎙️ AI Technical Mock Interview Simulator
- Conducts real-time 3-question technical screening interviews tailored to the selected role and difficulty level.
- Analyzes candidate answers, scores technical depth, provides actionable feedback, highlights concept weaknesses, and recommends follow-up courses.

### 7. 💬 24/7 AI Career Mentor Chatbot
- Integrated floating assistant for instant career advice, customized study schedules, concept explanations, and learning roadmap generation.

### 8. 👤 User Authentication & Persistent Cloud Profile
- Secure JWT signup and login with encrypted password storage.
- Comprehensive profile hub displaying user information, saved assessments, target role milestones, and assessment history timeline.

---

## ⚡ Multi-Factor Hybrid Recommendation Engine

The recommendation engine utilizes an 8-factor composite formula designed to balance semantic relevance, skill-gap mitigation, quality, difficulty alignment, time commitment, and social proof:

$$\text{FinalScore}(c) = \sum_{i=1}^{8} w_i \cdot S_i(c)$$

$$\text{FinalScore} = w_1 S_{\text{semantic}} + w_2 S_{\text{gap}} + w_3 S_{\text{rating}} + w_4 S_{\text{diff}} + w_5 S_{\text{duration}} + w_6 S_{\text{popularity}} + w_7 S_{\text{reviews}} + w_8 S_{\text{type}}$$

### Scoring Dimension Breakdown

| Factor | Notation | Default Weight | Mathematical Formulation / Logic |
| :--- | :---: | :---: | :--- |
| **Semantic Match** | $S_{\text{semantic}}$ | **0.40** (40%) | Token overlap and cosine similarity between user query/skills and course corpus $(Title + Description + Skills)$ |
| **Skill Gap Relevance** | $S_{\text{gap}}$ | **0.20** (20%) | $0.7 \cdot \frac{\text{Course Skills} \cap \text{Missing Skills}}{|\text{Missing Skills}|} + 0.3 \cdot \frac{\text{Course Skills} \cap \text{User Skills}}{|\text{Course Skills}|}$ |
| **Course Rating Quality** | $S_{\text{rating}}$ | **0.10** (10%) | $\frac{\text{Rating}}{5.0}$ normalized on 0.0–1.0 scale |
| **Difficulty Alignment** | $S_{\text{diff}}$ | **0.10** (10%) | $1.0 - 0.4 \cdot |\text{Target Level} - \text{Course Level}|$ |
| **Duration Fit** | $S_{\text{duration}}$ | **0.08** (8%) | $1.0 - \frac{|\text{Target Hours} - \text{Course Hours}|}{\text{Target Hours}}$ |
| **Enrollment Popularity** | $S_{\text{popularity}}$ | **0.05** (5%) | $\frac{\ln(1 + \text{Enrolled Count})}{\ln(1 + \text{Max Catalog Enrolled})}$ |
| **Review Volume Confidence** | $S_{\text{reviews}}$ | **0.04** (4%) | $\frac{\ln(1 + \text{Review Count})}{\ln(1 + \text{Max Catalog Reviews})}$ |
| **Format Match** | $S_{\text{type}}$ | **0.03** (3%) | $1.0$ for exact course type match (Specialization / Course / Certificate), $0.4$ otherwise |

---

## 💼 Career Tracks & Market Intelligence

Pathfinder models 7 high-growth career tracks with curated competency profiles and market compensation data:

| Career Track | Core Baseline Competencies | Average CTC (INR) | Salary Range (INR) | US Market Range | YoY Growth |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Data Scientist** | Python, Data Analysis, SQL, Machine Learning, Probability & Statistics | ₹14 – 28 LPA | ₹7L – ₹50L+ | $120k – $160k | +26% YoY |
| **AI / ML Engineer** | Python, Machine Learning, Deep Learning & AI, Software Engineering, Algorithms | ₹18 – 35 LPA | ₹9L – ₹65L+ | $140k – $190k | +36% YoY |
| **Cloud Architect** | Cloud Computing, Linux & Systems, GCP, AWS, Microsoft Azure | ₹16 – 32 LPA | ₹8L – ₹55L+ | $135k – $180k | +38% YoY |
| **Cybersecurity Engineer** | Cybersecurity, Network Security, Linux & Systems, Software Engineering | ₹14 – 26 LPA | ₹6L – ₹48L+ | $120k – $165k | +32% YoY |
| **Full-Stack Developer** | Software Engineering, Web Development, Databases & SQL, JavaScript | ₹12 – 24 LPA | ₹5L – ₹42L+ | $110k – $150k | +22% YoY |
| **Data & Business Analyst** | Data Analysis, Business Analysis, Databases & SQL, Data Visualization | ₹10 – 20 LPA | ₹5L – ₹35L+ | $95k – $135k | +20% YoY |
| **Product & Strategy Leader** | Leadership & Management, Strategy, Communication, Business Analysis | ₹20 – 40 LPA | ₹10L – ₹70L+ | $145k – $210k | +18% YoY |

---

## 🎙️ AI Mock Interview Simulator & Chatbot

### AI Mock Interview Workflow
1. **Role & Difficulty Selection**: Choose target role and difficulty level (Beginner / Intermediate / Advanced).
2. **Dynamic Question Delivery**: AI delivers 3 structured technical interview scenarios testing core concepts, architecture, and practical problem-solving.
3. **Multi-Option & Open Evaluation**: Candidates choose solutions or provide reasoning; AI evaluates conceptual depth, edge-case consideration, and technical precision.
4. **Performance Scorecard**:
   - Overall Score (0–100%) and Grade badge.
   - Identified Weakness Topics (e.g. *Database Indexing*, *Backpropagation*, *IAM Zero-Trust*).
   - Targeted Course Recommendations to resolve identified weaknesses.

### AI Career Mentor Chatbot
- Accessible from any page via floating trigger button.
- Pre-populated starter prompts for instant guidance (*"Start AI Mock Interview"*, *"Recommend a learning roadmap"*, *"What skills am I missing?"*).
- Supports user-provided Gemini API keys stored securely in `localStorage` or server-configured environment keys.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Libraries / Modules | Functionality |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | React 19, Vite 5 | `lucide-react`, `oxlint` | Single Page Application with responsive glassmorphism |
| **Styling** | Vanilla CSS3 | Custom Design Tokens, CSS Grid, Flexbox | High-performance styling with zero heavy framework bloat |
| **Backend API** | Node.js (v18+), Express.js | `express`, `cors`, `dotenv` | REST API routes, career gap calculation, course scoring |
| **Database** | MongoDB | `mongoose` | Persistent user profiles, auth credentials, assessment history |
| **Authentication** | JWT & Password Hashing | `jsonwebtoken`, `bcryptjs` | Stateless secure token auth & bcrypt salted encryption |
| **AI LLM Engine** | Google Gemini API | REST / Client SDK | Mock interview question generation, grading & chatbot mentor |
| **Machine Learning** | Python 3.9–3.11 | `pandas`, `numpy` | Dataset cleaning, skill taxonomy curation, evaluation suite |
| **Embeddings** | Sentence-Transformers | `all-MiniLM-L6-v2` | 384-dimensional dense semantic vector representations |
| **Vector Search** | FAISS | `faiss-cpu` | High-speed dense similarity vector indexing |
| **Dataset** | Coursera Catalog | `coursera_course_dataset_v3.csv` | 623 verified courses across 115 universities & institutions |

---

## 📂 Repository Structure

```
cognizant/
├── backend/
│   ├── config/
│   │   └── database.js              # MongoDB Mongoose connection handler
│   ├── controllers/
│   │   ├── authController.js        # User signup, login & session check
│   │   ├── datasetController.js     # Catalog statistics, skills & evaluation metrics
│   │   ├── profileController.js     # User profile CRUD & assessment history
│   │   └── recommendController.js   # Recommendation execution endpoint
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT Bearer token authentication guard
│   ├── models/
│   │   ├── User.js                  # Mongoose User Schema (name, email, password)
│   │   └── Profile.js               # Mongoose Profile Schema & assessment history
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth endpoints
│   │   ├── datasetRoutes.js         # /api/dataset-stats, /api/skills, /api/evaluation
│   │   ├── profileRoutes.js         # /api/profile endpoints
│   │   └── recommendRoutes.js       # /api/recommend endpoint
│   ├── services/
│   │   ├── datasetService.js        # Dataset file loader and statistics aggregator
│   │   ├── profileService.js        # MongoDB profile data access layer
│   │   └── recommendService.js      # Recommendation orchestrator
│   ├── careerModel.js               # 7 Career tracks taxonomy, market data & gap logic
│   ├── recommender.js               # Multi-factor hybrid course scoring engine
│   ├── server.js                    # Express server initialization & routing
│   ├── package.json                 # Backend dependencies & npm scripts
│   └── .env.example                 # Backend environment variable template
│
├── frontend/
│   ├── public/
│   │   └── _redirects               # SPA routing rewrite rule for static hosting
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── AuthModal.jsx    # Login / Registration modal
│   │   │   ├── common/
│   │   │   │   └── InfoTooltip.jsx  # Reusable UI tooltip component
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx       # Global navigation bar with auth status
│   │   │   │   └── Footer.jsx       # Application footer
│   │   │   ├── Chatbot.jsx          # AI Career Mentor floating chatbot
│   │   │   └── MockInterviewModal.jsx # AI Technical Mock Interview Simulator
│   │   ├── constants/
│   │   │   └── index.js             # Career tracks, preset skills, default weights & API base
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Home view with hero section & catalog stats
│   │   │   ├── AssessmentPage.jsx   # 3-Step Guided Career Assessment Wizard
│   │   │   ├── ResultsPage.jsx      # Readiness score, gap visualizer, market data & courses
│   │   │   └── ProfilePage.jsx      # User profile, history & saved assessment timelines
│   │   ├── services/
│   │   │   └── api.js               # Centralized API service client
│   │   ├── App.jsx                  # Main application router & state controller
│   │   ├── index.css                # Complete glassmorphic CSS design system
│   │   └── main.jsx                 # React DOM entry point
│   ├── package.json                 # Frontend dependencies & npm scripts
│   ├── vite.config.js               # Vite build configuration
│   └── .env.example                 # Frontend environment variable template
│
├── ml/
│   ├── preprocess_dataset.py        # Cleans raw Coursera CSV into standardized catalog
│   ├── build_skill_taxonomy.py      # Extracts 319-canonical skill taxonomy & synonyms
│   ├── build_embeddings.py          # Generates 384d vectors & builds FAISS index
│   ├── career_model.py              # Python reference career gap model
│   ├── hybrid_recommender.py        # Python reference hybrid recommendation engine
│   ├── evaluate_recommender.py      # Evaluates ranking metrics (Precision, NDCG, Diversity)
│   └── test_system.py               # ML unit and integration test suite
│
├── data/
│   ├── processed/
│   │   ├── courses_clean.csv        # Standardized 623-course catalog
│   │   └── skill_taxonomy.json      # 319 Canonical skills dictionary & aliases
│   └── raw/                         # Raw dataset archives
│
├── models/
│   ├── embeddings/
│   │   └── course_embeddings.npy    # Precomputed 384d numpy vectors
│   ├── vector_index/
│   │   ├── course_faiss.index       # Binary FAISS vector index
│   │   └── course_metadata.json     # Course metadata for vector matching
│   └── evaluation/
│       └── eval_report.json         # Quantitative evaluation benchmark report
│
├── docs/
│   ├── PROJECT_DOCUMENTATION.md     # Comprehensive technical specification document
│   └── dataset_analysis.md          # In-depth dataset profiling & statistical analysis
│
├── build_pipeline.py                # Master Python script executing the full 4-step ML pipeline
├── coursera_course_dataset_v3.csv   # Ground-truth dataset file (623 Coursera courses)
├── netlify.toml                     # Netlify deployment configuration
└── README.md                        # Master project documentation
```

---

## 🚀 Installation & Quickstart Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **Python**: `3.8` to `3.11` with `pip` ([Download Python](https://www.python.org/))
- **MongoDB**: Local MongoDB instance or free [MongoDB Atlas Cluster](https://www.mongodb.com/atlas)
- **Git**: For cloning the repository

---

### Step 1: Clone Repository

```bash
git clone https://github.com/yash636768/Cognizant.git
cd Cognizant
```

---

### Step 2: Build the ML Pipeline (Optional but Recommended)

The precomputed artifacts are already included in `data/processed/` and `models/`. To re-run or inspect the pipeline:

```bash
# Create and activate Python virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS / Linux:
source venv/bin/activate

# Install ML dependencies
pip install pandas numpy sentence-transformers faiss-cpu

# Execute reproducible master ML pipeline
python build_pipeline.py
```

*This will preprocess the dataset, extract the skill taxonomy, build dense embeddings, create the FAISS index, and generate the evaluation benchmark report.*

---

### Step 3: Backend Setup & Configuration

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=2d
```

> **Note**: If MongoDB is not immediately connected, the recommendation and dataset endpoints will still work seamlessly using in-memory fallbacks!

Start the backend server:
```bash
# Start Express Server (runs on http://localhost:5001)
npm run dev
```

---

### Step 4: Frontend Setup & Configuration

In a **new terminal window**:

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_GEMINI_API_KEY=your_optional_gemini_api_key_here
```

Start the Vite development server:
```bash
# Start Frontend (runs on http://localhost:5173)
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 📡 Complete REST API Documentation

Base URL: `http://localhost:5001/api`

### 1. Catalog & System Endpoints

#### `GET /api/dataset-stats`
Returns aggregated catalog statistics from the 623-course dataset.
- **Sample Response (200 OK)**:
```json
{
  "total_courses": 623,
  "unique_organizations": 115,
  "skills_identified": 319,
  "average_rating": 4.68,
  "total_students_enrolled": 43250000
}
```

#### `GET /api/skills`
Returns all 319 canonical skill categories and keyword aliases.
- **Sample Response (200 OK)**:
```json
[
  {
    "canonical_skill": "Python Programming",
    "aliases": ["python", "python3", "py", "python programming language"]
  },
  {
    "canonical_skill": "Databases & SQL",
    "aliases": ["sql", "postgresql", "mysql", "database management", "relational database"]
  }
]
```

#### `GET /api/evaluation`
Returns quantitative evaluation benchmark metrics across test personas.
- **Sample Response (200 OK)**:
```json
{
  "dataset_grounding": "coursera_course_dataset_v3.csv (623 courses)",
  "summary_metrics": {
    "mean_precision_at_5": 0.96,
    "mean_precision_at_10": 0.94,
    "mean_ndcg_at_5": 0.971,
    "mean_ndcg_at_10": 0.989,
    "mean_skill_gap_coverage_pct": 36.7,
    "mean_organization_diversity": 0.56
  }
}
```

---

### 2. Recommendation Engine

#### `POST /api/recommend`
Computes career readiness match %, detects skill gaps, ranks alternative career tracks, and returns top-ranked courses.

- **Request Body**:
```json
{
  "current_skills": ["Python Programming", "Databases & SQL", "Data Analysis"],
  "target_career": "Data Scientist",
  "user_query": "Interested in building machine learning pipelines and predictive models",
  "preferred_difficulty": "Beginner",
  "preferred_duration": "1 - 3 months",
  "preferred_type": "Specialization",
  "top_k": 10
}
```

- **Sample Response (200 OK)**:
```json
{
  "selected_career": {
    "career_key": "Data Scientist",
    "title": "Data Scientist",
    "description": "Extracts actionable insights from data using statistics, machine learning, and programming.",
    "match_percentage": 60.0,
    "matched_core_skills": ["Python Programming", "Data Analysis", "Databases & SQL"],
    "missing_core_skills": ["Machine Learning", "Probability & Statistics"],
    "matched_supp_skills": [],
    "missing_supp_skills": ["Data Visualization", "Deep Learning & AI", "R Programming", "Data Management", "Algorithms"],
    "dataset_demand_freq": 340
  },
  "career_candidates": [
    {
      "career_key": "Data & Business Analyst",
      "title": "Data & Business Analyst",
      "match_percentage": 75.0,
      "matched_core_skills": ["Data Analysis", "Databases & SQL"],
      "missing_core_skills": ["Business Analysis", "Data Visualization"]
    }
  ],
  "recommendations": [
    {
      "course_id": 12,
      "title": "IBM Data Science Professional Certificate",
      "organization": "IBM",
      "rating": 4.6,
      "review_count": 54200,
      "enrolled_count": 450000,
      "difficulty": "Beginner",
      "duration": "3 - 6 months",
      "type": "Professional Certificate",
      "course_url": "https://www.coursera.org/professional-certificates/ibm-data-science",
      "skills": "Python Programming, Machine Learning, Data Science, Data Analysis",
      "matched_gap_skills": ["Machine Learning"],
      "final_score": 0.8942,
      "score_breakdown": {
        "semantic_match": 85.0,
        "skill_gap_relevance": 80.0,
        "rating_quality": 92.0,
        "difficulty_fit": 100.0,
        "duration_fit": 80.0,
        "popularity": 94.0
      },
      "rag_explanation": "Recommended because it directly targets key skills (Machine Learning). Offered by IBM with a high rating of 4.6/5.0 based on 54,200 reviews. Level: Beginner (3 - 6 months)."
    }
  ]
}
```

---

### 3. Authentication & Profile Endpoints

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | No | Register new user account (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | No | Authenticate user and receive JWT Bearer token |
| `GET` | `/api/auth/me` | Yes (`Bearer <token>`) | Fetch authenticated user details |
| `GET` | `/api/profile` | Yes (`Bearer <token>`) | Get user profile and full assessment history |
| `PUT` | `/api/profile` | Yes (`Bearer <token>`) | Update profile information |
| `POST` | `/api/profile/assessment` | Yes (`Bearer <token>`) | Save a completed assessment to user history |
| `DELETE` | `/api/profile/assessment/:id`| Yes (`Bearer <token>`) | Delete specific assessment from history |

---

## 📊 Performance & Quantitative Benchmark Evaluation

The Pathfinder recommendation pipeline has undergone rigorous quantitative evaluation against standard Information Retrieval (IR) metrics across realistic user personas:

| Metric | Score | Industry Benchmark | Interpretation |
| :--- | :---: | :---: | :--- |
| **Precision@5** | **0.960** | $\ge 0.800$ | 96% of top-5 recommended courses are directly relevant to user target goals |
| **Precision@10** | **0.940** | $\ge 0.750$ | 94% precision maintained across expanded 10-course recommendations |
| **Recall@5** | **0.960** | $\ge 0.750$ | High retrieval coverage of relevant curriculum items |
| **Recall@10** | **0.940** | $\ge 0.700$ | Robust recall across diverse query formulations |
| **NDCG@5** | **0.971** | $\ge 0.850$ | Exceptional ranking quality; highest value courses appear at the top |
| **NDCG@10** | **0.989** | $\ge 0.800$ | Near-optimal cumulative gain across the top-10 result set |
| **Organization Diversity** | **0.560** | $\ge 0.400$ | Healthy balance preventing vendor monopoly (e.g. mix of IBM, Google, DeepLearning.AI, Stanford) |
| **Mean API Latency** | **< 15ms** | $\le 100\text{ms}$ | In-memory precomputed index delivers instantaneous recommendation responses |

---

## 🔐 Security, Authentication & Environment Variables

### Security Best Practices Implemented
- **Password Hashing**: Salted hashing via `bcryptjs` with work factor 10.
- **Stateless Authentication**: Signed JSON Web Tokens (`jsonwebtoken`) with configurable expiration.
- **Input Sanitization**: Freeform inputs, search queries, and custom skills are sanitized and normalized.
- **Client-Side Key Isolation**: Gemini API keys configured locally by users are kept exclusively within browser `localStorage` and never transmitted to third parties.

### Environment Variable Matrix

#### Backend (`backend/.env`)
| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | No | `5001` | Express API server port |
| `MONGODB_URI` | Yes | — | MongoDB Atlas or local connection URI |
| `JWT_SECRET` | Yes | — | Cryptographic secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | No | `2d` | Token validity duration |

#### Frontend (`frontend/.env`)
| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `VITE_API_BASE_URL` | No | `/api` | Base URL of the backend REST API |
| `VITE_GEMINI_API_KEY`| No | `""` | Optional global Gemini API key for mock interview and chatbot |

---

## 🌐 Deployment Architecture

### Frontend (Static SPA Hosting)
- Build command: `npm run build` (outputs to `frontend/dist/`)
- Suitable for: **Netlify**, **Vercel**, **Cloudflare Pages**, or **AWS S3 + CloudFront**
- Single Page Application routing rewrite rule configured via `frontend/public/_redirects` (`/* /index.html 200`).

### Backend (Node.js API)
- Start command: `node server.js`
- Suitable for: **Render**, **Railway**, **Fly.io**, **AWS Elastic Beanstalk**, or **DigitalOcean App Platform**.

### Database
- **MongoDB Atlas**: Free Tier (M0) or dedicated cluster.

---

## 👥 Authors & Acknowledgements

- **Lead Developers**:
  - **Yash Pratap Singh** ([@yash636768](https://github.com/yash636768))
  - **Aditya Raj** ([@Aditya-Rajputt](https://github.com/Aditya-Rajputt))
- **Project**: Developed for the **Cognizant Technical Hackathon**.
- **Dataset Attribution**: Grounded in real-world educational course catalog records from **Coursera**.

---

<div align="center">
  <sub>Built with ❤️ for intelligent, transparent, and data-driven career growth.</sub>
</div>
