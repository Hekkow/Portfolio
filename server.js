const express = require('express')
const Database = require('./database.js')
const app = express()
const loginServer = require('./loginServer.js')
require('express-ws')(app)
const Helper = require('./public/helper.js')

const clients = []
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
                login(ws, data.userID)
                break
            case Helper.Type.STARTCONVERSATION:
            case Helper.Type.REQUESTCONVERSATION:
                sendRequestedConversation(ws, data.conversationID, data.conversationType, data.type)
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
            case Helper.Type.READMESSAGE:
                readMessage(data)
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
function login(ws, userID) {
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
function sendRequestedConversation(ws, conversationID, conversationType, type) { // conversationID can be users array
    Database.findConversation(conversationID).then(async (conversation) => {
        if (!conversation && conversationType === Helper.direct) conversation = await Database.findConversationWithUsers(conversationID)
        if (!conversation) {
            conversation = await Database.createConversation(conversationID, conversationType)
            type = Helper.Type.CONVERSATIONCREATED
        }
        ws.send(JSON.stringify({type: type, conversation: conversation}))
    })
}
function inviteToGroupChat(data) {
    Database.addUsersToGroupChat(data.conversationID, data.users).then((conversation) => {
        for (let userID of conversation.users) {
            let client = clients.find(client => client.userID === userID)
            if (!client) continue
            client.socket.send(JSON.stringify({type: Helper.Type.INVITETOGROUPCHAT, conversation: conversation})) // can be optimized
        }
    })
}
function renameGroupChat(data) {
    Database.renameGroupChat(data.conversationID, data.newName).then((conversation) => {
        for (let userID of conversation.users) {
            let client = clients.find(client => client.userID === userID)
            if (!client) continue
            client.socket.send(JSON.stringify({type: Helper.Type.RENAMEGROUPCHAT, conversation: conversation})) // can be optimzied
        }
    })
}
function closeConversation(data) {
    Database.findConversation(data.conversationID).then((originalConversation) => {
        Database.closeConversation(data.userID, data.conversationID, data.conversationType).then((conversation) => {
            if (!conversation || conversation === Helper.direct) return
            for (let userID of originalConversation.users) {
                let client = clients.find(client => client.userID === userID)
                if (!client) continue
                client.socket.send(JSON.stringify({type: Helper.Type.CLOSECONVERSATION, conversation: conversation, userID: data.userID}))
            }
        })
    })

}
function editMessage(message) {
    Database.editMessage(message.conversationID, message.messageID, message.message).then((conversation) => {
        for (let userID of conversation.users) {
            let client = clients.find(client => client.userID === userID)
            if (!client) continue
            client.socket.send(JSON.stringify({type: Helper.Type.EDITMESSAGE, message: {conversationID: message.conversationID, userID: message.userID, messageID: message.messageID, message: message.message}}))
        }
    })
}
function deleteMessage(data) {
    Database.deleteMessage(data.conversationID, data.messageID).then((conversation) => {
        for (let userID of conversation.users) {
            let client = clients.find(client => client.userID === userID)
            if (!client) continue
            client.socket.send(JSON.stringify({type: Helper.Type.DELETEMESSAGE, messageID: data.messageID})) // why doesn't this send conversationid? check for glitches
        }
    })
}
function receivedMessage(message) {
    Database.addMessage(message).then((conversation) => {
        message.messageID = conversation.texts[conversation.texts.length - 1].messageID

        for (let userID of conversation.users) {
            let client = clients.find(client => client.userID === userID)
            if (!client) continue
            if (conversation.texts.length === 1) client.socket.send(JSON.stringify({type: Helper.Type.FIRSTMESSAGE, message: message, conversation: conversation}))
            else client.socket.send(JSON.stringify({type: Helper.Type.NEWMESSAGE, message: message}))

        }
    })
}
function readMessage(data) {
    Database.updateReadMessages([data.userID], data.conversationID, data.messageID).then(() => {
        Database.findConversation(data.conversationID).then((conversation) => {
            for (let userID of conversation.users) {
                let client = clients.find(client => client.userID === userID)
                if (!client) continue
                client.socket.send(JSON.stringify({type: Helper.Type.READMESSAGE, conversationID: data.conversationID, userID: data.userID, messageID: data.messageID}))
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
            ws.send(JSON.stringify({type: Helper.Type.LOADLOCALDATA, conversations: conversations, users: users}))
        })
    })

}

function updateUserLists() {
    Database.findUsersWithID(clients.map(client => client.userID)).then((users) => {
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

app.use('/', loginServer)
app.listen({port: Helper.port, host: Helper.host}, () => {
    console.log("Server started")
})