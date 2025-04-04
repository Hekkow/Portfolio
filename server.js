const express = require('express')
const Database = require('./database.js')
const app = express()
const loginServer = require('./loginServer.js')
require('express-ws')(app)
const Helper = require('./public/Helper.js')
require('dotenv').config()
let clients = []
let typing = new Map()
Database.initPromise.then(async () => {
    // await Database.deleteAll()
    // await Database.createLatestIDs()
    // await Database.createPublicConversation()
})
app.use(express.static('public'));
app.use(express.json());
let portfolioClients = []
app.ws('/portfolioChat', (ws, req) => {
    portfolioClients.push(ws)
    Database.getPortfolioMessages().then((messages) => {
        ws.send(JSON.stringify(messages))
    })
    ws.on('message', (msg) => {
        let data = JSON.parse(msg)
        Database.addPortfolioMessage(data.username, data.text).then(() => {
            portfolioClients.filter(client => client !== ws).forEach((socket) => {
                socket.send(JSON.stringify({username: data.username, text: data.text}))
            })
        })

    })
    ws.on('close', () => {
        portfolioClients = portfolioClients.filter(client => client !== ws)
    })
})
app.ws('/chat', (ws, req) => {
    ws.on('message', (msg) => {
        let data = JSON.parse(msg)
        switch (data.type) {
            case Helper.Type.LOGIN:
                login(ws, data.sessionID)
                break
            case Helper.Type.LOGOUT:
                logout(data.sessionID)
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
            case Helper.Type.CENSORUPDATE:
                updateCensors(data)
                break
            case Helper.Type.SAVEPROFILEPIC:
                saveProfilePicture(data)
                break
            case Helper.Type.CHANGEUSERNAME:
                changeUsername(data)
                break
            case Helper.Type.CHANGEPASSWORD:
                changePassword(ws, data)
                break
            case Helper.Type.REQUESTMOREMESSAGES:
                sendMoreMessages(ws, data)
                break
        }
    })
    ws.on('close', () => disconnect(ws))
})
function disconnect(ws) {

    let clientIndex = clients.findIndex(client => client.socket === ws)
    if (clientIndex === -1 || !clients[clientIndex]) return
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
        clients.push({socket: ws, userID: userID, sessionID: sessionID})
        ws.send(JSON.stringify({type: Helper.Type.RECEIVEUSERNAME, user: user}))
        loadLocalData(ws, user)
        updateUserLists()
    })
}
function logout(sessionID) {
    loginServer.removeUser(sessionID)
}
function saveProfilePicture(data) {
    Database.saveProfilePicture(data.userID, data.profilePic).then(user => {
        Database.findConversations(user.conversations).then((conversations) => {
            if (!conversations) return
            conversations = conversations.filter(conversation => conversation)
            let userIDs = Array.from(new Set(conversations.flatMap(conversation => conversation.users)))
            for (let socket of getSockets(userIDs)) {
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
        for (let socket of getSockets([data.blockedUserID])) {
            socket.send(JSON.stringify({type: Helper.Type.BLOCKUSER, userID: data.userID}))
        }
    })
}
function unblockUser(data) {
    Database.unblock(data.userID, data.blockedUserID).then(() => {
        for (let socket of getSockets([data.blockedUserID])) {
            socket.send(JSON.stringify({type: Helper.Type.UNBLOCKUSER, userID: data.userID}))
        }
    })
}
function changeUsername(data) {
    Database.changeUsername(data.userID, data.username).then(worked => {
        if (!worked) {
            for (let socket of getSockets([data.userID])) socket.send(JSON.stringify({type: Helper.Type.CHANGEUSERNAME, userID: data.userID}))
        }
        else {
            for (let client of clients) {
                client.socket.send(JSON.stringify({type: Helper.Type.CHANGEUSERNAME, userID: data.userID, username: data.username}))
            }
        }
    })
}
function changePassword(ws, data) {
    Database.changePassword(data.userID, data.password).then(_ => ws.send(JSON.stringify({type: Helper.Type.CHANGEPASSWORD})))
}
function updateCensors(data) {
    Database.updateCensors(data.userID, data.censored)
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
        if (!data.loadedUsers) data.loadedUsers = []
        let userID = clients.find(client => client.socket === ws)
        if (userID) await Database.addToOpenConversations(userID, data.conversationID)
        Database.findUsersWithID(conversation.users.filter(user => !data.loadedUsers.includes(user))).then(newUsers => {
            ws.send(JSON.stringify({type: Helper.Type.REQUESTCONVERSATION, conversation: conversation, newUsers: newUsers}))
        })
    })
}
function sendMoreMessages(ws, data) {
    Database.getMoreMessages(data.conversationID, data.numberMessages, data.messageID).then(newData => {
        ws.send(JSON.stringify({type: Helper.Type.REQUESTMOREMESSAGES, conversationID: data.conversationID, texts: newData.texts, allLoaded: newData.allLoaded}))
    })
}
function inviteToGroupChat(data) {
    Database.addUsersToGroupChat(data.conversationID, data.users).then((conversation) => {
        Database.findUsersWithID(conversation.users).then(newUsers => {
            for (let socket of getSockets(conversation.users)) {
                socket.send(JSON.stringify({type: Helper.Type.INVITETOGROUPCHAT, conversation: conversation, newUsers: newUsers})) // can be optimized
            }
        })
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
            if (originalConversation.type === Helper.direct && originalConversation.leader === data.userID) {
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
        for (let socket of getSockets(conversation.users)) {
            socket.send(JSON.stringify({type: Helper.Type.EDITMESSAGE, message: {conversationID: message.conversationID, userID: message.userID, messageID: message.messageID, message: message.message}}))
        }
    })
}
function deleteMessage(data) {
    Database.deleteMessage(data.conversationID, data.messageID).then((conversation) => {
        for (let socket of getSockets(conversation.users)) {
            socket.send(JSON.stringify({type: Helper.Type.DELETEMESSAGE, messageID: data.messageID, conversationID: data.conversationID}))
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
            client.socket.send(JSON.stringify({type: Helper.Type.ONLINEUSERSUPDATE, users: users}))
        }
    })
}

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html')
})
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html')
})
app.get('/digitalhumanities', (req, res) => {
    res.sendFile(__dirname + '/public/DigitalHumanities/digitalhumanities.html')
})
app.use('/', loginServer.router)
app.listen(process.env.PORT, () => {
    console.log("Server started")
})