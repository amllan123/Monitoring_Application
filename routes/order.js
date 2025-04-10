const Order = require("../models/Order");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();
const logger = require('../logger');  // Import the logger

//CREATE
router.post("/:id", verifyTokenAndAuthorization, async (req, res) => {
  const newOrder = new Order(req.body);

  try {
    const savedOrder = await newOrder.save();
    logger.info(`Order created for user ${req.params.id}`);
    res.status(200).json(savedOrder);
  } catch (err) {
    logger.error(`Error creating order for user ${req.params.id}: ${err.message}`);
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    logger.info(`Order ${req.params.id} updated`);
    res.status(200).json(updatedOrder);
  } catch (err) {
    logger.error(`Error updating order ${req.params.id}: ${err.message}`);
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    logger.info(`Order ${req.params.id} deleted`);
    res.status(200).json("Order has been deleted...");
  } catch (err) {
    logger.error(`Error deleting order ${req.params.id}: ${err.message}`);
    res.status(500).json(err);
  }
});

//GET USER ORDERS
router.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.id });
    logger.info(`Orders retrieved for user ${req.params.id}`);
    res.status(200).json(orders);
  } catch (err) {
    logger.error(`Error retrieving orders for user ${req.params.id}: ${err.message}`);
    res.status(500).json(err);
  }
});

//GET ALL
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    logger.info(`All orders retrieved`);
    res.status(200).json(orders);
  } catch (err) {
    logger.error(`Error retrieving all orders: ${err.message}`);
    res.status(500).json(err);
  }
});

// GET MONTHLY INCOME
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const productId = req.query.pid;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    logger.info(`Monthly income retrieved`);
    res.status(200).json(income);
  } catch (err) {
    logger.error(`Error retrieving monthly income: ${err.message}`);
    res.status(500).json(err);
  }
});

module.exports = router;
