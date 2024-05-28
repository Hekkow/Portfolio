const express = require('express')
const Database = require('./database.js')
const app = express()
const loginServer = require('./loginServer.js')
require('express-ws')(app)
const helper = require('./public/helper.js')

const clients = []
Database.initPromise.then(async () => {
    await Database.deleteAll()
    Database.createLatestIDs()
})

app.use(express.static('public'));
app.use(express.json());
app.ws('/main', (ws, req) => {
    ws.on('message', (msg) => {
        let data = JSON.parse(msg)
        switch (data.type) {
            case helper.Type.LOGIN:
                login(ws, data.userID)
                break
            case helper.Type.STARTCONVERSATION:
            case helper.Type.REQUESTCONVERSATION:
                sendRequestedConversation(ws, data.conversationID, data.type)
                break
            case helper.Type.NEWMESSAGE:
                receivedMessage(data.message)
                break
            case helper.Type.DELETEMESSAGE:
                deleteMessage(data)
                break
            case helper.Type.EDITMESSAGE:
                editMessage(data.message)
                break
            case helper.Type.CLOSECONVERSATION:
                closeConversation(data)
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
            ws.send(JSON.stringify({type: helper.Type.BACKTOLOGIN}))
            return
        }
        console.log(user.username + " logged in")
        clients.push({socket: ws, userID: userID})
        ws.send(JSON.stringify({type: helper.Type.RECEIVEUSERNAME, user: user}))
        loadLocalData(ws, user)
        updateUserLists()
    })
}
function sendRequestedConversation(ws, conversationID, type) {
    Database.findConversation(conversationID).then(async (conversation) => {
        if (!conversation) conversation = await Database.findConversationWithUsers(conversationID)
        if (!conversation) {
            conversation = await Database.createConversation(conversationID)
            type = helper.Type.CONVERSATIONCREATED
        }
        ws.send(JSON.stringify({type: type, conversation: conversation}))
    })
}
function closeConversation(data) {
    Database.closeConversation(data.userID, data.conversationID)
}
function editMessage(message) {
    Database.editMessage(message.conversationID, message.messageID, message.message).then((conversation) => {
        for (let userID of conversation.users) {
            let client = clients.find(client => client.userID === userID)
            if (!client) continue
            client.socket.send(JSON.stringify({type: helper.Type.EDITMESSAGE, message: {userID: message.userID, messageID: message.messageID, message: message.message}}))
        }
    })
}
function deleteMessage(data) {
    Database.deleteMessage(data.conversationID, data.messageID).then((conversation) => {
        for (let userID of conversation.users) {
            let client = clients.find(client => client.userID === userID)
            if (!client) continue
            client.socket.send(JSON.stringify({type: helper.Type.DELETEMESSAGE, messageID: data.messageID})) // why doesn't this send conversationid? check for glitches
        }
    })
}
function receivedMessage(message) {
    Database.addMessage(message).then((conversation) => {
        message.messageID = conversation.texts[conversation.texts.length - 1].messageID

        for (let userID of conversation.users) {
            let client = clients.find(client => client.userID === userID)
            if (!client) continue
            if (conversation.texts.length === 1) client.socket.send(JSON.stringify({type: helper.Type.FIRSTMESSAGE, message: message, conversation: conversation}))
            else client.socket.send(JSON.stringify({type: helper.Type.NEWMESSAGE, message: message}))

        }
    })
}

function loadLocalData(ws, user) {
    Database.findConversations(user.conversations).then((conversations) => {
        let userIDs = new Set(conversations.flatMap(conversation => conversation.users))
        Database.findUsersWithID(Array.from(userIDs)).then((users) => {
            ws.send(JSON.stringify({type: helper.Type.LOADLOCALDATA, conversations: conversations, users: users}))
        })
    })

}

function updateUserLists() {
    Database.findUsersWithID(clients.map(client => client.userID)).then((users) => {
        for (let client of clients) {
            client.socket.send(JSON.stringify({type: helper.Type.ONLINEUSERSUPDATE, users: users}))
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
app.listen({port: helper.port, host: helper.host}, () => {
    console.log("Server started")
})