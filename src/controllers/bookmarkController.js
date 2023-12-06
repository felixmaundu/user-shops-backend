// const Bookmark = require('../models/bookmark');
// const Post = require('../models/post');

// // Bookmark a post
// exports.bookmarkPost = async (req, res) => {
//   const { postId } = req.params;
//   const userId = req.userData.userId;

//   try {
//     const post = await Post.findById(postId);

//     if (!post) {
//       return res.status(404).json({ message: 'Post not found' });
//     }

//     const existingBookmark = await Bookmark.findOne({ user: userId, post: postId });

//     if (existingBookmark) {
//       return res.status(400).json({ message: 'Post is already bookmarked' });
//     }

//     const bookmark = new Bookmark({ user: userId, post: postId });
//     await bookmark.save();

//     res.status(200).json({ message: 'Post bookmarked successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to bookmark the post' });
//   }
// };

// // Remove a bookmark
// exports.removeBookmark = async (req, res) => {
//   const { postId } = req.params;
//   const userId = req.userData.userId;

//   try {
//     const bookmark = await Bookmark.findOneAndDelete({ user: userId, post: postId });

//     if (!bookmark) {
//       return res.status(404).json({ message: 'Bookmark not found' });
//     }

//     res.status(200).json({ message: 'Bookmark removed successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to remove the bookmark' });
//   }
// };
