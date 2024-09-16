import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div class="groupChatButtonsDiv" v-if="data.openConversationID !== -1">
        <dropdown icon="Down">
          <button class="dropdownButton" @click="data.openModal = data.modals.InviteToGroupChat"><icon icon="Invite" :space="true"/>Invite</button>
          <button class="dropdownButton" @click="data.openModal = data.modals.RenameGroupChat" v-if="groupChat && leader"><icon icon="Edit" :space="true"/>Rename</button>
          <button class="dropdownButton" @click="data.openModal = data.modals.TransferGroupChat" v-if="groupChat && leader"><icon icon="Transfer" :space="true"/>Transfer leadership</button>
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