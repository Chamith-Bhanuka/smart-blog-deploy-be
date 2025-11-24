import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRoutes';
import dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import userRoutes from './routes/userRoutes';
import cookieParser from 'cookie-parser';
import path from 'path';
import postRoutes from './routes/postRoutes';
import aiRoutes from './routes/aiRoutes';

dotenv.config();
const SERVER_PORT = process.env.SERVER_PORT;
const MONGODB_URI = process.env.MONGO_URI as string;

const app = express();

app.use(express.json()); // Consider all data in a request as a json (Built-In middleware in express - Global)

// CORS
//app.use(cors());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://smart-blog-deploy-fe-ten.vercel.app"
    ],
    credentials: true,
  })
);


app.use((req, res, next) => {
  // res.send("Hello, this is global middleware!")
  next();
});

app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/post/ai', aiRoutes);

app.use('/', (req, res) => {
  res.send('Backend is running..!');
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

//🛜 Routers - Define end points
//↗️ Controller - Handle Request Response

//⬇️ Server Running
app.listen(SERVER_PORT, () => console.log('Server is running on port 5000'));
