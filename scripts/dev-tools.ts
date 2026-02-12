import { resolveConfig } from "../packages/config/src/index";
import { spawn, execSync, ChildProcess } from "child_process";
import net from "net";
import fs from "fs";
import path from "path";

const app = process.argv[2];
const instanceName = process.env.PM2_APP_NAME || app;

async function main() {
  const configResolved = await resolveConfig();

  if (!app) {
    console.error("Usage: dev-tools <app_name>");
    process.exit(1);
  }

  // --- Configuration ---

  const appConfigs: Record<
    string,
    { port: number; command: string; cwd: string; color: string; requiresEmulator?: boolean }
  > = {
    web: {
      port: Number(process.env.PORT) || configResolved.web.port,
      command: "next dev -H 0.0.0.0",
      cwd: "apps/web",
      color: "34", // Blue
    },
    docs: {
      port: Number(process.env.PORT) || configResolved.docs.port,
      command: "next dev --webpack -H 0.0.0.0",
      cwd: "apps/docs",
      color: "32", // Green
    },
    api: {
      port: Number(process.env.PORT) || configResolved.api.port,
      command: "nest start --watch",
      cwd: "apps/api",
      color: "33", // Yellow
    },
  wearos: {
    port: 8081,
    command: "bash /home/conar/sous.tools/scripts/run-wearos.sh TARGET_DEVICE",
    cwd: ".",
    color: "35", // Magenta
    requiresEmulator: true,
  },
  "signage-android": {
    port: 1425,
    command: "bash /home/conar/sous.tools/scripts/run-android.sh TARGET_DEVICE signage", 
    cwd: ".", 
    color: "36", // Cyan
    requiresEmulator: true,
  },
  "kds-android": {
    port: 1423,
    command: "bash /home/conar/sous.tools/scripts/run-android.sh TARGET_DEVICE kds", 
    cwd: ".", 
    color: "32", // Green
    requiresEmulator: true,
  },
  "pos-android": {
    port: 1424,
    command: "bash /home/conar/sous.tools/scripts/run-android.sh TARGET_DEVICE pos", 
    cwd: ".", 
    color: "33", // Yellow
    requiresEmulator: true,
  },
  "tools-android": {
    port: 3000,
    command: "bash /home/conar/sous.tools/scripts/run-android.sh TARGET_DEVICE tools", 
    cwd: ".", 
    color: "34", // Blue
    requiresEmulator: true,
  }
  // Add other apps if needed
};

const config = appConfigs[app];

if (!config) {
  console.error(`Unknown app: ${app}`);
  process.exit(1);
}

// --- ANSI Colors ---

const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const APP_COLOR = `\x1b[${config.color}m`;

// --- State Management ---

let child: ChildProcess | null = null;
let status: "stopped" | "starting" | "ready" | "building" | "error" = "stopped";
const SOCKET_PATH = `/tmp/sous-dev-${instanceName}.sock`;

// --- Helper Functions ---

function log(message: string, type: "info" | "error" | "raw" | "warn" = "info") {
  const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
  const prefix = `${COLORS.gray}[${timestamp}]${COLORS.reset} ${APP_COLOR}[${app}]${COLORS.reset}`;
  
  if (type === "raw") {
    // Try to detect state from raw output
    detectState(message);
    
    // Traffic light status indicator
    let statusColor = COLORS.gray;
    if (status === "ready") statusColor = COLORS.green;
    if (status === "building" || status === "starting") statusColor = COLORS.yellow;
    if (status === "error") statusColor = COLORS.red;

    const statusDot = `${statusColor}●${COLORS.reset}`;
    
    process.stdout.write(`${prefix} ${statusDot} ${message}`);
  } else {
    let color = COLORS.cyan;
    if (type === "error") color = COLORS.red;
    if (type === "warn") color = COLORS.yellow;
    console.log(`${prefix} ${color}${message}${COLORS.reset}`);
  }
}

function detectState(line: string) {
  const lower = line.toLowerCase();
  if (lower.includes("compiling") || lower.includes("building") || lower.includes("starting")) {
    status = "building";
  } else if (lower.includes("ready") || lower.includes("started") || lower.includes("listening") || lower.includes("build successful")) {
    status = "ready";
  } else if (lower.includes("error") || lower.includes("failed")) {
    status = "error";
  }
}

function getPnpmPath() {
  try {
    return execSync("which pnpm").toString().trim();
  } catch (e) {
    return "pnpm";
  }
}

async function startEmulator(): Promise<boolean> {
  log("Ensuring emulator is running...", "info");
  
  const winIp = execSync("ip route show default | awk '{print $3}'").toString().trim();
  const agentUrl = `http://${winIp}:4040`;

  let avdName = 'Pixel_9';
  if (app === 'wearos') avdName = 'Wear_OS_Large_Round';
  if (app === 'signage-android') avdName = 'Television_1080p';
  if (app === 'kds-android') avdName = 'Medium_Desktop';
  if (app === 'pos-android') avdName = 'Pixel_Tablet';
  if (app === 'tools-android') avdName = 'Pixel_9';

  log(`Requesting emulator launch via agent: ${avdName}`, "info");
  
  try {
    const response = await fetch(`${agentUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command: 'launch-emulator',
        avd: avdName
      })
    });
    const data: any = await response.json();
    return data.status === 'success';
  } catch (e: any) {
    log(`Failed to request emulator launch via agent: ${e.message}`, "error");
    return false;
  }
}

async function findDevice(modelName: string, retries = 15): Promise<string | null> {
  const winIp = execSync("ip route show default | awk '{print $3}'").toString().trim();
  const agentUrl = `http://${winIp}:4040`;
  
  // Map our internal aliases to potential AVD names or model strings
  const matches = (detected: string) => {
    if (!detected) return false;
    const d = detected.toLowerCase();
    const m = modelName.toLowerCase();
    if (d.includes(m)) return true;
    if (m === 'atv' && (d.includes('atv') || d.includes('tv'))) return true;
    if (m === 'wear' && d.includes('wear')) return true;
    if (m === 'tablet' && d.includes('tablet')) return true;
    if (m === 'gpc' && (d.includes('gpc') || d.includes('desktop'))) return true;
    if (m === 'phone' && d.includes('gphone')) return true;
    return false;
  };

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`${agentUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'adb', args: 'devices' })
      });
      const data: any = await response.json();
      const lines = data.stdout.split('\r\n').slice(1);
      const devices = lines.filter((l: string) => l.includes('\tdevice')).map((l: string) => l.split('\t')[0]);

      for (const serial of devices) {
        // 1. Check AVD Name (most specific)
        const avdRes = await fetch(`${agentUrl}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: 'adb', args: `-s ${serial} shell getprop ro.boot.qemu.avd_name` })
        });
        const avdData: any = await avdRes.json();
        if (matches(avdData.stdout)) return serial;

        // 2. Check Model Name (fallback)
        const modelRes = await fetch(`${agentUrl}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: 'adb', args: `-s ${serial} shell getprop ro.product.model` })
        });
        const modelData: any = await modelRes.json();
        if (matches(modelData.stdout)) return serial;
      }

      log(`Device matching "${modelName}" not found yet, retrying... (${i+1}/${retries})`, "warn");
    } catch (e) {
      log(`Discovery attempt ${i+1} failed: ${e}`, "error");
    }
    await new Promise(r => setTimeout(r, 4000));
  }
  return null;
}

async function startProcess() {
  if (child) return;

  status = "starting";
  
  let targetDevice = "";

  if (config.requiresEmulator) {
    const emuStarted = await startEmulator();
    if (!emuStarted) {
      log("Emulator failed to start. Aborting process startup to prevent hang.", "error");
      status = "error";
      return;
    }
    // Give it a moment to boot/register
    await new Promise(r => setTimeout(r, 5000));

    // Discover the actual serial/port
    let model = 'Pixel_9';
    if (app === 'wearos') model = 'Wear_OS_Large_Round';
    if (app === 'signage-android') model = 'Television_1080p';
    if (app === 'kds-android') model = 'Medium_Desktop';
    if (app === 'pos-android') model = 'Pixel_Tablet';
    if (app === 'tools-android') model = 'Pixel_9';
    
    log(`Discovering ${model} device...`, "info");
    const discovered = await findDevice(model, 15); 
    if (discovered) {
      log(`Discovered target device: ${discovered}`, "info");
      targetDevice = discovered;
    } else {
      log(`Could not discover ${model} device after waiting. Aborting to avoid hanging on dummy TARGET_DEVICE.`, "error");
      status = "error";
      return;
    }
  }

  log("Starting process...");

  const pnpmPath = getPnpmPath();
  let finalCommand = config.command;
  if (targetDevice) {
    // Inject the discovered target
    finalCommand = finalCommand.replace("TARGET_DEVICE", targetDevice);
  }

  // Detect WSL IP for injection
  let hostIp = "localhost";
  try {
    const ips = execSync("hostname -I").toString().trim().split(" ");
    hostIp = ips.find(ip => ip !== "127.0.0.1" && ip.startsWith("172.")) || ips[0] || "localhost";
    
    // Fallback if the above doesn't work well
    if (hostIp === "localhost" || hostIp === "127.0.0.1") {
       hostIp = execSync("ip route get 1 | awk '{print $7;exit}'").toString().trim();
    }
  } catch (e) {
    // Fallback to localhost
  }

  const [cmd, ...args] = finalCommand.split(" ");

  // Spawn with detached: true to create a new process group
  child = spawn(pnpmPath, ["exec", cmd, ...args], {
    stdio: ["ignore", "pipe", "pipe"],
    cwd: config.cwd,
    detached: true, // Critical for tree-killing
          env: {
            ...process.env,
            PORT: config.port.toString(),
            FLAVOR: process.env.FLAVOR,
            DIST_DIR: process.env.DIST_DIR,
            ANDROID_SERIAL: targetDevice || undefined,
            NEXT_PUBLIC_API_URL: configResolved.api.url,
            NEXT_PUBLIC_WEB_URL: configResolved.web.url,
            FORCE_COLOR: "1", 
          },  });

  child.stdout?.on("data", (data) => {
    log(data.toString(), "raw");
  });

  child.stderr?.on("data", (data) => {
    log(data.toString(), "raw");
  });

  child.on("exit", (code) => {
    log(`Process exited with code ${code}`, code === 0 ? "info" : "error");
    child = null;
    status = "stopped";
    
    // Exit if this is a one-shot flavor
    if (app.includes("android") || app === "wearos") {
      process.exit(code || 0);
    }
  });

  child.on("error", (err) => {
    log(`Failed to start process: ${err.message}`, "error");
    status = "error";
  });
}

function stopProcess() {
  if (child && child.pid) {
    log("Stopping process tree...");
    try {
      // Kill the entire process group using negative PID
      process.kill(-child.pid, "SIGTERM");
    } catch (e: any) {
      log(`Failed to kill process group: ${e.message}`, "error");
    }
  }
}

function restartProcess() {
  log("Restarting process...");
  if (child) {
    stopProcess();
    // Wait for exit before starting
    const checkInterval = setInterval(() => {
        if (!child) {
            clearInterval(checkInterval);
            startProcess();
        }
    }, 100);
  } else {
    startProcess();
  }
}

// --- IPC Server ---

if (fs.existsSync(SOCKET_PATH)) {
  fs.unlinkSync(SOCKET_PATH);
}

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const msg = data.toString().trim();
    log(`Received command: ${msg}`, "info");

    switch (msg) {
      case "start":
        startProcess();
        break;
      case "stop":
        stopProcess();
        break;
      case "restart":
        restartProcess();
        break;
      case "status":
        socket.write(JSON.stringify({ status, pid: child?.pid }));
        break;
      default:
        socket.write("Unknown command");
    }
  });
});

server.listen(SOCKET_PATH, () => {
  log(`Control socket listening at ${SOCKET_PATH}`);
});

// --- Initialization ---

// Handle script termination to clean up socket
process.on("SIGINT", () => {
  stopProcess();
  if (fs.existsSync(SOCKET_PATH)) {
    fs.unlinkSync(SOCKET_PATH);
  }
  process.exit();
});

// Start the tool
if (!process.env.WAIT_FOR_CONTROL) {
  void startProcess();
}
}

main().catch(err => {
  console.error("Fatal error in dev-tools:", err);
  process.exit(1);
});