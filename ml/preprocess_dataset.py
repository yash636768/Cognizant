import os
import pandas as pd
import numpy as np
import re
import json

def parse_numeric_str(val, default=np.nan):
    if pd.isna(val) or val is None:
        return default
    val_str = str(val).replace(',', '').strip()
    if not val_str:
        return default
    
    # Handle suffixes
    mult = 1.0
    if val_str.lower().endswith('k'):
        mult = 1000.0
        val_str = val_str[:-1].strip()
    elif val_str.lower().endswith('m'):
        mult = 1000000.0
        val_str = val_str[:-1].strip()
        
    try:
        return float(val_str) * mult
    except ValueError:
        # Match numeric characters
        match = re.search(r'[\d\.]+', val_str)
        if match:
            try:
                return float(match.group(0)) * mult
            except ValueError:
                return default
        return default

def clean_skills(skill_str):
    if pd.isna(skill_str) or not skill_str:
        return []
    parts = [s.strip() for s in str(skill_str).split(',') if s.strip()]
    return parts

def preprocess_courses(raw_csv_path, output_csv_path):
    print(f"Loading raw dataset from {raw_csv_path}...")
    df = pd.read_csv(raw_csv_path)
    
    # 1. Schema Validation
    required_cols = ['Title', 'Organization', 'Skills', 'Ratings', 'Review Count', 'Difficulty', 'Type', 'Duration']
    for col in required_cols:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")
            
    print(f"Initial shape: {df.shape}")
    
    # 2. Remove irrelevant index columns if present
    if 'Unnamed: 0' in df.columns:
        df = df.drop(columns=['Unnamed: 0'])
        
    # 3. Handle Title and Organization text normalization
    df['Title'] = df['Title'].astype(str).str.strip()
    df['Organization'] = df['Organization'].astype(str).str.strip()
    
    # 4. Handle Ratings
    df['Ratings'] = pd.to_numeric(df['Ratings'], errors='coerce').fillna(4.5)
    df['Ratings'] = df['Ratings'].clip(1.0, 5.0)
    
    # 5. Handle Review Count parsing
    df['review_count_num'] = df['Review Count'].apply(parse_numeric_str).fillna(0).astype(int)
    
    # 6. Handle Students Enrolled parsing & Imputation
    df['enrolled_num'] = df['course_students_enrolled'].apply(parse_numeric_str)
    median_enrolled = df['enrolled_num'].median()
    if pd.isna(median_enrolled):
        median_enrolled = 10000
    df['enrolled_num'] = df['enrolled_num'].fillna(median_enrolled).astype(int)
    
    # 7. Normalize Skills
    df['skills_list'] = df['Skills'].apply(clean_skills)
    df['skills_clean'] = df['skills_list'].apply(lambda lst: ", ".join(lst))
    
    # 8. Handle Missing Description and create composite document for embedding
    def build_full_text(row):
        desc = str(row['course_description']).strip() if pd.notna(row['course_description']) and str(row['course_description']).strip().lower() != 'nan' else ""
        if not desc or len(desc) < 20:
            desc = f"{row['Title']} course offered by {row['Organization']}. Focuses on key skills including {row['skills_clean']}. Level: {row['Difficulty']}, Format: {row['Type']}, Duration: {row['Duration']}."
        return desc
        
    df['course_description_clean'] = df.apply(build_full_text, axis=1)
    
    # Composite document optimized for sentence transformers
    def build_embed_doc(row):
        return (
            f"Title: {row['Title']} | "
            f"Organization: {row['Organization']} | "
            f"Skills: {row['skills_clean']} | "
            f"Difficulty: {row['Difficulty']} | "
            f"Type: {row['Type']} | "
            f"Duration: {row['Duration']} | "
            f"Description: {row['course_description_clean']}"
        )
        
    df['embed_doc'] = df.apply(build_embed_doc, axis=1)
    
    # 9. Normalize course_url
    def clean_url(row):
        url = str(row['course_url']).strip() if pd.notna(row['course_url']) and str(row['course_url']).strip().lower() != 'nan' else ""
        if not url or not url.startswith('http'):
            query_str = row['Title'].replace(' ', '+')
            url = f"https://www.coursera.org/search?query={query_str}"
        return url
        
    df['course_url_clean'] = df.apply(clean_url, axis=1)
    
    # 10. Normalize Categoricals
    df['Difficulty'] = df['Difficulty'].astype(str).str.strip()
    df['Type'] = df['Type'].astype(str).str.strip()
    df['Duration'] = df['Duration'].astype(str).str.strip()
    
    # 11. Deduplication check
    dups = df.duplicated(subset=['Title', 'Organization'])
    if dups.sum() > 0:
        print(f"Warning: Dropping {dups.sum()} duplicate title+organization rows.")
        df = df.drop_duplicates(subset=['Title', 'Organization']).reset_index(drop=True)
        
    # Ensure target output directory exists
    os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
    
    df.to_csv(output_csv_path, index=False)
    print(f"Successfully processed {len(df)} courses and saved to {output_csv_path}.")
    return df

if __name__ == "__main__":
    raw_path = os.path.abspath("coursera_course_dataset_v3.csv")
    out_path = os.path.abspath("data/processed/courses_clean.csv")
    preprocess_courses(raw_path, out_path)
