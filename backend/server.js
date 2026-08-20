const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const datasetRoutes = require('./routes/datasetRoutes');
const recommendRoutes = require('./routes/recommendRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

app.use(cors());
app.use(express.json());

/* =========================================================
   ROUTES
   ========================================================= */
app.use('/api', datasetRoutes);
app.use('/api', recommendRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

/* =========================================================
   SERVER INITIALIZATION
   ========================================================= */
const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `Node.js Express Server running at http://localhost:${PORT}`
  );
});

module.exports = app;
