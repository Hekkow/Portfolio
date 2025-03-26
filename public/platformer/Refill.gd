extends Area2D
@onready var sprite = $Sprite2D
var can_refill = true
var refill_time = 2
func _ready():
	body_entered.connect(refill_entered)

func refill_entered(_body):
	if not can_refill:
		return
		
	can_refill = false
	sprite.play("entered")
	S.refill_entered.emit()
	await get_tree().create_timer(refill_time).timeout
	can_refill = true
	sprite.play("respawn")
