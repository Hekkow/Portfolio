const express = require('express')
const Database = require('./database.js')
const router = express.Router()
let sessionIDs = new Map()
router.use(express.urlencoded({ extended: true }))
router.post('/attemptLogin', (req, res) => {
    Database.loginOrRegister(req.body.username, req.body.password).then((user) => {
        if (user) {
            let sessionID = crypto.randomUUID()
            sessionIDs.set(sessionID, user.userID)
            res.send({sessionID: sessionID})
        }
        else res.send({sessionID: -1})
    })
})
router.post('/attemptLoginID', (req, res) => {
    if (!sessionIDs.has(req.body.sessionID)) res.send({sessionID: -1})
    else res.send({sessionID: req.body.sessionID})
})
function getUser(sessionID) {
    return sessionIDs.get(sessionID) || null
}
function removeUser(sessionID) {
    sessionIDs.delete(sessionID)
}
module.exports = { router, getUser, removeUser}