import jwt from 'jsonwebtoken';
import tokenModel from '@/models/token-model';

interface JwtPayload {
  id: string;
  email: string;
  isActivated: boolean;
  name: string;
}

class TokenService {
  generateTokens(payload: JwtPayload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '30d' });

    return {
      accessToken,
      refreshToken,
    };
  }

  async saveToken(userId: any, refreshToken: string) {
    const tokenData = await tokenModel.findOne({ user: userId });

    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    const token = await tokenModel.create({ user: userId, refreshToken });
    return token;
  }

  async removeToken(refreshToken: string) {
    const tokenData = await tokenModel.deleteOne({ refreshToken });
    return tokenData;
  }

  validateRefreshToken(token: string) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
      return userData;
    } catch (error) {
      return null;
    }
  }

  validateAccessToken(token: string) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string, { algorithms: ['HS256'] });
    } catch (error) {
      return null;
    }
  }

  async findToken(refreshToken: string) {
    const tokenData = await tokenModel.findOne({ refreshToken });
    return tokenData;
  }
}

export default new TokenService();
