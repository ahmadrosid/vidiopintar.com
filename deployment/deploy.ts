#!/usr/bin/env bun

/**
 * Blue-Green Deployment Script for Vidiopintar.com
 * Works with nginx upstream configuration on ports 5000 and 5001
 *
 * Usage: bun deployment/deploy.ts
 */

import { $ } from "bun";
import { appendFile } from "node:fs/promises";

// Configuration
const CONFIG = {
  projectName: "vidiopintar",
  imageName: "ghcr.io/ahmadrosid/vidiopintar.com:latest",
  containerName: "vidiopintar-app",
  portA: "5000",
  portB: "5001",
  internalPort: "3000",
  logFile: "/var/log/vidiopintar-deploy.log",
  maxHealthRetries: 5,
  healthCheckInterval: 3000, // milliseconds
} as const;

// Colors for output
const colors = {
  red: "\x1b[0;31m",
  green: "\x1b[0;32m",
  yellow: "\x1b[1;33m",
  reset: "\x1b[0m",
} as const;

// Logging functions
function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

async function writeToLog(message: string): Promise<void> {
  try {
    await appendFile(CONFIG.logFile, `[${timestamp()}] ${message}\n`);
  } catch {
    // Ignore log file write errors
  }
}

function log(message: string): void {
  const formatted = `${colors.green}[${timestamp()}]${colors.reset} ${message}`;
  console.log(formatted);
  writeToLog(message);
}

function error(message: string): void {
  const formatted = `${colors.red}[${timestamp()}] ERROR:${colors.reset} ${message}`;
  console.error(formatted);
  writeToLog(`ERROR: ${message}`);
}

function warning(message: string): void {
  const formatted = `${colors.yellow}[${timestamp()}] WARNING:${colors.reset} ${message}`;
  console.warn(formatted);
  writeToLog(`WARNING: ${message}`);
}

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check if a port has a healthy running container
async function isPortHealthy(port: string, verbose = false): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    if (verbose) {
      const text = await response.text();
      log(`Health check response (${response.status}): ${text}`);
    }
    return response.ok;
  } catch (err) {
    if (verbose) {
      error(`Health check error: ${err}`);
    }
    return false;
  }
}

// Get container ID running on a specific port
async function getContainerOnPort(port: string): Promise<string | null> {
  const result = await $`docker ps --filter "publish=${port}" -q`.quiet();
  const containerId = result.text().trim();
  return containerId || null;
}

// Get container ID by name
async function getContainerByName(name: string): Promise<string | null> {
  const result =
    await $`docker ps --filter "name=${name}" -q --all`.quiet();
  const containerId = result.text().trim();
  return containerId || null;
}

// Stop and remove a container
async function removeContainer(container: string): Promise<void> {
  try {
    await $`docker stop ${container}`.quiet();
  } catch {
    // Ignore errors
  }
  try {
    await $`docker rm ${container}`.quiet();
  } catch {
    // Ignore errors
  }
}

// Clean up failing containers on both ports
async function cleanupFailingContainers(): Promise<void> {
  log("Checking for failing containers on both ports...");

  for (const port of [CONFIG.portA, CONFIG.portB]) {
    const containerId = await getContainerOnPort(port);
    if (containerId) {
      log(`Container found on port ${port}, checking health...`);
      const healthy = await isPortHealthy(port);
      if (!healthy) {
        warning(`Container on port ${port} is unhealthy, removing it...`);
        await removeContainer(containerId);
        log(`Removed failing container from port ${port}`);
      }
    }
  }
}

// Determine which port is currently active
async function getActivePort(): Promise<string | "none"> {
  // Check port A
  const containerA =
    await $`docker ps --filter "publish=${CONFIG.portA}" --filter "name=${CONFIG.containerName}" -q`.quiet();
  if (containerA.text().trim() && (await isPortHealthy(CONFIG.portA))) {
    return CONFIG.portA;
  }

  // Check port B
  const containerB =
    await $`docker ps --filter "publish=${CONFIG.portB}" --filter "name=${CONFIG.containerName}" -q`.quiet();
  if (containerB.text().trim() && (await isPortHealthy(CONFIG.portB))) {
    return CONFIG.portB;
  }

  return "none";
}

// Get target port based on active port
function getTargetPort(activePort: string | "none"): string {
  if (activePort === CONFIG.portA) {
    return CONFIG.portB;
  }
  return CONFIG.portA;
}

