import crypto from 'crypto';

import User from '../models/user.model.js';
import { DOMAIN, ENVIRONMENT } from '../configs/config.js';
import { html } from '../utils/email-content.js';
import { sendEmail } from '../utils/sendgrid.js';

export const createUser = async (userBody) => {
  const userEmail = await User.findOne({ email: userBody.email });
  if (userEmail) {
    if (!userEmail.isEmailVerified) {
      return {
        isSuccess: false,
        code: '1',
        msg: 'User already exists. Please check your inbox to verify!!',
      };
    }
    return { isSuccess: false, code: '2', msg: 'User already exists. Please login!!' };
  } else {
    let responseMessage;
    // Creating a unique salt for a particular user
    const salt = crypto.randomBytes(16).toString('hex');

    // Hashing user's salt and password with 1000 iterations, 64 length and sha512 digest
    const hash = crypto.pbkdf2Sync(userBody.email, salt, 1000, 64, `sha512`).toString(`hex`);

    const user = new User();
    user.name = userBody.name;
    user.email = userBody.email;
    user.setPassword(userBody.password);
    user.emailVerifyToken = hash;
    
    if (ENVIRONMENT !== 'PROD') {
      user.isEmailVerified = true;
      responseMessage = 'User created successfully.\nPlease try to Login.';
    }
    await user.save();
    if (ENVIRONMENT === 'PROD') {
      const email = {
        to: userBody.email,
        from: {
          name: 'Web Test Studio Service',
          email: 'noreply.web.test.studio@indegene.com',
        },
        subject: 'Web Test Studio: Email Verification Request for Signup Confirmation',
        html: html(`${DOMAIN}/user/auth/${hash}`),
      };

      await sendEmail(email);
      responseMessage =
        'User created successfully.\nPlease check your inbox to verify the email!!.';
    }

    return {
      isSuccess: true,
      code: '0',
      msg: responseMessage,
    };
  }
};

export const userDetails = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

export const emailValidateService = async (emailVerifyToken) => {
  const user = await User.findOne({ emailVerifyToken });

  if (user) {
    user.isEmailVerified = true;
    user.emailVerifyToken = null;
    await user.save();
    return {
      isSuccess: true,
      msg: 'Email is verified. Please login!!',
    };
  } else {
    return {
      isSuccess: false,
      msg: 'Invalid verification link!!',
    };
  }
};

export const userList = async (userId) => {
  return await User.find({
    _id: { $not: { $eq: userId }}
  })
    .select({ _id: true, name: true, email: true, isAdmin: true })
    .sort('name')
    .exec();
};

export const isEmailPresent = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { isSuccess: false, message: 'User does not exist. Please register to create account.' };
  } else {
    return { isSuccess: true, message: 'User exists.' };
  }
};

export const resetPasswordService = async ({ email, newPassword }) => {
  const user = await User.findOne({ email });
  if (user) {
    user.setPassword(newPassword);
    try {
      await user.save();
      return { isSuccess: true, message: 'Password successfully changed' };
    } catch (err) {
      return {
        isSuccess: false,
        message: 'Password Update unsuccessful. Please try again later',
      };
    }
  } else
    return {
      isSuccess: false,
      message: 'User does not exist. Please register to create account.',
    };
};