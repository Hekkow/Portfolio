import {data} from "../data.js";
import {
    drawShapes,
    shapeFactory,
    Shapes,
    currentlyMovingShape,
    deleteShape,
    Modes,
    setMode,
    up, down
} from "../../ProfilePictureCreation.js";

export default {
    methods: {down, up, deleteShape, drawShapes, shapeFactory, currentlyMovingShape, setMode},
    data() {
        return {
            data: data,
            Shapes: Shapes,
            Modes: Modes
        }
    },
    template: `
      <div class="shapeDiv">
        <button @click="currentlyMovingShape(shape.shapeID)">Edit</button>
        <button @click="deleteShape(shape.shapeID)">Delete</button>
        <button @click="up(shape.shapeID)">^</button>
        <button @click="down(shape.shapeID)">v</button>
        <div class="sliderRow">
            <label :for="'color'+ shape.shapeID">Color</label>
            <input 
                type="color" 
                :name="'color'+ shape.shapeID" 
                class="colorSlider pfpInput" :value="shape.color" 
                @input="function(event) { data.shapes.get(shape.shapeID).setColor(event.target.value) }"
            >
        </div>
        <button @click="setMode(Modes.Move)">Move</button>
        <button v-if="[Shapes.Rectangle, Shapes.Triangle].includes(shape.shape)" @click="setMode(Modes.Width)">Width</button>
        <button v-if="[Shapes.Rectangle, Shapes.Triangle].includes(shape.shape)" @click="setMode(Modes.Height)">Height</button>
        <button v-if="[Shapes.Rectangle, Shapes.Triangle].includes(shape.shape)" @click="setMode(Modes.Size)">Size</button>
        <button v-if="[Shapes.Circle].includes(shape.shape)" @click="setMode(Modes.Radius)">Radius</button>
        <button v-if="![Shapes.Circle].includes(shape.shape)" @click="setMode(Modes.Rotation)">Rotation</button>
        <select class="shapeSelect pfpInput" :id="'selectShape' + shape.shapeID" :value="shape.shape" @change="function(event) {
            data.shapes.set(shape.shapeID, shapeFactory(shape, event.target.value, shape.shapeID))
            setMode(Modes.Move)
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
                console.log(data.shapes.get(this.shape.shapeID))
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