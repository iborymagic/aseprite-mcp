-- Returns true if the tag exists in the active sprite.
-- Params:
--   tagName : string

local p = app.params
local sprite = app.activeSprite

if not sprite then
  print("ERROR: No active sprite")
  return
end

if not p or not p.tagName then
  print("ERROR: tagName is required")
  return
end

for _, tag in ipairs(sprite.tags) do
  if tag.name == p.tagName then
    print(true)
    return
  end
end

print(false)