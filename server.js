const express = require('express')
const Database = require('./database.js')
const app = express()
const loginServer = require('./loginServer.js')
require('express-ws')(app)
const Helper = require('./public/helper.js')

let clients = []
let typing = new Map()
Database.initPromise.then(async () => {
    // await Database.deleteAll()
    // await Database.createLatestIDs()
    // await Database.createPublicConversation()
})
app.use(express.static('public'));
app.use(express.json());
app.ws('/main', (ws, req) => {
    ws.on('message', (msg) => {
        let data = JSON.parse(msg)
        switch (data.type) {
            case Helper.Type.LOGIN:
                login(ws, data.sessionID)
                break
            case Helper.Type.REQUESTCONVERSATION:
                sendRequestedConversation(ws, data)
                break
            case Helper.Type.NEWMESSAGE:
                receivedMessage(data.message)
                break
            case Helper.Type.DELETEMESSAGE:
                deleteMessage(data)
                break
            case Helper.Type.EDITMESSAGE:
                editMessage(data.message)
                break
            case Helper.Type.CLOSECONVERSATION:
                closeConversation(data)
                break
            case Helper.Type.INVITETOGROUPCHAT:
                inviteToGroupChat(data)
                break
            case Helper.Type.RENAMEGROUPCHAT:
                renameGroupChat(data)
                break
            case Helper.Type.TRANSFERLEADER:
                transferLeader(data)
                break
            case Helper.Type.READMESSAGE:
                readMessage(data)
                break
            case Helper.Type.TYPING:
                updateTyping(data)
                break
            case Helper.Type.BLOCKUSER:
                blockUser(data)
                break
            case Helper.Type.UNBLOCKUSER:
                unblockUser(data)
                break
            case Helper.Type.SAVEPROFILEPIC:
                saveProfilePicture(data)
                break
        }
    })
    ws.on('close', () => disconnect(ws))
})
function disconnect(ws) {
    let clientIndex = clients.findIndex(client => client.socket === ws)
    if (!clientIndex || !clients[clientIndex]) return
    Database.findUserWithID(clients[clientIndex].userID).then(user => {
        for (let conversationID of user.conversations) {
            // this sends it even to conversations where not typing
            updateTyping({conversationID: conversationID, typing: false, userID: user.userID})
        }
    })
    clients.splice(clientIndex, 1)
    updateUserLists()
}
function login(ws, sessionID) {
    let userID = loginServer.getUser(sessionID)
    Database.findUserWithID(userID).then((user) => {
        if (!user) {
            ws.send(JSON.stringify({type: Helper.Type.BACKTOLOGIN}))
            return
        }
        console.log(user.username + " logged in")
        clients.push({socket: ws, userID: userID})
        ws.send(JSON.stringify({type: Helper.Type.RECEIVEUSERNAME, user: user}))
        loadLocalData(ws, user)
        updateUserLists()
    })
}
function saveProfilePicture(data) {
    Database.saveProfilePicture(data.userID, data.profilePic).then(user => {
        Database.findConversations(user.conversations).then((conversations) => {
            if (!conversations) return
            conversations = conversations.filter(conversation => conversation)
            let userIDs = Array.from(new Set(conversations.flatMap(conversation => conversation.users)))
            for (let socket of getSockets(userIDs.filter(userID => data.userID !== userID))) {
                socket.send(JSON.stringify({type: Helper.Type.SAVEPROFILEPIC, userID: data.userID, profilePic: data.profilePic}))
            }
        })
    })
}
function updateTyping(data) {
    if (data.conversationID === -1) return
    if (!typing.has(data.conversationID)) typing.set(data.conversationID, [])
    let conversationTyping = typing.get(data.conversationID)
    if (!data.typing) conversationTyping.splice(conversationTyping.indexOf(data.userID), 1)
    else if (!conversationTyping.includes(data.userID)) conversationTyping.push(data.userID)
    Database.findConversation(data.conversationID).then((conversation) => {
        for (let socket of getSockets(conversation.users)) {
            sendTyping(socket, data.conversationID)
        }
    })
}
function blockUser(data) {
    Database.block(data.userID, data.blockedUserID).then(() => {
        let client = clients.find(client => client.userID === data.blockedUserID)
        if (!client) return
        client.socket.send(JSON.stringify({type: Helper.Type.BLOCKUSER, userID: data.userID}))
    })
}
function unblockUser(data) {
    Database.unblock(data.userID, data.blockedUserID).then(() => {
        let client = clients.find(client => client.userID === data.blockedUserID)
        if (!client) return
        client.socket.send(JSON.stringify({type: Helper.Type.UNBLOCKUSER, userID: data.userID}))
    })
}
function sendTyping(ws, conversationID) {
    if (!typing.has(conversationID)) ws.send(JSON.stringify({type: Helper.Type.TYPING, conversationID: conversationID, conversationTyping: []}))
    else ws.send(JSON.stringify({type: Helper.Type.TYPING, conversationID: conversationID, conversationTyping: typing.get(conversationID)}))
}
function sendRequestedConversation(ws, data) { // conversationID can be users array
    Database.findConversation(data.conversationID).then(async (conversation) => {
        // don't mess with the order
        if (!conversation && data.conversationType === Helper.direct) conversation = await Database.findConversationWithUsers(data.conversationID)
        if (!conversation) conversation = await Database.createConversation({users: data.conversationID, conversationType: data.conversationType, leader: data.leader})
        ws.send(JSON.stringify({type: Helper.Type.REQUESTCONVERSATION, conversation: conversation}))
    })
}
function inviteToGroupChat(data) {
    Database.addUsersToGroupChat(data.conversationID, data.users).then((conversation) => {
        for (let socket of getSockets(conversation.users)) {
            socket.send(JSON.stringify({type: Helper.Type.INVITETOGROUPCHAT, conversation: conversation})) // can be optimized
        }
    })
}
function renameGroupChat(data) {
    Database.renameGroupChat(data.conversationID, data.newName).then((conversation) => {
        for (let socket of getSockets(conversation.users)) {
            socket.send(JSON.stringify({type: Helper.Type.RENAMEGROUPCHAT, conversation: conversation})) // can be optimzied
        }
    })
}
function transferLeader(data) {
    Database.transferLeader(data.conversationID, data.newLeader).then(conversation => {
        for (let socket of clients.filter(client => [data.newLeader, data.originalLeader].includes(client.userID)).map(client => client.socket)) {
            socket.send(JSON.stringify({type: Helper.Type.TRANSFERLEADER, conversation: conversation}))
        }
    })
}
function closeConversation(data) {
    Database.findConversation(data.conversationID).then((originalConversation) => {
        Database.closeConversation(data.userID, data.conversationID, data.conversationType).then((conversation) => {
            if (originalConversation.leader === data.userID) {
                if (conversation.users.length > 0) {
                    transferLeader({conversationID: data.conversationID, originalLeader: data.userID, newLeader: conversation.users[Math.floor(Math.random()*conversation.users.length)]})
                }
            }
            if (!conversation || conversation === Helper.direct) return
            for (let socket of getSockets(originalConversation.users)) {
                socket.send(JSON.stringify({type: Helper.Type.CLOSECONVERSATION, conversation: conversation, userID: data.userID}))
            }
        })

    })


}
function editMessage(message) {
    updateTyping({conversationID: message.conversationID, userID: message.userID, typing: false})
    Database.editMessage(message.conversationID, message.messageID, message.message).then((conversation) => {
        for (let socket of getSockets(conversation.users.filter(userID => userID !== message.userID))) {
            socket.send(JSON.stringify({type: Helper.Type.EDITMESSAGE, message: {conversationID: message.conversationID, userID: message.userID, messageID: message.messageID, message: message.message}}))
        }
    })
}
function deleteMessage(data) {
    Database.deleteMessage(data.conversationID, data.messageID).then((conversation) => {
        for (let socket of getSockets(conversation.users)) {
            socket.send(JSON.stringify({type: Helper.Type.DELETEMESSAGE, messageID: data.messageID})) // why doesn't this send conversationid? check for glitches
        }
    })
}
function receivedMessage(message) {
    updateTyping({conversationID: message.conversationID, userID: message.userID, typing: false})
    Database.addMessage(message).then((conversation) => {
        message.messageID = conversation.texts[conversation.texts.length - 1].messageID
        readMessage({conversationID: message.conversationID, userID: message.userID, messageID: message.messageID})
        for (let socket of getSockets(conversation.users)) {
            socket.send(JSON.stringify({type: Helper.Type.NEWMESSAGE, message: message}))
        }
    })
}
function getSockets(users) {
    return users.flatMap(userID => clients.filter(client => client.userID === userID)).map(client => client.socket)
}
function readMessage(data) {
    Database.updateReadMessages(data.userID, data.conversationID, data.messageID).then(conversation => {
        for (let socket of getSockets(conversation.users)) {
            socket.send(JSON.stringify({type: Helper.Type.READMESSAGE, conversationID: data.conversationID, read: conversation.read}))
        }
    })
}
function sendReadMessages(ws, conversationID) {
    Database.getReadMessages(conversationID).then(read => {
        if (!read) return
        ws.send(JSON.stringify({type: Helper.Type.READMESSAGE, conversationID: conversationID, read: read}))
    })
}
function loadLocalData(ws, user) { // very inefficient, sends multiple times
    if (!user) return
    Database.findConversations(user.conversations).then((conversations) => {
        if (!conversations) return
        conversations = conversations.filter(conversation => conversation)
        let userIDs = new Set(conversations.flatMap(conversation => conversation.users))
        Database.findUsersWithID(Array.from(userIDs)).then((users) => {
            ws.send(JSON.stringify({type: Helper.Type.LOADLOCALDATA, conversations: conversations, users: users}))
        })
        for (let conversation of user.conversations) sendTyping(ws, conversation)
        for (let conversation of user.conversations) sendReadMessages(ws, conversation)
    })
}

function updateUserLists() {
    Database.findUsersWithID(Array.from(new Set(clients.map(client => client.userID)))).then((users) => {
        for (let client of clients) {
            Database.findUserWithID(client.userID).then((user) => { // very very inefficient
                loadLocalData(client.socket, user)
            })
            client.socket.send(JSON.stringify({type: Helper.Type.ONLINEUSERSUPDATE, users: users}))
        }
    })
}

app.get('/main', (req, res) => {
    res.sendFile(__dirname + '/public/main.html')
})
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html')
})

app.use('/', loginServer.router)
app.listen({port: Helper.port, host: Helper.host}, () => {
    console.log("Server started")
})