const express = require('express')
const contacts = require('../controllers/contact.controller')

const ContactService = require("../services/contact.service");
const MongoDB = require("../untils/mongodb.util");
const ApiError = require("../api-error");

const router = express.Router()

router.route("/")
    .get(contacts.findAll)
    .post(contacts.create)
    .delete(contacts.deleteAll)

router.route("/favorite")
    .get(contacts.findAllFavorite)

router.route("/:id")
    .get(contacts.findOne)
    .put(contacts.update)
    .delete(contacts.delete)

module.exports = router
