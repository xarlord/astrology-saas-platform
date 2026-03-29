# Claude Desktop MCP Configuration

## Claude Desktop Config File Location

### Windows
```
C:\Users\YOUR_USERNAME\AppData\Roaming\Claude\claude_desktop_config.json
```

### macOS
```
/Users/YOUR_USERNAME/Library/Application Support/Claude/claude_desktop_config.json
```

### Linux
```
~/.config/Claude/claude_desktop_config.json
```

---

## Current Configuration to Add

Add the `mcpServers` section to your config file:

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "@_davideast/stitch-mcp", "proxy"],
      "env": {
        "STITCH_PROJECT_ID": "YOUR_PROJECT_ID",
        "GOOGLE_CLOUD_PROJECT": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

Replace `YOUR_PROJECT_ID` with your actual Google Cloud Project ID.

---

## Example Complete Config

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "@_davideast/stitch-mcp", "proxy"],
      "env": {
        "STITCH_PROJECT_ID": "astrology-saas-platform-123456",
        "GOOGLE_CLOUD_PROJECT": "astrology-saas-platform-123456"
      }
    }
  }
}
```

---

## Important Notes

1. **JSON Format:** Ensure the file is valid JSON - no trailing commas
2. **Path Separators:** Use `\\` for Windows paths in JSON strings
3. **Restart Required:** Completely quit and restart Claude Desktop after changes
4. **Project ID:** Use your actual Google Cloud Project ID (not the display name)
