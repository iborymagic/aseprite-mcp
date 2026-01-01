-- Returns true if the layer exists in the active sprite.
-- Params:
--   layerName : string

local p = app.params
local sprite = app.activeSprite

if not sprite then
  print("ERROR: No active sprite")
  return false
end

if not p or not p.layerName then
  print("ERROR: layerName is required")
  return false
end

local function getIsLayerExists(layers)
  for _, layer in ipairs(layers) do
    if layer.name == p.layerName then
      return true
    end
    if layer.isGroup and getIsLayerExists(layer.layers) then
      return true
    end
  end
  return false
end

return getIsLayerExists(sprite.layers)