import {data} from "./PortfolioData.js";
export default {
    data() {return {data: data}},
    template: `
        <div id="scrollMenu">
            <scroll-button v-for="n in data.numberPanels" :panelNumber="n-1">{{n-1}}</scroll-button>
        </div>
    `,
}
