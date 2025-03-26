extends Sprite2D

var initial_position

var default_position
var smearing = false

func _ready():
	set_physics_process(false)
	default_position = position

func _physics_process(delta):
	global_position = initial_position
