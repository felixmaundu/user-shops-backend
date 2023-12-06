//   accessKeyId: 'AKIAZZ6E7UH4SIUG3VVZ',
//   secretAccessKey: 'xu4pmKpmh7gIresirgOHrirX8WHQhhsSGiPdcIdm',
//   region: 'us-east-2', // Set your desired region


const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
// const { Readable,stream } = require('stream');
const stream = require('stream'); // Import the 'stream' module
const Readable = stream.Readable; // Get the Readable class from the 'stream' module



const multer = require('multer');
const multerS3 = require('multer-s3');
const mime = require('mime');
const uuid = require('uuid');
const Post = require('../../src/models/post');
const Category = require('../../src/models/category'); // Import the Category model
const Subcategory = require('../../src/models/subcategory'); // Import the Subcategory model




// Delete a post by ID
exports.deletePost = async (req, res) => {
  const postId = req.params.postId;

  try {
    // Fetch the post document to get the list of image keys
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Delete the images associated with the post from S3
    if (post.images && post.images.length > 0) {
      const s3Client = new S3Client({
        region: 'us-east-2', // Set your desired region
        credentials: {
          accessKeyId: 'AKIAZZ6E7UH4SIUG3VVZ',
          secretAccessKey: 'xu4pmKpmh7gIresirgOHrirX8WHQhhsSGiPdcIdm',
        },
        apiVersion: '2006-03-01',
      });

      const deleteImagePromises = post.images.map(async (imageKey) => {
        const params = {
          Bucket: 's3-bucket-trial1',
          Key: imageKey,
        };

        try {
          await s3Client.send(new DeleteObjectCommand(params));
        } catch (error) {
          console.error('Error deleting image from S3:', error);
        }
      });

      await Promise.all(deleteImagePromises);
    }

    // Delete the post document by its ID
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: 'Post and associated images deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Failed to delete the post' });
  }
};


// Create an S3 client
const s3Client = new S3Client({
  region: 'us-east-2', // Set your desired region
  credentials: {
    accessKeyId: 'AKIAZZ6E7UH4SIUG3VVZ',
    secretAccessKey: 'xu4pmKpmh7gIresirgOHrirX8WHQhhsSGiPdcIdm',
  },
  apiVersion: '2006-03-01',
});
const fileFilter = (req, file, cb) => {
  if (
    (mime.getType(file.originalname).startsWith('image/') ||
      mime.getType(file.originalname).startsWith('video/'))
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type or size'));
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: 's3-bucket-trial1',
    acl: 'public-read',
    key: async function (req, file, cb) {
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFilename = `${uuid.v4()}.${fileExtension}`;
      const folderName = 'userPosts'; // Change to your desired folder name

      try {
        const buffer = await streamToBuffer(file.stream); // Convert stream to buffer

        const params = {
          Bucket: 's3-bucket-trial1',
          Key: `${folderName}/${uniqueFilename}`,
          Body: buffer, // Use the buffer as the Body
          ContentType: file.mimetype,
          ACL: 'public-read', // Set ACL to 'public-read'
        };

        // Upload the file to S3
        await s3Client.send(new PutObjectCommand(params));


        cb(null, `${folderName}/${uniqueFilename}`);
      } catch (error) {
        cb(error);
      }
    },
  }),
  limits: {
    files: 16, // Maximum number of files (images or videos)
  },
  fileFilter: fileFilter,
});
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const buf = [];

    stream.on('data', (chunk) => buf.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(buf)));
    stream.on('error', (err) => reject(err));
  });
}

