import { Router } from 'express';
import userController from '@/controllers/user-controller';
import { body } from 'express-validator';
import AuthMiddleware from '@/middlewares/auth-middleware';

const router = Router();

router.post(
  '/registration',
  body('email').isEmail(),
  body('password')
    .isLength({ min: 8, max: 64 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/)
    .withMessage('Password must contain at least one letter, one number, and one special character'),
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  userController.registration
);
router.post(
  '/login',
  body('email').isEmail(),
  body('password')
    .isLength({ min: 8, max: 64 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/)
    .withMessage('Password must contain at least one letter, one number, and one special character'),
  userController.login
);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);

router.post(
  '/favorites/add',
  AuthMiddleware,
  body('ticker').isString().trim().notEmpty(),
  userController.addFavorite
);

router.delete(
  '/favorites/remove',
  AuthMiddleware,
  body('ticker').isString().trim().notEmpty(),
  userController.removeFavorite
);

router.get('/me',
  AuthMiddleware,
  userController.getUserInfo
)

router.get('/favorites', AuthMiddleware, userController.getFavorites);

export default router;
