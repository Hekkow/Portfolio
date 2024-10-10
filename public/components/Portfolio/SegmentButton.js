import {openLink} from "../../index.js";
import {data} from "./PortfolioData.js";

export default {
    data() {return {
        data: data,
        currentX: 0,
        currentY: 0,
        rotation: 0,
        mouseEntered: false,
    }},
    template: `
      <button class="segmentButtonOuter" @click="openLink(link)" style="width: 100%; height: 100px;">
        <div class="segmentButton drawnBorder" style="height: 70px; width: 100%" ref="button"
             @mouseleave="this.mouseEntered = false">
          <div class="segmentButtonHovers">
            <template v-for="i in [1, 0, -1]">
              <div class="segmentButtonHoverArea" v-for="j in [1, 0, -1]" @mouseenter="moveAway($event, i, j)"></div>
            </template>
          </div>
          <img :src="imageSrc" style="max-height: 70px">
          <span style="margin-left: 10px;"><slot/></span>
        </div>
      </button>

    `,
    props: {
        imageSrc: {
            type: String,
            default: ''
        },
        link: {}
    },
    methods: {
        openLink,
        moveAway(event, i, j) {
            if (this.mouseEntered) return
            this.mouseEntered = true
            let button = $(this.$refs.button)
            let pushAmount = 15
            let rotateAmount = 10
            this.currentY += i * pushAmount * this.random(1, 2)
            this.currentX += j * pushAmount * this.random(1, 2)
            this.rotation += this.random(-rotateAmount, rotateAmount)
            let newTransform =  'translate(' + this.currentX + 'px, ' + this.currentY + 'px) rotate(' + this.rotation + 'deg)'
            button.css('transform', newTransform)
        },
        random(min, max) {
            return Math.random() * (max - min + 1) + min
        },
    }
}
