extends Node2D  # Use Node2D since it's a Sprite, not CharacterBody2D

@export var speed: float = 200.0  # Adjust speed as needed

func _process(delta):
	var direction = Vector2.ZERO
	
	# Check input
	if Input.is_action_pressed("d"):
		direction.x += 1
	if Input.is_action_pressed("a"):
		direction.x -= 1
	if Input.is_action_pressed("s"):
		direction.y += 1
	if Input.is_action_pressed("w"):
		direction.y -= 1
	
	# Normalize direction to prevent faster diagonal movement
	if direction.length() > 0:
		direction = direction.normalized()
	
	# Move sprite
	position += direction * speed * delta
