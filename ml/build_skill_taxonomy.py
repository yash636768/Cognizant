import os
import json
import pandas as pd
import ast
from collections import Counter, defaultdict

# Known canonical mappings for high-frequency domain skills
CANONICAL_SYNONYMS = {
    "python programming": "Python Programming",
    "python": "Python Programming",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "applied machine learning": "Machine Learning",
    "machine learning algorithms": "Machine Learning",
    "deep learning": "Deep Learning & AI",
    "artificial intelligence (ai)": "Deep Learning & AI",
    "artificial intelligence": "Deep Learning & AI",
    "ai": "Deep Learning & AI",
    "data analysis": "Data Analysis",
    "data analytics": "Data Analysis",
    "business analysis": "Business Analysis",
    "cloud computing": "Cloud Computing",
    "cloud platforms": "Cloud Computing",
    "cloud infrastructure": "Cloud Computing",
    "google cloud platform": "Google Cloud Platform (GCP)",
    "gcp": "Google Cloud Platform (GCP)",
    "aws": "Amazon Web Services (AWS)",
    "amazon web services": "Amazon Web Services (AWS)",
    "microsoft azure": "Microsoft Azure",
    "azure": "Microsoft Azure",
    "network security": "Cybersecurity & Network Security",
    "cybersecurity": "Cybersecurity & Network Security",
    "security engineering": "Cybersecurity & Network Security",
    "computer programming": "Software Engineering & Programming",
    "software engineering": "Software Engineering & Programming",
    "web development": "Web Development",
    "databases": "Databases & SQL",
    "sql": "Databases & SQL",
    "relational database": "Databases & SQL",
    "r programming": "R Programming",
    "data visualization": "Data Visualization",
    "leadership and management": "Leadership & Management",
    "leadership": "Leadership & Management",
    "management": "Leadership & Management",
    "probability & statistics": "Probability & Statistics",
    "general statistics": "Probability & Statistics",
    "statistics": "Probability & Statistics",
    "devops": "DevOps & CI/CD",
    "linux": "Linux & Systems",
    "system security": "Cybersecurity & Network Security",
    "communication": "Communication & Soft Skills"
}

def build_taxonomy(clean_csv_path, output_json_path):
    print(f"Building skill taxonomy from {clean_csv_path}...")
    df = pd.read_csv(clean_csv_path)
    
    # Extract raw skills
    all_raw_skills = []
    course_skills_map = []
    
    for idx, row in df.iterrows():
        skills_raw = str(row['skills_clean']).split(',')
        skills_clean = [s.strip() for s in skills_raw if s.strip()]
        course_skills_map.append(skills_clean)
        all_raw_skills.extend(skills_clean)
        
    raw_counts = Counter(all_raw_skills)
    
    # Map raw skills to canonical skills
    raw_to_canonical = {}
    canonical_aliases = defaultdict(set)
    canonical_course_counts = Counter()
    
    for raw_skill in raw_counts:
        key = raw_skill.lower().strip()
        if key in CANONICAL_SYNONYMS:
            canonical = CANONICAL_SYNONYMS[key]
        else:
            canonical = raw_skill # default to original string
            
        raw_to_canonical[raw_skill] = canonical
        canonical_aliases[canonical].add(raw_skill)
        
    # Count canonical frequencies and co-occurrences
    co_occurrence = defaultdict(Counter)
    
    for skills_list in course_skills_map:
        canonical_in_course = set()
        for s in skills_list:
            c = raw_to_canonical.get(s, s)
            canonical_in_course.add(c)
            
        for c in canonical_in_course:
            canonical_course_counts[c] += 1
            for other_c in canonical_in_course:
                if c != other_c:
                    co_occurrence[c][other_c] += 1
                    
    # Format taxonomy JSON
    taxonomy = []
    for canonical, count in canonical_course_counts.most_common():
        aliases = list(canonical_aliases[canonical])
        if canonical not in aliases:
            aliases.append(canonical)
            
        related = [item[0] for item in co_occurrence[canonical].most_common(6)]
        
        taxonomy.append({
            "canonical_skill": canonical,
            "aliases": aliases,
            "related_skills": related,
            "course_count": count
        })
        
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(taxonomy, f, indent=2)
        
    print(f"Taxonomy built successfully with {len(taxonomy)} canonical skills saved to {output_json_path}.")
    return taxonomy

if __name__ == "__main__":
    clean_csv = os.path.abspath("data/processed/courses_clean.csv")
    out_json = os.path.abspath("data/processed/skill_taxonomy.json")
    build_taxonomy(clean_csv, out_json)
