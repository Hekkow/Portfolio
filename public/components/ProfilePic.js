export default {
    setup(props) {
        Vue.onMounted(() => {
            drawShapes(props.userid, props.shapes)
        })
    },
    template: `
      <div class='userPic' :style="'clip-path: circle(' + size / 2 + 'px at center)'">
        <canvas :width="size" :height="size" :data-canvasID="userid"></canvas>
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
        shapes: {
            type: Array,
            default: []
        }
    }
}