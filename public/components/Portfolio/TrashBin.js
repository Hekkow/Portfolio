import {data} from "./PortfolioData.js";
export default {
    data() {
        return {
            data: data,
            updateDeleted: 0,
        }
    },
    template: `
      <div id="trash-bin" style="width: 500px; height: 500px;">
        <img v-for="(app, id) in deletedApps" :src="'../../Images/' + app.icon + '-taskbar.png'" @click="bringBackApp(app, id)"/>
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
        bringBackApp(app, id) {
            id = parseInt(id)
            this.app.deleted.delete(id)
            data.desktopApps.set(id, app)
            this.updateDeleted++
        }
    },
    computed: {
        deletedApps() {
            this.updateDeleted;
            if (!this.app.deleted) {
                this.app.deleted = new Map()
            }
            return Object.fromEntries(this.app.deleted)
        }
    },
}