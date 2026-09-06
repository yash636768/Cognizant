import {
  TrendingUp,
  Cpu,
  Globe,
  Shield,
  Code,
  Briefcase
} from 'lucide-react';

let rawBase = (import.meta.env.VITE_API_BASE_URL || "/api").trim();
rawBase = rawBase.replace(/\/+$/, '');
if (rawBase !== '/api' && !rawBase.endsWith('/api')) {
  rawBase += '/api';
}
export const API_BASE = rawBase;


export const PRESET_SKILLS = [
  "Python Programming",
  "Databases & SQL",
  "Data Analysis",
  "Machine Learning",
  "Probability & Statistics",
  "Cloud Computing",
  "Linux & Systems",
  "Cybersecurity & Network Security",
  "Software Engineering & Programming",
  "Web Development",
  "JavaScript",
  "Data Visualization",
  "Leadership & Management"
];

export const CAREER_TRACKS = [
  { id: "Data Scientist", title: "Data Scientist", icon: TrendingUp, count: "340 Courses", desc: "Extract actionable insights using statistics, ML algorithms, and data pipelines." },
  { id: "AI / Machine Learning Engineer", title: "AI & ML Engineer", icon: Cpu, count: "280 Courses", desc: "Design neural networks, deep learning architectures, and scalable AI systems." },
  { id: "Cloud Solutions Architect", title: "Cloud Architect", icon: Globe, count: "290 Courses", desc: "Architect and manage cloud infrastructure across AWS, GCP, and Microsoft Azure." },
  { id: "Cybersecurity Engineer", title: "Cybersecurity Engineer", icon: Shield, count: "160 Courses", desc: "Protect systems, cloud networks, and data infrastructure from vulnerabilities." },
  { id: "Full-Stack Web Developer", title: "Full-Stack Developer", icon: Code, count: "210 Courses", desc: "Build modern web applications, user interfaces, and server API backends." },
  { id: "Data & Business Analyst", title: "Data & Business Analyst", icon: Briefcase, count: "310 Courses", desc: "Translate complex datasets into executive dashboards and business strategy." }
];

export const DEFAULT_WEIGHTS = {
  semantic_skill_match: 0.40,
  career_skill_gap_relevance: 0.20,
  rating: 0.10,
  difficulty_fit: 0.10,
  duration_fit: 0.08,
  enrollment_popularity: 0.05,
  review_confidence: 0.04,
  type_preference: 0.03
};
