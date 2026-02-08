// Database initialization and management
import * as SQLite from 'expo-sqlite';
import { ALL_TABLES, CREATE_INDEXES, SCHEMA_VERSION } from './schema';

const DB_NAME = 'infonexus.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get the database instance, creating it if necessary
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync(DB_NAME);
  return db;
}

/**
 * Initialize the database schema
 * Creates all tables and indexes if they don't exist
 */
export async function initializeDatabase(): Promise<void> {
  const database = await getDatabase();

  // Create all tables
  for (const createStatement of ALL_TABLES) {
    await database.execAsync(createStatement);
  }

  // Create indexes
  for (const createIndex of CREATE_INDEXES) {
    await database.execAsync(createIndex);
  }

  // Set schema version
  await database.runAsync(
    'INSERT OR REPLACE INTO schema_meta (key, value) VALUES (?, ?)',
    'schema_version',
    String(SCHEMA_VERSION)
  );

  console.log('[DB] Database initialized successfully');
}

/**
 * Get the current schema version
 */
export async function getSchemaVersion(): Promise<number> {
  const database = await getDatabase();

  try {
    const result = await database.getFirstAsync<{ value: string }>(
      'SELECT value FROM schema_meta WHERE key = ?',
      'schema_version'
    );
    return result ? parseInt(result.value, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Clear all data from the database (for logout/reset)
 */
export async function clearDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync('DELETE FROM sync_queue');
  await database.execAsync('DELETE FROM favorites');
  await database.execAsync('DELETE FROM source_themes');
  await database.execAsync('DELETE FROM themes');
  await database.execAsync('DELETE FROM articles');
  await database.execAsync('DELETE FROM sources');

  console.log('[DB] Database cleared');
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log('[DB] Database closed');
  }
}
