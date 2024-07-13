import {data} from "./data.js";
import {scrollToBottom} from "../main.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
        <div v-if="replyBarOpen"  class="replyBar">
          <div class="replyBarText">
            {{data.replyingTo !== -1 ? replyingToMessage : 'Editing'}}
          </div>
          <div class="replyBarCloseDiv">
            <button @click="data.replyingTo = -1" class="replyBarCloseButton">x</button>
          </div>
        </div>
    `,
    computed: {
        replyingToMessage() {
            let message = data.loadedConversations.get(data.openConversationID).texts.find(message => message.messageID === data.replyingTo)
            let messageText = message.message
            return 'Replying to ' + data.loadedUsers.get(message.userID).username + ': ' + messageText
        },
        replyBarOpen() {
            let open = data.replyingTo !== -1 || data.editing !== -1
            if (open) data.focusMessageInput = true
            return open
        }
    },
    watch: {
        'data.openConversationID'(id) {
            data.replyingTo = -1
            data.editing = -1
        }
    },
    updated() {
        this.$nextTick(() => scrollToBottom())
    }
}