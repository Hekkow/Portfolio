import {data} from "./PortfolioData.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div id="image-viewer">
        <video v-if="data.openImage && video" class="image-viewer-image" style="max-height: 20%; max-width: 90%;" controls>
          <source :src="'../../' + data.openImage">
        </video>
        <img v-if="data.openImage && !video" class="image-viewer-image" :src="'../../' + data.openImage">
      </div>
    `,
    mounted() {
        this.app.top = "0"
        this.app.left = "0"
    },
    computed: {
        video() {
            let s = data.openImage.split('.')
            return s[s.length-1] === 'mp4'
        }
    },
    props: {
        app: Object,
    },
}