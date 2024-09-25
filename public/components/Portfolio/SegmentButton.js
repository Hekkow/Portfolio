import {openLink} from "../../index.js";

export default {
    template: `
        <button class="segmentButton" style="height: 70px;" @mouseenter="moveAway" ref="button" @click="openLink(link)">
            <img :src="imageSrc" style="max-height: 70px; margin-left: -30px;">
          <span style="margin-left: 10px;"><slot/></span>
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
        moveAway() {
            let randomX = this.random(-20, 20)
            let randomY = this.random(-20, 10)
            let rotation = this.random(-10, 10)
            let newTransform =  'translate(' + randomX + 'px, ' + randomY + 'px) rotate(' + rotation + 'deg)'
            $(this.$refs.button).css('transform', newTransform)
        },
        random(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min
        }
    }
}
