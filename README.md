# Vidiopintar.com

AI-powered YouTube video learning platform. Submit a YouTube link to get video summaries and chat with the content using AI.

![Demo 1](http://res.cloudinary.com/dr15yjl8w/image/upload/v1750910596/public/gtvf4kejtuxr3fvethqe.png)

![Demo 2](http://res.cloudinary.com/dr15yjl8w/image/upload/v1750910570/public/jke8sblctm6hmqnbpfnp.png)

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth
- **AI**: OpenAI & Google AI SDK

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Start development server
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:
- Database connection
- OpenAI API key
- Google AI API key
- Auth secrets

## Docker Development Setup

### Option 1: Build and Run Locally

```bash
# Build the Docker image
docker build -t vidiopintar-app .

# Run the container (make sure to have .env file in the project root)
docker run -d --name vidiopintar-dev -p 5000:3000 --env-file .env vidiopintar-app
```

### Option 2: Using Pre-built Image

```bash
# Pull the latest image
docker pull ghcr.io/ahmadrosid/vidiopintar.com:latest

# Run the container
docker run -d --name vidiopintar-app -p 5000:3000 --env-file .env ghcr.io/ahmadrosid/vidiopintar.com:latest

# Remove docker container
docker stop vidiopintar-app && docker rm vidiopintar-app
```

### Docker Environment Notes

- The app runs on port 3000 inside the container
- If using a local PostgreSQL database, set `DB_HOST=host.docker.internal` in your `.env` file
- Make sure your `.env` file contains all required variables from `.env.example`
- Access the app at `http://localhost:5000`

### Stopping the Container

```bash
# Stop and remove the container
docker stop vidiopintar-dev
docker rm vidiopintar-dev
```
