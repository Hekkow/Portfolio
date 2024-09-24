import {data} from "./data.js";
import {leaveConversation, showUserPopup} from "../chat.js";

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
          @click="showUserPopup(user.userID, $event)"
      >
        <profile-pic :size=50 :userid="user.userID" style="margin-right: var(--profile-pic-margin)"></profile-pic>
        <div class="onlineUserListButtonText">{{ user.username }}</div>
        <button class="closeButton itemBlockCloseButton" v-if="messageHovered && leader && data.userID !== user.userID"
                @click.stop="leaveConversation(data.openConversationID, user.userID)"><icon icon="Close" :fit="true"/>
        </button>
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