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
    `,
    mounted() {
        this.app.top = "20%"
        this.app.left = "30%"
    },
    props: {
        app: Object,
    },
}