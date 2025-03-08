import {data} from "./PortfolioData.js";
import {closeApp, getBounds, makeActiveApp, minimizeApp} from "../../index.js";
export default {
    data() {
        return {
            data: data,
            top: this.app.top,
            left: this.app.left
        }
    },
    template: `
      <div :class="{'app-border': true, 'draggable': true, 'active': data.appOrder[0] === app, 'hide-border': app.hideBorder}"  
           :style="{
              zIndex: data.appOrder.length - data.appOrder.indexOf(app),
           }"
           ref="appBorder"
           v-draggable
      >
        <div class="app-border-top draggable" :class="{'hide-border': app.hideBorder}" >
          <div class="app-border-icon draggable">
            <img class="app-border-icon-img draggable" :src="'../../Images/' + app.icon + '-app.png'" alt="">
          </div>
          <div class="app-border-title draggable">
            {{ app.name }}
          </div>
          <div class="app-border-buttons-div">
            <button class="app-border-button default-font minimize" @click="minimizeApp(app)"></button>
            <button class="app-border-button default-font close" @click="closeApp(app)"></button>
          </div>
        </div>
        <component class="app" :is="app.tagName" :app="app" :active="data.appOrder[0] === app && !app.minimized"/>
      </div>
    `,
    props: {
        app: Object,
    },
    mounted() {
        this.$el.style.left = this.app.left;
        this.$el.style.top = this.app.top;
    },
    methods: {
        minimizeApp,
        closeApp,
    }
}