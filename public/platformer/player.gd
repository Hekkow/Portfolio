extends CharacterBody2D
class_name Player

@onready var sprite = $Sprite2D
var speed = 300
var jump_speed = 800
var dash_speed = 700
var dash_time = 0.15
var dash_slowdown_time = 0.04
var momentum = 2000
var gravity_up = 2500
var gravity_down = 3000
var gravity_wall = 500
var gravity_dash_slowdown = 500
var wall_jump_speed_horizontal = 600
var wall_jump_speed_vertical = 600
var dash_slowdown_weight = 0.5


var can_jump = true
var can_dash = true
var can_wall_jump = false
var dash_timer
var coyote_timer
var coyote_time = 0.07
var dashing = false
var dash_t = 0
var max_gravity_velocity = 800
var max_gravity_wall_velocity = 600
var max_gravity_dash_slowdown = 500

var spring_force = 1000
var bounce_force = 1500
var buffer = []
var number_buffer_frames = 7
var respawn_time = 0.3
var respawn_timer
var death_timer
var death_time = 0.6
var previous_is_on_wall = false
var previous_is_on_floor = true
var previous_is_on_ceiling = false
var dash_direction
var dash_slowing = false
var dash_slowdown_timer
var level_transition_time = 0.3
var wall_detection_distance_forwards = 10
var wall_detection_distance_backwards = 20
var direction
var bouncing = false
var bounce_direction

@onready var smear_sprite = $SmearSprite
@onready var death_sprite = $DeathSprite
@onready var default_texture = load("res://player.png")
@onready var inverse_texture = load("res://player-inverse.png")

signal resetted
signal death
signal reposition

func _enter_tree():
	S.player = self
func _ready():
	#Engine.time_scale = 0.1
	
	buffer.resize(number_buffer_frames)
	buffer.fill(null)
	dash_timer = make_timer(dash_time, stop_dash)
	dash_slowdown_timer = make_timer(dash_slowdown_time, stop_dash_slowdown)
	coyote_timer = make_timer(coyote_time, stop_coyote)
	#respawn_timer = make_timer(respawn_time, respawn)
	#death_timer = make_timer(death_time, death_animation)
	S.door_entered.connect(level_transition)
	S.spring_entered.connect(spring)
	S.bouncer_entered.connect(bounce)
	S.refill_entered.connect(refill)
	death.connect(died)
	resetted.connect(reset)
	reposition.connect(reset_position)
	sprite.play("default")
func reset():
	died()
func make_timer(wait_time, f):
	var timer = Timer.new()
	timer.wait_time = wait_time
	timer.one_shot = true
	timer.timeout.connect(f)
	add_child(timer)
	return timer

func level_transition(_level, x, y, new_position):
	var target_position
	if y:
		target_position = Vector2(global_position.x, new_position.y)
	else:
		target_position = Vector2(new_position.x, global_position.y)
	var transition_tween = get_tree().create_tween()
	set_physics_process(false)
	refill()
	buffer.fill(null)
	transition_tween.tween_property(self, "global_position", target_position, level_transition_time)
	transition_tween.finished.connect(set_physics_process.bind(true))
func refill():
	can_dash = true
func spring(body):
	if body != self:
		return
	can_dash = true
	velocity = Vector2(0, -spring_force)
	stop_dash()
func bounce(body, bouncer_position):
	velocity = (global_position - bouncer_position).normalized() * bounce_force
	can_dash = true
	dashing = false
	
func _physics_process(delta):
	direction = get_input()
	
	if not is_on_floor():
		if not dashing:
			apply_gravity(delta)
		if can_jump and coyote_timer.is_stopped():
			coyote_timer.start()
	else:
		coyote_timer.stop()
		can_jump = true
		if not dashing:
			can_dash = true
		if not previous_is_on_floor:
			squash(1.5, 0.8)
	if is_on_wall_only() and not previous_is_on_wall and velocity.y > 0:
		velocity.y = 0
	
	if dashing:
		velocity = dash_direction
	elif dash_slowing:
		dash_t += delta * dash_slowdown_weight
		velocity.x = lerp(velocity.x, direction.x * speed, dash_t)
	elif bouncing:
		velocity = bounce_direction
	else:
		move(direction, delta)
		check_movement("dash", start_dash, start_dash.bind(direction))
	check_movement("jump", jump, jump.bind(direction, delta))
	if is_on_wall_only() and not previous_is_on_wall:
		squash(0.9, 1.2)
	if is_on_ceiling_only() and not previous_is_on_ceiling:
		squash(1.2, 0.9)
	previous_is_on_ceiling = is_on_ceiling_only()
	previous_is_on_wall = is_on_wall_only()
	previous_is_on_floor = is_on_floor()
	move_and_slide()
