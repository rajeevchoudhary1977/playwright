import jwt from 'jsonwebtoken';

import { ENGAGEMENT_CONFIG, JWT_KEY } from '../configs/config.js';
import {
  createUser,
  emailValidateService,
  isEmailPresent,
  resetPasswordService,
  userDetails,
  userList
} from '../services/user.services.js';

export const signup = async (req, res) => {
  const response = await createUser(req.body);
  return res.json(response);
};

export const login = async (req, res) => {
  const userBody = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const user = await userDetails(userBody.email);
  if (user) {
    if (!user.isEmailVerified) {
      return res.json({
        isSuccess: false,
        msg: 'Please verify the email Address to login successfully.',
      });
    }
    if (user.validPassword(userBody.password)) {
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          engagement: user.engagement,
          isAdmin: user.isAdmin,
          name: user.name,
        },
        JWT_KEY,
        {
          expiresIn: "8h",
        },
      );
      const refreshToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          engagement: user.engagement,
          isAdmin: user.isAdmin,
          name: user.name,
        },
        JWT_KEY + ipAddress,
        {
          expiresIn: '30d',
        },
      );
      return res.json({
        isSuccess: true,
        token: token,
        refreshToken: refreshToken,
        email: user.email,
        engagement: user.engagement,
        name: user.name,
        isAdmin:user.isAdmin,
        config: ENGAGEMENT_CONFIG,
      });
    } else {
      return res.json({ isSuccess: false, msg: 'Invalid credential' });
    }
  } else {
    return res.json({
      isSuccess: false,
      msg: 'Invalid User / Credential',
    });
  }
};

export const validateEmail = async (req, res) => {
  const { token } = req.params;
  const response = await emailValidateService(token);
  return res.json(response);
};

export const getUserList = async (req, res) => {
  return res.json({ isSuccess: true, users: await userList(req.user.userId) });
};

export const verifyEmail = async (req, res) => {
  const response = await isEmailPresent(req.body.email);
  return res.json(response);
};

export const resetPassword = async (req, res) => {
  const response = await resetPasswordService(req.body);
  return res.json(response);
};