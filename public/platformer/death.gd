extends Area2D


func _ready():
	body_entered.connect(bouncer_entered)

func bouncer_entered(body):
	S.player.death.emit()
