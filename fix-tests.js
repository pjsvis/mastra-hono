const fs = require('node:fs');

let content = fs.readFileSync('tests/research-agent.test.ts', 'utf8');

// Add the helper function after the imports
content = content.replace(
  'import { webSearchTool } from "@src/mastra/tools/web-search-tool";',
  'import { webSearchTool } from "@src/mastra/tools/web-search-tool";\n\nasync function execTool(tool: any, params: any) {\n  const result = await tool.execute!(params, {} as any);\n  if (result && typeof result === "object" && "error" in result) {\n    throw new Error(result.message);\n  }\n  return result as any;\n}'
);

// Replace tool executions
content = content.replace(/await calculatorTool\.execute\(\{/g, 'await execTool(calculatorTool, {');
content = content.replace(/await webSearchTool\.execute\(\{/g, 'await execTool(webSearchTool, {');

fs.writeFileSync('tests/research-agent.test.ts', content);
