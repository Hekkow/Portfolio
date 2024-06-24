import {sendMessage} from "../main.js";
import {data} from "./data.js";

export default {
    data() {
        return {
            data: data
        }
    },
    methods: {
        sendMessage,
        focusTextArea() {
            this.$nextTick(() => {
                this.$refs.messageInput.focus()
            })
        },
        emptyText() {
            this.$nextTick(() => {
                this.$refs.messageInput.focus()
            })
        }
    },
    watch: {
        'data.openConversationID'(id) {
            if (id !== -1) this.focusTextArea()

        }
    },
    template: `
      <div id="messageInputDiv" v-show="data.openConversationID !== -1">
        <textarea id="messageInput" ref="messageInput"></textarea>
        <button id="messageSendButton" @click="sendMessage()"></button>
      </div>
    `,
    props: {
        user: {
            type: Object
        }
    },
    mounted() {
        $(window).on('focus', () => this.focusTextArea())
    }
}