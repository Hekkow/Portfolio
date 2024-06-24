import {data} from "./data.js";
export default {
    data() {
        return {
            data: data
        }
    },
    setup(props) {
        Vue.onMounted(() => {
            drawShapes(props.userid, data.loadedUsers.get(props.userid).shapes)
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
    }
}