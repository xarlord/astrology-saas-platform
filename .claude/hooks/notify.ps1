# Windows Toast Notification for Claude Code
# Always exits 0 to never block Claude
param()
try {
    $inputJson = [System.Console]::In.ReadToEnd()
    if (-not [string]::IsNullOrWhiteSpace($inputJson)) {
        $data = $inputJson | ConvertFrom-Json
        $message = if ($data.message) { $data.message } else { "Claude Code needs your attention" }

        Add-Type -AssemblyName System.Windows.Forms
        $notify = New-Object System.Windows.Forms.NotifyIcon
        $notify.Icon = [System.Drawing.SystemIcons]::Information
        $notify.Visible = $true
        $notify.ShowBalloonTip(5000, "Claude Code", $message, [System.Windows.Forms.ToolTipIcon]::Info)
        Start-Sleep -Milliseconds 2000
        $notify.Dispose()
    }
} catch {
    # Silent fail - never block Claude
}
exit 0