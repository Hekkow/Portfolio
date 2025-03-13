extends CharacterBody2D

var speed = 300.0
var jump_speed = 1000.0
var dash_speed = 1200
var dash_time = 0.2
var can_dash = true
var timer
var dashing = false
var dash_t = 0
var dash_weight = 1
func _ready():
	timer = Timer.new()
	timer.wait_time = dash_time
	timer.one_shot = true
	timer.timeout.connect(stop_dash)
	add_child(timer)

func start_dash(direction):
	dash_t = 0
	dashing = true
	can_dash = false
	timer.start()
	velocity = direction * dash_speed
func stop_dash():
	dashing = false
func _physics_process(delta):
	var direction = get_input()
	if dashing:
		dash_t += delta * dash_weight
		velocity = velocity.lerp(Vector2.ZERO, dash_t)
	else:
		if not is_on_floor():
			velocity += get_gravity() * delta
		else:
			can_dash = true
		if Input.is_action_just_pressed("jump") and is_on_floor():
			velocity.y = -jump_speed
		if direction:
			velocity.x = direction.x * speed
		else:
			velocity.x = move_toward(velocity.x, 0, speed)
		if Input.is_action_just_pressed("dash") and can_dash:
			start_dash(direction)
	move_and_slide()

func get_input():
	var direction = Vector2.ZERO
	if Input.is_action_pressed("up"):
		direction.y -= 1
	if Input.is_action_pressed("down"):
		direction.y += 1
	if Input.is_action_pressed("left"):
		direction.x -= 1
	if Input.is_action_pressed("right"):
		direction.x += 1
	direction = direction.normalized()
	return direction
	
