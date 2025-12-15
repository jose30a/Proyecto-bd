/**
 * Script to run SQL files and set up the database
 * 
 * Usage Examples:
 *   node setup-database.js create.sql
 *   node setup-database.js drop.sql
 *   node setup-database.js insert.sql
 *   node setup-database.js create.sql insert.sql
 *   node setup-database.js drop.sql create.sql insert.sql
 *   node setup-database.js --create --drop --insert
 *   node setup-database.js --all
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Default file names
const DEFAULT_FILES = {
  create: 'create.sql',
  drop: 'drop.sql',
  insert: 'insert.sql'
};

async function runSqlFile(filePath, description = '') {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log(`\n📄 Reading SQL file: ${filePath}`);
    if (description) {
      console.log(`   ${description}`);
    }

    const sql = fs.readFileSync(filePath, 'utf8');

    if (!sql.trim()) {
      console.log(`⚠️  File is empty, skipping...`);
      return;
    }

    console.log(`⚙️  Executing SQL statements...`);
    await pool.query(sql);

    console.log(`✅ Successfully executed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error executing ${filePath}:`, error.message);
    throw error;
  }
}

function parseArguments() {
  const args = process.argv.slice(2);
  const files = [];
  const flags = {
    create: false,
    drop: false,
    insert: false,
    all: false
  };

  // Check for flags
  args.forEach(arg => {
    if (arg === '--all') {
      flags.all = true;
    } else if (arg === '--create') {
      flags.create = true;
    } else if (arg === '--drop') {
      flags.drop = true;
    } else if (arg === '--insert') {
      flags.insert = true;
    } else if (!arg.startsWith('--')) {
      // It's a file path
      files.push(arg);
    }
  });

  // If --all flag, add all default files
  if (flags.all) {
    return [
      { path: DEFAULT_FILES.drop, description: 'Dropping all tables...' },
      { path: DEFAULT_FILES.create, description: 'Creating tables...' },
      { path: DEFAULT_FILES.insert, description: 'Inserting data...' }
    ];
  }

  // If flags are used, use default file names
  if (flags.drop || flags.create || flags.insert) {
    const result = [];
    if (flags.drop) {
      result.push({ path: DEFAULT_FILES.drop, description: 'Dropping all tables...' });
    }
    if (flags.create) {
      result.push({ path: DEFAULT_FILES.create, description: 'Creating tables...' });
    }
    if (flags.insert) {
      result.push({ path: DEFAULT_FILES.insert, description: 'Inserting data...' });
    }
    return result;
  }

  // Otherwise, use provided file paths
  if (files.length === 0) {
    return null; // Will show usage
  }

  return files.map(file => ({ path: file, description: '' }));
}

function showUsage() {
  console.log(`
📖 Usage:
  
  Run specific files:
    node setup-database.js create.sql
    node setup-database.js drop.sql
    node setup-database.js insert.sql
    node setup-database.js create.sql insert.sql
    node setup-database.js drop.sql create.sql insert.sql
  
  Use flags (with default file names):
    node setup-database.js --create
    node setup-database.js --drop
    node setup-database.js --insert
    node setup-database.js --create --insert
    node setup-database.js --drop --create --insert
  
  Run all files in order (drop → create → insert):
    node setup-database.js --all
  
  Default file names: create.sql, drop.sql, insert.sql
  Files are executed in the order you specify them.
  `);
}

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...\n');

    // Check if database connection works
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');

    // Parse arguments
    const filesToRun = parseArguments();

    if (!filesToRun) {
      showUsage();
      process.exit(0);
    }

    // Run SQL files in order
    for (const fileInfo of filesToRun) {
      const filePath = path.isAbsolute(fileInfo.path)
        ? fileInfo.path
        : path.join(__dirname, fileInfo.path);

      await runSqlFile(filePath, fileInfo.description);
    }

    console.log('\n✨ Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();

