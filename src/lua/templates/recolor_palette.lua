-- Recolor palette based on mapping.
-- Params:
--   inputFile   : string (already opened in Aseprite CLI or app.activeSprite)
--   saveOutput  : string
--   mapping     : string ("RRGGBB:RRGGBB;RRGGBB:RRGGBB;...")

local p = app.params
local mapping = p.mapping

if not mapping or mapping == "" then
  print("ERROR: mapping is required")
  return
end

local spr = app.activeSprite
if not spr then
  print("ERROR: No active sprite")
  return
end

local pal = spr.palettes[1] or spr.palette

-- parse hex string "RRGGBB" -> {r,g,b}
local function parseColor(hex)
  if #hex ~= 6 then return nil end
  local r = tonumber(hex:sub(1, 2), 16)
  local g = tonumber(hex:sub(3, 4), 16)
  local b = tonumber(hex:sub(5, 6), 16)
  return r, g, b
end

-- parse mapping string
local rules = {}
for pair in string.gmatch(mapping, "([^;]+)") do
  local fromHex, toHex = pair:match("([^:]+):([^:]+)")
  if fromHex and toHex then
    table.insert(rules, { from = fromHex, to = toHex })
  end
end

if #rules == 0 then
  print("WARN: No valid mapping rules parsed")
end

-- apply mapping
for i = 0, #pal-1 do
  local c = pal:getColor(i)
  local cr = string.format("%02x%02x%02x", c.red, c.green, c.blue)
  for _, rule in ipairs(rules) do
    if cr == rule.from then
      local r, g, b = parseColor(rule.to)
      if r and g and b then
        pal:setColor(i, Color{ r=r, g=g, b=b, a=c.alpha })
      end
    end
  end
end

spr.palette = pal

local saveOutput = p.saveOutput or p.inputFile
if saveOutput and saveOutput ~= "" then
  app.command.SaveFileAs{
    filename = saveOutput
  }
else
  app.command.SaveFile()
end

print("recolor_palette script executed successfully")
