let userID = Cookies.get(loginCookie)
let username
let ws
let openConversationID = -1
let loadedConversations = new Map()
let loadedUsers = new Map()
if (!userID) window.location.href = '/'
else {
    userID = parseInt(userID)
    connection()
}
let replyingTo = -1
let editing = -1
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
                updateLocalConversations(message.conversation)
                openConversationID = message.conversation.conversationID
                break
            case Type.CONVERSATIONCREATED:
                updateLocalConversations(message.conversation)
                openConversationID = message.conversation.conversationID
                if (message.conversation.conversationType === group) showNewConversationButton(message.conversation)
                break
            case Type.REQUESTCONVERSATION:
                updateLocalConversations(message.conversation)
                showNewConversationButton(message.conversation)
                break
            case Type.INVITETOGROUPCHAT:
                updateLocalConversations(message.conversation)
                updateConversationButton(message.conversation.conversationID)
                break
            case Type.RENAMEGROUPCHAT:
                updateLocalConversations(message.conversation)
                updateConversationButton(message.conversation.conversationID)
                break
            case Type.NEWMESSAGE:
                receivedNewMessage(message.message)
                break
            case Type.FIRSTMESSAGE:
                receivedNewFirstMessage(message)
                break
            case Type.DELETEMESSAGE:
                receivedDeletedMessage(message.messageID)
                break
            case Type.EDITMESSAGE:
                receivedEditedMessage(message.message)
        }
    }
}
function setUp(user) {
    updateLocalUsers(user)
    username = user.username
    // $('#loggedInUsername').text(username)
}
function receivedNewFirstMessage(data) {
    // for when both users open the conversation before one sends a message
    if (data.conversation.conversationID === openConversationID) receivedNewMessage(data.message)
    else {
        loadedConversations.set(data.conversation.conversationID, data.conversation)
        showNewConversationButton(data.conversation)
    }


}
function receivedNewMessage(message) {
    if (!loadedConversations.has(message.conversationID)) {
        ws.send(JSON.stringify({type: Type.REQUESTCONVERSATION, conversationID: message.conversationID}))
        return
    }
    loadedConversations.get(message.conversationID).texts.push(message)

    if (message.conversationID === openConversationID) {
        updateMessageID(message)
        if (loadedUsers.get(message.userID).username !== username) showMessage(message, false)
    }
    showOrUpdateConversationButton(message.conversationID)

}
function receivedEditedMessage(message) { // lots of duplicate code here with update message
    let messageDiv = $(`.messageDiv[messageID=${message.messageID}]`)
    messageDiv.find('.messageText').text(`${loadedUsers.get(message.userID).username}: ${message.message}`)
    messageDiv.removeClass('localMessage')
    updateTextsAndButton(message.messageID, "Edit", message)
}

