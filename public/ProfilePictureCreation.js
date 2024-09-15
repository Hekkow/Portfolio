import {data} from '/components/data.js'
export let canvasWidth = 300
export let canvasHeight = 300
let canvas
export let ctx

export function drawShapes() {
    if (!ctx) return
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
        if (data.mode === data.Modes.Move) data.shapes.get(currentShapeID).addXY(deltaMouse.x, deltaMouse.y)
        else if (data.mode === data.Modes.Width) data.shapes.get(currentShapeID).addW(deltaMouse.x)
        else if (data.mode === data.Modes.Height) data.shapes.get(currentShapeID).addH(-deltaMouse.y)
        else if (data.mode === data.Modes.Size) {
            data.shapes.get(currentShapeID).addW(deltaMouse.x)
            data.shapes.get(currentShapeID).addH(-deltaMouse.y)
        }
        else if (data.mode === data.Modes.Rotate) data.shapes.get(currentShapeID).addRotation(deltaMouse.x)
        else if (data.mode === data.Modes.Radius) data.shapes.get(currentShapeID).addR(deltaMouse.x)
        else if (data.mode === data.Modes.NumberPoints) data.shapes.get(currentShapeID).addPoint(deltaMouse.x/50)
        else if (data.mode === data.Modes.Inset) data.shapes.get(currentShapeID).addInset(deltaMouse.x/50)
        else if (data.mode === data.Modes.ControlPoint) data.shapes.get(currentShapeID).addControlPoint(deltaMouse.x, deltaMouse.y)
    })

    currentShapeID = data.shapes.size === 0 ? 2 : Math.min(...Array.from(data.shapes).map(shape => shape[0])) // this should probably be .shapeID instead of [0]
    latestShapeID = data.shapes.size === 0 ? 2 : Math.max(...Array.from(data.shapes).map(shape => shape[0])) + 1
}
export function fixShape(shapeID) {
    if (!(data.shapes.get(shapeID) instanceof Shape)) {
        data.shapes.set(shapeID, shapeFactory(data.shapes.get(shapeID), data.shapes.get(shapeID).shape, shapeID))
    }
}
export function deleteShape(shapeID) {
    data.shapes.delete(shapeID)
    if (shapeID === currentShapeID) currentShapeID = data.shapes.size === 0 ? 2 : Math.min(...Array.from(data.shapes).map(shape => shape[0]))
}
export function duplicateShape(shapeID) {
    let newShapeID = Math.max(...data.shapes.keys()) + 1
    let newShape = structuredClone(Vue.toRaw(data.shapes.get(shapeID)))
    newShape.shapeID = newShapeID
    newShape.z = newShapeID
    data.shapes.set(newShapeID, newShape)
    currentShapeID = newShapeID
}
export function drawShape(ctx, shape, scale, reset) {
    if (reset) {
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, canvasWidth/scale, canvasHeight/scale)
    }
    ctx.save()
    ctx.scale(1/scale, 1/scale)
    ctx.fillStyle = shape.color
    ctx.translate(shape.x, shape.y)
    ctx.rotate(shape.rotation)
    switch (shape.shape) {
        case Shapes.Rectangle:
            ctx.fillRect(-shape.w/2, -shape.h/2, shape.w, shape.h)
            break
        case Shapes.Circle:
            ctx.beginPath()
            ctx.arc(0, 0, shape.radius, 0, Math.PI * 2)
            ctx.closePath()
            ctx.fill()
            break
        case Shapes.Star:
            ctx.beginPath()
            ctx.moveTo(0, shape.radius)
            for (let i = 0; i < parseInt(shape.numberPoints); i++) {
                ctx.rotate(Math.PI / parseInt(shape.numberPoints))
                ctx.lineTo(0, shape.radius * shape.inset)
                ctx.rotate(Math.PI / parseInt(shape.numberPoints))
                ctx.lineTo(0, shape.radius)
            }
            ctx.closePath()
            ctx.fill()
            break
        case Shapes.Heart:
            ctx.beginPath()
            ctx.moveTo(0, 0)
            let t = [[-shape.w, 0], [0, shape.h], [shape.w, 0], [0, 0]]
            for (let i = 0; i < 4; i++) {
                ctx.bezierCurveTo(shape.controlPoints[i*2].x, shape.controlPoints[i*2].y, shape.controlPoints[i*2+1].x, shape.controlPoints[i*2+1].y, t[i][0], t[i][1])
            }
            ctx.closePath()
            ctx.fill()
            if ($(ctx.canvas).is('#editCanvas') && data.mode === data.Modes.ControlPoint) {
                for (let i = 0; i < 2; i++) {
                    let point = shape.controlPoints[shape.selectedCurve*2+i]
                    ctx.fillStyle = "blue"
                    if (i === shape.selectedPoint) ctx.fillStyle = "green"
                    ctx.beginPath()
                    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)
                    ctx.closePath()
                    ctx.fill()
                }
            }
            break
        case Shapes.Points:
        case Shapes.Polygon: {
            ctx.beginPath()
            ctx.moveTo(shape.points[0].x, shape.points[0].y)
            for (let point of shape.points) {
                ctx.lineTo(point.x, point.y)
            }
            ctx.closePath()
            ctx.fill()
            if ($(ctx.canvas).is('#editCanvas')) {
                for (let i = 0; i < shape.points.length; i++) {
                    let point = shape.points[i]
                    ctx.fillStyle = "blue"
                    if (i === shape.selectedPoint-1) ctx.fillStyle = "red"

                    ctx.beginPath()
                    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)
                    ctx.closePath()
                    ctx.fill()
                }
                ctx.fillStyle = "red"
                ctx.beginPath()
                ctx.arc(0, 0, 3, 0, Math.PI * 2)
                ctx.closePath()
                ctx.fill()
            }
            break
        }
    }
    ctx.restore()
}
export const Shapes = {
    Rectangle: 'Rectangle',
    Circle: 'Circle',
    Star: 'Star',
    Heart: 'Heart',
    Polygon: 'Polygon',
    Points: 'Points'
}

