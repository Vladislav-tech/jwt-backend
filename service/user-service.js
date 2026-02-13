import userModel from "../models/user-model.js";
import bcrypt from "bcrypt";
import mailService from "./mail-service.js";
import tokenService from "./token-service.js";
import UserDto from "../dtos/user-dto.js";
import { v4 as uuidv4 } from 'uuid';
import ApiError from "../exceptions/api-error.js";

class UserService {
    async registration(email, password) {
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
        const activationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        const user = await userModel.create({
            email,
            password: hashPassword,
            activationLink,
            activationExpires,
        });
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto,
        };
    }

    async activate(activationLink) {
        const user = await userModel.findOne({ activationLink });

        if (!user) {
            throw ApiError.BadRequest('Invalid activation link');
        }

        if (user.activationExpires < new Date()) {
            throw ApiError.BadRequest('Activation link has expired');
        }

        user.isActivated = true;
        user.activationLink = null;
        user.activationExpires = null;
        await user.save();
    }
    async login(email, password) {
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

        return {
            ...tokens,
            user: userDto,
        };
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }

        const user = await userModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto,
        };
    }

    async getAllUsers() {
        const users = await userModel.find();
        return users;
    }
}

export default new UserService();