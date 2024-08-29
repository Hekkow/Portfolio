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
import ModalButton from "./ModalButton.js";
import ShapesList from "./ProfilePicCreator/ShapesList.js";
import ShapeItem from "./ProfilePicCreator/ShapeItem.js";
import ProfilePictureCreator from "./ProfilePicCreator/ProfilePictureCreator.js";
import UserProfilePopup from "./UserProfilePopup.js";
import TypingBar from "./TypingBar.js";
import ReplyBar from "./ReplyBar.js";
import UserInfoPanel from "./UserInfoPanel.js";
import Settings from "./Settings.js";
import LoadingOverlay from "./LoadingOverlay.js";
import ModalTitle from "./ModalTitle.js";
import Dropdown from "./Dropdown.js";
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
app.component('modal-button', ModalButton)
app.component('shapes-list', ShapesList)
app.component('shape-item', ShapeItem)
app.component('profile-picture-creator', ProfilePictureCreator)
app.component('user-profile-popup', UserProfilePopup)
app.component('typing-bar', TypingBar)
app.component('reply-bar', ReplyBar)
app.component('user-info-panel', UserInfoPanel)
app.component('settings', Settings)
app.component('loading-overlay', LoadingOverlay)
app.component('modal-title', ModalTitle)
app.component('dropdown', Dropdown)
export default app