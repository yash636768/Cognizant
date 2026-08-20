const fs = require('fs');
const {
  META_PATH,
  TAXONOMY_PATH,
  EVAL_PATH
} = require('../config/paths');

function getDatasetStats() {
  if (!fs.existsSync(META_PATH)) {
    const error = new Error('Dataset metadata not generated yet');
    error.statusCode = 404;
    throw error;
  }

  const rawMeta = fs.readFileSync(META_PATH, 'utf-8');
  const metadata = JSON.parse(rawMeta);

  const totalCourses = metadata.length;
  const orgsSet = new Set(metadata.map((m) => m.organization));
  const ratings = metadata.map((m) => Number(m.ratings));
  const ratingsSum = ratings.reduce((acc, curr) => acc + curr, 0);
  const ratingsMean = Number(
    (ratingsSum / Math.max(ratings.length, 1)).toFixed(2)
  );

  let totalSkills = 0;

  if (fs.existsSync(TAXONOMY_PATH)) {
    const rawTax = fs.readFileSync(TAXONOMY_PATH, 'utf-8');
    const tax = JSON.parse(rawTax);
    totalSkills = tax.length;
  }

  return {
    dataset_name: 'coursera_course_dataset_v3.csv',
    total_courses: totalCourses,
    total_skills_identified: totalSkills,
    total_organizations: orgsSet.size,
    ratings_mean: ratingsMean,
    top_organizations: Array.from(orgsSet).slice(0, 15)
  };
}

function getSkills() {
  if (!fs.existsSync(TAXONOMY_PATH)) {
    return [];
  }

  const rawTax = fs.readFileSync(TAXONOMY_PATH, 'utf-8');
  return JSON.parse(rawTax);
}

function getEvaluationReport() {
  if (!fs.existsSync(EVAL_PATH)) {
    const error = new Error('Evaluation report not generated yet');
    error.statusCode = 404;
    throw error;
  }

  const rawEval = fs.readFileSync(EVAL_PATH, 'utf-8');
  return JSON.parse(rawEval);
}

module.exports = {
  getDatasetStats,
  getSkills,
  getEvaluationReport
};
