Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$agentScript = Join-Path $scriptDir "sous-agent.js"
$iconPath = Join-Path $scriptDir "agent.ico"
$logPath = Join-Path $scriptDir "tray.log"

function Log-Message($msg) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "[$timestamp] $msg" | Out-File -FilePath $logPath -Append
}

Log-Message "--- Tray Script Initialized ---"

# 1. Start the Node Agent
$nodePath = "node"
try {
    # Check if node is in path
    Get-Command node -ErrorAction Stop | Out-Null
} catch {
    Log-Message "WARN: 'node' not found in PATH. Trying common locations..."
    $commonPaths = @(
        "$env:ProgramFiles\nodejs\node.exe",
        "$env:ProgramFiles(x86)\nodejs\node.exe"
    )
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $nodePath = $path
            Log-Message "Found node at $nodePath"
            break
        }
    }
}

try {
    $agentProcess = Start-Process $nodePath -ArgumentList $agentScript -WindowStyle Hidden -PassThru
    Log-Message "Started Node Agent (PID: $($agentProcess.Id))"
} catch {
    Log-Message "ERROR: Failed to start Node Agent. Error: $($_.Exception.Message)"
}

# 2. Setup Tray Icon
$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
try {
    if (Test-Path $iconPath) {
        $bitmap = New-Object System.Drawing.Bitmap($iconPath)
        $hIcon = $bitmap.GetHicon()
        $notifyIcon.Icon = [System.Drawing.Icon]::FromHandle($hIcon)
        Log-Message "Custom icon loaded successfully."
    } else {
        Log-Message "WARN: agent.ico not found at $iconPath. Using fallback icon."
        $notifyIcon.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon((Get-Process -Id $pid).Path)
    }
} catch {
    Log-Message "ERROR: Icon loading failed. Fallback to generic icon. Error: $($_.Exception.Message)"
    $notifyIcon.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon((Get-Process -Id $pid).Path)
}

$notifyIcon.Text = "Sous Windows Agent"
$notifyIcon.Visible = $true

# 3. Context Menu
$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip
$itemStatus = $contextMenu.Items.Add("Check Status")
$itemExit = $contextMenu.Items.Add("Exit Agent")
$notifyIcon.ContextMenuStrip = $contextMenu

$itemStatus.add_Click({
    $proc = Get-Process -Id $agentProcess.Id -ErrorAction SilentlyContinue
    $status = if ($proc) { "Running (PID: $($proc.Id))" } else { "Stopped" }
    [System.Windows.Forms.MessageBox]::Show("Sous Windows Agent Status: $status", "Sous Agent")
})

$itemExit.add_Click({
    Log-Message "Exit requested."
    $notifyIcon.Visible = $false
    if ($agentProcess) {
        Stop-Process -Id $agentProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Stop-Process -Id $pid
    [System.Windows.Forms.Application]::Exit()
})

Log-Message "Tray icon visible. Entering message loop."

# 4. Message Loop
try {
    [System.Windows.Forms.Application]::Run()
} catch {
    Log-Message "CRITICAL: Message loop crashed: $($_.Exception.Message)"
}
