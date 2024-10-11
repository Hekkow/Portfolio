import {data} from "./PortfolioData.js";
import {random, rotateAway, rotateBack} from "../../index.js";
export default {

    data() {
        return {
            data: data,
            panelNumber: -1,
        }
    },
    template: `
        <div class="panel drawnBorder" ref="panel">
            <div class="theHANDContainer" ref="theHANDContainer" style="left: 100vw; top: -100vh">
                <img class="theHAND" ref="theHAND" src="../../Images/theHAND.png"/>
              </div>
          <!-- removing down -->
            <slot/>
        </div>
    `,
    watch: {
        'data.currentPanel': {
            handler(newValue, oldValue) {
                this.ruffle(newValue, oldValue)
            }
        },
    },
    methods: {
        ruffle(newValue, oldValue) {
            if (this.panelNumber === data.currentPanel) {
                rotateBack(this.$refs.panel)
            }
            if (this.panelNumber === data.currentPanel + 1 && oldValue > newValue) {
                rotateAway(this.$refs.panel)
            }
        },

    },
    mounted() {
        this.$nextTick(() => {
            let siblings = this.$el.parentNode.children
            let index = siblings.length - Array.from(siblings).findIndex(child => child === this.$el)
            this.$el.style.zIndex = index
            this.$refs.panel.id = 'panel' + index
            this.panelNumber = siblings.length - index
            if (this.panelNumber > 0) rotateAway(this.$refs.panel)
        })
    }
}