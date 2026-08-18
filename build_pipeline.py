import os
import time
from ml.preprocess_dataset import preprocess_courses
from ml.build_skill_taxonomy import build_taxonomy
from ml.build_embeddings import build_embeddings
from ml.evaluate_recommender import evaluate_recommender

def run_master_pipeline():
    start_time = time.time()
    print("=" * 70)
    print("STARTING REPRODUCIBLE ML INTELLIGENCE PIPELINE")
    print("Grounded on Dataset: coursera_course_dataset_v3.csv")
    print("=" * 70)
    
    # Paths
    raw_csv = os.path.abspath("coursera_course_dataset_v3.csv")
    clean_csv = os.path.abspath("data/processed/courses_clean.csv")
    taxonomy_json = os.path.abspath("data/processed/skill_taxonomy.json")
    embeddings_dir = os.path.abspath("models/embeddings")
    vector_index_dir = os.path.abspath("models/vector_index")
    eval_report_path = os.path.abspath("models/evaluation/eval_report.json")
    
    # Step 1: Preprocessing
    print("\n[STEP 1/4] Preprocessing Dataset...")
    preprocess_courses(raw_csv, clean_csv)
    
    # Step 2: Skill Taxonomy Extraction
    print("\n[STEP 2/4] Building Skill Taxonomy & Synonyms...")
    build_taxonomy(clean_csv, taxonomy_json)
    
    # Step 3: Course Embeddings & FAISS Index Generation
    print("\n[STEP 3/4] Generating Sentence-Transformer Embeddings & FAISS Index...")
    build_embeddings(clean_csv, embeddings_dir, vector_index_dir)
    
    # Step 4: Model Evaluation
    print("\n[STEP 4/4] Running Quantitative Model Evaluation...")
    meta_json = os.path.join(vector_index_dir, "course_metadata.json")
    emb_npy = os.path.join(embeddings_dir, "course_embeddings.npy")
    report = evaluate_recommender(meta_json, emb_npy, eval_report_path)
    
    elapsed = time.time() - start_time
    print("\n" + "=" * 70)
    print(f"PIPELINE COMPLETED SUCCESSFULLY IN {elapsed:.2f} SECONDS!")
    print(f"Precision@5: {report['summary_metrics']['mean_precision_at_5']}")
    print(f"NDCG@5:      {report['summary_metrics']['mean_ndcg_at_5']}")
    print(f"Skill-Gap Coverage: {report['summary_metrics']['mean_skill_gap_coverage_pct']}%")
    print("=" * 70)

if __name__ == "__main__":
    run_master_pipeline()
