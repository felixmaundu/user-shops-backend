const express = require('express');
const router = express.Router();
const authMiddleware = require('./../middlewares/authmiddleware');
const profileController = require('../controllers/profileController');

// Secure the profile routes with authentication middleware
router.use(authMiddleware);

// View user's profile including posts
router.get('/', profileController.viewProfileWithPosts);

// Update user's profile picture
router.put('/profile', profileController.updateProfile);

// Route for rating a user
router.post('/users/:userId/rate', authMiddleware, profileController.rateUserProfile);

// Route for getting a user's ratings
router.get('/profiles/:userId/ratings', authMiddleware, profileController.getUserRatings);

// Get connections for a specific user
router.get('/connections/:userId', authMiddleware, profileController.getUserConnections);

// Disconnect from a user (remove connection)
router.delete('/unconnect/:userId', authMiddleware, profileController.disconnectUser);

module.exports = router;
