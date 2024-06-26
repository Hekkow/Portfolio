import {data} from "./data.js";
import {createNewGroupChat, inviteToGroupChat, renameGroupChat, transferLeader} from "../main.js";
export default {
    data() {
        return {
            data: data,
            inputText: ''
        }
    },
    methods: {
        transferLeader,
        renameGroupChat,
        createNewGroupChat,
        inviteToGroupChat
    },
    template: `
        <div v-if="data.openModal === data.modals.CreateGroupChat">
          <p>Create</p>
          <user-checkbox v-for="user in data.currentlyOnlineUsers" :user="user"></user-checkbox>
          <modal-button @click="createNewGroupChat()">Create</modal-button>
        </div>
        <div v-if="data.openModal === data.modals.InviteToGroupChat">
          <p>Invite</p>
          <user-checkbox v-for="user in inviteUsers" :user="user"></user-checkbox>
          <modal-button v-if="data.createGroupChatUsers.length > 0" @click="inviteToGroupChat()">Invite</modal-button>
        </div>
        <div v-if="data.openModal === data.modals.RenameGroupChat">
          <input type="text" v-model="inputText">
          <modal-button @click='renameGroupChat(inputText)'>Rename</modal-button>
        </div>
        <div v-if="data.openModal === data.modals.TransferGroupChat">
          <user-checkbox v-for="user in groupChatUsers" :user="user"></user-checkbox>
          <modal-button @click="transferLeader()">Transfer</modal-button>
        </div>
    `,
    // make actual user-radio later
    watch: {
        'data.openModal': function() {
            this.data.createGroupChatUsers = [];
        }
    },
    computed: {
        inviteUsers() {
            return data.currentlyOnlineUsers.filter(user => !data.loadedConversations.get(data.openConversationID).users.includes(user.userID))
        },
        groupChatUsers() {
            return data.loadedConversations.get(data.openConversationID).users.filter(userID => userID !== data.userID).map(userID => data.loadedUsers.get(userID))
        }
    }
}