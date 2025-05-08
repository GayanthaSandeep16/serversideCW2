const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configuration - UPDATED PATHS
const config = {
  dbDirectory: path.join(__dirname, '..', 'data'),
  dbFilename: 'traveltales.db',
  sqlScript: path.join(__dirname, '..', 'sql', 'init-db.sql') // Updated to point to a 'sql' directory
};

// Validate and create directory structure
const ensureDbDirectoryExists = () => {
  try {
    if (!fs.existsSync(config.dbDirectory)) {
      fs.mkdirSync(config.dbDirectory, { recursive: true });
      console.log(`Created database directory: ${config.dbDirectory}`);
    }
    return true;
  } catch (err) {
    console.error(`Failed to create database directory: ${err.message}`);
    return false;
  }
};

// Initialize the database
const initializeDatabase = async () => {
  if (!ensureDbDirectoryExists()) {
    process.exit(1);
  }

  const dbPath = path.join(config.dbDirectory, config.dbFilename);
  let db; // Declare db here so it's accessible in finally

  try {
    // Check if SQL file exists
    if (!fs.existsSync(config.sqlScript)) {
      throw new Error(`SQL initialization file not found at ${config.sqlScript}`);
    }

    // Read SQL file
    const initSQL = fs.readFileSync(config.sqlScript, 'utf8');
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
          console.log('Created tables:', tables.map(t => t.name).join(', '));
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