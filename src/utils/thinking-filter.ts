/**
 * Filter thinking/reasoning traces from model output
 * Useful for models like lfm2.5-thinking that output thinking blocks
 */

interface FilterOptions {
  /** Remove content between <thinking> tags */
  stripThinkingTags?: boolean;
  /** Remove content that looks like reasoning (starts with thinking words) */
  stripReasoningPrefix?: boolean;
  /** Return only thinking content (inverse) */
  extractThinkingOnly?: boolean;
}

/**
 * Default thinking words that indicate reasoning output
 */
const THINKING_PREFIXES = [
  'thinking',
  'let me think',
  "let's think",
  'okay,',
  'i need to',
  'i should',
  'first,',
  'so,',
  'hmm,',
  'wait,',
  'actually,',
];

/**
 * Strips thinking tags from text
 * Handles <thinking>...</thinking> and similar tag formats
 */
function stripThinkingTags(text: string): string {
  // Match <thinking>...</thinking> tags (multiline, case insensitive)
  return text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();
}

/**
 * Strips reasoning prefixes from the beginning of text
 */
function stripReasoningPrefix(text: string): string {
  const lowerText = text.toLowerCase().trim();

  for (const prefix of THINKING_PREFIXES) {
    if (lowerText.startsWith(prefix)) {
      // Find where the actual content starts (after the reasoning)
      // Look for a complete sentence or paragraph break
      const sentenceEnd = text.match(/[.!?]\s+/);
      if (sentenceEnd && sentenceEnd.index) {
        return text.slice(sentenceEnd.index + 2).trim();
      }
    }
  }

  return text;
}

/**
 * Filters thinking traces from model output
 *
 * @param text - The raw model output
 * @param options - Filter configuration
 * @returns Cleaned text with thinking traces removed (or extracted)
 */
export function filterThinking(text: string, options: FilterOptions = {}): string {
  const {
    stripThinkingTags: stripTags = true,
    stripReasoningPrefix: stripPrefix = true,
    extractThinkingOnly = false,
  } = options;

  if (extractThinkingOnly) {
    // Extract only thinking content (for debugging)
    const tagMatch = text.match(/<thinking>([\s\S]*?)<\/thinking>/i);
    if (tagMatch) return tagMatch[1].trim();

    // Look for thinking-style content at the start
    const lines = text.split('\n');
    const thinkingLines: string[] = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();
      if (THINKING_PREFIXES.some((p) => lowerLine.startsWith(p))) {
        thinkingLines.push(line);
      } else if (thinkingLines.length > 0 && line.trim() === '') {
        break;
      }
    }

    return thinkingLines.join('\n');
  }

  let result = text;

  if (stripTags) {
    result = stripThinkingTags(result);
  }

  if (stripPrefix) {
    result = stripReasoningPrefix(result);
  }

  // Clean up extra whitespace
  result = result.replace(/\n{3,}/g, '\n\n').trim();

  return result;
}

/**
 * Quick filter with sensible defaults
 * Strips both tags and reasoning prefixes
 */
export function cleanThinking(text: string): string {
  return filterThinking(text, {
    stripThinkingTags: true,
    stripReasoningPrefix: true,
  });
}

/**
 * Check if text contains thinking content
 */
export function hasThinking(text: string): boolean {
  const hasTags = /<thinking>/i.test(text);
  const hasPrefix = THINKING_PREFIXES.some((p) => text.toLowerCase().trim().startsWith(p));
  return hasTags || hasPrefix;
}
