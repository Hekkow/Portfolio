import UserBlock from './UserBlock.js'
import UserList from "./UserList.js"
import {data} from './data.js'
import ProfilePic from "./ProfilePic.js"
import ConversationBlock from "./ConversationBlock.js";
import Message from "./Message.js";
import Messages from "./Messages.js";
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
import Dropdown from "./Dropdown.js";
import {loadTheme, updateOpenConversationCookie, updateTitleNotifications} from "../chat.js";
import Popup from "./Popup.js";
import Settings from "./Settings.js";
import BlockedUser from "./BlockedUser.js";
import CensoredUser from "./CensoredUser.js";
import SettingsRow from "./SettingsRow.js";
import ThemeEditor from "./ThemeEditor.js";
import ThemeEditorRow from "./ThemeEditorRow.js";
import ControlButton from "./ProfilePicCreator/ControlButton.js";
import ChatInfoPanel from "./ChatInfoPanel.js";
import PopupButton from "./PopupButton.js";
import Icon from "./Icon.js";
import TransferLeaderRow from "./TransferLeaderRow.js";
import MobileNavigationButton from "./MobileNavigationButton.js";
import ConversationPopup from "./ConversationPopup.js";
import MessagePopup from "./MessagePopup.js";
const app = Vue.createApp({
    data() {
        return {
            data: data,
        }
    },
    watch: {
        'data.openConversationID': {
            handler() {
                updateTitleNotifications()
                updateOpenConversationCookie()

            }
        },
    },
    mounted() {
        loadTheme()
        let root = document.querySelector(':root')
        for (let [key, value] of data.theme.entries()) {
            root.style.setProperty(key, value)
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
app.component('dropdown', Dropdown)
app.component('popup', Popup)
app.component('settings', Settings)
app.component('blocked-user', BlockedUser)
app.component('censored-user', CensoredUser)
app.component('settings-row', SettingsRow)
app.component('theme-editor', ThemeEditor)
app.component('theme-editor-row', ThemeEditorRow)
app.component('control-button', ControlButton)
app.component('chat-info-panel', ChatInfoPanel)
app.component('popup-button', PopupButton)
app.component('icon', Icon)
app.component('transfer-leader-row', TransferLeaderRow)
app.component('mobile-navigation-button', MobileNavigationButton)
app.component('conversation-popup', ConversationPopup)
app.component('message-popup', MessagePopup)
export default app