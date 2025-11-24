import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { Role } from '../model/user.model';
import { approveAuthor, getAllUsers } from '../controllers/user.controller';

const router = Router();

router.get('/', authenticate, authorizeRoles(Role.Admin), getAllUsers);
router.put(
  '/:id/approve',
  authenticate,
  authorizeRoles(Role.Admin),
  approveAuthor
);

export default router;
