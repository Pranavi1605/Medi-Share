import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

console.log("==================================================");
console.log("🏥 Starting MediShare (Backend + Frontend)...");
console.log("==================================================");

// Spawn Server
const server = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(__dirname, "server"),
  shell: isWindows,
  stdio: "pipe",
});

// Spawn Client
const client = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(__dirname, "client"),
  shell: isWindows,
  stdio: "pipe",
});

function prefixOutput(stream, prefix, colorCode) {
  stream.on("data", (data) => {
    const lines = data.toString().split(/\r?\n/);
    for (const line of lines) {
      if (line.trim().length > 0) {
        console.log(`\x1b[${colorCode}m[${prefix}]\x1b[0m ${line}`);
      }
    }
  });
}

prefixOutput(server.stdout, "SERVER", "34"); // Blue
prefixOutput(server.stderr, "SERVER", "31"); // Red
prefixOutput(client.stdout, "CLIENT", "32"); // Green
prefixOutput(client.stderr, "CLIENT", "33"); // Yellow

const cleanup = () => {
  console.log("\nShutting down MediShare services...");
  try {
    if (isWindows) {
      if (server.pid) spawn("taskkill", ["/pid", server.pid.toString(), "/f", "/t"]);
      if (client.pid) spawn("taskkill", ["/pid", client.pid.toString(), "/f", "/t"]);
    } else {
      server.kill("SIGTERM");
      client.kill("SIGTERM");
    }
  } catch (e) {
    // ignore
  }
  process.exit();
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
