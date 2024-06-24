import App from '/components/App.js'
import {data} from '/components/data.js'
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
                data.currentlyOnlineUsers = message.users.filter(user => user && user.userID !== data.userID && !data.loadedUsers.get(data.userID).blocked.includes(user.userID))
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
            case Type.REQUESTCONVERSATION:
                let user = data.loadedUsers.get(data.userID)
                user.conversations = [...new Set(user.conversations), message.conversation.conversationID] // adds to conversations only if its not there
                updateLocalConversations(message.conversation)
                break

        }
    }
}
function setUp(user) {
    updateLocalUsers(user)
    data.userID = user.userID
}
function updateLocalUsers(users) {
    if (Array.isArray(users)) {
        for (let user of users) {
            data.loadedUsers.set(user.userID, user)
        }
    } else data.loadedUsers.set(users.userID, users)
}
function updateLocalConversations(conversations) {
    if (Array.isArray(conversations)) {
        for (let conversation of conversations) {
            data.loadedConversations.set(conversation.conversationID, conversation)
        }
    } else data.loadedConversations.set(conversations.conversationID, conversations)
}
function loadLocalData(data) {
    updateLocalConversations(data.conversations)
}
function receivedNewMessage(message) {
    if (!data.loadedConversations.has(message.conversationID)) {
        ws.send(JSON.stringify({ type: Type.REQUESTCONVERSATION, conversationID: message.conversationID, conversationType: direct }))
        return
    }
    if (message.userID === data.userID) data.loadedConversations.get(message.conversationID).texts.find(text => !text.messageID).messageID = message.messageID
    else data.loadedConversations.get(message.conversationID).texts.push(message)
}
export function openConversation(conversationID) {
    if (conversationID === -1) return
    data.openConversationID = conversationID
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
        date: new Date()
    }
    data.loadedConversations.get(data.openConversationID).texts.push(message)
    // showMessage(message, true)
    ws.send(JSON.stringify({type: Type.NEWMESSAGE, message: message}))
}
$('#messageInput').keyup((event) => {
    if (event.key === "Enter" && !event.originalEvent.shiftKey) {
        event.preventDefault()
        sendMessage()
    }
})
export function deleteMessage(messageID) {
    let conversation = data.loadedConversations.get(data.openConversationID)
    conversation.texts = conversation.texts.filter(text => text.messageID !== messageID)
    ws.send(JSON.stringify({
        type: Type.DELETEMESSAGE,
        messageID: messageID,
        user: data.userID,
        conversationID: data.openConversationID
    }))
}
window.sendMessage = sendMessage
window.deleteMessage = deleteMessage
// window.openConversation = openConversation