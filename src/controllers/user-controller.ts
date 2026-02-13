import userService from '@/service/user-service';
import { validationResult } from 'express-validator';
import ApiError from '@/exceptions/api-error';
import { MONTH } from '@/utils/constants';
import { Request, Response, NextFunction } from 'express';

class UserController {
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Error validation', errors.array()));
      }
      const { email, password } = req.body as { email: string; password: string };
      const userData = await userService.registration(email, password);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: MONTH,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return res.json(userData);
    } catch (error) {
      next(error as any);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const userData = await userService.login(email, password);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: MONTH,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return res.json(userData);
    } catch (error) {
      next(error as any);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken as string);
      res.clearCookie('refreshToken');
      return res.json(token);

    } catch (error) {
      next(error as any);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.refresh(refreshToken as string);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: MONTH,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      return res.json(userData);
    } catch (e) {
      next(e as any);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (error) {
      next(error as any);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const activationLink = req.params.link as string;
      await userService.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL as string);
    } catch (error) {
      next(error as any);

    }
  }
}

export default new UserController();
