import {data} from "../data.js";
import {
    drawShapes,
    shapeFactory,
    Shapes,
    currentlyMovingShape,
    deleteShape,
    setMode,
    up, down, startDragShapeItem, drawShape, canvasWidth, getDraggingZ
} from "../../ProfilePictureCreation.js";

export default {
    methods: {
        startDragShapeItem, down, up, deleteShape, drawShapes, shapeFactory, currentlyMovingShape, setMode,
        drawPreview() {
            if (this.$refs.shapePreview) {
                drawShape(this.$refs.shapePreview.getContext('2d'), this.shape, canvasWidth/parseFloat($(this.$refs.shapePreview).attr('width')), true)
            }
        }
    },
    data() {
        return {
            data: data,
            Shapes: Shapes,
            currentlyOpen: true,
            previewSize: 20
        }
    },
    template: `
      <div class="dragSpacing" :style="{height: '30px', border: '5px solid ' + shape.color}" :data-shapeid="shape.shapeID" v-if="showTopDrag"></div>
      <div class="shapeDiv" ref="shapeDiv">
        <div class='userPic' :style="'clip-path: circle(' + previewSize / 2 + 'px at center); width: ' + previewSize + 'px;'">
          <canvas :width="previewSize" :height="previewSize" ref="shapePreview"></canvas>
        </div>
        <button @click="currentlyOpen = !currentlyOpen">+</button>
        <button>{{shape.z}}</button>
<!--        <button @click="up(shape.shapeID)">^</button>-->
<!--        <button @click="down(shape.shapeID)">v</button>-->
        <button @click="function(event) { 
            if (!data.draggingShapeItem) {
                startDragShapeItem($refs.shapeDiv, event)
            }}" class="dragDiv" :data-shapeid="shape.shapeID">DRAG</button>
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
      <div class="dragSpacing" :style="{height: '30px', border: '10px solid ' + shape.color}" :data-shapeid="shape.shapeID" v-if="showBottomDrag"></div>
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
                this.drawPreview()
            }
        }
    },
    computed: {
        watchingShape() {
            return data.shapes.get(this.shape.shapeID)
        },
        showTopDrag() {
            return data.draggingShapeItem && getDraggingZ() >= this.shape.z
        },
        showBottomDrag() {
            return data.draggingShapeItem && getDraggingZ() < this.shape.z
        }
    },
    unmounted() {
        drawShapes()
    },
    mounted() {
        this.drawPreview()
    }
}