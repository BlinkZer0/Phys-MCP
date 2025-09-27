/**
 * Persistence layer for Physics MCP Server
 * 
 * Handles SQLite database operations for sessions, events, and artifacts.
 */

import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';

export interface Session {
  id: string;
  created_at: number;
}

export interface Event {
  id: string;
  session_id: string;
  ts: number;
  tool_name: string;
  input_json: string;
  output_json: string;
}

export interface Artifact {
  id: string;
  session_id: string;
  ts: number;
  kind: string;
  path: string;
  meta_json: string;
}

class PersistenceManager {
  private db: Database.Database | null = null;
  private dbPath: string;
  private artifactsDir: string;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(process.cwd(), 'data', 'phys-mcp.db');
    this.artifactsDir = path.join(process.cwd(), 'artifacts');
    
    // Ensure artifacts directory exists
    if (!fs.existsSync(this.artifactsDir)) {
      fs.mkdirSync(this.artifactsDir, { recursive: true });
    }
  }

  /**
   * Initialize the database and create tables if they don't exist
   */
  initialize(): void {
    try {
      this.db = new Database(this.dbPath);
      
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
      
      console.error('📊 Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Ensure a session exists, create if it doesn't
   */
  ensureSession(sessionId?: string): string {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const id = sessionId || randomUUID();
    const now = Date.now();

    try {
      // Try to insert, ignore if already exists
      const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO sessions (id, created_at) VALUES (?, ?)
      `);
      stmt.run(id, now);
      
      return id;
    } catch (error) {
      console.error('Failed to ensure session:', error);
      throw error;
    }
  }

  /**
   * Record a tool execution event
   */
  recordEvent(sessionId: string, toolName: string, input: any, output: any): string {
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
      
      stmt.run(
        eventId,
        sessionId,
        now,
        toolName,
        JSON.stringify(input),
        JSON.stringify(output)
      );
      
      return eventId;
    } catch (error) {
      console.error('Failed to record event:', error);
      throw error;
    }
  }

  /**
   * Record an artifact (plot, report, etc.)
   */
  recordArtifact(sessionId: string, kind: string, filePath: string, metadata: any = {}): string {
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
      
      stmt.run(
        artifactId,
        sessionId,
        now,
        kind,
        filePath,
        JSON.stringify(metadata)
      );
      
      return artifactId;
    } catch (error) {
      console.error('Failed to record artifact:', error);
      throw error;
    }
  }

  /**
   * Get recent session summary for NLI context
   */
  recentSummary(sessionId: string, limit: number = 12): any[] {
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
      
      const events = stmt.all(sessionId, limit) as any[];
      
      return events.map((event, index) => ({
        step: limit - index,
        tool: event.tool_name,
        input: JSON.parse(event.input_json),
        output: JSON.parse(event.output_json),
        timestamp: event.ts
      })).reverse(); // Return in chronological order
    } catch (error) {
      console.error('Failed to get recent summary:', error);
      return [];
    }
  }

  /**
   * Get session artifacts
   */
  getSessionArtifacts(sessionId: string): Artifact[] {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM artifacts
        WHERE session_id = ?
        ORDER BY ts DESC
      `);
      
      return stmt.all(sessionId) as Artifact[];
    } catch (error) {
      console.error('Failed to get session artifacts:', error);
      return [];
    }
  }

  /**
   * Get session events
   */
  getSessionEvents(sessionId: string): Event[] {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM events
        WHERE session_id = ?
        ORDER BY ts ASC
      `);
      
      return stmt.all(sessionId) as Event[];
    } catch (error) {
      console.error('Failed to get session events:', error);
      return [];
    }
  }

  /**
   * Get artifact file path for a session
   */
  getArtifactPath(sessionId: string, filename: string): string {
    const sessionDir = path.join(this.artifactsDir, sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    return path.join(sessionDir, filename);
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
let persistenceManager: PersistenceManager | null = null;

export function getPersistenceManager(): PersistenceManager {
  if (!persistenceManager) {
    persistenceManager = new PersistenceManager();
    persistenceManager.initialize();
  }
  return persistenceManager;
}

export function closePersistence(): void {
  if (persistenceManager) {
    persistenceManager.close();
    persistenceManager = null;
  }
}
