import {data} from "../data.js";
import {drawShapes, shapeFactory, Shapes, currentlyMovingShape, deleteShape} from "../../ProfilePictureCreation.js";

export default {
    methods: {deleteShape, drawShapes, shapeFactory, currentlyMovingShape},
    data() {
        return {
            data: data,
            Shapes: Shapes
        }
    },
    template: `
      <div class="shapeDiv">
        <button @click="currentlyMovingShape(shape.shapeID)">Edit</button>
        <button @click="deleteShape(shape.shapeID)">Delete</button>
        <button onclick="up(shape.shapeID)">^</button>
        <button onclick="down(shape.shapeID)">v</button>
        <div class="sliderRow">
            <label :for="'color'+ shape.shapeID">Color</label>
            <input 
                type="color" 
                :name="'color'+ shape.shapeID" 
                class="colorSlider pfpInput" :value="shape.color" 
                @input="function(event) { data.shapes.get(shape.shapeID).setColor(event.target.value) }"
            >
        </div>
        <button onclick="setModeMove()">Move</button>
        <button v-if="[Shapes.Rectangle, Shapes.Triangle].includes(shape.shape)" onclick="setModeWidth()">Width</button>
        <button v-if="[Shapes.Rectangle, Shapes.Triangle].includes(shape.shape)" onclick="setModeHeight()">Height</button>
        <button v-if="[Shapes.Rectangle, Shapes.Triangle].includes(shape.shape)" onclick="setModeSize()">Size</button>
        <button v-if="[Shapes.Circle].includes(shape.shape)" onclick="setModeRadius()">Radius</button>
        <button v-if="![Shapes.Circle].includes(shape.shape)" onclick="setModeRotation()">Rotation</button>
        <select class="shapeSelect pfpInput" :id="'selectShape' + shape.shapeID" :value="shape.shape" @change="function(event) {
            data.shapes.set(shape.shapeID, shapeFactory(shape, event.target.value, shape.shapeID))
        }">
            <option v-for="shapeName in Shapes" :value="Shapes[shapeName]">{{shapeName}}</option>
        </select>
      </div>
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
                console.log('drawing shape', this.shape.shapeID)
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
        console.log('awd')
        drawShapes()
    }
}