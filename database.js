const { MongoClient } = require("mongodb")
const { readFile } = require('fs').promises
const Helper = require('./public/helper.js')

class Database {
    constructor() { this.initPromise = this.init() }
    async init() {
        this.uri = JSON.parse(await readFile('private.json')).databaseuri
        this.client = new MongoClient(this.uri)
        this.database = this.client.db('ChatApp')
        this.users = this.database.collection('Users')
        this.conversations = this.database.collection('Conversations')
        this.latestIDs = await this.database.collection('LatestIDs')
        this.readMessages = await this.database.collection('ReadMessages')
        await this.users.createIndex({userID: 1})
        await this.conversations.createIndex({conversationID: 1})
        await this.readMessages.createIndex({conversationID: 1})
    }
    async createPublicConversation() {
        if (await this.getLatestConversationID() === 2) await this.createConversation({users: [], conversationType: Helper.group, conversationName: "Howdy"})
    }
    async createLatestIDs() {
        let latestIDs = await this.latestIDs.findOne()
        if (!latestIDs) await this.latestIDs.insertOne({ latestConversationID: 1, latestUserID: 1, latestMessageID: 1 });
    }
    async saveProfilePicture(userID, shapes) {
        return await this.users.findOneAndUpdate({userID: userID}, {$set: {profilePic: shapes}}, {returnDocument: 'after'})
    }
    async register(username, password) {
        let id = await this.getLatestUserID()
        let publicConversationID = 3
        let user = {username: username, password: password, conversations: [], userID: id, blocked: [], profilePic: ""}
        await this.users.insertOne(user)
        await this.addUsersToGroupChat(publicConversationID, [id])
        user.password = null
        return user
    }
    async block(userID, blockedUserID) {
        await this.users.findOneAndUpdate({userID: userID}, {$push: {blocked: blockedUserID}})
    }
    async unblock(userID, blockedUserID) {
        await this.users.findOneAndUpdate({userID: userID}, {$pull: {blocked: blockedUserID}})
    }
    async findUserWithID(userID) {
        let user = await this.users.findOne({userID: userID})
        if (user) user.password = null
        return user
    }
    async findUsersWithID(userIDs) {
        let promises = userIDs.map(userID => this.findUserWithID(userID))
        let users = await Promise.all(promises)
        return users
    }
    async addUsersToGroupChat(conversationID, users) {
        let conversation = await this.conversations.findOneAndUpdate(
            {conversationID: conversationID},
            {$addToSet: {users: { $each: users }}},
            {returnDocument: "after"}
        )
        await this.users.updateMany(
            {userID: { $in: users }},
            {$addToSet: {conversations: conversationID}}
        )
        return conversation
    }
    async updateReadMessages(userID, conversationID, messageID) {
        return await this.conversations.findOneAndUpdate(
            {conversationID: conversationID},
            {$set: {[`read.${userID}`]: messageID}},
            {upsert: true, returnDocument: 'after'}
        )
    }
    async getReadMessages(conversationID) {
        let conversation = await this.conversations.findOne({conversationID: conversationID})
        return conversation.read
    }
    async renameGroupChat(conversationID, newName) {
        return await this.conversations.findOneAndUpdate({conversationID: conversationID}, {$set: {conversationName: newName}}, {returnDocument: "after"})
    }
    async transferLeader(conversationID, newLeader) {
        return await this.conversations.findOneAndUpdate({conversationID: conversationID}, {$set: {leader: newLeader}}, {returnDocument: "after"})
    }
    async addMessage(message) {
        let messageID = await this.getLatestMessageID()
        let conversation = await this.conversations.findOneAndUpdate(
            {conversationID: message.conversationID},
            {$push: {texts: {userID: message.userID, message: message.message, replyingTo: message.replyingTo, messageID: messageID, date: message.date}}},
            {returnDocument: "after"})
        await this.readMessages.updateOne({userID: message.userID, conversationID: message.conversationID}, {$set: {messageID: messageID}})
        await this.users.updateMany(
            {userID: {$in: conversation.users} },
            {$addToSet: {conversations: conversation.conversationID}}
        )
        return conversation
    }
    async deleteMessage(conversationID, messageID) {
        return await this.conversations.findOneAndUpdate(
            {conversationID: conversationID},
            {$pull: {texts: {messageID: messageID}}},
            {returnDocument: "after"}
        )
    }
    async editMessage(conversationID, messageID, message) {
        return await this.conversations.findOneAndUpdate(
            {conversationID: conversationID, "texts.messageID": messageID},
            {$set: { "texts.$.message": message}}, // i have no idea what this line means now and i fear it may be too late for me
            {returnDocument: "after"}
        )
    }
    async findUserWithName(username) {
        return await this.users.findOne({username: username})
    }
    async findConversationWithUsers(users) {
        if (!Array.isArray(users)) return null
        let conversation = await this.conversations.findOne({users: {$all: users, $size: users.length}, conversationType: Helper.direct})
        return conversation
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
    async closeConversation(userID, conversationID, conversationType) {
        await this.users.findOneAndUpdate(
            {userID: userID},
            {$pull: {conversations: conversationID}}
        )
        if (conversationType === Helper.group) {
            return await this.conversations.findOneAndUpdate({conversationID: conversationID}, {$pull: {users: userID}}, {returnDocument: "after"})
        }
    }
    async deleteAll() {
        await this.users.drop()
        await this.conversations.drop()
        await this.latestIDs.drop()
        await this.readMessages.drop()
    }
    async createConversation(data) {
        if (!Array.isArray(data.users)) return null
        if (data.conversationType === Helper.direct) {
            let previousConversation = await this.conversations.findOne({users: {$all: data.users, $size: data.users.length}, conversationType: Helper.direct})
            if (previousConversation) return previousConversation
        }
        let id = await this.getLatestConversationID()
        let conversation = {conversationID: id, texts: [], users: data.users, conversationType: data.conversationType, read: {}}
        if (data.leader) conversation.leader = data.leader
        if (data.conversationName) conversation.conversationName = data.conversationName
        for (let user of data.users) {
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
    async loginOrRegister(username, password) {
        let user = await this.findUserWithName(username, password)
        if (user) {
            if (user.password === password) {
                user.password = null
                return user
            }
            return null
        }
        else return await this.register(username, password)
    }
}
module.exports = new Database();