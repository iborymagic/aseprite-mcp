-- Merges all visible layers into a single layer and saves the result.
-- Params:
--   saveOutput  : string

local p = app.params

if not p or not p.saveOutput then
  print("ERROR: saveOutput is required")
  return
end

local sprite = app.activeSprite

if not sprite then
  print("ERROR: No active sprite")
  return
end

app.command.FlattenLayers()

sprite:saveAs(p.saveOutput)

sprite:close()
print("merge_visible_layers script executed successfully")
