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
          <button @click="currentlyOpen = !currentlyOpen" class="shapeDivLeftPanelButton">{{ currentlyOpen ? '-' : '+' }}</button>
          <div class='userPic' :style="'clip-path: circle(' + previewSize / 2 + 'px at center); width: ' + previewSize + 'px;'">
            <canvas :width="previewSize" :height="previewSize" ref="shapePreview"></canvas>
          </div>
          <div class="shapeItemHandle shapeDivLeftPanelButton">DRAG</div>
        </div>
        
        <div class="shapeDivMainPanel">
          <div v-if="currentlyOpen" class="controls">
          <slider-row>
            <button @click="deleteShape(shape.shapeID)">Delete</button>
            <button @click="duplicateShape(shape.shapeID)">Duplicate</button>
          </slider-row>
            
          <slider-row>
            <label>Color</label>
            <input type="color" class="pfpInput" :value="shape.color" @input="function(event) { data.shapes.get(shape.shapeID).setColor(event.target.value) }">
          </slider-row>
            <slider-row :shapeid="shape.shapeID" :mode="data.Modes.Move"/>
            <div class="shapeDivMainPanelSection" v-if="[Shapes.Rectangle, Shapes.Triangle].includes(shape.shape)">
              <slider-row :shapeid="shape.shapeID" :mode="data.Modes.Width"/>
              <slider-row :shapeid="shape.shapeID" :mode="data.Modes.Height"/>
              <slider-row :shapeid="shape.shapeID" :mode="data.Modes.Size"/>
            </div>
            <slider-row v-if="[Shapes.Circle].includes(shape.shape)" :shapeid="shape.shapeID" :mode="data.Modes.Radius"/>
            <slider-row v-if="![Shapes.Circle].includes(shape.shape)" :shapeid="shape.shapeID" :mode="data.Modes.Rotation"/>
            <slider-row>
              <select class="shapeSelect pfpInput" :id="'selectShape' + shape.shapeID" :value="shape.shape" @change="function(event) {
                data.shapes.set(shape.shapeID, shapeFactory(shape, event.target.value, shape.shapeID))
                setMode(data.Modes.Move, shape.shapeID)
              }">
                <option v-for="shapeName in Shapes" :value="Shapes[shapeName]">{{shapeName}}</option>
              </select>
            </slider-row>
            
            
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