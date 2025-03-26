extends Area2D

@onready var collision = $CollisionShape2D
@onready var sprite = $Sprite2D

func _ready():
	body_entered.connect(bouncer_entered)

func bouncer_entered(body):
	sprite.play("explode")
	S.bouncer_entered.emit(body, collision.global_position)
