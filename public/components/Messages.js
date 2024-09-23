import {data} from "./data.js";
import {getConversationName, onMessagesScroll, scrollToBottom} from "../chat.js";

export default {
    data() {
        return {
            data: data
        }
    },
    template: `
      <div class="panelTitle">
        <mobile-navigation-button icon="Chats" :panel="data.panels.ActiveConversations"/>
        <p style="font-weight: bold; margin: 0; padding: 0;">{{data.openConversationID !== -1 ? getConversationName(data.openConversationID) : ""}}</p>
        <mobile-navigation-button icon="Chat Info" :panel="data.panels.ChatInfo"/>
      </div>
      <div class="panelArea" style="overflow: auto;">
          <div id="messages" @scroll="onMessagesScroll($event.target.scrollTop)" ref="messages">
            <message v-if="data.openConversationID !== -1" v-for="(message, index) in texts" :message="message" :showProfilePic="showProfilePic(message, index)" @reply-clicked="replyClicked" :ref="'message'"/>
          </div>
          <typing-bar></typing-bar>
          <reply-bar></reply-bar>
          <message-input></message-input>
      </div>
    `,
    methods: {
        getConversationName,
        onMessagesScroll,
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
            return data.loadedConversations.get(data.openConversationID).texts
        },
        textsLength() {
            return this.texts ? this.texts.length : 0
        }
    },
    watch: {
        textsLength: {
            immediate: true,
            handler() {
                if (!data.messagesAdded) {
                    this.$nextTick(() => scrollToBottom(true))
                }
                else {
                    let previousScrollHeight = this.$refs.messages.scrollHeight
                    this.$nextTick(() => {
                        scrollToBottom(false, this.$refs.messages.scrollHeight-(previousScrollHeight-data.distanceBeforeRequest))
                    })
                }
                data.messagesAdded = false
            }
        },
        'data.openConversationID': {
            handler() {
                this.$nextTick(() => scrollToBottom())
            }
        },
    },
    mounted() {
        this.$nextTick(() => {
            scrollToBottom()
        })
    }
}