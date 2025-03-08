import {data} from "./PortfolioData.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div id="computer">
        <desktop v-if="!data.phone"/>
        <taskbar v-if="!data.phone"/>
        <div v-if="data.phone" class="ifMobile">
          Please visit the site on desktop.
        </div>
      </div>
    `,
}