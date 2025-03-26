extends Area2D


func _ready():
	body_entered.connect(spring_entered)

func spring_entered(body):
	S.spring_entered.emit(body)
