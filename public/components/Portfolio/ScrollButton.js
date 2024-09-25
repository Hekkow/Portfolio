import {data} from "./PortfolioData.js";
import {scrollToPanel} from "../../index.js";

export default {
    methods: {scrollToPanel},
    data() {return {data: data}},
    template: `
        <button :class="{scrollMenuButton: true, selected: data.activePanel === panelNumber}" @click="scrollToPanel(panelNumber)"></button>
    `,
    props: {
        panelNumber: {}
    }
}
