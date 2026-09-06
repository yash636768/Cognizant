const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const connectDatabase = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const datasetRoutes = require('./routes/datasetRoutes');
const recommendRoutes = require('./routes/recommendRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api', datasetRoutes);
app.use('/api', recommendRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

app.use('/', datasetRoutes);
app.use('/', recommendRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);


const PORT = process.env.PORT || 5001;

async function startServer() {
  await connectDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Node.js Express Server running at http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  });
}

module.exports = app;
