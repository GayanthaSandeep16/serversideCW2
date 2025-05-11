// backend/src/app.js
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const erroMiddleware = require('./middleware/errorMiddleware');
const serverConfig = require('./config/serverConfig');
const fs = require('fs');
const { exec } = require('child_process');

// Database initialization
const initializeDatabaseIfNeeded = async () => {
  const { dbDirectory, dbPath, sqlScript } = serverConfig;

  // Ensure the database directory exists
  if (!fs.existsSync(dbDirectory)) {
    console.log(`Creating database directory: ${dbDirectory}`);
    fs.mkdirSync(dbDirectory, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    console.log('Database file not found. Initializing database...');
    console.log(`Database path: ${dbPath}`);
    console.log(`SQL script path: ${sqlScript}`);
    
    try {
      // Check if SQL script exists
      if (!fs.existsSync(sqlScript)) {
        console.error(`SQL script not found: ${sqlScript}`);
        process.exit(1);
      }
      
      await new Promise((resolve, reject) => {
        exec(`node ${__dirname}/script/database.js`, (err) => {
          if (err) {
            console.error('Error executing database script:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
      console.log('Database initialized successfully.');
    } catch (err) {
      console.error('Failed to initialize database:', err.message);
      process.exit(1);
    }
  } else {
    console.log(`Database file found at ${dbPath}. Skipping initialization.`);
  }
};

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);
app.use(erroMiddleware);

// Initialize database
initializeDatabaseIfNeeded().catch((err) => {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
});

module.exports = app;