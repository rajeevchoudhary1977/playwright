import express from "express";

import { verifyToken } from '../middlewares/auth.middlewares.js';
import { asyncHandler } from "../middlewares/asyncHandler.middlewares.js";

import {
  getUserList,
  login,
  resetPassword,
  signup,
  validateEmail,
  verifyEmail
} from "../controllers/user.controller.js";

const userRoute = express.Router();

userRoute.post('/verify-token', verifyToken);

userRoute.get('/auth/:token', asyncHandler(validateEmail));

userRoute.post("/signup", asyncHandler(signup));

userRoute.get('/auth/:token', asyncHandler(validateEmail));

userRoute.post('/login', asyncHandler(login));

userRoute.get('/userlist', verifyToken, asyncHandler(getUserList));

userRoute.post('/verifyEmail', asyncHandler(verifyEmail));

userRoute.post('/reset-password', asyncHandler(resetPassword));

export default userRoute;