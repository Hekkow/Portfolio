import {data} from "../data.js";
import {
    canvasWidth,
    deleteShape,
    drawShape,
    drawShapes, duplicateShape,
    setMode,
    shapeFactory,
    Shapes
} from "../../ProfilePictureCreation.js";

export default {
    methods: {
        duplicateShape,
        deleteShape, drawShapes, shapeFactory, setMode,
        drawPreview() {
            if (this.$refs.shapePreview) {
                drawShape(this.$refs.shapePreview.getContext('2d'), this.shape, canvasWidth/parseFloat($(this.$refs.shapePreview).attr('width')), true)
            }
        },
    },
    data() {
        return {
            data: data,
            Shapes: Shapes,
            currentlyOpen: true,
            previewSize: 50,
        }
    },
    template: `
      <div class="shapeDiv" ref="shapeDiv" :data-shapeid="shape.shapeID">
        
        <div :class="{'shapeDivLeftPanel': true, 'active': !currentlyOpen}" ref="leftPanel">
          <button @click="currentlyOpen = !currentlyOpen" class="shapeDivLeftPanelButton">+</button>
          <div class='userPic' :style="'clip-path: circle(' + previewSize / 2 + 'px at center); width: ' + previewSize + 'px;'">
            <canvas :width="previewSize" :height="previewSize" ref="shapePreview"></canvas>
          </div>
          <div class="shapeItemHandle shapeDivLeftPanelButton">DRAG</div>
          <button class="shapeDivLeftPanelButton">{{shape.z}}</button>
          <button class="shapeDivLeftPanelButton">ID: {{shape.shapeID}}</button>
        </div>
        
        <div class="shapeDivMainPanel">
          <div v-if="currentlyOpen" class="controls">
            <button @click="deleteShape(shape.shapeID)">Delete</button>
            <button @click="duplicateShape(shape.shapeID)">Duplicate</button>
            <div class="sliderRow">
              <label>Color</label>
              <input type="color" class="pfpInput" :value="shape.color" @input="function(event) { data.shapes.get(shape.shapeID).setColor(event.target.value) }">
            </div>
            <button @click="setMode(data.Modes.Move, shape.shapeID)">Move</button>
            <div class="shapeDivMainPanelSection" v-if="[Shapes.Rectangle, Shapes.Triangle].includes(shape.shape)">
              <button @click="setMode(data.Modes.Width, shape.shapeID)">Width</button>
              <button @click="setMode(data.Modes.Height, shape.shapeID)">Height</button>
              <button  @click="setMode(data.Modes.Size, shape.shapeID)">Size</button>
            </div>
            
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
                drawShapes()
                this.drawPreview()
            }
        },
    },
    computed: {
        watchingShape() {
            return data.shapes.get(this.shape.shapeID)
        },
    },
    unmounted() {
        drawShapes()
    },
    mounted() {
        this.drawPreview()
    },
}