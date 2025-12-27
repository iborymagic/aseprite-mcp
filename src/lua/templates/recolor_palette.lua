-- Recolors the palette based on a mapping of from->to colors.
-- Params:
--   saveOutput  : string
--   mapping     : string ("RRGGBB:RRGGBB;RRGGBB:RRGGBB;...")

local p = app.params

if not p or not p.saveOutput or not p.mapping then
  print("ERROR: saveOutput and mapping are required")
  return
end

local sprite = app.activeSprite
if not sprite then
  print("ERROR: No active sprite")
  return
end

local function parseColor(hex)
  hex = hex:lower()
  if #hex ~= 6 then return nil end
  local r = tonumber(hex:sub(1, 2), 16)
  local g = tonumber(hex:sub(3, 4), 16)
  local b = tonumber(hex:sub(5, 6), 16)
  return r,g,b
end

local rules = {}
for pair in string.gmatch(p.mapping, "([^;]+)") do
  local fromHex, toHex = pair:match("([^:]+):([^:]+)")
  if fromHex and toHex then
    table.insert(rules, {
      from = fromHex:lower(),
      to   = toHex:lower()
    })
  end
end

if #rules == 0 then
  print("ERROR: No valid mapping rules found")
  return
end


local function recolorIndexed()
  print("Indexed mode detected: Using palette recolor")

  local basePal = sprite.palettes[1] or sprite.palette
  if not basePal then
    print("ERROR: No palette found")
    return false
  end

  for i = 0, #basePal - 1 do
    local c = basePal:getColor(i)
    local cr = string.format("%02x%02x%02x", c.red, c.green, c.blue)

    for _, rule in ipairs(rules) do
      if cr == rule.from then
        local r,g,b = parseColor(rule.to)
        if r and g and b then
          basePal:setColor(i,
            Color{ r=r, g=g, b=b, a=c.alpha }
          )
        end
      end
    end
  end

  return true
end


local function recolorRGBA()
  print("RGBA mode detected: Using pixel replacement")

  app.transaction(function()
    for _, cel in ipairs(sprite.cels) do
      local img = cel.image
      local w = img.width
      local h = img.height

      for y = 0, h - 1 do
        for x = 0, w - 1 do
          local px = img:getPixel(x, y)

          local r = app.pixelColor.rgbaR(px)
          local g = app.pixelColor.rgbaG(px)
          local b = app.pixelColor.rgbaB(px)
          local a = app.pixelColor.rgbaA(px)

          local key = string.format("%02x%02x%02x", r,g,b)

          for _, rule in ipairs(rules) do
            if key == rule.from then
              local nr,ng,nb = parseColor(rule.to)
              if nr and ng and nb then
                img:putPixel(x, y,
                  app.pixelColor.rgba(nr,ng,nb,a))
              end
            end
          end
        end
      end
    end
  end)

  return true
end


local ok = false

if sprite.colorMode == ColorMode.INDEXED then
  ok = recolorIndexed()
else
  print("WARNING: Sprite is NOT Indexed Color.")
  print("Fallback to RGBA pixel replacement recoloring.")
  ok = recolorRGBA()
end

if not ok then
  print("ERROR: recoloring failed")
  return
end

if p.saveOutput and p.saveOutput ~= "" then
  sprite:saveAs(p.saveOutput)
end

print("recolor_palette script executed successfully")
