import {data} from "../data.js";
import {
    createShape,
    drawShapes,
    Shapes,
} from "../../ProfilePictureCreation.js";
import {saveProfilePicture} from "../../main.js";
export default {
    methods: {saveProfilePicture, createShape, drawShapes, },
    data() {
        return {
            data: data,
            Shapes: Shapes,
        }
    },
    template: `
      <div id="profilePicCreatorBackground">
        <div id="profilePicCreatorMainPanel">
          <div id="canvasArea">
            
            <div id="canvasAreaTop" class="canvasAreaRow"><button v-if="showArrows && [data.Modes.Height, data.Modes.Size, data.Modes.Move].includes(data.mode)">+</button></div>
            
            <div id="canvasAreaMiddle" class="canvasAreaRow">
              <div class="canvasAreaColumn">
                <button v-if="showArrows && [data.Modes.Width, data.Modes.Size, data.Modes.Move, data.Modes.Rotation, data.Modes.Radius].includes(data.mode)">-</button>
                
              </div>
              <div id="canvasCircle"><canvas width="300" height="300" id="editCanvas"></canvas></div>
              <div class="canvasAreaColumn">
              
                <button v-if="showArrows && [data.Modes.Width, data.Modes.Size, data.Modes.Move, data.Modes.Rotation, data.Modes.Radius].includes(data.mode)">+</button>
              </div>
            </div>
            
            <div id="canvasAreaBottom" class="canvasAreaRow"><button  v-if="showArrows && [data.Modes.Height, data.Modes.Size, data.Modes.Move].includes(data.mode)">-</button></div>
            
          </div>
          <div id="controlPanel">
            <button id="createShapeButton" @click="createShape()">Create new shape</button>
            <button id="saveButton" @click="saveProfilePicture()">Save profile picture</button>
            <shapes-list></shapes-list>
          </div>
        </div>
      </div>
    `,
    watch: {
        visible: {
            immediate: true,
            handler() {
                if (!data.profilePictureOpen || data.userID === -1) return
                drawShapes()
            }
        }
    },
    computed: {
        showArrows() {
            return data.shapes.size > 0
        },
        visible() {
            return data.profilePictureOpen
        }
    }
}
