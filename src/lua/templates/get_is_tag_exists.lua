-- Returns true if the tag exists in the active sprite.
-- Params:
--   tagName : string

local p = app.params
local sprite = app.activeSprite

if not sprite then
  print("ERROR: No active sprite")
  return false
end

if not p or not p.tagName then
  print("ERROR: tagName is required")
  return false
end

for _, tag in ipairs(sprite.tags) do
  if tag.name == target then
    return true
  end
end

return false