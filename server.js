const express = require('express')
const Database = require('./database.js')
const app = express()
const loginServer = require('./loginServer.js')
require('express-ws')(app)
const Helper = require('./public/helper.js')

let clients = []
let typing = new Map()
Database.initPromise.then(async () => {
    await Database.deleteAll()
    await Database.createLatestIDs()
    await Database.createPublicConversation()
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
            case Helper.Type.STARTCONVERSATION:
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
            case Helper.Type.REQUESTTYPING:
                sendTyping(ws, data.conversationID)
                break
            case Helper.Type.BLOCKUSER:
                blockUser(data)
                break
            case Helper.Type.UNBLOCKUSER:
                unblockUser(data)
                break
        }
    })
    ws.on('close', () => disconnect(ws))
})
function disconnect(ws) {
    for (let i = 0; i < clients.length; i++) {
        if (clients[i].socket === ws) {
            clients.splice(i, 1)
            updateUserLists()
            return
        }
    }
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
function updateTyping(data) {
    if (!typing.has(data.conversationID)) typing.set(data.conversationID, [])
    let conversationTyping = typing.get(data.conversationID)
    if (!data.typing) conversationTyping.splice(conversationTyping.indexOf(data.userID), 1)
    else conversationTyping.push(data.userID)
    Database.findConversation(data.conversationID).then((conversation) => {
        for (let socket of getSockets(conversation.users)) {
            sendTyping(socket, data.conversationID)
        }
    })
}
function blockUser(data) {
    Database.block(data.userID, data.blockedUserID)
}
function unblockUser(data) {
    Database.unblock(data.userID, data.blockedUserID)
}
function sendTyping(ws, conversationID) {
    if (!typing.has(conversationID)) ws.send(JSON.stringify({type: Helper.Type.TYPING, conversationID: conversationID, conversationTyping: []}))
    else ws.send(JSON.stringify({type: Helper.Type.TYPING, conversationID: conversationID, conversationTyping: typing.get(conversationID)}))
}
function sendRequestedConversation(ws, data) { // conversationID can be users array
    Database.findConversation(data.conversationID).then(async (conversation) => {
        if (!conversation && data.conversationType === Helper.direct) conversation = await Database.findConversationWithUsers(data.conversationID)
        if (!conversation) {
            conversation = await Database.createConversation({users: data.conversationID, conversationType: data.conversationType, leader: data.leader})
            data.type = Helper.Type.CONVERSATIONCREATED
        }
        ws.send(JSON.stringify({type: data.type, conversation: conversation}))
    })
}
function inviteToGroupChat(data) {
    Database.addUsersToGroupChat(data.conversationID, data.users).then((conversation) => {
        for (let socket of getSockets(conversation.users)) {
            socket.send(JSON.stringify({type: Helper.Type.INVITETOGROUPCHAT, conversation: conversation})) // can be optimized
        }
        Database.findUsersWithID(data.users).then(users => {
            for (let user of users) sendServerMessage(data.conversationID, user.username + " just joined")
        })
    })

}
function sendServerMessage(conversationID, text) {
    Database.addServerMessage(text, conversationID).then(conversation => {
        let messageID = conversation.texts[conversation.texts.length - 1].messageID
        for (let socket of getSockets(conversation.users)) {
            socket.send(JSON.stringify({type: Helper.Type.NEWSERVERMESSAGE, text: text, conversationID: conversationID, messageID: messageID}))
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
            if (!conversation || conversation === Helper.direct) return
            for (let socket of getSockets(originalConversation.users)) {
                socket.send(JSON.stringify({type: Helper.Type.CLOSECONVERSATION, conversation: conversation, userID: data.userID}))
            }
            if (data.conversationType === Helper.group) {
                Database.findUserWithID(data.userID).then(user => sendServerMessage(data.conversationID,user.username + " just left"))
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
            socket.send(JSON.stringify({type: Helper.Type.DELETEMESSAGE, messageID: data.messageID})) // why doesn't this send conversationid? check for glitches
        }
    })
}
function receivedMessage(message) {
    updateTyping({conversationID: message.conversationID, userID: message.userID, typing: false})
    Database.addMessage(message).then((conversation) => {
        message.messageID = conversation.texts[conversation.texts.length - 1].messageID
        for (let socket of getSockets(conversation.users)) {
            if (conversation.texts.length === 1) socket.send(JSON.stringify({type: Helper.Type.FIRSTMESSAGE, message: message, conversation: conversation}))
            else socket.send(JSON.stringify({type: Helper.Type.NEWMESSAGE, message: message}))
        }
    })
}
function getSockets(users) {
    return users.flatMap(userID => clients.filter(client => client.userID === userID)).map(client => client.socket)
}
function readMessage(data) {
    Database.updateReadMessages([data.userID], data.conversationID, data.messageID).then(() => {
        Database.findConversation(data.conversationID).then((conversation) => {
            if (!conversation) return
            for (let socket of getSockets(conversation.users)) {
                socket.send(JSON.stringify({type: Helper.Type.READMESSAGE, conversationID: data.conversationID, userID: data.userID, messageID: data.messageID}))
            }
        })
    })

}

function loadLocalData(ws, user) {
    if (!user) return
    Database.findConversations(user.conversations).then((conversations) => {
        if (!conversations) return
        conversations = conversations.filter(conversation => conversation)
        let userIDs = new Set(conversations.flatMap(conversation => conversation.users))
        Database.findUsersWithID(Array.from(userIDs)).then((users) => {
            Database.getReadMessages(conversations.map(conversation => conversation.conversationID)).then((readMessages) => {
                ws.send(JSON.stringify({type: Helper.Type.LOADLOCALDATA, conversations: conversations, users: users, readMessages: readMessages}))
            })

        })
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