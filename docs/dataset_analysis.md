# Coursera Course Dataset Profiling & Analysis Report

**Dataset Path:** `coursera_course_dataset_v3.csv`  
**Generated On:** August 18, 2026  
**Status:** Ground-Truth Analysis Completed  

---

## 1. Overview & Shape
- **Total Rows:** 623 course records
- **Total Columns:** 12 attributes
- **Duplicate Rows:** 0 exact duplicate rows found across all columns.

---

## 2. Schema, Data Types & Missing Values

| # | Column Name | Data Type | Non-Null Count | Missing Count | Missing % | Primary Role in ML Architecture |
|---|---|---|---|---|---|---|
| 0 | `Unnamed: 0` | `int64` | 623 | 0 | 0.0% | Legacy index (to be dropped during preprocessing) |
| 1 | `Title` | `object` | 623 | 0 | 0.0% | Text search & Semantic embedding input |
| 2 | `Organization` | `object` | 623 | 0 | 0.0% | Organization filtering & Diversity weight |
| 3 | `Skills` | `object` | 623 | 0 | 0.0% | Skill taxonomy, Skill-gap matching & Semantic embedding |
| 4 | `Ratings` | `float64` | 623 | 0 | 0.0% | Quality signal (Score component) |
| 5 | `course_url` | `object` | 403 | 220 | 35.3% | Actionable URL (Fallback to search URL if missing) |
| 6 | `course_students_enrolled` | `object` | 387 | 236 | 37.9% | Popularity signal (Parsed to float, imputed with median) |
| 7 | `course_description` | `object` | 402 | 221 | 35.5% | Detailed text (Imputed with Title + Skills fallback) |
| 8 | `Review Count` | `object` | 623 | 0 | 0.0% | Confidence signal (Parsed '20K' -> 20000) |
| 9 | `Difficulty` | `object` | 623 | 0 | 0.0% | Level personalization & Rank constraint |
| 10 | `Type` | `object` | 623 | 0 | 0.0% | Format preference filtering |
| 11 | `Duration` | `object` | 623 | 0 | 0.0% | Time commitment personalization |

---

## 3. Unique Value Counts
- **Titles:** 623 (100% unique titles across dataset)
- **Organizations:** 115 distinct providers
- **Skills:** 328 unique raw skill tags across 7,306 total skill mentions
- **Difficulty levels:** 4 distinct levels
- **Course Types:** 5 distinct course types
- **Duration categories:** 4 distinct duration ranges

---

## 4. Distribution Analysis

### 4.1 Ratings Distribution
- **Range:** 2.8 to 5.0 (Mean: 4.64, Median: 4.7, Std Dev: 0.196)
- **Most Common Ratings:**
  - `4.7`: 180 courses (28.9%)
  - `4.8`: 138 courses (22.1%)
  - `4.6`: 130 courses (20.9%)
  - `4.5`: 70 courses (11.2%)
  - `4.9`: 37 courses (5.9%)

### 4.2 Difficulty Distribution
- **Beginner:** 413 courses (66.3%)
- **Intermediate:** 153 courses (24.6%)
- **Mixed:** 39 courses (6.3%)
- **Advanced:** 18 courses (2.9%)

### 4.3 Course Type Distribution
- **Course:** 299 (48.0%)
- **Specialization:** 223 (35.8%)
- **Professional Certificate:** 81 (13.0%)
- **Guided Project:** 19 (3.0%)
- **Project:** 1 (0.2%)

### 4.4 Duration Distribution
- **3 - 6 Months:** 277 courses (44.5%)
- **1 - 3 Months:** 189 courses (30.3%)
- **1 - 4 Weeks:** 137 courses (22.0%)
- **Less Than 2 Hours:** 20 courses (3.2%)

### 4.5 Top 15 Organizations
1. **IBM:** 69 courses
2. **Google Cloud:** 67 courses
3. **Google:** 65 courses
4. **DeepLearning.AI:** 24 courses
5. **University of Pennsylvania:** 22 courses
6. **Johns Hopkins University:** 21 courses
7. **Coursera Project Network:** 19 courses
8. **Duke University:** 18 courses
9. **University of Michigan:** 16 courses
10. **University of Illinois at Urbana-Champaign:** 15 courses
11. **University of Colorado Boulder:** 14 courses
12. **Microsoft:** 12 courses
13. **Meta:** 11 courses
14. **University of California, Irvine:** 10 courses
15. **INSEAD:** 8 courses

