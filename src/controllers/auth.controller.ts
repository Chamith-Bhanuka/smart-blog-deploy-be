import { Request, Response } from 'express';
import { IUser, Role, Status } from '../model/user.model';
import bcrypt from 'bcryptjs';
import { User } from '../model/user.model';
import { signAccessToken, signRefreshToken } from '../utils/token';
import { AuthRequest } from '../middleware/auth.middleware';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export const register = async (req: Request, res: Response) => {
  //res.status(201).json({ message: 'User registered successfully..!' });

  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (role === Role.Admin) {
      return res
        .status(400)
        .json({ message: 'Invalid role: ADMIN registration is not allowed' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const approvalStatus =
      role === Role.Author ? Status.PENDING : Status.APPROVED;

    const newUser = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      role: role,
      approved: approvalStatus,
    });

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return res.status(201).json({
      message: 'User registered successfully.!',
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Registration error', error);

    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists.!' });
    }

    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  //res.status(201).json({ message: 'User login successfully..!' });
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({ message: 'Invalid Credentials.' });
    }

    const valid = await bcrypt.compare(password, existingUser.password);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid Credentials.' });
    }

    // Generate Token
    const accessToken = signAccessToken(existingUser);

    // Refresh Token
    const refreshToken = signRefreshToken(existingUser);

    // Save Refresh Token as HTTP-only Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'User login successfully.!',
      data: existingUser.email,
      roles: existingUser.role,
      accessToken: accessToken,
    });
  } catch (error: any) {
    console.error('Login error', error);

    if (error.code === 11000) {
      return res.status(401).json({ message: 'Invalid Credentials.' });
    }

    return res.status(500).json({ message: error.message });
  }
};

// /api/v1/auth/me
export const getMe = async (req: AuthRequest, res: Response) => {
  // const roles = req.user.roles
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = req.user.sub;
  const user =
    ((await User.findById(userId).select('-password')) as IUser) || null;

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  const { firstName, lastName, email, role, approved } = user;

  res.status(200).json({
    message: 'Ok',
    data: { firstName, lastName, email, role, approved },
  });
};

export const registerAdmin = async (req: Request, res: Response) => {
  //res.status(201).json({ message: 'User registered as admin successfully..!' });
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: [Role.Admin],
      approved: Status.APPROVED,
    });

    const { password: _, ...userWithoutPassword } = newAdmin.toObject();

    return res.status(201).json({
      message: 'User registered successfully.!',
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Admin registration error', error);
    return res.status(500).json({ message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: 'No refresh token found.!' });
  }

  try {
    const payload: any = jwt.verify(token, JWT_REFRESH_SECRET);

    const userId = payload.sub;

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(401).json({
        message: 'Invalid or expired refresh token.!',
        existingUser: existingUser,
      });
    }
    const newAccessToken = signAccessToken(existingUser);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res
      .status(403)
      .json({ message: 'Invalid or expired refresh token.!', error: err });
  }
};
