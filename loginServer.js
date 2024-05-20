const express = require('express')
const Database = require('./database.js')
const router = express.Router()
router.use(express.urlencoded({ extended: true }))
router.post('/attemptLogin', (req, res) => {
    Database.loginOrRegister(req.body.identification).then((user) => {
        if (user) res.send({userID: user.userID})
        else res.send({userID: -1})
    })
})
router.post('/attemptLoginID', (req, res) => {
    Database.findUserWithID(req.body.userID).then((user) => {
        if (user) res.send({userID: user.userID})
        else res.send({userID: -1})
    })
})
module.exports = router