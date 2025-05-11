// backend/script/database.js
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const serverConfig = require('../config/serverConfig');

// Initialize the database
const initializeDatabase = async () => {
  const { dbDirectory, dbPath, sqlScript } = serverConfig;

  // Validate and create directory structure
  try {
    if (!fs.existsSync(dbDirectory)) {
      fs.mkdirSync(dbDirectory, { recursive: true });
      console.log(`Created database directory: ${dbDirectory}`);
    }
  } catch (err) {
    console.error(`Failed to create database directory: ${err.message}`);
    process.exit(1);
  }

  let db;
  try {
    // Check if SQL file exists
    if (!fs.existsSync(sqlScript)) {
      throw new Error(`SQL initialization file not found at ${sqlScript}`);
    }

    // Read SQL file
    const initSQL = fs.readFileSync(sqlScript, 'utf8');
    console.log('Successfully read SQL initialization file');

    // Initialize database
    db = new sqlite3.Database(dbPath);

    // Enable foreign key constraints
    await new Promise((resolve, reject) => {
      db.run('PRAGMA foreign_keys = ON;', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Execute SQL commands
    await new Promise((resolve, reject) => {
      db.exec(initSQL, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Database initialized successfully!');

    // Verify tables were created
    await new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) reject(err);
        else {
          console.log('Created tables:', tables.map((t) => t.name).join(', '));
          resolve();
        }
      });
    });

    return true;
  } catch (err) {
    console.error('Error initializing database:', err.message);

    // Clean up if initialization failed
    try {
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log('Removed incomplete database file');
      }
    } catch (cleanupErr) {
      console.error('Failed to clean up database file:', cleanupErr.message);
    }

    return false;
  } finally {
    if (db) {
      db.close();
    }
  }
};

// Run initialization
(async () => {
  const success = await initializeDatabase();
  process.exit(success ? 0 : 1);
})();