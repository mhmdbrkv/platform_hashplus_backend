import Subscription from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";

export const checkSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      isActive: true,
      type: "general",
    });

    if (!subscription) {
      req.user.isSubscribed = false;
      req.user.subscriptionEndDate = null;
      req.user.subscriptionStartDate = null;
      await req.user.save();
      return next(new ApiError("No subscription found", 404));
    }

    if (subscription.subscriptionDetails.subscriptionEndDate < new Date()) {
      await Subscription.findByIdAndUpdate(subscription._id, {
        $set: {
          isActive: false,
        },
      });

      req.user.isSubscribed = false;
      req.user.subscriptionEndDate = null;
      req.user.subscriptionStartDate = null;
      await req.user.save();

      return next(new ApiError("Subscription has expired", 403));
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const checkBootCampSubscription = async (req, res, next) => {
  try {
    const bootcamp = req.params.contentId;

    // isActive: true already filters out inactive subscriptions
    // Bootcamp subscriptions are one-time purchases with no expiry date
    const subscription = await Subscription.findOne({
      user: req.user._id,
      isActive: true,
      type: "bootcamp",
      bootcamp,
    }).lean();

    if (!subscription) {
      return next(new ApiError("No active bootcamp subscription found", 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};
