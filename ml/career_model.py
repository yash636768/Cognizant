import json
import os
from collections import Counter

CAREER_PROFILES = {
    "Data Scientist": {
        "title": "Data Scientist",
        "description": "Extracts actionable insights from data using statistics, machine learning, and programming.",
        "core_skills": ["Python Programming", "Data Analysis", "Databases & SQL", "Machine Learning", "Probability & Statistics"],
        "supporting_skills": ["Data Visualization", "Deep Learning & AI", "R Programming", "Data Management", "Algorithms"],
        "dataset_demand_freq": 340
    },
    "AI / Machine Learning Engineer": {
        "title": "AI / Machine Learning Engineer",
        "description": "Designs and builds intelligent ML models, neural networks, and scalable AI systems.",
        "core_skills": ["Python Programming", "Machine Learning", "Deep Learning & AI", "Software Engineering & Programming", "Algorithms"],
        "supporting_skills": ["Cloud Computing", "Databases & SQL", "Data Management", "Probability & Statistics"],
        "dataset_demand_freq": 280
    },
    "Cloud Solutions Architect": {
        "title": "Cloud Solutions Architect",
        "description": "Architects, deploys, and manages infrastructure across AWS, GCP, and Microsoft Azure.",
        "core_skills": ["Cloud Computing", "Linux & Systems", "Google Cloud Platform (GCP)", "Amazon Web Services (AWS)", "Microsoft Azure"],
        "supporting_skills": ["Cybersecurity & Network Security", "DevOps & CI/CD", "Software Engineering & Programming"],
        "dataset_demand_freq": 290
    },
    "Cybersecurity Engineer": {
        "title": "Cybersecurity Engineer",
        "description": "Protects networks, cloud systems, data, and infrastructure from threats and vulnerabilities.",
        "core_skills": ["Cybersecurity & Network Security", "Linux & Systems", "Software Engineering & Programming"],
        "supporting_skills": ["Cloud Computing", "Risk Management", "Problem Solving", "Databases & SQL"],
        "dataset_demand_freq": 160
    },
    "Full-Stack Web Developer": {
        "title": "Full-Stack Web Developer",
        "description": "Builds end-to-end web applications combining user interfaces and server APIs.",
        "core_skills": ["Software Engineering & Programming", "Web Development", "Databases & SQL", "JavaScript"],
        "supporting_skills": ["Cloud Computing", "Algorithms", "Data Visualization", "Communication & Soft Skills"],
        "dataset_demand_freq": 210
    },
    "Data & Business Analyst": {
        "title": "Data & Business Analyst",
        "description": "Translates complex datasets into executive dashboards, business reports, and strategic decisions.",
        "core_skills": ["Data Analysis", "Business Analysis", "Databases & SQL", "Data Visualization"],
        "supporting_skills": ["Python Programming", "Leadership & Management", "Communication & Soft Skills", "Probability & Statistics"],
        "dataset_demand_freq": 310
    },
    "Product & Strategy Leader": {
        "title": "Product & Strategy Leader",
        "description": "Drives product vision, team alignment, business strategy, and operations execution.",
        "core_skills": ["Leadership & Management", "Strategy", "Communication & Soft Skills", "Business Analysis"],
        "supporting_skills": ["Finance", "Marketing", "Problem Solving", "Strategy and Operations"],
        "dataset_demand_freq": 350
    }
}

class CareerModel:
    def __init__(self, taxonomy_path=None):
        self.profiles = CAREER_PROFILES
        self.taxonomy = {}
        if taxonomy_path and os.path.exists(taxonomy_path):
            with open(taxonomy_path, 'r', encoding='utf-8') as f:
                tax_data = json.load(f)
                for item in tax_data:
                    self.taxonomy[item['canonical_skill'].lower()] = item
                    for alias in item.get('aliases', []):
                        self.taxonomy[alias.lower()] = item

    def normalize_user_skill(self, raw_skill):
        key = raw_skill.strip().lower()
        if key in self.taxonomy:
            return self.taxonomy[key]['canonical_skill']
        return raw_skill.strip().title()

    def evaluate_careers(self, user_skills, interest_text=""):
        normalized_skills = set(self.normalize_user_skill(s) for s in user_skills if s.strip())
        interest_lower = interest_text.lower()
        
        ranked_careers = []
        for career_key, profile in self.profiles.items():
            core = set(profile["core_skills"])
            supp = set(profile["supporting_skills"])
            
            matched_core = normalized_skills.intersection(core)
            matched_supp = normalized_skills.intersection(supp)
            missing_core = list(core - normalized_skills)
            missing_supp = list(supp - normalized_skills)
            
            core_score = len(matched_core) / max(len(core), 1)
            supp_score = len(matched_supp) / max(len(supp), 1)
            
            # Interest alignment check
            interest_bonus = 0.0
            if profile["title"].lower() in interest_lower or career_key.lower() in interest_lower:
                interest_bonus = 0.25
            else:
                for skill in core:
                    if skill.lower() in interest_lower:
                        interest_bonus += 0.05
                interest_bonus = min(interest_bonus, 0.25)
                
            total_match_pct = (0.50 * core_score + 0.25 * supp_score + 0.25 * interest_bonus) * 100.0
            
            ranked_careers.append({
                "career_key": career_key,
                "title": profile["title"],
                "description": profile["description"],
                "match_percentage": round(min(total_match_pct, 100.0), 1),
                "matched_core_skills": list(matched_core),
                "matched_supp_skills": list(matched_supp),
                "missing_core_skills": missing_core,
                "missing_supp_skills": missing_supp,
                "dataset_demand_freq": profile["dataset_demand_freq"]
            })
            
        ranked_careers.sort(key=lambda x: x["match_percentage"], reverse=True)
        return ranked_careers

if __name__ == "__main__":
    cm = CareerModel("data/processed/skill_taxonomy.json")
    res = cm.evaluate_careers(["Python", "SQL", "Statistics"], interest_text="Data Science")
    print("Top matched career:", res[0]["title"], f"({res[0]['match_percentage']}%)")
    print("Missing core skills:", res[0]["missing_core_skills"])
