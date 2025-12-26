# Aseprite-MCP
This server automates Aseprite workflows using the Model Context Protocol (MCP).  
It enables AI, chat assistants, and automation pipelines to directly execute Aseprite tasks such as sprite sheet export, frame extraction, and metadata output.  
*Lua-based automation and high-level sprite/tile generation features are not included yet.  
*Aseprite must be installed in order to use this MCP server.  

## How to use
1) Run directly with npx
```bash
npx -y aseprite-mcp
```

2) Local Build & Run (for development)
```bash
npm install
npm run build
npx aseprite-mcp
```

### Using with ChatGPT
Add the following to your mcp.json
```json
{
  "servers": {
    "aseprite-mcp": {
      "command": "npx",
      "args": ["-y", "aseprite-mcp"]
    }
  }
}
```

### Using with Claude
Add the following to your servers.json
```json
{
  "aseprite-mcp": {
    "command": "npx",
    "args": ["-y", "aseprite-mcp"]
  }
}
```

### Using with Cursor
Add the following to your .cursor.json
```json
{
  "mcpServers": {
    "aseprite-mcp": {
      "command": "npx",
      "args": ["-y", "aseprite-mcp"]
    }
  }
}
```

## Tools
- `aseprite_check_environment`: Checks Aseprite installation status, executable path, and version
- `aseprite_export_sheet`: Exports a sprite sheet as PNG + JSON
- `aseprite_export_frames`: Exports each animation frame as an individual PNG file
- `aseprite_export_metadata`: Exports Aseprite metadata in JSON format
