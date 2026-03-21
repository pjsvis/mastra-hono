import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Playbook Metadata Schema
 */
interface PlaybookMeta {
  id: string;
  title: string;
  role: string;
  infrastructure: string[];
  last_updated: string;
  tags: string[];
  path: string;
}

const PLAYBOOKS_DIR = 'playbooks';
const INDEX_FILE = 'playbook-index.json';

/**
 * Extract YAML frontmatter from markdown content
 */
function parseFrontmatter(content: string): Partial<PlaybookMeta> {
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!fmMatch) return {};

  const yaml = fmMatch[1];
  const meta: any = {};

  for (const line of yaml.split('\n')) {
    const [key, ...valueParts] = line.split(':');
    if (!key || valueParts.length === 0) continue;

    const k = key.trim();
    const v = valueParts.join(':').trim();

    if (v.startsWith('[') && v.endsWith(']')) {
      meta[k] = v
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      meta[k] = v.replace(/^["'](.*)["']$/, '$1');
    }
  }

  return meta;
}

/**
 * Generate the index by scanning the playbooks directory
 */
async function generateIndex() {
  console.log(`🔍 Scanning ${PLAYBOOKS_DIR} for playbooks...`);

  try {
    const files = await readdir(PLAYBOOKS_DIR);
    const playbooks: PlaybookMeta[] = [];

    for (const file of files) {
      if (!file.endsWith('.md')) continue;

      const path = join(PLAYBOOKS_DIR, file);
      const content = await readFile(path, 'utf-8');
      const meta = parseFrontmatter(content);

      if (meta.id) {
        playbooks.push({
          id: meta.id || 'PB-XXX',
          title: meta.title || file.replace('.md', ''),
          role: meta.role || 'Unknown',
          infrastructure: meta.infrastructure || [],
          last_updated: meta.last_updated || new Date().toISOString().split('T')[0],
          tags: meta.tags || [],
          path,
        });
      }
    }

    // Sort by ID
    playbooks.sort((a, b) => a.id.localeCompare(b.id));

    await writeFile(INDEX_FILE, JSON.stringify(playbooks, null, 2));
    console.log(`✅ Index generated: ${INDEX_FILE} (${playbooks.length} playbooks)`);
  } catch (error) {
    console.error('❌ Error generating index:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  generateIndex();
}
