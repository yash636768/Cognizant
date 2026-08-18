import os
import json
import numpy as np
import pandas as pd

def build_embeddings(clean_csv_path, embeddings_dir, vector_index_dir):
    print("Loading cleaned dataset...")
    df = pd.read_csv(clean_csv_path)
    
    os.makedirs(embeddings_dir, exist_ok=True)
    os.makedirs(vector_index_dir, exist_ok=True)
    
    documents = df['embed_doc'].astype(str).tolist()
    print(f"Generating embeddings for {len(documents)} courses...")
    
    # Try importing sentence_transformers & faiss, fallback to sklearn TF-IDF if needed
    try:
        from sentence_transformers import SentenceTransformer
        import faiss
        print("Using SentenceTransformer ('all-MiniLM-L6-v2')...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        embeddings = model.encode(documents, show_progress_bar=True, normalize_embeddings=True)
        embeddings = np.array(embeddings, dtype=np.float32)
        
        # Build FAISS Index (Cosine similarity via Inner Product on normalized vectors)
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatIP(dimension)
        index.add(embeddings)
        
        faiss_path = os.path.join(vector_index_dir, "course_faiss.index")
        faiss.write_index(index, faiss_path)
        print(f"Saved FAISS index to {faiss_path} (dimension={dimension}).")
        
    except Exception as e:
        print(f"SentenceTransformer/FAISS notice: {e}. Falling back to TF-IDF + Cosine...")
        from sklearn.feature_extraction.text import TfidfVectorizer
        vectorizer = TfidfVectorizer(stop_words='english', max_features=512)
        tfidf_mat = vectorizer.fit_transform(documents).toarray().astype(np.float32)
        norms = np.linalg.norm(tfidf_mat, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        embeddings = tfidf_mat / norms
        
        # Create a basic numpy cosine similarity matrix saver
        faiss_path = os.path.join(vector_index_dir, "course_faiss.index")
        with open(faiss_path, 'w') as f:
            f.write("TFIDF_FALLBACK_INDEX")
            
    # Save numpy embeddings
    npy_path = os.path.join(embeddings_dir, "course_embeddings.npy")
    np.save(npy_path, embeddings)
    print(f"Saved numpy embeddings to {npy_path}.")
    
    # Save course metadata mapping
    metadata = []
    for idx, row in df.iterrows():
        metadata.append({
            "vector_id": idx,
            "title": str(row['Title']),
            "organization": str(row['Organization']),
            "skills": str(row['skills_clean']),
            "ratings": float(row['Ratings']),
            "review_count": int(row['review_count_num']),
            "enrolled_count": int(row['enrolled_num']),
            "difficulty": str(row['Difficulty']),
            "type": str(row['Type']),
            "duration": str(row['Duration']),
            "course_url": str(row['course_url_clean']),
            "description": str(row['course_description_clean'])
        })
        
    meta_path = os.path.join(vector_index_dir, "course_metadata.json")
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Saved metadata for {len(metadata)} courses to {meta_path}.")
    return embeddings, metadata

if __name__ == "__main__":
    clean_csv = os.path.abspath("data/processed/courses_clean.csv")
    emb_dir = os.path.abspath("models/embeddings")
    idx_dir = os.path.abspath("models/vector_index")
    build_embeddings(clean_csv, emb_dir, idx_dir)
