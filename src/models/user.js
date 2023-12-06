const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  country: String,
  password: String,
  profilePic: String, // URL to the profile picture
  bio: String, // User's bio
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // References to user's posts
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bookmark' }], // References to user's bookmarks

  // Additional Business Fields
  firstName: String,
  lastName: String,
  phoneNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  
  // New Fields
  ratings: Boolean, // Whether the user has ratings
  verified: Boolean, // Whether the user is verified
  brand: Boolean, // Whether the user represents a brand or organization

  // New Field for Connections (Followers)
  // connects: Number, // Number of user connections or followers
  connects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // New Fields
  googleMapUrl: String, // Google Maps URL
  businessWebsite: String, // Business Website URL
  socialMedia: {
    instagram: String,
    twitter: String,
    whatsapp: String,
    linkedin: String,
    facebook: String,
    telegram: String,
    threads: String,
    truthSocial: String,
  },
  
  // Add any other fields you need for your application
});

// Set "toJSON" transformation to exclude sensitive data
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // Exclude sensitive data like password
    delete returnedObject.password;
  },
});

module.exports = mongoose.model('User', userSchema);
