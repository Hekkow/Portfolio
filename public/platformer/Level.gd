extends Node2D


# Called when the node enters the scene tree for the first time.
var level
@onready var spawn_point = $SpawnPoint
func _ready():
	#S.died.connect(respawn)
	level = name.substr(5)
	
#func respawn(player):
	#
	#if S.current_level == level:
		#S.player.reposition.emit(spawn_point.global_position)
