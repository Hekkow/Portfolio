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
    for (let shape of sortedShapes().reverse()) {
        drawShape(ctx, shape, 1)
    }
}
export function sortedShapes() {
    return Array.from(data.shapes.values()).sort((a, b) => a.z - b.z)
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
        if (!(data.shapes.get(currentShapeID) instanceof Shape)) {
            data.shapes.set(currentShapeID, shapeFactory(data.shapes.get(currentShapeID), data.shapes.get(currentShapeID).shape, currentShapeID))
        }
        if (data.mode === data.Modes.Move) data.shapes.get(currentShapeID).addXY(deltaMouse.x, deltaMouse.y)
        else if (data.mode === data.Modes.Width) data.shapes.get(currentShapeID).addW(deltaMouse.x)
        else if (data.mode === data.Modes.Height) data.shapes.get(currentShapeID).addH(-deltaMouse.y)
        else if (data.mode === data.Modes.Size) {
            data.shapes.get(currentShapeID).addW(deltaMouse.x)
            data.shapes.get(currentShapeID).addH(-deltaMouse.y)
        }
        else if (data.mode === data.Modes.Rotation) data.shapes.get(currentShapeID).addRotation(deltaMouse.x)
        else if (data.mode === data.Modes.Radius) data.shapes.get(currentShapeID).addR(deltaMouse.x)
    })
    currentShapeID = data.shapes.size === 0 ? 2 : Math.min(...Array.from(data.shapes).map(shape => shape[0]))
    latestShapeID = data.shapes.size === 0 ? 2 : Math.max(...Array.from(data.shapes).map(shape => shape[0])) + 1
}
let draggingShapeItemDiv
let draggingShapeItemPosition
let overDragSpace = null
let dragDiv
export function getDraggingZ() {
    return data.shapes.get(parseInt($(dragDiv).attr('data-shapeid'))).z
}
export function startDragShapeItem(shapeItem, e) {
    data.draggingShapeItem = true
    draggingShapeItemDiv = shapeItem
    draggingShapeItemPosition = {x: e.pageX - $(shapeItem).offset().left, y: e.pageY - $(shapeItem).offset().top}
    let originalWidth = $(draggingShapeItemDiv).css('width')
    $(draggingShapeItemDiv).css('position', 'absolute')
    $(draggingShapeItemDiv).css('width', originalWidth)
    $(draggingShapeItemDiv).css({'left': e.clientX - draggingShapeItemPosition.x, 'top': e.clientY - draggingShapeItemPosition.y})
    dragDiv = $(shapeItem).find('.dragDiv')[0]
    $(document).mousemove(function(event) {
        if (data.draggingShapeItem) {
            $(draggingShapeItemDiv).css({'left': event.clientX - draggingShapeItemPosition.x, 'top': event.clientY - draggingShapeItemPosition.y})
            overDragSpace = null
            dragDiv.style.border = 'none'
            document.querySelectorAll('.dragSpacing').forEach(space => {
                let rect1 = dragDiv.getBoundingClientRect();
                let rect2 = space.getBoundingClientRect();
                let overlap = !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom)
                if (overlap) {
                    overDragSpace = space
                    dragDiv.style.border = '5px solid red'
                }
            })
        }
    })
    $(dragDiv).click(event => {
        if (data.draggingShapeItem && overDragSpace) {
            let sorted = sortedShapes()

            let index1 = sorted.findIndex(shape => shape.shapeID === parseInt($(dragDiv).attr('data-shapeID')))
            let index2 = sorted.findIndex(shape => shape.shapeID === parseInt($(overDragSpace).attr('data-shapeID')))
            let z2 = sorted[index2].z
            let z1 = sorted[index1].z
            if (index1 < index2) {
                for (let i = index2; i > index1; i--) {
                    data.shapes.get(sorted[i].shapeID).z = data.shapes.get(sorted[i - 1].shapeID).z
                }
            } else if (index1 > index2) {
                for (let i = index2; i < index1; i++) {
                    data.shapes.get(sorted[i].shapeID).z = data.shapes.get(sorted[i + 1].shapeID).z
                }
            }

            data.shapes.get(sorted[index1].shapeID).z = z2
            // data.shapes.get(sorted[index2].shapeID).z = z1

                // data.shapes.get(sorted[index1].shapeID).z = z2

            console.log(data.shapes)
            // data.shapes.get(sorted[index2].shapeID).z = z1


            // data.shapes.get(sorted[index2].shapeID).z = z1
            // data.shapes.get(sorted[index1].shapeID).z = z2
            data.draggingShapeItem = false
            overDragSpace = null
            $(draggingShapeItemDiv).css('position', 'relative')
            $(draggingShapeItemDiv).css({'left': 0, 'top': 0})
            dragDiv.style.border = 'none'
            dragDiv = null
        }
    })
}

export function deleteShape(shapeID) {
    data.shapes.delete(shapeID)
    if (shapeID === currentShapeID) currentShapeID = data.shapes.size === 0 ? 2 : Math.min(...Array.from(data.shapes).map(shape => shape[0]))
}
export function currentlyMovingShape(shapeID) {
    currentShapeID = shapeID
    setMode(data.Modes.Move, shapeID)
}
export function drawShape(ctx, shape, scale, reset) {
    if (reset) {
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, canvasWidth/scale, canvasHeight/scale)
    }
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

let dragging = false
let lastMousePosition = {x: 0, y: 0}
let latestShapeID = 2

export function createShape() {
    let shape = new Rectangle()
    let shapeID = shape.shapeID
    data.shapes.set(shapeID, shape)
    if (data.shapes.size === 1) currentShapeID = shapeID
}
export function setMode(newMode, shapeID) {
    data.mode = newMode
    currentShapeID = shapeID
}
export function up(shapeID) {
    let sorted = sortedShapes()
    let index = sorted.findIndex(shape => shape.shapeID === shapeID)
    if (index > 0) {
        swapZ(sorted, index, -1)
    }
}
export function down(shapeID) {
    let sorted = sortedShapes()
    let index = sorted.findIndex(shape => shape.shapeID === shapeID)
    if (index < sorted.length - 1) {
        swapZ(sorted, index, 1)
    }
}
function swapZ(sorted, index, next) {
    let z1 = sorted[index + next].z
    let z2 = sorted[index].z
    data.shapes.get(sorted[index].shapeID).z = z1
    data.shapes.get(sorted[index + next].shapeID).z = z2
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
        this.z = this.shapeID
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
export function shapeFactory(shape, newShapeType, shapeID) {
    let newShape
    switch (newShapeType) {
        case Shapes.Rectangle:
            newShape = new Rectangle(shapeID, shape.x, shape.y, shape.color)
            break
        case Shapes.Circle:
            newShape = new Circle(shapeID, shape.x, shape.y, shape.color)
            break
        case Shapes.Triangle:
            newShape = new Triangle(shapeID, shape.x, shape.y, shape.color)
            break
    }
    for (let key in shape) {
        if (shape.hasOwnProperty(key) && newShape.hasOwnProperty(key) && !['shape'].includes(key)) {
            newShape[key] = shape[key]
        }
    }
    return newShape
}
