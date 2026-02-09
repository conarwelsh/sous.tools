import { spawn, execSync } from 'child_process';

const adbExe = 'C:\Users\conar\AppData\Local\Android\Sdk\platform-tools\adb.exe';
const emulatorExe = 'C:\Users\conar\AppData\Local\Android\Sdk\emulator\emulator.exe';
const avdName = 'Wear_OS_Large_Round';

function spawnDetached(command: string, args: string[]) {
  console.log(`Spawning: ${command} ${args.join(' ')}`);
  const child = spawn('/mnt/c/Windows/System32/cmd.exe', ['/c', command, ...args], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true
  });
  child.unref();
}

console.log('--- Fixing WearOS Environment ---');

// 1. Kill existing ADB (best effort)
try {
  spawnDetached('taskkill', ['/IM', 'adb.exe', '/F']);
} catch (e) {}

// 2. Start ADB Server allowing remote connections
// We use 'start /b' to run it without opening a window, but it persists.
setTimeout(() => {
  spawnDetached('start', ['/b', adbExe, '-a', 'nodaemon', 'server']);
}, 1000);

// 3. Launch Emulator
setTimeout(() => {
  spawnDetached('start', ['/b', emulatorExe, '-avd', avdName, '-no-snapshot-load']);
}, 3000);

console.log('Commands issued. Waiting for services to stabilize...');
