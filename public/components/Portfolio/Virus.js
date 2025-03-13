import {data} from "./PortfolioData.js";
import {closeApp, minimizeApp, AppClass} from "../../index.js";
export default {
    data() {
        return {
            data: data,
            cmds: [],
            numCmds: 0,
        }
    },
    template: `
      <div style="width: 1200px; height: 700px; position: relative; pointer-events: none;">
        <div
            v-for="i in cmds"
            :key="i"
            :class="{'app-border': true, 'hide-border': false, active: true}"
            :style="{pointerEvents: 'auto',
            top: (i%16)*43 + 'px',
            left: (i%75)*14 + 'px',}"
            ref="appBorder"
        >
          <div class="app-border-top">
            <div class="app-border-icon">
              <img class="app-border-icon-img" :src="'../../Images/cmd-app.png'" alt="">
            </div>
            <div class="app-border-title">
              CMD
            </div>
            <button class="app-border-button default-font perma" @click="closeApp(app)"></button>
            <div class="app-border-buttons-div">
              <button class="app-border-button default-font close" @click="closeCmd(i)"></button>
            </div>
          </div>
          <div style="width: 300px; height: 200px; background-color: black; word-break: break-word">
            MUHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAH
          </div>
        </div>
      </div>
    `,
    mounted() {
        this.app.top = "-37px"
        this.app.left = "-8px"
        this.app.hideBorder = true
        let spawner = setInterval(() => {
            this.cmds.push(this.numCmds)
            this.numCmds++
            if (this.numCmds === 400) {
                clearInterval(spawner)

            }
        }, 50)
        setTimeout(() => {
            let despawner = setInterval(() => {
                if (this.cmds.length !== 0) {
                    this.cmds.shift()
                }
                else {
                    clearInterval(despawner)
                    closeApp(this.app)
                }
            }, 70)
        }, 50)
        this.cmdApp = new AppClass("CMD", "command-prompt", "cmd", 0, 0)
        this.cmdApp.minimized = true
        this.cmdApp.hideBorder = true // creates dummy app because cmd isn't actual app,
        data.openApps.add(this.cmdApp)
    },
    unmounted() {
        console.log("HEREEE")
        data.openApps.delete(this.cmdApp)
    },
    methods: {
        closeApp,
        closeCmd(i) {
            this.cmds = this.cmds.filter(n => n !== i)
        }
    },
    props: {
        app: Object,
    },
}