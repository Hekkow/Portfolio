import {openConversation} from "../main.js";

export default {
    template: `
      <button class="conversationBlock itemBlock" :data-conversationID="conversation.conversationID" @click="openConversation(this.conversation.conversationID)">
        <div class="blockText">{{conversation.conversationName}}</div>
      </button>
    `,
    props: {
        conversation: {
            type: Object
        },
    },
    methods: {
        openConversation,
    }
}