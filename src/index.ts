import { type HonoBindings, type HonoVariables, MastraServer } from '@mastra/hono';
import { Hono } from 'hono';
import { mastra } from './mastra/index.js';

const app = new Hono<{ Bindings: HonoBindings; Variables: HonoVariables }>();
const server = new MastraServer({ app, mastra });

await server.init();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

export default {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  fetch: app.fetch,
};
