const express = require('express');
const postController = require('../../src/controllers/postcontroller');
const authMiddleware = require('../../src/middlewares/authmiddleware');

const router = express.Router();

// Protect post routes with authentication middleware
router.use(authMiddleware);

// Create a new post
router.post('/', postController.createPost);

//creating a freelance post
router.post('/freelancepost', postController.createFreelancePost);

// Get all posts
router.get('/', postController.getAllPosts);

// Get a specific post by ID
router.get('/:postId', postController.getPostById);

// Update a post by ID
router.put('/:postId',postController.updatePost);

// Delete a post by ID
router.delete('/:postId', postController.deletePost);
// Get posts by category
router.get('/category/:categoryName',postController.getPostsByCategory);
// Get a single post by ID
router.get('/:postId', postController.getPostById);
// Add a comment to a post
router.post('/:postId/comments', postController.addComment);

// Like a post
router.post('/:postId/like',postController.likePost);

// Report a post
router.post('/:postId/report', postController.reportPost);
// Bookmark a post
router.post('/:postId/bookmark', postController.bookmarkPost);

// Remove a bookmark from a post
router.delete('/:postId/bookmark', postController.removeBookmark);

module.exports = router;
