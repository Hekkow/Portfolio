// very weird glitch where moving sliders right then left repeatedly without letting go increases speed over time
let canvasWidth = 300
let canvasHeight = 300
// let canvas = $('#editCanvas')[0]
// let ctx = canvas.getContext("2d")
// $('#profilePicCreatorBackground').css('display', 'flex') // remove
function drawShapes(name, shapes) {
    console.log(name, shapes)
    let canvases = $(`canvas[canvasID=${name}]`)
    console.log(canvases)
    canvases.each(function() {
        let ctx = this.getContext('2d')
        let scale = canvasWidth/parseFloat($(this).attr('width'))
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        if (!shapes) return
        // draws each shape starting from the last in the list
        // so that the ones on top of the list show above the ones at the bottom
        if (name === 'editCanvas') {
            $($('#shapesList').children().get().reverse()).each(function(index) {
                let shape = shapes.get(parseInt($(this).attr('shapeID')))
                shape.z = index
                drawShape(ctx, shape, scale)
            })
        }
        else {
            if (!(shapes instanceof Map)) {
                shapes = new Map(Object.entries(shapes))
            }
            console.log("ARRIVED HERE")
            for (let shape of Array.from(shapes.values()).sort((a, b) => a.z - b.z)) {
                console.log("SHAPES", ctx, shape, "scale", scale)
                drawShape(ctx, shape, scale)
            }
        }
    })
}
function drawShape(ctx, shape, scale) {
    ctx.save()
    ctx.scale(1/scale, 1/scale)
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
            ctx.moveTo(shape.vertexA.x, shape.vertexA.y)
            ctx.lineTo(shape.vertexB.x, shape.vertexB.y)
            ctx.lineTo(shape.vertexC.x, shape.vertexC.y)
            ctx.closePath()
            ctx.fill()
            break
    }
    ctx.restore()
}
const Shapes = {
    Rectangle: 0,
    Circle: 1,
    Triangle: 2,
}
const Modes = {
    Move: 0,
    Width: 1,
    Height: 2,
    Size: 3,
    Rotation: 4,
    Radius: 5,
}
let dragging = false
let lastMousePosition = {x: 0, y: 0}
let currentShapeID = 2
$(`canvas[canvasID=editCanvas]`).mousedown(function(event) {
    dragging = true
})
$(document).mouseup(function(event) {
    dragging = false
})
$(document).mousemove(function(event) {
    let deltaMouse = {x: event.clientX - lastMousePosition.x, y: event.clientY - lastMousePosition.y}
    lastMousePosition = {x: event.clientX, y: event.clientY}
    if (!dragging) return
    if (mode === Modes.Move) shapes.get(currentShapeID).addXY(deltaMouse.x, deltaMouse.y)
    else if (mode === Modes.Width) shapes.get(currentShapeID).addW(deltaMouse.x)
    else if (mode === Modes.Height) shapes.get(currentShapeID).addH(-deltaMouse.y)
    else if (mode === Modes.Size) {
        shapes.get(currentShapeID).addW(deltaMouse.x)
        shapes.get(currentShapeID).addH(-deltaMouse.y)
    }
    else if (mode === Modes.Rotation) shapes.get(currentShapeID).addRotation(deltaMouse.x)
    else if (mode === Modes.Radius) shapes.get(currentShapeID).addR(deltaMouse.x)
    drawShapes('editCanvas', shapes)
})

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
    let shapeID = shape.shapeID
    shapes.set(shapeID, shape)
    showSliders(shapeID, shape)
    drawShapes('editCanvas', shapes)
}
let mode = Modes.Move
function setModeMove() {
    mode = Modes.Move
}
function setModeWidth() {
    mode = Modes.Width
}
function setModeHeight() {
    mode = Modes.Height
}
function setModeSize() {
    mode = Modes.Size
}
function setModeRotation() {
    mode = Modes.Rotation
}
function setModeRadius() {
    mode = Modes.Radius
}
function showSliders(shapeID, shape) {
    let shapesList = $('#shapesList')
    shapesList.find(`.shapeDiv[shapeID=${shapeID}]`).remove()
    let div = `
    <div class="shapeDiv" shapeID=${shapeID}>
        <button onclick="up(${shapeID})">^</button>
        <button onclick="down(${shapeID})">v</button>
        ${shapesDropdown(shapeID)}
        ${createLabel(shapeID, "Color")}
        <input type="color" name="color${shapeID}" class="colorSlider pfpInput" value="${shape.color}"></div>
        <button onclick="setModeMove()">Move</button>
    `
    if ([Shapes.Rectangle, Shapes.Triangle].includes(shape.shape)) {
        div += `
        <button onclick="setModeWidth()">Width</button>
        <button onclick="setModeHeight()">Height</button>
        <button onclick="setModeSize()">Size</button>`
    }
    if ([Shapes.Circle].includes(shape.shape)) {
        div += `<button onclick="setModeRadius()">Radius</button>`
    }
    if (![Shapes.Circle].includes(shape.shape)) {

        div += `<button onclick="setModeRotation()">Rotation</button>`
    }
    if ([Shapes.Triangle].includes(shape.shape)) {

    }
    div += '</div>'
    shapesList.append(div)
    shapesList.find(`#selectShape${shapeID}`).val(shape.shape)
    $('.colorSlider').on('input', function (event) {
        shapes.get(getShapeID(event)).setColor(event.target.value)
        drawShapes('editCanvas', shapes)
    })
    $('.shapeSelect').on('change', function (event) {
        let shapeID = getShapeID(event)
        shapes.set(shapeID, shapeFactory(shape, event.target.value, shapeID))
        drawShapes('editCanvas', shapes)
        showSliders(shapeID, shapes.get(shapeID))
        setModeMove()

    })
}

