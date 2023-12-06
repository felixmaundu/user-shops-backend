// accessKeyId: 'AKIAZZ6E7UH4SIUG3VVZ',
// secretAccessKey: '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',
// const User = require('../models/user');
const { v4: uuidv4 } = require("uuid");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const multer = require("multer"); 
const User = require('../models/user');
const Post = require('../models/post');

// Create an S3 client
const s3Client = new S3Client({
  region: "us-east-2", // Set your desired region
  credentials: {
    accessKeyId: 'AKIAZZ6E7UH4SIUG3VVZ', // Replace with your AWS access key
    secretAccessKey: 'xu4pmKpmh7gIresirgOHrirX8WHQhhsSGiPdcIdm', // Replace with your AWS secret key
  },
});

// Configure multer-s3 storage
const s3Storage = multerS3({
  s3: s3Client,
  bucket: 's3-bucket-trial1', // Replace with your bucket name
  acl: "public-read",
  key: (req, file, cb) => {
    const fileExtension = file.originalname.split(".").pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const folderName = "profile-pics"; // Change to your desired folder name
    cb(null, `${folderName}/${uniqueFilename}`);
  },
});

// Create an instance of multer with S3 storage
const upload = multer({ storage: s3Storage });

// Update user's profile with profile picture
exports.updateProfile = upload.single("profilePic"), async (req, res) => {
  const userId = req.userData.userId;
  const {
    bio,
    ratings, // Add new fields here
    verified,
    brand,
    connects,
    googleMapUrl,
    businessWebsite,
    socialMedia: {
      ig,
      twitter,
      whatsapp,
      linkedin,
      facebook,
      telegram,
      threads,
      truthsocial,
    },
  } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if a new profile picture was uploaded
    if (req.file) {
      // Upload the image to S3 and get the URL
      const s3UploadResponse = await s3Client.send(new PutObjectCommand({
        Bucket: 's3-bucket-trial1', // Replace with your bucket name
        Key: req.file.key, // Key is provided by Multer-S3
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: 'public-read', // Make the image publicly accessible
      }));
      
      user.profilePic = s3UploadResponse.Location; // Use the URL provided by S3
    }

    // Update other fields
    user.bio = bio;
    user.ratings = ratings;
    user.verified = verified;
    user.brand = brand;
    user.connects = connects;
    user.googleMapUrl = googleMapUrl;
    user.businessWebsite = businessWebsite;
    user.socialMedia.ig = ig;
    user.socialMedia.twitter = twitter;
    user.socialMedia.whatsapp = whatsapp;
    user.socialMedia.linkedin = linkedin;
    user.socialMedia.facebook = facebook;
    user.socialMedia.telegram = telegram;
    user.socialMedia.threads = threads;
    user.socialMedia.truthsocial = truthsocial;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Failed to update user profile" });
  }
};




// Get ratings for a user's profile
exports.getUserRatings = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user whose ratings you want to retrieve
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user's ratings
    res.status(200).json({ ratings: user.rating });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user ratings' });
  }
};

// Rate a user's profile
exports.rateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { rating } = req.body;

  try {
    // Find the user whose profile is being rated
    const userToRate = await User.findById(userId);

    if (!userToRate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate the new rating (you can implement your own logic here)
    // For example, you might average the new rating with the existing rating.
    const newRating = (userToRate.rating + rating) / 2;

    // Update the user's rating
    userToRate.rating = newRating;

    // Save the updated user
    await userToRate.save();

    res.status(200).json({ message: 'User rated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to rate user' });
  }
};

// View user's profile including posts
exports.viewProfileWithPosts = async (req, res) => {
  const userId = req.userData.userId;

  try {
    // Fetch user profile information
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch user's posts using the user's ID
    const userPosts = await Post.find({ userId });

    // Combine user profile and posts
    const userProfileWithPosts = {
      user,
      posts: userPosts,
    };

    res.status(200).json(userProfileWithPosts);
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile with posts' });
  }
};

// View user's profile
exports.viewProfile = async (req, res) => {
  const userId = req.userData.userId;

  try {
    const user = await User.findById(userId).populate('posts');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};


// Connect to a user (one-way follow)
exports.connectUser = async (req, res) => {
  const userIdToConnect = req.params.userId;
  const userId = req.userData.userId;

  try {
    // Check if the user to connect to exists
    const userToConnect = await User.findById(userIdToConnect);

    if (!userToConnect) {
      return res.status(404).json({ message: 'User to connect to not found' });
    }

    // Check if the user is already connected to the userToConnect
    if (userToConnect.connects.includes(userId)) {
      return res.status(400).json({ message: 'You are already connected to this user' });
    }

    // Connect the user to userToConnect
    userToConnect.connects.push(userId);
    await userToConnect.save();

    res.status(200).json({ message: 'Connected successfully' });
  } catch (error) {
    console.error('Error connecting user:', error);
    res.status(500).json({ message: 'Failed to connect to the user' });
  }
};

// Get a user's connections
exports.getUserConnections = async (req, res) => {
  const userId = req.userData.userId;

  try {
    // Find the user's connections
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the user's connections (users they have connected to)
    const connections = await User.find({ _id: { $in: user.connects } });

    res.status(200).json(connections);
  } catch (error) {
    console.error('Error fetching user connections:', error);
    res.status(500).json({ message: 'Failed to fetch user connections' });
  }
};

// Disconnect from a user (remove connection)
exports.disconnectUser = async (req, res) => {
  const userIdToDisconnect = req.params.userId;
  const userId = req.userData.userId;

  try {
    // Check if the user to disconnect from exists
    const userToDisconnect = await User.findById(userIdToDisconnect);

    if (!userToDisconnect) {
      return res.status(404).json({ message: 'User to disconnect from not found' });
    }

    // Check if the user is connected to the userToDisconnect
    if (!userToDisconnect.connects.includes(userId)) {
      return res.status(400).json({ message: 'You are not connected to this user' });
    }

    // Disconnect the user from userToDisconnect
    userToDisconnect.connects = userToDisconnect.connects.filter((id) => id.toString() !== userId);
    await userToDisconnect.save();

    res.status(200).json({ message: 'Disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting user:', error);
    res.status(500).json({ message: 'Failed to disconnect from the user' });
  }
};

// Get connections for the currently logged-in user
exports.getOwnConnections = async (req, res) => {
  const userId = req.userData.userId;

  try {
    // Find the currently logged-in user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the user's connections
    const connections = await User.find({ _id: { $in: user.connects } });

    res.status(200).json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Failed to fetch connections' });
  }
};
