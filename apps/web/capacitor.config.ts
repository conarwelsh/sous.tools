import type { CapacitorConfig } from "@capacitor/cli";
import { execSync } from "child_process";

// Detect WSL IP for development
let serverUrl = "http://10.0.2.2:3000"; 
try {
  const output = execSync("hostname -I").toString().trim();
  const wslIp = output.split(" ").find(ip => ip !== "127.0.0.1" && ip.startsWith("172.")) || output.split(" ")[0];
  const port = process.env.PORT || "3000";
  if (wslIp) {
    serverUrl = `http://${wslIp}:${port}`;
    console.log("CapacitorConfig: BAKING_IN_URL:", serverUrl);
  }
} catch (e) {
  console.warn("Could not detect WSL IP, falling back to 10.0.2.2");
}

const config: CapacitorConfig = {
  appId: "com.sous.tools",
  appName: "sous",
  webDir: "out",
  bundledWebRuntime: false,
  server: {
    url: serverUrl,
    cleartext: true,
    allowNavigation: ["*"] // Allow everything in dev
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;
