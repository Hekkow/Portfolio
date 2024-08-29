import {data} from "./data.js";
import {createNewGroupChat, inviteToGroupChat, renameGroupChat, transferLeader, unblockUser} from "../main.js";
export default {
    data() {
        return {
            data: data,
            inputText: ''
        }
    },
    methods: {
        unblockUser,
        transferLeader,
        renameGroupChat,
        createNewGroupChat,
        inviteToGroupChat,
    },
    template: `
      <div v-if="data.openModal !== data.modals.None" class="modalBackground" @click="function(event) {
          if (event.target.classList.contains('modalBackground')) data.openModal = data.modals.None
      }">
        <div class="modal">
          <div v-if="data.openModal === data.modals.CreateGroupChat">
            <p>Create</p>
            <user-checkbox v-for="user in createGroupChatUsers" :user="user"></user-checkbox>
            <modal-button v-if="data.createGroupChatUsers.length > 0" @click="createNewGroupChat()">Create</modal-button>
          </div>
          <div v-if="data.openModal === data.modals.InviteToGroupChat">
            <p>Invite</p>
            <user-checkbox v-for="user in inviteUsers" :user="user"></user-checkbox>
            <modal-button v-if="data.createGroupChatUsers.length > 0" @click="inviteToGroupChat()">Invite</modal-button>
          </div>
          <div v-if="data.openModal === data.modals.RenameGroupChat">
            <p>Rename</p>
            <input type="text" v-model="inputText">
            <modal-button @click='renameGroupChat(inputText)'>Rename</modal-button>
          </div>
          <div v-if="data.openModal === data.modals.TransferGroupChat">
            <p>Transfer Ownership</p>
            <user-checkbox v-for="user in groupChatUsers" :user="user"></user-checkbox>
            <modal-button v-if="data.createGroupChatUsers.length === 1" @click="transferLeader()">Transfer</modal-button>
          </div>
          <div v-if="data.openModal === data.modals.BlockedUsers">
            <p>Blocked users</p>
            <user-checkbox v-for="user in blockedUsers" :user="user"></user-checkbox>
            <modal-button v-if="data.createGroupChatUsers.length === 1" @click="unblockUser(data.createGroupChatUsers[0])">Unblock</modal-button>
          </div>
        </div>
      </div>
    `,
    // make actual user-radio later
    watch: {
        'data.openModal': function() {
            this.data.createGroupChatUsers = [];
        }
    },
    computed: {
        createGroupChatUsers() {
            return data.currentlyOnlineUsers.map(userID => data.loadedUsers.get(userID)).filter(user => !(user.blocked.includes(data.userID) || data.loadedUsers.get(data.userID).blocked.includes(user.userID)))
        },
        inviteUsers() {
            return data.currentlyOnlineUsers.map(userID => data.loadedUsers.get(userID)).filter(user => !data.loadedConversations.get(data.openConversationID).users.includes(user.userID) && !(user.blocked.includes(data.userID) || data.loadedUsers.get(data.userID).blocked.includes(user.userID)))
        },
        groupChatUsers() {
            return data.loadedConversations.get(data.openConversationID).users.filter(userID => userID !== data.userID).map(userID => data.loadedUsers.get(userID))
        },
        blockedUsers() {
            return data.loadedUsers.get(data.userID).blocked.map(userID => data.loadedUsers.get(userID))
        }
    }
}