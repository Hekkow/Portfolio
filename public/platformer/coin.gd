extends Area2D
@onready var sprite = $Sprite2D
func _ready():
	body_entered.connect(coin_entered)

func coin_entered(body):
	sprite.play("explode")
	await sprite.animation_finished
	queue_free()
