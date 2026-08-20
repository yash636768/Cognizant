# Pathfinder 🚀

> **Data-Grounded Career Trajectory & Course Recommendation Engine**  
> *Powered by SentenceTransformer Vector Search, Skill Taxonomy Intelligence, Node.js Express Backend & React Frontend.*

[![Node.js](https://img.shields.io/badge/Backend-Node.js%20Express-green.svg)](file:///d:/cognizant/backend)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb.svg)](file:///d:/cognizant/frontend)
[![Python ML](https://img.shields.io/badge/ML-SentenceTransformers%20%2B%20FAISS-blue.svg)](file:///d:/cognizant/build_pipeline.py)
[![Dataset Grounding](https://img.shields.io/badge/Dataset-623%20Coursera%20Courses-orange.svg)](file:///d:/cognizant/coursera_course_dataset_v3.csv)
[![Full Documentation](https://img.shields.io/badge/Docs-Full%20Documentation-purple.svg)](file:///d:/cognizant/docs/PROJECT_DOCUMENTATION.md)

---

## 📖 Complete Documentation
For exhaustive technical details, dataset profiling, math formulas, API specs, and evaluation reports, read [docs/PROJECT_DOCUMENTATION.md](file:///d:/cognizant/docs/PROJECT_DOCUMENTATION.md).

---

## 🌟 Overview

**Pathfinder** is an end-to-end AI career advisor and course recommendation engine built on real data from `coursera_course_dataset_v3.csv` (623 courses, 115 educational providers, 319 canonical skills).

It helps learners assess their technical background against 7 high-demand career tracks, pinpoint exact missing skill gaps, and receive multi-factor recommendations with transparent **RAG (Retrieval-Augmented Generation)** explanations.

---

## 📐 System Architecture

```
                       +-----------------------------------+
                       |  coursera_course_dataset_v3.csv   |
                       |    (623 Courses, 12 Attributes)   |
                       +-----------------+-----------------+
                                         |
                                         v
                       +-----------------+-----------------+
                       |    build_pipeline.py (ML Setup)   |
                       | - Dataset Preprocessing           |
                       | - Skill Taxonomy (319 Skills)     |
                       | - SentenceTransformer Embeddings  |
                       | - FAISS 384d Vector Index         |
                       | - Quantitative Model Evaluation   |
                       +-----------------+-----------------+
                                         |
                                         v
                       +-----------------+-----------------+
                       |    Node.js Express Server (:5000) |
                       | - GET  /api/dataset-stats         |
                       | - GET  /api/skills                |
                       | - GET  /api/evaluation            |
                       | - POST /api/recommend             |
                       +-----------------+-----------------+
                                         |
                                         v
                       +-----------------+-----------------+
                       |   React + Vite Frontend (:5173)   |
                       | - Skill Tag Assessment            |
                       | - Career Readiness Calculator     |
                       | - Interactive Weight Tuner        |
                       | - Accuracy Evaluation Dashboard   |
                       +-----------------------------------+
```

---

## 🎯 Key Features

### 1. 🧭 Career Trajectory & Skill Gap Matching
Evaluate technical readiness across 7 curated career tracks:
- **Data Scientist**
- **AI / Machine Learning Engineer**
- **Cloud Solutions Architect**
- **Cybersecurity Engineer**
- **Full-Stack Web Developer**
- **Data & Business Analyst**
- **Product & Strategy Leader**

### 2. ⚡ Hybrid Recommendation Scoring Engine
Ranks catalog courses using a weighted composite multi-factor score:
$$\text{Score} = w_1 \cdot \text{SemanticMatch} + w_2 \cdot \text{SkillGapOverlap} + w_3 \cdot \text{Rating} + w_4 \cdot \text{DiffFit} + w_5 \cdot \text{DurFit} + w_6 \cdot \text{Popularity} + w_7 \cdot \text{Reviews} + w_8 \cdot \text{Type}$$

- **Semantic Match**: 384-dimensional `all-MiniLM-L6-v2` dense vector similarity.
- **Skill-Gap Relevance**: Direct overlap with target career missing competencies.
- **Personalized Weight Tuning**: Adjust priority weights in real time on the UI.

### 3. 📊 Quantitative Benchmark & Performance Metrics
Evaluated across benchmark student profiles against the full Coursera dataset:
- **Precision@5**: `0.96` (96% top-5 relevance)
- **NDCG@5**: `0.971` (Normalized Discounted Cumulative Gain)
- **Skill-Gap Coverage**: `36.7%`
- **Organization Diversity**: `0.58`

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Data & Pipeline** | Python 3, Pandas, NumPy, SentenceTransformers (`all-MiniLM-L6-v2`), FAISS |
| **Backend API** | Node.js, Express.js, CORS |
| **Frontend UI** | React 18, Vite, Lucide Icons, Vanilla CSS Design System |
| **Data Source** | `coursera_course_dataset_v3.csv` |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ and `npm`
- **Python**: 3.8+ (with `pandas`, `numpy`, `sentence-transformers`, `faiss-cpu`)

---

### 1. Run the ML Pipeline (Data Preprocessing & Embedding Indexing)

```bash
# Run the master pipeline to build data models, FAISS vector index, and evaluation reports
python build_pipeline.py
```

*Outputs generated:*
- `data/processed/courses_clean.csv`
- `data/processed/skill_taxonomy.json`
- `models/embeddings/course_embeddings.npy`
- `models/vector_index/course_faiss.index`
- `models/evaluation/eval_report.json`

---

### 2. Start the Node.js Express Backend Server

```bash
cd backend
npm install
npm start
```
*Server runs on:* `http://localhost:5000`

---

### 3. Start the React Frontend Application

```bash
cd frontend
npm install
npm run dev
```
*Application runs on:* `http://localhost:5173`

---

## 📡 API Reference

### `GET /api/dataset-stats`
Returns catalog summary metrics (total courses, skills identified, top organizations, mean rating).

### `GET /api/skills`
Returns the 319 extracted canonical skills and aliases.

### `GET /api/evaluation`
Returns the quantitative evaluation report across benchmark profiles.

### `POST /api/recommend`
Generates career readiness score and hybrid course recommendations.

**Request Body:**
```json
{
  "current_skills": ["Python Programming", "Databases & SQL"],
  "target_career": "Data Scientist",
  "preferred_difficulty": "Beginner",
  "preferred_duration": "Any",
  "top_k": 10
}
```

---

## 📂 Repository Structure

```
cognizant/
├── backend/
│   ├── careerModel.js       # JS Career Trajectory Matching Logic
│   ├── recommender.js         # JS Hybrid Recommendation Engine
│   ├── server.js              # Express REST Server
│   └── package.json           # Node Backend Dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React UI Application
│   │   ├── index.css          # Design System Styles
│   │   └── main.jsx           # React Entrypoint
│   ├── package.json           # Frontend Dependencies
│   └── vite.config.js         # Vite Configuration
├── ml/
│   ├── preprocess_dataset.py  # Data Cleaning & Parsing
│   ├── build_skill_taxonomy.py# Skill Taxonomy Extraction
│   ├── build_embeddings.py    # SentenceTransformers & FAISS Vector Indexing
│   ├── career_model.py        # Python Career Model Reference
│   ├── hybrid_recommender.py  # Python Hybrid Recommender Reference
│   ├── evaluate_recommender.py# Quantitative Evaluation Framework
│   └── test_system.py         # End-to-End System Test
├── data/                      # Processed Datasets & Taxonomy JSON
├── models/                    # FAISS Index & Embeddings NPY Files
├── docs/                      # Dataset Profiling Reports
├── build_pipeline.py          # Master Reproducible ML Pipeline
└── coursera_course_dataset_v3.csv # Ground-Truth Dataset
```

---

## 📄 License
This project is built for the Cognizant Hackathon using Coursera dataset records.
