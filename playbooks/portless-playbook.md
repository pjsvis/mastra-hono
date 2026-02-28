# Portless Playbook

## Purpose
`portless` replaces ephemeral port numbers (e.g., `localhost:3000`) with stable, named `.localhost` URLs (e.g., `myapp.localhost:1355`). This is especially beneficial for AI agents that need predictable endpoints to interact with local services.

## Key Benefits
- **Stable URLs:** No need to track which service is on which port.
- **Agent Friendly:** AI agents can be given a fixed URL that persists across restarts.
- **Isolation:** Prevents cookie and `localStorage` clashes between apps.
- **HTTP/2 & HTTPS:** Automatic certificate management for modern web features.

## Usage Guidelines

### 1. Installation
`portless` should be installed globally or available in the dev environment.
```bash
npm install -g portless
```

### 2. Running a Service
Prefix your dev command with `portless <name>`.
```bash
# Example for a Next.js app
portless myapp next dev

# Example for a Hono server
portless api bun run src/index.ts
```
The service will be available at `http://myapp.localhost:1355` (or `https` if configured).

### 3. Proxy Management
The proxy starts automatically, but you can manage it manually:
```bash
portless proxy start --https  # Start with HTTPS/HTTP2 support
portless proxy stop           # Stop the proxy
portless list                 # List active routes
```

### 4. Best Practices for Agents
- **Fixed Endpoints:** When configuring an agent to talk to a local API, use the `portless` URL instead of `localhost:PORT`.
- **Environment Variables:** Use `PORTLESS_PORT` to change the default port (1355) if needed.
- **Skipping:** If `portless` causes issues in a specific CI environment, use `PORTLESS=0` to bypass it.

## Configuration
- `PORTLESS_PORT`: Port for the proxy (default: 1355).
- `PORTLESS_HTTPS`: Enable HTTPS by default (default: false).
- `PORTLESS_STATE_DIR`: Where to store proxy state and certificates.
