import {data} from "./data.js";
import {deleteMessage, startEdit} from "../chat.js";

export default {
    methods: {startEdit, deleteMessage},
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div v-if="data.messagePopupID !== -1" class="conversationPopup" :style="'left: ' + data.messagePopupLocation.x + 'px; top: ' + data.messagePopupLocation.y + 'px;'">
<!--        need the additional ; data.messagePopupID = -1 because otherwise it's opening itself back up for some reason-->
        <button v-show="data.userID === message.userID" class="userPopupButton"  @click="deleteMessage(data.messagePopupID); data.messagePopupID = -1"><icon icon="Delete" :space="true"/>Delete</button>
        <button v-show="data.userID === message.userID" class="userPopupButton" @click="startEdit(data.messagePopupID); data.messagePopupID = -1"><icon icon="Edit" :space="true"/>Edit</button>
        <button class="userPopupButton"  @click="data.replyingTo = data.messagePopupID; data.editing = -1; data.messagePopupID = -1"><icon icon="Reply" :space="true"/>Reply</button>
      </div>
    `,
    computed: {
        message() {
            let conversation = data.loadedConversations.get(data.openConversationID)
            if (!conversation) return
            let message = conversation.texts.find(text => text.messageID === data.messagePopupID)
            return message
        }
    }
}