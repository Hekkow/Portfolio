import {animateObjectAway, animateObjectBack, random} from "../../index.js";
export default {
    data() {
        return {
            direction: null,
            animating: false,
        }
    },
    template: `
      <div class="theHANDContainer" ref="theHANDContainer" style="left: 100vw; top: -100vh" :id="newID + 'hand'">
        <img class="theHAND" ref="theHAND" src="../../Images/theHAND.png"/>
      </div>
      <img
          class="slideshowImage drawnBorder"
          :src="'Images/' + image"
          :title="text"
          ref="image"
          :style="{zIndex: z}"
          :id="newID"
      />
    `,
    props: {
        image: {
            type: String,
        },
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
            animateObjectBack(this.$refs.image, this.$refs.theHAND, this.$refs.theHANDContainer, this.direction).then(_ => {
                this.animating = false
            })
        },
        animateAway() {
            this.animating = true
            this.direction = [0, 0]
            let index = random(0, 1)
            this.direction[index] = index === 0 ? [-1, 1][random(0, 1)] : 1
            animateObjectAway(this.$refs.image, this.$refs.theHAND, this.$refs.theHANDContainer, this.direction).then(direction => {
                this.animating = false
                this.direction = direction
            })
        },

    },
}