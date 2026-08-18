import os
import json
from ml.career_model import CareerModel
from ml.hybrid_recommender import HybridRecommender

def test_full_system():
    print("Testing SkillPath AI End-to-End System...")
    
    # 1. Test Career Model
    cm = CareerModel("data/processed/skill_taxonomy.json")
    user_skills = ["Python Programming", "Databases & SQL"]
    interest = "I want to become a Data Scientist"
    
    careers = cm.evaluate_careers(user_skills, interest_text=interest)
    print(f"\n[1] Top Matched Career: {careers[0]['title']} ({careers[0]['match_percentage']}%)")
    print(f"Missing Core Skills for Data Scientist: {careers[0]['missing_core_skills']}")
    
    # 2. Test Hybrid Recommender with FAISS Index
    meta_p = os.path.abspath("models/vector_index/course_metadata.json")
    emb_p = os.path.abspath("models/embeddings/course_embeddings.npy")
    faiss_p = os.path.abspath("models/vector_index/course_faiss.index")
    
    recommender = HybridRecommender(meta_p, emb_p, faiss_p)
    recs = recommender.recommend(
        current_skills=user_skills,
        target_career_missing_skills=careers[0]['missing_core_skills'],
        user_query=interest,
        preferred_difficulty="Beginner",
        top_k=5
    )
    
    print("\n[2] Top 5 Grounded Course Recommendations from Dataset:")
    for idx, r in enumerate(recs, 1):
        print(f"  {idx}. [{r['final_score']:.3f}] {r['title']} ({r['organization']})")
        print(f"     Score Breakdown: Semantic={r['score_breakdown']['semantic_match']}%, Gap={r['score_breakdown']['skill_gap_relevance']}%, Rating={r['score_breakdown']['rating_quality']}%")
        print(f"     Skills Covered: {r['skills'][:60]}...")
        print(f"     URL: {r['course_url']}")
        print(f"     RAG Explanation: {r['rag_explanation']}\n")

if __name__ == "__main__":
    test_full_system()
