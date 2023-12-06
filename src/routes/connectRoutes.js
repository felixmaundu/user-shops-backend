const express = require('express');
const router = express.Router();
const authMiddleware = require('./../middlewares/authmiddleware');
const connectController = require('../controllers/connectController');
const profileController = require('../controllers/profileController');


// Add middleware to protect these routes
router.use(authMiddleware);

// Connect with a user
// router.post('/connect/:userId', connectController.connectWithUser);
router.post('/connect/:userId', profileController.connectUser);

// Get connections for the currently logged-in user
router.get('/connections', authMiddleware, profileController.getOwnConnections);


// Get user's connections
// router.get('/connections', connectController.getUserConnections);
// Get connections for a specific user
router.get('/connections/:userId', authMiddleware, profileController.getUserConnections);

// Disconnect from a user (remove connection)
router.delete('/unconnect/:userId', authMiddleware, profileController.disconnectUser);


module.exports = router;
