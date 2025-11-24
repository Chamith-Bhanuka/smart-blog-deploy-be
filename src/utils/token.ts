import dotenv from 'dotenv';
import { IUser } from '../model/user.model';
import jwt from 'jsonwebtoken';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

// Generate Access Token
export const signAccessToken = (user: IUser): string => {
  return jwt.sign(
    {
      sub: user.id.toString(),
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '30m' }
  );
};

// Generate Refresh Token
export const signRefreshToken = (user: IUser) => {
  return jwt.sign(
    {
      sub: user.id.toString(),
      role: user.role,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};
