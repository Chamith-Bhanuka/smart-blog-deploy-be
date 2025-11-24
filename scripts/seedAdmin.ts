import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User, Role, Status } from '../src/model/user.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const existing = await User.findOne({ email: 'adminone@example.com' });

    if (existing) {
      console.log('Admin already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash('1234', 10);

    await User.create({
      firstName: 'admin',
      lastName: 'one',
      email: 'adminone@example.com',
      password: hashedPassword,
      role: [Role.Admin],
      approved: Status.APPROVED,
    });

    console.log('✅ Admin seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
