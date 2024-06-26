import {data} from "./data.js";
import {createNewGroupChat, inviteToGroupChat} from "../main.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    methods: {
        createNewGroupChat,
        inviteToGroupChat
    },
    template: `
        <div v-if="data.openModal === data.modals.CreateGroupChat">
          <p>Create</p>
          <user-checkbox v-for="user in data.currentlyOnlineUsers" :user="user"></user-checkbox>
          <button @click="createNewGroupChat()">Create</button>
        </div>
        <div v-if="data.openModal === data.modals.InviteToGroupChat">
          <p>Invite</p>
          <user-checkbox v-for="user in inviteUsers" :user="user"></user-checkbox>
          <button v-if="data.createGroupChatUsers.length > 0" @click="inviteToGroupChat()">Invite</button>
        </div>
        <div v-if="data.openModal === data.modals.RenameGroupChat">
          <button>TEst3</button>
        </div>
        <div v-if="data.openModal === data.modals.TransferGroupChat">
          <button>TEst1</button>
        </div>
    `,
    watch: {
        'data.openModal': function() {
            this.data.createGroupChatUsers = [];
        }
    },
    computed: {
        inviteUsers() {
            return data.currentlyOnlineUsers.filter(user => !data.loadedConversations.get(data.openConversationID).users.includes(user.userID))
        }
    }
}