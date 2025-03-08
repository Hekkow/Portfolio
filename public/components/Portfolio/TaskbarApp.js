import {data} from "./PortfolioData.js";
import {openApp, toggleMinimizeApp} from "../../index.js";
export default {
    methods: {openApp, toggleMinimizeApp},
    data() {
        return {
            data: data,
        }
    },
    template: `
        <button :class="{'taskbar-app': true, 'active': data.appOrder[0] === app && !app.minimized}" @click="toggleMinimizeApp(app)">
          <div class="taskbar-app-icon">
            <img class="taskbar-app-icon-img" :src="'../../Images/' + app.icon +'-taskbar.png'" alt=""/>
<!--            {{ app.name }}-->
          </div>
        </button>
    `,
    props: {
        app: Object,
    }
}