func died():
	buffer.fill(null)
	set_physics_process(false)
	sprite.play("death")
	await sprite.animation_finished
	reset_position(S.spawnpoint)
	await get_tree().create_timer(0.5).timeout
	sprite.play("respawn")
	await sprite.animation_finished
	set_physics_process(true)
	velocity = Vector2.ZERO
	
	#sprite.visible = false
	#death_timer.start()
	#death_sprite.visible = true
#func respawn_transition():
	
	
#func respawn():
	
func reset_position(pos):
	global_position = pos

func death_animation():
	death_sprite.visible = false
	S.died.emit(self)
	respawn_timer.start()


	
func check_movement(s, f, p):
	if Input.is_action_just_pressed(s):
		if p.call():
			remove_from_buffer(f)
		else:
			add_to_buffer(f)
	elif first_in_buffer(f):
		if p.call():
			remove_from_buffer(f)
	else:
		add_to_buffer(null)
func first_in_buffer(f):
	for i in buffer:
		if i:
			return i.get_method() == f.get_method()
	return false
func move(direction, delta):
	velocity.x = get_move_result(direction, delta)
func get_move_result(direction, delta):
	return move_toward(velocity.x, direction.x * speed, delta * momentum)
func would_be_on_wall(direction, delta):
	var d = direction
	#if d.x == 0:
		#d.x = 0
	var forwards = test_move(transform, Vector2(get_move_result(d, delta) * delta + (d.x * wall_detection_distance_forwards), 0))
	var backwards = test_move(transform, Vector2(get_move_result(-d, delta) * delta + (-d.x * wall_detection_distance_backwards), 0))
	return forwards or backwards
func jump(direction, delta):
	var jumped = false
	if is_on_wall_only() or (direction.x != 0 and coyote_timer.is_stopped() and not is_on_floor() and would_be_on_wall(direction, delta)):
		velocity.y = -wall_jump_speed_vertical
		velocity.x = get_wall_normal().x * wall_jump_speed_horizontal
		jumped = true
	elif can_jump:
		velocity.y = -jump_speed
		can_jump = false
		jumped = true
	if jumped and (dashing or dash_slowing):
		cancel_dash()
		if is_on_floor():
			can_dash = true
	return jumped
func stop_coyote():
	can_jump = false
		
func start_dash(direction):
	if can_dash:
		dashing = true
		can_dash = false
		bouncing = false
		dash_timer.start()
		dash_direction = direction.normalized() * dash_speed
		squash(2, 0.7)
		invert()
		smear()
		return true
	return false
func squash(x, y):
	var tween = get_tree().create_tween()
	tween.tween_property(sprite, "scale", Vector2(x, y), 0.05)
	tween.tween_property(sprite, "scale", Vector2(1, 1), 0.05)
func invert():
	sprite.play("inverse")
	#sprite.texture = inverse_texture
	#await get_tree().create_timer(0.2).timeout
	#sprite.texture = default_texture
func smear():
	smear_sprite.modulate = Color(1, 1, 1)
	smear_sprite.global_position = global_position
	var tween = get_tree().create_tween()
	tween.set_ease(Tween.EASE_IN)
	tween.tween_property(smear_sprite, "modulate:a", 0, 0.2)
func stop_dash():
	dashing = false
	dash_slowing = true
	dash_t = 0
	dash_slowdown_timer.start()
func cancel_dash():
	dashing = false
	dash_slowing = false
	dash_t = 0
func stop_dash_slowdown():
	dash_slowing = false
func apply_gravity(delta):
	var wall = is_on_wall()
	var g = gravity_up
	if velocity.y > 0:
		g = gravity_down
	if wall and velocity.y >= 0:
		g = gravity_wall
	if dash_slowing:
		g = gravity_dash_slowdown
	var max_g = max_gravity_velocity
	if wall:
		max_g = max_gravity_wall_velocity
	if dash_slowing:
		max_g = max_gravity_dash_slowdown
	
	velocity.y += g * delta
	
	if velocity.y > max_g:
		velocity.y = max_g


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
	#direction = direction.normalized()
	return direction
func add_to_buffer(f):
	var last_f = buffer.pop_front()
	buffer.append(f)
	return last_f
func remove_from_buffer(f):
	for i in len(buffer):
		if buffer[i] and buffer[i].get_method() == f.get_method():
			buffer[i] = null
	add_to_buffer(null)
	
