import Subscription from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";

const subscribtionForGeneral = async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(new ApiError(error, 500));
  }
};

const subscribtionForBootcamp = async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(new ApiError(error, 500));
  }
};

export { subscribtionForGeneral, subscribtionForBootcamp };
