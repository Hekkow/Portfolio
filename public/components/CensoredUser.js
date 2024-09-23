import {data} from "./data.js";
import {uncensor} from "../chat.js";
export default {
    methods: {uncensor},
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div class="userRow">
        <profile-pic :size="30" :userid="$props.user.userID" class="userRowProfilePic"/>
        {{ $props.user.username }}
        <button @click="uncensor($props.user.userID)" class="userRowButton settingsButton"><icon icon="Uncensor" :space="true"/>Uncensor</button>
      </div>
    `,
    props: {
        user: {
            type: Object,
            default: -1
        },
    },
}