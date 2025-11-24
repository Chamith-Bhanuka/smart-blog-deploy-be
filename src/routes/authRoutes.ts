import { Router } from 'express';
import {
  getMe,
  login,
  refreshToken,
  register,
  registerAdmin,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { Role } from '../model/user.model';

const router = Router();

router.post('/register', register);

router.post('/login', login);

// Protected
router.get('/me', authenticate, getMe);

// Protected + Roll based access
router.post(
  '/admin/register',
  authenticate,
  authorizeRoles(Role.Admin),
  registerAdmin
);

router.post('/refresh', refreshToken);

export default router;
