import {data} from "./PortfolioData.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div id="image-viewer">
        <img v-if="data.openImage" class="image-viewer-image" :src="'../../' + data.openImage">
      </div>
    `,
    mounted() {
        this.app.top = "0"
        this.app.left = "0"
    },
    props: {
        app: Object,
    },
}