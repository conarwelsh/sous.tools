import { spawn } from 'child_process';

const emulatorExe = 'C:\\Users\\conar\\AppData\\Local\\Android\\Sdk\\emulator\\emulator.exe';
const avdName = 'Wear_OS_Large_Round';

console.log(`Launching emulator: ${avdName} via cmd.exe`);

const child = spawn('/mnt/c/Windows/System32/cmd.exe', ['/c', 'start', '/b', emulatorExe, '-avd', avdName, '-no-snapshot-load'], {
  detached: true,
  stdio: 'ignore',
  windowsHide: true
});

child.unref();

console.log('Emulator process spawned via cmd.');