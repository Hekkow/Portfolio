import {animateObjectAway, animateObjectBack, random} from "../../index.js";

export default {
    data() {
        return {
            direction: null,
            animating: false,
        }
    },
    template: `
      <div class="theHANDContainer" ref="theHANDContainer" :id="newID + 'hand'" style="left: 100vw; top: -100vh">
        <img class="theHAND" ref="theHAND" src="../../Images/theHAND.png"/>
      </div>
      <p class="slideshowText drawnBorder" :style="{zIndex: z}" :id="newID" ref="text">
        {{ text }}
      </p>
    `,
    props: {
        text: {
            type: String,
        },
        z: {
            type: Number,
        },
        newID: {
            type: String,
        }
    },
    methods: {
        animateBack() {
            this.animating = true
            this.$refs.text.style.display = 'block'
            animateObjectBack(this.$refs.text, this.$refs.theHAND, this.$refs.theHANDContainer, this.direction).then(_ => {
                this.animating = false
            })
        },
        animateAway() {
            this.animating = true
            this.direction = [0, 0]
            let index = random(0, 1);
            this.direction[index] = index === 0 ? [-1, 1][random(0, 1)] : -1
            animateObjectAway(this.$refs.text, this.$refs.theHAND, this.$refs.theHANDContainer, this.direction).then(direction => {
                this.$refs.text.style.display = 'none'
                this.animating = false
                this.direction = direction
            })
        },
    },
}