import App from '/components/App.js'
import {data} from '/components/data.js'

App.mount('#app')
let ws
let sessionID = Cookies.get(loginCookie)
let maxMessageLength = 5000
let loginRoute = '/login'
let mainRoute = '/main'
if (!sessionID) window.location.href = loginRoute
else connection()
function connection() {
    let connectionRepeater
    ws = new WebSocket('ws://' + host + ':' + port + mainRoute)
    ws.onopen = () => {
        ws.send(JSON.stringify({type: Type.LOGIN, sessionID: sessionID}))
        console.log("Connected")
        clearInterval(connectionRepeater) // stops repeated reconnection attempts
    }
    ws.onclose = () => {
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
                window.location.href = loginRoute
                break
            case Type.NEWMESSAGE:
                receivedNewMessage(message.message)
                break
            case Type.EDITMESSAGE:
                editMessage(message.message)
                break
            case Type.DELETEMESSAGE:
                console.log(message)
                let conversation1 = data.loadedConversations.get(message.conversationID)
                conversation1.texts = conversation1.texts.filter(text => text.messageID !== message.messageID)
                break
            case Type.REQUESTCONVERSATION:
                for (let newUser of message.newUsers) data.loadedUsers.set(newUser.userID, newUser)
                let user = data.loadedUsers.get(data.userID)
                user.conversations = [...new Set([...user.conversations, message.conversation.conversationID])] // adds to conversations only if its not there
                user.openConversations = [...new Set([...user.openConversations, message.conversation.conversationID])]
                updateLocalConversations([message.conversation])
                // updateTitleNotifications()
                break
            case Type.CLOSECONVERSATION:
                updateLocalConversations([message.conversation])
                if (message.userID === data.userID) closeConversation(message.conversation.conversationID)
                break
            case Type.INVITETOGROUPCHAT:
                for (let newUser of message.newUsers) data.loadedUsers.set(newUser.userID, newUser)
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
                let u = data.loadedUsers.get(message.userID)
                u.blocked.splice(u.blocked.indexOf(data.userID), 1)
                break
            case Type.TYPING:
                data.typingConversations.set(message.conversationID, message.conversationTyping)
                break
            case Type.READMESSAGE:
                data.read.set(message.conversationID, Object.entries(message.read).map(([userID, messageID]) => ({userID: parseInt(userID), messageID: messageID})))
                break
            case Type.CHANGEUSERNAME:
                if (message.username) {
                    if (data.loadedUsers.has(message.userID)) data.loadedUsers.get(message.userID).username = message.username
                    if (data.userID === message.userID) {
                        data.openPopup = data.popups.UsernameChanged
                        data.openModal = data.modals.None
                    }
                }
                else if (data.userID === message.userID) data.openPopup = data.popups.UsernameTaken
                break
            case Type.CHANGEPASSWORD:
                data.openPopup = data.popups.PasswordChanged
                break
            case Type.REQUESTMOREMESSAGES:
                data.messagesAdded = true
                let conversation = data.loadedConversations.get(message.conversationID)
                conversation.texts = message.texts.concat(conversation.texts)
                conversation.allLoaded = message.allLoaded
                break
        }
    }
}
function setUp(user) {
    updateLocalUsers([user])
    data.userID = user.userID
}
export function updateOpenConversationCookie() {
    Cookies.set(openConversationCookie, data.openConversationID)
}
export function saveTheme() {
    Cookies.set(themeCookie, JSON.stringify(Array.from(data.theme.entries())))
}
export function deleteTheme() {
    Cookies.remove(themeCookie)
}
export function loadTheme() {
    let theme = Cookies.get(themeCookie)
    if (theme) data.theme = new Map(JSON.parse(theme))
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
function loadLocalData(newData) {
    updateLocalUsers(newData.users)
    updateLocalConversations(newData.conversations)
    data.shapes = new Map(Object.entries(data.loadedUsers.get(data.userID).profilePic).map(([key, value]) => [parseInt(key), value])) // not 100% sure this is needed
    let conversationToOpen = parseInt(Cookies.get(openConversationCookie))
    if (!conversationToOpen) return
    if (!data.loadedConversations.has(conversationToOpen)) return
    data.openConversationID = conversationToOpen // replace with cookie later
    read(data.openConversationID)
}
function receivedNewMessage(message) {
    if (!data.loadedConversations.has(message.conversationID) || !data.loadedUsers.get(data.userID).openConversations.includes(message.conversationID)) {
        ws.send(JSON.stringify({ type: Type.REQUESTCONVERSATION, conversationID: message.conversationID, conversationType: direct, loadedUsers: Array.from(data.loadedUsers.keys()) }))
        return
    }
    if (message.userID === data.userID) {
        let texts = data.loadedConversations.get(message.conversationID).texts
        let foundText = texts.find(text => !text.messageID || text.messageID === -1)
        if (foundText) foundText.messageID = message.messageID
        else texts.push(message)
    }
    else {
        addMessage(message)
        updateTitleNotifications()
        if (data.openConversationID === message.conversationID && !document.hidden) read(message.conversationID)
    }
}
export function updateTitleNotifications() {
    let numberNotifications = countNotifications()
    let conversationOpen = data.openConversationID !== -1
    let conversationName = "Themid"
    if (conversationOpen) conversationName = getConversationName(data.openConversationID)
    if (numberNotifications !== 0) {
        conversationName = '(' + numberNotifications + ') ' + conversationName
    }
    document.title = conversationName
}
function countNotifications() {
    if (!data.loadedUsers.has(data.userID)) return 0
    let user = data.loadedUsers.get(data.userID)
    let count = 0
    for (let conversationID of user.conversations) {
        if (!data.loadedConversations.has(conversationID)) continue
        let conversation = data.loadedConversations.get(conversationID)
        if (conversation.conversationType === direct && user.blocked.includes(conversation.users.find(id => id !== data.userID))) continue
        let texts = conversation.texts
        let lastRead
        if (!data.read.has(conversationID) || !(lastRead = data.read.get(conversationID).find(readMessage => readMessage.userID === data.userID))) {
            let lastText = texts[texts.length-1]
            if (lastText && lastText.userID === data.userID) break
            count += texts.length
            if (count > 9) return 10
        }
        else {
            for (let text of texts.toReversed()) {
                if (text.messageID === lastRead.messageID) break
                if (text.messageID > lastRead.messageID) {
                    count++
                }
                if (count > 9) return 10
            }
        }

    }
    return count
}
$(window).focus(() => {
    read(data.openConversationID)
})
function read(conversationID) {
    if (conversationID === -1) return
    if (!data.loadedConversations.has(conversationID)) return
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
    data.focusMessageInput = true
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
    ws.send(JSON.stringify({ type: Type.REQUESTCONVERSATION, conversationID: [receivingUserID, data.userID], conversationType: direct, leader: data.userID}))
}

function editMessage(message) {
    data.loadedConversations.get(message.conversationID).texts.find(text => text.messageID === message.messageID).message = message.message
}
function addMessage(message) {
    let conversation = data.loadedConversations.get(message.conversationID)
    conversation.texts = [...conversation.texts, message] // can't just push because for some reason vue isn't reacting
}
export function sendMessage() {
    let messageInput = $('#messageInput')
    let text = messageInput.val()
    if (inputInvalid(text)) return
    if (text.length > maxMessageLength) {
        data.openPopup = data.popups.LongMessage
        return
    }
    messageInput.val("")
    messageInput.focus()

    let message = {
        conversationID: data.openConversationID,
        userID: data.userID,
        message: text,
        date: new Date(),
        messageID: data.editing,
        replyingTo: data.replyingTo
    }
    let conversation = data.loadedConversations.get(data.openConversationID)
    if (conversation.conversationType === direct && data.loadedUsers.get(conversation.users.find(userID => userID !== data.userID)).blocked.includes(data.userID)) {
        data.openPopup = data.popups.Blocked
    }
    else {
        if (data.editing === -1) addMessage(message)
        else editMessage(message)
        ws.send(JSON.stringify({type: data.editing === -1 ? Type.NEWMESSAGE : Type.EDITMESSAGE, message: message}))
    }
    closeReply()
    data.focusMessageInput = true
}
function closeReply() {
    data.editing = -1
    data.replyingTo = -1
}
$(document).on('keydown', '#messageInput', (event) => {
    if (event.keyCode === 13 && !event.originalEvent.shiftKey) {
        event.preventDefault()
        sendMessage()
        setTyping(false, true)
    }
})
let typing = false
$(document).on('input', '#messageInput',  (event) => {
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
    data.replyingTo = -1
}

export function shortenText(text, length) {
    if (text.length > length) text = text.substring(0, length-3) + "..."
    return text
}

export function createNewGroupChat() {
    ws.send(JSON.stringify({type: Type.REQUESTCONVERSATION, conversationID: [...data.usersCheckbox, data.userID], conversationType: group, leader: data.userID}))
    // conversationID here is users array
    // can replace [...data.usersCheckbox, data.userID] with just data.createGroupChatUsers and use leader on server side
}
export function inviteToGroupChat() {
    ws.send(JSON.stringify({type: Type.INVITETOGROUPCHAT, conversationID: data.openConversationID, users: data.usersCheckbox}))
}

export function renameGroupChat(newName) {
    ws.send(JSON.stringify({type: Type.RENAMEGROUPCHAT, conversationID: data.openConversationID, newName: newName}))
}
export function transferLeader(userID) {
    ws.send(JSON.stringify({ type: Type.TRANSFERLEADER, conversationID: data.openConversationID, newLeader: userID, originalLeader: data.userID }))
}
export function scrollToBottom(dontScroll, amount) { // should be named something other than dontscroll
    let messages = $('#messages')
    if (data.openConversationID === -1 || !messages) return
    if (amount) messages.scrollTop(amount)
    else {
        if (dontScroll && messages.prop("scrollHeight") - (messages.scrollTop() + messages.height()) > messages.outerHeight()) return
        messages.scrollTop(messages.prop("scrollHeight"))
    }
}
let canRequestMoreMessages = true
function startMessageRequestCooldown() {
    canRequestMoreMessages = false
    setTimeout(() => {canRequestMoreMessages = true}, 100)
}
export function onMessagesScroll(scrollTop) {
    if (scrollTop <= data.distanceBeforeRequest) {
        let conversation = data.loadedConversations.get(data.openConversationID)
        if (!conversation.allLoaded && canRequestMoreMessages && conversation.texts.length >= 50) {
            ws.send(JSON.stringify({type: Type.REQUESTMOREMESSAGES, conversationID: data.openConversationID, numberMessages: conversation.texts.length, messageID: conversation.texts[0]
                    .messageID}))
            startMessageRequestCooldown()
        }
    }

}
function isConversationWithBlocked(conversationID) {
    let conversation = data.loadedConversations.get(conversationID)
    return conversation.conversationType === direct &&
        conversation.users.some(userID => conversation.users.some(otherUserID => data.loadedUsers.get(userID).blocked.includes(otherUserID)))
}
export function getConversationName(conversationID) {
    if (!data.loadedConversations.has(conversationID)) return ""
    let conversation = data.loadedConversations.get(conversationID)
    let conversationName = conversation.conversationName
    if (!conversationName) {
        if (conversation.users.length === 1) conversationName = data.loadedUsers.get(data.userID).username
        else conversationName = conversation.users.filter(userID => userID !== data.userID).map(userID => data.loadedUsers.get(userID).username).join(', ')
    }
    return conversationName
}
export function saveProfilePicture() {
    ws.send(JSON.stringify({type: Type.SAVEPROFILEPIC, userID: data.userID, profilePic: Object.fromEntries([...data.shapes])}))
    data.openModal = data.modals.None
    updateProfilePicture(data.userID, data.shapes)
}
function updateProfilePicture(userID, profilePic) {
    if (userID === data.userID) data.shapesDirty = false
    data.loadedUsers.get(userID).profilePic = profilePic
    data.loadedUsers = new Map(data.loadedUsers) // needed for reactivity
}

export function showUserPopup(userID, event) {
    event.stopPropagation()
    data.userPopupLocation = {x: event.pageX, y: event.pageY}
    data.userPopupID = userID
}
export function showConversationPopup(conversationID, event) {
    data.conversationPopupLocation = {x: event.touches[0].clientX, y: event.touches[0].clientY}
    data.conversationPopupID = conversationID
}
export function showMessagePopup(messageID, event) {
    data.messagePopupLocation = {x: event.touches[0].clientX, y: event.touches[0].clientY}
    data.messagePopupID = messageID
}
export function blockUser(userID) {
    data.loadedUsers.get(data.userID).blocked.push(userID)
    if (isConversationWithBlocked(data.openConversationID)) data.openConversationID = -1
    ws.send(JSON.stringify({type: Type.BLOCKUSER, userID: data.userID, blockedUserID: userID}))
    updateTitleNotifications()
}
export function unblockUser(userID) {
    let user = data.loadedUsers.get(data.userID)
    user.blocked.splice(user.blocked.indexOf(userID), 1)
    ws.send(JSON.stringify({type: Type.UNBLOCKUSER, userID: data.userID, blockedUserID: userID}))
    updateTitleNotifications()
}
export function logout() {
    ws.send(JSON.stringify({type: Type.LOGOUT, sessionID: sessionID}))
    Cookies.remove(loginCookie)
    window.location.href = loginRoute
}
$(document).click(event => {
    data.userPopupID = -1
    data.conversationPopupID = -1
    data.messagePopupID = -1
    data.messageMenu = -1
    $('.dropdownOpened').removeClass('dropdownOpened')
})

export function rejoinGeneral() {
    let howdyID = 3
    if (data.loadedUsers.get(data.userID).conversations.includes(howdyID)) return
    ws.send(JSON.stringify({type: Type.INVITETOGROUPCHAT, conversationID: howdyID, users: [data.userID], loadedUsers: Array.from(data.loadedUsers.keys())}))
}
export function toggleCensor(userID) {
    let user = data.loadedUsers.get(data.userID)
    if (user.censored.includes(userID)) uncensor(userID)
    else censor(userID)
}
export function censor(userID) {
    let user = data.loadedUsers.get(data.userID)
    user.censored.push(userID)
    data.activateCensor = userID
    ws.send(JSON.stringify({type: Type.CENSORUPDATE, userID: data.userID, censored: user.censored}))
}
export function uncensor(userID) {
    let user = data.loadedUsers.get(data.userID)
    user.censored = user.censored.filter(id => id !== userID)
    data.activateCensor = userID
    ws.send(JSON.stringify({type: Type.CENSORUPDATE, userID: data.userID, censored: user.censored}))
}
export function changeUsername(username) {
    if (inputInvalid(username)) return
    ws.send(JSON.stringify({type: Type.CHANGEUSERNAME, userID: data.userID, username: username}))
}
export function inputInvalid(text) {
    return !text||!text.trim()
}
export function changePassword(password) {
    if (inputInvalid(password)) return
    ws.send(JSON.stringify({type: Type.CHANGEPASSWORD, userID: data.userID, password: password}))
}
export function messageInputPasted(event) {
    let items = event.clipboardData.items
    for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
            event.preventDefault()
            data.openPopup = data.popups.ImagePasted
        }
    }
}
window.addEventListener('resize', function() {scrollToBottom()})

let check = false;
(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
if (check) document.body.classList.add('mobile')
data.mobile = check

window.rejoinGeneral = rejoinGeneral
window.getConversationName = getConversationName
window.logout = logout

// not sure if i need these
window.sendMessage = sendMessage
window.deleteMessage = deleteMessage
// window.openConversation = openConversation