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
           :class="{'myText': data.userID === message.userID}"
           @mouseenter="messageHovered = true"
           @mouseleave="messageHovered = false"
      >
        <hover-buttons v-if="messageHovered" :message="message"></hover-buttons>
        <profile-pic :size=50 :userid="message.userID"></profile-pic>
        <div class='messageTextDiv'>
          <p class='messageText' :style="{ color: message.messageID && message.messageID !== -1 ? 'black' : 'gray'}" v-html="getDisplayableMessage(message)"></p>
        </div>
      </div>
    `,
// turn getDisplayableMessage into computed later
    methods: {
        getDisplayableMessage(message, reply) {
            if (data.loadedUsers.get(data.userID).blocked.includes(message.userID)) return "Message from blocked user"
            let text = ""
            let name = message.userID
            if (name) name = message.userID !== -1 ? data.loadedUsers.get(name).username : "Server"
            console.log("message", message)
            if (!reply && message.replyingTo && message.replyingTo !== -1) {
                text += this.getDisplayableMessage(data.loadedConversations.get(data.openConversationID).texts.find(text => text.messageID === message.replyingTo), true) + '\n'
            }
            text += name + ": " + this.addLinks(message.message)
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