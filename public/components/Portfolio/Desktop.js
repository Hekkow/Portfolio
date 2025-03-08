import {data} from "./PortfolioData.js";
import app from "./App.js";
export default {
    data() {
        return {
            data: data,

        }
    },
    template: `
      <div id="desktop">
        <desktop-shortcut v-for="(app, id) in Object.fromEntries(data.desktopApps)" :key="id" :ref="id" :app="app" :shortcut-id="id" :data-shortcut-id="id" @dropped="dropped"></desktop-shortcut>
        <keep-alive>
            <app v-for="app in data.openApps" :key="app.name"  :app="app" v-show="!app.minimized"></app>
        </keep-alive>
        <start-menu v-show="data.startMenuOpen"/>
      </div>
    `,
    computed: {
        openApps() {
            return Array.from(data.openApps).filter(a => !a.minimized)
        },
    },
    methods: {
        dropped(dropping, droppedOn) {
            this.$refs[droppedOn][0].dropped(dropping)
        }
    }
}