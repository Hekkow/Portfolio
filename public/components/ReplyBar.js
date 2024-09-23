import {data} from "./data.js";
import {scrollToBottom} from "../chat.js";

export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
        <div v-if="replyBarOpen"  class="replyBar">
          <div class="replyBarText">
            <template v-if="data.replyingTo !== -1">Replying to </template>
            <profile-pic v-if="data.replyingTo !== -1" :userid="reply.userID" :size="21" style="display: inline-block; position: relative"></profile-pic>
            <template v-if="data.replyingTo !== -1">|</template> {{data.replyingTo !== -1 ? replyingToMessage : 'Editing'}}
          </div>
          <button @click="function() {
              data.replyingTo = -1
              data.editing = -1
          }" class="closeButton squareButton"><icon icon="Close" :fit="true"/></button>
        </div>
    `,
    computed: {
        reply() {
            return data.loadedConversations.get(data.openConversationID).texts.find(message => message.messageID === data.replyingTo)
        },
        replyingToMessage() {
            return this.reply.message
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