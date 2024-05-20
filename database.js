const { MongoClient } = require("mongodb")
const { readFile } = require('fs').promises

class Database {
    constructor() { this.init() }
    async init() {
        this.uri = JSON.parse(await readFile('private.json')).databaseuri
        this.client = new MongoClient(this.uri)
        this.database = this.client.db('ChatApp')
        this.users = this.database.collection('Users')
        this.users.createIndex({userID: 1})
        this.conversations = this.database.collection('Conversations')
        this.conversations.createIndex({conversationID: 1})
    }
    async register(username) {
        let id = await this.getLatestUserID()
        let user = {username: username, conversations:[], userID: id}
        await this.users.insertOne(user)
        return user
    }
    async findUserWithID(userID) {
        let user = await this.users.findOne({userID: userID})
        return user
    }
    async findUsersWithID(userIDs) {
        let promises = userIDs.map(userID => this.findUserWithID(userID))
        let users = await Promise.all(promises)
        return users
    }
    async addMessage(message) {
        return await this.conversations.findOneAndUpdate(
            {conversationID: message.conversationID},
            {$push: {texts: {userID: message.userID, message: message.message}}},
            {returnDocument: "after"})
    }
    async findUserWithName(username) {
        return await this.users.findOne({username: username})
    }
    async findConversation(conversationID) {
        let conversation = await this.conversations.findOne({conversationID: conversationID})
        return conversation
    }
    async findConversations(conversationIDs) {
        let promises = conversationIDs.map(conversationID => this.findConversation(conversationID))
        let conversations = await Promise.all(promises)
        return conversations
    }
    async deleteAll() {
        this.users.drop()
        this.conversations.drop()
    }
    async createConversation(users) {
        let previousConversation = await this.conversations.findOne({users: {$all: users, $size: users.length}})
        if (previousConversation) return previousConversation
        let id = await this.getLatestConversation()
        let conversation = {conversationID: id, texts: [], users: users}
        for (let user of users) {
            this.users.updateOne({userID: user}, {$push: {conversations: conversation.conversationID}})
        }
        await this.conversations.insertOne(conversation)
        return conversation
    }
    async getLatestUserID() {
        let user = await this.users.find().sort({userID: -1}).limit(1).toArray()
        if (user[0]) {
            return ++user[0].userID
        }
        else return 1
    }
    async getLatestConversation(id) {
        let conversation = await this.conversations.find().sort({conversationID: -1}).limit(1).toArray()
        if (conversation[0]) {
            return ++conversation[0].conversationID
        }
        else return 1
    }
    async loginOrRegister(username) {
        let user = await this.findUserWithName(username)
        if (!user) user = await this.register(username)
        return user
    }
}
module.exports = new Database();