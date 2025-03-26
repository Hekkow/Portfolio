import {data} from "./PortfolioData.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <!--      <div style="width: 270px; height: 50px; color: black;">-->
      <!--        Coming soon-->
      <!--      </div>-->
      <iframe style="width: 784px; height: 504px; border-right: 2px solid #b5b5b5; border-bottom: 2px solid #b5b5b5;" :src="gameSrc"
              ref="iframe"></iframe>
    `,
    computed: {
        gameSrc() {
            let file = '/platformer/export/platformer.html'
            let host = window.location.hostname === "localhost" ? `http://localhost:6969${file}` : `https://${window.location.hostname}${file}`
            return host
        }
    },
    mounted() {
        this.app.top = "5%"
        this.app.left = "15%"
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