import {data} from "./data.js";
import {blockUser} from "../main.js";

export default {
    methods: {blockUser},
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div v-if="data.userPopupID !== -1" class="userPopup" :style="'left: ' + data.userPopupLocation.x + 'px; top: ' + data.userPopupLocation.y + 'px'">
        <profile-pic :size="50" :userid="user.userID"></profile-pic>
        {{user.username}}
        <button class="userPopupButton" v-if="user.userID !== data.userID">Start conversation</button>
        <button class="userPopupButton" v-if="user.userID !== data.userID" @click="blockUser(user.userID)">Block</button>
      </div>
    `,
    computed: {
        user() {
            return data.loadedUsers.get(data.userPopupID)
        }
    }
}