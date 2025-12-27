-- Auto-crops a sprite and saves the result.
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

app.command.AutocropSprite()

sprite:saveAs(p.saveOutput)

sprite:close()
print("auto_crop_transparent script executed successfully")
