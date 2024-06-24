import {openConversation} from "../main.js";
import {data} from "./data.js";
export default {
    data() {
        return {
            data: data
        }
    },
    template: `
      <button class="conversationBlock itemBlock" :data-conversationID="conversation.conversationID" @click="openConversation(this.conversation.conversationID)">
        <div class="blockText">{{conversationBlockText()}}</div>
      </button>
    `,
    props: {
        conversation: {
            type: Object
        },
    },
    methods: {
        openConversation,
        conversationBlockText() {
            let conversationName = this.conversation.conversationName
            if (!conversationName) conversationName = this.conversation.users.filter(userID => userID !== data.userID).map(userID => data.loadedUsers.get(userID).username)
            let lastMessage = this.conversation.texts[this.conversation.texts.length - 1]
            let lastMessageText = lastMessage ? lastMessage.message : ""
            let lastTextUsername = ""
            if (lastMessage) {
                if (lastMessage.userID === -1) lastTextUsername = "Server"
                else lastTextUsername = data.loadedUsers.get(lastMessage.userID).username
            }
            if (lastMessageText.length > 18) lastMessageText = lastMessageText.substring(0, 15) + "..."
            let text = conversationName
            if (lastMessage) text += "\n" + lastTextUsername + ": " + lastMessageText
            return text
        }
    }

}