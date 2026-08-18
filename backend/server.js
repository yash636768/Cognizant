const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const CareerModel = require('./careerModel');
const HybridRecommender = require('./recommender');
const {
  registerUser,
  loginUser,
  getUserByToken
} = require('./auth');

const app = express();

app.use(cors());
app.use(express.json());

/* =========================================================
   PATHS
   ========================================================= */

const BASE_DIR = path.resolve(__dirname, '..');

const DATA_DIR = path.join(
  BASE_DIR,
  'data',
  'processed'
);

const MODELS_DIR = path.join(
  BASE_DIR,
  'models'
);

const USER_PROFILES_DIR = path.join(
  BASE_DIR,
  'data'
);

const USER_PROFILES_PATH = path.join(
  USER_PROFILES_DIR,
  'user_profiles.json'
);

const META_PATH = path.join(
  MODELS_DIR,
  'vector_index',
  'course_metadata.json'
);

const EMB_PATH = path.join(
  MODELS_DIR,
  'embeddings',
  'course_embeddings.npy'
);

const FAISS_PATH = path.join(
  MODELS_DIR,
  'vector_index',
  'course_faiss.index'
);

const TAXONOMY_PATH = path.join(
  DATA_DIR,
  'skill_taxonomy.json'
);

const EVAL_PATH = path.join(
  MODELS_DIR,
  'evaluation',
  'eval_report.json'
);


/* =========================================================
   INITIALIZATION
   ========================================================= */

if (!fs.existsSync(USER_PROFILES_DIR)) {
  fs.mkdirSync(USER_PROFILES_DIR, {
    recursive: true
  });
}

if (!fs.existsSync(USER_PROFILES_PATH)) {
  fs.writeFileSync(
    USER_PROFILES_PATH,
    JSON.stringify({}, null, 2)
  );
}


/* =========================================================
   MODELS
   ========================================================= */

const careerModel = new CareerModel(
  TAXONOMY_PATH
);

let recommender = null;

function getRecommender() {
  if (
    !recommender &&
    fs.existsSync(META_PATH)
  ) {
    recommender =
      new HybridRecommender(
        META_PATH,
        EMB_PATH,
        FAISS_PATH
      );
  }

  return recommender;
}


/* =========================================================
   PROFILE HELPERS
   ========================================================= */

function readUserProfiles() {
  try {
    if (!fs.existsSync(USER_PROFILES_PATH)) {
      return {};
    }

    const raw = fs.readFileSync(
      USER_PROFILES_PATH,
      'utf-8'
    );

    return JSON.parse(raw || '{}');
  } catch (error) {
    console.error(
      'Error reading user profiles:',
      error
    );

    return {};
  }
}


function writeUserProfiles(profiles) {
  fs.writeFileSync(
    USER_PROFILES_PATH,
    JSON.stringify(
      profiles,
      null,
      2
    )
  );
}


/*
 * We use the user's email as the profile key.
 * Email is already available through your
 * authenticated user object.
 */
function getProfileKey(user) {
  if (!user) {
    return null;
  }

  return (
    user.email ||
    user.id ||
    user._id ||
    null
  );
}


/* =========================================================
   AUTHENTICATION MIDDLEWARE
   ========================================================= */

function authenticateUser(req, res, next) {
  const authHeader =
    req.headers.authorization || '';

  const token = authHeader
    .replace(/^Bearer\s+/i, '')
    .trim();

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required.'
    });
  }

  const user =
    getUserByToken(token);

  if (!user) {
    return res.status(401).json({
      error: 'Invalid or expired token.'
    });
  }

  req.user = user;

  next();
}


/* =========================================================
   1. GET /api/dataset-stats
   ========================================================= */

