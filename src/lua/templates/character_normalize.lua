-- character_normalize.lua
-- Params:
--   saveOutput : string
--   targetMs : number
--   autoCrop : boolean

local p = app.params

if not p or not p.saveOutput or not p.targetMs then
  print("ERROR: saveOutput and targetMs are required")
  return
end

local sprite = app.activeSprite

if not sprite then
  print("ERROR: No active sprite")
  return
end

local targetMs = tonumber(p.targetMs) or 100
local autoCrop = (p.autoCrop == "true" or p.autoCrop == true)

if #sprite.tags == 0 then
  print("WARN: No tags found, nothing to normalize")
else
  for _, tag in ipairs(sprite.tags) do
    print("Normalizing tag: " .. tag.name)

    local fromIndex = tag.fromFrame.frameNumber
    local toIndex = tag.toFrame.frameNumber

    for i = fromIndex, toIndex do
      local frame = sprite.frames[i]
      if frame then
        frame.duration = targetMs
      else
        print("WARN: Missing frame at index " .. i)
      end
    end
  end
end

if autoCrop then
  print("Applying AutocropSprite")
  local ok, err = pcall(function()
    app.command.AutocropSprite()
  end)
  if not ok then
    print("ERROR: Autocrop failed: " .. tostring(err))
  end
end

local okSave, errSave = pcall(function()
  sprite:saveCopyAs(p.saveOutput)
end)

if not okSave then
  print("ERROR: Failed to save copy: " .. tostring(errSave))
  sprite:close()
  return
end

print("Saved normalized sprite to: " .. p.saveOutput)

sprite:close()
print("character_normalize script executed successfully")
