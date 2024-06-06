// TONS of glitches now, gotta fix em all
// - remove read receipts from users that left conversation
// - notification remains if kicked from group chat
// - notification doesnt work often
// - doesn't work if multiple tabs of same user open
let userID = Cookies.get(loginCookie)
let username
let ws
let openConversationID = -1
let loadedConversations = new Map()
let loadedUsers = new Map()
let loadedReadMessages = [] // possibly switch to another data structure later
if (!userID) window.location.href = '/'
else {
    userID = parseInt(userID)
    connection()
}
let replyingTo = -1
let editing = -1
let typing = false
function connection() {
    let connectionRepeater
    ws = new WebSocket('ws://' + host + ':' + port + '/main')
    ws.onopen = () => {
        ws.send(JSON.stringify({type: Type.LOGIN, userID: userID}))
        console.log("Connected")
        clearInterval(connectionRepeater) // stops repeated reconnection attempts
        $('#loadingOverlay').css('display', 'none')
    }
    ws.onclose = () => {
        $('#loadingOverlay').css('display', 'block')
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
                conversationCreated(message.conversation)
                break
            case Type.CLOSECONVERSATION:
                updateConversation(message.conversation, "close", message.userID)
                break
            case Type.REQUESTCONVERSATION:
                updateLocalConversations(message.conversation)
                showNewConversationButton(message.conversation)
                break
            case Type.INVITETOGROUPCHAT:
                updateConversation(message.conversation)
                break
            case Type.RENAMEGROUPCHAT:
                updateConversation(message.conversation)
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
                break
            case Type.READMESSAGE:
                receivedReadMessage(message)
                break
            case Type.TYPING:
                receivedTyping(message)
                break
            case Type.NEWSERVERMESSAGE:
                receivedNewServerMessage(message)
                break
            case Type.TRANSFERLEADER:
                updateConversation(message.conversation)
                if (message.conversation.conversationID === openConversationID) {
                    openConversation(openConversationID)
                }
        }
    }
}
function updateConversation(conversation, mode, closedUserID) {
    updateLocalConversations(conversation)
    updateConversationButton(conversation.conversationID)
    updateChatParticipants(conversation)
    if (mode === "close" && closedUserID === userID) {
        $(`.conversationBlock[conversationID=${conversation.conversationID}]`).remove()
        if (openConversationID === conversation.conversationID) closeConversationArea()
    }
}
function receivedTyping(message) {
    if (message.conversationID !== openConversationID) return
    $('#typingIndicatorDiv').text(message.conversationTyping.filter(thisUserID => thisUserID !== userID).map(userID => loadedUsers.get(userID).username + " is typing, "))
}
function setUp(user) {
    updateLocalUsers(user)
    username = user.username
    // $('#loggedInUsername').text(username)
}
function conversationCreated(conversation) {
    updateLocalConversations(conversation)
    openConversation(conversation.conversationID)
    if (conversation.conversationType === group) showNewConversationButton(conversation)
}
function receivedNewFirstMessage(data) {
    // for when both users open the conversation before one sends a message
    if (data.conversation.conversationID === openConversationID) {
        receivedNewMessage(data.message)
        return
    }
    loadedConversations.set(data.conversation.conversationID, data.conversation)
    showOrUpdateConversationButton(data.conversation.conversationID)
    showNotification(data.conversation.conversationID.conversationID)
}
function receivedNewMessage(message) {
    if (!requestConversationIfNeeded(message.conversationID)) return
    loadedConversations.get(message.conversationID).texts.push(message)

    if (message.conversationID === openConversationID) {
        updateMessageID(message) // seems like it could be possibly weird?
        if (loadedUsers.get(message.userID).username !== username) showMessage(message, false)
        else if (!$(`.messageDiv[messageID=${message.messageID}]`).length) showMessage(message, true)
    }
    showOrUpdateConversationButton(message.conversationID)
    showNotification(message.conversationID)
}
function requestConversationIfNeeded(conversationID) {
    if (!loadedConversations.has(conversationID)) {
        ws.send(JSON.stringify({type: Type.REQUESTCONVERSATION, conversationID: conversationID}))
        return false
    }
    return true
}
function receivedNewServerMessage(message) {
    if (!requestConversationIfNeeded(message.conversationID)) return
    loadedConversations.get(message.conversationID).texts.push({conversationID: message.conversationID, message: message.text, date: new Date(), userID: -1, messageID: message.messageID})
    if (message.conversationID === openConversationID) {
        showServerMessage(message.text, message.messageID)
    }
    showOrUpdateConversationButton(message.conversationID)
    showNotification(message.conversationID)

}
function showNotification(conversationID) {
    if (conversationID !== openConversationID || !document.hasFocus()) {
        actuallyShowNotification(conversationID)
    }
    else sendReadReceipt(conversationID)
}
function actuallyShowNotification(conversationID) {
    $(`.conversationBlock[conversationID=${conversationID}]`).css('font-weight', 'bold')
    document.title = "NOTIFICATION"
}
function removeNotification(conversationID) {
    if (conversationID === -1) return
    $(`.conversationBlock[conversationID=${conversationID}]`).css('font-weight', 'normal')
    document.title = "Title"
    sendReadReceipt(conversationID)
}
function sendReadReceipt(conversationID) {
    let conversation = loadedConversations.get(conversationID)
    let message = conversation.texts[conversation.texts.length - 1]
    if (!message) return
    let messageID = message.messageID
    if (messageID === -1) return
    // sends even if already read, fix this
    ws.send(JSON.stringify({type: Type.READMESSAGE, userID: userID, conversationID: conversationID, messageID: messageID}))
}
$(window).on('focus', function() {
    removeNotification(openConversationID)
})
function receivedReadMessage(message) {
    updateLocalReadMessages(message)
    if (message.conversationID === openConversationID) updateReadMessages(openConversationID)
}
function openConversation(conversationID) {
    ws.send(JSON.stringify({type: Type.REQUESTTYPING, conversationID: conversationID}))
    closeConversationArea()
    removeGroupChatPopup()
    if (loadedConversations.get(conversationID).texts.length > 0) showNewConversationButton(loadedConversations.get(conversationID))
    openConversationID = conversationID
    openConversationArea()
    removeNotification(conversationID)
    let conversation = loadedConversations.get(conversationID)
    for (let message of conversation.texts) {
        if (message.userID === -1) showServerMessage(message.message, message.messageID)
        else showMessage(message, loadedUsers.get(message.userID).username === username)
    }
    updateChatParticipants(conversation)
    updateReadMessages()
}
function updateReadMessages() {
    for (let entry of loadedReadMessages) {
        if (entry.conversationID === openConversationID && entry.userID !== userID)  {
            $(`.readIndicator[userID=${entry.userID}]`).remove()
            if (!loadedUsers.has(entry.userID)) continue // possibly weird, fix this later maybe
            $(`.messageDiv[messageID=${entry.messageID}]`).append(`<div class="readIndicator" userID=${entry.userID}>READ BY ${loadedUsers.get(entry.userID).username}</div>`)
        }
    }

}
function receivedEditedMessage(message) {
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
    let activeConversationsDiv = $("#activeConversations")
    let stuff = getTextForConversationButton(conversation)
    if ($(`.conversationBlock[conversationID=${conversationID}]`).length) return
    let newConversationBlock = $(`
            <button class="conversationBlock itemBlock" conversationID="${conversationID}" onclick="openConversation(${conversationID})" messageID="${stuff.messageID}" date="${stuff.date}">
                <div class="userPic"></div>
                <div class="blockText">${stuff.text}</div>
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
    conversationButton.find('.blockText').html(stuff.text)
    conversationButton.attr('messageID', stuff.messageID)
    conversationButton.attr('date', stuff.date)
    if ($('.conversationBlock').length > 1) conversationButton.detach().insertBefore('.conversationBlock:first')
}
function showConversationHoverButtons(div) {
    div.append(`<button class='deleteButton hoverButton'></button>`)
    div.find('.deleteButton').click(function(e) {
        e.stopPropagation()
        let conversationID = parseInt(div.attr('conversationID'))
        ws.send(JSON.stringify({type: Type.CLOSECONVERSATION, userID: userID, conversationID: conversationID, conversationType: loadedConversations.get(conversationID).conversationType}))
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
    let lastTextUsername = ""
    if (lastMessage) {
        if (lastMessage.userID === -1) lastTextUsername = "Server"
        else lastTextUsername = loadedUsers.get(lastMessage.userID).username
    }
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
    $("#activeConversations").empty()
    updateLocalUsers(data.users)
    updateLocalConversations(data.conversations)
    updateLocalReadMessages(data.readMessages)
    for (let conversationID of loadedUsers.get(userID).conversations) {
        let conversation = loadedConversations.get(conversationID)
        updateConversation(conversation)
        showNewConversationButton(conversation)
    }
    showOfflineNotifications()
}
function showOfflineNotifications() {
    $('.conversationBlock').each(function() {
        let entry = loadedReadMessages.find(entry => entry.conversationID === parseInt($(this).attr('conversationID')) && entry.userID === userID)
        if (!entry) return
        if (parseInt($(this).attr('messageID')) > entry.messageID) actuallyShowNotification(entry.conversationID)
    })
}
function updateLocalReadMessages(readMessages) {
    if (!Array.isArray(readMessages)) readMessages = [readMessages]
    for (let readMessage of readMessages) {
        let found = false
        for (let entry of loadedReadMessages) {
            if (readMessage.conversationID === entry.conversationID && readMessage.userID === entry.userID) {
                entry.messageID = readMessage.messageID
                found = true
                break
            }
        }
        if (!found) loadedReadMessages.push({userID: readMessage.userID, conversationID: readMessage.conversationID, messageID: readMessage.messageID})
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

function updateChatParticipants(conversation) {
    if (conversation.conversationID !== openConversationID) return
    let chatParticipantsDiv = $('#chatParticipants')
    chatParticipantsDiv.empty()
    for (let user of conversation.users.map(userID => loadedUsers.get(userID))) {
        chatParticipantsDiv.append(
            `<button class='userBlock itemBlock' participantUserID=${user.userID} onclick='startNewConversation(${user.userID})'>
                <div class='userPic'></div>
                <div class='blockText'>${user.username}</div>
            </button>`)
        let participantBlock = $(`.userBlock[participantUserID=${user.userID}]`)
        participantBlock.hover(function() {
            if (conversation.leader !== userID || conversation.conversationType !== group) return
            participantBlock.append(`<button class='deleteButton hoverButton'></button>`)
            participantBlock.find('.deleteButton').click(function(e) {
                e.stopPropagation()
                let conversationID = openConversationID
                ws.send(JSON.stringify({type: Type.CLOSECONVERSATION, userID: user.userID, conversationID: conversationID, conversationType: loadedConversations.get(conversationID).conversationType}))
                participantBlock.remove()
            })
        }, function() {
            participantBlock.find('.deleteButton').remove()
        })
    }
}
function startNewConversation(receivingUserID) {
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
    let conversation = loadedConversations.get(openConversationID)
    if (conversation.conversationType === group) {
        let groupChatButtonsDiv = $('#groupChatButtonsDiv')
        groupChatButtonsDiv.addClass('active')
        groupChatButtonsDiv.append('<button class="groupChatButton" onclick="showInviteToGroupChatPopup()">+</button>')
        if (conversation.leader === userID) {
            groupChatButtonsDiv.append('<button class="groupChatButton" onclick="showRenameGroupChatPopup()">✍️</button>')
            groupChatButtonsDiv.append('<button class="groupChatButton" onclick="showTransferLeaderPopup()">>></button>')
        }
    }
    $('#messages').empty()
    loadTypingIndicatorArea()
    loadMessageInput()
}
function loadTypingIndicatorArea() {
    $('#messages').append(`<div id="typingIndicatorDiv"></div>`)
}
function closeConversationArea() {
    $('#messages').empty()
    openConversationID = -1
    $('#messageInputDiv').empty()
    $('#chatParticipants').empty()
    let groupChatButtonsDiv = $('#groupChatButtonsDiv')
    groupChatButtonsDiv.removeClass('active')
    groupChatButtonsDiv.empty()
}
function loadMessageInput() {
    let conversationDiv = $('#messageInputDiv')
    conversationDiv.empty()
    conversationDiv.append('<textarea id="messageInput" autofocus></textarea><button id="messageSendButton" onclick="sendMessage()"></button>')
    let messageInput = $('#messageInput')
    messageInput.on('input', function() {
        resizeMessageInput()
        let originalTyping = typing
        typing = true
        let text = messageInput.val().trim()
        if (!text || !text.trim()) typing = false
        if (typing === originalTyping) return
        sendTyping()
    })
    messageInput.focus()

    messageInput.keyup((event) => {
        if (event.key === "Enter" && !event.originalEvent.shiftKey) {
            event.preventDefault()
            sendMessage()
        }
    })
}
function sendTyping() {
    ws.send(JSON.stringify({type: Type.TYPING, conversationID: openConversationID, userID: userID, typing: typing}))
}
function resizeMessageInput() {
    let messageInput = $('#messageInput')
    messageInput.css('height', 'auto')
    messageInput.css('height', messageInput[0].scrollHeight + 'px')
    scrollToBottom()
}
function sendMessage() {
    typing = false
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
function showMessage(message, local) { // can remove local variable and replace with if message.userid === userid
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
function showServerMessage(text, messageID) {
    $('#messages').append(`<div class='messageDiv' messageID=-1 replyingTo=${messageID}><div class='messageTextDiv'><p class='messageText'>${text}</p></div></div>`)
    scrollToBottom()
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
    let pattern = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&\/=]*)/g
    let match;
    let indices = [];
    while ((match = pattern.exec(text)) !== null) {
        indices.push({ match: match[0], index: match.index });
    }
    for (let i = indices.length - 1; i >= 0; i--) {
        let url = indices[i].match;
        if (!(url.startsWith('http://') || url.startsWith('https://'))) url = 'https://' + url;
        let extension = url.split('.').pop().toLowerCase()
        let start = indices[i].index;
        let end = start + indices[i].match.length;
        if (['mp4', 'flv', 'mov', 'avi', 'webm', 'mkv'].includes(extension)) {
            text = text.slice(0, end) + '</a>' + text.slice(end);
            text = text.slice(0, start) + `<a target='_blank' href='${url}'>` + text.slice(start);
            text += `<video controls><source src=${url} type="video/${extension}"></video>`
        }
        else if (['jpeg', 'jpg', 'gif', 'png', 'avif', 'svg']) {
            text = text.slice(0, end) + '</a>' + text.slice(end);
            text = text.slice(0, start) + `<a target='_blank' href='${url}'>` + text.slice(start);
            text += `<img alt="" src="${url}">`
        }
        else {
            text = text.slice(0, end) + '</a>' + text.slice(end);
            text = text.slice(0, start) + `<a target='_blank' href='${url}'>` + text.slice(start);
        }

    }

    return text;
}
function showMessageHoverButtons(div, local) {
    if (local) div.prepend(`<button class='deleteButton hoverButton'></button><button class='replyButton hoverButton'></button><button class='editButton hoverButton'></button>`)
    else div.append(`<button class='replyButton'></button>`)
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
    div.find('.hoverButton').remove()
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
        if (user.userID !== userID) currentlyOnlineUsersDiv.append(`<button class="userBlock itemBlock" onclick="startNewConversation(${user.userID})"><div class="userPic"></div><div class="onlineUserListButtonText">${user.username}</div></button>`)
    }
}

function showCreateGroupChatPopup() {
    removeGroupChatPopup()
    showGroupChatUsersList((key, value) => key === userID, "checkbox")
    $('#activeConversationsExtraButtons').append(`<button id="groupChatCreateButton" onclick="createNewGroupChat()">Create</button>`)
}
function showInviteToGroupChatPopup() {
    removeGroupChatPopup()
    if (openConversationID === -1) return
    showGroupChatUsersList((key, value) => key === userID || loadedConversations.get(openConversationID).users.includes(key), "checkbox")
    $('#activeConversationsExtraButtons').append(`<button id="groupChatInviteButton" onclick="inviteToGroupChat()">Invite</button>`)
}
function showTransferLeaderPopup() {
    removeGroupChatPopup()
    showGroupChatUsersList((key, value) => key === userID, "radio")
    $('#activeConversationsExtraButtons').append(`<button id="groupChatTransferLeaderButton" onclick="transferLeader()">Transfer</button>`)
}
function transferLeader() {
    if (getCheckedUsers().length !== 1) return
    ws.send(JSON.stringify({type: Type.TRANSFERLEADER, conversationID: openConversationID, newLeader: getCheckedUsers()[0], originalLeader: userID}))
    removeGroupChatPopup()
}
function showRenameGroupChatPopup() {
    removeGroupChatPopup()
    if (openConversationID === -1) return
    $('#activeConversationsExtraButtons').append(`<input type="text" id="groupChatRenameInput"><button id="groupChatRenameButton" onclick="renameGroupChat()">Rename</button>`)
}
function inviteToGroupChat() {
    ws.send(JSON.stringify({type: Type.INVITETOGROUPCHAT, conversationID: openConversationID, users: getCheckedUsers()}))
    removeGroupChatPopup()
}
function createNewGroupChat() {
    let checkedUsers = getCheckedUsers()
    checkedUsers.push(userID)
    ws.send(JSON.stringify({type: Type.STARTCONVERSATION, conversationID: checkedUsers, conversationType: group, leader: userID})) // conversationID here is users array
    removeGroupChatPopup()
}
function renameGroupChat() {
    ws.send(JSON.stringify({type: Type.RENAMEGROUPCHAT, conversationID: openConversationID, newName: $('#groupChatRenameInput').val()}))
    removeGroupChatPopup()
}
function getCheckedUsers() {
    let users = []
    $('.groupChatUserInput:checked').each(function() { users.push(parseInt($(this).val())) })
    return users
}
function showGroupChatUsersList(condition, type) {
    removeGroupChatPopup()
    let div = $('#activeConversationsExtraButtons')
    for (let [key, value] of loadedUsers) {
        if (condition(key, value)) continue
        div.append(`<input class="groupChatUserInput" type=${type} value=${key} name="groupChatPopup"><label class="groupChatUserLabel" for="${key}">${value.username}</label>`)
    }
}
function removeGroupChatPopup() {
    $('.groupChatUserInput').remove()
    $('.groupChatUserLabel').remove()
    $('#groupChatCreateButton').remove()
    $('#groupChatInviteButton').remove()
    $('#groupChatRenameInput').remove()
    $('#groupChatRenameButton').remove()
    $('#groupChatTransferLeaderButton').remove()
}

function logout() {
    Cookies.remove(loginCookie)
    window.location.href = '/'
}

$(window).on('focus', function() {
    $('#messageInput').focus()
})