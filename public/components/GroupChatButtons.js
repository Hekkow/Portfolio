import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div class="groupChatButtonsDiv" v-if="data.openConversationID !== -1">
        <dropdown label="X">
          <button class="dropdownButton" @click="data.openModal = data.modals.InviteToGroupChat">Invite</button>
          <button class="dropdownButton" @click="data.openModal = data.modals.RenameGroupChat" v-if="groupChat && leader">Rename</button>
          <button class="dropdownButton" @click="data.openModal = data.modals.TransferGroupChat" v-if="groupChat && leader">Transfer leadership</button>
        </dropdown>

      </div>
    `,
    props: {
        message: {
            type: Object
        }
    },
    computed: {
        leader() {
            return data.loadedConversations.get(data.openConversationID).leader === data.userID
        },
        groupChat() {
            if (!data.loadedConversations.has(data.openConversationID)) return
            return data.loadedConversations.get(data.openConversationID).conversationType === group
        }
    }

}