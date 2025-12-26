-- Removes a layer by name and saves to a new file (or overwrites).
-- Params (app.params):
--   inputFile   : string (already opened in Aseprite CLI or app.activeSprite)
--   layerName   : string
--   saveOutput  : string (optional, default = inputFile)

local p = app.params

local layerName = p.layerName
if not layerName or layerName == "" then
  print("ERROR: layerName is required")
  return
end

local spr = app.activeSprite
if not spr then
  print("ERROR: No active sprite")
  return
end

local saveOutput = p.saveOutput or p.inputFile

local found = false

for i, layer in ipairs(spr.layers) do
  if layer.name == layerName then
    spr.layers[i]:delete()
    found = true
    break
  end
end

if not found then
  print("WARN: Layer not found: " .. layerName)
end

if saveOutput and saveOutput ~= "" then
  app.command.SaveFileAs{
    filename = saveOutput
  }
else
  app.command.SaveFile()
end

print("remove_layer_by_name script executed successfully")
