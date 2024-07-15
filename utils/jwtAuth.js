import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const authUser = async (res, userId, email, device) => {
  if (device === 'web') {
    try {
      const payload = {
        userId,
        email,
      };

      const payload2 = {
        userId,
        uniqueId: uuidv4(),
      };

      const token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15days',
      });

      const frontendToken = await jwt.sign(payload2, process.env.JWT_SECRET, {
        expiresIn: '15days',
      });

      res.cookie('access_token', token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 15,
      });

      return frontendToken;
    } catch (error) {
      console.log(error);
    }
  } else if (device === 'mobile') {
    try {
      const payload = {
        userId,
        email,
      };

      const token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15days',
      });

      res.cookie('access_token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 15,
        httpOnly: true,
        sameSite: 'strict',
      });

      return token;
    } catch (error) {
      console.log(error);
    }
  }
};

export { authUser };
