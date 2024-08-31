import {data} from "./data.js";
import {blockUser, startConversation, toggleCensor, unblockUser} from "../main.js";

export default {
    methods: {unblockUser, toggleCensor, startConversation, blockUser},
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div v-if="data.userPopupID !== -1" class="userPopup" :style="'left: ' + data.userPopupLocation.x + 'px; top: ' + data.userPopupLocation.y + 'px; padding: var(--profile-pic-margin)'">
        <profile-pic :size="50" :userid="user.userID" style="margin-bottom: var(--profile-pic-margin)"></profile-pic>
        {{user.username}}
        <button class="userPopupButton" v-if="user.userID !== data.userID" @click="startConversation(user.userID)">Start conversation</button>
        <button class="userPopupButton" v-if="user.userID !== data.userID && !userBlocked" @click="blockUser(user.userID)">Block</button>
        <button class="userPopupButton" v-if="user.userID !== data.userID && userBlocked" @click="unblockUser(user.userID)">Unblock</button>
        <button class="userPopupButton" v-if="user.userID !== data.userID" @click="toggleCensor(user.userID)">Censor</button>
      </div>
    `,
    computed: {
        user() {
            return data.loadedUsers.get(data.userPopupID)
        },
        userBlocked() {
            return data.loadedUsers.get(data.userID).blocked.includes(data.userPopupID)
        }
    }
}