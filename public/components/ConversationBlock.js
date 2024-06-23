import {openConversation} from '../main.js'
export default {
    template: `
      <button class="conversationBlock itemBlock" :data-conversationID="conversation.conversationID" @click="openTheConversation">
        <div class="blockText">{{conversation.conversationName}}</div>
      </button>
    `,
    props: {
        conversation: {
            type: Object
        },
    },
    methods: {
        openTheConversation() { // i am so very upset
            openConversation(this.conversation.conversationID)
        }

    }
}