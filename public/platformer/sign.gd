extends Area2D

@export var text: String
@onready var popup = $NinePatchRect
@onready var popup_label = $NinePatchRect/Label
func _ready():
	body_entered.connect(sign_entered)
	body_exited.connect(sign_exited)
	popup_label.text = text

func sign_entered(_body):
	popup.visible = true
	
func sign_exited(_body):
	popup.visible = false
