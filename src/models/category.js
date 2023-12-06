// category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: String,
  subcategories: [{
    name: String,
  }],
});

module.exports = mongoose.model('Category', categorySchema);
