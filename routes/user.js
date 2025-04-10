const router = require('express').Router();
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const CryptoJs = require('crypto-js');
const User = require('../models/User');
const logger = require('../logger');  // Import the logger

// Update User
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJs.AES.encrypt(req.body.password, process.env.PASSWORD_SEC).toString();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
      $set: req.body
    }, { new: true });

    logger.info(`User with ID ${req.params.id} updated`);
    res.status(200).json(updatedUser);
  } catch (error) {
    logger.error(`Error updating user with ID ${req.params.id}: ${error.message}`);
    res.status(500).json(error);
  }
});

// Delete User
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    logger.info(`User with ID ${req.params.id} deleted`);
    res.status(201).json("User deleted");
  } catch (error) {
    logger.error(`Error deleting user with ID ${req.params.id}: ${error.message}`);
    res.status(500).json(error);
  }
});

// Get User (Admin only)
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    logger.info(`User with ID ${req.params.id} retrieved`);
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Error retrieving user with ID ${req.params.id}: ${error.message}`);
    res.status(500).json(error);
  }
});

// Get All Users (Admin only)
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query ? await User.find().sort({ _id: -1 }).limit(5) : await User.find();
    logger.info(`All users retrieved`);
    res.status(200).json(users);
  } catch (error) {
    logger.error(`Error retrieving all users: ${error.message}`);
    res.status(500).json(error);
  }
});

// Get User Stats (Admin only)
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        }
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 }
        }
      }
    ]);
    logger.info(`User stats retrieved`);
    res.status(200).json(data);
  } catch (error) {
    logger.error(`Error retrieving user stats: ${error.message}`);
    res.status(500).json(error);
  }
});

module.exports = router;
