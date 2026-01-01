-- Returns a list of all tags in the active sprite.
-- Params:
--   none

local sprite = app.activeSprite

if not sprite then
  print("ERROR: No active sprite")
  return
end

local tags = {}

for _, tag in ipairs(sprite.tags) do
  table.insert(tags, {
    name = tag.name,
    from = tag.fromFrame.frameNumber,
    to = tag.toFrame.frameNumber,
    direction = tag.aniDir == AniDir.FORWARD and "forward"
             or tag.aniDir == AniDir.REVERSE and "reverse"
             or "pingpong"
  })
end

return tags