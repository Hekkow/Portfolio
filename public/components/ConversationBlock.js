import {openConversation, leaveConversation, getConversationName, updateTitleNotifications} from "../main.js";
import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
            blockHovered: false,
            direct: 0
        }
    },
    template: `
      <button
          v-if="!(conversation.conversationType === direct && data.loadedUsers.get(data.userID).blocked.some(userID => conversation.users.includes(userID)))"
          class="conversationBlock itemBlock"
          @click="openConversation(conversation.conversationID)"
          @mouseenter="blockHovered = true"
          @mouseleave="blockHovered = false"
          :style="{ fontWeight: notification ? 'bold' : 'normal'}"
      >
        <div class="conversationBlockText">
          <div class="blockText">{{ getConversationName(conversation.conversationID) }}</div>
          <div class="blockText" v-if="lastMessage" style="margin-top: 4px;">
            <profile-pic :userid="lastMessage.userID" :size="21" style="display: inline-block"></profile-pic>
            {{ conversationLastText }}
          </div>
        </div>

        <button class="closeButton squareButton" v-if="blockHovered"
                @click.stop="leaveConversation(conversation.conversationID, data.userID)">x
        </button>
      </button>
      <hr>
    `,
    props: {
        conversation: {
            type: Object
        },
    },
    methods: {
        openConversation,
        leaveConversation,
        getConversationName
    },
    watch: {
        notification: {
            handler() {
                this.$nextTick(() => {
                    updateTitleNotifications()
                })
            }
        }
    },
    created() {
        if (this.notification) {
            this.$nextTick(() => {
                updateTitleNotifications()
            })
        }
    },
    computed: {
        notification() {
            if (this.conversation.texts.length === 0) return false
            if (this.lastMessage.userID === data.userID) return false
            let readReceipt = data.read.get(this.conversation.conversationID)?.find(read => read.userID === data.userID)
            if (!readReceipt) return true
            return readReceipt.messageID !== this.lastMessage.messageID;
        },
        lastMessage() {
            return this.conversation.texts[this.conversation.texts.length - 1]
        },
        conversationLastText() {
            return this.lastMessage.message
            // let lastMessageText = this.lastMessage.message
            // let lastTextUsername = this.lastMessage.userID === -1 ? "Server" : data.loadedUsers.get(this.lastMessage.userID).username
            // return lastTextUsername + ": " + lastMessageText
        },
    }

}