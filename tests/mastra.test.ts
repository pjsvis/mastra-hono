import { describe, test, expect } from "bun:test";
import { mastra } from "@src/mastra";

describe("Mastra", () => {
  test("should initialize with weatherAgent", () => {
    const agent = mastra.getAgent("weatherAgent");
    expect(agent).toBeDefined();
    expect(agent.id).toBe("weather-agent");
  });

  test("should initialize with weatherWorkflow", () => {
    const workflow = mastra.getWorkflow("weatherWorkflow");
    expect(workflow).toBeDefined();
  });
});
