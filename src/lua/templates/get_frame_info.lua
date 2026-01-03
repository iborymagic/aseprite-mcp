-- Returns information about the current frame.
-- Params:
--   none

local sprite = app.activeSprite

if not sprite then
  print("ERROR: No active sprite")
  return
end

local result = {
  currentFrame = app.activeFrame.frameNumber,
  frames = {}
}

for i, frame in ipairs(sprite.frames) do
  table.insert(result.frames, {
    index = i,
    duration = frame.duration
  })
end

print(json.encode(result))