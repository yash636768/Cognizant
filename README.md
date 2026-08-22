# Pathfinder 🚀

> **Data-Grounded Career Trajectory & Course Recommendation Engine**  
> *Powered by SentenceTransformer Dense Vector Search, FAISS 384d Indexing, Skill Taxonomy Intelligence, Node.js Express REST Backend, React 18 UI, AI Mock Interviews, and Gemini Career Chatbot.*

[![Node.js Backend](https://img.shields.io/badge/Backend-Node.js%20Express-green.svg)](file:///d:/cognizant/backend)
[![React Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb.svg)](file:///d:/cognizant/frontend)
[![Python ML Engine](https://img.shields.io/badge/ML-SentenceTransformers%20%2B%20FAISS-blue.svg)](file:///d:/cognizant/build_pipeline.py)
[![Dataset Grounding](https://img.shields.io/badge/Dataset-623%20Coursera%20Courses-orange.svg)](file:///d:/cognizant/coursera_course_dataset_v3.csv)
[![Full Documentation](https://img.shields.io/badge/Docs-PROJECT__DOCUMENTATION.md-purple.svg)](file:///d:/cognizant/docs/PROJECT_DOCUMENTATION.md)

---

## 📖 Complete Documentation
For in-depth mathematical formulations, dataset profiling, extended API specifications, and benchmark methodology, refer to:
- [docs/PROJECT_DOCUMENTATION.md](file:///d:/cognizant/docs/PROJECT_DOCUMENTATION.md)
- [docs/dataset_analysis.md](file:///d:/cognizant/docs/dataset_analysis.md)

---

## 🌟 Executive Overview

**Pathfinder** is an end-to-end AI career planning and course recommendation system strictly grounded on real-world data from [`coursera_course_dataset_v3.csv`](file:///d:/cognizant/coursera_course_dataset_v3.csv). The platform analyzes 623 Coursera courses across 115 educational institutions and 319 canonical skills to help learners assess technical readiness, detect skill gaps across 7 high-demand career tracks, practice AI mock interviews, and receive personalized course recommendations with transparent **Retrieval-Augmented Generation (RAG)** explanations.

---

## 🏛️ System Architecture

```
                       +-----------------------------------+
                       |  coursera_course_dataset_v3.csv   |
                       |    (623 Courses, 12 Attributes)   |
                       +-----------------+-----------------+
                                         |
                                         v
                       +-----------------+-----------------+
                       |    build_pipeline.py (ML Setup)   |
                       | 1. Preprocess & Clean Dataset     |
                       | 2. Extract Skill Taxonomy (319)   |
                       | 3. SentenceTransformers + FAISS   |
                       | 4. Quantitative Model Evaluation  |
                       +-----------------+-----------------+
                                         |
                                         v
                       +-----------------+-----------------+
                       | Node.js Express REST API (:5001)  |
                       | - Auth (Register, Login, Token)   |
                       | - User Profile & Assessments Log  |
                       | - Dataset Stats & Skill Taxonomy  |
                       | - Hybrid Recommender (ML Bridge)  |
                       +-----------------+-----------------+
                                         |
                                         v
                       +-----------------+-----------------+
                       |   React 18 + Vite UI (:5173)      |
                       | - 3-Step Skill Assessment Wizard  |
                       | - Dynamic Weight Priority Tuner   |
                       | - Interactive AI Mock Interview   |
                       | - Floating Pathfinder AI Chatbot  |
                       | - User Profile & History Tracking |
                       | - Benchmark Evaluation Dashboard  |
                       +-----------------------------------+
```

---

## 📊 Dataset Grounding & Profiling

All recommendations and skill mappings originate from [`coursera_course_dataset_v3.csv`](file:///d:/cognizant/coursera_course_dataset_v3.csv):

| Metric / Dimension | Value | Details |
| :--- | :--- | :--- |
| **Total Courses** | `623` | Cleaned and indexed Coursera catalog records |
| **Attributes** | `12` | Title, Organization, Skills, Ratings, URL, Enrolled, Description, Reviews, Difficulty, Type, Duration |
| **Educational Providers** | `115` | IBM, Google, Google Cloud, DeepLearning.AI, University of Pennsylvania, Johns Hopkins, Duke, etc. |
| **Extracted Skill Mentions** | `7,306` | Mapped and consolidated into 319 canonical skills with synonyms/aliases |
| **Average Rating** | `4.64 / 5.0` | Range from 2.8 to 5.0 (Median: 4.7) |
| **Difficulty Breakdown** | - | Beginner (66.3%), Intermediate (24.6%), Mixed (6.3%), Advanced (2.9%) |
| **Course Types** | - | Course (48.0%), Specialization (35.8%), Professional Certificate (13.0%), Guided Project (3.0%), Project (0.2%) |
| **Duration Ranges** | - | 3–6 Months (44.5%), 1–3 Months (30.3%), 1–4 Weeks (22.0%), Less Than 2 Hours (3.2%) |

---

## 🎯 Key Capabilities & Features

### 1. 🧭 Career Readiness & Skill Gap Matching
Evaluates user skills against **7 predefined career tracks**:
1. **Data Scientist** (Core: *Python Programming*, *Data Analysis*, *Databases & SQL*, *Machine Learning*, *Probability & Statistics*)
2. **AI / Machine Learning Engineer** (Core: *Python Programming*, *Machine Learning*, *Deep Learning & AI*, *Software Engineering & Programming*, *Algorithms*)
3. **Cloud Solutions Architect** (Core: *Cloud Computing*, *Linux & Systems*, *Google Cloud Platform (GCP)*, *Amazon Web Services (AWS)*, *Microsoft Azure*)
4. **Cybersecurity Engineer** (Core: *Cybersecurity & Network Security*, *Linux & Systems*, *Software Engineering & Programming*)
5. **Full-Stack Web Developer** (Core: *Software Engineering & Programming*, *Web Development*, *Databases & SQL*, *JavaScript*)
6. **Data & Business Analyst** (Core: *Data Analysis*, *Business Analysis*, *Databases & SQL*, *Data Visualization*)
7. **Product & Strategy Leader** (Core: *Leadership & Management*, *Strategy*, *Communication & Soft Skills*, *Business Analysis*)

- Generates a **Career Readiness Match Score (%)**.
- Separates competencies into **Acquired Skills**, **Missing Core Gaps**, and **Missing Supporting Skills**.

---

### 2. ⚡ Hybrid Multi-Factor Recommendation Engine
Scores and ranks courses using a composite formula combining semantic vectors and catalog metadata:

$$\text{Final Score} = \sum_{i=1}^{8} w_i \cdot S_i$$

- **$S_1$ Semantic Similarity ($w_1 = 0.40$)**: Dense cosine similarity via 384-dimensional `all-MiniLM-L6-v2` embeddings indexed with FAISS (`IndexFlatIP`).
- **$S_2$ Skill Gap Relevance ($w_2 = 0.20$)**: Direct overlap between course skill tags and user's missing core/supporting skills.
- **$S_3$ Course Rating ($w_3 = 0.10$)**: Normalized star rating quality metric.
- **$S_4$ Difficulty Fit ($w_4 = 0.10$)**: Proximity between user's chosen level and course difficulty level.
- **$S_5$ Duration Fit ($w_5 = 0.08$)**: Match against user's time commitment preference.
- **$S_6$ Enrollment Popularity ($w_6 = 0.05$)**: Scaled student enrollment volume signal.
- **$S_7$ Review Confidence ($w_7 = 0.04$)**: Review volume weighting to reward established courses.
- **$S_8$ Type Preference ($w_8 = 0.03$)**: Alignment with preferred format (Course, Specialization, Certificate, Guided Project).

**Interactive Dynamic Weight Tuner**: Sliders on the UI allow real-time customization of all 8 scoring weights.

---

### 3. 📝 Explainable RAG Rationales
Every recommendation includes a synthesized **RAG Explanation** detailing:
- Why the course was recommended for the selected career track.
- Exact missing skills covered by the syllabus.
- Course quality metrics (Rating, Enrolled students, Duration, Provider).

---

### 4. 🧠 Interactive AI Mock Interview Modal
- Integrated technical mock interview simulator accessible directly from the navigation bar or chatbot.
- Select target role (`Data Scientist`, `AI / ML Engineer`, `Cloud Architect`, etc.) and difficulty (`Beginner`, `Intermediate`, `Advanced`).
- Multiple-choice technical questions with instant grading and detailed answer rationale.
- Summarizes performance score and provides a direct action: **"View Recommendations for Weak Areas"** to automatically tailor course recommendations to interview weaknesses.

---

### 5. 🤖 PathFinder AI Career Chatbot
- Floating interactive career guide powered by Google Gemini API (`gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-2.5-flash`, etc.).
- Starter prompt suggestions for learning roadmaps, skill gap analysis, and interview prep.
- Context-aware responses utilizing the user's active career selection and skill profile.
- Built-in API key management modal stored securely in browser `localStorage`.

---

### 6. 👤 User Authentication & Profile History
- **Auth System**: User Registration & Login with HMAC-SHA256 password hashing + salt (`data/users.json`).
- **Career Profile View**: View career snapshot, tracked skills, and historical assessment logs.
- **Assessment Persistence**: Automatic saving and deletion of past assessments (`data/user_profiles.json`).

---

### 7. 📈 Quantitative Benchmark & Model Evaluation
Evaluated across diverse student personas against the Coursera catalog (`models/evaluation/eval_report.json`):

| Evaluation Metric | Benchmark Value | Description |
| :--- | :--- | :--- |
| **Mean Precision@5** | `0.96` | 96% of top-5 recommended courses are directly relevant |
| **Mean NDCG@5** | `0.971` | Ranking quality considering position discount |
| **Skill-Gap Coverage** | `36.7%` | Percentage of target gaps resolved in top-5 selections |
| **Catalog Coverage** | `7.7%` | Diversity of unique catalog courses surfaced across profiles |
| **Organization Diversity** | `0.58` | Distribution across distinct educational institutions |

---

## 🛠️ Technology Stack

| Layer | Technologies / Libraries | Purpose |
| :--- | :--- | :--- |
| **ML & Data Engine** | Python 3, Pandas, NumPy, SentenceTransformers (`all-MiniLM-L6-v2`), FAISS | Dataset preprocessing, taxonomy extraction, 384d dense vector embeddings, vector similarity search |
| **Backend Server** | Node.js, Express.js, CORS, Crypto | REST API, HMAC authentication, Python child-process bridge (`mlBridge.js`), JSON storage |
| **Frontend Client** | React 18, Vite, Lucide React, Vanilla CSS Design System | Responsive single-page application, 3-step assessment wizard, mock interview, chatbot, dark UI |
| **AI Integrations** | Google Gemini API | Conversational career mentoring and mock interview generation |
| **Data Storage** | File-backed JSON (`data/users.json`, `data/user_profiles.json`) & CSV/NPY | Portable local storage without requiring external DB setup |

---

## 🚀 Setup & Execution Guide

### Prerequisites
- **Node.js**: v18+ and `npm`
- **Python**: 3.8+ with virtual environment recommended

---

### Step 1: Install Python ML Dependencies & Run Pipeline

```bash
# Install required Python packages
pip install pandas numpy sentence-transformers faiss-cpu scikit-learn

# Run the master pipeline to build clean datasets, taxonomy, embeddings, FAISS index & eval report
python build_pipeline.py
```

*Generated Pipeline Artifacts:*
- `data/processed/courses_clean.csv`
- `data/processed/skill_taxonomy.json`
- `models/embeddings/course_embeddings.npy`
- `models/vector_index/course_faiss.index`
- `models/vector_index/course_metadata.json`
- `models/evaluation/eval_report.json`

*(Optional) Run end-to-end Python system verification:*
```bash
python ml/test_system.py
```

---

### Step 2: Start the Backend Server

```bash
cd backend
npm install
npm start
```
*Backend server runs at:* `http://localhost:5001` (or `http://localhost:5000` depending on `PORT` environment setting).

---

### Step 3: Start the Frontend Application

```bash
cd frontend
npm install
npm run dev
```
*Frontend application runs at:* `http://localhost:5173`

---

## 📡 REST API Reference

### 1. Dataset & Analytics Endpoints (`/api`)

- **`GET /api/dataset-stats`**  
  Returns catalog overview: total courses (623), unique skills (319), top institutions, average ratings.

- **`GET /api/skills`**  
  Returns all canonical skills, aliases, and category mappings.

- **`GET /api/evaluation`**  
  Returns quantitative benchmark report (`eval_report.json`) including Precision@5, NDCG@5, and persona metrics.

- **`POST /api/recommend`**  
  Computes career readiness and multi-factor hybrid course recommendations.  
  *Request Body:*
  ```json
  {
    "current_skills": ["Python Programming", "Databases & SQL"],
    "target_career": "Data Scientist",
    "user_query": "machine learning and data pipelines",
    "preferred_difficulty": "Beginner",
    "preferred_duration": "Any",
    "preferred_type": "Any",
    "custom_weights": {
      "semantic_skill_match": 0.40,
      "career_skill_gap_relevance": 0.20,
      "rating": 0.10,
      "difficulty_fit": 0.10,
      "duration_fit": 0.08,
      "enrollment_popularity": 0.05,
      "review_confidence": 0.04,
      "type_preference": 0.03
    },
    "top_k": 10
  }
  ```

---

### 2. Authentication Endpoints (`/api/auth`)

- **`POST /api/auth/register`** — Register a new account (`name`, `email`, `password`).
- **`POST /api/auth/login`** — Authenticate user and receive bearer token.
- **`GET /api/auth/me`** — Fetch current user details via `Authorization: Bearer <token>`.

---

### 3. User Profile Endpoints (`/api/profile`)

- **`GET /api/profile`** — Fetch user profile & assessment history (Requires Auth).
- **`PUT /api/profile`** — Update profile information (Requires Auth).
- **`POST /api/profile/assessment`** — Save an assessment run into history (Requires Auth).
- **`DELETE /api/profile/assessment/:id`** — Delete a specific assessment from history (Requires Auth).

---

## 📂 Repository Directory Structure

```
cognizant/
├── backend/
│   ├── config/
│   │   └── paths.js               # Centralized path configurations
│   ├── controllers/
│   │   ├── authController.js       # Auth request handlers
│   │   ├── datasetController.js    # Stats, skills & evaluation handlers
│   │   ├── profileController.js    # Profile & assessment history handlers
│   │   └── recommendController.js  # Recommendation request handlers
│   ├── middleware/
│   │   └── authMiddleware.js       # Bearer token verification middleware
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth routes
│   │   ├── datasetRoutes.js       # /api dataset, skills, eval routes
│   │   ├── profileRoutes.js       # /api/profile routes
│   │   └── recommendRoutes.js     # /api/recommend route
│   ├── services/
│   │   ├── datasetService.js      # Dataset file reading service
│   │   ├── mlBridge.js            # Subprocess bridge to Python ML engine
│   │   ├── profileService.js      # User profile read/write service
│   │   └── recommendService.js    # Recommender invocation orchestrator
│   ├── auth.js                    # Salt & HMAC-SHA256 authentication logic
│   ├── careerModel.js             # JavaScript Career Model & skill normalization
│   ├── recommender.js             # JavaScript Hybrid Recommender fallback
│   ├── server.js                  # Express application entrypoint
│   └── package.json               # Backend dependencies (express, cors)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chatbot.jsx            # Gemini AI Career Chatbot
│   │   │   └── MockInterviewModal.jsx # Interactive AI Mock Interview Modal
│   │   ├── App.jsx                # Main React Application & State
│   │   ├── index.css              # Glassmorphic Design System
│   │   └── main.jsx               # React DOM Entrypoint
│   ├── index.html                 # HTML Shell
│   ├── vite.config.js             # Vite Dev Server & Proxy Setup
│   └── package.json               # Frontend dependencies (react, lucide-react)
│
├── ml/
│   ├── preprocess_dataset.py      # Cleans CSV & imputes missing fields
│   ├── build_skill_taxonomy.py    # Generates 319 canonical skill taxonomy
│   ├── build_embeddings.py        # SentenceTransformers & FAISS indexer
│   ├── career_model.py            # Python Career Trajectory & Gap Model
│   ├── hybrid_recommender.py      # Python 8-factor Hybrid Recommender
│   ├── evaluate_recommender.py    # Precision@K & NDCG@K Benchmark Suite
│   ├── serve_recommender.py       # Python stdin/stdout sub-process server
│   └── test_system.py             # System integration verification test
│
├── data/
│   ├── processed/
│   │   ├── courses_clean.csv      # Cleaned 623-course dataset
│   │   └── skill_taxonomy.json    # Canonical skill taxonomy & aliases
│   ├── users.json                 # Registered user credentials & tokens
│   └── user_profiles.json         # User assessment histories & profiles
│
├── models/
│   ├── embeddings/
│   │   └── course_embeddings.npy  # 623 x 384 dense course vectors
│   ├── evaluation/
│   │   └── eval_report.json       # Quantitative benchmark metrics
│   └── vector_index/
│       ├── course_faiss.index     # FAISS similarity vector index
│       └── course_metadata.json   # Course metadata for fast scoring
│
├── docs/
│   ├── PROJECT_DOCUMENTATION.md   # Detailed system & architecture document
│   └── dataset_analysis.md        # Comprehensive dataset profiling report
│
├── build_pipeline.py              # Master reproducible ML pipeline runner
├── coursera_course_dataset_v3.csv # Ground-truth Coursera course dataset
└── README.md                      # Primary project guide
```

---

## 📜 Summary of Included Modules & Features

- ✅ **Grounded Data Pipeline**: Strict processing of `coursera_course_dataset_v3.csv` with zero synthetic course hallucination.
- ✅ **Career Track Matching**: 7 curated tracks with core/supporting skill classification and gap analysis.
- ✅ **Hybrid Vector Recommender**: FAISS dense retrieval combined with multi-attribute scoring and customizable weights.
- ✅ **AI Mock Interview Modal**: In-browser technical interview practice with instant scoring and recommendations for identified weak areas.
- ✅ **Gemini AI Career Chatbot**: Built-in floating AI mentor with markdown chat, starter prompts, and custom API key configuration.
- ✅ **User Authentication & History**: Local password-hashed account management and persistent assessment logging.
- ✅ **Benchmark Dashboard**: Quantitative validation reporting Precision@5 (`0.96`) and NDCG@5 (`0.971`).
