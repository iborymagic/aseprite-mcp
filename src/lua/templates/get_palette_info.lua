-- Returns information about the palette of the active sprite.
-- Params:
--   none

local sprite = app.activeSprite

if not sprite then
  print("ERROR: No active sprite")
  return
end

local palette = sprite.palettes[1]

if not palette then
  print("ERROR: No palette found")
  return
end

local colors = {}

for i = 0, palette.size - 1 do
  local c = palette:getColor(i)
  table.insert(colors, {
    r = c.red,
    g = c.green,
    b = c.blue,
    a = c.alpha
  })
end

return {
  size = palette.size,
  colors = colors
}