import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
            messageHovered: false
        }
    },
    template: `
      <div class='messageDiv'
           :class="{'myText': myText}"
           @mouseenter="onMouseEnter()"
           @mouseleave="messageHovered = false"
      >
        <hover-buttons v-show="messageHovered" :message="message"></hover-buttons>
        <profile-pic :size=50 :userid="message.userID" style="margin: 0px 10px 10px 10px;"></profile-pic>
        <div class='messageBubble' ref='messageBubble'>
          <div class='messageTextDiv'>
            <p class='messageText' :style="{ color: message.messageID && message.messageID !== -1 ? 'black' : 'gray'}" v-html="getDisplayableMessage(message)"></p>
<!--            <p v-if="readUsers.length > 0">Read by {{readUsers.join(', ')}}</p>-->
          </div>
          
        </div>
        <button v-show="messageHovered" :style="'position: relative;'" ref="hoverButton">HOVER</button>
      </div>
    `,
    computed: {
        readUsers() {
            if (!data.read.has(data.openConversationID)) return []
            return data.read.get(data.openConversationID).filter(read => read.messageID === this.message.messageID).map(read => data.loadedUsers.get(read.userID).username)
        },
        myText() {
            return data.userID === this.message.userID
        }
    },
// turn getDisplayableMessage into computed later
    methods: {
        onMouseEnter() {
            if (this.messageHovered) return
            this.messageHovered = true
            this.$nextTick(() => this.$refs.hoverButton.style.top = (this.$refs.messageBubble.offsetHeight/2 - this.$refs.hoverButton.offsetHeight/2) + 'px')
        },
        getDisplayableMessage(message, reply) {
            if (data.loadedUsers.get(data.userID).blocked.includes(message.userID)) return "Message from blocked user"
            let text = ""
            if (!reply && message.replyingTo && message.replyingTo !== -1) {
                text += "Replying to "
                text += this.getDisplayableMessage(data.loadedConversations.get(data.openConversationID).texts.find(text => text.messageID === message.replyingTo), true) + '\n'
            }
            text += this.addLinks(message.message)
            return text
        },
        addLinks(text) {
            // regex for finding url
            let pattern = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&\/=]*)/g
            let match;
            let indices = [];
            // goes through every time text matches pattern and adds that to indices
            while ((match = pattern.exec(text)) !== null) {
                indices.push({match: match[0], index: match.index});
            }
            // for every link in the text, starting from end to beginning to not shift indices
            for (let i = indices.length - 1; i >= 0; i--) {
                let url = indices[i].match;
                if (!(url.startsWith('http://') || url.startsWith('https://'))) url = 'https://' + url;
                let extension = url.split('.').pop().toLowerCase()
                let start = indices[i].index;
                let end = start + indices[i].match.length;
                // add a tags from start to end to not shift start/end
                text = text.slice(0, end) + '</a>' + text.slice(end);
                text = text.slice(0, start) + `<a target='_blank' href='${url}'>` + text.slice(start);
                // adds video/image
                if (['mp4', 'flv', 'mov', 'avi', 'webm', 'mkv'].includes(extension)) {
                    text += `<video controls><source src=${url} type="video/${extension}"></video>`
                } else if (['jpeg', 'jpg', 'gif', 'png', 'avif', 'svg'].includes(extension)) {
                    text += `<img alt="" src="${url}">`
                }
            }
            return text;
        }
    },
    props: {
        message: {
            type: Object
        }
    }
}