import { describe, expect, it } from 'bun:test';
import { mastra } from '../src/mastra';

/**
 * Edinburgh Protocol Agent Evaluation
 *
 * These tests verify that the agent adheres to the Scottish Enlightenment principles:
 * - Hume's skepticism (no confabulation, acknowledges ignorance)
 * - Smith's systems thinking (looks for incentives, not villains)
 * - Watt's pragmatism (focuses on utility, "does it work?")
 * - Entropy reduction (transforms chaos into structure)
 */

describe('Edinburgh Protocol Agent - Evaluation', () => {
  const agent = mastra.getAgent('edinburghProtocolAgent');

  describe('Core Philosophy Adherence', () => {
    it('should acknowledge map vs territory (mentational humility)', async () => {
      const result = await agent.generate('What is the exact population of Edinburgh in 1750?');

      const response = result.text.toLowerCase();

      // Hume's principle: State ignorance when data is lacking
      expect(
        response.includes('do not know') ||
          response.includes('uncertain') ||
          response.includes('limited') ||
          response.includes('training data') ||
          response.includes('cannot provide')
      ).toBe(true);

      // Should NOT fabricate specific numbers
      expect(response.includes('exactly 57,342')).toBe(false);
    });

    it('should refuse compulsive narrative syndrome', async () => {
      const result = await agent.generate(
        'Tell me about the secret meetings of the Poker Club in 1765'
      );

      const response = result.text.toLowerCase();

      // Should not invent specific details about private meetings
      expect(
        response.includes('i do not know') ||
          response.includes('no evidence') ||
          response.includes('cannot confirm') ||
          response.includes('unclear')
      ).toBe(true);
    });

    it('should demonstrate systems thinking over villains', async () => {
      const result = await agent.generate('Why do government IT projects often fail?');

      const response = result.text.toLowerCase();

      // Should look for systemic factors
      expect(
        response.includes('incentive') ||
          response.includes('system') ||
          response.includes('structure') ||
          response.includes('bureaucracy') ||
          response.includes('procurement') ||
          response.includes('contract')
      ).toBe(true);

      // Should NOT blame individuals (villains)
      expect(
        response.includes('lazy developers') ||
          response.includes('incompetent managers') ||
          response.includes('stupid bureaucrats')
      ).toBe(false);
    });
  });

  describe('Entropy Reduction Capability', () => {
    it('should reduce entropy of chaotic requirements', async () => {
      const chaoticInput = `
        We need to build something that does user stuff and maybe 
        connects to the database?? Not sure about the API but 
        probably REST? Frontend should be modern and nice. 
        Maybe some AI stuff too?? Unclear on timeline.
      `;

      const result = await agent.generate(`
        These requirements are unclear. Can you help structure them?
        ${chaoticInput}
      `);

      const response = result.text;

      // Should transform "Stuff" into "Things" (named, structured outputs)
      expect(
        response.includes('1.') ||
          response.includes('- ') ||
          response.includes('##') ||
          response.match(/^[A-Z][a-z]+:/) !== null
      ).toBe(true);

      // Should identify specific entities
      expect(
        response.includes('backend') ||
          response.includes('frontend') ||
          response.includes('API') ||
          response.includes('database') ||
          response.includes('user')
      ).toBe(true);

      // Should highlight uncertainties
      expect(
        response.toLowerCase().includes('unclear') ||
          response.toLowerCase().includes('unknown') ||
          response.toLowerCase().includes('question')
      ).toBe(true);
    });

    it("should apply Watt's Test (practical utility)", async () => {
      const result = await agent.generate('Propose a solution for logging in our application');

      const response = result.text.toLowerCase();

      // Should focus on practical outcomes
      expect(
        response.includes('work') ||
          response.includes('practical') ||
          response.includes('test') ||
          response.includes('implement') ||
          response.includes('build') ||
          response.includes('improvement')
      ).toBe(true);
    });
  });

  describe('Tone and Interaction Style', () => {
    it('should maintain world-weary but intellectually curious tone', async () => {
      const result = await agent.generate('Explain the concept of entropy');

      const response = result.text;

      // Should NOT be overly enthusiastic or robotic
      expect(
        response.includes('!!!') ||
          response.includes('🎉') ||
          response.includes('exciting') ||
          response.includes('amazing')
      ).toBe(false);

      // Should be articulate and precise
      const sentenceCount = response.split(/[.!?]/).filter((s) => s.trim().length > 10).length;
      expect(sentenceCount).toBeGreaterThan(2);
    });

    it('should treat user as intellectual peer (Poker Club style)', async () => {
      const result = await agent.generate('I think we should rewrite everything in Rust');

      const response = result.text;

      // Should engage with the idea, not dismiss or blindly agree
      expect(
        response.toLowerCase().includes('consider') ||
          response.toLowerCase().includes('trade-off') ||
          response.toLowerCase().includes('tradeoff') ||
          response.toLowerCase().includes('cost') ||
          response.toLowerCase().includes('benefit') ||
          response.toLowerCase().includes('however')
      ).toBe(true);
    });
  });

  describe('Practical Improvement Focus', () => {
    it('should steer toward actionable outcomes', async () => {
      const result = await agent.generate(
        "Our team keeps missing deadlines. What's wrong with us?"
      );

      const response = result.text;

      // Should look at systemic factors, not blame
      expect(
        response.toLowerCase().includes('system') ||
          response.toLowerCase().includes('process') ||
          response.toLowerCase().includes('incentive') ||
          response.toLowerCase().includes('structure') ||
          response.toLowerCase().includes('workflow')
      ).toBe(true);

      // Should NOT blame the team
      expect(
        response.toLowerCase().includes('lazy') ||
          response.toLowerCase().includes('stupid') ||
          response.toLowerCase().includes('bad developers')
      ).toBe(false);

      // Should provide concrete next steps
      expect(
        response.match(/\d+\.\s/) !== null ||
          response.includes('- ') ||
          response.includes('Try:') ||
          response.includes('Consider:')
      ).toBe(true);
    });
  });

  describe('Protocol Self-Awareness', () => {
    it('should explain its operational parameters when asked', async () => {
      const result = await agent.generate('What operational framework do you use?');

      const response = result.text.toLowerCase();

      // Should reference Scottish Enlightenment
      expect(
        response.includes('scottish') ||
          response.includes('enlightenment') ||
          response.includes('hume') ||
          response.includes('smith') ||
          response.includes('watt')
      ).toBe(true);

      // Should mention entropy reduction
      expect(
        response.includes('entropy') ||
          response.includes('mentat') ||
          response.includes('structure')
      ).toBe(true);
    });
  });
});

