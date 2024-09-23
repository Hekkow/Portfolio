import {messageInputPasted, sendMessage} from "../chat.js";
import {data} from "./data.js";

export default {
    data() {
        return {
            data: data
        }
    },
    methods: {
        messageInputPasted,
        sendMessage,
        focusTextArea() {
            this.$nextTick(() => {
                if (this.$refs.messageInput) this.$refs.messageInput.focus()
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
            if (textArea.scrollHeight > parseFloat(style.maxHeight)) textArea.classList.add('scroll')
            else textArea.classList.remove('scroll')
        }
    },
    watch: {
        'data.openConversationID'(id) {
            if (id !== -1) this.focusTextArea()
        },
        'data.focusMessageInput' (focus) {
            if (focus) {
                this.focusTextArea()
                this.resizeInput()
                data.focusMessageInput = false
            }
        }
    },
    template: `
      <div id="messageInputDiv" v-show="data.openConversationID !== -1">
        <textarea id="messageInput" ref="messageInput" rows=1 @input="() => {
            resizeInput()
        }" @paste="function(event) {messageInputPasted(event)}"></textarea>
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
        let style = getComputedStyle(textArea)
        let lineHeight = parseFloat(style.getPropertyValue('--line-height'))
        let paddingTop = parseFloat(style.getPropertyValue('padding-top'))
        let paddingBottom = parseFloat(style.getPropertyValue('padding-bottom'))
        textArea.setAttribute("style", "height: " + (lineHeight + paddingTop + paddingBottom) + "px;")
        this.focusTextArea()
    },
}