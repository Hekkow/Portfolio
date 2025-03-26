extends Label
var c = 0
func _process(delta):
	if c == 0:
		text = "FPS: " + str(Engine.get_frames_per_second())
	c += 1
	if c == 5:
		c = 0
