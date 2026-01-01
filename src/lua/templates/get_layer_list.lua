-- Returns a list of all layers in the active sprite.
-- Params:
--   none

local sprite = app.activeSprite

if not sprite then
  print("ERROR: No active sprite")
  return
end

local layers = {}

local function listLayers(layersList)
  for _, layer in ipairs(layersList) do
    table.insert(layers, {
      name = layer.name,
      index = layer.stackIndex,
      isGroup = layer.isGroup,
      visible = layer.isVisible,
      locked = layer.isLocked
    })

    if layer.isGroup then
      listLayers(layer.layers)
    end
  end
end

listLayers(sprite.layers)
return layers