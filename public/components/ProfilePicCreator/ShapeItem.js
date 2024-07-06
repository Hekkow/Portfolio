import {data} from "../data.js";
import {
    canvasWidth,
    currentlyMovingShape,
    deleteShape,
    drawShape,
    drawShapes,
    setMode,
    shapeFactory,
    Shapes
} from "../../ProfilePictureCreation.js";

export default {
    methods: {
        deleteShape, drawShapes, shapeFactory, currentlyMovingShape, setMode,
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
            currentlyOpen: false,
            previewSize: 50,
        }
    },
    template: `
      <div class="shapeDiv" ref="shapeDiv" :data-shapeid="shape.shapeID">
        <div class="shapeDivLeftPanel active" ref="leftPanel">
          <div class='userPic' :style="'clip-path: circle(' + previewSize / 2 + 'px at center); width: ' + previewSize + 'px;'">
            <canvas :width="previewSize" :height="previewSize" ref="shapePreview"></canvas>
          </div>
          <button @click="function() {
              currentlyOpen = !currentlyOpen
              $refs.leftPanel.classList.toggle('active')
          }" class="shapeDivLeftPanelButton">+</button>
          <button class="shapeDivLeftPanelButton">{{shape.z}}</button>
          <button class="shapeDivLeftPanelButton">ID: {{shape.shapeID}}</button>
          <div class="shapeItemHandle shapeDivLeftPanelButton">DRAG</div>
        </div>
        <div class="shapeDivMainPanel">
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
        // orderChanged: {
        //     handler() {
        //         this.$nextTick(() => {
        //             let arr = Array.from(this.$refs.shapeDiv.parentElement.children)
        //             let index = arr.findIndex(child => child === this.$refs.shapeDiv)
        //             data.shapes.get(this.shape.shapeID).z = arr.length - 1 - index
        //         })
        //     }
        // }
    },
    computed: {
        watchingShape() {
            return data.shapes.get(this.shape.shapeID)
        },
        orderChanged() {
            return data.shapeItemsOrderUpdated
        }
    },
    unmounted() {
        drawShapes()
    },
    mounted() {
        this.drawPreview()
    },
}