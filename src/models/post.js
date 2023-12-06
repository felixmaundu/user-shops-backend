const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category model
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory', // Reference to the Subcategory model
  },
  images: [String], // Use an array to store multiple image URLs
  title: String,
  content: String,
  quantity: Number,
  description: String,
  type: String,
  price: Number,
  brand: String,
  condition: String,
  color: String,
  connectivity: String,
  connectivityInterface: String,
  formFactor: String,
  resistance: String,
  model: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  customFields: {
    type: Map,
    of: String,
  },
  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      text: String,
    },
  ],
  likes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
  bookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bookmark',
    },
  ],
  reports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
    },
  ],
});

module.exports = mongoose.model('Post', postSchema);
