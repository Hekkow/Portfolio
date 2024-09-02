import {data} from "./data.js";
import {getConversationName, scrollToBottom} from "../main.js";

export default {
    data() {
        return {
            data: data
        }
    },
    template: `
      <div class="panelTitle">{{data.openConversationID !== -1 ? getConversationName(data.openConversationID) : ""}}</div>
      <div class="panelArea" style="overflow: auto;">
          <div id="messages">
            <message v-if="data.openConversationID !== -1" v-for="(message, index) in texts" :message="message" :showProfilePic="showProfilePic(message, index)" @reply-clicked="replyClicked" :ref="'message'"/>
          </div>
          <typing-bar></typing-bar>
          <reply-bar></reply-bar>
          <message-input></message-input>
      </div>
    `,
    methods: {
        getConversationName,
        replyClicked(messageID) {
            data.focusMessageInput = true
            this.$refs.message.find(message => message.message.messageID === messageID).replyHighlight()
        },
        showProfilePic(message, index) {
            if (index === 0) return true
            return this.texts[index - 1].userID !== message.userID
        }
    },
    computed: {
        texts() {
            if (data.openConversationID === -1) return
            if (!data.loadedConversations.has(data.openConversationID)) return
            return data.loadedConversations.get(data.openConversationID).texts;
        },

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