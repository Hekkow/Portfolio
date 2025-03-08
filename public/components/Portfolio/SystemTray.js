import {data} from "./PortfolioData.js";
export default {
    data() {
        return {
            data: data,
            printableTime: null,
            printableDate: null,
            originallyMinimized: new Map()
        }
    },
    template: `
      <div id="system-tray">
        <div id="system-tray-clock">
          <div id="system-tray-date">
            {{ printableTime }}<br>
            {{ printableDate }}
          </div>

        </div>
        <div id="aero-peek" @mouseover="tempMinimizeAll" @mouseout="updateMinimized" @click="minimizeAll">

        </div>
      </div>
    `,
    mounted() {
        setInterval(() => {
            let t = new Date()
            let hours = t.getHours()
            let pm = "AM"
            if (hours >= 12) pm = "PM"
            hours %= 12
            if (hours === 0) hours = 12
            this.printableTime = hours + ":" + this.formatTime(t.getMinutes()) + " " + pm
            this.printableDate = t.getFullYear() + "-" + this.formatTime(t.getMonth()+1) + "-" + this.formatTime(t.getDate())
        }, 100)
    },
    methods: {
        formatTime(t) {
            if (t < 10) return "0" + t
            return t
        },
        tempMinimizeAll() {
            for (let app of data.openApps) {
                this.originallyMinimized.set(app, app.minimized)
                app.minimized = true
            }
        },
        updateMinimized() {
            for (let [app, minimized] of this.originallyMinimized.entries()) {
                app.minimized = minimized
            }
        },
        minimizeAll() {
            for (let [app, _] of this.originallyMinimized.entries()) {
                this.originallyMinimized.set(app, true)
            }
            this.updateMinimized()
        }
    }
}