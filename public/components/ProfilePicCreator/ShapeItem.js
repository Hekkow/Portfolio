import {data} from "../data.js";
import {
    drawShapes,
    shapeFactory,
    Shapes,
    currentlyMovingShape,
    deleteShape,
    setMode,
    up, down, startDragShapeItem
} from "../../ProfilePictureCreation.js";

export default {
    methods: {startDragShapeItem, down, up, deleteShape, drawShapes, shapeFactory, currentlyMovingShape, setMode},
    data() {
        return {
            data: data,
            Shapes: Shapes,
            currentlyOpen: true,
        }
    },
    template: `
      <div class="shapeDiv" ref="shapeDiv">
        <button @click="currentlyOpen = !currentlyOpen">+</button>
        <button @click="up(shape.shapeID)">^</button>
        <button @click="down(shape.shapeID)">v</button>
        <button @mousedown="function(event) { if (!data.draggingShapeItem) startDragShapeItem($refs.shapeDiv, event)}" class="dragDiv" :data-shapeid="shape.shapeID">DRAG</button>
        <div v-if="currentlyOpen" class="controls">
            <button @click="currentlyMovingShape(shape.shapeID)">Edit</button>
            <button @click="deleteShape(shape.shapeID)">Delete</button>
            
            <div class="sliderRow">
                <label :for="'color'+ shape.shapeID">Color</label>
                <input 
                    type="color" 
                    :name="'color'+ shape.shapeID" 
                    class="colorSlider pfpInput" :value="shape.color" 
                    @input="function(event) { data.shapes.get(shape.shapeID).setColor(event.target.value) }"
                >
            </div>
            <button @click="setMode(data.Modes.Move, shape.shapeID)">Move</button>
            <button v-if="[Shapes.Rectangle, Shapes.Triangle].includes(shape.shape)" @click="setMode(data.Modes.Width, shape.shapeID)">Width</button>
            <button v-if="[Shapes.Rectangle, Shapes.Triangle].includes(shape.shape)" @click="setMode(data.Modes.Height, shape.shapeID)">Height</button>
            <button v-if="[Shapes.Rectangle, Shapes.Triangle].includes(shape.shape)" @click="setMode(data.Modes.Size, shape.shapeID)">Size</button>
            <button v-if="[Shapes.Circle].includes(shape.shape)" @click="setMode(data.Modes.Radius, shape.shapeID)">Radius</button>
            <button v-if="![Shapes.Circle].includes(shape.shape)" @click="setMode(data.Modes.Rotation, shape.shapeID)">Rotation</button>
            <select class="shapeSelect pfpInput" :id="'selectShape' + shape.shapeID" :value="shape.shape" @change="function(event) {
                data.shapes.set(shape.shapeID, shapeFactory(shape, event.target.value, shape.shapeID))
                setMode(data.Modes.Move, shape.shapeID)
            }">
                <option v-for="shapeName in Shapes" :value="Shapes[shapeName]">{{shapeName}}</option>
            </select>
        </div>
      </div>
      <div class="dragSpacing" style="height: 30px; border: 5px solid blue" :data-shapeid="shape.shapeID"></div>
    `,
    props: {
        shape: {
            type: Object
        }
    },
    watch: {
        watchingShape: {
            immediate: true,
            deep: true,
            handler() {
                // not entire sure why i dont have to set shape to data.shapes.get(shape.shapeID)
                drawShapes()
            }
        }
    },
    computed: {
        watchingShape() {
            return data.shapes.get(this.shape.shapeID)
        }
    },
    unmounted() {
        drawShapes()
    }
}