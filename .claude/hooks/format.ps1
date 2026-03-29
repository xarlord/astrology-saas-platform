# PostToolUse Auto-Format: Run prettier on edited files
# Always exits 0 to never block Claude
param()
try {
    $inputJson = [System.Console]::In.ReadToEnd()
    if (-not [string]::IsNullOrWhiteSpace($inputJson)) {
        $data = $inputJson | ConvertFrom-Json
        $toolName = $data.tool_name
        $toolInput = $data.tool_input

        if ($toolName -in @('Edit', 'Write')) {
            $filePath = if ($toolInput.file_path) { $toolInput.file_path } else { "" }
            $ext = [System.IO.Path]::GetExtension($filePath)

            if ($ext -in @('.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.md')) {
                # Run prettier fire-and-forget
                Start-Process -FilePath "npx" -ArgumentList "prettier","--write",$filePath -NoNewWindow -WindowStyle Hidden 2>$null
            }
        }
    }
} catch {
    # Silent fail - never block Claude
}
exit 0