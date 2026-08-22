"""
serve_recommender.py
--------------------
Thin stdin → stdout bridge around HybridRecommender.
Called by the Node.js backend as a subprocess:

    echo '<json_payload>' | python ml/serve_recommender.py

Reads one JSON object from stdin, runs real SentenceTransformer + FAISS
inference, and writes the result JSON to stdout.
"""

import sys
import json
import os

# ── resolve paths relative to project root (two levels up from ml/) ──────────
ML_DIR   = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(ML_DIR)

META_PATH  = os.path.join(ROOT_DIR, "models", "vector_index", "course_metadata.json")
EMB_PATH   = os.path.join(ROOT_DIR, "models", "embeddings",   "course_embeddings.npy")
FAISS_PATH = os.path.join(ROOT_DIR, "models", "vector_index", "course_faiss.index")

# Add ml/ to path so we can import hybrid_recommender
sys.path.insert(0, ML_DIR)
from hybrid_recommender import HybridRecommender

def main():
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw)

        recommender = HybridRecommender(
            metadata_path  = META_PATH,
            embeddings_path= EMB_PATH,
            faiss_path     = FAISS_PATH
        )

        results = recommender.recommend(
            current_skills               = payload.get("current_skills", []),
            target_career_missing_skills = payload.get("target_career_missing_skills", []),
            user_query                   = payload.get("user_query", ""),
            preferred_difficulty         = payload.get("preferred_difficulty", None),
            preferred_duration           = payload.get("preferred_duration", None),
            preferred_type               = payload.get("preferred_type", None),
            custom_weights               = payload.get("custom_weights", None),
            top_k                        = payload.get("top_k", 10)
        )

        sys.stdout.write(json.dumps({"success": True, "recommendations": results}))
        sys.stdout.flush()

    except Exception as exc:
        error_payload = {"success": False, "error": str(exc)}
        sys.stdout.write(json.dumps(error_payload))
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()
