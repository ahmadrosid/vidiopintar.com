# CI/CD & Blue-Green Deployment Flow Diagram

## GitHub Actions Workflow (.github/workflows/deploy.yml)

```
┌─────────────────────────────────────────────────────────────────┐
│                   GITHUB ACTIONS WORKFLOW                       │
│                 .github/workflows/deploy.yml                    │
└─────────────────────────────────────────────────────────────────┘

TRIGGER: Push to 'main' branch
════════════════════════════

┌─────────────────┐
│   Push to main  │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ GitHub Actions  │
│    Triggered    │
└─────────┬───────┘
          │
┌─────────▼───────┐
│  build-and-push │ 
│      Job        │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ 1. Checkout     │ ← actions/checkout@v4
│    Repository   │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ 2. Setup Docker │ ← docker/setup-buildx-action@v3
│    Buildx       │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ 3. Login to     │ ← docker/login-action@v3
│    GHCR         │   (using DOCKER_ACCESS_TOKEN)
└─────────┬───────┘
          │
┌─────────▼───────┐
│ 4. Build & Push │ ← docker/build-push-action@v2
│  Docker Image   │   → ghcr.io/ahmadrosid/vidiopintar.com:latest
│  to Registry    │   (uses ENV_RAW secret for build)
└─────────┬───────┘
          │
┌─────────▼───────┐
│ 5. Setup SSH    │ ← Install SSH keys
│    to VPS       │   (SSH_PRIVATE_KEY secret)
└─────────┬───────┘
          │
┌─────────▼───────┐
│ 6. Deploy to    │ ← SSH to vidiopintar.com
│    Production   │   cd /root/vidiopintar.com
│    VPS          │   git pull origin main
│                 │   bash ./deployment/deploy.sh
└─────────┬───────┘
          │
┌─────────▼───────┐
│ 7. Cleanup SSH  │ ← Remove SSH keys
│    Keys         │
└─────────────────┘

COMPLETE CI/CD FLOW:
══════════════════

GitHub → Build Image → Push to Registry → SSH to VPS → Blue-Green Deploy

SECRETS USED:
════════════

• DOCKER_ACCESS_TOKEN  → Login to ghcr.io
• SSH_PRIVATE_KEY      → SSH access to VPS  
• ENV_RAW              → Environment variables for build

## Blue-Green Deployment Script (deployment/deploy.sh)

┌─────────────────────────────────────────────────────────────────┐
│                    BLUE-GREEN DEPLOYMENT                        │
│                    deployment/deploy.sh                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐
│    PORT 5000    │    │    PORT 5001    │
│   (Blue/Green)  │    │   (Green/Blue)  │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
          ┌──────────▼───────────┐
          │       NGINX          │
          │    Load Balancer     │
          │  (switches traffic)  │
          └──────────┬───────────┘
                     │
          ┌──────────▼───────────┐
          │   Public Traffic     │
          └──────────────────────┘

DEPLOYMENT PROCESS:
══════════════════

1. ┌─────────────────┐
   │ Pull Latest     │
   │ Docker Image    │
   └─────────┬───────┘
             │
2. ┌─────────▼───────┐
   │ Check Current   │
   │ Active Port     │
   │ (Health Check)  │
   └─────────┬───────┘
             │
3. ┌─────────▼───────┐
   │ Determine       │
   │ Target Port     │
   │ (opposite port) │
   └─────────┬───────┘
             │
4. ┌─────────▼───────┐
   │ Deploy New      │
   │ Container to    │
   │ Target Port     │
   └─────────┬───────┘
             │
5. ┌─────────▼───────┐
   │ Health Check    │
   │ New Container   │
   │ (5 retries)     │
   └─────────┬───────┘
             │
       ┌─────▼──────┐
       │  Success?  │
       └─┬───────┬──┘
         │ YES   │ NO
         │       │
6a. ┌────▼─────┐ │
    │ Stop &   │ │
    │ Remove   │ │
    │ Old      │ │
    │ Container│ │
    └──────────┘ │
                 │
6b. ┌────────────▼─┐
    │ Rollback:    │
    │ Remove Failed│
    │ Container    │
    │ Keep Old     │
    └──────────────┘

PORT SWITCHING LOGIC:
═══════════════════

Current State     │ Action
─────────────────────────────
Port 5000 Active │ Deploy to 5001
Port 5001 Active │ Deploy to 5000
No Active Port   │ Deploy to 5000

HEALTH CHECK:
════════════

┌─────────────────┐
│ GET /api/health │ ──┐
└─────────────────┘   │
                      │ Retry 5 times
┌─────────────────┐   │ 3 seconds apart
│ HTTP 200 OK?    │ ←─┘
└─────┬───────────┘
      │
   ┌──▼──┐
   │PASS │ ✅ Continue deployment
   └─────┘
      │
   ┌──▼──┐
   │FAIL │ ❌ Rollback & cleanup
   └─────┘

CONTAINER NAMING:
═══════════════

vidiopintar-app-5000  (Port 5000)
vidiopintar-app-5001  (Port 5001)

KEY FEATURES:
════════════

• Zero-downtime deployment
• Automatic health checking
• Rollback on failure
• Cleanup of failed containers
• Traffic switching via nginx
• Comprehensive logging
```