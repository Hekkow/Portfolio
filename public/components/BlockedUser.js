import {data} from "./data.js";
import {unblockUser} from "../chat.js";
export default {
    methods: {unblockUser},
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div class="userRow">
        <profile-pic :size="30" :userid="$props.user.userID" class="userRowProfilePic"/>
        {{ $props.user.username }}
        <button @click="unblockUser($props.user.userID)" class="userRowButton settingsButton"><icon icon="Unblock" :space="true"/>Unblock</button>
      </div>
    `,
    props: {
        user: {
            type: Object,
            default: -1
        },
    },
}