app.get(
  '/api/dataset-stats',
  (req, res) => {
    if (!fs.existsSync(META_PATH)) {
      return res.status(404).json({
        error:
          'Dataset metadata not generated yet'
      });
    }

    try {
      const rawMeta =
        fs.readFileSync(
          META_PATH,
          'utf-8'
        );

      const metadata =
        JSON.parse(rawMeta);

      const totalCourses =
        metadata.length;

      const orgsSet =
        new Set(
          metadata.map(
            (m) => m.organization
          )
        );

      const ratings =
        metadata.map(
          (m) => Number(m.ratings)
        );

      const ratingsSum =
        ratings.reduce(
          (acc, curr) =>
            acc + curr,
          0
        );

      const ratingsMean =
        Number(
          (
            ratingsSum /
            Math.max(
              ratings.length,
              1
            )
          ).toFixed(2)
        );

      let totalSkills = 0;

      if (
        fs.existsSync(
          TAXONOMY_PATH
        )
      ) {
        const rawTax =
          fs.readFileSync(
            TAXONOMY_PATH,
            'utf-8'
          );

        const tax =
          JSON.parse(rawTax);

        totalSkills =
          tax.length;
      }

      return res.json({
        dataset_name:
          'coursera_course_dataset_v3.csv',

        total_courses:
          totalCourses,

        total_skills_identified:
          totalSkills,

        total_organizations:
          orgsSet.size,

        ratings_mean:
          ratingsMean,

        top_organizations:
          Array.from(
            orgsSet
          ).slice(0, 15)
      });

    } catch (err) {
      console.error(
        'Error in /api/dataset-stats:',
        err
      );

      return res.status(500).json({
        error: err.message
      });
    }
  }
);


/* =========================================================
   2. GET /api/skills
   ========================================================= */

app.get(
  '/api/skills',
  (req, res) => {
    if (
      !fs.existsSync(
        TAXONOMY_PATH
      )
    ) {
      return res.json([]);
    }

    try {
      const rawTax =
        fs.readFileSync(
          TAXONOMY_PATH,
          'utf-8'
        );

      const tax =
        JSON.parse(rawTax);

      return res.json(tax);

    } catch (err) {
      console.error(
        'Error in /api/skills:',
        err
      );

      return res.status(500).json({
        error: err.message
      });
    }
  }
);


/* =========================================================
   3. GET /api/evaluation
   ========================================================= */

app.get(
  '/api/evaluation',
  (req, res) => {
    if (
      !fs.existsSync(
        EVAL_PATH
      )
    ) {
      return res.status(404).json({
        error:
          'Evaluation report not generated yet'
      });
    }

    try {
      const rawEval =
        fs.readFileSync(
          EVAL_PATH,
          'utf-8'
        );

      const report =
        JSON.parse(rawEval);

      return res.json(report);

    } catch (err) {
      console.error(
        'Error in /api/evaluation:',
        err
      );

      return res.status(500).json({
        error: err.message
      });
    }
  }
);


/* =========================================================
   4. POST /api/recommend
   ========================================================= */

app.post(
  '/api/recommend',
  (req, res) => {
    const recEngine =
      getRecommender();

    if (!recEngine) {
      return res.status(500).json({
        error:
          'Recommendation index not ready'
      });
    }

    try {
      const data =
        req.body || {};

      const currentSkills =
        data.current_skills || [];

      const targetCareer =
        data.target_career || '';

      const userQuery =
        data.user_query || '';

      const preferredDifficulty =
        data.preferred_difficulty ||
        'Any';

      const preferredDuration =
        data.preferred_duration ||
        'Any';

      const preferredType =
        data.preferred_type ||
        'Any';

      const customWeights =
        data.custom_weights ||
        null;

      const topK =
        parseInt(
          data.top_k || 10,
          10
        );


      /* -----------------------------------------
         Career Trajectory Matching
      ----------------------------------------- */

      const interestText =
        `${targetCareer} ${userQuery}`.trim();

      const careerEvals =
        careerModel.evaluateCareers(
          currentSkills,
          interestText
        );

      let selectedCareerProfile =
        null;

      let targetMissingSkills =
        [];


      if (targetCareer) {
        for (
          const c of careerEvals
        ) {
          if (
            c.title
              .toLowerCase() ===
              targetCareer.toLowerCase() ||

            c.career_key
              .toLowerCase() ===
              targetCareer.toLowerCase()
          ) {
            selectedCareerProfile =
              c;

            targetMissingSkills =
              c.missing_core_skills.concat(
                c.missing_supp_skills
              );

            break;
          }
        }
      }


      if (
        !selectedCareerProfile &&
        careerEvals.length > 0
      ) {
        selectedCareerProfile =
          careerEvals[0];

        targetMissingSkills =
          selectedCareerProfile
            .missing_core_skills
            .concat(
              selectedCareerProfile
                .missing_supp_skills
            );
      }


      /* -----------------------------------------
         Hybrid Recommendation
      ----------------------------------------- */

      const recs =
        recEngine.recommend({
          current_skills:
            currentSkills,

          target_career_missing_skills:
            targetMissingSkills,

          user_query:
            userQuery ||
            (
              selectedCareerProfile
                ? selectedCareerProfile.title
                : ''
            ),

          preferred_difficulty:
            preferredDifficulty,

          preferred_duration:
            preferredDuration,

          preferred_type:
            preferredType,

          custom_weights:
            customWeights,

          top_k:
            topK
        });


      return res.json({
        dataset_grounding:
          'Powered by Hackathon Dataset (coursera_course_dataset_v3.csv)',

        career_candidates:
          careerEvals,

        selected_career:
          selectedCareerProfile,

        target_missing_skills:
          targetMissingSkills,

        recommendations:
          recs
      });

    } catch (err) {
      console.error(
        'Error in /api/recommend:',
        err
      );

      return res.status(500).json({
        error: err.message
      });
    }
  }
);


