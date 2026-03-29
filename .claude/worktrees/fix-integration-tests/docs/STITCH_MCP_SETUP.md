# Stitch MCP Setup Guide for Claude Desktop

## Overview

Stitch MCP is a Model Context Protocol server that connects Google Stitch AI to AI assistants, enabling text-to-UI generation capabilities.

---

## Prerequisites

- **Google Cloud Account** with billing enabled
- **Google Cloud CLI** (gcloud) installed
- **Node.js** (v18+)
- **Claude Desktop** installed and running

---

## Step 1: Install Google Cloud CLI

### Windows (PowerShell)

```powershell
# Download and install Google Cloud CLI
# Visit: https://cloud.google.com/sdk/docs/install

# Or using winget
winget install Google.CloudCLI

# Initialize gcloud
gcloud init
```

### macOS

```bash
# Install using Homebrew
brew install google-cloud-sdk

# Initialize gcloud
gcloud init
```

### Linux

```bash
# Add Debian repo and install
curl https://sdk.cloud.google.com | bash
export PATH=$PATH:$HOME/google-cloud-sdk/bin

# Initialize gcloud
gcloud init
```

---

## Step 2: Authenticate with Google Cloud

```bash
# Login to Google Cloud (opens browser)
gcloud auth login

# Set up Application Default Credentials (for MCP server)
gcloud auth application-default login
```

---

## Step 3: Create or Select a Google Cloud Project

```bash
# Create a new project
gcloud projects create astrology-saas-platform

# OR list existing projects
gcloud projects list

# Set your active project
gcloud config set project astrology-saas-platform
```

---

## Step 4: Enable Stitch API

```bash
# Install beta component (required for Stitch)
gcloud components install beta

# Enable the Stitch API
gcloud beta services mcp enable stitch.googleapis.com --project=astrology-saas-platform
```

---

## Step 5: Install Stitch MCP Helper CLI

```bash
# Run the interactive setup
npx @_davideast/stitch-mcp init
```

**This will guide you through:**
1. Select your MCP client → Choose **Claude Desktop**
2. Set up Google Cloud CLI
3. Authenticate with Google
4. Configure IAM permissions
5. Generate MCP configuration

**The setup will:**
- Copy commands to your clipboard
- Run them in your terminal
- Press Enter to continue after each step

---

## Step 6: Configure Claude Desktop

### Windows Configuration

Your config file is at:
```
%APPDATA%\Claude\claude_desktop_config.json
```

### macOS/Linux Configuration

Your config file is at:
```
~/.config/Claude/claude_desktop_config.json
```

### Add the Stitch MCP Configuration

The setup tool will generate configuration. Add it to your Claude Desktop config:

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "@_davideast/stitch-mcp", "proxy"],
      "env": {
        "STITCH_PROJECT_ID": "astrology-saas-platform",
        "GOOGLE_CLOUD_PROJECT": "astrology-saas-platform"
      }
    }
  }
}
```

---

## Step 7: Verify Installation

```bash
# Run the doctor command to verify setup
npx @_davideast/stitch-mcp doctor
```

This checks:
- ✅ Google Cloud CLI installation
- ✅ User authentication
- ✅ Application credentials
- ✅ Project configuration
- ✅ Stitch API connectivity

---

## Step 8: Restart Claude Desktop

1. Completely quit Claude Desktop (Cmd+Q on Mac, File→Exit on Windows)
2. Relaunch Claude Desktop
3. The Stitch MCP server should now be loaded

---

## Verify Connection

Once restarted, you should see the Stitch MCP tools available:
- `extract_design_context` - Extract design DNA from a screen
- `fetch_screen_code` - Get HTML/Frontend code
- `fetch_screen_image` - Download screenshot
- **`generate_screen_from_text`** - Generate UI from text prompt
- `create_project` - Create new Stitch project
- `list_projects` - List Stitch projects
- `list_screens` - List screens in a project

---

## Troubleshooting

### Error: "Permission Denied"

Ensure:
- Billing is enabled on your Google Cloud project
- Your account has Owner or Editor role
- Stitch API is enabled: `gcloud services list | grep stitch`

### Error: "Authentication URL not appearing"

- Check terminal output for the OAuth URL
- Copy the URL manually to your browser if needed
- In WSL/SSH, copy and paste the URL to browser manually

### Error: "API connection fails"

1. Run the doctor command:
   ```bash
   npx @_davideast/stitch-mcp doctor --verbose
   ```

2. Verify:
   - Your project has billing enabled
   - Stitch API is enabled
   - You have ADC configured: `gcloud auth application-default login`

### Claude Desktop doesn't load MCP

1. Check config file syntax (valid JSON)
2. Ensure the path to npx is correct
3. Check Claude Desktop logs for errors

---

## Alternative: Manual MCP Configuration

If the automated setup doesn't work, you can manually configure:

```bash
# Install globally
npm install -g @_davideast/stitch-mcp

# Set environment variables
setx STITCH_PROJECT_ID "astrology-saas-project-id"  # Windows
$env:STITCH_PROJECT_ID="astrology-saas-project-id"  # PowerShell
export STITCH_PROJECT_ID="astrology-saas-project-id"  # Linux/Mac
```

Then use in Claude Desktop config:

```json
{
  "mPCServers": {
    "stitch": {
      "command": "node",
      "args": ["C:\\Users\\YourName\\AppData\\Roaming\\npm\\node_modules\\@_davideast\\stitch-mcp\\dist\\index.js"],
      "env": {
        "STITCH_PROJECT_ID": "astrology-saas-platform",
        "GOOGLE_CLOUD_PROJECT": "astrology-saas-platform"
      }
    }
  }
}
```

---

## Next Steps After Setup

Once Stitch MCP is configured and Claude Desktop is restarted:

1. **Extract design context** from a reference screen
2. **Generate new screens** using the context
3. **Fetch generated code** for implementation
4. **Iterate** on designs with follow-up prompts

---

## Resources

- **Stitch Documentation:** https://stitch.withgoogle.com/docs/mcp/setup
- **GitHub Repository:** https://github.com/davideast/stitch-mcp
- **MCP Servers:** https://mcpservers.org/servers/kargatharaakash/stitch-mcp
- **Stitch Web App:** https://stitch.withgoogle.com/

---

## Quick Test Command

After setup, test the connection:

```bash
# Check if MCP is accessible
npx -y @_davideast/stitch-mcp proxy
```

If running, you should see the proxy server start successfully.
