import {data} from "./data.js";
import {scrollToBottom} from "../main.js";

export default {
    data() {
        return {
            data: data
        }
    },
    template: `
      <div id="messages">
        <message v-if="data.openConversationID !== -1" v-for="message in texts" :message="message" @reply-clicked="replyClicked" :ref="'message'"></message>
      </div>
    `,
    methods: {
        replyClicked(messageID) {
            data.focusMessageInput = true
            this.$refs.message.find(message => message.message.messageID === messageID).replyHighlight()
        }
    },
    computed: {
        texts() {
            if (data.openConversationID === -1) return
            return data.loadedConversations.get(data.openConversationID).texts;
        }
    },
    watch: {
        texts: {
            immediate: true,
            handler() {
                this.$nextTick(() => scrollToBottom())
            }
        },
        'data.openConversationID': {
            immediate: true,
            handler() {
                this.$nextTick(() => scrollToBottom())
            }
        }
    },
}