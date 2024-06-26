import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div class="groupChatButtonsDiv" v-if="data.openConversationID !== -1">
        <button @click="data.openModal = data.modals.InviteToGroupChat">Invite</button>
        <button @click="data.openModal = data.modals.RenameGroupChat" v-if="groupChat && leader">Rename</button>
        <button @click="data.openModal = data.modals.TransferGroupChat" v-if="groupChat && leader">Transfer leadership</button>
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
            return data.loadedConversations.get(data.openConversationID).conversationType === group
        }
    }

}