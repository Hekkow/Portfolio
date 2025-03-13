import {data} from "./PortfolioData.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div>
        
      </div>
    `,
    mounted() {
        this.app.top = "10%"
        this.app.left = "28%"
    },
    props: {
        app: Object,
    },
    methods: {
    },
    computed: {
    },
}