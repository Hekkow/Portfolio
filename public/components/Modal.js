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
        renameGroupChat,
        createNewGroupChat,
        inviteToGroupChat,
    },
    template: `
      <div v-if="data.openModal !== data.modals.None || data.userID === -1" class="modalBackground" :style="{backgroundColor: data.userID === -1 ? 'var(--loading-background-color)' : null}" @mousedown="function(event) {
          if (event.target.classList.contains('modalBackground') && event.button === 0) {
              if (data.openModal === data.modals.Settings && 
                ((data.openSettings === data.settingsTabs.ProfilePic && data.shapesDirty) || 
                (data.openSettings === data.settingsTabs.Theme && data.themeDirty))) {
                  data.openPopup = data.popups.UnsavedProgress
                  return
              }
              data.openModal = data.modals.None
              data.openPopup = data.popups.None
              data.userPopupID = -1
              data.conversationPopupID = -1
          }
      }">
        <div class="loadingAnimation" v-if="data.userID === -1 || data.loadingPage">
          <icon icon="Load"/>
        </div>
        <div class="modal" v-if="data.userID !== -1 && data.openModal === data.modals.CreateGroupChat">
            <p class="modalTitle">Create</p>
            <user-checkbox v-for="user in createGroupChatUsers" :user="user"></user-checkbox>
            <p v-if="createGroupChatUsers.length === 0">No invitable users online</p>
            <modal-button v-if="data.usersCheckbox.length > 0" @click="createNewGroupChat()">Create</modal-button>
        </div>
        <div class="modal" v-if="data.userID !== -1 && data.openModal === data.modals.InviteToGroupChat">
            <p class="modalTitle">Invite</p>
            <user-checkbox v-for="user in inviteUsers" :user="user"></user-checkbox>
            <p v-if="inviteUsers.length === 0">No invitable users online</p>
            <modal-button v-if="data.usersCheckbox.length > 0" @click="inviteToGroupChat()">Invite</modal-button>
        </div>
        <div class="modal" v-if="data.userID !== -1 && data.openModal === data.modals.RenameGroupChat">
            <p class="modalTitle">Rename<p/>
          <div class="regularRow"><input style="width: 80%" type="text" v-model="inputText"><modal-button @click='renameGroupChat(inputText)'>Rename</modal-button></div>
        </div>
        <div class="modal" v-if="data.userID !== -1 && data.openModal === data.modals.TransferGroupChat">
            <p class="modalTitle">Transfer Ownership</p>
            <transfer-leader-row v-for="user in groupChatUsers" :user="user"/>
            <p v-if="groupChatUsers.length === 0">Nobody to transfer to</p>
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