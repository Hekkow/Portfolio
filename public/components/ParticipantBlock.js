import {data} from "./data.js";
import {leaveConversation, showUserPopup} from "../main.js";

export default {
    data() {
        return {
            data: data,
            messageHovered: false
        }
    },
    template: `
      <button
          class="itemBlock" 
          @mouseenter="messageHovered = true"
          @mouseleave="messageHovered = false"
          @click="function(event) {showUserPopup(user.userID, event)}"
      >
          <profile-pic :size=50 :userid="user.userID" style="margin: 10px"></profile-pic>
          <div class="onlineUserListButtonText">{{user.username}}</div>
          <button class="closeButton" v-if="messageHovered && leader && data.userID !== user.userID" @click.stop="leaveConversation(data.openConversationID, user.userID)">x</button>
      </button>
    `,
    props: {
        user: {
            type: Object
        }
    },
    computed: {
        leader() {
            return data.loadedConversations.get(data.openConversationID).leader === data.userID
        }
    },
    methods: {
        showUserPopup,
        leaveConversation
    }
}