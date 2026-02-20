import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { PinoLogger } from '@mastra/loggers';
import { Memory } from '@mastra/memory';
import {
  CloudExporter,
  DefaultExporter,
  Observability,
  SensitiveDataFilter,
} from '@mastra/observability';
import { localMemoryAgent } from './agents/local-memory-agent';
import { researchAgent } from './agents/research-agent';
import { weatherAgent } from './agents/weather-agent';
import { weatherWorkflow } from './workflows/weather-workflow';

const storage = new LibSQLStore({
  id: 'mastra-storage',
  // stores observability, scores, ... into persistent file storage
  url: 'file:./mastra.db',
});

const memory = new Memory({
  storage,
});

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { researchAgent, weatherAgent, localMemoryAgent },
  storage,
  memory: { default: memory },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra',
        exporters: [
          new DefaultExporter(), // Persists traces to storage for Mastra Studio
          new CloudExporter(), // Sends traces to Mastra Cloud (if MASTRA_CLOUD_ACCESS_TOKEN is set)
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(), // Redacts sensitive data like passwords, tokens, keys
        ],
      },
    },
  }),
});
