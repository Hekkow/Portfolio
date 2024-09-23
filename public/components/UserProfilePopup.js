import {data} from "./data.js";
import {blockUser, censor, startConversation, toggleCensor, unblockUser, uncensor} from "../chat.js";

export default {
    methods: {uncensor, censor, unblockUser, toggleCensor, startConversation, blockUser},
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div v-if="data.userPopupID !== -1" class="userPopup" :style="'left: ' + data.userPopupLocation.x + 'px; top: ' + data.userPopupLocation.y + 'px;'">
        <profile-pic :size="150" :userid="user.userID" style="margin: var(--profile-pic-margin); margin-top: 20px;"></profile-pic>
        <span style="margin-bottom: 10px;">{{user.username}}</span>
        <template v-if="user.userID !== data.userID">
          <button class="userPopupButton" @click="startConversation(user.userID)"><icon icon="Chat"/> Start conversation</button>
          <button class="userPopupButton" v-if="!userBlocked" @click="blockUser(user.userID)"><icon icon="Block"/> Block</button>
          <button class="userPopupButton" v-if="userBlocked" @click="unblockUser(user.userID)"><icon icon="Unblock"/> Unblock</button>
          <button class="userPopupButton" v-if="!userCensored" @click="censor(user.userID)"><icon icon="Censor"/> Censor</button>
          <button class="userPopupButton" v-if="userCensored" @click="uncensor(user.userID)"><icon icon="Uncensor"/> Uncensor</button>
        </template>
        
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