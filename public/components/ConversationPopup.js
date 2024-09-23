import {data} from "./data.js";
import {leaveConversation} from "../chat.js";

export default {
    methods: {leaveConversation},
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div v-if="data.conversationPopupID !== -1" class="conversationPopup" :style="'left: ' + data.conversationPopupLocation.x + 'px; top: ' + data.conversationPopupLocation.y + 'px;'">
          <button class="userPopupButton" @click="leaveConversation(data.conversationPopupID, data.userID)"><icon icon="Close"/> Leave</button>
      </div>
    `,
}