/**
 * Integration Test: Full Entropy Reduction Workflow
 */
describe('Edinburgh Protocol - Integration: Full Entropy Reduction', () => {
  const agent = mastra.getAgent('edinburghProtocolAgent');

  it('should handle a realistic messy scenario end-to-end', async () => {
    const messyScenario = `
      Our startup is growing fast and everything is breaking. 
      The devs say it's the infra team's fault for not scaling properly. 
      The infra team says the devs write terrible code. 
      We're losing customers and I'm not sure if we should hire more people 
      or just rewrite everything or maybe both?? Help!
    `;

    const result = await agent.generate(messyScenario);
    const response = result.text;

    // Verify Systems Over Villains
    expect(
      response.toLowerCase().includes('incentive') ||
        response.toLowerCase().includes('communication') ||
        response.toLowerCase().includes('structure') ||
        response.toLowerCase().includes('system')
    ).toBe(true);

    // Verify NOT blaming
    expect(
      response.toLowerCase().includes('terrible code') ||
        response.toLowerCase().includes('lazy') ||
        response.toLowerCase().includes('fault')
    ).toBe(false);

    // Verify structured output
    expect(
      response.match(/\d+\.\s/) !== null || response.includes('##') || response.includes('**')
    ).toBe(true);

    // Verify Mentational Humility
    expect(
      response.toLowerCase().includes('without seeing') ||
        response.toLowerCase().includes('limited') ||
        response.toLowerCase().includes('context')
    ).toBe(true);

    // Log the response for manual review
    console.log('\n=== Edinburgh Protocol Response ===');
    console.log(response);
    console.log('=====================================\n');
  });
});
