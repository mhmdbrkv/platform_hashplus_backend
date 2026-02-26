import JWT from "jsonwebtoken";
import {
  JWT_ACCESS_SECRET_KEY,
  JWT_ACCESS_EXPIRE_TIME,
  JWT_REFRESH_SECRET_KEY,
  JWT_REFRESH_EXPIRE_TIME,
} from "../config/env.js";
import { ApiError } from "./apiError.js";

const generateAccessToken = (userId) => {
  try {
    const accessToken = JWT.sign({ userId }, JWT_ACCESS_SECRET_KEY, {
      expiresIn: JWT_ACCESS_EXPIRE_TIME,
    });

    return accessToken;
  } catch (err) {
    throw new ApiError(`Generate Access Token Error: ${err}`);
  }
};

const generateRefreshToken = (userId) => {
  try {
    const refreshToken = JWT.sign({ userId }, JWT_REFRESH_SECRET_KEY, {
      expiresIn: JWT_REFRESH_EXPIRE_TIME,
    });

    return refreshToken;
  } catch (err) {
    throw new ApiError(`Generate Refresh Token Error: ${err}`);
  }
};

const verifyToken = async (token, secretKey) => {
  try {
    const decoded = await JWT.verify(token, secretKey);
    return decoded;
  } catch (err) {
    throw new ApiError(`Verify Token Error: ${err}`);
  }
};

export { generateAccessToken, generateRefreshToken, verifyToken };
