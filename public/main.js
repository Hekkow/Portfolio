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
        // console.log(message)
        let type = message.type
        switch (type) {
            case Type.ONLINEUSERSUPDATE:
                updateLocalUsers(message.users)
                data.currentlyOnlineUsers = message.users.filter(user => user && user.userID !== data.userID && !data.loadedUsers.get(data.userID).blocked.includes(user.userID))
                // updateUserList(message.users)
                break
            case Type.RECEIVEUSERNAME:
                setUp(message.user)
                break
            case Type.LOADLOCALDATA:
                loadLocalData(message)
                break
        }
    }
}
function setUp(user) {
    updateLocalUsers(user)
    data.userID = user.userID
    // $('#loggedInUsername').text(username)
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
    // $("#activeConversations").empty()
    updateLocalConversations(data.conversations)

    // for (let conversationID of loadedUsers.get(userID).conversations) {
    //     let conversation = loadedConversations.get(conversationID)
    //     updateConversation(conversation)
    //     showNewConversationButton(conversation)
    // }
    // showOfflineNotifications()
}
export function openConversation(conversationID) {
    if (conversationID === -1) return
    data.openConversationID = conversationID
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
window.sendMessage = sendMessage
window.openConversation = openConversation