/* =========================================================
   AUTH ENDPOINTS
   ========================================================= */


/* -----------------------------------------
   5. POST /api/auth/register
----------------------------------------- */

app.post(
  '/api/auth/register',
  (req, res) => {
    try {
      const {
        name,
        email,
        password
      } = req.body || {};

      const result =
        registerUser({
          name,
          email,
          password
        });

      return res
        .status(201)
        .json(result);

    } catch (err) {
      return res
        .status(400)
        .json({
          error: err.message
        });
    }
  }
);


/* -----------------------------------------
   6. POST /api/auth/login
----------------------------------------- */

app.post(
  '/api/auth/login',
  (req, res) => {
    try {
      const {
        email,
        password
      } = req.body || {};

      const result =
        loginUser({
          email,
          password
        });

      return res.json(result);

    } catch (err) {
      return res
        .status(401)
        .json({
          error: err.message
        });
    }
  }
);


/* -----------------------------------------
   7. GET /api/auth/me
----------------------------------------- */

app.get(
  '/api/auth/me',
  (req, res) => {
    const authHeader =
      req.headers.authorization || '';

    const token =
      authHeader
        .replace(
          /^Bearer\s+/i,
          ''
        )
        .trim();

    if (!token) {
      return res.status(401).json({
        error:
          'No token provided.'
      });
    }

    const user =
      getUserByToken(token);

    if (!user) {
      return res.status(401).json({
        error:
          'Invalid or expired token.'
      });
    }

    return res.json({
      user
    });
  }
);


/* =========================================================
   USER PROFILE ENDPOINTS
   ========================================================= */


/* -----------------------------------------
   8. GET /api/profile

   Returns the logged-in user's profile.
----------------------------------------- */

app.get(
  '/api/profile',
  authenticateUser,
  (req, res) => {
    try {
      const profiles =
        readUserProfiles();

      const profileKey =
        getProfileKey(
          req.user
        );

      if (!profileKey) {
        return res.status(400).json({
          error:
            'Unable to identify user.'
        });
      }

      const profile =
        profiles[profileKey];

      if (!profile) {
        return res.json({
          profile: null
        });
      }

      return res.json({
        profile
      });

    } catch (err) {
      console.error(
        'Error in GET /api/profile:',
        err
      );

      return res.status(500).json({
        error: err.message
      });
    }
  }
);


/* -----------------------------------------
   9. PUT /api/profile

   Updates basic profile information.
----------------------------------------- */

app.put(
  '/api/profile',
  authenticateUser,
  (req, res) => {
    try {
      const profiles =
        readUserProfiles();

      const profileKey =
        getProfileKey(
          req.user
        );

      if (!profileKey) {
        return res.status(400).json({
          error:
            'Unable to identify user.'
        });
      }

      const existingProfile =
        profiles[profileKey] || {
          name:
            req.user.name || '',

          email:
            req.user.email || '',

          assessment_history: []
        };


      const updatedProfile = {
        ...existingProfile,

        name:
          req.body.name ??
          existingProfile.name,

        email:
          req.user.email ||
          existingProfile.email,

        updated_at:
          new Date().toISOString()
      };


      profiles[profileKey] =
        updatedProfile;

      writeUserProfiles(
        profiles
      );

      return res.json({
        message:
          'Profile updated successfully.',

        profile:
          updatedProfile
      });

    } catch (err) {
      console.error(
        'Error in PUT /api/profile:',
        err
      );

      return res.status(500).json({
        error: err.message
      });
    }
  }
);


