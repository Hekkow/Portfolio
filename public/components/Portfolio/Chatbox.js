import {data} from "./PortfolioData.js";
export default {
    data() {
        return {
            data: data,
            ws: null,
            username: null,
            messages: [],
        }
    },
    template: `
      <div id="chatbox">
        <div class="chatbox-top" ref="messagesBox">
          <div class="chatbox-message" v-for="message in messages">
            {{ message.username }}: {{ message.text }}
          </div>
        </div>
        <div class="chatbox-bottom" v-if="username">
          <input class="chatbox-input" placeholder="Message" ref="messageInput" autofocus>
          <button class="big-button" @click="sendMessage">Send message</button>
        </div>
        <div class="chatbox-bottom" v-if="!username">
          <input class="chatbox-input" placeholder="Name" ref="usernameInput" autofocus>
          <button class="big-button" @click="setUsername">Set username</button>
        </div>
      </div>
    `,
    methods: {
        setUsername() {
            this.username = this.$refs.usernameInput.value
            this.$nextTick(() => {
                this.$refs.messageInput.focus()
                $(this.$refs.messageInput).keyup((e) => {
                    if (e.keyCode === 13) {
                        this.sendMessage()
                    }
                })
            })
        },
        sendMessage() {
            let message = {username: this.username, text: this.$refs.messageInput.value}
            this.ws.send(JSON.stringify(message))
            this.messages.push(message)
            this.scrollToBottom()
            this.$refs.messageInput.value = ""
        },
        scrollToBottom() {
            this.$nextTick(() => {
                $(this.$refs.messagesBox).scrollTop($(this.$refs.messagesBox)[0].scrollHeight)
            })

        }
    },
    mounted() {
        this.app.top = "20%"
        this.app.left = "45%"
        let host = window.location.hostname === "localhost" ? `ws://localhost:6969/portfolioChat` : `wss://${window.location.hostname}/portfolioChat`
        this.ws = new WebSocket(host)
        this.ws.onmessage = (event) => {
            let messages = JSON.parse(event.data)
            if (!Array.isArray(messages)) messages = [messages]
            for (let m of messages) {
                this.messages.push(m)
            }
            this.scrollToBottom()
        }
    },
    unmounted() {
        this.ws.close()
    },
    props: {
        app: Object,
    },
}