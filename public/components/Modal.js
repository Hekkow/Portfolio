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
      <div v-show="data.openModal !== data.modals.None || data.userID === -1" class="modalBackground" @click="function(event) {
          if (event.target.classList.contains('modalBackground')) {
              data.openModal = data.modals.None
          }
      }">
        <div class="modal" v-if="data.userID !== -1 && data.openModal === data.modals.CreateGroupChat">
            <modal-title>Create</modal-title>
            <user-checkbox v-for="user in createGroupChatUsers" :user="user"></user-checkbox>
            <p v-if="createGroupChatUsers.length === 0">No invitable users online</p>
            <modal-button v-if="data.usersCheckbox.length > 0" @click="createNewGroupChat()">Create</modal-button>
        </div>
        <div class="modal" v-if="data.userID !== -1 && data.openModal === data.modals.InviteToGroupChat">
            <modal-title>Invite</modal-title>
            <user-checkbox v-for="user in inviteUsers" :user="user"></user-checkbox>
            <p v-if="inviteUsers.length === 0">No invitable users online</p>
            <modal-button v-if="data.usersCheckbox.length > 0" @click="inviteToGroupChat()">Invite</modal-button>
        </div>
        <div class="modal" v-if="data.userID !== -1 && data.openModal === data.modals.RenameGroupChat">
            <modal-title>Rename</modal-title>
            <input type="text" v-model="inputText">
            <modal-button @click='renameGroupChat(inputText)'>Rename</modal-button>
        </div>
        <div class="modal" v-if="data.userID !== -1 && data.openModal === data.modals.TransferGroupChat">
            <modal-title>Transfer Ownership</modal-title>
            <user-radio v-for="user in groupChatUsers" :user="user" :input-type="'radio'"></user-radio>
            <p v-if="groupChatUsers.length === 0">Nobody to transfer to</p>
            <modal-button v-if="data.usersRadio !== -1" @click="transferLeader()">Transfer</modal-button>
        </div>
        <settings v-if="data.userID !== -1 && data.openModal === data.modals.Settings"></settings>
      </div>
    `,
    watch: {
        'data.openModal': function() {
            this.data.usersCheckbox = [];
            this.data.usersRadio = -1;
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

    }
}