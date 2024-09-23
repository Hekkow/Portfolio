const { MongoClient } = require("mongodb")
const { readFile } = require('fs').promises
const Helper = require('./public/Helper.js')

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
        let user = {username: username, password: password, conversations: [], userID: id, blocked: [], profilePic: "", censored: [], openConversations: []}
        await this.users.insertOne(user)
        await this.addUsersToGroupChat(publicConversationID, [id])
        user.password = null
        return user
    }
    async changeUsername(userID, username) {
        if (await this.users.findOne({username: username})) return false
        await this.users.findOneAndUpdate({userID: userID}, {$set: {username: username}})
        return true
    }
    async changePassword(userID, password) {
        await this.users.findOneAndUpdate({userID: userID}, {$set: {password: password}})
    }
    async block(userID, blockedUserID) {
        await this.users.findOneAndUpdate({userID: userID}, {$push: {blocked: blockedUserID}})
    }
    async unblock(userID, blockedUserID) {
        await this.users.findOneAndUpdate({userID: userID}, {$pull: {blocked: blockedUserID}})
    }
    async updateCensors(userID, censored) {
        await this.users.findOneAndUpdate({userID: userID}, {$set: {censored: censored}})
    }
    async findUserWithID(userID) {
        let user = await this.users.findOne({userID: userID})
        if (user) user.password = null
        return user
    }
    async findUsersWithID(userIDs) {
        let users = await this.users.find({ userID: { $in: userIDs } }).toArray()
        users.forEach(user => { if (user) user.password = null})
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
            {$addToSet: {conversations: conversationID, openConversations: conversationID}}
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
        if (!conversation) return []
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
        if (conversation.texts.length === 1) await this.conversations.findOneAndUpdate({conversationID: message.conversationID}, {$set: {firstMessageID: messageID}})
        await this.readMessages.updateOne({userID: message.userID, conversationID: message.conversationID}, {$set: {messageID: messageID}})
        await this.users.updateMany(
            {userID: {$in: conversation.users} },
            {$addToSet: {conversations: conversation.conversationID, openConversations: conversation.conversationID}},
        )
        return conversation
    }
    async deleteMessage(conversationID, messageID) {
        let conversation = await this.conversations.findOneAndUpdate(
            {conversationID: conversationID},
            {$pull: {texts: {messageID: messageID}}},
            {returnDocument: "after"}
        )
        if (conversation.firstMessageID === messageID) {
            if (conversation.texts.length > 0) await this.conversations.findOneAndUpdate({conversationID: conversationID}, {$set: {firstMessageID: conversation.texts[0].messageID}})
        }
        return conversation
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
        let maximumLoad = 50
        let conversation = await this.conversations.findOne({conversationID: conversationID}, {projection: {texts: {$slice:-(maximumLoad+1)}}})
        if (!conversation) return null
        conversation.allLoaded = conversation?.texts.length <= maximumLoad
        conversation.texts = conversation.texts.slice(0, maximumLoad)
        return conversation
    }
    async getMoreMessages(conversationID, numberMessages, messageID) {
        let maximumLoad = 50
        let conversation = await this.conversations.findOne({conversationID: conversationID}, {projection: {texts: {$slice:[-numberMessages-(maximumLoad), maximumLoad]}}})
        let allLoaded = conversation.firstMessageID >= conversation.texts[0].messageID
        return {texts: conversation.texts.filter(text => text.messageID < messageID), allLoaded: allLoaded}
    }
    async findConversations(conversationIDs) {
        let promises = conversationIDs.map(conversationID => this.findConversation(conversationID))
        let conversations = await Promise.all(promises)
        return conversations
    }
    async addToOpenConversations(conversationID, userID) {
        return await this.users.findOneAndUpdate({userID: userID}, {$addToSet: {openConversations: conversationID}})
    }
    async closeConversation(userID, conversationID, conversationType) {
        if (conversationType === Helper.group) {
            await this.users.findOneAndUpdate(
                {userID: userID},
                {$pull: {conversations: conversationID}}
            )
            return await this.conversations.findOneAndUpdate({conversationID: conversationID}, {$pull: {users: userID}}, {returnDocument: "after"})
        }
        else {
            await this.users.findOneAndUpdate(
                {userID: userID},
                {$pull: {openConversations: conversationID}}
            )
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
        this.users.updateOne({userID: data.leader}, {$push: {openConversations: conversation.conversationID} })
        await this.conversations.insertOne(conversation)
        return conversation
    }
    async getLatestUserID() {
        let latestIDs = await this.latestIDs.findOne()
        let latestUserID = ++latestIDs.latestUserID
        await this.latestIDs.updateOne({}, { $set: { latestUserID: latestUserID } })
        return latestUserID
    }
    async getLatestConversationID() {
        let latestIDs = await this.latestIDs.findOne()
        let latestConversationID = ++latestIDs.latestConversationID
        await this.latestIDs.updateOne({}, { $set: { latestConversationID: latestConversationID } })
        return latestConversationID
    }
    async getLatestMessageID() {
        let latestIDs = await this.latestIDs.findOne()
        let latestMessageID = ++latestIDs.latestMessageID
        await this.latestIDs.updateOne({}, { $set: { latestMessageID: latestMessageID } })
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