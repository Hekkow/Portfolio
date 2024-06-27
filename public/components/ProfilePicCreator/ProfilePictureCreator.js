import {data} from "../data.js";
import {canvasHeight, canvasWidth, createShape, drawShape, drawShapes} from "../../ProfilePictureCreation.js";
import {saveProfilePicture} from "../../main.js";
export default {
    methods: {saveProfilePicture, createShape, drawShapes},
    data() {
        return {
            data: data
        }
    },
    template: `
      <div id="profilePicCreatorBackground">
        <div id="profilePicCreatorMainPanel">
          <div id="canvasArea">
            <div id="canvasCircle">
              <canvas width="300" height="300" id="editCanvas"></canvas>
            </div>
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
                if (!data.profilePictureOpen) return
                drawShapes()
            }
        }
    },
    computed: {
        visible() {
            return data.profilePictureOpen
        }
    }
}
