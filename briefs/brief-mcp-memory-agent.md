# Brief: MCP-Enabled Local Memory Agent

## Objective
Expose the `local-memory-agent` as a Model Context Protocol (MCP) server. This will enable external IDEs (Cursor, Windsurf) and local clients (Claude Desktop) to leverage our local agent's "Observational Memory" and project-specific wisdom.

## Rationale
Currently, our `local-memory-agent` resides inside the `mastra-hono` forge. By exposing it via MCP, we turn it into a "Portable Intelligence" that can be plugged into any development tool. The agent's memory remains local in `mastra.db`, but its capabilities become universal across the user's local machine.

## Success Criteria
- [ ] Install `@mastra/mcp` as a dependency.
- [ ] Create a dedicated entry point for the MCP Server (e.g., `src/mastra/mcp.ts`).
- [ ] Register the `localMemoryAgent` with the `MCPServer`.
- [ ] Expose the server using **STDIO transport** (for IDE integration) and/or an **SSE endpoint** via the Hono server.
- [ ] Verify that the agent retains its Observational Memory state when called through the MCP interface.

## Implementation Details
1. **Dependency**: `bun add @mastra/mcp`.
2. **Server Setup**: Define an `MCPServer` in `src/mastra/mcp.ts`. Include the `localMemoryAgent` in the `agents` configuration.
3. **Mastra Registration**: Pass the `mcpServer` to the main `Mastra` instance in `src/mastra/index.ts`.
4. **Hono Integration**: Use `mastra.getMCPServerById('...')` to create a Hono route for SSE if required.
5. **CLI/Bin**: Add a script to `package.json` to launch the STDIO server (e.g., `bun run mcp`).

## Verification Plan
1. **Local Test**: Use the `mcp-inspect` or `mcp-cli` tool to connect to the STDIO server.
2. **Memory Pulse**: Run a tool call through the MCP client that intentionally fails, then check if the Observational Memory records the error.
3. **IDE Integration**: Add the server to Cursor (Settings -> Features -> MCP Servers) and verify the agent appears and can be queried.

## Metadata
- **Focus**: Connectivity, Data Sovereignty, Memory Persistence
- **Priority**: P2
