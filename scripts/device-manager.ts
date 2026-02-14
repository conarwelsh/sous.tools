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

const CMD_EXE = "/mnt/c/Windows/System32/cmd.exe";
const ADB_PATH = "C:/Users/conar/AppData/Local/Android/Sdk/platform-tools/adb.exe";
const EMULATOR_PATH = "C:/Users/conar/AppData/Local/Android/Sdk/emulator/emulator.exe";

function winExecSync(cmd: string, options: any = {}) {
  if (IS_WSL) {
    // Ensure 60s timeout for all Windows interop calls
    return execSync(`${CMD_EXE} /c "${cmd}"`, {
      ...options,
      timeout: options.timeout || 60000,
    });
  }
  return execSync(cmd, options);
}

// Helper to get WSL IP
function getWslIp() {
  try {
    return execSync("ip route show default | awk '{print $3}'", { timeout: 10000 })
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

  // 0. Validate AVD exists
  console.error(`🔍 Validating AVD: ${AVD_NAME}...`);
  try {
    const avdList = winExecSync(`"${EMULATOR_PATH}" -list-avds`, { timeout: 15000 }).toString();
    if (!avdList.includes(AVD_NAME)) {
      console.error(`❌ AVD "${AVD_NAME}" not found in available devices:`);
      console.error(avdList);
      process.exit(1);
    }
    console.error(`✅ AVD validated.`);
  } catch (e: any) {
    console.error(`⚠️ Could not validate AVD list (skipping): ${e.message}`);
  }

  // 1. Check if already running
  let serial = await findSerialByAvd(AVD_NAME);
  if (serial) {
    console.error(`✅ Device ${AVD_NAME} is already running (${serial}).`);
    // Ensure ADB is connected to the right IP if WSL
    if (IS_WSL) {
      try {
        winExecSync(`${ADB_PATH} connect ${WIN_IP}:${serial.split("-")[1]}`, { timeout: 10000 });
      } catch (e) {}
    }
    console.log(serial);
    process.exit(0);
  }

  // 2. Start Emulator
  console.error(`🚀 Launching emulator: ${AVD_NAME}...`);

  if (IS_WSL) {
    // Launch via cmd.exe to ensure it's a Windows process that survives WSL session
    // Use full path and explicit environment to prevent hangs
    spawn(
      CMD_EXE,
      [
        "/c",
        "start",
        "/b",
        "cmd",
        "/c",
        `"${EMULATOR_PATH}" -avd ${AVD_NAME} -no-snapshot-load -no-audio -no-boot-anim`,
      ],
      {
        detached: true,
        stdio: "ignore",
      },
    ).unref();
  } else {
    spawn(EMULATOR_PATH, ["-avd", AVD_NAME, "-no-snapshot-load"], {
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
    const devicesOutput = winExecSync(`${ADB_PATH} devices`, {
      stdio: ["pipe", "pipe", "ignore"],
      timeout: 30000,
    }).toString();

    const lines = devicesOutput
      .split("\n")
      .filter((l) => l.includes("\tdevice"));

    for (const line of lines) {
      const serial = line.split("\t")[0].trim();
      try {
        // Strict 10s timeout for each device query to prevent overall hang
        const avdName = winExecSync(
          `${ADB_PATH} -s ${serial} shell getprop ro.boot.qemu.avd_name`,
          { stdio: ["pipe", "pipe", "ignore"], timeout: 10000 }
        )
          .toString()
          .trim();
        const model = winExecSync(
          `${ADB_PATH} -s ${serial} shell getprop ro.product.model`,
          { stdio: ["pipe", "pipe", "ignore"], timeout: 10000 }
        )
          .toString()
          .trim();

        if (avdName === targetAvd) return serial;

        // Fallback to model check
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
