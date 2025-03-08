import {data} from "./PortfolioData.js";
import {getBounds, makeActiveApp, openApp} from "../../index.js";
export default {
    data() {
        return {
            data: data,
            highlighted: false,
            dragging: false,
            startX: null,
            startY: null,
            delta: 6,
            started: false,
            dragCheckTimer: null,
            draggingPosition: null,
            height: 140,
            width: 100,
            margin: 15,
        }
    },
    template: `
      <div class="desktop-shortcut" @dblclick="shortcutOpened" @click.stop="highlight" @mousedown="mouseDown" :class="{'active': highlighted, 'dragging': dragging}">
        <div class="desktop-shortcut-icon">
          <img class="desktop-shortcut-icon-img" :src="'../../Images/' + app.icon + '-desktop.png'" alt="" draggable="false">
        </div>
        <div class="desktop-shortcut-title">
          {{ app.name }}
        </div>
      </div>
    `,
    props: {
        app: Object,
        shortcutId: String,
    },
    methods: {
        shortcutOpened() {
            openApp(this.app)
            this.highlighted = false
        },
        highlight() {
            this.highlighted = !this.highlighted
        },
        mouseDown(event) {
            this.startX = event.pageX
            this.startY = event.pageY
            this.started = true
            let bounds = getBounds(this.$el)
            this.draggingLocation = {x: event.clientX - bounds.x, y: event.clientY - bounds.y}
            this.dragCheckTimer = setTimeout(() => {
                this.dragging = true
            }, 100)
        },
        mouseUp(event) {
            clearTimeout(this.dragCheckTimer)
            if (!this.started) return
            if (this.dragging) {
                let t = this
                $(".desktop-shortcut").each(function(index) {
                    if ($(this).is(':hover')) {
                        t.$emit('dropped', parseInt(t.shortcutId), parseInt($(this).attr('data-shortcut-id')))
                    }
                })
            }

            this.started = false
            this.dragging = false
            // click detection
            // let diffX = Math.abs(event.pageX - this.startX)
            // let diffY = Math.abs(event.pageY - this.startY)
            // if (diffX < 6 && diffY < 6) { }
        },
        drag(event) {
            if (this.dragging) {
                let bounds = getBounds($("#desktop")[0])
                this.$el.style.left = event.clientX - bounds.x - this.draggingLocation.x + "px"
                this.$el.style.top = event.clientY - bounds.y - this.draggingLocation.y + "px"

            }
        },
        dropped(dropping) {
            // console.log(dropping)
            // console.log("HERE", this.app.name)
            if (this.app.name === "Trash") {
                console.log("here1", data.desktopApps)

                if (!this.app.deleted) {
                    this.app.deleted = new Map()
                }
                this.app.deleted.set(dropping, data.desktopApps.get(dropping))
                data.desktopApps.delete(dropping)

            }
        }
    },
    mounted() {
        document.addEventListener("mousemove", this.drag)
        document.addEventListener("mouseup", this.mouseUp)
        $('#computer').click((event) => {
            this.highlighted = false
        })
        this.$el.style.left = this.app.x * (this.width + this.margin) + this.margin + "px"
        this.$el.style.top = this.app.y * (this.height + this.margin) + this.margin + "px"
    }
}