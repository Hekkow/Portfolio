import {data} from "./data.js";
import {unblockUser} from "../main.js";
export default {
    methods: {unblockUser},
    data() {
        return {
            data: data,
        }
    },
    template: `
        <div>
          {{$props.user.username}}
          <button @click="unblockUser($props.user.userID)">Unblock</button>
        </div>
    `,
    props: {
        user: {
            type: Object,
            default: -1
        },
    },
}