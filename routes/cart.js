const Cart = require("../models/Cart");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();
const logger = require('../logger');  // Import the logger

//CREATE
router.post("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const user = await Cart.findOne({ userId: req.params.id });
    if (user) {
      const newProduct = {
        productTitle: req.body.productTitle,
        productId: req.body.productId,
        quantity: req.body.quantity,
        productImage: req.body.productImage,
        productPrice: req.body.productPrice,
        productColor: req.body.productColor,
        productSize: req.body.productSize,
      };
      const updatedUser = await Cart.findByIdAndUpdate(
        user._id,
        { $push: { product: newProduct } },
        { new: true }
      );
      logger.info(`Product added to cart for user ${req.params.id}`);
      res.status(201).json(updatedUser);
    } else {
      const newCart = new Cart({
        userId: req.params.id,
        product: {
          productTitle: req.body.productTitle,
          productId: req.body.productId,
          quantity: req.body.quantity,
          productImage: req.body.productImage,
          productPrice: req.body.productPrice,
          productColor: req.body.productColor,
          productSize: req.body.productSize,
        },
      });

      const savedCart = await newCart.save();
      logger.info(`New cart created for user ${req.params.id}`);
      res.status(200).json(savedCart);
    }
  } catch (err) {
    logger.error(`Error creating or updating cart for user ${req.params.id}: ${err.message}`);
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id/:cartId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.cartId,
      {
        $set: req.body,
      },
      { new: true }
    );
    logger.info(`Cart ${req.params.cartId} updated for user ${req.params.id}`);
    res.status(200).json(updatedCart);
  } catch (err) {
    logger.error(`Error updating cart ${req.params.cartId} for user ${req.params.id}: ${err.message}`);
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    logger.info(`Cart ${req.params.id} deleted for user ${req.params.id}`);
    res.status(200).json("Cart has been deleted...");
  } catch (err) {
    logger.error(`Error deleting cart ${req.params.id} for user ${req.params.id}: ${err.message}`);
    res.status(500).json(err);
  }
});

//GET USER CART
router.get("/find/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.id });
    if (cart) {
      logger.info(`Cart retrieved for user ${req.params.id}`);
      res.status(200).json(cart);
    } else {
      logger.warn(`Cart not found for user ${req.params.id}`);
      res.status(404).json("Cart not found");
    }
  } catch (err) {
    logger.error(`Error retrieving cart for user ${req.params.id}: ${err.message}`);
    res.status(500).json(err);
  }
});

//GET ALL
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const carts = await Cart.find();
    logger.info(`All carts retrieved`);
    res.status(200).json(carts);
  } catch (err) {
    logger.error(`Error retrieving all carts: ${err.message}`);
    res.status(500).json(err);
  }
});

module.exports = router;
