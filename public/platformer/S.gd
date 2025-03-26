extends Node
@onready var game_node = $"/root/Game"
var current_level = '1'
signal door_entered(door, direction, position)
signal door_left(door)
signal died(player)
signal spring_entered(body)
signal bouncer_entered(body, bouncer)
signal refill_entered(body)
signal change_level(level)

var all_levels = []
var level_nodes = {}
var load_max_distance = 2
var ui
var player: Player
var spawnpoint

func _ready():
	door_entered.connect(level_changed)
	change_level.connect(level_changed_and_resposition)
	
	for i in game_node.get_children():
		if is_level(i):
			all_levels.append(i.name.substr(5))
	unload()
	await get_tree().process_frame
	change_level.emit(current_level, false, false, Vector2.ZERO)
func level_changed(level, x, y, _spawnpoint):
	current_level = level
	unload()
	spawnpoint = get_node("/root/Game/Level" + current_level + "/SpawnPoint").global_position
func level_changed_and_resposition(level, x, y, _spawnpoint):
	level_changed(level, x, y, _spawnpoint)
	player.reposition.emit(spawnpoint)
func unload():
	var l = get_level_number(current_level)
	for i in game_node.get_children():
		if is_level(i):
			var level_num = i.name.substr(5)
			if abs(get_level_number(level_num) - l) > load_max_distance:
				level_nodes[level_num] = i
				game_node.remove_child(i)
				#print(level_nodes)
	var to_remove = []
	for i in level_nodes:
		if abs(get_level_number(i) - l) <= load_max_distance:
			game_node.add_child.call_deferred(level_nodes[i])
			to_remove.append(i)
	for i in to_remove:
		level_nodes.erase(i)
func get_level_number(s):
	return int(s.split("-")[0])
func is_level(n):
	return n.name.substr(0, 5) == "Level"
