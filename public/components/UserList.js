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
      </div>
    `,
    props: {
        type: {
            type: String
        },
    },
    computed: {
        conversations() {
            return data.loadedUsers.get(data.userID).conversations.filter(conversationID => data.loadedConversations.has(conversationID)).map(conversationID => data.loadedConversations.get(conversationID))
        }
    }
}

