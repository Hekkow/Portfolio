import {data} from "./data.js";
import {
    deleteMessage,
    openConversation,
    shortenText,
    showConversationPopup,
    showMessagePopup,
    startEdit
} from "../chat.js";
export default {
    data() {
        return {
            data: data,
            messageHovered: false,
            highlighted: false,
            mouseDownInterval: null,
        }
    },
    template: `
      <div class='messageDiv'
           :class="{myText: myText, highlighted: highlighted, hasReply: message.replyingTo !== -1}"
           @mouseenter="onMouseEnter()"
           @mouseleave="messageHovered = false"
           ref="messageDiv"
      >
        <div class="messageProfilePicHolder">
          <profile-pic v-if="showProfilePic" :size=50 :userid="message.userID"/>
        </div>
        
        <div class='messageBubble' ref='messageBubble'
             @mousedown="onMouseDown($event)" @touchstart="onMouseDown($event)"
             @mouseup="onMouseUp" @touchend="onMouseUp"
        >
          <div 
              :class="{myText: myText, replyBubble: true}" 
              v-if="message.replyingTo !== -1"
              @click="() => this.$emit('reply-clicked', message.replyingTo)"
          >
            <profile-pic :userid="reply.userID" :size="21" :class="{replyProfilePic: true, myText: replyMyText, notMyText: !replyMyText}"></profile-pic>
            {{shortenText(reply.message, 600)}}
          </div>
          <div class='messageTextDiv'>
            <p class='messageText' :style="{ color: message.messageID && message.messageID !== -1 ? 'var(--message-bubble-text-color)' : 'gray'}" v-html="getDisplayableMessage(message)"></p>
          </div>
          <div :class="{readIndicators: true, myText: myText, notMyText: !myText}" v-if="readUsers.length > 0">
            <profile-pic v-for="userID of readUsers.filter(id => !blockedUsers.includes(id))" :size="22" :userid="userID" :class="{readIndicatorsProfilePic: true, myText: myText, notMyText: !myText}"></profile-pic>
          </div>
        </div>
        <div class="hoverButtons" ref="hoverButtons" v-show="messageHovered && !data.mobile">
          <button v-show="data.userID === message.userID" :class="{hoverButton: true, myText: myText, smallButton: true}"  @click="deleteMessage(message.messageID)"><icon icon="Delete" :fit="true"/></button>
          <button v-show="data.userID === message.userID" :class="{hoverButton: true, myText: myText, smallButton: true}" @click="startEdit(message.messageID)"><icon icon="Edit" :fit="true"/></button>
          <button :class="{hoverButton: true, myText: myText, smallButton: true}"  @click="data.replyingTo = message.messageID; data.editing = -1"><icon icon="Reply" :fit="true"/></button>
        </div>
      </div>
    `,
    computed: {
        readUsers() {
            if (!data.read.has(data.openConversationID)) return []
            return data.read.get(data.openConversationID).filter(
                read => read.messageID === this.message.messageID && read.userID !== this.message.userID && read.userID !== data.userID
            ).map(read => read.userID)
        },
        myText() {
            return data.userID === this.message.userID
        },
        reply() {
            return data.loadedConversations.get(data.openConversationID).texts.find(text => text.messageID === this.message.replyingTo)
        },
        replyMyText() {
            return data.userID === this.reply.userID
        },
        blockedUsers() {
            if (!data.loadedUsers.has(data.userID)) return []
            return data.loadedUsers.get(data.userID).blocked
        }
    },
// turn getDisplayableMessage into computed later
    methods: {
        onMouseDown(event) {
            data.messagePopupID = -1
            this.mouseDownInterval = setTimeout(() => {
                if (!this.message) return
                data.messageLongPressed = true
                showMessagePopup(this.message.messageID, event)
            }, 600)
        },
        onMouseUp() {
            clearTimeout(this.mouseDownInterval)
        },
        shortenText,
        startEdit,
        deleteMessage,
        onMouseEnter() {
            if (this.messageHovered) return
            this.messageHovered = true
            this.$nextTick(() => {
                this.$refs.hoverButtons.style.top = (this.$refs.messageBubble.offsetHeight/2 - this.$refs.hoverButtons.offsetHeight/2) + 'px'
            })
        },
        getDisplayableMessage(message, reply) {
            if (!data.loadedUsers.has(data.userID)) return this.addLinks(message.message)
            if (data.loadedUsers.get(data.userID).blocked.includes(message.userID)) return "Message from blocked user"
            return this.addLinks(message.message)
        },
        addLinks(text) {
            // regex for finding url
            let pattern = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&\/=]*)/g
            let match
            let indices = []
            // goes through every time text matches pattern and adds that to indices
            while ((match = pattern.exec(text)) !== null) {
                indices.push({match: match[0], index: match.index})
            }
            // for every link in the text, starting from end to beginning to not shift indices
            for (let i = indices.length - 1; i >= 0; i--) {
                let url = indices[i].match
                if (!(url.startsWith('http://') || url.startsWith('https://'))) url = 'https://' + url
                let extension = url.split('.').pop().toLowerCase()
                let start = indices[i].index
                let end = start + indices[i].match.length

                // adds video/image
                if (['mp4', 'flv', 'mov', 'avi', 'webm', 'mkv'].includes(extension)) {
                    text = text.slice(0, start) + `<video controls><source src=${url} type="video/${extension}"></video>` + text.slice(end)
                } else if (['jpeg', 'jpg', 'gif', 'png', 'avif', 'svg'].includes(extension)) {
                    text = text.slice(0, start) + `<img alt="" src="${url}">` + text.slice(end)
                }
                else {
                    // add a tags from start to end to not shift start/end
                    text = text.slice(0, end) + '</a>' + text.slice(end)
                    text = text.slice(0, start) + `<a target='_blank' href='${url}'>` + text.slice(start)
                }
            }
            return text;
        },
        replyHighlight() {
            let message = this.$refs.messageDiv
            message.scrollIntoView({ behavior: 'smooth' })
            this.highlighted = true
            setTimeout(() => { // doesn't work with nextTick
                this.highlighted = false
            }, 1)
        },
    },
    props: {
        message: {
            type: Object
        },
        showProfilePic: {
            type: Boolean
        }
    }
}