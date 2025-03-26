extends Node
signal slider_changed(setting, value)
signal input_loaded(setting, setting_input)
signal open_settings
@onready var settings_menu = $Control/Settings
@onready var back_to_beginning_button = $Control/Settings/ScrollContainer/VBoxContainer/Button
@onready var reset_button = $Control/Settings/ScrollContainer/VBoxContainer/Button2
@onready var speedometer = $Control/Label
func _enter_tree():
	S.ui = self
	slider_changed.connect(setting_changed)
	input_loaded.connect(update_values)
	open_settings.connect(toggle_settings)
func _physics_process(delta):
	speedometer.text = str(S.player.velocity.length())
func _ready():
	back_to_beginning_button.pressed.connect(go_back_to_beginning)
	reset_button.pressed.connect(reset)
func toggle_settings():
	settings_menu.visible = !settings_menu.visible
func reset():
	S.player.resetted.emit()
func setting_changed(setting, value):
	if setting == "Speed":
		S.player.speed = value
	elif setting == "Jump Speed":
		S.player.jump_speed = value
	elif setting == "Dash Speed":
		S.player.dash_speed = value
	elif setting == "Dash Time":
		S.player.dash_time = value
		S.player.dash_timer.wait_time = value
	elif setting == "Momentum":
		S.player.momentum = value
	elif setting == "Gravity Up":
		S.player.gravity_up = value
	elif setting == "Gravity Down":
		S.player.gravity_down = value
	elif setting == "Gravity Wall":
		S.player.gravity_wall = value
	elif setting == "Wall Jump Horizontal":
		S.player.wall_jump_speed_horizontal = value
	elif setting == "Wall Jump Vertical":
		S.player.wall_jump_speed_vertical = value
	elif setting == "Dash Weight":
		S.player.dash_weight = value
	
	
		
func update_values(setting, setting_input):
	if setting == "Speed":
		setting_input.value_updated.emit(S.player.speed)
	elif setting == "Jump Speed":
		setting_input.value_updated.emit(S.player.jump_speed)
	elif setting == "Dash Speed":
		setting_input.value_updated.emit(S.player.dash_speed)
	elif setting == "Dash Time":
		setting_input.value_updated.emit(S.player.dash_time)
	elif setting == "Momentum":
		setting_input.value_updated.emit(S.player.momentum)
	elif setting == "Gravity Up":
		setting_input.value_updated.emit(S.player.gravity_up)
	elif setting == "Gravity Down":
		setting_input.value_updated.emit(S.player.gravity_down)
	elif setting == "Gravity Wall":
		setting_input.value_updated.emit(S.player.gravity_wall)
	elif setting == "Wall Jump Horizontal":
		setting_input.value_updated.emit(S.player.wall_jump_speed_horizontal)
	elif setting == "Wall Jump Vertical":
		setting_input.value_updated.emit(S.player.wall_jump_speed_vertical)
	elif setting == "Dash Weight":
		setting_input.value_updated.emit(S.player.dash_weight)
func go_back_to_beginning():
	S.change_level.emit('1', Vector2.ZERO)
