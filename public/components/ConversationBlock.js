import {openConversation, leaveConversation, getConversationName} from "../main.js";
import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
            messageHovered: false,
            direct: 0
        }
    },
    template: `
      <button v-if="!(conversation.conversationType === direct && data.loadedUsers.get(data.userID).blocked.some(userID => conversation.users.includes(userID)))"
              class="conversationBlock itemBlock"
              @click="openConversation(conversation.conversationID)"
              @mouseenter="messageHovered = true"
              @mouseleave="messageHovered = false"
      >
        <div class="blockText">{{ conversationBlockText }}</div>
        <button class="closeConversationButton" v-if="messageHovered"
                @click.stop="leaveConversation(conversation.conversationID, data.userID)">x
        </button>
      </button>
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
    computed: {
        conversationBlockText() {
            let conversationName = getConversationName(this.conversation.conversationID)
            let lastMessage = this.conversation.texts[this.conversation.texts.length - 1]
            if (!lastMessage) return conversationName
            let lastMessageText = lastMessage.message
            let lastTextUsername = lastMessage.userID === -1 ? "Server" : data.loadedUsers.get(lastMessage.userID).username
            if (lastMessageText.length > 18) lastMessageText = lastMessageText.substring(0, 15) + "..."
            return conversationName + "\n" + lastTextUsername + ": " + lastMessageText
        }
    }

}