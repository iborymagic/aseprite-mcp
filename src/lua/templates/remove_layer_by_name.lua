-- Removes a layer by name and saves to a new file (or overwrites).
-- Params (app.params):
--   layerName   : string
--   saveOutput  : string (optional, default = inputFile)

local p = app.params

if not p or not p.layerName or not p.saveOutput then
  print("ERROR: layerName and saveOutput are required")
  return
end

local sprite = app.activeSprite
if not sprite then
  print("ERROR: No active sprite")
  return
end

local found = false

for i, layer in ipairs(sprite.layers) do
  if layer.name == p.layerName then
    app.activeLayer = layer
    app.command.RemoveLayer()
    found = true
    break
  end
end

if not found then
  print("WARN: Layer not found: " .. p.layerName)
end

if p.saveOutput and p.saveOutput ~= "" then
  sprite:saveAs(p.saveOutput)
end

print("remove_layer_by_name script executed successfully")
