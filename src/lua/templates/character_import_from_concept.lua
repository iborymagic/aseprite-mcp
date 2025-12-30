-- character_import_from_concept.lua
-- Params:
--   conceptImage : string
--   outputFile : string
--   spriteSize : number
--   animationSpec : string

local p = app.params

if not p or not p.conceptImage or not p.outputFile then
  print("ERROR: conceptImage and outputFile are required")
  return
end

local sprite = app.open(p.conceptImage)

if not sprite then
  print("ERROR: Failed to open concept image: " .. tostring(p.conceptImage))
  return
end

print("Opened concept sprite: " .. p.conceptImage)

local spriteSize = tonumber(p.spriteSize) or sprite.width

local spec = p.animationSpec or "Idle:4"
local animations = {}
local totalFrames = 0

for part in string.gmatch(spec, "([^,]+)") do
  local name, count = string.match(part, "([^:]+):(%d+)")
  if name and count then
    local frames = tonumber(count)
    if frames > 0 then
      table.insert(animations, { name = name, frames = frames })
      totalFrames = totalFrames + frames
    end
  end
end

if #animations == 0 then
  print("WARN: Invalid animationSpec, fallback to Idle:1")
  animations = { { name = "Idle", frames = 1 } }
  totalFrames = 1
end

while #sprite.frames < totalFrames do
  sprite:newFrame()
end

local currentFrameIndex = 1
for _, anim in ipairs(animations) do
  local fromIndex = currentFrameIndex
  local toIndex = currentFrameIndex + anim.frames - 1
  if toIndex > #sprite.frames then
    toIndex = #sprite.frames
  end

  local fromFrame = sprite.frames[fromIndex]
  local toFrame = sprite.frames[toIndex]

  if fromFrame and toFrame then
    local tag = sprite:newTag(fromFrame, toFrame)
    tag.name = anim.name
    print(
      string.format(
        "Created tag %s (%d -> %d)",
        anim.name,
        fromIndex,
        toIndex
      )
    )
  else
    print("WARN: Failed to create tag for " .. anim.name)
  end

  currentFrameIndex = toIndex + 1
  if currentFrameIndex > #sprite.frames then
    break
  end
end

local okSave, errSave = pcall(function()
  sprite:saveAs(p.outputFile)
end)

if not okSave then
  print("ERROR: Failed to save aseprite file: " .. tostring(errSave))
  sprite:close()
  return
end

print("Saved aseprite file to: " .. p.outputFile)

sprite:close()
print("character_import_from_concept script executed successfully")
