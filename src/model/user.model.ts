import mongoose, { Schema } from 'mongoose';

export enum Role {
  Admin = 'ADMIN',
  Author = 'AUTHOR',
  User = 'USER',
}

export enum Status {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface IUser extends Document {
  id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role[];
  approved: Status;
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: [String],
    enum: Object.values(Role),
    default: [Role.User],
  },
  approved: {
    type: String,
    enum: Object.values(Status),
    default: Status.PENDING,
  },
});

export const User = mongoose.model('User', userSchema);
