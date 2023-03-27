const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const ApiError = require("../api-error")
const MongoDB = require("../untils/mongodb.util")
const ContactService = require("../services/contact.service")
const User = require('../models/user')

// Register
exports.register = async (req, res) => {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    });
   const result = await user.save()
   const {password, ...data} = await result.toJSON()
   res.send(data)
};

// Login
exports.login = async (req, res) => {
    const user = await User.findOne({email: req.body.email})
    if (!user) {
        return res.status(404).send({
            message: 'User not found'
        })
    }

    if (!await bcrypt.compare(req.body.password, user.password)) {
        return res.status(400).send({
            message: 'Invalid credentials'
        })
    }
    const token = jwt.sign({_id: user._id}, "secret")
    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24*60*60*1000
    })
    res.send({
        message: 'success'
    })
};

// User
exports.user = async (req, res) => {
    try {
        const cookie = req.cookies['jwt']
        const claims = jwt.verify(cookie, "secret")
        if (!claims) {
            return res.status(401).send({
                message: 'authenticated'
            })
        }
        const user = await User.findOne({_id: claims._id})
        const {password, ...data} = await user.toJSON()
        res.send(data)
    } catch (err) {
        return res.status(404).send({
            message: 'authenticated'
        })
    }
};

// Logout
exports.logout = async (req, res) => {
    res.cookie('jwt', {maxAge: 0})
    res.send({
        message: 'success'
    })
};


// Create and Save a new Contact
exports.create = async(req, res, next) => {
    if(!req.body?.name) {
        return next(new ApiError(400, "Name cannot be empty"));
    }
    try {
        const contactService = new ContactService(MongoDB.client);
        const document = await contactService.create(req.body);
        return res.send(document); 
    } catch (error) {
        console.log(error)
        return next(
            new ApiError(500, "An error pccurred while creating the contact")
        );
    }
};

// Retrieve all contacts of a user from the database
exports.findAll = async(req, res, next) => {
    let documents = [];
    try {
        const contactService = new ContactService(MongoDB.client);
        const { name } = req.body;

        if(name) {
            documents = await contactService.findByName(name);
        } else {
            documents = await contactService.find({});
        } 
    } catch (error) {
        return next(
            new ApiError(500, "An error pccurred while retrieve contacts")
        );
    }

    return res.send(documents);
};

// Find a single contact with an id
exports.findOne = async(req, res, next) => {
    try {
        const contactService = new ContactService(MongoDB.client);
        const document = await contactService.findById(req.params.id)
        if(!document) {
            return next(
                new ApiError(404, "Contact not found")
            );
        }
        return res.send(document); 
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving comtact with id=${req.params.id}`)
        );
    }
};

// Update a contact by the id in the request
exports.update = async(req, res, next) => {
    if(Object.keys(req.body).length === 0) {
        return next(
            new ApiError(400, "Data to update can not be empty")
        )
    }
    try {
        const contactService = new ContactService(MongoDB.client);
        const document = await contactService.update(req.params.id, req.body)
        if(!document) {
            return next(
                new ApiError(404, "Contact not found")
            );
        }
        return res.send({ message: "Contact was updated successfully" }); 
    } catch (error) {
        return next(
            new ApiError(500, `Error updating comtact with id=${req.params.id}`)
        );
    }
};

// Delete a contact with the specified id in the request
exports.delete = async(req, res, next) => {
    try {
        const contactService = new ContactService(MongoDB.client);
        const document = await contactService.delete(req.params.id)
        if(!document) {
            return next(
                new ApiError(404, "Contact not found")
            );
        }
        return res.send({ message: "Contact was deleted successfully" }); 
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete comtact with id=${req.params.id}`)
        );
    }
};

// Find all favorite contacts of a user
exports.findAllFavorite = async(_req, res, next) => {
    try {
        const contactService = new ContactService(MongoDB.client);
        const documents = await contactService.findFavorite()
        console.log(contactService.findFavorite())
        return res.send(documents); 
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving favorite contacts")
        );
    }
};

// Delete all contacts off a user from the database
exports.deleteAll = async(_req, res, next) => {
    try {
        const contactService = new ContactService(MongoDB.client);
        const deleteCount = await contactService.deleteAll()
        return res.send({ message: `${deleteCount} contacts were deleted successfully` }); 
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all contacts")
        );
    }
};

