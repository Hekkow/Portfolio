extends Camera2D
@onready var player = $"../CharacterBody2D"
func _ready():
	update_bounds(S.current_level, false, false, Vector2.ZERO) # start level
	S.door_entered.connect(update_bounds)
	S.change_level.connect(update_bounds)
	
func update_bounds(level, _x, _y, _spawnpoint):
	var background: TileMapLayer = get_node("../Level" + level + "/Level")
	#print("../Level" + level + "/Level")
	#print(background)
	var tile_size = Vector2(background.tile_set.tile_size / 2)
	var rect = background.get_used_rect()
	var start = background.to_global(background.map_to_local(rect.position)-tile_size)
	var end = background.to_global(background.map_to_local(rect.end)-tile_size)
	limit_left = start.x
	limit_top = start.y
	limit_right = end.x
	limit_bottom = end.y
func _process(delta):
	global_position = player.global_position
