import os
import json
import numpy as np
import pandas as pd
from ml.hybrid_recommender import HybridRecommender
from ml.career_model import CareerModel

BENCHMARK_PROFILES = [
    {
        "id": 1,
        "name": "Data Science Aspirant",
        "current_skills": ["Python Programming", "Databases & SQL", "Probability & Statistics"],
        "target_career": "Data Scientist",
        "interest": "Data Science",
        "expected_relevant_keywords": ["data science", "machine learning", "data analysis", "python", "statistics"]
    },
    {
        "id": 2,
        "name": "AI & ML Specialist",
        "current_skills": ["Python Programming", "Machine Learning", "Deep Learning & AI"],
        "target_career": "AI / Machine Learning Engineer",
        "interest": "AI",
        "expected_relevant_keywords": ["machine learning", "deep learning", "artificial intelligence", "neural networks", "tensor"]
    },
    {
        "id": 3,
        "name": "Web Development Candidate",
        "current_skills": ["JavaScript", "HTML and CSS", "Web Development"],
        "target_career": "Full-Stack Web Developer",
        "interest": "Web Development",
        "expected_relevant_keywords": ["web development", "javascript", "react", "html", "css", "frontend", "full stack"]
    },
    {
        "id": 4,
        "name": "Cybersecurity Candidate",
        "current_skills": ["Linux & Systems", "Cybersecurity & Network Security", "System Security"],
        "target_career": "Cybersecurity Engineer",
        "interest": "Cybersecurity",
        "expected_relevant_keywords": ["cybersecurity", "security", "network security", "linux", "threat"]
    },
    {
        "id": 5,
        "name": "Cloud Engineer Aspirant",
        "current_skills": ["Cloud Computing", "Linux & Systems", "Network Security"],
        "target_career": "Cloud Solutions Architect",
        "interest": "Cloud Engineering",
        "expected_relevant_keywords": ["cloud", "gcp", "aws", "azure", "cloud computing", "devops"]
    }
]

def calculate_dcg(relevances, k):
    relevances = relevances[:k]
    if not relevances:
        return 0.0
    return sum(rel / np.log2(idx + 2) for idx, rel in enumerate(relevances))

def calculate_ndcg(relevances, k):
    dcg = calculate_dcg(relevances, k)
    ideal_relevances = sorted(relevances, reverse=True)
    idcg = calculate_dcg(ideal_relevances, k)
    return dcg / idcg if idcg > 0 else 0.0

def evaluate_recommender(meta_path, emb_path, output_report_path):
    print("Evaluating hybrid recommender model...")
    recommender = HybridRecommender(meta_path, emb_path)
    career_model = CareerModel("data/processed/skill_taxonomy.json")
    
    results_by_profile = []
    all_p5, all_p10, all_r5, all_r10, all_ndcg5, all_ndcg10 = [], [], [], [], [], []
    all_gap_coverage, all_diversity = [], []
    
    for prof in BENCHMARK_PROFILES:
        # Determine missing target career skills
        career_eval = career_model.evaluate_careers(prof["current_skills"], prof["interest"])
        target_missing = career_eval[0]["missing_core_skills"] if career_eval else []
        
        # Fetch Top-10 Recommendations
        recs = recommender.recommend(
            current_skills=prof["current_skills"],
            target_career_missing_skills=target_missing,
            user_query=prof["interest"],
            top_k=10
        )
        
        # Relevance binary assessment based on keywords & target missing skill overlap
        relevances = []
        for r in recs:
            title_skills_desc = f"{r['title']} {r['skills']} {r['rag_explanation']}".lower()
            rel = 0
            for kw in prof["expected_relevant_keywords"]:
                if kw in title_skills_desc:
                    rel = 1
                    break
            relevances.append(rel)
            
        p5 = sum(relevances[:5]) / 5.0
        p10 = sum(relevances[:10]) / 10.0
        
        # Recall approximation (assume 10 possible relevant items in dataset)
        r5 = sum(relevances[:5]) / 5.0
        r10 = sum(relevances[:10]) / 10.0
        
        ndcg5 = calculate_ndcg(relevances, 5)
        ndcg10 = calculate_ndcg(relevances, 10)
        
        # Skill-gap coverage %
        covered_gaps = set()
        for r in recs:
            for s in r["matched_gap_skills"]:
                covered_gaps.add(s.lower())
        gap_cov_pct = (len(covered_gaps) / max(len(target_missing), 1)) * 100.0 if target_missing else 100.0
        
        # Organization Diversity (Unique organizations in top 10)
        orgs = set(r["organization"] for r in recs)
        diversity_score = len(orgs) / max(len(recs), 1)
        
        all_p5.append(p5)
        all_p10.append(p10)
        all_r5.append(r5)
        all_r10.append(r10)
        all_ndcg5.append(ndcg5)
        all_ndcg10.append(ndcg10)
        all_gap_coverage.append(gap_cov_pct)
        all_diversity.append(diversity_score)
        
        results_by_profile.append({
            "profile_id": prof["id"],
            "profile_name": prof["name"],
            "target_career": prof["target_career"],
            "precision_at_5": round(p5, 3),
            "precision_at_10": round(p10, 3),
            "ndcg_at_5": round(ndcg5, 3),
            "ndcg_at_10": round(ndcg10, 3),
            "skill_gap_coverage_pct": round(gap_cov_pct, 1),
            "organization_diversity": round(diversity_score, 2),
            "top_3_recommendations": [r["title"] + " (" + r["organization"] + ")" for r in recs[:3]]
        })
        
    report = {
        "dataset_grounding": "coursera_course_dataset_v3.csv (623 courses)",
        "summary_metrics": {
            "mean_precision_at_5": round(float(np.mean(all_p5)), 3),
            "mean_precision_at_10": round(float(np.mean(all_p10)), 3),
            "mean_recall_at_5": round(float(np.mean(all_r5)), 3),
            "mean_recall_at_10": round(float(np.mean(all_r10)), 3),
            "mean_ndcg_at_5": round(float(np.mean(all_ndcg5)), 3),
            "mean_ndcg_at_10": round(float(np.mean(all_ndcg10)), 3),
            "mean_skill_gap_coverage_pct": round(float(np.mean(all_gap_coverage)), 1),
            "mean_organization_diversity": round(float(np.mean(all_diversity)), 2)
        },
        "profiles": results_by_profile
    }
    
    os.makedirs(os.path.dirname(output_report_path), exist_ok=True)
    with open(output_report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
        
    print(f"Evaluation report saved to {output_report_path}.")
    return report

if __name__ == "__main__":
    meta_p = os.path.abspath("models/vector_index/course_metadata.json")
    emb_p = os.path.abspath("models/embeddings/course_embeddings.npy")
    rep_p = os.path.abspath("models/evaluation/eval_report.json")
    evaluate_recommender(meta_p, emb_p, rep_p)
