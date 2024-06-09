let canvasWidth = 300
let canvasHeight = 300
let canvas = $('canvas')[0]
let ctx = canvas.getContext("2d")
$('#profilePicCreatorBackground').css('display', 'flex') // remove
let moving = false
function drawShape() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.save()
    for (let [id, shape] of shapes.entries()) {
        console.log(shape)
        ctx.fillStyle = shape.color
        ctx.translate(shape.rotationTranslationX, shape.rotationTranslationY)
        ctx.rotate(shape.rotation)
        ctx.translate(-shape.rotationTranslationX, -shape.rotationTranslationY)
        ctx.fillRect(shape.x, shape.y, shape.w, shape.h)
    }
    ctx.restore()
}
class Shape {
    constructor(shapeID, x = canvasWidth/2-50/2, y = canvasHeight/2-50/2, w = 50, h = 50, rotation = 0, color = "#FF0000") {
        this.shapeID = shapeID
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.rotation = rotation
        this.updateRotationTranslationX()
        this.updateRotationTranslationY()
        this.color = color
    }
    addRotation(rotation) {
        this.rotation += rad(parseFloat(rotation))
    }
    addX(x) {
        this.x += parseFloat(x)
        this.updateRotationTranslationX()
    }
    addY(y) {
        this.y += parseFloat(y)
        this.updateRotationTranslationY()
    }
    addW(w) {
        let oldCenterX = this.rotationTranslationX
        this.w += parseFloat(w)
        this.x = oldCenterX - this.w / 2
        this.updateRotationTranslationX()
    }

    addH(h) {
        let oldCenterY = this.rotationTranslationY
        this.h += parseFloat(h)
        this.y = oldCenterY - this.h / 2
        this.updateRotationTranslationY()
    }
    setColor(color) {
        this.color = color
    }
    updateRotationTranslationX() {
        this.rotationTranslationX = this.x + this.w/2
    }
    updateRotationTranslationY() {
        this.rotationTranslationY = this.y + this.h/2
    }
}

let shapes = new Map()
let latestShapeID = 1
let moveRange = 5
let moveStep = 0.1
let sizeRange = 0.05
let sizeStep = 0.0001
let rotationRange = 0.1
let rotationStep = 0.001
function continuousInput(shapeID, name, range, step) {
    return `<label for="${name}${shapeID}">${name}</label>
    <input type="range" name="${name}${shapeID}" class="${name}Slider continuousSlider" value=${0} min=${-range} max=${range} step=${step}>`
}
function createShape() {
    latestShapeID++
    let shapeID = latestShapeID
    let shape = new Shape(shapeID)
    shapes.set(shapeID, shape)

    $('#shapesList').append(`
    <div class="shapeDiv" shapeID=${shapeID}>
        ${continuousInput(shapeID, 'x', moveRange, moveStep)}
        ${continuousInput(shapeID, 'y', moveRange, moveStep)}
        ${continuousInput(shapeID, 'Width', sizeRange, sizeStep)}
        ${continuousInput(shapeID, 'Height', sizeRange, sizeStep)}
        ${continuousInput(shapeID, 'Rotation', rotationRange, rotationStep)}
        <label for="color${shapeID}">color</label>
        <input type="color" name="color${shapeID}" class="colorSlider slider" value="${shape.color}">
    </div>
    `)
    console.log(shape.color)
    drawShape()
    $('.xSlider').on('mousedown', function (event) { // could possibly change this to get just added shape?
        startMoving(event, shapes.get(getShapeID(event)).addX)
    })
    $('.ySlider').on('mousedown', function (event) {
        startMoving(event, shapes.get(getShapeID(event)).addY)
    })
    $('.WidthSlider').on('input', function (event) {
        startMoving(event, shapes.get(getShapeID(event)).addW)
    })
    $('.HeightSlider').on('input', function (event) {
        startMoving(event, shapes.get(getShapeID(event)).addH)
    })
    $('.RotationSlider').on('input', function (event) {
        startMoving(event, shapes.get(getShapeID(event)).addRotation)
    })
    $('.colorSlider').on('input', function (event) {
        shapes.get(getShapeID(event)).setColor(event.target.value)
    })
    $('.continuousSlider').on('change', e => {
        moving = false
        $(e.target).val(0)
    })
}
function startMoving(event, f) {
    moving = true
    let shape = shapes.get(getShapeID(event))
    requestAnimationFrame(function animate() {
        if (!moving) return
        f.call(shape, event.target.value)
        drawShape()
        requestAnimationFrame(animate)
    })
}
function getShapeID(event) {
    return parseInt($(event.target).parent().attr('shapeID'))
}
function rad(deg) {
    return deg * Math.PI/180
}