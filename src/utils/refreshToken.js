import { appRedis } from "../config/redis.app.js";

const storeRefreshToken = async (userId, refreshToken) => {
  try {
    await appRedis.set(
      `refresh_token:${userId}`,
      refreshToken,
      "EX",
      15 * 24 * 60 * 60, // 15 days
    );
  } catch (error) {
    console.error("Error storing refresh token", error);
  }
};

const getRefreshToken = async (userId) => {
  try {
    return await appRedis.get(`refresh_token:${userId}`);
  } catch (error) {
    console.error("Error getting refresh token", error);
  }
};

const removeRefreshToken = async (userId) => {
  try {
    await appRedis.del(`refresh_token:${userId}`);
  } catch (error) {
    console.error("Error removing refresh token", error);
  }
};

export { storeRefreshToken, getRefreshToken, removeRefreshToken };
