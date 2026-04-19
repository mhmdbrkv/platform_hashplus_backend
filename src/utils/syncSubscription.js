import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";

/**
 * Single source of truth for activating a subscription on a user.
 */
export const activateGeneralSubscription = async (
  userId,
  { startDate, endDate },
) => {
  await User.findByIdAndUpdate(userId, {
    isSubscribed: true,
    subscriptionStartDate: startDate,
    subscriptionEndDate: endDate,
  });
};

/**
 * Deactivates a user's general subscription in both User and Subscription collections.
 * @param {string|ObjectId} userId
 * @param {string|ObjectId} [subscriptionId] — optional, deactivates all if omitted
 */
export const deactivateGeneralSubscription = async (
  userId,
  subscriptionId = null,
) => {
  const subFilter = subscriptionId
    ? { _id: subscriptionId }
    : { user: userId, type: "general", isActive: true };

  await Promise.all([
    Subscription.updateMany(subFilter, { $set: { isActive: false } }),
    User.findByIdAndUpdate(userId, {
      isSubscribed: false,
      subscriptionStartDate: null,
      subscriptionEndDate: null,
    }),
  ]);
};

/**
 * Activates a bootcamp subscription for a user.
 */
export const activateBootcampSubscription = async (userId, bootcampId) => {
  await User.findByIdAndUpdate(userId, {
    $addToSet: { bootcamps: bootcampId }, // addToSet prevents duplicates
  });
};

/**
 * Deactivates a bootcamp subscription for a user.
 */
export const deactivateBootcampSubscription = async (
  userId,
  bootcampId,
  subscriptionId,
) => {
  await Promise.all([
    Subscription.findByIdAndUpdate(subscriptionId, {
      $set: { isActive: false },
    }),
    User.findByIdAndUpdate(userId, {
      $pull: { bootcamps: bootcampId },
    }),
  ]);
};
