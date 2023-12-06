const jwt = require('jsonwebtoken');

// Flag to indicate if the user is logged in
let userLoggedIn = true;//false - always rem 

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication failed: Invalid token format' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, 'secretKey');

    if (!decodedToken.userId || !userLoggedIn) {
      return res.status(401).json({ message: 'Authentication failed: Invalid user or user is logged out' });
    }

    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed at auth middleware' });
  }
};
