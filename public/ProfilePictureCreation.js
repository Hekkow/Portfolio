import {data} from '/components/data.js'
export let canvasWidth = 300
export let canvasHeight = 300
let canvas
export let ctx
export function drawShapes() {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    // draws each shape starting from the last in the list
    // so that the ones on top of the list show above the ones at the bottom
    // $($('#shapesList').children().get().reverse()).each(function(index) {
    for (let shape of Array.from(data.shapes.values())) {
        // let shape = shapes.get(parseInt($(this).attr('shapeID')))
        // shape.z = index
        drawShape(ctx, shape, 1)
    }
}
let currentShapeID = 2
export function setupProfilePicCreator() {
    canvas = $('#editCanvas')[0]
    ctx = canvas.getContext("2d")
    $(`#editCanvas`).mousedown(function() {
        dragging = true
    })
    $(document).mouseup(function() {
        dragging = false
    })
    $(document).mousemove(function(event) {
        let deltaMouse = {x: event.clientX - lastMousePosition.x, y: event.clientY - lastMousePosition.y}
        lastMousePosition = {x: event.clientX, y: event.clientY}
        if (!dragging) return
        console.log("is shape", data.shapes.get(currentShapeID) instanceof Rectangle)
        if (!(data.shapes.get(currentShapeID) instanceof Shape)) data.shapes.set(currentShapeID, shapeFactory(data.shapes.get(currentShapeID), data.shapes.get(currentShapeID).shape, currentShapeID))
        if (mode === Modes.Move) data.shapes.get(currentShapeID).addXY(deltaMouse.x, deltaMouse.y)
        else if (mode === Modes.Width) data.shapes.get(currentShapeID).addW(deltaMouse.x)
        else if (mode === Modes.Height) data.shapes.get(currentShapeID).addH(-deltaMouse.y)
        else if (mode === Modes.Size) {
            data.shapes.get(currentShapeID).addW(deltaMouse.x)
            data.shapes.get(currentShapeID).addH(-deltaMouse.y)
        }
        else if (mode === Modes.Rotation) data.shapes.get(currentShapeID).addRotation(deltaMouse.x)
        else if (mode === Modes.Radius) data.shapes.get(currentShapeID).addR(deltaMouse.x)
    })
    currentShapeID = data.shapes.size === 0 ? 2 : Math.min(...Array.from(data.shapes).map(shape => shape[0]))
    latestShapeID = data.shapes.size === 0 ? 2 : Math.max(...Array.from(data.shapes).map(shape => shape[0])) + 1
    // if (!(data.shapes instanceof Map)) {
    //     data.shapes = new Map(Object.entries(data.loadedUsers.get(data.userID).profilePic).map(([key, value]) => [parseInt(key), value]))
    //     for (let shape of [...data.shapes.values()].sort((a, b) => b.z - a.z)) {
    //         data.shapes.set(shape.shapeID, shapeFactory(shape, shape.shape, shape.shapeID))
    //     }
    // }
}
export function deleteShape(shapeID) {
    data.shapes.delete(shapeID)
    if (shapeID === currentShapeID) currentShapeID = data.shapes.size === 0 ? 2 : Math.min(...Array.from(data.shapes).map(shape => shape[0]))
}
export function currentlyMovingShape(shapeID) {
    currentShapeID = shapeID
}
export function drawShape(ctx, shape, scale) {
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
export const Shapes = {
    Rectangle: 'Rectangle',
    Circle: 'Circle',
    Triangle: 'Triangle',
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
let latestShapeID = 2

export function createShape() {
    let shape = new Rectangle()
    let shapeID = shape.shapeID
    data.shapes.set(shapeID, shape)
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
function up(shapeID) {
    let shape = $(`.shapeDiv[shapeID=${shapeID}]`)
    shape.insertBefore(shape.prev())
}
function down(shapeID) {
    let shape = $(`.shapeDiv[shapeID=${shapeID}]`)
    shape.insertAfter(shape.next())
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
export function shapeFactory(shape, newShape, shapeID) {
    switch (newShape) {
        case Shapes.Rectangle:
            return new Rectangle(shapeID, shape.x, shape.y, shape.color)
        case Shapes.Circle:
            return new Circle(shapeID, shape.x, shape.y, shape.color)
        case Shapes.Triangle:
            return new Triangle(shapeID, shape.x, shape.y, shape.color)
    }
}
