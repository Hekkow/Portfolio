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
        },
        resizeInput() {
            let textArea = this.$refs.messageInput
            textArea.style.height = 'auto';
            textArea.style.height = textArea.scrollHeight + "px";
            let style = window.getComputedStyle(textArea)
            console.log(textArea.scrollHeight, style.maxHeight)
            if (textArea.scrollHeight > parseFloat(style.maxHeight)) textArea.style.overflowY = 'scroll'
            else textArea.style.overflowY = 'hidden'
        }
    },
    watch: {
        'data.openConversationID'(id) {
            if (id !== -1) this.focusTextArea()
        },
        'data.focusMessageInput' (focus) {
            if (focus) {
                this.focusTextArea()
                data.focusMessageInput = false
            }

        }
    },
    template: `
      <div id="messageInputDiv" v-show="data.openConversationID !== -1">
        <textarea id="messageInput" ref="messageInput" rows=1 @input="() => {
            resizeInput()
        }"></textarea>
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
        let textArea = this.$refs.messageInput
        textArea.setAttribute("style", "height: 20px;");
    },
}