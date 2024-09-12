import {data} from "../data.js";
import {
    canvasWidth,
    deleteShape,
    drawShape,
    drawShapes, duplicateShape, fixShape,
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
            fixing: false
        }
    },
    template: `
      <div class="shapeDiv" ref="shapeDiv" :data-shapeid="shape.shapeID">

        <div :class="{'shapeDivLeftPanel': true, 'active': !currentlyOpen}" ref="leftPanel">
          <button @click="currentlyOpen = !currentlyOpen" class="shapeDivLeftPanelButton">
            {{ currentlyOpen ? '-' : '+' }}
          </button>
          <div class='userPic'
               :style="'clip-path: circle(' + previewSize / 2 + 'px at center); width: ' + previewSize + 'px;'">
            <canvas :width="previewSize" :height="previewSize" ref="shapePreview"></canvas>
          </div>
          <div class="shapeItemHandle shapeDivLeftPanelButton">DRAG</div>
        </div>

        <div class="shapeDivMainPanel">
          <div v-if="currentlyOpen" class="controls">
            <button class="controlButton" @click="deleteShape(shape.shapeID)">Delete</button>
            <button class="controlButton" @click="duplicateShape(shape.shapeID)">Duplicate</button>

            <control-button :shapeid="shape.shapeID" :mode="data.Modes.Location"/>
            <control-button v-if="[Shapes.Rectangle, Shapes.Heart].includes(shape.shape)" :shapeid="shape.shapeID"
                            :mode="data.Modes.Width"/>
            <control-button v-if="[Shapes.Rectangle, Shapes.Heart].includes(shape.shape)" :shapeid="shape.shapeID"
                            :mode="data.Modes.Height"/>
            <control-button v-if="[Shapes.Rectangle].includes(shape.shape)" :shapeid="shape.shapeID"
                            :mode="data.Modes.Size"/>
            <control-button v-if="[Shapes.Circle, Shapes.Star, Shapes.Polygon].includes(shape.shape)" :shapeid="shape.shapeID"
                            :mode="data.Modes.Radius"/>
            <control-button v-if="![Shapes.Circle].includes(shape.shape)" :shapeid="shape.shapeID"
                            :mode="data.Modes.Rotation"/>
            <control-button v-if="[Shapes.Star, Shapes.Polygon].includes(shape.shape)" :shapeid="shape.shapeID"
                            :mode="data.Modes.NumberPoints"/>
            <control-button v-if="[Shapes.Star].includes(shape.shape)" :shapeid="shape.shapeID"
                            :mode="data.Modes.Inset"/>
            <button v-if="[Shapes.Heart].includes(shape.shape)" class="controlButton"
                    @click="shape.symmetry = !shape.symmetry">Symmetry
            </button>
            <control-button v-if="[Shapes.Heart, Shapes.Polygon, Shapes.Points].includes(shape.shape)" :shapeid="shape.shapeID"
                            :mode="data.Modes.ControlPoint"/>
            <div v-if="[Shapes.Heart].includes(shape.shape)" class="shapeDivMainPanelSection">
              <div v-for="n of shape.controlPoints.length/2/(shape.symmetry+1)"
                   v-if="data.mode === data.Modes.ControlPoint" style="display: flex; justify-content: space-between">
                <button @click="shape.selectedCurve = n-1">Curve {{ n }}</button>
                <div v-if="shape.selectedCurve === n-1" style="display: flex">
                  <button @click="shape.selectedPoint = 0" :style="{color: shape.selectedPoint === 0 ? 'red' : null}">
                    Point 1
                  </button>
                  <button @click="shape.selectedPoint = 1" :style="{color: shape.selectedPoint === 1 ? 'red' : null}">
                    Point 2
                  </button>
                </div>
              </div>
            </div>
            <div v-if="[Shapes.Points].includes(shape.shape) && data.mode === data.Modes.ControlPoint" class="shapeDivMainPanelSection">
              <div v-for="n of shape.points.length" style="display: flex; justify-content: space-between">
                <button @click="shape.selectPoint(n)" :style="{color: shape.selectedPoint === n ? 'red' : null}">{{n}}</button>
                <button @click="shape.addPoint(n)">Add point</button>
                <button @click="shape.removePoint(n)">Remove point</button>
              </div>
            </div>
            <div class="sliderRow">
              <label>Color</label>
              <input type="color" class="pfpInput" :value="shape.color"
                     @input="function(event) { data.shapes.get(shape.shapeID).setColor(event.target.value) }">
            </div>
            <div class="sliderRow">
              <label>Shape</label>
              <select class="shapeSelect pfpInput" :id="'selectShape' + shape.shapeID" :value="shape.shape" @change="function(event) {
                data.shapes.set(shape.shapeID, shapeFactory(shape, event.target.value, shape.shapeID))
                setMode(data.Modes.Location, shape.shapeID)
              }">
                <option v-for="shapeName in Shapes" :value="Shapes[shapeName]">{{ shapeName }}</option>
              </select>
            </div>
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
            deep: true,
            handler() {
                // not entire sure why i dont have to set shape to data.shapes.get(shape.shapeID)
                drawShapes()
                this.drawPreview()
                if (!this.fixing) data.shapesDirty = true
                this.fixing = false
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
        fixShape(this.shape.shapeID)
        this.fixing = true
    },
}