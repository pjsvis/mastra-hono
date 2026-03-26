// The lab folder is excluded from TypeScript and Biome checks.
// Use this space to write sandbox code, explore new ideas, and break things without consequence.

// Tier 1: @ts-nocheck is allowed here - rapid prototyping mode

interface LabContext {
  args: string[];
}

// Simple hello world lab script
export default function hello(ctx: LabContext) {
  console.log("Welcome to the lab!");
  console.log("Args:", ctx.args);
  
  if (ctx.args.includes("verbose")) {
    console.log("Running in verbose mode...");
    console.log("Lab directory:", import.meta.dir);
  }
  
  // Demo: This would normally error with @ts-ignore
  // const sandbox = "hello";
  // @ts-ignore
  // sandbox.thisMethodDoesNotExist();
  
  console.log("Lab script loaded successfully!");
}
