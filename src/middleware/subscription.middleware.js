import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import { Content } from "../models/content.model.js";
import { ApiError } from "../utils/apiError.js";

export const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    if (!user.subscription) {
      return next(new ApiError("No subscription found", 404));
    }

    if (!user.subscription.isActive) {
      return next(new ApiError("Subscription is not active", 403));
    }

    if (
      new Date(user.subscription.subscriptionDetails.subscriptionEndDate) <
      new Date()
    ) {
      await Subscription.findByIdAndUpdate(user.subscription._id, {
        $set: {
          isActive: false,
        },
      });

      user.subscription = undefined;
      await user.save();
      return next(new ApiError("Subscription has expired", 403));
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const checkBootCampSubscription = async (req, res, next) => {
  try {
    const user = req.user;
    const bootCampId = req.params.bootCampId;

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    const bootCamp = await Content.findById(bootCampId);
    if (!bootCamp) {
      return next(new ApiError("Boot camp not found", 404));
    }

    if (!user.studentDetails.bootCamps.includes(bootCamp._id)) {
      return next(
        new ApiError("User is not subscribed to this boot camp", 403),
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
