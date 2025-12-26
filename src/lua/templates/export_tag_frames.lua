-- Exports only frames inside a specific tag as individual PNG files.
-- Params:
--   inputFile      : string (already opened in Aseprite CLI or app.activeSprite)
--   tag            : string
--   outputDir      : string (must exist or will be created by Node side)
--   filenamePrefix : string (optional, default "frame")

local p = app.params

if not p.inputFile then
  print("ERROR: inputFile is required")
  return
end

local sprite = app.open(p.inputFile)

if not sprite then
  print("ERROR: Failed to open sprite")
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
  sprite.frame = frameNumber

  local filename = string.format("%s/%s-%04d.png", outputDir, prefix, frameNumber)
  app.command.ExportSprite{
    ui = false,
    filename = filename
  }
end

sprite:close()
print("export_tag_frames script executed successfully")