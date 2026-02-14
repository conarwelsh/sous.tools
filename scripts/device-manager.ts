import { execSync, spawn } from "child_process";
import fs from "fs";

/**
 * Sous Device Manager 2.0
 * Handles emulator lifecycle using adb.exe (WSL) or adb (Linux)
 */

const AVD_NAME = process.argv[2];
const IS_WSL = fs
  .readFileSync("/proc/version", "utf8")
  .toLowerCase()
  .includes("microsoft");
const ADB = IS_WSL ? "adb.exe" : "adb";
const EMULATOR = IS_WSL ? "emulator.exe" : "emulator";

// Helper to get WSL IP
function getWslIp() {
  try {
    return execSync("ip route show default | awk '{print $3}'")
      .toString()
      .trim();
  } catch (e) {
    return "127.0.0.1";
  }
}

async function main() {
  if (!AVD_NAME) {
    console.error("Usage: device-manager <avd_name>");
    process.exit(1);
  }

  const WIN_IP = getWslIp();

  // 1. Check if already running
  let serial = await findSerialByAvd(AVD_NAME);
  if (serial) {
    console.error(`✅ Device ${AVD_NAME} is already running (${serial}).`);
    // Ensure ADB is connected to the right IP if WSL
    if (IS_WSL) {
      try {
        execSync(`${ADB} connect ${WIN_IP}:${serial.split("-")[1]}`, {
          stdio: "ignore",
        });
      } catch (e) {}
    }
    console.log(serial);
    process.exit(0);
  }

  // 2. Start Emulator
  console.error(`🚀 Launching emulator: ${AVD_NAME}...`);

  if (IS_WSL) {
    // Attempt to find emulator.exe robustly
    let emulatorCmd = "emulator.exe";

    // Check if emulator is in PATH
    try {
      execSync("cmd.exe /c where emulator.exe", { timeout: 60000, stdio: "ignore" });
    } catch {
      // Not in path, search standard locations
      const userProfile = execSync("cmd.exe /c echo %USERPROFILE%", { timeout: 60000 })
        .toString()
        .trim();
      const candidates = [
        `${userProfile}\\AppData\\Local\\Android\\Sdk\\emulator\\emulator.exe`,
        `C:\\Users\\conar\\AppData\\Local\\Android\\Sdk\\emulator\\emulator.exe`,
        `C:\\Android\\emulator\\emulator.exe`,
      ];

      for (const candidate of candidates) {
        try {
          // Check if file exists via cmd
          execSync(`cmd.exe /c if exist "${candidate}" echo found`, { timeout: 60000 });
          emulatorCmd = `"${candidate}"`;
          console.error(`Found emulator at: ${emulatorCmd}`);
          break;
        } catch {}
      }
    }

    // Launch via cmd.exe to ensure it's a Windows process that survives WSL session
    spawn(
      "cmd.exe",
      [
        "/c",
        "start",
        "/b",
        "cmd",
        "/c",
        `${emulatorCmd} -avd ${AVD_NAME} -no-snapshot-load`,
      ],
      {
        detached: true,
        stdio: "ignore",
      },
    ).unref();
  } else {
    spawn(EMULATOR, ["-avd", AVD_NAME], {
      detached: true,
      stdio: "ignore",
    }).unref();
  }

  // 3. Wait for boot and discover serial
  console.error(
    `⏳ Waiting for ${AVD_NAME} to register and finish booting (max 120s)...`,
  );
  let attempts = 0;
  while (!serial && attempts < 60) {
    process.stderr.write(".");
    await new Promise((r) => setTimeout(r, 2000));
    serial = await findSerialByAvd(AVD_NAME);
    attempts++;
  }
  process.stderr.write("\n");

  if (serial) {
    console.error(`✅ Device ${serial} is ready.`);
    console.log(serial);
    process.exit(0);
  } else {
    console.error(`❌ Failed to start emulator: ${AVD_NAME}`);
    process.exit(1);
  }
}

async function findSerialByAvd(targetAvd: string): Promise<string | null> {
  try {
    // Add timeout to adb commands to prevent hangs
    const devicesOutput = execSync(`${ADB} devices`, {
      timeout: 60000,
      stdio: ["pipe", "pipe", "ignore"],
    }).toString();
    const lines = devicesOutput
      .split("\n")
      .filter((l) => l.includes("\tdevice"));

    for (const line of lines) {
      const serial = line.split("\t")[0].trim();
      try {
        const avdName = execSync(
          `${ADB} -s ${serial} shell getprop ro.boot.qemu.avd_name`,
          { timeout: 60000, stdio: ["pipe", "pipe", "ignore"] },
        )
          .toString()
          .trim();
        if (avdName === targetAvd) return serial;

        // Fallback to model check
        const model = execSync(
          `${ADB} -s ${serial} shell getprop ro.product.model`,
          { timeout: 60000, stdio: ["pipe", "pipe", "ignore"] },
        )
          .toString()
          .trim();
        if (
          model
            .toLowerCase()
            .includes(targetAvd.toLowerCase().replace(/_/g, " "))
        )
          return serial;
      } catch (e) {
        // Device might be offline or booting
      }
    }
  } catch (e) {
    // adb might not be in path yet
  }
  return null;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
