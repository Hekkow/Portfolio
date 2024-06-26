import {data} from "./data.js";

export default {
    data() {
        return {
            data: data
        }
    },
    template: `
      <div class="panelList">
        <user-block v-if="type==='user-block'" v-for="user in data.currentlyOnlineUsers" :user="user"></user-block>
        <conversation-block 
            v-if="type==='conversation-block' && data.userID !== -1" 
            v-for="conversation in conversations"
            :conversation="conversation"
        >
        </conversation-block>
        <participant-block v-if="type==='participant-block'" v-for="user in participants" :user="user"></participant-block>
      </div>
    `,
    props: {
        type: {
            type: String
        },
    },
    computed: {
        conversations() {
            let userConversations = data.loadedUsers.get(data.userID).conversations
            console.log('conversations', userConversations)
            let conversationIDs = userConversations.filter(conversationID => data.loadedConversations.has(conversationID)) // only loaded conversations
            let conversations = conversationIDs.map(conversationID => data.loadedConversations.get(conversationID))
            // sorts by date of last message
            // if date doesn't exist, use 0 instead and set it to the end
            console.log('conversations', conversations)
            return conversations.toSorted((a, b) => new Date(b.texts[b.texts.length - 1]?.date || 0) - new Date(a.texts[a.texts.length - 1]?.date || 0))
        },
        participants() {
            return data.loadedConversations.get(data.openConversationID).users.map(userID => data.loadedUsers.get(userID))
        }
    }
}

