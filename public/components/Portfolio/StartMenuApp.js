import {data} from "./PortfolioData.js";
import {openApp} from "../../index.js";
export default {
    methods: {
        openApp,
        startMenuClicked() {
            this.openApp(this.app)
            data.startMenuOpen = false
        }

    },
    data() {
        return {
            data: data,
        }
    },
    template: `
        <div class="start-menu-app" @click="startMenuClicked">
          <div class="start-menu-app-icon">
            <img class="start-menu-app-icon-img" :src="'../../Images/' + app.icon + '-taskbar.png'" alt=""/>
          </div>
          <div class="start-menu-app-text">
            {{app.name}}
          </div>
        </div>
    `,
    props: {
        app: Object,
    }
}