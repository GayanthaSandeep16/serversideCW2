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

    // Check if database exists and has tables
    const dbExists = fs.existsSync(dbPath);
    let needsInitialization = !dbExists;

    if (dbExists) {
      // Check if database has tables
      db = new sqlite3.Database(dbPath);
      const tables = await new Promise((resolve, reject) => {
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
          if (err) reject(err);
          else resolve(tables);
        });
      });
      
      if (tables.length === 0) {
        console.log('Database exists but has no tables. Initializing...');
        needsInitialization = true;
      } else {
        console.log('Database exists with tables:', tables.map(t => t.name).join(', '));
      }
    }

    if (needsInitialization) {
      if (dbExists) {
        console.log('Removing existing database file...');
        fs.unlinkSync(dbPath);
      }

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
    } else {
      console.log('Database already initialized, skipping initialization.');
    }

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
  if (!success) {
    console.error('Database initialization failed');
    process.exit(1);
  }
  console.log('Database initialization completed successfully');
})();