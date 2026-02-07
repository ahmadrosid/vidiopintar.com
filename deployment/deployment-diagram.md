# CI/CD & Blue-Green Deployment

## CI/CD Pipeline

```
Push to main
    │
    ▼
┌────────────────────────────────────────────────┐
│              GitHub Actions                    │
│                                                │
│  Checkout → Buildx → Login GHCR → Build & Push │
│                                                │
│  Image: ghcr.io/ahmadrosid/vidiopintar.com     │
└───────────────────────┬────────────────────────┘
                        │
                   SSH to VPS
                        │
                        ▼
              bun ./deployment/deploy.ts
```

**Secrets:** `DOCKER_ACCESS_TOKEN`, `SSH_PRIVATE_KEY`, `ENV_RAW`

## Blue-Green Deployment

```
                    ┌─────────┐
                    │  NGINX  │ ← public traffic
                    └────┬────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
     ┌────────────────┐    ┌────────────────┐
     │  :5000 (Blue)  │    │  :5001 (Green) │
     └────────────────┘    └────────────────┘

Deploy Flow:
─────────────────────────────────────────────

1. Pull latest image
2. Check which port is active (GET /api/health)
3. Deploy new container to opposite port
4. Health check new container (5 retries, 3s apart)
         │
    ┌────┴────┐
    ▼         ▼
  Pass      Fail
    │         │
    ▼         ▼
  Stop old  Rollback: remove failed
  container  container, keep old
```

**Containers:** `vidiopintar-app-5000`, `vidiopintar-app-5001`

**Port switching:** 5000 active → deploy 5001 | 5001 active → deploy 5000 | none → deploy 5000
