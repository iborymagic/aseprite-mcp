-- Normalize all frame durations to a single targetDuration (seconds).
-- Params:
--   inputFile      : string (already opened in Aseprite CLI or app.activeSprite)
--   saveOutput     : string
--   targetDuration : string/number (seconds)

local p = app.params

local targetStr = p.targetDuration
if not targetStr then
  print("ERROR: targetDuration is required")
  return
end

local target = tonumber(targetStr)
if not target or target <= 0 then
  print("ERROR: targetDuration must be positive number, got: " .. tostring(targetStr))
  return
end

local spr = app.activeSprite
if not spr then
  print("ERROR: No active sprite")
  return
end

for i, frame in ipairs(spr.frames) do
  frame.duration = target
end

local saveOutput = p.saveOutput or p.inputFile
if saveOutput and saveOutput ~= "" then
  app.command.SaveFileAs{
    filename = saveOutput
  }
else
  app.command.SaveFile()
end

print("normalize_animation_speed script executed successfully")
