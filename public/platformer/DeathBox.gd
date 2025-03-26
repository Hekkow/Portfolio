extends Area2D
func _ready():
	body_entered.connect(death_entered)

func death_entered(body):
	S.player.death.emit()
