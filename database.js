const { MongoClient } = require("mongodb")
const { readFile } = require('fs').promises

class Database {
    constructor() { this.initPromise = this.init() }
    async init() {
        this.uri = JSON.parse(await readFile('private.json')).databaseuri
        this.client = new MongoClient(this.uri)

        this.database = this.client.db('ChatApp')
        this.users = this.database.collection('Users')
        this.conversations = this.database.collection('Conversations')
        this.latestIDs = await this.database.collection('LatestIDs')

        await this.users.createIndex({userID: 1})
        await this.conversations.createIndex({conversationID: 1})

        await this.createLatestIDs()
    }
    async createLatestIDs() {
        let latestIDs = await this.latestIDs.findOne()
        if (!latestIDs) await this.latestIDs.insertOne({ latestConversationID: 1, latestUserID: 1, latestMessageID: 1 });
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
            {$push: {texts: {userID: message.userID, message: message.message, messageID: await this.getLatestMessageID()}}},
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
        await this.users.drop()
        await this.conversations.drop()
        await this.latestIDs.drop()
    }
    async createConversation(users) {
        let previousConversation = await this.conversations.findOne({users: {$all: users, $size: users.length}})
        if (previousConversation) return previousConversation
        let id = await this.getLatestConversationID()
        let conversation = {conversationID: id, texts: [], users: users}
        for (let user of users) {
            this.users.updateOne({userID: user}, {$push: {conversations: conversation.conversationID}})
        }
        await this.conversations.insertOne(conversation)
        return conversation
    }
    async getLatestUserID() {
        let latestIDs = await this.latestIDs.findOne()
        let latestUserID = ++latestIDs.latestUserID
        this.latestIDs.updateOne({}, { $set: { latestUserID: latestUserID } })
        return latestUserID
    }
    async getLatestConversationID() {
        let latestIDs = await this.latestIDs.findOne()
        let latestConversationID = ++latestIDs.latestConversationID
        this.latestIDs.updateOne({}, { $set: { latestConversationID: latestConversationID } })
        return latestConversationID
    }
    async getLatestMessageID() {
        let latestIDs = await this.latestIDs.findOne()
        let latestMessageID = ++latestIDs.latestMessageID
        this.latestIDs.updateOne({}, { $set: { latestMessageID: latestMessageID } })
        return latestMessageID
    }
    async loginOrRegister(username) {
        let user = await this.findUserWithName(username)
        if (!user) user = await this.register(username)
        return user
    }
}
module.exports = new Database();