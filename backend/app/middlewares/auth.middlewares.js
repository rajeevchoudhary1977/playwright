import jwt from 'jsonwebtoken';
import { ENGAGEMENT_CONFIG, JWT_KEY } from '../configs/config.js';

export const verifyToken = (req, res, next) => {
  const token = req.body.token || req.headers['x-access-token'];
  const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];

  if (!token && !refreshToken) {
    return res.json({ isSuccess: false, msg: 'A token is required for authentication' });
  }

  try {
    const decoded = jwt.verify(token, JWT_KEY);
    req.user = decoded;

    if (req.body.validation) {
      return res.json({
        isSuccess: true,
        token,
        refreshToken,
        email: req.user.email,
        name: req.user.name,
        isAdmin: req.user.isAdmin,
        config: ENGAGEMENT_CONFIG,
      });
    } else {
      return next();
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const ipAddress = req.ip || req.connection.remoteAddress;

      jwt.verify(refreshToken, JWT_KEY + ipAddress, (err, decoded) => {
        if (err) {
          return res.json({ isSuccess: false, msg: 'Invalid token' });
          // return res.redirect('/user/login');
        }

        req.user = decoded;

        const newAccessToken = jwt.sign(
          {
            userId: decoded.userId,
            email: decoded.email,
            isAdmin: decoded.isAdmin,
            name: decoded.name,
          },
          JWT_KEY,
          {
            expiresIn: "8h",
          },
        );

        res.setHeader('x-access-token', newAccessToken);
        req.headers['x-access-token'] = newAccessToken;

        if (req.body.validation) {
          return res.json({
            isSuccess: true,
            token: newAccessToken,
            refreshToken,
            email: req.user.email,
            name: req.user.name,
            isAdmin: req.user.isAdmin,
            config: ENGAGEMENT_CONFIG,
          });
        } else {
          return next();
        }
      });
    } else {
      return res.json({ isSuccess: false, msg: 'Invalid token' });
      // return res.redirect('/user/login');
    }
  }
};

export const isAdmin = (req, res, next) => {
  const token = req.body.token || req.headers['x-access-token'];

  if (!token) {
    return res.json({ isSuccess: false, msg: 'A token is required for authentication' });
  }

  try {
    const decoded = jwt.verify(token, JWT_KEY);
    req.user = decoded;
    if (decoded.isAdmin) return next();
    else {
      return res.json({ isSuccess: false, msg: 'Only Admin can perform this action.' });
    }
  } catch (error) {
    return res.json({ isSuccess: false, msg: 'Invalid token!!!\nPlease logout and re-login' });
  }
};
