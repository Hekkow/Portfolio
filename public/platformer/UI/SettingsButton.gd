extends Button

func _ready():
	pressed.connect(open_settings)
func open_settings():
	S.ui.open_settings.emit()
