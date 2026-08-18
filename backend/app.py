import os
import sys
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ml.career_model import CareerModel
from ml.hybrid_recommender import HybridRecommender

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "models")

META_PATH = os.path.join(MODELS_DIR, "vector_index", "course_metadata.json")
EMB_PATH = os.path.join(MODELS_DIR, "embeddings", "course_embeddings.npy")
FAISS_PATH = os.path.join(MODELS_DIR, "vector_index", "course_faiss.index")
TAXONOMY_PATH = os.path.join(DATA_DIR, "skill_taxonomy.json")
EVAL_PATH = os.path.join(MODELS_DIR, "evaluation", "eval_report.json")

# Initialize Models
career_model = CareerModel(TAXONOMY_PATH)
recommender = None

def get_recommender():
    global recommender
    if recommender is None and os.path.exists(META_PATH):
        recommender = HybridRecommender(META_PATH, EMB_PATH, FAISS_PATH)
    return recommender

@app.route('/api/dataset-stats', methods=['GET'])
def get_dataset_stats():
    meta_p = META_PATH
    if not os.path.exists(meta_p):
        return jsonify({"error": "Dataset metadata not generated yet"}), 404
        
    with open(meta_p, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
        
    total_courses = len(metadata)
    orgs = set(m['organization'] for m in metadata)
    ratings = [m['ratings'] for m in metadata]
    
    with open(TAXONOMY_PATH, 'r', encoding='utf-8') as f:
        tax = json.load(f)
        
    return jsonify({
        "dataset_name": "coursera_course_dataset_v3.csv",
        "total_courses": total_courses,
        "total_skills_identified": len(tax),
        "total_organizations": len(orgs),
        "ratings_mean": round(sum(ratings) / max(len(ratings), 1), 2),
        "top_organizations": list(orgs)[:15]
    })

@app.route('/api/skills', methods=['GET'])
def get_skills():
    if not os.path.exists(TAXONOMY_PATH):
        return jsonify([]), 200
    with open(TAXONOMY_PATH, 'r', encoding='utf-8') as f:
        tax = json.load(f)
    return jsonify(tax)

@app.route('/api/recommend', methods=['POST'])
def recommend():
    rec_engine = get_recommender()
    if rec_engine is None:
        return jsonify({"error": "Recommendation index not ready"}), 500
        
    data = request.get_json() or {}
    current_skills = data.get("current_skills", [])
    target_career = data.get("target_career", "")
    user_query = data.get("user_query", "")
    preferred_difficulty = data.get("preferred_difficulty", "Any")
    preferred_duration = data.get("preferred_duration", "Any")
    preferred_type = data.get("preferred_type", "Any")
    custom_weights = data.get("custom_weights", None)
    top_k = int(data.get("top_k", 10))
    
    # 1. Career Trajectory Matching
    career_evals = career_model.evaluate_careers(current_skills, interest_text=f"{target_career} {user_query}")
    
    selected_career_profile = None
    target_missing_skills = []
    
    if target_career:
        for c in career_evals:
            if c['title'].lower() == target_career.lower() or c['career_key'].lower() == target_career.lower():
                selected_career_profile = c
                target_missing_skills = c['missing_core_skills'] + c['missing_supp_skills']
                break
                
    if not selected_career_profile and career_evals:
        selected_career_profile = career_evals[0]
        target_missing_skills = selected_career_profile['missing_core_skills'] + selected_career_profile['missing_supp_skills']
        
    # 2. Hybrid Recommendation Scoring
    recs = rec_engine.recommend(
        current_skills=current_skills,
        target_career_missing_skills=target_missing_skills,
        user_query=user_query or (selected_career_profile['title'] if selected_career_profile else ""),
        preferred_difficulty=preferred_difficulty,
        preferred_duration=preferred_duration,
        preferred_type=preferred_type,
        custom_weights=custom_weights,
        top_k=top_k
    )
    
    return jsonify({
        "dataset_grounding": "Powered by Hackathon Dataset (coursera_course_dataset_v3.csv)",
        "career_candidates": career_evals,
        "selected_career": selected_career_profile,
        "target_missing_skills": target_missing_skills,
        "recommendations": recs
    })

@app.route('/api/evaluation', methods=['GET'])
def get_evaluation():
    if not os.path.exists(EVAL_PATH):
        return jsonify({"error": "Evaluation report not generated yet"}), 404
    with open(EVAL_PATH, 'r', encoding='utf-8') as f:
        report = json.load(f)
    return jsonify(report)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
