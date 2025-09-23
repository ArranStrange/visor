const { getAuth } = require('../config/firebase');
const User = require('../models/User');

const firebaseAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    // Get user from our database using Firebase UID
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      // If user doesn't exist in our database, create them
      const newUser = new User({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        username: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        emailVerified: decodedToken.email_verified || false,
        avatar: decodedToken.picture || undefined,
      });
      
      await newUser.save();
      req.user = {
        ...newUser.toObject(),
        id: newUser._id,
      };
    } else {
      // Update user data from Firebase token
      user.email = decodedToken.email;
      user.emailVerified = decodedToken.email_verified || false;
      if (decodedToken.picture) {
        user.avatar = decodedToken.picture;
      }
      if (decodedToken.name) {
        user.username = decodedToken.name;
      }
      
      await user.save();
      req.user = {
        ...user.toObject(),
        id: user._id,
      };
    }
  } catch (err) {
    console.error('Firebase authentication error:', err.message);
    req.user = null;
  }

  next();
};

module.exports = firebaseAuthMiddleware;
