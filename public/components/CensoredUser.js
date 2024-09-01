import {data} from "./data.js";
import {uncensor} from "../main.js";
export default {
    methods: {uncensor},
    data() {
        return {
            data: data,
        }
    },
    template: `
        <div>
          {{$props.user.username}}
          <button @click="uncensor($props.user.userID)">Uncensor</button>
        </div>
    `,
    props: {
        user: {
            type: Object,
            default: -1
        },
    },
}