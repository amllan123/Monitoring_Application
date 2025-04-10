const router = require('express').Router();
const User = require("../models/User");
const CryptoJs = require('crypto-js');
const jwt = require('jsonwebtoken');
const logger = require('../logger');  // Import the logger

// Register
router.post('/register', async (req, res) => {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJs.AES.encrypt(req.body.password, process.env.PASSWORD_SEC).toString()
    });

    try {
        const savedUser = await newUser.save();
        logger.info(`User registered: ${savedUser.username}`);
        res.status(201).json(savedUser);
    } catch (error) {
        logger.error(`Error registering user: ${error.message}`);
        res.status(500).json(error);
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            logger.warn(`Login failed: wrong credentials for username ${req.body.username}`);
            return res.status(401).json("Wrong credentials");
        }

        const hashedPassword = CryptoJs.AES.decrypt(user.password, process.env.PASSWORD_SEC);
        const originalPassword = hashedPassword.toString(CryptoJs.enc.Utf8);

        if (originalPassword !== req.body.password) {
            logger.warn(`Login failed: wrong credentials for username ${req.body.username}`);
            return res.status(401).json("Wrong credentials");
        }

        const { password, ...other } = user._doc;
        const accessToken = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin
        }, process.env.JWT_SEC, { expiresIn: "3d" });

        logger.info(`User logged in: ${user.username}`);
        res.status(200).json({ ...other, accessToken });

    } catch (error) {
        logger.error(`Error during login: ${error.message}`);
        res.status(500).json(error);
    }
});

module.exports = router;