// Health check with retries
async function healthCheck(port: string): Promise<boolean> {
  log(`Performing health check on port ${port}...`);

  for (let i = 1; i <= CONFIG.maxHealthRetries; i++) {
    // Use verbose mode on last attempt to see the actual error
    const verbose = i === CONFIG.maxHealthRetries;
    if (await isPortHealthy(port, verbose)) {
      log(`Health check passed on port ${port}`);
      return true;
    }
    log(
      `Health check attempt ${i}/${CONFIG.maxHealthRetries} failed, retrying in ${CONFIG.healthCheckInterval / 1000} seconds...`
    );
    await sleep(CONFIG.healthCheckInterval);
  }

  error(
    `Health check failed after ${CONFIG.maxHealthRetries} attempts on port ${port}`
  );
  return false;
}

// Main deployment function
async function deploy(): Promise<void> {
  // Check for .env file
  const envFile = Bun.file(".env");
  if (!(await envFile.exists())) {
    error(".env file not found!");
    process.exit(1);
  }

  log("Starting blue-green deployment process...");

  // Pull latest image
  log(`Pulling latest Docker image: ${CONFIG.imageName}`);
  try {
    await $`docker pull ${CONFIG.imageName}`;
  } catch (err) {
    error(`Failed to pull Docker image: ${err}`);
    process.exit(1);
  }

  // Clean up any failing containers first
  await cleanupFailingContainers();

  // Determine active and target ports
  const activePort = await getActivePort();
  log(`Currently active port: ${activePort}`);

  let targetPort: string;
  if (activePort === "none") {
    log(`No active container found, deploying to port ${CONFIG.portA}`);
    targetPort = CONFIG.portA;
  } else {
    targetPort = getTargetPort(activePort);
    log(`Target deployment port: ${targetPort}`);
  }

  // Container names for each port
  const containerA = `${CONFIG.containerName}-${CONFIG.portA}`;
  const containerB = `${CONFIG.containerName}-${CONFIG.portB}`;
  const targetContainer =
    targetPort === CONFIG.portA ? containerA : containerB;

  // Stop and remove any existing container on target port
  const existingContainer = await getContainerByName(targetContainer);
  if (existingContainer) {
    log("Stopping existing container on target port...");
    await removeContainer(targetContainer);
  }

  // Start new container on target port
  log(`Starting new container on port ${targetPort}...`);
  try {
    await $`docker run -d \
      --name ${targetContainer} \
      --restart unless-stopped \
      --network host \
      -e PORT=${targetPort} \
      --env-file .env \
      ${CONFIG.imageName}`;
  } catch (err) {
    error(`Failed to start container: ${err}`);
    process.exit(1);
  }

  // Health check on new container
  if (await healthCheck(targetPort)) {
    log(`New container is healthy on port ${targetPort}`);
    log("Deployment completed successfully!");
    log(`New version is running on port ${targetPort}`);

    // Stop and remove old container if exists
    if (activePort !== "none" && activePort !== targetPort) {
      log(`Stopping previous container on port ${activePort}...`);

      const oldContainer =
        activePort === CONFIG.portA ? containerA : containerB;

      // Give nginx time to switch traffic
      log("Waiting 5 seconds for nginx to switch traffic...");
      await sleep(5000);

      // Stop and remove old container
      await removeContainer(oldContainer);
      log(`Previous container on port ${activePort} has been removed`);
    }

    // Show container status
    log("Container status:");
    await $`docker ps --filter "name=${CONFIG.containerName}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"`;
  } else {
    // Health check failed, show container logs before cleanup
    error("Deployment failed! Checking container logs...");
    try {
      const logs = await $`docker logs ${targetContainer} --tail 50`.quiet();
      console.log("\n--- Container Logs (last 50 lines) ---");
      console.log(logs.text());
      console.log("--- End of Container Logs ---\n");
    } catch {
      error("Could not retrieve container logs");
    }

    error("Removing failed container...");
    await removeContainer(targetContainer);

    if (activePort !== "none") {
      log(`Previous version is still running on port ${activePort}`);
    }

    process.exit(1);
  }

  // Clean up old Docker images
  log("Cleaning up old Docker images...");
  try {
    await $`docker image prune -f`.quiet();
  } catch {
    // Ignore errors
  }

  log("✅ Deployment process completed.");
}

// Run the deployment
deploy().catch((err) => {
  error(`Unexpected error: ${err}`);
  process.exit(1);
});
