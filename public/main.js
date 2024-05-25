// GLITCHES
// sometimes shows duplicated users

let userID = Cookies.get(loginCookie)
let username
let ws
let loadedConversations = new Map()
let loadedUsers = new Map()
if (!userID) window.location.href = '/'
else {
    userID = parseInt(userID)
    connection()
}
let replyingTo = -1
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
        case Type.LOADLOCALDATA:
            loadLocalData(message)
            break
        case Type.STARTCONVERSATION:
            openConversation(message.conversation)
            break
        case Type.REQUESTCONVERSATION:
            updateConversationButton(message.conversation)
            break
        case Type.NEWMESSAGE:
            receivedMessage(message.message)
            break
        case Type.FIRSTMESSAGE:
            receivedFirstMessage(message)
        case Type.DELETEMESSAGE:
            receivedDeletedMessage(message.messageID)
            break
    }

}
function setUp(user) {
    username = user.username
    // $('#loggedInUsername').text(username)
}
function receivedFirstMessage(data) {
    loadedConversations.set(data.conversation.conversationID, data.conversation)
    updateConversationButton(data.conversation.conversationID)
}
function receivedMessage(message) {
    if (message.conversationID === getOpenConversation()) {
        if (loadedUsers.get(message.userID).username === username) updateMessageID(message)
        else showMessage(message, false)
    }
    // i suspect below will cause problems later
    // i should've written down why because now i forget but this'll be the first suspect if i have another issue
    if (loadedConversations.has(message.conversationID)) {
        loadedConversations.get(message.conversationID).texts.push(message)
        updateConversationButton(message.conversationID)
    }
    else {
        ws.send(JSON.stringify({type: Type.REQUESTCONVERSATION, conversationID: message.conversationID}))
    }

}
function receivedDeletedMessage(messageID) {
    $(`.messageDiv[messageID='${messageID}']`).remove()
    $(`.messageDiv[replyingTo='${messageID}']`).find('.replyText').text("Replying to: Deleted Message")
    if (messageID === replyingTo) deleteReply()
    let conversationBlock = $(`.conversationBlock[messageID=${messageID}]`) // this should always work i think

    if (conversationBlock.length) {
        let conversationID = parseInt(conversationBlock.attr('conversationID'))
        if (loadedConversations.has(conversationID)) {
            let texts = loadedConversations.get(conversationID).texts
            console.log(texts)
            texts.splice(texts.findIndex(message => message.messageID === messageID))
        }
        updateConversationButton(conversationID)
    }
}
function getOpenConversation() { // why did i not just set a variable?? am i stupid??
    return parseInt($('#conversation').attr('conversationID'))
}
function loadLocalData(data) {
    $("#activeConversationsList").empty()
    updateLocalUsers(data.users)
    for (let conversation of data.conversations) {
        loadedConversations.set(conversation.conversationID, conversation)
        updateConversationButton(conversation.conversationID)
    }
}
function updateLocalUsers(users) {
    for (let user of users) {
        loadedUsers.set(user.userID, user)
    }
}
function updateConversationButton(conversationID) {
    let activeConversationsDiv = $("#activeConversationsList")
    console.log("hra", conversationID, loadedConversations)
    let conversation
    if (conversationID.conversationID) conversation = loadedConversations.get(conversationID.conversationID)
    else conversation = loadedConversations.get(conversationID)
    let usernames = conversation.users.map(userID => loadedUsers.get(userID).username).filter(user => user !== username)
    let lastMessage = conversation.texts[conversation.texts.length - 1]
    let text
    if (lastMessage) text = usernames + "<br>" + loadedUsers.get(conversation.users.filter(userID => loadedUsers.get(userID).userID === lastMessage.userID)[0]).username + ": " + lastMessage.message
    else text = usernames
    let conversationButton = $(`button[conversationID=${conversation.conversationID}]`)
    if (!conversationButton.length) {
        activeConversationsDiv.append(`
            <button class="conversationBlock" conversationID="${conversationID}" onclick="openConversation(${conversationID})" messageID="${lastMessage.messageID}">
                <div class="userPic"></div>
                <div class="activeConversationListButtonText">${text}</div>
            </button>`)
    }
    else {
        conversationButton.find('.activeConversationListButtonText').html(text)
        conversationButton.attr('messageID', lastMessage.messageID)
    }

}
function openConversation(conversation) {
    console.log("HEREHRAHEFAHEGHAEG", conversation)
    if (!conversation.conversationID) conversation = loadedConversations.get(conversation)
    else if (!loadedConversations.has(conversation.conversationID)) loadedConversations.set(conversation.conversationID, conversation)
    $('#conversation').attr('conversationID', conversation.conversationID)
    openConversationArea()
    for (let message of conversation.texts) {
        showMessage(message, loadedUsers.get(message.userID).username === username)
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
    let message = {conversationID: conversationID, userID: userID, message: text, replyingTo: replyingTo}
    showMessage(message, true)
    ws.send(JSON.stringify({type: Type.NEWMESSAGE, message: message}))
    deleteReply()
}
function updateMessageID(message) {
    let toSetMessageID = $('div').filter('[messageID="undefined"]').first()
    if (toSetMessageID) toSetMessageID.attr('messageID', message.messageID)
}
function getReplyAboveText(message) {
    if (message.replyingTo === -1) return ""
    let reply = '<p class="replyText">Replying to: '
    let replyingToDiv = $(`div[messageID="${message.replyingTo}"]`)
    if (replyingToDiv.length > 0) reply += getMessageText(replyingToDiv)
    else reply += "Deleted message"
    return reply + '</p>'
}
function getName(message) {
    let name = message.userID
    console.log(loadedUsers)
    console.log(message, loadedUsers.get(name))
    if (name) name = loadedUsers.get(name).username
    else name = username
    return name
}
function showMessage(message, local) {
    let name = getName(message)
    let messages = $('#messages')
    let reply = getReplyAboveText(message)
    let sendableMessage = message.message
    // console.log("name", name)
    sendableMessage = addLinks(sendableMessage)
    messages.append(`<div class='messageDiv' messageID=${message.messageID} replyingTo=${message.replyingTo}><div class='messageTextDiv'>${reply}<p class='messageText'>${name}: ${sendableMessage}</p></div></div>`)
    let messageDiv = $('.messageDiv[messageID=' + message.messageID + ']')
    if (local) messageDiv.addClass('myText');
    messages.scrollTop(messages.prop("scrollHeight"))
    messageDiv.hover(function() {
        showHoverButtons($(this), local)
    }, function() {
        hideHoverButtons($(this))
    })
    if (message.replyingTo !== -1) {
        messageDiv.click(function() {
            scrollToMessage(message.replyingTo)
        })
    }
}
function addLinks(text) {
    let pattern = /\b(?:https?:\/\/)?(?:www\.)?\w+\.\w+(?:\/\S*)?\b/g;
    let match;
    let indices = [];
    while ((match = pattern.exec(text)) !== null) {
        indices.push({ match: match[0], index: match.index });
    }
    for (let i = indices.length - 1; i >= 0; i--) {
        let url = indices[i].match;
        if (!(url.startsWith('http://') || url.startsWith('https://'))) url = 'https://' + url;
        let start = indices[i].index;
        let end = start + indices[i].match.length;
        text = text.slice(0, end) + '</a>' + text.slice(end);
        text = text.slice(0, start) + `<a target='_blank' href='${url}'>` + text.slice(start);
    }

    return text;
}
function showHoverButtons(div, local) {
    if (local) div.prepend(`<div class='deleteButton'></div><div class='replyButton'></div>`)
    else div.append(`<div class='replyButton'></div>`)
    div.find('.deleteButton').click(function(e) {
        e.stopPropagation()
        deleteMessage(div)
    })
    div.find('.replyButton').click(function(e) {
        e.stopPropagation()
        replyMessage(div)
    })
}
function hideHoverButtons(div) {
    div.find('.replyButton').remove()
    div.find('.deleteButton').remove()
}
function scrollToMessage(messageID) {
    let scrollToMessage = $(`.messageDiv[messageID=${messageID}]`)
    let messages = $('#messages')
    let targetPosition = scrollToMessage.offset().top - messages.offset().top + messages.scrollTop();
    messages.scrollTop(targetPosition);
    scrollToMessage.css('background-color', 'red')
    scrollToMessage.animate({backgroundColor: 'white'}, 500)
}
function replyMessage(messageDiv) {
    let replyBar = $('#replyBar')
    replyBar.addClass('active')
    replyBar.text(getMessageText(messageDiv))
    replyingTo = parseInt(messageDiv.attr('messageID'))
    $('#messageInput').focus()
}
function getMessageText(messageDiv) {
    return messageDiv.find('p.messageText').text()
}
function deleteReply() {
    let replyBar = $('#replyBar')
    replyBar.removeClass('active')
    replyBar.text("")
    replyingTo = -1
    $('#messageInput').focus()
}
function deleteMessage(messageDiv) {
    let messageID = parseInt(messageDiv.attr('messageID'))
    messageDiv.remove()
    ws.send(JSON.stringify({type: Type.DELETEMESSAGE, messageID: messageID, user: userID, conversationID: getOpenConversation()}))
}
function updateUserList(users) {
    let currentlyOnlineUsersDiv = $('#currentlyOnlineUsers')
    currentlyOnlineUsersDiv.empty()
    updateLocalUsers(users)
    for (let user of users) {
        if (!user) continue
        if (user.userID !== userID) currentlyOnlineUsersDiv.append(`<button class="userBlock" onclick="startNewConversation(${user.userID})"><div class="userPic"></div><div class="onlineUserListButtonText">${user.username}</div></button>`)
    }
}
function startNewConversation(receivingUserID) {

    openConversationArea()
    let users = [receivingUserID, userID]
    for (const [key, value] of loadedConversations.entries()) {

        value.users.sort()
        users.sort()
        console.log("herawr", value.users, users)
        if (value.users.length === users.length && value.users.every((user, index) => user === users[index])) {
            console.log(loadedConversations.get(key))
            openConversation(loadedConversations.get(key))
            return
        }
    }
    console.log("HERERAHWEFOA")
    ws.send(JSON.stringify({type: Type.STARTCONVERSATION, conversationID: [receivingUserID, userID]}))
}
$(window).on('focus', function() {
    $('#messageInput').focus()
})