import App from '/components/App.js'
import {data} from '/components/data.js'
import {setupProfilePicCreator} from "./ProfilePictureCreation.js";
App.mount('#app')
let ws
let sessionID = Cookies.get(loginCookie)
if (!sessionID) window.location.href = '/'
else connection()
function connection() {
    let connectionRepeater
    ws = new WebSocket('ws://' + host + ':' + port + '/main')
    ws.onopen = () => {
        ws.send(JSON.stringify({type: Type.LOGIN, sessionID: sessionID}))
        console.log("Connected")
        clearInterval(connectionRepeater) // stops repeated reconnection attempts
        $('#loadingOverlay').css('display', 'none')
    }
    ws.onclose = () => {
        $('#loadingOverlay').css('display', 'block')
        connectionRepeater = setInterval(() => { // when connection broken, every 400ms, try to reconnect if possible
            if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
                console.log("Attempting to reconnect")
                connection()
            }
        }, 400)
    }
    ws.onmessage = (event) => {
        let message = JSON.parse(event.data)
        let type = message.type
        switch (type) {
            case Type.ONLINEUSERSUPDATE:
                updateLocalUsers(message.users)
                data.currentlyOnlineUsers = message.users.filter(user => user && user.userID !== data.userID).map(user => user.userID)
                break
            case Type.RECEIVEUSERNAME:
                setUp(message.user)
                break
            case Type.LOADLOCALDATA:
                loadLocalData(message)
                break
            case Type.BACKTOLOGIN:
                window.location.href = '/'
                break
            case Type.NEWMESSAGE:
                receivedNewMessage(message.message)
                break
            case Type.EDITMESSAGE:
                editMessage(message.message)
                break
            case Type.REQUESTCONVERSATION:
                let user = data.loadedUsers.get(data.userID)
                user.conversations = [...new Set([...user.conversations, message.conversation.conversationID])] // adds to conversations only if its not there
                updateLocalConversations([message.conversation])
                break
            case Type.CLOSECONVERSATION:
                updateLocalConversations([message.conversation])
                if (message.userID === data.userID) closeConversation(message.conversation.conversationID)
                break
            case Type.INVITETOGROUPCHAT:
                updateLocalConversations([message.conversation])
                let conversations = data.loadedUsers.get(data.userID).conversations
                if (!conversations.includes(message.conversation.conversationID)) conversations.push(message.conversation.conversationID)
                break
            case Type.RENAMEGROUPCHAT:
                updateLocalConversations([message.conversation])
                break
            case Type.TRANSFERLEADER:
                updateLocalConversations([message.conversation])
                break
            case Type.SAVEPROFILEPIC:
                updateProfilePicture(message.userID, message.profilePic)
                break
            case Type.BLOCKUSER:
                data.loadedUsers.get(message.userID).blocked.push(data.userID)
                break
            case Type.UNBLOCKUSER:
                // u is user, which i can't use because it's already declared in another case???????
                let u = data.loadedUsers.get(message.userID)
                u.blocked.splice(u.blocked.indexOf(data.userID), 1)
                break
            case Type.TYPING:
                data.typingConversations.set(message.conversationID, message.conversationTyping)
                break
            case Type.READMESSAGE:
                data.read.set(message.conversationID, Object.entries(message.read).map(([userID, messageID]) => ({userID: parseInt(userID), messageID: messageID})))
                break
        }
    }
}
function setUp(user) {
    updateLocalUsers([user])
    data.userID = user.userID
}
function updateLocalUsers(users) {
    for (let user of users) {
        data.loadedUsers.set(user.userID, user)
    }
}
function updateLocalConversations(conversations) {
    for (let conversation of conversations) {
        data.loadedConversations.set(conversation.conversationID, conversation)
    }
}
function loadLocalData(newData) { // very inefficient i do believe, gets called every time user joins
    updateLocalUsers(newData.users)
    updateLocalConversations(newData.conversations)
    data.shapes = new Map(Object.entries(data.loadedUsers.get(data.userID).profilePic).map(([key, value]) => [parseInt(key), value])) // not 100% sure this is needed
}
function receivedNewMessage(message) {
    if (!data.loadedConversations.has(message.conversationID)) {
        ws.send(JSON.stringify({ type: Type.REQUESTCONVERSATION, conversationID: message.conversationID, conversationType: direct }))
        return
    }
    if (message.userID === data.userID) data.loadedConversations.get(message.conversationID).texts.find(text => !text.messageID || text.messageID === -1).messageID = message.messageID
    else {
        addMessage(message)
        if (data.openConversationID === message.conversationID && !document.hidden) read(message.conversationID)
    }
}
export function updateTitleNotifications() {
    document.title = countNotifications() + ""
}
function countNotifications() {
    return $('[style*="font-weight: bold"]').length
}
$(window).focus(() => {
    read(data.openConversationID)
})
function read(conversationID) {
    if (conversationID === -1) return
    let conversation = data.loadedConversations.get(conversationID)
    let lastText = conversation.texts[conversation.texts.length - 1]
    if (!lastText) return
    if (lastText.userID === data.userID) return
    let messageID = lastText.messageID
    if (data.read.get(conversationID)?.find(read => read.userID === data.userID)?.messageID === messageID) return
    ws.send(JSON.stringify({type: Type.READMESSAGE, conversationID: conversationID, messageID: messageID, userID: data.userID}))
}
export function openConversation(conversationID) {
    if (conversationID === -1) return
    setTyping(false)
    read(conversationID)
    data.openConversationID = conversationID
    data.openModal = data.modals.None
}
export function leaveConversation(conversationID, userID) {
    if (conversationID === -1) return
    ws.send(JSON.stringify({type: Type.CLOSECONVERSATION, userID: userID, conversationID: conversationID, conversationType: data.loadedConversations.get(conversationID).conversationType}))
    if (userID === data.userID) closeConversation(conversationID)
}
function closeConversation(conversationID) {
    data.loadedConversations.delete(conversationID)
    let user = data.loadedUsers.get(data.userID)
    user.conversations = user.conversations.filter(c => c !== conversationID)
    if (conversationID === data.openConversationID) {
        data.openConversationID = -1
        data.openModal = data.modals.None
    }
}
export function startConversation(receivingUserID) {
    let users = [receivingUserID, data.userID]
    for (const [, conversation] of data.loadedConversations.entries()) {
        conversation.users.sort()
        users.sort()
        if (conversation.conversationType === direct && conversation.users.length === users.length && conversation.users.every((user, index) => user === users[index])) {
            openConversation(conversation.conversationID)
            return
        }
    }
    ws.send(JSON.stringify({ type: Type.REQUESTCONVERSATION, conversationID: [receivingUserID, data.userID], conversationType: direct }))
}

