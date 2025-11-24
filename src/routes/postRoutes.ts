import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { Role } from '../model/user.model';
import { upload } from '../middleware/upload.middleware';
import {
  createPost,
  getAllPosts,
  getMyPost,
  savePost,
} from '../controllers/post.controller';

import { generateContent } from '../controllers/ai.controller';

const router = Router();

router.post(
  '/create',
  authenticate,
  authorizeRoles(Role.Author),
  upload.single('image'),
  //createPost
  savePost
);

router.get('/', getAllPosts);

router.get('/me', authenticate, authorizeRoles(Role.Author), getMyPost);

router.post('ai/generate', generateContent);

export default router;
