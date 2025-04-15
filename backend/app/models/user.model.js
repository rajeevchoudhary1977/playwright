import crypto from 'crypto';
import mongoose from 'mongoose';

const User = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    hash: {
      type: String,
      required: true,
    },
    token: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    salt: String,
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // role: {
    //   type: String,
    //   enum: ['USER', 'DEVELOPER', 'TESTER', 'MANAGER', 'ADMIN'],
    //   default: 'USER',
    // },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifyToken: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

User.methods.setPassword = function (password) {
  // Creating a unique salt for a particular user
  this.salt = crypto.randomBytes(16).toString('hex');

  // Hashing user's salt and password with 1000 iterations, 64 length and sha512 digest
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`);
};

User.methods.validPassword = function (password) {
  let hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`);
  return this.hash === hash;
};

export default mongoose.model('User', User);
