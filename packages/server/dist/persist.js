/**
 * Persistence layer for Physics MCP Server
 *
 * Handles SQLite database operations for sessions, events, and artifacts.
 */
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
class PersistenceManager {
    db = null;
    dbPath;
    artifactsDir;
    constructor(dbPath) {
        this.dbPath = dbPath || path.join(process.cwd(), 'data', 'phys-mcp.db');
        this.artifactsDir = path.join(process.cwd(), 'artifacts');
        // Ensure data directory exists for database
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        // Ensure artifacts directory exists
        if (!fs.existsSync(this.artifactsDir)) {
            fs.mkdirSync(this.artifactsDir, { recursive: true });
        }
    }
    /**
     * Initialize the database and create tables if they don't exist
     */
    initialize() {
        try {
            console.log(`📊 Initializing database at: ${this.dbPath}`);
            this.db = new Database(this.dbPath);
            // Enable foreign keys
            this.db.pragma('foreign_keys = ON');
            // Create tables
            this.db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          created_at INTEGER NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          ts INTEGER NOT NULL,
          tool_name TEXT NOT NULL,
          input_json TEXT NOT NULL,
          output_json TEXT NOT NULL,
          FOREIGN KEY(session_id) REFERENCES sessions(id)
        );
        
        CREATE TABLE IF NOT EXISTS artifacts (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          ts INTEGER NOT NULL,
          kind TEXT NOT NULL,
          path TEXT NOT NULL,
          meta_json TEXT NOT NULL,
          FOREIGN KEY(session_id) REFERENCES sessions(id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_events_session_ts ON events(session_id, ts);
        CREATE INDEX IF NOT EXISTS idx_artifacts_session_ts ON artifacts(session_id, ts);
      `);
            console.log('📊 Database initialized successfully');
        }
        catch (error) {
            console.error('❌ Failed to initialize database:', error);
            console.error('Database path:', this.dbPath);
            console.error('Data directory exists:', fs.existsSync(path.dirname(this.dbPath)));
            // Don't throw the error - allow server to continue without persistence
            console.warn('⚠️ Server will continue without persistence layer');
            this.db = null;
        }
    }
    /**
     * Ensure a session exists, create if it doesn't
     */
    ensureSession(sessionId) {
        const id = sessionId || randomUUID();
        if (!this.db) {
            console.warn('⚠️ Database not available, returning session ID without persistence');
            return id;
        }
        const now = Date.now();
        try {
            // Try to insert, ignore if already exists
            const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO sessions (id, created_at) VALUES (?, ?)
      `);
            stmt.run(id, now);
            return id;
        }
        catch (error) {
            console.error('Failed to ensure session:', error);
            console.warn('⚠️ Continuing without session persistence');
            return id;
        }
    }
    /**
     * Record a tool execution event
     */
    recordEvent(sessionId, toolName, input, output) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        const eventId = randomUUID();
        const now = Date.now();
        try {
            const stmt = this.db.prepare(`
        INSERT INTO events (id, session_id, ts, tool_name, input_json, output_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
            stmt.run(eventId, sessionId, now, toolName, JSON.stringify(input), JSON.stringify(output));
            return eventId;
        }
        catch (error) {
            console.error('Failed to record event:', error);
            throw error;
        }
    }
    /**
     * Record an artifact (plot, report, etc.)
     */
    recordArtifact(sessionId, kind, filePath, metadata = {}) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        const artifactId = randomUUID();
        const now = Date.now();
        try {
            const stmt = this.db.prepare(`
        INSERT INTO artifacts (id, session_id, ts, kind, path, meta_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
            stmt.run(artifactId, sessionId, now, kind, filePath, JSON.stringify(metadata));
            return artifactId;
        }
        catch (error) {
            console.error('Failed to record artifact:', error);
            throw error;
        }
    }
    /**
     * Get recent session summary for NLI context
     */
    recentSummary(sessionId, limit = 12) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        try {
            const stmt = this.db.prepare(`
        SELECT tool_name, input_json, output_json, ts
        FROM events
        WHERE session_id = ?
        ORDER BY ts DESC
        LIMIT ?
      `);
            const events = stmt.all(sessionId, limit);
            return events.map((event, index) => ({
                step: limit - index,
                tool: event.tool_name,
                input: JSON.parse(event.input_json),
                output: JSON.parse(event.output_json),
                timestamp: event.ts
            })).reverse(); // Return in chronological order
        }
        catch (error) {
            console.error('Failed to get recent summary:', error);
            return [];
        }
    }
    /**
     * Get session artifacts
     */
    getSessionArtifacts(sessionId) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        try {
            const stmt = this.db.prepare(`
        SELECT * FROM artifacts
        WHERE session_id = ?
        ORDER BY ts DESC
      `);
            return stmt.all(sessionId);
        }
        catch (error) {
            console.error('Failed to get session artifacts:', error);
            return [];
        }
    }
    /**
     * Get session events
     */
    getSessionEvents(sessionId) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        try {
            const stmt = this.db.prepare(`
        SELECT * FROM events
        WHERE session_id = ?
        ORDER BY ts ASC
      `);
            return stmt.all(sessionId);
        }
        catch (error) {
            console.error('Failed to get session events:', error);
            return [];
        }
    }
    /**
     * Get artifact file path for a session
     */
    getArtifactPath(sessionId, filename) {
        const sessionDir = path.join(this.artifactsDir, sessionId);
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }
        return path.join(sessionDir, filename);
    }
    /**
     * Close the database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}
// Singleton instance
let persistenceManager = null;
export function getPersistenceManager() {
    if (!persistenceManager) {
        persistenceManager = new PersistenceManager();
        persistenceManager.initialize();
    }
    return persistenceManager;
}
export function closePersistence() {
    if (persistenceManager) {
        persistenceManager.close();
        persistenceManager = null;
    }
}
