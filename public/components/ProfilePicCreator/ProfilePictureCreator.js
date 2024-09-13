import {data} from "../data.js";
import {
    createShape,
    drawShapes, setupProfilePicCreator,
    Shapes,
} from "../../ProfilePictureCreation.js";
import {saveProfilePicture} from "../../main.js";
export default {
    methods: {saveProfilePicture, createShape, drawShapes, },
    data() {
        return {
            data: data,
            Shapes: Shapes,
            vertical: [data.Modes.Height, data.Modes.Size, data.Modes.Location, data.Modes.ControlPoint],
            horizontal: [data.Modes.Width, data.Modes.Size, data.Modes.Location, data.Modes.ControlPoint, data.Modes.Rotation, data.Modes.Radius, data.Modes.NumberPoints, data.Modes.Inset],
        }
    },
    template: `
        <div id="profilePicCreatorMainPanel">
          <div id="canvasArea">
            <div id="canvasAreaCentered">
              <div id="canvasAreaTop" class="canvasAreaRow"><div v-if="showArrows && vertical.includes(data.mode)">+</div></div>

              <div id="canvasAreaMiddle" class="canvasAreaRow">
                <div class="canvasAreaColumn">
                  <div v-if="showArrows && horizontal.includes(data.mode)">-</div>
                </div>
                <div id="canvasCircle"><canvas width="300" height="300" id="editCanvas"></canvas></div>
                <div class="canvasAreaColumn">
                  <div v-if="showArrows && horizontal.includes(data.mode)">+</div>
                </div>
              </div>

              <div id="canvasAreaBottom" class="canvasAreaRow"><div  v-if="showArrows && vertical.includes(data.mode)">-</div></div>

            </div>
        </div>
            
          <div id="controlPanel">
            <button id="createShapeButton" @click="createShape()">Create new shape</button>
            <button id="saveButton" @click="saveProfilePicture()">Save profile picture</button>
            <shapes-list></shapes-list>
          </div>
        </div>
    `,
    updated() {
        if (data.openSettings !== data.settingsTabs.ProfilePic || data.userID === -1) return
        drawShapes()
    },
    mounted() {
        setupProfilePicCreator()
        drawShapes()
    },
    computed: {
        showArrows() {
            return data.shapes.size > 0
        },
    }
}