function receivedDeletedMessage(messageID) {
    $(`.messageDiv[messageID='${messageID}']`).remove()
    $(`.messageDiv[replyingTo='${messageID}']`).find('.replyText').text("Replying to: Deleted Message")
    if (messageID === replyingTo) closeReplyBar()
    updateTextsAndButton(messageID, "Delete")
}
function updateTextsAndButton(messageID, mode, message) {
    let conversationBlock = $(`.conversationBlock[messageID=${messageID}]`)
    if (conversationBlock.length) {
        let conversationID = parseInt(conversationBlock.attr('conversationID'))
        if (loadedConversations.has(conversationID)) {
            let texts = loadedConversations.get(conversationID).texts
            if (mode === "Edit") texts[texts.findIndex(text => text.messageID === messageID)].message = message.message
            else if (mode === "Delete") texts.splice(texts.findIndex(text => text.messageID === messageID))
        }
        updateConversationButton(conversationID)
    }
}
function showOrUpdateConversationButton(conversationID) {
    if ($(`.conversationBlock[conversationID=${conversationID}]`).length) updateConversationButton(conversationID)
    else showNewConversationButton(loadedConversations.get(conversationID))
}
function showNewConversationButton(conversation) {
    let conversationID = conversation.conversationID
    let activeConversationsDiv = $("#activeConversationsListUp")
    let stuff = getTextForConversationButton(conversation)
    if ($(`.conversationBlock[conversationID=${conversationID}]`).length) return
    let newConversationBlock = $(`
            <button class="conversationBlock" conversationID="${conversationID}" onclick="openConversation(${conversationID})" messageID="${stuff.messageID}" date="${stuff.date}">
                <div class="userPic"></div>
                <div class="activeConversationListButtonText">${stuff.text}</div>
            </button>`)
    // places it in order of most recent texts
    let placed = false
    $('.conversationBlock').each(function() {
        if (new Date($(this).attr('date')) < new Date(stuff.date)) {
            newConversationBlock.insertBefore($(this))
            placed = true
            return false
        }
    })
    if (!placed) activeConversationsDiv.append(newConversationBlock)
    let conversationDiv = $(`.conversationBlock[conversationID="${conversationID}"]`)
    conversationDiv.hover(function() {
        showConversationHoverButtons($(this))
    }, function() {
        hideConversationHoverButtons($(this))
    })
}
function updateConversationButton(conversationID) {
    let conversation = loadedConversations.get(conversationID)
    let stuff = getTextForConversationButton(conversation)
    let conversationButton = $(`.conversationBlock[conversationID=${conversation.conversationID}]`)
    conversationButton.find('.activeConversationListButtonText').html(stuff.text)
    conversationButton.attr('messageID', stuff.messageID)
    conversationButton.attr('date', stuff.date)
    if ($('.conversationBlock').length > 1) conversationButton.detach().insertBefore('.conversationBlock:first')
}
function showConversationHoverButtons(div) {
    div.append(`<div class='deleteButton'>`)
    div.find('.deleteButton').click(function(e) {
        e.stopPropagation()
        ws.send(JSON.stringify({type: Type.CLOSECONVERSATION, userID: userID, conversationID: parseInt(div.attr('conversationID'))}))
        div.remove()
        closeConversationArea()
    })
}
function hideConversationHoverButtons(div) {
    div.find('.deleteButton').remove()
}
function getTextForConversationButton(conversation) {
    let conversationName
    let lastMessage = conversation.texts[conversation.texts.length - 1]
    let lastMessageText = lastMessage ? lastMessage.message : ""
    let lastTextUsername = lastMessage ? loadedUsers.get(conversation.users.filter(userID => loadedUsers.get(userID).userID === lastMessage.userID)[0]).username : ""
    if (lastMessageText.length > 18) lastMessageText = lastMessageText.substring(0, 15) + "..."
    if (conversation.conversationType === direct) {
        conversationName = conversation.users.map(userID => loadedUsers.get(userID).username).filter(user => user !== username)
    }
    else if (conversation.conversationType === group) {
        conversationName = conversation.conversationName
        if (!conversationName) conversationName = conversation.users.map(userID => loadedUsers.get(userID).username).filter(user => user !== username)
    }
    let text = conversationName
    if (lastMessage) text += "<br>" + lastTextUsername + ": " + lastMessageText
    return {messageID: lastMessage ? lastMessage.messageID : -1, text: text, date: lastMessage ? lastMessage.date : new Date()}
}


