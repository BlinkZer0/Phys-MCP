/**
 * Persistence layer for Physics MCP Server
 *
 * Handles SQLite database operations for sessions, events, and artifacts.
 */
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
declare class PersistenceManager {
    private db;
    private dbPath;
    private artifactsDir;
    constructor(dbPath?: string);
    /**
     * Initialize the database and create tables if they don't exist
     */
    initialize(): void;
    /**
     * Ensure a session exists, create if it doesn't
     */
    ensureSession(sessionId?: string): string;
    /**
     * Record a tool execution event
     */
    recordEvent(sessionId: string, toolName: string, input: any, output: any): string;
    /**
     * Record an artifact (plot, report, etc.)
     */
    recordArtifact(sessionId: string, kind: string, filePath: string, metadata?: any): string;
    /**
     * Get recent session summary for NLI context
     */
    recentSummary(sessionId: string, limit?: number): any[];
    /**
     * Get session artifacts
     */
    getSessionArtifacts(sessionId: string): Artifact[];
    /**
     * Get session events
     */
    getSessionEvents(sessionId: string): Event[];
    /**
     * Get artifact file path for a session
     */
    getArtifactPath(sessionId: string, filename: string): string;
    /**
     * Close the database connection
     */
    close(): void;
}
export declare function getPersistenceManager(): PersistenceManager;
export declare function closePersistence(): void;
export {};
