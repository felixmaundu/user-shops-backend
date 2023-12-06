// subcategory.js
const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: String,
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category model
  },
});

module.exports = mongoose.model('Subcategory', subcategorySchema);