function editMessage(message) {
    data.loadedConversations.get(message.conversationID).texts.find(text => text.messageID === message.messageID).message = message.message
}
function addMessage(message) { // can't just push because for some reason vue isn't reacting
    let conversation = data.loadedConversations.get(message.conversationID)
    conversation.texts = [...conversation.texts, message]
}
export function sendMessage() {
    let messageInput = $('#messageInput')
    let text = messageInput.val().trim()
    messageInput.val("")
    messageInput.focus()
    if (!text || !text.trim()) return
    let message = {
        conversationID: data.openConversationID,
        userID: data.userID,
        message: text,
        date: new Date(),
        messageID: data.editing,
        replyingTo: data.replyingTo
    }
    let conversation = data.loadedConversations.get(data.openConversationID)
    // if blocked
    if (conversation.conversationType === direct && data.loadedUsers.get(conversation.users.find(userID => userID !== data.userID)).blocked.includes(data.userID)) {
        console.log("You're blocked")
    }
    else {
        if (data.editing === -1) addMessage(message)
        else editMessage(message)
        ws.send(JSON.stringify({type: data.editing === -1 ? Type.NEWMESSAGE : Type.EDITMESSAGE, message: message}))
    }
    closeReply()
}
function closeReply() {
    data.editing = -1
    data.replyingTo = -1
}
$('#messageInput').keydown((event) => {
    if (event.key === "Enter" && !event.originalEvent.shiftKey) {
        event.preventDefault()
        sendMessage()
        setTyping(false, true)
    }
})
let typing = false
$('#messageInput').on('input', (event) => {
    setTyping($('#messageInput').val().trim().length !== 0)
})
function setTyping(newTyping, local) {
    if (typing !== newTyping) {
        typing = newTyping
        if (!local) ws.send(JSON.stringify({type: Type.TYPING, conversationID: data.openConversationID, userID: data.userID, typing: typing}))
    }
}
export function deleteMessage(messageID) {
    let conversation = data.loadedConversations.get(data.openConversationID)
    conversation.texts = conversation.texts.filter(text => text.messageID !== messageID)
    ws.send(JSON.stringify({type: Type.DELETEMESSAGE, messageID: messageID, user: data.userID, conversationID: data.openConversationID}))
}
export function startEdit(messageID) {
    let conversation = data.loadedConversations.get(data.openConversationID)
    let messageInput = $('#messageInput')
    messageInput.val(conversation.texts.find(text => text.messageID === messageID).message)
    messageInput.focus()
    data.editing = messageID
}