function loadLocalData(data) {
    $("#activeConversationsListUp").empty()
    updateLocalUsers(data.users)
    updateLocalConversations(data.conversations)
    for (let conversationID of loadedUsers.get(userID).conversations) {
        showNewConversationButton(loadedConversations.get(conversationID))
    }
}
function updateLocalUsers(users) {
    if (Array.isArray(users)) {
        for (let user of users) {
            loadedUsers.set(user.userID, user)
        }
    }
    else loadedUsers.set(users.userID, users)
}
function updateLocalConversations(conversations) {
    if (Array.isArray(conversations)) {
        for (let conversation of conversations) {
            loadedConversations.set(conversation.conversationID, conversation)
        }
    }
    else loadedConversations.set(conversations.conversationID, conversations)
}
function openConversation(conversationID) {
    if (loadedConversations.get(conversationID).texts.length > 0) showNewConversationButton(loadedConversations.get(conversationID))
    openConversationID = conversationID
    openConversationArea()
    for (let message of loadedConversations.get(conversationID).texts) {
        showMessage(message, loadedUsers.get(message.userID).username === username)
    }
}
function startNewConversation(receivingUserID) {
    openConversationArea()
    let users = [receivingUserID, userID]
    for (const [key, value] of loadedConversations.entries()) {
        value.users.sort()
        users.sort()
        if (value.conversationType === direct && value.users.length === users.length && value.users.every((user, index) => user === users[index])) {
            openConversation(value.conversationID)
            return
        }
    }
    ws.send(JSON.stringify({type: Type.STARTCONVERSATION, conversationID: [receivingUserID, userID], conversationType: direct}))
}
function openConversationArea() {
    $('#messages').empty()
    loadMessageInput()
}
function closeConversationArea() {
    $('#messages').empty()
    openConversationID = -1
    $('#messageInputDiv').empty()
}
function loadMessageInput() {
    let conversationDiv = $('#messageInputDiv')
    conversationDiv.empty()
    conversationDiv.append('<textarea id="messageInput" autofocus></textarea><button id="messageSendButton" onclick="sendMessage()"></button>')
    let messageInput = $('#messageInput')
    messageInput.on('input', function() {
        resizeMessageInput()
    })
    messageInput.focus()

    messageInput.keyup((event) => {
        if (event.key === "Enter" && !event.originalEvent.shiftKey) {
            event.preventDefault()
            sendMessage()
        }
    })
}
function resizeMessageInput() {
    let messageInput = $('#messageInput')
    messageInput.css('height', 'auto')
    messageInput.css('height', messageInput[0].scrollHeight + 'px')
    scrollToBottom()
}
function sendMessage() {
    let messageInput = $('#messageInput')
    let text = messageInput.val().trim()
    messageInput.val("")
    messageInput.focus()
    if (!text || !text.trim()) return
    if (editing === -1) {
        let message = {conversationID: openConversationID, userID: userID, message: text, replyingTo: replyingTo, date: new Date()}
        showMessage(message, true)
        ws.send(JSON.stringify({type: Type.NEWMESSAGE, message: message}))
    }
    else {
        let message = {conversationID: openConversationID, userID: userID, message: text, date: new Date(), messageID: editing}
        updateMessage(message)
        ws.send(JSON.stringify({type: Type.EDITMESSAGE, message: message}))
    }
    resizeMessageInput()
    closeReplyBar()
}
function showMessage(message, local) {
    let name = getName(message)
    let messages = $('#messages')
    let reply = getReplyAboveText(message)
    let sendableMessage = message.message
    sendableMessage = addLinks(sendableMessage)
    messages.append(`<div class='messageDiv' messageID=${message.messageID} replyingTo=${message.replyingTo}><div class='messageTextDiv'>${reply}<p class='messageText'>${name}: ${sendableMessage}</p></div></div>`)
    let messageDiv = $('.messageDiv[messageID=' + message.messageID + ']')
    if (local) {
        messageDiv.addClass('myText');
        if (message.messageID === undefined) messageDiv.addClass('localMessage')
    }
    scrollToBottom()
    messageDiv.hover(function() {
        showMessageHoverButtons($(this), local)
    }, function() {
        hideMessageHoverButtons($(this))
    })
    if (message.replyingTo !== -1) {
        messageDiv.click(function() {
            scrollToMessage(message.replyingTo)
        })
    }
}
function updateMessage(message) {
    let messageDiv = $(`.messageDiv[messageID=${message.messageID}]`)
    messageDiv.find('.messageText').text(`${loadedUsers.get(message.userID).username}: ${message.message}`)
    messageDiv.addClass('localMessage')
}
function updateMessageID(message) {
    if (loadedUsers.get(message.userID).username !== username) return
    let toSetMessageID = $('div').filter('[messageID="undefined"]').first()
    if (toSetMessageID) {
        toSetMessageID.attr('messageID', message.messageID)
        toSetMessageID.removeClass('localMessage')
    }
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
    if (name) name = loadedUsers.get(name).username
    else name = username
    return name
}

