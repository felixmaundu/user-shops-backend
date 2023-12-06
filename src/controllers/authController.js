const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  try {
    const { email, username, country, password } = req.body;

    if (!email || !username || !country || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, country, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Create a token with a 'logout' flag set to false
    // const token = jwt.sign({ userId: user.id, logout: false }, 'secretKey', { expiresIn: '15m' });
    const token = jwt.sign({ userId: user.id }, 'secretKey', { expiresIn: '365d' }); // Token expires after 1 year


    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Authentication failed at auth controller' });
  }
};

const invalidatedTokens = [];
exports.logout = (req, res) => {
  try {
    // Your logout logic here (e.g., clearing session, invalidating tokens, etc.)

    // Invalidate the token or session
    userLoggedIn = false;

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    // Handle errors, log them, or return an error response
    res.status(500).json({ message: 'Logout failed' });
  }
};
