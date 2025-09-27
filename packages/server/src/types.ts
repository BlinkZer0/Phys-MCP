/**
 * Type definitions for the Physics MCP Server
 */

export interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  handler?: (args: any) => Promise<any>;
}
