-- Exports a single layer as a PNG file.
-- Params:
--   layerName   : string
--   outputDir   : string (must exist or will be created by Node side)

local p = app.params
if not p or not p.layerName or not p.outputDir then
  print("ERROR: layerName and outputDir are required")
  return
end

local sprite = app.activeSprite

if not sprite then
  print("ERROR: No active sprite")
  return
end

local target = nil

for _, layer in ipairs(sprite.layers) do
  if layer.name == p.layerName then
    target = layer
  end
end

if not target then
  print("ERROR: Layer not found: " .. p.layerName)
  return
end

for _, layer in ipairs(sprite.layers) do
  layer.isVisible = false
end

target.isVisible = true

sprite:saveAs(p.outputDir .. "/" .. p.layerName .. ".png")

sprite:close()
print("export_layer_only script executed successfully")
