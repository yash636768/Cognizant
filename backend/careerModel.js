const fs = require('fs');
const path = require('path');

const CAREER_PROFILES = {
  "Data Scientist": {
    title: "Data Scientist",
    description: "Extracts actionable insights from data using statistics, machine learning, and programming.",
    core_skills: ["Python Programming", "Data Analysis", "Databases & SQL", "Machine Learning", "Probability & Statistics"],
    supporting_skills: ["Data Visualization", "Deep Learning & AI", "R Programming", "Data Management", "Algorithms"],
    dataset_demand_freq: 340
  },
  "AI / Machine Learning Engineer": {
    title: "AI / Machine Learning Engineer",
    description: "Designs and builds intelligent ML models, neural networks, and scalable AI systems.",
    core_skills: ["Python Programming", "Machine Learning", "Deep Learning & AI", "Software Engineering & Programming", "Algorithms"],
    supporting_skills: ["Cloud Computing", "Databases & SQL", "Data Management", "Probability & Statistics"],
    dataset_demand_freq: 280
  },
  "Cloud Solutions Architect": {
    title: "Cloud Solutions Architect",
    description: "Architects, deploys, and manages infrastructure across AWS, GCP, and Microsoft Azure.",
    core_skills: ["Cloud Computing", "Linux & Systems", "Google Cloud Platform (GCP)", "Amazon Web Services (AWS)", "Microsoft Azure"],
    supporting_skills: ["Cybersecurity & Network Security", "DevOps & CI/CD", "Software Engineering & Programming"],
    dataset_demand_freq: 290
  },
  "Cybersecurity Engineer": {
    title: "Cybersecurity Engineer",
    description: "Protects networks, cloud systems, data, and infrastructure from threats and vulnerabilities.",
    core_skills: ["Cybersecurity & Network Security", "Linux & Systems", "Software Engineering & Programming"],
    supporting_skills: ["Cloud Computing", "Risk Management", "Problem Solving", "Databases & SQL"],
    dataset_demand_freq: 160
  },
  "Full-Stack Web Developer": {
    title: "Full-Stack Web Developer",
    description: "Builds end-to-end web applications combining user interfaces and server APIs.",
    core_skills: ["Software Engineering & Programming", "Web Development", "Databases & SQL", "JavaScript"],
    supporting_skills: ["Cloud Computing", "Algorithms", "Data Visualization", "Communication & Soft Skills"],
    dataset_demand_freq: 210
  },
  "Data & Business Analyst": {
    title: "Data & Business Analyst",
    description: "Translates complex datasets into executive dashboards, business reports, and strategic decisions.",
    core_skills: ["Data Analysis", "Business Analysis", "Databases & SQL", "Data Visualization"],
    supporting_skills: ["Python Programming", "Leadership & Management", "Communication & Soft Skills", "Probability & Statistics"],
    dataset_demand_freq: 310
  },
  "Product & Strategy Leader": {
    title: "Product & Strategy Leader",
    description: "Drives product vision, team alignment, business strategy, and operations execution.",
    core_skills: ["Leadership & Management", "Strategy", "Communication & Soft Skills", "Business Analysis"],
    supporting_skills: ["Finance", "Marketing", "Problem Solving", "Strategy and Operations"],
    dataset_demand_freq: 350
  }
};

class CareerModel {
  constructor(taxonomyPath = null) {
    this.profiles = CAREER_PROFILES;
    this.taxonomy = {};
    if (taxonomyPath && fs.existsSync(taxonomyPath)) {
      try {
        const rawData = fs.readFileSync(taxonomyPath, 'utf-8');
        const taxData = JSON.parse(rawData);
        for (const item of taxData) {
          const canonical = item.canonical_skill;
          this.taxonomy[canonical.toLowerCase()] = item;
          if (item.aliases && Array.isArray(item.aliases)) {
            for (const alias of item.aliases) {
              this.taxonomy[alias.toLowerCase()] = item;
            }
          }
        }
      } catch (err) {
        console.error("Error reading taxonomy file:", err);
      }
    }
  }

  normalizeUserSkill(rawSkill) {
    const key = rawSkill.trim().toLowerCase();
    if (this.taxonomy[key]) {
      return this.taxonomy[key].canonical_skill;
    }
    // Capitalize Title Case fallback
    return rawSkill.trim().replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
  }

  evaluateCareers(userSkills = [], interestText = "") {
    const normalizedSkills = new Set(
      userSkills
        .filter((s) => s && s.trim())
        .map((s) => this.normalizeUserSkill(s))
    );
    const interestLower = (interestText || "").toLowerCase();

    const rankedCareers = [];

    for (const [careerKey, profile] of Object.entries(this.profiles)) {
      const core = new Set(profile.core_skills);
      const supp = new Set(profile.supporting_skills);

      const matchedCore = [];
      const missingCore = [];
      for (const skill of core) {
        if (normalizedSkills.has(skill)) {
          matchedCore.push(skill);
        } else {
          missingCore.push(skill);
        }
      }

      const matchedSupp = [];
      const missingSupp = [];
      for (const skill of supp) {
        if (normalizedSkills.has(skill)) {
          matchedSupp.push(skill);
        } else {
          missingSupp.push(skill);
        }
      }

      const coreScore = matchedCore.length / Math.max(core.size, 1);
      const suppScore = matchedSupp.length / Math.max(supp.size, 1);

      // Interest alignment bonus
      let interestBonus = 0.0;
      if (
        profile.title.toLowerCase().includes(interestLower) ||
        careerKey.toLowerCase().includes(interestLower) ||
        (interestLower && interestLower.includes(profile.title.toLowerCase()))
      ) {
        interestBonus = 0.25;
      } else {
        for (const skill of core) {
          if (interestLower.includes(skill.toLowerCase())) {
            interestBonus += 0.05;
          }
        }
        interestBonus = Math.min(interestBonus, 0.25);
      }

      const totalMatchPct = (0.50 * coreScore + 0.25 * suppScore + 0.25 * interestBonus) * 100.0;

      rankedCareers.push({
        career_key: careerKey,
        title: profile.title,
        description: profile.description,
        match_percentage: Number(Math.min(totalMatchPct, 100.0).toFixed(1)),
        matched_core_skills: matchedCore,
        matched_supp_skills: matchedSupp,
        missing_core_skills: missingCore,
        missing_supp_skills: missingSupp,
        dataset_demand_freq: profile.dataset_demand_freq
      });
    }

    rankedCareers.sort((a, b) => b.match_percentage - a.match_percentage);
    return rankedCareers;
  }
}

module.exports = CareerModel;
