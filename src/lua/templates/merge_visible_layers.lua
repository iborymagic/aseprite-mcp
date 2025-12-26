-- Merges all visible layers into a single layer and saves the result.
-- Params:
--   inputFile   : string (already opened in Aseprite CLI or app.activeSprite)
--   saveOutput  : string

local p = app.params
local sprite = app.open(p.inputFile)

if not sprite then
  print("ERROR: Failed to open sprite")
  return
end

app.command.MergeVisibleLayers()

sprite:saveAs(p.saveOutput)

sprite:close()
print("merge_visible_layers script executed successfully")
