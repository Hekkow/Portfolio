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
            previewSize: 40,
            fixing: false
        }
    },
    template: `
      <div class="shapeDiv" ref="shapeDiv" :data-shapeid="shape.shapeID">

        <div :class="{'shapeDivLeftPanel': true, 'active': !currentlyOpen}" ref="leftPanel">
          <button @click="currentlyOpen = !currentlyOpen" class="shapeDivLeftPanelButton">
            <icon :icon="currentlyOpen ? 'Minus' : 'Add'"/>
          </button>
          <div class="shapeDivLeftPanelButton">
            <div class='userPic'
                 :style="'clip-path: circle(' + previewSize / 2 + 'px at center); width: ' + previewSize + 'px;'">
              <canvas :width="previewSize" :height="previewSize" ref="shapePreview"></canvas>
            </div>
          </div>

          <div class="shapeItemHandle shapeDivLeftPanelButton">
            <icon :icon="'Drag'"/>
          </div>
        </div>

        <div class="shapeDivMainPanel">
          <div v-if="currentlyOpen" class="controls">
            <button class="controlButton" @click="deleteShape(shape.shapeID)">
              <icon :icon="'Delete'"/>
              Delete
            </button>
            <button class="controlButton" @click="duplicateShape(shape.shapeID)">
              <icon :icon="'Duplicate'"/>
              Duplicate
            </button>

            <control-button :shapeid="shape.shapeID" :mode="data.Modes.Move"/>
            <control-button v-if="[Shapes.Rectangle, Shapes.Heart].includes(shape.shape)" :shapeid="shape.shapeID"
                            :mode="data.Modes.Width"/>
            <control-button v-if="[Shapes.Rectangle, Shapes.Heart].includes(shape.shape)" :shapeid="shape.shapeID"
                            :mode="data.Modes.Height"/>
            <control-button v-if="[Shapes.Rectangle].includes(shape.shape)" :shapeid="shape.shapeID"
                            :mode="data.Modes.Size"/>
            <control-button v-if="[Shapes.Circle, Shapes.Star, Shapes.Polygon].includes(shape.shape)"
                            :shapeid="shape.shapeID"
                            :mode="data.Modes.Radius"/>
            <control-button v-if="![Shapes.Circle].includes(shape.shape)" :shapeid="shape.shapeID"
                            :mode="data.Modes.Rotate"/>
            <control-button v-if="[Shapes.Star, Shapes.Polygon].includes(shape.shape)" :shapeid="shape.shapeID"
                            :mode="data.Modes.NumberPoints"/>
            <control-button v-if="[Shapes.Star].includes(shape.shape)" :shapeid="shape.shapeID"
                            :mode="data.Modes.Inset"/>
            <button v-if="[Shapes.Heart].includes(shape.shape)" :class="{controlButton: true, selectedButton: shape.symmetry}"
                    @click="shape.symmetry = !shape.symmetry"><icon icon="Symmetry" :space="true"/>Symmetry
            </button>
            <control-button v-if="[Shapes.Heart, Shapes.Points].includes(shape.shape)" :shapeid="shape.shapeID"
                            :mode="data.Modes.ControlPoint" @click="shape.selectPoint(1)"/>
            <div v-if="[Shapes.Heart].includes(shape.shape)" class="shapeDivMainPanelSection">
              <div v-for="n of shape.controlPoints.length/2/(shape.symmetry+1)"
                   v-if="data.mode === data.Modes.ControlPoint" class="bothSideRow">
                <button @click="shape.selectCurve(n)"
                        :class="{selectedButton: shape.selectedCurve === n-1, shapeItemButton: true}">Curve {{ n }}
                </button>
                <div v-if="shape.selectedCurve === n-1" style="display: flex">
                  <button v-for="i of 2" @click="shape.selectPoint(i)"
                          :class="{selectedButton: shape.selectedPoint === i-1, shapeItemButton: true}">Point {{ i }}
                  </button>
                </div>
              </div>
            </div>
            <div v-if="[Shapes.Points].includes(shape.shape) && data.mode === data.Modes.ControlPoint"
                 class="shapeDivMainPanelSection">
              <div v-for="n of shape.points.length" class="bothSideRow">
                <button @click="shape.selectPoint(n)"
                        :class="{selectedButton: shape.selectedPoint === n, shapeItemButton: true}">Point {{ n }}
                </button>
                <div>
                  <button @click="shape.addPoint(n)" class="shapeItemButton"><icon icon="Add" :space="true"/>Add</button>
                  <button @click="shape.removePoint(n)" class="shapeItemButton"><icon icon="Delete" :space="true"/>Remove</button>
                </div>

              </div>
            </div>
            <div class="sliderRow">
              <icon icon="Color" :space="true"/><label>Color</label>
              <input type="color" class="pfpInput" :value="shape.color"
                     @input="function(event) { shape.setColor(event.target.value) }">
            </div>
            <div class="sliderRow">
              <icon icon="Shape" :space="true"/><label>Shape</label>
              <select class="shapeSelect pfpInput" :id="'selectShape' + shape.shapeID" :value="shape.shape" @change="function(event) {
                data.shapes.set(shape.shapeID, shapeFactory(shape, event.target.value, shape.shapeID))
                setMode(data.Modes.Move, shape.shapeID)
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
        shape: {
            deep: true,
            immediate: true,
            handler() {
                drawShapes()
                this.drawPreview()
                data.shapesDirty = true
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