export function createNewGroupChat() {
    ws.send(JSON.stringify({type: Type.REQUESTCONVERSATION, conversationID: [...data.createGroupChatUsers, data.userID], conversationType: group, leader: data.userID}))
    // conversationID here is users array
    // can replace [...data.createGroupChatUsers, data.userID] with just data.createGroupChatUsers and use leader on server side
}
export function inviteToGroupChat() {
    ws.send(JSON.stringify({type: Type.INVITETOGROUPCHAT, conversationID: data.openConversationID, users: data.createGroupChatUsers}))
}

export function renameGroupChat(newName) {
    ws.send(JSON.stringify({type: Type.RENAMEGROUPCHAT, conversationID: data.openConversationID, newName: newName}))
}
export function transferLeader() {
    ws.send(JSON.stringify({ type: Type.TRANSFERLEADER, conversationID: data.openConversationID, newLeader: data.createGroupChatUsers[0], originalLeader: data.userID }))
}
export function scrollToBottom() {
    let messages = $('#messages')
    // this doesnt work when loading chats because it starts at top and instantly returns
    // if (messages.prop("scrollHeight") - (messages.scrollTop() + messages.height()) > 100) return
    messages.scrollTop(messages.prop("scrollHeight"))
}
function isConversationWithBlocked(conversationID) {
    let conversation = data.loadedConversations.get(conversationID)
    return conversation.conversationType === direct &&
        conversation.users.some(userID => conversation.users.some(otherUserID => data.loadedUsers.get(userID).blocked.includes(otherUserID)))

}
export function getConversationName(conversationID) {
    let conversation = data.loadedConversations.get(conversationID)
    let conversationName = conversation.conversationName
    if (!conversationName) conversationName = conversation.users.filter(userID => userID !== data.userID).map(userID => data.loadedUsers.get(userID).username).join(', ')
    return conversationName
}

function startProfilePicCreator() {
    data.profilePictureOpen = true
    setupProfilePicCreator()
}


export function saveProfilePicture() {
    ws.send(JSON.stringify({type: Type.SAVEPROFILEPIC, userID: data.userID, profilePic: Object.fromEntries([...data.shapes])}))
    data.profilePictureOpen = false
    updateProfilePicture(data.userID, data.shapes)

}
function updateProfilePicture(userID, profilePic) {
    data.loadedUsers.get(userID).profilePic = profilePic
    data.loadedUsers = new Map(data.loadedUsers) // needed for reactivity
}

export function showUserPopup(userID, event) {
    event.stopPropagation()
    data.userPopupLocation = {x: event.pageX, y: event.pageY}
    data.userPopupID = userID
}
export function blockUser(userID) {
    data.loadedUsers.get(data.userID).blocked.push(userID)
    if (isConversationWithBlocked(data.openConversationID)) data.openConversationID = -1
    ws.send(JSON.stringify({type: Type.BLOCKUSER, userID: data.userID, blockedUserID: userID}))
}
export function unblockUser(userID) {
    let user = data.loadedUsers.get(data.userID)
    user.blocked.splice(user.blocked.indexOf(userID), 1)
    ws.send(JSON.stringify({type: Type.UNBLOCKUSER, userID: data.userID, blockedUserID: userID}))
}
function showBlockedUsersPopup() {
    data.openModal = data.modals.BlockedUsers
}
function logout() {
    Cookies.remove(loginCookie)
    window.location.href = '/'
}
$(document).click(event => {
    data.userPopupID = -1
})

function rejoinGeneral() {
    let howdyID = 3
    if (data.loadedConversations.has(howdyID)) return
    ws.send(JSON.stringify({type: Type.INVITETOGROUPCHAT, conversationID: howdyID, users: [data.userID]}))
}

window.rejoinGeneral = rejoinGeneral
window.showBlockedUsersPopup = showBlockedUsersPopup
window.getConversationName = getConversationName
window.startProfilePicCreator = startProfilePicCreator
window.logout = logout

// not sure if i need these
window.sendMessage = sendMessage
window.deleteMessage = deleteMessage
// window.openConversation = openConversation