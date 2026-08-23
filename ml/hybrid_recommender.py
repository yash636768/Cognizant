import os
import json
import sys
import numpy as np
import pandas as pd

DEFAULT_WEIGHTS = {
    "semantic_skill_match": 0.40,
    "career_skill_gap_relevance": 0.20,
    "rating": 0.10,
    "difficulty_fit": 0.10,
    "duration_fit": 0.08,
    "enrollment_popularity": 0.05,
    "review_confidence": 0.04,
    "type_preference": 0.03
}

DIFFICULTY_MAP = {
    "beginner": 1,
    "intermediate": 2,
    "advanced": 3,
    "mixed": 2
}

DURATION_HOURS_ESTIMATE = {
    "less than 2 hours": 2,
    "1 - 4 weeks": 20,
    "1 - 3 months": 60,
    "3 - 6 months": 120
}

class HybridRecommender:
    def __init__(self, metadata_path, embeddings_path, faiss_path=None):
        self.metadata_path = metadata_path
        self.embeddings_path = embeddings_path
        self.faiss_path = faiss_path
        
        with open(metadata_path, 'r', encoding='utf-8') as f:
            self.metadata = json.load(f)
            
        self.df = pd.DataFrame(self.metadata)
        
        # Max scaling factors for popularity & reviews
        self.max_enrolled = max(self.df['enrolled_count'].max(), 1.0)
        self.max_reviews = max(self.df['review_count'].max(), 1.0)
        
        # Pre-load embeddings
        if os.path.exists(embeddings_path):
            self.embeddings = np.load(embeddings_path)
        else:
            self.embeddings = None
            
        # Try loading FAISS
        self.faiss_index = None
        if faiss_path and os.path.exists(faiss_path):
            try:
                import faiss
                self.faiss_index = faiss.read_index(faiss_path)
            except Exception as e:
                print(f"FAISS index load notice: {e}")
                self.faiss_index = None

    def _compute_semantic_similarity(self, query_str):
        if not query_str.strip():
            return np.ones(len(self.df), dtype=np.float32) * 0.5
            
        try:
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer('all-MiniLM-L6-v2')
            q_vec = model.encode([query_str], normalize_embeddings=True)[0]
            sims = np.dot(self.embeddings, q_vec)
            # Clip between 0 and 1
            return np.clip(sims, 0.0, 1.0)
        except Exception:
            # TF-IDF fallback similarity
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.metrics.pairwise import cosine_similarity
            docs = [f"{r['title']} {r['skills']} {r['description']}" for r in self.metadata]
            vec = TfidfVectorizer(stop_words='english')
            mat = vec.fit_transform(docs + [query_str])
            sims = cosine_similarity(mat[-1:], mat[:-1])[0]
            return np.clip(sims, 0.0, 1.0)

    def recommend(
        self,
        current_skills,
        target_career_missing_skills=None,
        user_query="",
        preferred_difficulty=None,
        preferred_duration=None,
        preferred_type=None,
        custom_weights=None,
        top_k=10
    ):
        weights = DEFAULT_WEIGHTS.copy()
        if custom_weights:
            weights.update(custom_weights)
            
        target_missing = [s.lower().strip() for s in (target_career_missing_skills or []) if s.strip()]
        user_skills_set = set(s.lower().strip() for s in current_skills if s.strip())
        
        # 1. Semantic Match Vector
        comb_query = f"{user_query} {' '.join(current_skills)} {' '.join(target_missing)}"
        semantic_scores = self._compute_semantic_similarity(comb_query)
        
        scores = []
        for idx, row in self.df.iterrows():
            course_skills_raw = [s.strip().lower() for s in row['skills'].split(',') if s.strip()]
            course_skills_set = set(course_skills_raw)
            
            # 1. Semantic Score
            sem_score = float(semantic_scores[idx])
            
            # 2. Skill-Gap & Relevance Score
            gap_overlap = len(course_skills_set.intersection(target_missing))
            user_overlap = len(course_skills_set.intersection(user_skills_set))
            
            if target_missing:
                gap_score = (gap_overlap / max(len(target_missing), 1)) * 0.7 + (user_overlap / max(len(course_skills_set), 1)) * 0.3
            else:
                gap_score = user_overlap / max(len(course_skills_set), 1)
            gap_score = min(gap_score, 1.0)
            
            # 3. Rating Score (Normalized 0.0 - 1.0)
            rating_score = float(row['ratings']) / 5.0
            
            # 4. Difficulty Fit Score
            if preferred_difficulty and preferred_difficulty.lower() != 'any':
                target_diff_val = DIFFICULTY_MAP.get(preferred_difficulty.lower(), 2)
                course_diff_val = DIFFICULTY_MAP.get(row['difficulty'].lower(), 2)
                diff_diff = abs(target_diff_val - course_diff_val)
                diff_score = max(1.0 - (diff_diff * 0.4), 0.1)
            else:
                diff_score = 1.0
                
            # 5. Duration Fit Score
            if preferred_duration and preferred_duration.lower() != 'any':
                target_dur_val = DURATION_HOURS_ESTIMATE.get(preferred_duration.lower(), 60)
                course_dur_val = DURATION_HOURS_ESTIMATE.get(row['duration'].lower(), 60)
                dur_diff = abs(target_dur_val - course_dur_val) / max(target_dur_val, 1)
                duration_score = max(1.0 - dur_diff, 0.1)
            else:
                duration_score = 1.0
                
            # 6. Enrollment Popularity (Log-scaled)
            enroll_score = float(np.log1p(row['enrolled_count']) / np.log1p(self.max_enrolled))
            
            # 7. Review Confidence (Log-scaled)
            review_score = float(np.log1p(row['review_count']) / np.log1p(self.max_reviews))
            
            # 8. Type Preference Score
            if preferred_type and preferred_type.lower() != 'any':
                type_score = 1.0 if row['type'].lower() == preferred_type.lower() else 0.4
            else:
                type_score = 1.0
                
            # Weighted Composite Final Score
            final_score = (
                weights["semantic_skill_match"] * sem_score +
                weights["career_skill_gap_relevance"] * gap_score +
                weights["rating"] * rating_score +
                weights["difficulty_fit"] * diff_score +
                weights["duration_fit"] * duration_score +
                weights["enrollment_popularity"] * enroll_score +
                weights["review_confidence"] * review_score +
                weights["type_preference"] * type_score
            )
            
            # Identify matched skills for display
            matched_skills_list = list(set([s.strip() for s in row['skills'].split(',') if s.strip()]))
            gap_covered_skills = [s for s in matched_skills_list if s.lower() in target_missing]
            
            scores.append({
                "course_id": int(row['vector_id']),
                "title": row['title'],
                "organization": row['organization'],
                "rating": row['ratings'],
                "review_count": row['review_count'],
                "enrolled_count": row['enrolled_count'],
                "difficulty": row['difficulty'],
                "duration": row['duration'],
                "type": row['type'],
                "course_url": row['course_url'],
                "skills": row['skills'],
                "matched_gap_skills": gap_covered_skills,
                "final_score": float(final_score),
                "score_breakdown": {
                    "semantic_match": round(sem_score * 100, 1),
                    "skill_gap_relevance": round(gap_score * 100, 1),
                    "rating_quality": round(rating_score * 100, 1),
                    "difficulty_fit": round(diff_score * 100, 1),
                    "duration_fit": round(duration_score * 100, 1),
                    "popularity": round(enroll_score * 100, 1)
                },
                "rag_explanation": (
                    f"Recommended because it directly targets key skills ({', '.join(gap_covered_skills) if gap_covered_skills else row['skills']}). "
                    f"Offered by {row['organization']} with a high rating of {row['ratings']}/5.0 based on {row['review_count']:,} reviews. "
                    f"Level: {row['difficulty']} ({row['duration']})."
                )
            })
            
        # Rank by composite score
        scores.sort(key=lambda x: x["final_score"], reverse=True)
        return scores[:top_k]

if __name__ == "__main__":
    request = json.loads(sys.stdin.read())
    recommender = HybridRecommender(
        request["metadata_path"],
        request.get("embeddings_path"),
        request.get("faiss_path")
    )
    print(json.dumps(recommender.recommend(
        current_skills=request.get("current_skills", []),
        target_career_missing_skills=request.get("target_career_missing_skills", []),
        user_query=request.get("user_query", ""),
        preferred_difficulty=request.get("preferred_difficulty", "Any"),
        preferred_duration=request.get("preferred_duration", "Any"),
        preferred_type=request.get("preferred_type", "Any"),
        custom_weights=request.get("custom_weights"),
        top_k=request.get("top_k", 10)
    )))
