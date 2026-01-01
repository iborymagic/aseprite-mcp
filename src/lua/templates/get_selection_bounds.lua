-- Returns the bounds of the selection in the active sprite.
-- Params:
--   none

local sprite = app.activeSprite

if not sprite then
  print("ERROR: No active sprite")
  return
end

local sel = sprite.selection

if sel.isEmpty then
  print("ERROR: No selection")
  return
end

local b = sel.bounds
return {
  x = b.x,
  y = b.y,
  width = b.width,
  height = b.height
}