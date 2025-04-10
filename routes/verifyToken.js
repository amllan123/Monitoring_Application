const jwt = require("jsonwebtoken");
const logger = require('../logger'); // Adjust the path according to your directory structure

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) {
        logger.error(`Token verification failed for token: ${token} - ${err.message}`);
        return res.status(403).json("Token is not valid!");
      }
      req.user = user;
      logger.info(`Token verified for user: ${user.id}`);
      next();
    });
  } else {
    logger.error('Authentication attempt without token');
    return res.status(401).json("You are not authenticated!");
  }
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      logger.info(`User ${req.user.id} authorized for resource ${req.params.id}`);
      next();
    } else {
      logger.warn(`User ${req.user.id} not authorized for resource ${req.params.id}`);
      res.status(403).json("You are not allowed to do that!");
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      logger.info(`Admin privileges confirmed for user: ${req.user.id}`);
      next();
    } else {
      logger.warn(`User ${req.user.id} attempted admin action without privileges`);
      res.status(403).json("You are not an admin. You are not allowed to do that!");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
