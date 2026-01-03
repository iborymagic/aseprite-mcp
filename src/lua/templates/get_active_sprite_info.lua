-- Returns information about the active sprite.
-- Params:
--   none

local sprite = app.activeSprite

if not sprite then
  print("ERROR: No active sprite")
  return
end

print(json.encode({
  width = sprite.width,
  height = sprite.height,
  colorMode = sprite.colorMode == ColorMode.RGB and "rgb"
           or sprite.colorMode == ColorMode.INDEXED and "indexed"
           or "grayscale",
  frameCount = #sprite.frames
}))