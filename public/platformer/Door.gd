extends Area2D

@export var level: String
@export var x: bool = true
@export var y: bool = false
@onready var spawnpoint = $SpawnPoint
var entered = false
func _ready():
	body_entered.connect(door_entered)

func door_entered(body):
	if level == S.current_level:
		return
	entered = true
	S.door_entered.emit(level, x, y, spawnpoint.global_position)