function scrollToBottom() {
    $('#messages').scrollTop($('#messages').prop("scrollHeight"))
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
function showMessageHoverButtons(div, local) {
    if (local) div.prepend(`<div class='deleteButton'></div><div class='replyButton'></div><div class='editButton'></div>`)
    else div.append(`<div class='replyButton'></div>`)
    div.find('.deleteButton').click(function(e) {
        e.stopPropagation()
        deleteMessage(div)
    })
    div.find('.replyButton').click(function(e) {
        e.stopPropagation()
        replyMessage(div)
    })
    div.find('.editButton').click(function(e) {
        e.stopPropagation()
        editMessage(div)
    })
}
function hideMessageHoverButtons(div) {
    div.find('.replyButton').remove()
    div.find('.deleteButton').remove()
    div.find('.editButton').remove()
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
    showReplyBar(messageDiv, "Reply")
    if (editing !== -1) {
        editing = -1
        $('#messageInput').val("")
    }
}
function editMessage(messageDiv) {
    showReplyBar(messageDiv, "Edit")
    $('#messageInput').val(loadedConversations.get(openConversationID).texts.find(text => text.messageID === editing).message)
}
function showReplyBar(messageDiv, mode) {
    let replyBar = $('#replyBar')
    replyBar.addClass('active')
    let messageID = parseInt(messageDiv.attr('messageID'))
    let replyBarText
    if (mode === "Reply") {
        replyingTo = messageID
        replyBarText = getMessageText(messageDiv)
    }
    else if (mode === "Edit") {
        editing = messageID
        replyBarText = "Editing"
    }
    replyBar.text(replyBarText)
    replyBar.html(replyBar.html() + '<div id="replyBarCloseButton"></div>')
    $('#replyBarCloseButton').click(() => { closeReplyBar() })
    scrollToBottom()
    $('#messageInput').focus()
}
function closeReplyBar() {
    let replyBar = $('#replyBar')
    replyBar.removeClass('active')
    replyBar.text("")
    replyingTo = -1
    editing = -1
    $('#messageInput').focus()
}
function getMessageText(messageDiv) {
    return messageDiv.find('p.messageText').text()
}

function deleteMessage(messageDiv) {
    let messageID = parseInt(messageDiv.attr('messageID'))
    messageDiv.remove()
    ws.send(JSON.stringify({type: Type.DELETEMESSAGE, messageID: messageID, user: userID, conversationID: openConversationID}))
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

function showCreateGroupChatPopup() {
    showGroupChatUsersList((key, value) => key === userID)
    $('#activeConversationsListDown').append(`<button id="groupChatCreateButton" onclick="createNewGroupChat()">Create</button>`)
}
function showInviteToGroupChatPopup() {
    if (openConversationID === -1) return
    showGroupChatUsersList((key, value) => key === userID || loadedConversations.get(openConversationID).users.includes(key))
    $('#activeConversationsListDown').append(`<button id="groupChatInviteButton" onclick="inviteToGroupChat()">Invite</button>`)
}
function showRenameGroupChatPopup() {
    if (openConversationID === -1) return
    $('#activeConversationsListDown').append(`<input type="text" id="groupChatRenameInput"><button id="groupChatRenameButton" onclick="renameGroupChat()">Rename</button>`)
}
function inviteToGroupChat() {
    ws.send(JSON.stringify({type: Type.INVITETOGROUPCHAT, conversationID: openConversationID, users: getCheckedUsers()}))
    removeGroupChatPopup()
}
function createNewGroupChat() {
    ws.send(JSON.stringify({type: Type.STARTCONVERSATION, conversationID: getCheckedUsers(), conversationType: group})) // conversationID here is users array
    removeGroupChatPopup()
}
function renameGroupChat() {
    ws.send(JSON.stringify({type: Type.RENAMEGROUPCHAT, conversationID: openConversationID, newName: $('#groupChatRenameInput').val()}))
    removeGroupChatPopup()
}
function getCheckedUsers() {
    let users = [userID]
    $('.groupChatUserInput:checked').each(function() { users.push(parseInt($(this).val())) })
    return users
}
function showGroupChatUsersList(condition) {

    removeGroupChatPopup()
    let div = $('#activeConversationsListDown')
    for (let [key, value] of loadedUsers) {
        if (condition(key, value)) continue
        div.append(`<input class="groupChatUserInput" type="checkbox" value=${key}><label class="groupChatUserLabel" for="${key}">${value.username}</label>`)
    }
}
function removeGroupChatPopup() {
    $('.groupChatUserInput').remove()
    $('.groupChatUserLabel').remove()
    $('#groupChatCreateButton').remove()
    $('#groupChatInviteButton').remove()
    $('#groupChatRenameInput').remove()
    $('#groupChatRenameButton').remove()
}

$(window).on('focus', function() {
    $('#messageInput').focus()
})