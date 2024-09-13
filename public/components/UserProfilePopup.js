import {data} from "./data.js";
import {blockUser, censor, startConversation, toggleCensor, unblockUser, uncensor} from "../main.js";

export default {
    methods: {uncensor, censor, unblockUser, toggleCensor, startConversation, blockUser},
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div v-if="data.userPopupID !== -1" class="userPopup" :style="'left: ' + data.userPopupLocation.x + 'px; top: ' + data.userPopupLocation.y + 'px;'">
        <profile-pic :size="50" :userid="user.userID" style="margin: var(--profile-pic-margin)"></profile-pic>
        <span style="margin-left: 10px; margin-bottom: 10px;">{{user.username}}</span>
        <button class="userPopupButton" v-if="user.userID !== data.userID" @click="startConversation(user.userID)">Start conversation</button>
        <button class="userPopupButton" v-if="user.userID !== data.userID && !userBlocked" @click="blockUser(user.userID)">Block</button>
        <button class="userPopupButton" v-if="user.userID !== data.userID && userBlocked" @click="unblockUser(user.userID)">Unblock</button>
        <button class="userPopupButton" v-if="user.userID !== data.userID && !userCensored" @click="censor(user.userID)">Censor</button>
        <button class="userPopupButton" v-if="user.userID !== data.userID && userCensored" @click="uncensor(user.userID)">Uncensor</button>
      </div>
    `,
    computed: {
        user() {
            return data.loadedUsers.get(data.userPopupID)
        },
        userBlocked() {
            return data.loadedUsers.get(data.userID).blocked.includes(data.userPopupID)
        },
        userCensored() {
            return data.loadedUsers.get(data.userID).censored.includes(data.userPopupID)

        }
    }
}