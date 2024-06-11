let canvasWidth = 300
let canvasHeight = 300
let canvas = $('canvas')[0]
let ctx = canvas.getContext("2d")
$('#profilePicCreatorBackground').css('display', 'flex') // remove
let moving = false
function drawShape() {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    // draws each shape starting from the last in the list
    // so that the ones on top of the list show above the ones at the bottom
    $($('#shapesList').children().get().reverse()).each(function() {
        let shape = shapes.get(parseInt($(this).attr('shapeID')))
        ctx.save();
        ctx.fillStyle = shape.color
        ctx.translate(shape.rotationTranslationX, shape.rotationTranslationY)
        ctx.rotate(shape.rotation)
        ctx.translate(-shape.rotationTranslationX, -shape.rotationTranslationY)
        switch (shape.shape) {
            case Shapes.Rectangle:
                ctx.fillRect(shape.x, shape.y, shape.w, shape.h)
                break
            case Shapes.Circle:
                ctx.beginPath()
                // + shape.r to center it around x, y
                ctx.arc(shape.x+shape.r, shape.y+shape.r, shape.r, 0, Math.PI * 2)
                ctx.closePath()
                ctx.fill()
                break
            case Shapes.Triangle:
                ctx.beginPath()
                ctx.moveTo(shape.x + shape.r * Math.cos(0), shape.y + shape.r * Math.sin(0))
                for (let i = 0; i < shape.sides; i++) {
                    let angle = (Math.PI * 2 * (i + 1)) / shape.sides
                    let x = shape.x + shape.r * Math.cos(angle)
                    let y = shape.y + shape.r * Math.sin(angle)
                    ctx.lineTo(x, y)
                }
                ctx.closePath()
                ctx.fill()
                break
        }
        ctx.restore()
    })
}
function increaseSides(shapeID) {
    let shape = shapes.get(shapeID)
    shape.sides++
    drawShape();
}

const Shapes = {
    Rectangle: 0,
    Circle: 1,
    Triangle: 2,
}



let shapes = new Map()
let latestShapeID = 2
function shapesDropdown(shapeID) {
    let select = `<select class="shapeSelect pfpInput" id="selectShape${shapeID}">`
    for (let shape in Shapes) {
        select += `<option value="${Shapes[shape]}">${shape}</option>`
    }
    return select + '</select>'
}
function createShape() {
    let shape = new Rectangle()
    console.log(shape)
    let shapeID = shape.shapeID
    shapes.set(shapeID, shape)
    showSliders(shapeID, shape)
    drawShape()

}
function showSliders(shapeID, shape) {
    let shapesList = $('#shapesList')
    shapesList.find(`.shapeDiv[shapeID=${shapeID}]`).remove()
    let div = `
    <div class="shapeDiv" shapeID=${shapeID}>
        <button onclick="up(${shapeID})">^</button>
        <button onclick="down(${shapeID})">v</button>
        ${shapesDropdown(shapeID)}
        ${continuousInput(shapeID, 'x', shape.moveRange, shape.moveStep)}
        ${continuousInput(shapeID, 'y', shape.moveRange, shape.moveStep)}
        ${createLabel(shapeID, "Color")}
        <input type="color" name="color${shapeID}" class="colorSlider pfpInput" value="${shape.color}"></div>
    `
    if ([Shapes.Rectangle].includes(shape.shape)) {
        div += `
        ${continuousInput(shapeID, 'Width', shape.sizeRange, shape.sizeStep)}
        ${continuousInput(shapeID, 'Height', shape.sizeRange, shape.sizeStep)}`
    }
    if ([Shapes.Circle].includes(shape.shape)) {
        div += `${continuousInput(shapeID, 'Radius', shape.radiusRange, shape.radiusStep)}`
    }
    if (![Shapes.Circle].includes(shape.shape)) {
        div += `${continuousInput(shapeID, 'Rotation', shape.rotationRange, shape.rotationStep)}`
    }
    if ([Shapes.Triangle].includes(shape.shape)) {
        div += `<button onclick="increaseSides(${shapeID})">Increase sides</button>`
    }
    div += '</div>'
    shapesList.append(div)
    shapesList.find(`#selectShape${shapeID}`).val(shape.shape)
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
    $('.RadiusSlider').on('input', function (event) {
        startMoving(event, shapes.get(getShapeID(event)).addR)
    })
    $('.RotationSlider').on('input', function (event) {
        startMoving(event, shapes.get(getShapeID(event)).addRotation)
    })
    $('.colorSlider').on('input', function (event) {
        shapes.get(getShapeID(event)).setColor(event.target.value)
        drawShape()
    })
    $('.shapeSelect').on('change', function (event) {
        let shapeID = getShapeID(event)
        shapes.set(shapeID, shapeFactory(shape, event.target.value, shapeID))
        drawShape()
        showSliders(shapeID, shapes.get(shapeID))

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
class Shape {
    constructor(shapeID = -1, x = 0, y = 0, color = "#FF0000") {
        if (shapeID === -1) {
            this.shapeID = latestShapeID
            latestShapeID++
        }
        else this.shapeID = shapeID
        this.x = x
        this.y = y
        this.color = color
        this.rotation = 0
        this.moveRange = 5
        this.moveStep = 0.1
        this.rotationRange = 0.1
        this.rotationStep = 0.001
    }
    addRotation(rotation) {
        this.rotation += rad(parseFloat(rotation))
    }
    addX(x) {
        this.x += parseFloat(x)
    }
    addY(y) {
        this.y += parseFloat(y)
    }
    setColor(color) {
        this.color = color
    }
}
class Rectangle extends Shape {
    constructor(shapeID = -1, x = canvasWidth/2-50/2, y = canvasHeight/2-50/2, color = "#FF0000") {
        super(shapeID, x, y, color)
        this.shape = Shapes.Rectangle
        this.sizeRange = 0.15
        this.sizeStep = 0.0001
        this.w = 50
        this.h = 50
        this.updateRotationTranslationX()
        this.updateRotationTranslationY()
    }
    addX(x) {
        super.addX(x)
        this.updateRotationTranslationX()
    }
    addY(y) {
        super.addY(y)
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
    updateRotationTranslationX() {
        this.rotationTranslationX = this.x + this.w/2
    }
    updateRotationTranslationY() {
        this.rotationTranslationY = this.y + this.h/2
    }
}
class Circle extends Shape {
    constructor(shapeID = -1, x = 0, y = 0, color = "#FF0000") {
        super(shapeID, x, y, color)
        this.shape = Shapes.Circle
        this.r = 25
        this.radiusRange = 0.1
        this.radiusStep = 0.0001
    }
    addR(r) {
        let difference = this.r
        this.r += parseFloat(r)
        if (this.r <= 0) this.r = 0
        difference -= this.r
        this.x += difference
        this.y += difference
    }
}
class Triangle extends Shape {
    constructor(shapeID = -1, x = 0, y = 0, color = "#FF0000") {
        super(shapeID, x, y, color)
        this.shape = Shapes.Triangle
        this.a1 = 60
        this.a2 = 60
        this.a3 = 60
    }
}
function shapeFactory(shape, newShape, shapeID) {
    switch (parseInt(newShape)) {
        case Shapes.Rectangle:
            return new Rectangle(shapeID, shape.x, shape.y, shape.color)
        case Shapes.Circle:
            return new Circle(shapeID, shape.x, shape.y, shape.color)
        case Shapes.Triangle:
            return new Polygon(shapeID, shape.x, shape.y, shape.color)
    }
}