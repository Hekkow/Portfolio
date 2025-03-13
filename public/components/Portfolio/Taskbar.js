import {data} from "./PortfolioData.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div id="taskbar">
        <div id="start-menu-button" @click="toggleStartMenu" @mousedown.stop></div>
        <div id="taskbar-apps">
          <taskbar-app v-for="app in data.openApps" :app="app" />
        </div>
        <system-tray/>
      </div>
    `,
    methods: {
        toggleStartMenu() {
            data.startMenuOpen = !data.startMenuOpen
        }
    }
}