// Create a new post with image or video upload
exports.createPost = [
  upload.array('media', 16),
  async (req, res) => {
    try {
      const { title,
        category,
        subcategory,
        description,
        type,
        price,
        brand,
        condition,
        color,
        connectivity
      } = req.body;
      const userId = req.userData.userId;

      // Check if req.files contains the uploaded files (images or videos)
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      // Process req.files to get the S3 object keys for the uploaded media
      const mediaKeys = req.files.map((file) => file.key);

      // Find or create the Category document based on the provided name
      const categoryDocument = await Category.findOneAndUpdate(
        { name: category },
        { name: category },
        { upsert: true, new: true }
      );

      // Find or create the Subcategory document based on the provided name
      const subcategoryDocument = await Subcategory.findOneAndUpdate(
        { name: subcategory, parentCategory: categoryDocument._id },
        { name: subcategory, parentCategory: categoryDocument._id },
        { upsert: true, new: true }
      );

      const newPost = new Post({
        userId,
        category: categoryDocument._id, // Use the ObjectId reference
        subcategory: subcategoryDocument._id, // Use the ObjectId reference
        images: mediaKeys,
        title,
        description,
        type,
        price,
        brand,
        condition,
        color,
        connectivity
      });
      await newPost.save();

      res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: 'Failed to create a post' });
    }
  },
];
// Create a new freelance post with image or video upload
exports.createFreelancePost = [
  upload.array('media', 16),
  async (req, res) => {
    try {
      const { title, category, subcategory, description } = req.body;
      const userId = req.userData.userId;

      // Check if req.files contains the uploaded files (images or videos)
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      // Process req.files to get the S3 object keys for the uploaded media
      const mediaKeys = req.files.map((file) => file.key);

      // Find or create the Category document based on the provided name
      const categoryDocument = await Category.findOneAndUpdate(
        { name: category },
        { name: category },
        { upsert: true, new: true }
      );

      // Find or create the Subcategory document based on the provided name
      const subcategoryDocument = await Subcategory.findOneAndUpdate(
        { name: subcategory, parentCategory: categoryDocument._id },
        { name: subcategory, parentCategory: categoryDocument._id },
        { upsert: true, new: true }
      );

      const newPost = new Post({
        userId,
        category: categoryDocument._id, // Use the ObjectId reference
        subcategory: subcategoryDocument._id, // Use the ObjectId reference
        images: mediaKeys,
        title,
        description
      });
      await newPost.save();

      res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: 'Failed to create a post' });
    }
  },
];
// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// Get a specific post by ID
exports.getPostById = async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch the post' });
  }
};

// Update a post by ID
exports.updatePost = async (req, res) => {
  const postId = req.params.postId;
  const { category, subcategory, image, title } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.category = category;
    post.subcategory = subcategory;
    post.image = image;
    post.title = title;

    await post.save();

    res.status(200).json({ message: 'Post updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update the post' });
  }
};


// Get posts by category
exports.getPostsByCategory = async (req, res) => {
  try {
    const categoryName = req.params.categoryName;

    const posts = await Post.find({ category: categoryName });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts by category' });
  }
};
// Get a single post by ID
exports.getPostById = async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch the post by ID' });
  }
};
// Add a comment to a post
exports.addComment = async (req, res) => {
  const postId = req.params.postId;
  const { text } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = { userId: req.userData.userId, text };

    post.comments.push(comment);
    await post.save();

    res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add a comment' });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.userData.userId;

    // Check if the user has already liked the post
    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: 'You have already liked this post' });
    }

    post.likes.push(userId);
    await post.save();

    res.status(200).json({ message: 'Post liked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to like the post' });
  }
};


// ...

// Report a post
exports.reportPost = async (req, res) => {
  const { postId } = req.params;
  const { reason } = req.body;
  const userId = req.userData.userId;

  try {
    // Check if the post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has already reported this post
    const existingReport = await Report.findOne({ userId, postId });

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }

    // Create a new report record
    const report = new Report({ userId, postId, reason });
    await report.save();

    res.status(200).json({ message: 'Post reported successfully' });
  } catch (error) {
    console.error('Error reporting post:', error);
    res.status(500).json({ message: 'Failed to report the post' });
  }
};

// Bookmark a post
exports.bookmarkPost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.userData.userId;

  try {
    // Check if the post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has already bookmarked the post
    const existingBookmark = await Bookmark.findOne({ user: userId, post: postId });

    if (existingBookmark) {
      return res.status(400).json({ message: 'Post is already bookmarked' });
    }

    // Create a bookmark record
    const bookmark = new Bookmark({ user: userId, post: postId });
    await bookmark.save();

    res.status(200).json({ message: 'Post bookmarked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to bookmark the post' });
  }
};
// postController.js

// ...

// Bookmark a post
exports.bookmarkPost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.userData.userId;

  try {
    // Check if the post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has already bookmarked the post
    if (post.bookmarks.includes(userId)) {
      return res.status(400).json({ message: 'You have already bookmarked this post' });
    }

    // Add the user's ID to the post's bookmarks array
    post.bookmarks.push(userId);
    await post.save();

    res.status(200).json({ message: 'Post bookmarked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to bookmark the post' });
  }
};
// postController.js

// ...

// Remove a bookmark from a post
exports.removeBookmark = async (req, res) => {
  const { postId } = req.params;
  const userId = req.userData.userId;

  try {
    // Check if the post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has bookmarked the post
    if (!post.bookmarks.includes(userId)) {
      return res.status(400).json({ message: 'You have not bookmarked this post' });
    }

    // Remove the user's ID from the post's bookmarks array
    post.bookmarks = post.bookmarks.filter((bookmarkUserId) => bookmarkUserId.toString() !== userId);
    await post.save();

    res.status(200).json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove the bookmark' });
  }
};
