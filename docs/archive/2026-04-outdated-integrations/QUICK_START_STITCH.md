# Quick Start: Stitch MCP Setup

## 1. Install and Run Setup (Automated)

```bash
# Run the interactive setup
npx @_davideast/stitch-mcp init
```

Follow the prompts:
1. Select **Claude Desktop** as your MCP client
2. The tool will guide you through:
   - Google Cloud CLI installation (if needed)
   - Authentication
   - Project selection
   - Configuration generation

## 2. Copy Generated Config

The setup will output a configuration block. Add it to:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

**Mac:** `~/.config/Claude/claude_desktop_config.json`

## 3. Restart Claude Desktop

- **Mac:** Cmd + Q → Reopen
- **Windows:** File → Exit → Reopen

## 4. Verify

The Stitch MCP tools should now be available in Claude:
- `extract_design_context`
- `generate_screen_from_text`
- `fetch_screen_code`
- `fetch_screen_image`
- `create_project`
- `list_projects`
- `list_screens`

## Troubleshooting

```bash
# Verify setup
npx @_davideast/stitch-mcp doctor
```