function up(shapeID) {
    let shape = $(`.shapeDiv[shapeID=${shapeID}]`)
    shape.insertBefore(shape.prev())
    drawShapes('editCanvas', shapes)
}
function down(shapeID) {
    let shape = $(`.shapeDiv[shapeID=${shapeID}]`)
    shape.insertAfter(shape.next())
    drawShapes('editCanvas', shapes)
}

function createLabel(shapeID, name) {
    return `<div class="sliderRow"><label for="${name}${shapeID}">${name}</label>`
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
        this.z = 0
    }
    addRotation(rotation) {
        this.rotation += rad(rotation)
    }
    addXY(x, y) {
        this.x += x
        this.y += y
    }
    setColor(color) {
        this.color = color
    }
}
class Rectangle extends Shape {
    constructor(shapeID = -1, x = canvasWidth/2-50/2, y = canvasHeight/2-50/2, color = "#FF0000") {
        super(shapeID, x, y, color)
        this.shape = Shapes.Rectangle
        this.w = 50
        this.h = 50
        this.updateRotationTranslation()
    }
    addXY(x, y) {
        super.addXY(x, y)
        this.updateRotationTranslation()
    }
    addW(w) {
        let oldCenterX = this.rotationTranslationX
        this.w += w
        this.x = oldCenterX - this.w / 2
        this.updateRotationTranslation()
    }
    addH(h) {
        let oldCenterY = this.rotationTranslationY
        this.h += h
        this.y = oldCenterY - this.h / 2
        this.updateRotationTranslation()
    }
    updateRotationTranslation() {
        this.rotationTranslationX = this.x + this.w/2
        this.rotationTranslationY = this.y + this.h/2
    }
}
class Circle extends Shape {
    constructor(shapeID = -1, x = 0, y = 0, color = "#FF0000") {
        super(shapeID, x, y, color)
        this.shape = Shapes.Circle
        this.r = 25
    }
    addR(r) {
        let difference = this.r
        this.r += r
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
        this.angleA = rad(60)
        this.minAngle = rad(1)
        this.maxAngle = rad(179)
        this.minLength = 1
        this.lengthB = 100
        this.lengthC = 100
        this.updateVertices()
    }
    addXY(x, y) {
        super.addXY(x, y)
        this.updateVertices()
    }
    addW(w) {
        this.lengthB += w
        if (this.lengthB <= this.minLength) this.lengthB = this.minLength
        this.updateVertices()
    }
    addH(h) {
        this.lengthC += h
        if (this.lengthC <= this.minLength) this.lengthC = this.minLength
        this.updateVertices()
    }
    updateVertices() {
        this.vertexA = { x: this.x, y: this.y }
        this.vertexB = { x: this.x + this.lengthB * Math.cos(this.angleA), y: this.y + this.lengthB * Math.sin(this.angleA) }
        this.vertexC = { x: this.x + this.lengthC, y: this.y }
        this.rotationTranslationX = (this.vertexA.x + this.vertexB.x + this.vertexC.x) / 3
        this.rotationTranslationY = (this.vertexA.y + this.vertexB.y + this.vertexC.y) / 3
    }
    addAngleA(delta) {
        this.angleA += delta
        if (this.angleA <= this.minAngle) this.angleA = this.minAngle
        if (this.angleA >= this.maxAngle) this.angleA = this.maxAngle
        this.updateVertices()
    }
}
function shapeFactory(shape, newShape, shapeID) {
    switch (parseInt(newShape)) {
        case Shapes.Rectangle:
            return new Rectangle(shapeID, shape.x, shape.y, shape.color)
        case Shapes.Circle:
            return new Circle(shapeID, shape.x, shape.y, shape.color)
        case Shapes.Triangle:
            return new Triangle(shapeID, shape.x, shape.y, shape.color)
    }
}