---

## 5. Skill Intelligence & Vocabulary Profiling
- **Total Skill Mentions:** 7,306
- **Unique Raw Skills:** 328
- **Top 20 Most Frequent Skills:**
  1. `Leadership and Management` (208)
  2. `Data Analysis` (191)
  3. `Cloud Computing` (150)
  4. `Computer Programming` (139)
  5. `Python Programming` (128)
  6. `Communication` (107)
  7. `Data Management` (106)
  8. `Machine Learning` (97)
  9. `Problem Solving` (86)
  10. `Strategy` (86)
  11. `Algorithms` (84)
  12. `Critical Thinking` (84)
  13. `Business Analysis` (83)
  14. `Data Visualization` (83)
  15. `Strategy and Operations` (80)
  16. `Databases` (75)
  17. `Finance` (75)
  18. `Cloud Platforms` (73)
  19. `Probability & Statistics` (70)
  20. `General Statistics` (68)

### Skill Synonym & Taxonomy Groupings
Skills in the dataset exhibit distinct hierarchical and synonym clusters, e.g.:
- **Machine Learning / AI:** `Machine Learning`, `Deep Learning`, `Applied Machine Learning`, `Artificial Intelligence (AI)`, `Machine Learning Algorithms`
- **Data Science & Analytics:** `Data Analysis`, `Data Management`, `Data Visualization`, `Python Programming`, `R Programming`, `SQL`, `General Statistics`, `Probability & Statistics`
- **Cloud Engineering:** `Cloud Computing`, `Cloud Platforms`, `Google Cloud Platform`, `Amazon Web Services (AWS)`, `Microsoft Azure`, `Cloud Infrastructure`
- **Cybersecurity & IT:** `Network Security`, `Security Engineering`, `Cybersecurity`, `Linux`, `System Security`
- **Web & Software Engineering:** `Computer Programming`, `Web Development`, `Software Engineering`, `JavaScript`, `HTML and CSS`, `React (Web Framework)`

---

## 6. Popularity & Engagement Metrics

### 6.1 Students Enrolled
- **Count Available:** 387 courses
- **Min:** 1,567
- **Median:** 53,694
- **Mean:** 155,711
- **Max:** 3,641,053 (3.64M students)

### 6.2 Review Count
- **Count Available:** 623 (100%)
- **Parsed Strings:** Converts strings like `'20K'`, `'137K'`, `'6'` to clean integers.
- **Min:** 6
- **Median:** 1,400
- **Mean:** 9,530
- **Max:** 269,000

---

## 7. Text Quality & Descriptions
- **Title Length:** Avg 36.7 characters (Min 5, Max 92).
- **Description Length:** Avg 1,458 characters (Min 25, Max 4,023).
- **Missing Descriptions:** 221 courses (35.5%).
  - **Resolution strategy:** For courses missing descriptions, synthesize a dense composite text field: `Title + ". Offered by " + Organization + ". Key Skills: " + Skills + ". Level: " + Difficulty + ". Type: " + Type`.

---

## 8. Potential Duplicates & Similarity
- **Exact Title Duplicates:** 0
- **Near-Duplicate Check:** A few courses have overlapping titles across different levels or specialized tracks. All 623 records represent distinct catalog offerings with unique skill lists or URLs.

---

## 9. Supervised ML Assessment & Pseudo-Labeling Verdict
- **Ground-Truth Assessment:** The Coursera dataset does **NOT** contain explicit `student_id` or `target_career` labels.
- **Verdict:** We will **NOT** claim to have trained a supervised career classifier on Coursera.
- **Solution:** We build a deterministic, explainable Career-Skill Intelligence Model combined with a Hybrid Recommender and Vector Semantic Search (RAG) over the 623 dataset courses.

---

## 10. Summary & Downstream Architecture Mapping
All 12 columns map directly into the preprocessing, embedding, career intelligence, and hybrid recommendation scoring pipelines:
1. `Title` + `Skills` + `course_description` + `Organization` + `Difficulty` + `Type` -> **FAISS Vector Index (`all-MiniLM-L6-v2`)**
2. `Skills` -> **Skill Taxonomy & Canonical Skill Normalization**
3. `Ratings` + `Review Count` + `course_students_enrolled` -> **Quality & Popularity Scoring**
4. `Difficulty` + `Duration` + `Type` -> **Personalized Weight Matching**
5. `course_url` -> **Direct Course Enrollment Links**
