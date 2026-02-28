# Self-Hosting ntfy Implementation Plan
## Problem Statement
Currently using the public ntfy.sh service for notifications, which has privacy limitations (unencrypted messages, topic names discoverable, server operator can see messages). Need to evaluate whether self-hosting provides sufficient benefits to justify the implementation and maintenance effort.
## Current State
* ntfy CLI installed (v2.17.0) via Homebrew
* ntfy desktop app installed on macOS
* Successfully sending/receiving notifications via public ntfy.sh server
* Using topic-based routing (e.g., "mytopic")
## Proposed Approach: Docker-based Self-Hosted Server
### Infrastructure Requirements
**Hosting Options:**
1. **Local network server** (Raspberry Pi, NAS, or spare machine)
    * Pros: No cloud costs, full control, low latency
    * Cons: Requires port forwarding, dynamic DNS, or VPN for remote access
2. **Cloud VPS** (DigitalOcean, Linode, Hetzner, etc.)
    * Pros: Always accessible, static IP, professional infrastructure
    * Cons: Monthly cost ($5-10/month), requires server management
3. **Existing homelab/server**
    * Pros: No additional hardware, leverage existing infrastructure
    * Cons: Dependent on existing setup availability
**Technical Requirements:**
* Docker and Docker Compose installed
* Domain name with A/AAAA record pointing to server (for HTTPS)
* Reverse proxy with SSL/TLS certificates (Caddy, nginx, Traefik)
* Port 80/443 accessible (or custom port with reverse proxy)
* ~20-50MB RAM, minimal CPU, ~100MB disk space
### Implementation Steps
**Phase 1: Basic Docker Deployment**
1. Create `docker-compose.yml` with ntfy service
2. Configure persistent volumes for cache and configuration
3. Set up health checks
4. Deploy and verify basic functionality on localhost
**Phase 2: Security Configuration**
1. Create `server.yml` configuration file
2. Set up authentication (user database)
3. Configure `auth-default-access: deny-all`
4. Create admin user and topic-specific users
5. Generate access tokens for CLI usage
**Phase 3: HTTPS and Remote Access**
1. Configure reverse proxy (Caddy recommended for auto-SSL)
2. Set `base-url` in server.yml to full domain (required for iOS)
3. Set `upstream-base-url: https://ntfy.sh` (for iOS push notifications)
4. Configure firewall rules
5. Test HTTPS access
**Phase 4: Client Configuration**
1. Configure desktop app to use self-hosted server
2. Add user credentials in app settings
3. Update CLI default server in `~/.config/ntfy/client.yml`
4. Test sending/receiving from both CLI and app
5. Migrate topics from public server
### Configuration Example
**docker-compose.yml:**
```yaml
version: "3.8"
services:
  ntfy:
    image: binwiederhier/ntfy:latest
    container_name: ntfy
    command: serve
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - ./cache:/var/cache/ntfy
      - ./config:/etc/ntfy
      - ./data:/var/lib/ntfy
    environment:
      - TZ=America/Los_Angeles
    healthcheck:
      test: ["CMD-SHELL", "wget -q --tries=1 http://localhost:80/v1/health -O - | grep -Eo '\"healthy\"\\s*:\\s*true' || exit 1"]
      interval: 60s
      timeout: 10s
      retries: 3
```
**Key server.yml settings:**
```yaml
base-url: "https://ntfy.yourdomain.com"
upstream-base-url: "https://ntfy.sh"  # For iOS notifications
cache-file: "/var/cache/ntfy/cache.db"
cache-duration: "12h"
auth-file: "/var/lib/ntfy/user.db"
auth-default-access: "deny-all"
attachment-cache-dir: "/var/cache/ntfy/attachments"
```
## Pros and Cons Analysis
### Pros of Self-Hosting
**Privacy & Security:**
* Full control over data - no third party can access messages
* Can implement stricter access controls per topic
* Messages stored on your infrastructure only
* No rate limits or usage restrictions
**Customization:**
* Custom cache duration (default 12h, can extend)
* File attachments support (can configure size limits)
* Custom authentication schemes
* Integration with existing infrastructure (SSO, monitoring)
**Reliability:**
* Not dependent on ntfy.sh availability
* Works entirely offline (local network)
* No external service rate limiting
### Cons of Self-Hosting
**Infrastructure Overhead:**
* Requires server/VPS with public IP or VPN setup
* Domain name needed for proper HTTPS
* Reverse proxy configuration and SSL certificate management
* Ongoing server maintenance and updates
* Monitoring and backup responsibilities
**iOS Limitations:**
* Still requires upstream server (ntfy.sh) for instant iOS notifications
* Without upstream, iOS notifications delayed by hours
* Poll requests still go through ntfy.sh (though message content stays private)
* Android has no such limitation with self-hosted server
**Complexity:**
* Initial setup time (2-4 hours for full deployment)
* Learning curve for Docker, reverse proxy, DNS configuration
* Troubleshooting network/connectivity issues
* Managing authentication tokens and users
**Cost:**
* VPS hosting: $5-10/month (if not using existing infrastructure)
* Domain name: $10-15/year
* Time investment for setup and maintenance
### When Self-Hosting Makes Sense
* Sending sensitive information (deployment secrets, system alerts with details)
* High message volume that would hit public rate limits
* Already have infrastructure/homelab setup
* Want guaranteed availability independent of third party
* Need custom features (long cache, large attachments)
* Privacy is a primary concern
### When Public ntfy.sh is Sufficient
* Casual notifications without sensitive data
* Low to moderate message volume
* Don't want to manage infrastructure
* Mobile-first usage (especially iOS)
* Quick setup is priority
* Notifications like "backup complete", "build finished"
## Recommendation
For your current use case (backup notifications, build alerts, etc.), **the public ntfy.sh service is likely sufficient** unless:
1. You're sending notifications with sensitive data (credentials, private info)
2. You have an existing homelab/server where adding ntfy is trivial
3. You anticipate high volume that would hit rate limits
If privacy becomes a concern, consider:
* **Short term:** Encrypt sensitive message content before sending via ntfy.sh
* **Medium term:** Self-host if you set up homelab infrastructure for other purposes
* **Alternative:** Use more secure topic names (long random strings act as passwords)
The setup is straightforward if you decide to proceed, but requires ongoing maintenance that may not be justified for non-sensitive notifications.