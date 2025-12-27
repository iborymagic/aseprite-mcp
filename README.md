# Aseprite-MCP
This server automates Aseprite workflows using the Model Context Protocol (MCP).  
It enables AI, chat assistants, and automation pipelines to directly execute Aseprite tasks such as sprite sheet export, frame extraction, and metadata output.

*Lua-based automation and high-level sprite/tile generation features are not included yet.  
*Aseprite must be installed in order to use this MCP server.  

## Features Overview
### V1 - Export/Utility
Supports fundamental Aseprite export workflow:
- `aseprite_check_environment`: Checks Aseprite installation status, executable path, and version
- `aseprite_export_sheet`: Exports a sprite sheet as PNG + JSON
- `aseprite_export_frames`: Exports each animation frame as an individual PNG file
- `aseprite_export_metadata`: Exports Aseprite metadata in JSON format

### V2 - Lua Automation
Adds deeper control using Aseprite Lua scripting, enabling safe AI-driven editing operations such as:
- `aseprite_list_lua_templates`: Lists available Lua templates
- `aseprite_run_lua_template`: Runs a predefined safe Lua automation(templates)
  - `remove_layer_by_name`: Removing specific layers
  - `export_tag_frames`: Palette recoloring
  - `recolor_palette`: Normalizing animation speed
  - `normalize_animation_speed`: Exporting only specific animation tags
  - `auto_crop_transparent`: Removing empty transparent borders around the sprite
  - `export_layer_only`: Exporting only a specific layer as a flattened PNG image
  - `export_tag_frames`: Exporting all frames within a specific animation tag as individual PNG files
  - `merge_visible_layers`: Merging all currently visible layers into a single layer
- `aseprite_run_lua`: Executes a raw Lua script (advanced / unsafe)

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
