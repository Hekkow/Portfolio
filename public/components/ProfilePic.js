import {data} from "./data.js";
export default {
    data() {
        return {
            data: data
        }
    },
    setup(props) {
        const canvasRef = Vue.ref(null)
        function drawShapes() {
            if (props.userid === -1) return
            if (!canvasRef.value) return
            let ctx = canvasRef.value.getContext('2d')
            let scale = canvasWidth/parseFloat($(canvasRef.value).attr('width'))
            ctx.fillStyle = "black"
            ctx.fillRect(0, 0, canvasWidth, canvasHeight)
            let shapes = data.loadedUsers.get(props.userid).profilePic
            // if (!shapes) shapes = new Map()
            if (!(shapes instanceof Map)) shapes = new Map(Object.entries(shapes))
            for (let shape of Array.from(shapes.values()).sort((a, b) => a.z - b.z)) {
                drawShape(ctx, shape, scale)
            }
        }
        Vue.onMounted(() => {
            drawShapes()
        })

        return { canvasRef, drawShapes }
    },
    template: `
      
      <div class='userPic' :style="'clip-path: circle(' + size / 2 + 'px at center); width: ' + size + 'px;'">
        <canvas :width="size" :height="size" ref="canvasRef"></canvas>
      </div>
    `,
    props: {
        size: {
            type: Number,
            default: 50
        },
        userid: {
            type: Number,
            default: -1
        },
    },
    watch: {
        'profilePic'() {
            this.drawShapes()
        }
    },
    computed: {
        profilePic() {
            return Array.from(data.loadedUsers.get(this.userid).profilePic)
        }
    }
}