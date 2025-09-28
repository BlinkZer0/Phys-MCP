#!/usr/bin/env node
/**
 * Physics MCP Server
 *
 * Main server that orchestrates CAS, Plot, and NLI tools for physics computations.
 * Communicates via JSON-RPC over stdio with MCP clients.
 */
import 'dotenv/config';
