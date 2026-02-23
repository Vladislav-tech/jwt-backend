import userModel from '@/models/user-model';
import bcrypt from 'bcrypt';
import mailService from '@/service/mail-service';
import tokenService from '@/service/token-service';
import UserDto from '@/dtos/user-dto';
import { v4 as uuidv4 } from 'uuid';
import ApiError from '@/exceptions/api-error';
import { DAY } from '@/utils/constants';

class UserService {
  async registration(email: string, password: string, name: string, registrationDate: string) {
    const candidate = await userModel.findOne({ email });

    if (candidate) {
      if (!candidate.isActivated && candidate.activationExpires < new Date()) {
        await userModel.deleteOne({ _id: candidate._id });
      } else {
        throw ApiError.BadRequest(`User with email ${email} already exists`);
      }
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const activationLink = uuidv4();
    const activationExpires = new Date(Date.now() + DAY);


    const user = await userModel.create({
      email,
      password: hashPassword,
      activationLink,
      activationExpires,
      name,
      registrationDate,
    });
    await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async activate(activationLink: string) {
    const user = await userModel.findOne({ activationLink });

    if (!user) {
      throw ApiError.BadRequest('Invalid activation link');
    }

    if (user.activationExpires < new Date()) {
      throw ApiError.BadRequest('Activation link has expired');
    }

    user.isActivated = true;
    user.activationLink = null as any;
    user.activationExpires = null as any;
    await user.save();
  }
  async login(email: string, password: string) {
    const user = await userModel.findOne({ email });

    if (!user) {
      throw ApiError.BadRequest('User not found');
    }

    if (!user.isActivated) {
      throw ApiError.BadRequest('Account not activated. Please check your email for the activation link.');
    }

    if (user.activationExpires && user.activationExpires < new Date()) {
      throw ApiError.BadRequest('Activation link has expired. Please request a new activation email.');
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      throw ApiError.BadRequest('Invalid password');
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    user.lastSignInDate = new Date();
    await user.save();

    return {
      ...tokens,
      user: userDto,
    };
  }

  async logout(refreshToken: string) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    const user = await userModel.findById((userData as any).id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async addFavorite(userId: string, ticker: string) {
    const normalizedTicker = ticker.toLowerCase();
    if (!normalizedTicker.endsWith('usdt') || !/^[a-z]+usdt$/.test(normalizedTicker)) {
      throw ApiError.BadRequest('Invalid ticker format. Must be like "btcusdt" (lowercase letters + usdt)');
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw ApiError.BadRequest('User not found');
    }

    if (!user.favorites.includes(normalizedTicker)) {
      user.favorites.push(normalizedTicker);
      await user.save();
    };

    return user.favorites;
  }

  async removeFavorite(userId: string, ticker: string) {
    const normalizedTicker = ticker.toLowerCase();

    const user = await userModel.findById(userId);
    if (!user) {
      throw ApiError.BadRequest('User not found');
    }

    user.favorites = user.favorites.filter((t: string) => t !== normalizedTicker);
    await user.save();

    return user.favorites;
  }

  async getFavorites(userId: string) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw ApiError.BadRequest('User not found');
    }
    return user.favorites;
  }

  async getUserInfo(userId: string) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw ApiError.BadRequest('User not found');
    }
    return {
      email: user.email,
      name: user.name,
      favorites: user.favorites.length,
      lastSignInDate: user.lastSignInDate,
      registrationDate: user.registrationDate,
    }
  }
}

export default new UserService();
