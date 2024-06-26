import UserBlock from './UserBlock.js'
import UserList from "./UserList.js"
import {data} from './data.js'
import ProfilePic from "./ProfilePic.js"
import ConversationBlock from "./ConversationBlock.js";
import Message from "./Message.js";
import Messages from "./Messages.js";
import HoverButtons from "./HoverButtons.js";
import MessageInput from "./MessageInput.js";
import ParticipantBlock from "./ParticipantBlock.js";
import GroupChatButtons from "./GroupChatButtons.js";
import Modal from "./Modal.js";
import UserCheckbox from "./UserCheckbox.js";
const app = Vue.createApp({
    data() {
        return {
            data: data,

        }
    }
});
app.component('user-block', UserBlock)
app.component('user-list', UserList)
app.component('profile-pic', ProfilePic)
app.component('data', data)
app.component('conversation-block', ConversationBlock)
app.component('message', Message)
app.component('messages', Messages)
app.component('hover-buttons', HoverButtons)
app.component('message-input', MessageInput)
app.component('participant-block', ParticipantBlock)
app.component('group-chat-buttons', GroupChatButtons)
app.component('modal', Modal)
app.component('user-checkbox', UserCheckbox)
export default app