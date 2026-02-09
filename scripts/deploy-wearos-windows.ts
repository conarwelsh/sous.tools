import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// 1. Build the APK (using WSL Gradle)
console.log('🏗️  Building WearOS APK...');
try {
  execSync(`pnpm --filter @sous/wearos run build:debug`, { stdio: 'inherit' });
} catch (e) {
  console.error('❌ Build failed.');
  process.exit(1);
}

// 2. Construct Windows Path
const distro = process.env.WSL_DISTRO_NAME || 'Ubuntu';
const wslPath = path.resolve('apps/wearos/build/outputs/apk/debug/app-debug.apk');
const winPath = `\\\\wsl$\\${distro}${wslPath.replace(/\//g, '\\')}`;

console.log(`📦 APK Path: ${winPath}`);

// 3. Install via Windows ADB (Detached)
console.log('🚀 Spawning Install on Emulator via Windows ADB...');
const adbExe = 'C:\\Users\\conar\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe';

const out = fs.openSync('./wearos-install.log', 'a');
const err = fs.openSync('./wearos-install.err', 'a');

const child = spawn('/mnt/c/Windows/System32/cmd.exe', ['/c', adbExe, 'install', '-r', winPath], {
  detached: true,
  stdio: ['ignore', out, err],
  windowsHide: true
});

child.unref();

console.log('✅ Installation process spawned in background. Check wearos-install.log.');

// Launch command (also detached, attempting to run after a delay)
setTimeout(() => {
    const launch = spawn('/mnt/c/Windows/System32/cmd.exe', ['/c', adbExe, 'shell', 'monkey', '-p', 'com.sous.wearos', '-c', 'android.intent.category.LAUNCHER', '1'], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true
    });
    launch.unref();
}, 10000);