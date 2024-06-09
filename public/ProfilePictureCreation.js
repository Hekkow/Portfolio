let canvasWidth = 300
let canvasHeight = 300
let canvas = $('canvas')[0]
let ctx = canvas.getContext("2d")
$('#profilePicCreatorBackground').css('display', 'flex') // remove
let moving = false
function drawShape() {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    let sortedShapes = Array.from(shapes.values()).sort((a, b) => a.z - b.z);
    console.log("NEW")
    $($('#shapesList').children().get().reverse()).each(function() {
        console.log(this)
        console.log($(this).attr('shapeID'))
        let shape = shapes.get(parseInt($(this).attr('shapeID')))
        ctx.save();
        ctx.fillStyle = shape.color;
        ctx.translate(shape.rotationTranslationX, shape.rotationTranslationY);
        ctx.rotate(shape.rotation);
        ctx.translate(-shape.rotationTranslationX, -shape.rotationTranslationY);
        ctx.fillRect(shape.x, shape.y, shape.w, shape.h);
        ctx.restore();
    })

}
class Shape {
    constructor(shapeID, x = canvasWidth/2-50/2, y = canvasHeight/2-50/2, w = 50, h = 50, rotation = 0, color = "#FF0000", z = 0) {
        this.shapeID = shapeID
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.rotation = rotation
        this.updateRotationTranslationX()
        this.updateRotationTranslationY()
        this.color = color
        this.z = z
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
    setZ(z) {
        this.z = parseInt(z)
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

function createShape() {
    latestShapeID++
    let shapeID = latestShapeID
    let shape = new Shape(shapeID)
    shapes.set(shapeID, shape)

    $('#shapesList').append(`
    <div class="shapeDiv" shapeID=${shapeID}>
    <button onclick="up(${shapeID})">^</button>
    <button onclick="down(${shapeID})">v</button>
        ${continuousInput(shapeID, 'x', moveRange, moveStep)}
        ${continuousInput(shapeID, 'y', moveRange, moveStep)}
        ${continuousInput(shapeID, 'Width', sizeRange, sizeStep)}
        ${continuousInput(shapeID, 'Height', sizeRange, sizeStep)}
        ${continuousInput(shapeID, 'Rotation', rotationRange, rotationStep)}
        ${createLabel(shapeID, "Color")}
        <input type="color" name="color${shapeID}" class="colorSlider pfpInput" value="${shape.color}"></div>
        ${createLabel(shapeID, "z-index")}
        <input type="number" name="z-index${shapeID}" class="zSlider pfpInput" value=0></div>
    </div>
    `)
    drawShape()
    $('.xSlider').on('mousedown', function (event) { // could possibly change this to get just added slider instead of class
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
        drawShape()
    })
    $('.zSlider').on('input', function(event) {
        shapes.get(getShapeID(event)).setZ(event.target.value)
        drawShape()
    })
    $('.continuousSlider').on('change', e => {
        moving = false
        $(e.target).val(0)
    })
}
function up(shapeID) {
    let shape = $(`.shapeDiv[shapeID=${shapeID}]`)
    shape.insertBefore(shape.prev())
    drawShape()
}
function down(shapeID) {
    let shape = $(`.shapeDiv[shapeID=${shapeID}]`)
    shape.insertAfter(shape.next())
    drawShape()
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

let moveRange = 5
let moveStep = 0.1
let sizeRange = 0.1
let sizeStep = 0.0001
let rotationRange = 0.1
let rotationStep = 0.001
function createLabel(shapeID, name) {
    return `<div class="sliderRow"><label for="${name}${shapeID}">${name}</label>`
}
function continuousInput(shapeID, name, range, step) {
    return `${createLabel(shapeID, name)}
    <input type="range" name="${name}${shapeID}" class="${name}Slider continuousSlider pfpInput" value=${0} min=${-range} max=${range} step=${step}></div>`
}

function getShapeID(event) {
    return parseInt($(event.target).closest(".shapeDiv").attr('shapeID'))
}
function rad(deg) {
    return deg * Math.PI/180
}