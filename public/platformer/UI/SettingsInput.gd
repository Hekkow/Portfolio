extends HBoxContainer
@onready var slider = $HSlider
@onready var label = $Label
@onready var num = $SpinBox
signal value_updated(new_value)
func _enter_tree():
	value_updated.connect(update_value)
func _ready():
	
	S.ui.input_loaded.emit(label.text, self)
	slider.value_changed.connect(slider_changed)
	num.value_changed.connect(num_changed)
	
	
func slider_changed(new_value):
	S.ui.slider_changed.emit(label.text, new_value)
	num.value = new_value
func num_changed(new_value):
	S.ui.slider_changed.emit(label.text, new_value)
	slider.value = new_value
func update_value(new_value):
	slider.value = new_value
	num.value = new_value
