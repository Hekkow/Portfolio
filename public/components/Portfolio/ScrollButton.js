import {data} from "./PortfolioData.js";
export default {
    data() {return {data: data}},
    template: `
        <button :class="{scrollMenuButton: true, selected: data.activePanel === panelNumber}" @click="data.activePanel = panelNumber"></button>
    `,
    props: {
        panelNumber: {}
    }
}
