// const User = require('../models/user');

// // Connect with a user
// exports.connectWithUser = async (req, res) => {
//   // const userId = req.userData.userId;
//   const userId = req.userData.userId;
//   const { targetUserId } = req.params;

//   try {
//     const user = await User.findById(userId);
//     const targetUser = await User.findById(targetUserId);

//     if (!user || !targetUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Check if the user is already connected with the target user
//     if (!user.connects.includes(targetUserId)) {
//       user.connects.push(targetUserId);
//       await user.save();

//       res.status(200).json({ message: 'Connected with the user successfully' });
//     } else {
//       res.status(400).json({ message: 'You are already connected with this user' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to connect with the user' });
//   }
// }

// // Get user's connections
// exports.getUserConnections = async (req, res) => {
//   const userId = req.userData.userId;

//   try {
//     const user = await User.findById(userId).populate('connects', 'username');

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const connections = user.connects;

//     res.status(200).json({ connections });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to retrieve user connections' });
//   }
// }
