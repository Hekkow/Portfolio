import {data} from "../data.js";
import {
    createShape,
    drawShapes, setupProfilePicCreator,
    Shapes,
} from "../../ProfilePictureCreation.js";
import {saveProfilePicture} from "../../chat.js";
export default {
    methods: {saveProfilePicture, createShape, drawShapes},
    data() {
        return {
            data: data,
            Shapes: Shapes,
            vertical: [data.Modes.Height, data.Modes.Size, data.Modes.Move, data.Modes.ControlPoint],
            horizontal: [data.Modes.Width, data.Modes.Size, data.Modes.Move, data.Modes.ControlPoint, data.Modes.Rotate, data.Modes.Radius, data.Modes.NumberPoints, data.Modes.Inset],
        }
    },
    template: `
      <div id="profilePicCreatorMainPanel">
        <div id="canvasArea">
          <div id="canvasAreaCentered">
            <div id="canvasAreaTop" class="canvasAreaRow">
              <div v-if="showArrows && vertical.includes(data.mode)"><icon :icon="'Up'"/></div>
            </div>

            <div id="canvasAreaMiddle" class="canvasAreaRow">
              <div class="canvasAreaColumn">
                <div v-if="showArrows && horizontal.includes(data.mode)"><icon :icon="'Left'"/></div>
              </div>
              <div id="canvasCircle">
                <canvas width="300" height="300" id="editCanvas"></canvas>
              </div>
              <div class="canvasAreaColumn">
                <div v-if="showArrows && horizontal.includes(data.mode)"><icon :icon="'Right'"/></div>
              </div>
            </div>

            <div id="canvasAreaBottom" class="canvasAreaRow">
              <div v-if="showArrows && vertical.includes(data.mode)"><icon :icon="'Down'"/></div>
            </div>

          </div>
        </div>

        <div id="controlPanel">
          <div class="bothSideRow" style="border-bottom: var(--border) var(--main-color)">
            <button class="settingsButton spreadRowButton" @click="createShape()"><icon icon="Add"/> Create new shape</button>
            <button class="settingsButton spreadRowButton" @click="saveProfilePicture()"><icon icon="Save"/> Save profile picture</button>
          </div>
          
          <shapes-list/>
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