let dragging = false
let lastMousePosition = {x: 0, y: 0}
let latestShapeID = 2

export function createShape() {
    if (data.shapes.size > data.maxShapes) {
        data.openPopup = data.popups.TooManyShapes
    }
    let shape = new Rectangle()
    let shapeID = shape.shapeID
    data.shapes.set(shapeID, shape)
    currentShapeID = shapeID
    drawShapes() // shouldn't be needed but isn't updating properly without it
}
export function setMode(newMode, shapeID) {
    data.mode = newMode
    currentShapeID = shapeID
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
    constructor(shapeID = -1, x = canvasWidth/2, y = canvasHeight/2, color = "#FF0000") {
        super(shapeID, x, y, color)
        this.shape = Shapes.Rectangle
        this.w = 50
        this.h = 50
    }
    addW(w) {
        this.w += w
    }
    addH(h) {
        this.h += h
    }
}
class Circle extends Shape {
    constructor(shapeID = -1, x = 0, y = 0, color = "#FF0000") {
        super(shapeID, x, y, color)
        this.shape = Shapes.Circle
        this.radius = 25
    }
    addR(radius) {
        this.radius += radius
        if (this.radius <= 0) this.radius = 0
    }
}
class Star extends Shape {
    constructor(shapeID = -1, x = 0, y = 0, color = "#FF0000") {
        super(shapeID, x, y, color)
        this.shape = Shapes.Star
        this.radius = 20
        this.numberPoints = 5
        this.inset = 5
    }
    addPoint(p) {
        this.numberPoints += p
        if (this.numberPoints < 2) this.numberPoints = 2
    }
    addInset(i) {
        this.inset += i
    }
    addR(r) {
        this.radius += r
        if (this.radius <= 0) this.radius = 0
    }

}
class Heart extends Shape {
    constructor(shapeID = -1, x = 0, y = 0, color = "#FF0000") {
        super(shapeID, x, y, color)
        this.shape = Shapes.Heart
        this.controlPoints = [{x: -11, y: -33}, {x: -45, y: -30}, {x: -47, y: 26}, {x: -22, y: 23}, {x: 22, y: 23}, {x: 47, y: 26}, {x: 45, y: -30}, {x: 11, y: -33}]
        this.selectedCurve = 0
        this.selectedPoint = 0
        this.w = 50
        this.h = 50
        this.symmetry = true
    }
    addW(w) {
        this.w += w
    }
    addH(h) {
        this.h += h
    }
    addControlPoint(x, y) {
        this.controlPoints[this.selectedCurve*2+this.selectedPoint].x += x
        this.controlPoints[this.selectedCurve*2+this.selectedPoint].y += y
        if (this.symmetry) {
            this.controlPoints[7-(this.selectedCurve*2+this.selectedPoint)].x -= x
            this.controlPoints[7-(this.selectedCurve*2+this.selectedPoint)].y += y
        }
    }
    selectPoint(n) {
        this.selectedPoint = n-1
        data.mode = data.Modes.ControlPoint
    }
    selectCurve(n) {
        this.selectedCurve = n-1
        data.mode = data.Modes.ControlPoint
    }
}
class Polygon extends Shape {
    constructor(shapeID = -1, x = 0, y = 0, color = "#FF0000") {
        super(shapeID, x, y, color)
        this.shape = Shapes.Polygon
        this.points = []
        this.numberPoints = 3
        this.radius = 50
        this.updatePoints()
    }
    addPoint(p) {
        this.numberPoints += p
        if (this.numberPoints < 3) this.numberPoints = 3
        this.updatePoints()
    }
    updatePoints() {
        let angle = 2*Math.PI/parseInt(this.numberPoints)
        this.points = []
        for (let i = 0; i < parseInt(this.numberPoints); i++) {
            this.points[i] = {x: this.radius * Math.cos(angle*i), y: this.radius * Math.sin(angle*i)}
        }
    }
    addR(r) {
        this.radius += r
        if (this.radius <= 0) this.radius = 0
        this.updatePoints()
    }

}
class Points extends Shape {
    constructor(shapeID = -1, x = 0, y = 0, color = "#FF0000") {
        super(shapeID, x, y, color)
        this.shape = Shapes.Points
        this.points = []
        this.selectedPoint = 1
        let startNumberPoints = 3
        let angle = 2*Math.PI/startNumberPoints
        let radius = 50
        for (let i = 0; i < startNumberPoints; i++) {
            this.points[i] = {x: radius * Math.cos(angle*i), y: radius * Math.sin(angle*i)}
        }
    }
    selectPoint(n) {
        this.selectedPoint = n
        data.mode = data.Modes.ControlPoint
    }
    addPoint(point) {
        if (this.points.length >= data.maxPoints) {
            data.openPopup = data.popups.TooManyPoints
            return
        }
        let previous = this.points[point-1]
        let next = this.points[(point)%this.points.length]
        this.points.splice(point, 0, {x: (previous.x+next.x)/2, y: (previous.y+next.y)/2})
        this.selectPoint(point+1)
    }
    removePoint(point) {
        if (this.points.length <= data.minPoints) {
            data.openPopup = data.popups.NotEnoughPoints
            return
        }
        this.points.splice(point-1, 1)
        let nextSelect = point-1
        if (point-1 <= 0) nextSelect = this.points.length
        this.selectPoint(nextSelect)
    }
    addControlPoint(x, y) {
        this.points[this.selectedPoint-1].x += x * Math.cos(this.rotation) + y * Math.sin(this.rotation)
        this.points[this.selectedPoint-1].y += -x * Math.sin(this.rotation) + y * Math.cos(this.rotation)
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
        case Shapes.Star:
            newShape = new Star(shapeID, shape.x, shape.y, shape.color)
            break
        case Shapes.Heart:
            newShape = new Heart(shapeID, shape.x, shape.y, shape.color)
            break
        case Shapes.Polygon:
            newShape = new Polygon(shapeID, shape.x, shape.y, shape.color)
            break
        case Shapes.Points:
            newShape = new Points(shapeID, shape.x, shape.y, shape.color)
            break
    }
    for (let key in shape) {
        if (shape.hasOwnProperty(key) && newShape.hasOwnProperty(key) && !['shape'].includes(key)) {
            newShape[key] = shape[key]
        }
    }
    return newShape
}