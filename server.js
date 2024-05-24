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
            case helper.Type.OPENCONVERSATION:
            case helper.Type.REQUESTCONVERSATION:
                sendRequestedConversation(ws, data.conversationID, data.type)
                break
            case helper.Type.NEWMESSAGE:
                receivedMessage(data.message)
                break
            case helper.Type.DELETEMESSAGE:
                deleteMessage(data)
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
        clients.push({socket: ws, userID: userID})
        ws.send(JSON.stringify({type: helper.Type.RECEIVEUSERNAME, user: user}))
        updateUserLists()
        loadConversations(ws, user)
    })
}
function sendRequestedConversation(ws, conversationID, type) {
    Database.findConversation(conversationID).then(async (conversation) => {
        if (!conversation) conversation = await Database.findConversationWithUsers(conversationID)
        if (!conversation) conversation = await Database.createConversation(conversationID)
        getConversationWithUsernames(conversation).then((newConversation) => {
            if (!newConversation) return
            let promises = newConversation.texts.map((text) => {
                return Database.findUserWithID(text.userID).then((user) => {
                    text.user = user
                    return text
                })
            })
            Promise.all(promises).then((updatedTexts) => {
                newConversation.texts = updatedTexts
                ws.send(JSON.stringify({type: type, conversation: newConversation}))
            })
        })
    })
}
function startConversation(ws, users) {
    Database.findConversationWithUsers(users).then(async (conversation) => {
        if (!conversation) conversation = await Database.createConversation(users)
        Database.findUsersWithID(conversation.users).then((users) => {
            conversation.users = users
            ws.send(JSON.stringify({type: helper.Type.CONVERSATIONCREATED, conversation: conversation}))
        })
    })
}
function deleteMessage(data) {
    Database.deleteMessage(data.conversationID, data.messageID).then((conversation) => {
        for (let userID of conversation.users) {
            let client = clients.find(client => client.userID === userID)
            if (!client) continue
            client.socket.send(JSON.stringify({type: helper.Type.DELETEMESSAGE, messageID: data.messageID}))
        }
    })
}
function receivedMessage(message) {
    Database.addMessage(message).then((conversation) => {
        console.log(conversation)
        for (let userID of conversation.users) {
            let client = clients.find(client => client.userID === userID)
            if (!client) continue
            Database.findUserWithID(message.userID).then((user) => {
                message.messageID = conversation.texts[conversation.texts.length - 1].messageID
                message.user = user
                client.socket.send(JSON.stringify({type: helper.Type.NEWMESSAGE, message: message}))
            })
        }
    })
}
async function getConversationWithUsernames(conversation) {
    if (!conversation) return
    return Database.findUsersWithID(conversation.users).then((users) => {
        conversation.users = users
        return conversation
    })
}

function loadConversations(ws, user) {
    Database.findConversations(user.conversations).then((conversations) => { // get user's conversations
        let promises = conversations.map(getConversationWithUsernames)
        Promise.all(promises).then((conversations) => {
            let sendableConversation = conversations.map(conversation => {
                if (!conversation) return
                return conversation
            })
            ws.send(JSON.stringify({type: helper.Type.LOADCONVERSATIONS, conversations: sendableConversation}))
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