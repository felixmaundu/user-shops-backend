const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require("multer");
const profileController = require('./src/controllers/profileController');
const connectRoutes = require('./src/routes/connectRoutes');
const authRoutes = require('./src/routes/authRoutes');
const postRoutes = require('./src/routes/postRoutes');
const profileRoutes = require('./src/routes/profileRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas connection
mongoose.connect(
  '',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
  }
)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Connection to MongoDB Atlas failed:', error);
  });

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Apply multer middleware for profile picture upload
// Use the profile routes with a base URL, e.g., '/profile'
app.use('/profile', profileRoutes);
// Apply multer middleware for profile picture upload
// app.put("/profile", upload.single("profilePic"), profileController.updateProfile);

// Register the connects routes
app.use('/connects', connectRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
const HOST = '192.168.131.143';//'192.168.2.103',//- Jem connection//'192.168.131.143'; // Replace with your desired IP address
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
