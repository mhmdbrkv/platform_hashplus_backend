import Learning from "../models/learning.model.js";
import Review from "../models/review.model.js";
import FinalProjectAnswer from "../models/finalProjectAnswer.model.js";
import { UserAnswersModel } from "../models/userAnswers.model.js";
import Subscription from "../models/subscription.model.js";
import { Content } from "../models/content.model.js";

/**
 * Deletes all records referencing a content document.
 * Call inside a transaction or after the content delete succeeds.
 */
export const cascadeDeleteContent = async (contentId) => {
  await Promise.all([
    Learning.deleteMany({ content: contentId }),
    Review.deleteMany({ content: contentId }),
    FinalProjectAnswer.deleteMany({ content: contentId }),
    UserAnswersModel.deleteMany({ content: contentId }),
  ]);
};

export const cascadeDeleteUser = async (userId) => {
  await Promise.all([
    Learning.deleteMany({ user: userId }),
    Review.deleteMany({ user: userId }),
    Subscription.deleteMany({ user: userId }),
    FinalProjectAnswer.deleteMany({ user: userId }),
    UserAnswersModel.deleteMany({ user: userId }),
    Content.deleteMany({ instructor: userId }),
  ]);
};
