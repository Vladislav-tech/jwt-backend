import { Router } from 'express';
import userController from '@/controllers/user-controller';
import { body } from 'express-validator';
import AuthMiddleware from '@/middlewares/auth-middleware';

const router = Router();

router.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 4, max: 20 }),
  userController.registration
);
router.post(
  '/login',
  body('email').isEmail(),
  body('password').isLength({ min: 4, max: 20 }),
  userController.login
);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/users', AuthMiddleware, userController.getUsers);

export default router;
