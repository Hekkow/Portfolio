// GLITCHES
// sometimes shows duplicated users

let userID = Cookies.get(loginCookie)
let username
let ws
if (!userID) window.location.href = '/'
else {
    userID = parseInt(userID)
    connection()
}
let users = []
function connection() {
    let connectionRepeater
    ws = new WebSocket('ws://' + host + ':' + port + '/main')

    ws.onopen = () => {
        ws.send(JSON.stringify({type: Type.LOGIN, userID: userID}))
        console.log("Connected")
        clearInterval(connectionRepeater) // stops repeated reconnection attempts
    }
    ws.onclose = () => {
        connectionRepeater = setInterval(() => { // when connection broking, every 400ms, try to reconnect if possible
            if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
                console.log("Attempting to reconnect")
                connection()
            }
        }, 400)
    }
    ws.onmessage = (event) => {
        messaged(event)
    }
}
function messaged(event) {
    let message = JSON.parse(event.data)
    // console.log(message)
    let type = message.type
    switch (type) {
        case Type.ONLINEUSERSUPDATE:
            updateUserList(message.users)
            break
        case Type.RECEIVEUSERNAME:
            setUp(message.user)
            break
        case Type.BACKTOLOGIN:
            window.location.href = '/'
            break
        case Type.CONVERSATIONCREATED:
            addConversation(message.conversation)
            break
        case Type.LOADCONVERSATIONS:
            loadConversations(message.conversations)
            break
        case Type.OPENCONVERSATION:
            openConversation(message.conversation)
            break
        case Type.NEWMESSAGE:
            receivedMessage(message.message)
            break
        case Type.REQUESTCONVERSATION:
            showConversationButton(message.conversation)
            break
    }

}
function setUp(user) {
    username = user.username
    // $('#loggedInUsername').text(username)
}
function receivedMessage(message) {
    if (message.conversationID === getOpenConversation()) {
        showMessage(message)
    }
    else {
        ws.send(JSON.stringify({type: Type.REQUESTCONVERSATION, conversationID: message.conversationID}))
    }
}
function getOpenConversation() {
    return parseInt($('#conversation').attr('conversationID'))
}
function loadConversations(conversations) {
    $("#activeConversations").empty()
    for (let conversation of conversations) {
        showConversationButton(conversation)
    }
}
function showConversationButton(conversation) {
    let activeConversationsDiv = $("#activeConversations")
    if ($(`button[id=${conversation.conversationID}]`).length) return
    activeConversationsDiv.append(`<button id=${conversation.conversationID} onclick="requestConversation(${conversation.conversationID})">${conversation.users.map(user => user.username)}</button>`)
}
function addConversation(conversation) {
    $('#conversation').attr('conversationID', conversation.conversationID)
//     let activeConversationsDiv = $("#activeConversations")
//     if ($(`#${conversation.conversationID}`).length) return
//     activeConversationsDiv.append(`<button id=${conversation.conversationID} onclick="requestConversation(${conversation.conversationID})">${conversation.users.map(user => user.username)}</button>`)
}
function openConversation(conversation) {
    $('#conversation').attr('conversationID', conversation.conversationID)
    openConversationArea()
    for (let message of conversation.texts) {
        showMessage(message)
    }
}
function openConversationArea() {
    $('#messages').empty()
    loadMessageInput()
}
function loadMessageInput() {
    let conversationDiv = $('#messageInputDiv')
    conversationDiv.empty()
    conversationDiv.append('<input id="messageInput" type="text" autofocus><button id="messageSendButton" onclick="sendMessage()"></button>')
    let messageInput = $('#messageInput')
    messageInput.keyup((event) => {
        if (event.key === "Enter") {
            event.preventDefault()
            sendMessage()
        }
    })
    messageInput.focus()
}
function sendMessage() {
    let conversationID = getOpenConversation()
    let messageInput = $('#messageInput')
    let text = messageInput.val()
    messageInput.val("")
    messageInput.focus()
    if (!text || !text.trim()) return
    let message = {conversationID: conversationID, userID: userID, message: text}
    showMessage(message)
    ws.send(JSON.stringify({type: Type.NEWMESSAGE, message: message}))
}

function showMessage(message) {
    let name = message.user
    if (!name) name = username
    else name = name.username
    if (name === username) $('#messages').append(`<p class="myText">${name}: ${message.message}<p/>`)
    else $('#messages').append(`<p>${name}: ${message.message}<p/>`)
}
function requestConversation(conversationID) {
    ws.send(JSON.stringify({type: Type.OPENCONVERSATION, conversationID:conversationID}))
}
function updateUserList(users) {
    let currentlyOnlineUsersDiv = $('#currentlyOnlineUsers')
    currentlyOnlineUsersDiv.empty()

    for (let user of users) {
        if (!user) continue
        if (user.userID !== userID) currentlyOnlineUsersDiv.append(`<button class="userBlock" onclick="startNewConversation(${user.userID})"><div class="onlineUserListButtonPic"></div><div class="onlineUserListButtonText">${user.username}</div></button>`)
    }
}
function startNewConversation(user) {
    openConversationArea()
    ws.send(JSON.stringify({type: Type.STARTCONVERSATION, users: [user, userID]}))
}