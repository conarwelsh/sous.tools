/**
 * Sous Windows Agent
 * 
 * FIREWALL SETUP (Run in Windows PowerShell as Admin):
 * New-NetFirewallRule -DisplayName 'Sous Agent (TCP-In)' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 4040
 * New-NetFirewallRule -DisplayName 'Android ADB (TCP-In)' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5037
 */
const http = require('http');
const { spawn, exec } = require('child_process');
const path = require('path');

const PORT = 4040;
const USERNAME = 'conar';
const SDK_PATH = `C:\\Users\\${USERNAME}\\AppData\\Local\\Android\\Sdk`;
const ADB_EXE = path.join(SDK_PATH, 'platform-tools', 'adb.exe');
const EMU_EXE = path.join(SDK_PATH, 'emulator', 'emulator.exe');

let logs = [];

function addLog(msg, level = 'info') {
  const log = { timestamp: new Date().toISOString(), message: msg, level };
  logs.push(log);
  if (logs.length > 100) logs.shift();
  console.log(`[${level.toUpperCase()}] ${msg}`);
}

// 1. Ensure ADB is running with -a (critical for WSL access)
function startAdb() {
  addLog('Restarting ADB server with -a flag...');
  exec(`"${ADB_EXE}" kill-server`, () => {
    // -a means listen on all interfaces
    const adb = spawn(ADB_EXE, ['-a', 'nodaemon', 'server'], { detached: false });
    adb.stdout.on('data', (data) => addLog(`ADB: ${data.toString().trim()}`));
    adb.stderr.on('data', (data) => addLog(`ADB Error: ${data.toString().trim()}`, 'warn'));
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }
  
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        addLog(`Received command: ${data.command}`);

        switch (data.command) {
          case 'ping':
            res.end(JSON.stringify({ status: 'ok', message: 'Sous Windows Agent is alive' }));
            break;

          case 'list-avds':
            addLog('Listing AVDs...');
            exec(`"${EMU_EXE}" -list-avds`, (err, stdout, stderr) => {
              res.end(JSON.stringify({ status: err ? 'error' : 'success', avds: stdout.split('\n').filter(l => !!l.trim()) }));
            });
            break;

          case 'launch-emulator':
            const emuArgs = ['-avd', data.avd, '-port', data.port || '5554', '-no-snapshot-load'];
            addLog(`Launching emulator: ${data.avd} on port ${data.port || '5554'}`);
            const emu = spawn(EMU_EXE, emuArgs, { detached: true, stdio: 'ignore' });
            emu.unref();
            res.end(JSON.stringify({ status: 'success', message: `Launched ${data.avd}` }));
            break;

          case 'adb':
            addLog(`Running ADB command: ${data.args}`);
            exec(`"${ADB_EXE}" ${data.args}`, (err, stdout, stderr) => {
              res.end(JSON.stringify({ status: err ? 'error' : 'success', stdout, stderr }));
            });
            break;

          case 'launch-browser':
            const chromePath = '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"';
            const profile = data.profile ? `--profile-directory="${data.profile}"` : '';
            const themePath = data.theme ? `--load-extension="C:\\Users\\conar\\sous.tools\\${data.theme.replace(/\//g, '\\')}"` : '';
            const urls = data.urls ? data.urls.join(' ') : '';
            addLog(`Launching Chrome profile: ${data.profile || 'Default'}`);
            exec(`${chromePath} ${profile} ${themePath} --new-window ${urls}`, (err) => {
              res.end(JSON.stringify({ status: err ? 'error' : 'success' }));
            });
            break;

          case 'position-window':
            const psScript = `
              $titlePart = "${data.title}"
              Add-Type -TypeDefinition @"
                using System;
                using System.Text;
                using System.Collections.Generic;
                using System.Runtime.InteropServices;
                public class Win32 {
                  [DllImport("user32.dll")]
                  public static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);
                  [DllImport("user32.dll")]
                  public static extern bool SetForegroundWindow(IntPtr hWnd);
                  [DllImport("user32.dll")]
                  public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
                  [DllImport("user32.dll")]
                  public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
                  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
                }
"@
              $foundHwnd = [IntPtr]::Zero
              [Win32]::EnumWindows({
                param($hwnd, $lparam)
                $sb = New-Object System.Text.StringBuilder 256
                [Win32]::GetWindowText($hwnd, $sb, 256) | Out-Null
                if ($sb.ToString().Contains($titlePart)) {
                  $script:foundHwnd = $hwnd
                  return $false
                }
                return $true
              }, [IntPtr]::Zero) | Out-Null

              if ($foundHwnd -ne [IntPtr]::Zero) {
                [Win32]::MoveWindow($foundHwnd, ${data.x}, ${data.y}, ${data.width}, ${data.height}, $true)
                [Win32]::SetForegroundWindow($foundHwnd)
              }
            `;
            addLog(`Positioning window containing: ${data.title}`);
            exec(`powershell -Command "${psScript.replace(/\n/g, '')}"`, (err) => {
              res.end(JSON.stringify({ status: err ? 'error' : 'success' }));
            });
            break;

          default:
            res.statusCode = 404;
            res.end(JSON.stringify({ status: 'error', message: 'Unknown command' }));
        }
      } catch (e) {
        addLog(`Error processing request: ${e.message}`, 'error');
        res.statusCode = 500;
        res.end(JSON.stringify({ status: 'error', message: e.message }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/logs') {
    res.end(JSON.stringify({ status: 'success', logs }));
    logs = []; // Clear logs after sending
  } else {
    res.end(JSON.stringify({ status: 'ok', info: 'Sous Windows Agent' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  addLog(`🚀 Sous Windows Agent running at http://0.0.0.0:${PORT}`);
  addLog(`Configured ADB: ${ADB_EXE}`);
  addLog(`Configured Emulator: ${EMU_EXE}`);
  startAdb();
});
