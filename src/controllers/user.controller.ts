import { Status, User } from '../model/user.model';
import { Request, Response } from 'express';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const approveAuthor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.approved = Status.APPROVED;
    await user.save();

    const { password, ...clean } = user.toObject();
    res
      .status(200)
      .json({ message: 'User approved successfully', user: clean });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
