-- Exports only frames inside a specific tag as individual PNG files.
-- Params:
--   tag            : string
--   outputDir      : string (must exist or will be created by Node side)
--   filenamePrefix : string (optional, default "frame")

local p = app.params

if not p or not p.outputDir then
  print("ERROR: outputDir is required")
  return
end

local sprite = app.activeSprite

if not sprite then
  print("ERROR: No active sprite")
  return
end

local tagName = p.tag
if not tagName or tagName == "" then
  print("ERROR: tag is required")
  return
end

local outputDir = p.outputDir or "."
local prefix = p.filenamePrefix or "frame"

local tag = nil
for _, t in ipairs(sprite.tags) do
  if t.name == tagName then
    tag = t
    break
  end
end

if not tag then
  print("ERROR: Tag not found: " .. tagName)
  return
end

local startFrame = tag.fromFrame.frameNumber
local endFrame = tag.toFrame.frameNumber

for frameNumber = startFrame, endFrame do
  local frameIndex = frameNumber - 1
  
  local newSprite = Sprite(sprite.spec)
  for i, layer in ipairs(sprite.layers) do
    if i > 1 then
      newSprite:newLayer(layer.name)
    end
    
    local cel = layer:cel(frameIndex)
    if cel then
      newSprite:newCel(newSprite.layers[i], newSprite.frames[1], cel.image, cel.position)
    end
  end
  
  local filename = string.format("%s/%s-%04d.png", outputDir, prefix, frameNumber)
  newSprite:saveAs(filename)
  newSprite:close()
end

sprite:close()
print("export_tag_frames script executed successfully")