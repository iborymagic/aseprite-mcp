-- Auto-crops a sprite and saves the result.
-- Params:
--   inputFile   : string (already opened in Aseprite CLI or app.activeSprite)
--   saveOutput  : string

local p = app.params
local sprite = app.open(p.inputFile)

if not sprite then
  print("ERROR: Failed to open sprite")
  return
end

app.command.AutocropSprite()

sprite:saveAs(p.saveOutput)

sprite:close()
print("auto_crop_transparent script executed successfully")
