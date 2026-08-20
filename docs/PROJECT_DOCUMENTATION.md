# Pathfinder — Comprehensive System Documentation 🚀

> **Data-Grounded Career Trajectory & Course Recommendation Engine**  
> *Powered by SentenceTransformer Dense Vector Embeddings, FAISS Indexing, Skill Taxonomy Intelligence, Node.js Express REST Backend, and React 18 UI.*

---

## 📋 Table of Contents
1. [Executive Summary & System Architecture](#1-executive-summary--system-architecture)
2. [Dataset Profiling & Ground-Truth Analysis](#2-dataset-profiling--ground-truth-analysis)
3. [Machine Learning & Recommendation Pipeline](#3-machine-learning--recommendation-pipeline)
   - [3.1 Data Preprocessing & Cleaning](#31-data-preprocessing--cleaning)
   - [3.2 Skill Taxonomy & Synonym Extraction](#32-skill-taxonomy--synonym-extraction)
   - [3.3 SentenceTransformer Vector Embeddings & FAISS Indexing](#33-sentencetransformer-vector-embeddings--faiss-indexing)
   - [3.4 Career Readiness & Skill Gap Matching Model](#34-career-readiness--skill-gap-matching-model)
   - [3.5 Hybrid Multi-Factor Recommendation Scoring Formula](#35-hybrid-multi-factor-recommendation-scoring-formula)
   - [3.6 Explainable RAG Generation](#36-explainable-rag-generation)
4. [Quantitative Evaluation & Benchmark Performance](#4-quantitative-evaluation--benchmark-performance)
5. [Backend REST API Specification](#5-backend-rest-api-specification)
   - [5.1 API Architecture](#51-api-architecture)
   - [5.2 Endpoint Reference](#52-endpoint-reference)
   - [5.3 Authentication System](#53-authentication-system)
6. [Frontend UI & Design System Architecture](#6-frontend-ui--design-system-architecture)
   - [6.1 Technology Stack & Structure](#61-technology-stack--structure)
   - [6.2 Application Views & Flow](#62-application-views--flow)
   - [6.3 Design System & Theme Tokens](#63-design-system--theme-tokens)
7. [Installation, Setup & Reproducibility Guide](#7-installation-setup--reproducibility-guide)
8. [Complete Repository Directory Structure](#8-complete-repository-directory-structure)

---

## 1. Executive Summary & System Architecture

**Pathfinder** is an end-to-end AI career trajectory and course recommendation platform. Built directly upon real-world data from `coursera_course_dataset_v3.csv` (comprising 623 Coursera offerings across 115 institutions and 319 canonical skills), Pathfinder enables users to evaluate their technical readiness for high-demand target roles, identify precise skill gaps, tune recommendation weights, and receive rank-ordered courses with transparent **Retrieval-Augmented Generation (RAG)** explanations.

### High-Level Architecture Diagram

```
                             +-----------------------------------+
                             |  coursera_course_dataset_v3.csv   |
                             |    (623 Courses, 12 Attributes)   |
                             +-----------------+-----------------+
                                               |
                                               v
                             +-----------------+-----------------+
                             |    build_pipeline.py (ML Setup)   |
                             | - Preprocessing & Text Impute    |
                             | - Skill Taxonomy (319 Canonical)  |
                             | - SentenceTransformers (384d)     |
                             | - FAISS Vector Indexing           |
                             | - Quantitative Benchmarking       |
                             +-----------------+-----------------+
                                               |
                                               v
                             +-----------------+-----------------+
                             |   Node.js Express API (:5000)     |
                             | - GET  /api/dataset-stats         |
                             | - GET  /api/skills                |
                             | - GET  /api/evaluation            |
                             | - POST /api/recommend             |
                             | - POST /api/auth/register, login  |
                             +-----------------+-----------------+
                                               |
                                               v
                             +-----------------+-----------------+
                             |   React + Vite Frontend (:5173)   |
                             | - Landing & Pipeline Stepper      |
                             | - 3-Step Skill Assessment Wizard  |
                             | - Custom Weight Priority Tuner    |
                             | - Course RAG Explanations         |
                             | - Benchmark Performance Table     |
                             +-----------------------------------+
```

### Technology Stack Matrix

| Subsystem | Components & Frameworks | Description |
| :--- | :--- | :--- |
| **Data Engine** | Python 3, Pandas, NumPy | Data cleaning, string parsing, median imputation, text compilation |
| **Vector Search & ML** | SentenceTransformers (`all-MiniLM-L6-v2`), FAISS (CPU) | 384-dimensional dense vector embeddings & L2/Cosine similarity index |
| **Backend REST API** | Node.js, Express.js, CORS, Crypto/JWT Auth | Scalable REST API with token authentication and JSON filesystem storage |
| **Frontend Web App** | React 18, Vite, Lucide Icons, Vanilla CSS | Responsive dark-mode single page app with progressive wizard & sliders |
| **Dataset Base** | `coursera_course_dataset_v3.csv` | Ground-truth dataset containing 623 courses, 115 organizations |

---

## 2. Dataset Profiling & Ground-Truth Analysis

The system is strictly grounded in `coursera_course_dataset_v3.csv`. Below is the verified dataset profile:

### Dataset Summary Metrics
- **Total Course Records:** 623
- **Total Columns:** 12
- **Duplicate Rows:** 0 exact duplicates
- **Distinct Educational Providers:** 115 (e.g., IBM, Google, Google Cloud, DeepLearning.AI, UPenn, Johns Hopkins, Duke)
- **Extracted Skill Tags:** 7,306 total mentions across 328 raw skill strings (consolidated to 319 canonical skills)

### Attribute Schema & Pipeline Role

| Attribute | Data Type | Non-Null | Missing % | System Role |
| :--- | :--- | :--- | :--- | :--- |
| `Unnamed: 0` | `int64` | 623 | 0.0% | Legacy index, dropped during preprocessing |
| `Title` | `object` | 623 | 0.0% | Semantic embedding input & text match |
| `Organization` | `object` | 623 | 0.0% | Organization filtering & provider diversity evaluation |
| `Skills` | `object` | 623 | 0.0% | Taxonomy mapping, skill gap overlap & embedding |
| `Ratings` | `float64` | 623 | 0.0% | Quality score signal (normalized 0.0 - 1.0) |
| `course_url` | `object` | 403 | 35.3% | Target course URL (fallback search URL synthesized) |
| `course_students_enrolled` | `object` | 387 | 37.9% | Popularity signal (parsed `'100k'` -> `100000`, median imputed) |
| `course_description` | `object` | 402 | 35.5% | Text content (imputed with composite text if missing) |
| `Review Count` | `object` | 623 | 0.0% | Confidence signal (parsed `'20K'` -> `20000`) |
| `Difficulty` | `object` | 623 | 0.0% | Level constraint matching (`Beginner`, `Intermediate`, `Advanced`, `Mixed`) |
| `Type` | `object` | 623 | 0.0% | Format matching (`Course`, `Specialization`, `Professional Certificate`, `Guided Project`) |
| `Duration` | `object` | 623 | 0.0% | Time commitment matching (`1 - 4 Weeks`, `1 - 3 Months`, `3 - 6 Months`, `Less Than 2 Hours`) |

### Key Distributions

- **Ratings Distribution:** Range 2.8 to 5.0 (Mean: `4.64`, Median: `4.7`). Top ratings: 4.7 (28.9%), 4.8 (22.1%), 4.6 (20.9%).
- **Difficulty Breakdown:** Beginner (66.3%), Intermediate (24.6%), Mixed (6.3%), Advanced (2.9%).
- **Course Types:** Course (48.0%), Specialization (35.8%), Professional Certificate (13.0%), Guided Project (3.0%), Project (0.2%).
- **Duration Ranges:** 3–6 Months (44.5%), 1–3 Months (30.3%), 1–4 Weeks (22.0%), <2 Hours (3.2%).

---

## 3. Machine Learning & Recommendation Pipeline

The ML architecture follows a modular, reproducible 4-step pipeline executed via `build_pipeline.py`.

```
  [1. Preprocessing] ---> [2. Skill Taxonomy] ---> [3. Embeddings & FAISS] ---> [4. Evaluation]
```

### 3.1 Data Preprocessing & Cleaning (`ml/preprocess_dataset.py`)
1. **String Numeric Parsing:** Converts human-formatted numbers like `'20K'` to `20000`, `'1.2M'` to `1200000`.
2. **Missing Description Imputation:** For the 35.5% courses missing explicit descriptions, a dense synthetic text string is constructed:
   $$\text{CompositeDescription} = \text{Title} + ". Offered by " + \text{Organization} + ". Key Skills: " + \text{Skills} + ". Level: " + \text{Difficulty} + ". Type: " + \text{Type}$$
3. **Enrolled Median Imputation:** Imputes missing enrollment numbers with the dataset median (`53,694`).
4. **URL Fallback:** Synthesizes valid Coursera search URLs for missing URL fields.

### 3.2 Skill Taxonomy & Synonym Extraction (`ml/build_skill_taxonomy.py`)
- Extracts 7,306 skill instances across 623 courses.
- Groups skill variants into **319 canonical skills** with mapped aliases (e.g., `"Python"` $\rightarrow$ `"Python Programming"`, `"SQL"` $\rightarrow$ `"Databases & SQL"`, `"Deep Learning"` $\rightarrow$ `"Deep Learning & AI"`).

### 3.3 SentenceTransformer Vector Embeddings & FAISS Indexing (`ml/build_embeddings.py`)
- **Model:** `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense embedding space).
- **Text Representation:** Each course is represented by concatenating Title, Organization, Skills, Difficulty, Type, and Description.
- **Index Construction:** Embeddings are L2-normalized, converted to float32, and indexed using FAISS (`IndexFlatIP` for Cosine Similarity search).
- **Outputs:**
  - `models/embeddings/course_embeddings.npy`
  - `models/vector_index/course_faiss.index`
  - `models/vector_index/course_metadata.json`

### 3.4 Career Readiness & Skill Gap Matching Model (`ml/career_model.py` / `backend/careerModel.js`)
Evaluates technical background against 7 curated high-demand career profiles:

1. **Data Scientist**: Core: Python, Data Analysis, Databases & SQL, ML, Probability & Statistics.
2. **AI / Machine Learning Engineer**: Core: Python, ML, Deep Learning & AI, Software Engineering, Algorithms.
3. **Cloud Solutions Architect**: Core: Cloud Computing, Linux & Systems, GCP, AWS, Azure.
4. **Cybersecurity Engineer**: Core: Cybersecurity & Network Security, Linux & Systems, Software Engineering.
5. **Full-Stack Web Developer**: Core: Software Engineering, Web Development, Databases & SQL, JavaScript.
6. **Data & Business Analyst**: Core: Data Analysis, Business Analysis, Databases & SQL, Data Visualization.
7. **Product & Strategy Leader**: Core: Leadership & Management, Strategy, Communication, Business Analysis.

**Match Percentage Formula:**
$$\text{ReadinessScore} = \left(0.50 \cdot \frac{|\text{Matched Core Skills}|}{|\text{Total Core Skills}|} + 0.25 \cdot \frac{|\text{Matched Supp Skills}|}{|\text{Total Supp Skills}|} + 0.25 \cdot \text{InterestAlignmentBonus}\right) \times 100$$

### 3.5 Hybrid Multi-Factor Recommendation Scoring Formula (`ml/hybrid_recommender.py` / `backend/recommender.js`)

Courses are ranked using a 8-component composite score:

$$\text{FinalScore} = \sum_{i=1}^{8} w_i \cdot S_i$$

Where default weights $w_i$ are:
- $w_1 = 0.40$ (Semantic Vector Similarity $S_{\text{sem}}$)
- $w_2 = 0.20$ (Skill Gap Overlap Relevance $S_{\text{gap}}$)
- $w_3 = 0.10$ (Rating Quality $S_{\text{rating}}$)
- $w_4 = 0.10$ (Difficulty Fit $S_{\text{diff}}$)
- $w_5 = 0.08$ (Duration Fit $S_{\text{dur}}$)
- $w_6 = 0.05$ (Enrollment Popularity $S_{\text{pop}}$)
- $w_7 = 0.04$ (Review Count Confidence $S_{\text{rev}}$)
- $w_8 = 0.03$ (Type Format Fit $S_{\text{type}}$)

#### Detailed Factor Definitions:
1. **Semantic Match ($S_{\text{sem}}$):** Cosine similarity between user query/skill embedding and course vector index.
2. **Skill Gap Relevance ($S_{\text{gap}}$):** 
   $$S_{\text{gap}} = 0.7 \times \frac{|\text{Course Skills} \cap \text{Missing Target Skills}|}{\max(|\text{Missing Target Skills}|, 1)} + 0.3 \times \frac{|\text{Course Skills} \cap \text{User Skills}|}{\max(|\text{Course Skills}|, 1)}$$
3. **Rating Quality ($S_{\text{rating}}$):** $\frac{\text{Rating}}{5.0}$
4. **Difficulty Fit ($S_{\text{diff}}$):** $1.0 - 0.4 \times |\text{TargetDiffVal} - \text{CourseDiffVal}|$
5. **Duration Fit ($S_{\text{dur}}$):** $1.0 - \frac{|\text{TargetHours} - \text{CourseHours}|}{\max(\text{TargetHours}, 1)}$
6. **Popularity ($S_{\text{pop}}$):** $\frac{\ln(1 + \text{Enrolled})}{\ln(1 + \max(\text{Enrolled}))}$
7. **Review Confidence ($S_{\text{rev}}$):** $\frac{\ln(1 + \text{ReviewCount})}{\ln(1 + \max(\text{ReviewCount}))}$
8. **Type Preference ($S_{\text{type}}$):** $1.0$ if exact type match, else $0.4$.

### 3.6 Explainable RAG Generation
For every returned course, the recommender dynamically constructs a natural-language RAG explanation justifying its inclusion:
> *"Recommended because it directly targets key skills (Python Programming, Machine Learning). Offered by IBM with a high rating of 4.7/5.0 based on 20,000 reviews. Level: Beginner (3 - 6 Months)."*

---

## 4. Quantitative Evaluation & Benchmark Performance

To validate recommendation accuracy without arbitrary claims, the system is evaluated across 5 benchmark student profiles against all 623 Coursera offerings:

1. **Data Science Beginner** (Python, SQL $\rightarrow$ Data Scientist)
2. **ML Engineer Intermediate** (Python, ML, Math $\rightarrow$ AI/ML Engineer)
3. **Cloud Architect Transition** (Linux, Networking $\rightarrow$ Cloud Architect)
4. **Security Entry Level** (Linux, Networking $\rightarrow$ Cybersecurity Engineer)
5. **Web Dev Career Switcher** (HTML, CSS, JavaScript $\rightarrow$ Full-Stack Developer)

### Evaluation Results (`models/evaluation/eval_report.json`)

| Benchmark Profile | Target Career Track | Precision@5 | NDCG@5 | Skill-Gap Coverage | Top Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Data Science Beginner** | Data Scientist | 1.00 | 0.985 | 40.0% | IBM Data Science Professional Certificate |
| **ML Engineer Intermediate**| AI / ML Engineer | 1.00 | 0.992 | 40.0% | Machine Learning (DeepLearning.AI) |
| **Cloud Architect Transition**| Cloud Solutions Architect | 0.80 | 0.879 | 40.0% | Architecting with GCP Specialization |
| **Security Entry Level** | Cybersecurity Engineer | 1.00 | 1.000 | 33.3% | Google Cybersecurity Professional Certificate |
| **Web Dev Switcher** | Full-Stack Web Developer | 1.00 | 1.000 | 30.0% | IBM Full Stack Software Developer Cert |
| **SYSTEM MEAN METRIC** | — | **0.960 (96%)** | **0.971** | **36.7%** | Provider Diversity: **0.58** |

---

## 5. Backend REST API Specification

### 5.1 API Architecture
- Framework: Node.js Express (`backend/server.js`)
- Server Port: `5000` (CORS enabled)
- Initialization: Loads pre-built taxonomy `data/processed/skill_taxonomy.json` and vector metadata `models/vector_index/course_metadata.json`.

### 5.2 Endpoint Reference

#### 1. `GET /api/dataset-stats`
Returns summary catalog stats.
- **Response `200 OK`:**
```json
{
  "dataset_name": "coursera_course_dataset_v3.csv",
  "total_courses": 623,
  "total_skills_identified": 319,
  "total_organizations": 115,
  "ratings_mean": 4.64,
  "top_organizations": ["IBM", "Google Cloud", "Google", "DeepLearning.AI"]
}
```

#### 2. `GET /api/skills`
Returns the array of 319 canonical skill objects with aliases and frequencies.
- **Response `200 OK`:** `[{ "canonical_skill": "Python Programming", "aliases": ["python", "py"], "freq": 128 }, ...]`

#### 3. `GET /api/evaluation`
Returns the evaluation report across benchmark profiles.
- **Response `200 OK`:** `eval_report.json` payload.

#### 4. `POST /api/recommend`
Calculates career readiness and returns top-k rank-ordered courses.
- **Request Body:**
```json
{
  "current_skills": ["Python Programming", "Databases & SQL"],
  "target_career": "Data Scientist",
  "user_query": "I want to learn deep learning algorithms",
  "preferred_difficulty": "Beginner",
  "preferred_duration": "3 - 6 Months",
  "preferred_type": "Specialization",
  "custom_weights": {
    "semantic_skill_match": 0.40,
    "career_skill_gap_relevance": 0.20
  },
  "top_k": 10
}
```
- **Response `200 OK`:**
```json
{
  "dataset_grounding": "Powered by Hackathon Dataset (coursera_course_dataset_v3.csv)",
  "selected_career": {
    "title": "Data Scientist",
    "match_percentage": 50.0,
    "matched_core_skills": ["Python Programming", "Databases & SQL"],
    "missing_core_skills": ["Data Analysis", "Machine Learning", "Probability & Statistics"]
  },
  "recommendations": [
    {
      "course_id": 0,
      "title": "IBM Data Science Professional Certificate",
      "organization": "IBM",
      "rating": 4.6,
      "review_count": 137000,
      "enrolled_count": 480000,
      "difficulty": "Beginner",
      "duration": "3 - 6 Months",
      "final_score": 0.9145,
      "matched_gap_skills": ["Data Analysis", "Machine Learning"],
      "rag_explanation": "Recommended because it directly targets key skills..."
    }
  ]
}
```

### 5.3 Authentication System
- `POST /api/auth/register`: Creates new user account in `data/users.json`.
- `POST /api/auth/login`: Authenticates credentials and returns session token.
- `GET /api/auth/me`: Verifies `Bearer` token header and returns active profile.

---

## 6. Frontend UI & Design System Architecture

### 6.1 Technology Stack & Structure
- **Framework:** React 18 + Vite (`frontend/src/App.jsx`)
- **Iconography:** Lucide Icons (`lucide-react`)
- **Styling:** Vanilla CSS Design System (`frontend/src/index.css`)

### 6.2 Application Views & Flow

```
   +-------------------------------------------------------------------+
   |                            NAVBAR                                 |
   | [Overview]    [Skill Assessment]   [Paths & Courses]   [Performance]|
   +-------------------------------------------------------------------+
                                     |
    +--------------------------------+--------------------------------+
    |                                |                                |
    v                                v                                v
[PAGE 1: OVERVIEW]        [PAGE 2: ASSESSMENT]        [PAGE 3: RESULTS]
- Hero Headline           - Step 1: Target Role       - Career Readiness %
- Pipeline Stepper        - Step 2: Technical Skills  - Missing Skill Badges
- Grounded Data Metrics   - Step 3: Weight Tuner      - Course Cards + RAG
- 6 Career Track Cards    (Auth Modal Protected)      - Direct Coursera Links
```

1. **Overview / Landing Page:** Interactive introduction featuring the 4-step pipeline stepper, ground-truth dataset metrics grid, and 6 career track cards.
2. **3-Step Guided Skill Assessment Wizard:**
   - **Step 1 (Target Role):** Target career track selection & custom query input.
   - **Step 2 (Technical Skills):** Interactive skill tag creation with 13 instant preset buttons.
   - **Step 3 (Preferences & Weight Priorities):** Difficulty select, duration select, and weight tuning sliders (`Semantic Vector Similarity`, `Skill Gap Resolution`, `Rating Quality`).
3. **Career Readiness & Recommended Courses View:** Displays calculated readiness percentage, matched core skills, missing core skills, and rank-ordered course cards with expandable RAG explanations.
4. **System Performance Dashboard:** Interactive rendering of Precision@5, NDCG@5, Skill Coverage, and the profile evaluation table.
5. **Auth Modal:** Sign in / Register modal protecting assessment functionality.

### 6.3 Design System & Theme Tokens (`frontend/src/index.css`)
- **Theme:** Ultra-sleek dark mode.
- **Background Palette:** `--bg-app: #090d16`, `--bg-panel: #111726`, `--bg-surface-raised: #1a2236`.
- **Accent Palette:** `--color-brand: #6366f1` (Indigo/Violet gradient), `--color-brand-hover: #4f46e5`.
- **Status Tokens:** `--status-success-bg: rgba(16, 185, 129, 0.12)`, `--status-warning-bg: rgba(245, 158, 11, 0.12)`.

---

## 7. Installation, Setup & Reproducibility Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher & `npm`
- **Python**: `3.8` or higher & `pip`

### Step 1: Clone & Setup Python Virtual Environment
```bash
# Install required Python ML packages
pip install pandas numpy sentence-transformers faiss-cpu
```

### Step 2: Run the Reproducible Master ML Pipeline
```bash
python build_pipeline.py
```
*Outputs generated:*
- `data/processed/courses_clean.csv`
- `data/processed/skill_taxonomy.json`
- `models/embeddings/course_embeddings.npy`
- `models/vector_index/course_faiss.index`
- `models/vector_index/course_metadata.json`
- `models/evaluation/eval_report.json`

### Step 3: Launch the Node.js Express Backend
```bash
cd backend
npm install
npm start
```
*Server listening on:* `http://localhost:5000`

### Step 4: Launch the React Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```
*Client application running on:* `http://localhost:5173`

---

## 8. Complete Repository Directory Structure

```
cognizant/
├── backend/
│   ├── auth.js                      # Authentication & Session Token Handler
│   ├── careerModel.js               # Career Readiness & Skill Gap Logic (JS)
│   ├── recommender.js                # Hybrid Multi-Factor Scoring Recommender (JS)
│   ├── server.js                    # Node.js Express REST API Entrypoint
│   ├── package.json                 # Backend Node Dependencies
│   └── package-lock.json            # Node Lockfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Main React SPA Application
│   │   ├── App.css                  # Component Utility Styles
│   │   ├── index.css                # Vanilla CSS Design System Tokens
│   │   └── main.jsx                 # React DOM Entrypoint
│   ├── index.html                   # HTML Template
│   ├── package.json                 # Frontend Dependencies (React 18, Vite, Lucide)
│   └── vite.config.js               # Vite Development Server Config
├── ml/
│   ├── preprocess_dataset.py        # Data Cleaning, Parsing & Imputation
│   ├── build_skill_taxonomy.py      # Skill Extraction & Canonical Mapping
│   ├── build_embeddings.py          # SentenceTransformers & FAISS Vector Indexing
│   ├── career_model.py              # Career Profile Reference (Python)
│   ├── hybrid_recommender.py        # Hybrid Recommender Reference (Python)
│   ├── evaluate_recommender.py      # Benchmark Evaluation System
│   └── test_system.py               # End-to-End System Test Script
├── data/
│   ├── processed/                   # Generated Clean CSV & Skill Taxonomy JSON
│   └── users.json                   # User Credentials Store
├── models/
│   ├── embeddings/                  # SentenceTransformer .npy Vectors
│   ├── vector_index/                # FAISS Index & Metadata JSON
│   └── evaluation/                  # Evaluation Benchmark JSON Report
├── docs/
│   ├── dataset_analysis.md          # Ground-Truth Dataset Profiling Report
│   └── PROJECT_DOCUMENTATION.md     # Full Project Documentation (This File)
├── build_pipeline.py                # Master Reproducible Pipeline Trigger
├── coursera_course_dataset_v3.csv   # Ground-Truth Dataset Base
├── .gitignore                       # Git Exclusion Rules
└── README.md                        # Project Overview & Quickstart
```

---
*Documentation verified and generated on August 19, 2026 for the Pathfinder Career Strategy Engine.*
