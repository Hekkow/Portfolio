import {data} from "./PortfolioData.js";
export default {
    methods: {

    },
    data() {
        return {
            data: data,
        }
    },
    template: `
        <div id="start-menu" @mousedown.stop>
            <div id="start-menu-apps" @mousedown.stop>
              <start-menu-app v-for="app in data.allApps" :app="app"></start-menu-app>
            </div>
        </div>
    `,
    mounted() {
        $("#computer").mousedown(() => {
            data.startMenuOpen = false
        })
        // document.addEventListener("mousedown", () => )
    }
}