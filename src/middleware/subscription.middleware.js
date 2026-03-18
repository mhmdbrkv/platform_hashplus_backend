import { ApiError } from "../utils/apiError.js";
import Content from "../models/content.model.js";

export const checkSubscription = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(new ApiError("User not found", 404));
    }
    if (!user.isSubscribed) {
      return next(new ApiError("User is not subscribed", 403));
    }
    if (user.subscriptionDetails?.subscriptionEndDate < Date.now()) {
      user.isSubscribed = false;
      user.subscriptionDetails = undefined;
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
