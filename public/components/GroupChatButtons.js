import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div class="groupChatButtonsDiv" v-if="data.openConversationID !== -1">
        <button class="groupChatButton" @click="data.openModal = data.modals.InviteToGroupChat" title="Invite to group chat">+</button>
        <button class="groupChatButton" @click="data.openModal = data.modals.RenameGroupChat" v-if="groupChat && leader" title="Rename group chat">></button>
        <button class="groupChatButton" @click="data.openModal = data.modals.TransferGroupChat" v-if="groupChat && leader" title="Transfer leadership of group chat">>></button>
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