/* -----------------------------------------
   10. POST /api/profile/assessment

   Saves assessment + recommendations.
----------------------------------------- */

app.post(
  '/api/profile/assessment',
  authenticateUser,
  (req, res) => {
    try {
      const profiles =
        readUserProfiles();

      const profileKey =
        getProfileKey(
          req.user
        );

      if (!profileKey) {
        return res.status(400).json({
          error:
            'Unable to identify user.'
        });
      }


      const existingProfile =
        profiles[profileKey] || {
          name:
            req.user.name || '',

          email:
            req.user.email || '',

          assessment_history: []
        };


      const assessment = {
        id:
          `assessment_${Date.now()}`,

        created_at:
          new Date().toISOString(),

        target_career:
          req.body.target_career ||
          '',

        current_skills:
          req.body.current_skills ||
          [],

        user_query:
          req.body.user_query ||
          '',

        preferred_difficulty:
          req.body.preferred_difficulty ||
          'Any',

        preferred_duration:
          req.body.preferred_duration ||
          'Any',

        preferred_type:
          req.body.preferred_type ||
          'Any',

        custom_weights:
          req.body.custom_weights ||
          null,

        selected_career:
          req.body.selected_career ||
          null,

        target_missing_skills:
          req.body.target_missing_skills ||
          [],

        recommendations:
          req.body.recommendations ||
          []
      };


      const updatedProfile = {
        ...existingProfile,

        name:
          req.user.name ||
          existingProfile.name,

        email:
          req.user.email ||
          existingProfile.email,

        target_career:
          assessment.target_career,

        current_skills:
          assessment.current_skills,

        user_query:
          assessment.user_query,

        preferred_difficulty:
          assessment.preferred_difficulty,

        preferred_duration:
          assessment.preferred_duration,

        preferred_type:
          assessment.preferred_type,

        custom_weights:
          assessment.custom_weights,

        selected_career:
          assessment.selected_career,

        target_missing_skills:
          assessment.target_missing_skills,

        recommendations:
          assessment.recommendations,

        last_assessment_at:
          assessment.created_at,

        assessment_history: [
          ...(existingProfile.assessment_history || []),
          assessment
        ],

        updated_at:
          new Date().toISOString()
      };


      profiles[profileKey] =
        updatedProfile;

      writeUserProfiles(
        profiles
      );


      return res.status(201).json({
        message:
          'Assessment saved successfully.',

        profile:
          updatedProfile
      });

    } catch (err) {
      console.error(
        'Error in POST /api/profile/assessment:',
        err
      );

      return res.status(500).json({
        error: err.message
      });
    }
  }
);


/* -----------------------------------------
   11. DELETE /api/profile/assessment/:id

   Allows a user to remove an old assessment.
----------------------------------------- */

app.delete(
  '/api/profile/assessment/:id',
  authenticateUser,
  (req, res) => {
    try {
      const profiles =
        readUserProfiles();

      const profileKey =
        getProfileKey(
          req.user
        );

      if (!profileKey) {
        return res.status(400).json({
          error:
            'Unable to identify user.'
        });
      }

      const profile =
        profiles[profileKey];

      if (!profile) {
        return res.status(404).json({
          error:
            'Profile not found.'
        });
      }


      const history =
        profile.assessment_history ||
        [];

      const updatedHistory =
        history.filter(
          (item) =>
            item.id !==
            req.params.id
        );


      profiles[profileKey] = {
        ...profile,

        assessment_history:
          updatedHistory,

        updated_at:
          new Date().toISOString()
      };


      writeUserProfiles(
        profiles
      );

      return res.json({
        message:
          'Assessment removed successfully.',

        profile:
          profiles[profileKey]
      });

    } catch (err) {
      console.error(
        'Error deleting assessment:',
        err
      );

      return res.status(500).json({
        error: err.message
      });
    }
  }
);


/* =========================================================
   SERVER
   ========================================================= */

const PORT =
  process.env.PORT || 5001;

app.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `Node.js Express Server running at http://localhost:${PORT}`
    );
  }
);
