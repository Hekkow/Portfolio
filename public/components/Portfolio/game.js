import {data} from "./PortfolioData.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div style="width: 270px; height: 50px; color: black;">
        Coming soon
      </div>
<!--        <iframe style="width: 500px; height: 500px;" src="http://localhost:6969/new-game-project/export/New%20Game%20Project.html" ref="iframe"></iframe>-->
    `,
    mounted() {
        this.app.top = "20%"
        this.app.left = "30%"
    },
    props: {
        app: Object,
        active: Boolean,
    },
    watch: {
        active(activeNow) {
            // if (activeNow) {
            //     this.$nextTick(() => {
            //         $(this.$refs.iframe.contentWindow.document).find('canvas').focus()
            //     })
            // }
        }
    }
}