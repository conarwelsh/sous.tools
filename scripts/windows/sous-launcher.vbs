Set WshShell = CreateObject("WScript.Shell")
' Launch the PowerShell tray script with hidden window
WshShell.Run "powershell.exe -ExecutionPolicy Bypass -File ""C:\tools\sous-agent\sous-tray.ps1""", 0, False
