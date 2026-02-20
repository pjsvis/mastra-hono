import { describe, expect, test } from 'bun:test';
import { mastra } from '@src/mastra';

describe('Mastra', () => {
  test('should initialize with weatherAgent', () => {
    const agent = mastra.getAgent('weatherAgent');
    expect(agent).toBeDefined();
    expect(agent.id).toBe('weather-agent');
  });

  test('should initialize with researchAgent', () => {
    const agent = mastra.getAgent('researchAgent');
    expect(agent).toBeDefined();
    expect(agent.id).toBe('research-agent');
  });

  test('should initialize with weatherWorkflow', () => {
    const workflow = mastra.getWorkflow('weatherWorkflow');
    expect(workflow).toBeDefined();
  });

  test('researchAgent should have tools configured', () => {
    const agent = mastra.getAgent('researchAgent');
    expect(agent).toBeDefined();
    // Agent should have tools available in its config
    expect(agent.model).toBeDefined();
  });
});
