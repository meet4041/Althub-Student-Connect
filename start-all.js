#!/usr/bin/env node

const { spawn } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");

const rootDir = __dirname;

const services = [
  {
    name: "server",
    cwd: path.join(rootDir, "Althub-server"),
    command: "npm",
    args: ["start"],
    port: 5001,
    url: "http://localhost:5001",
  },
  {
    name: "main",
    cwd: path.join(rootDir, "Althub-main"),
    command: "npm",
    args: ["start"],
    port: 3000,
    url: "http://localhost:3000",
  },
  {
    name: "admin",
    cwd: path.join(rootDir, "Althub-admin"),
    command: "npm",
    args: ["start"],
    port: 3001,
    url: "http://localhost:3001",
  },
  {
    name: "super-admin",
    cwd: path.join(rootDir, "Althub-super-admin"),
    command: "npm",
    args: ["start"],
    port: 3002,
    url: "http://localhost:3002",
  },
];

const children = [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isPortOpenOnHost(port, host) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host });
    socket.setTimeout(800);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => resolve(false));
  });
}

async function isPortOpen(port) {
  const hosts = ["127.0.0.1", "localhost", "::1"];

  for (const host of hosts) {
    if (await isPortOpenOnHost(port, host)) {
      return true;
    }
  }

  return false;
}

async function waitForPort(service, timeoutMs = 45000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await isPortOpen(service.port)) {
      return true;
    }
    await sleep(500);
  }

  return false;
}

function startProcess(service) {
  console.log(`\n[${service.name}] starting: ${service.command} ${service.args.join(" ")}`);

  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });

  children.push({ service, child });

  child.stdout.on("data", (data) => {
    process.stdout.write(`[${service.name}] ${data}`);
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(`[${service.name}] ${data}`);
  });

  child.on("exit", (code, signal) => {
    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.log(`[${service.name}] exited with ${reason}`);
  });

  return child;
}

async function startService(service) {
  if (await isPortOpen(service.port)) {
    console.log(`[${service.name}] port ${service.port} is already running, reusing ${service.url}`);
    return;
  }

  const child = startProcess(service);
  const ready = await waitForPort(service);

  if (!ready) {
    child.kill("SIGTERM");
    throw new Error(`[${service.name}] did not become ready on port ${service.port}`);
  }

  console.log(`[${service.name}] ready at ${service.url}`);
}

async function shutdown() {
  console.log("\nShutting down Althub services...");

  for (const { service, child } of [...children].reverse()) {
    if (child.exitCode !== null) continue;

    console.log(`[${service.name}] stopping`);
    child.kill("SIGTERM");

    const stopped = await Promise.race([
      new Promise((resolve) => child.once("exit", () => resolve(true))),
      sleep(5000).then(() => false),
    ]);

    if (!stopped && child.exitCode === null) {
      console.log(`[${service.name}] forcing stop`);
      child.kill("SIGKILL");
    }
  }

  process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

async function main() {
  console.log("Starting Althub stack in order: server -> main -> admin -> super-admin");

  for (const service of services) {
    await startService(service);
  }

  console.log("\nAll Althub services are ready:");
  for (const service of services) {
    console.log(`- ${service.name}: ${service.url}`);
  }
  console.log("\nPress Ctrl+C to stop the services started by this script.");
}

main().catch(async (error) => {
  console.error(`\n${error.message}`);
  await shutdown();
});
