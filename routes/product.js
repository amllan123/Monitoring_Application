const router = require('express').Router();
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const Product = require("../models/Product");
const logger = require('../logger');  // Import the logger

// Create product
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newProduct = new Product({
    title: req.body.title,
    desc: req.body.desc,
    img: req.body.img,
    categories: req.body.categories,
    price: req.body.price,
    color: req.body.color,
    size: req.body.size
  });

  try {
    const savedProduct = await newProduct.save();
    logger.info(`Product created with ID ${savedProduct._id}`);
    res.status(201).json(savedProduct);
  } catch (error) {
    logger.error(`Error creating product: ${error.message}`);
    res.status(500).json(error);
  }
});

// Update product
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
      $set: req.body
    }, { new: true });

    logger.info(`Product with ID ${req.params.id} updated`);
    res.status(200).json(updatedProduct);
  } catch (error) {
    logger.error(`Error updating product with ID ${req.params.id}: ${error.message}`);
    res.status(500).json(error);
  }
});

// Delete product
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    logger.info(`Product with ID ${req.params.id} deleted`);
    res.status(201).json("Product deleted");
  } catch (error) {
    logger.error(`Error deleting product with ID ${req.params.id}: ${error.message}`);
    res.status(500).json(error);
  }
});

// Get product
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    logger.info(`Product with ID ${req.params.id} retrieved`);
    res.status(200).json(product);
  } catch (error) {
    logger.error(`Error retrieving product with ID ${req.params.id}: ${error.message}`);
    res.status(500).json(error);
  }
});

// Get product by category or latest
router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;

  try {
    let products;
    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
      logger.info(`Latest product retrieved`);
    } else if (qCategory) {
      products = await Product.find({
        categories: {
          $in: [qCategory]
        }
      });
      logger.info(`Products retrieved for category ${qCategory}`);
    } else {
      products = await Product.find();
      logger.info(`All products retrieved`);
    }
    res.status(200).json(products);
  } catch (error) {
    logger.error(`Error retrieving products: ${error.message}`);
    res.status(500).json(error);
  }
});

module.exports = router;
