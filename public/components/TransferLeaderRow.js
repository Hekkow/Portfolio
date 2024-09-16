import {data} from "./data.js";
import {transferLeader, unblockUser} from "../main.js";
export default {
    methods: {transferLeader},
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div class="userRow">
        <profile-pic :size="30" :userid="$props.user.userID" class="userRowProfilePic"/>
        {{ $props.user.username }}
        <button @click="transferLeader($props.user.userID); data.openModal = data.modals.None" class="userRowButton settingsButton"><icon icon="Transfer" :space="true"/>Transfer</button>
      </div>
    `,
    props: {
        user: {
            type: Object,
            default: -1
        },
    },
}