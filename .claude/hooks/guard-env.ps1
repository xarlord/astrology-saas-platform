# PreToolUse Guard: Block edits to .env files
# Exit 2 = block tool use, Exit 0 = allow
param()
try {
    $inputJson = [System.Console]::In.ReadToEnd()
    if (-not [string]::IsNullOrWhiteSpace($inputJson)) {
        $data = $inputJson | ConvertFrom-Json
        $toolName = $data.tool_name
        $toolInput = $data.tool_input

        if ($toolName -in @('Edit', 'Write', 'NotebookEdit')) {
            $filePath = if ($toolInput.file_path) { $toolInput.file_path } else { "" }
            $fileName = [System.IO.Path]::GetFileName($filePath)

            if ($fileName -match '^\.env') {
                [System.Console]::Error.WriteLine("Blocked: Editing .env files is not allowed via Claude. Edit manually.")
                exit 2
            }
        }
    }
} catch {
    # On error, allow the operation (fail open)
}
exit 0