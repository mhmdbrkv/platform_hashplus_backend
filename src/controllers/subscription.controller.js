import Subscription from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { sendEmail } from "../utils/sendEmail.js";
import { refundPayment } from "../utils/moyasarPayment.js";

export const cancelSubscription = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let refundMessage = "";

    const subscription = await Subscription.findOne({
      user: userId,
      type: "general",
      isActive: true,
      canceled: false,
    });

    if (!subscription) {
      return next(new ApiError("لا يوجد اشتراك نشط", 404));
    }

    const subscriptionStartDateStr =
      subscription.subscriptionDetails?.subscriptionStartDate;
    const paymentId = subscription.paymentDetails?.paymentId;

    if (subscriptionStartDateStr && paymentId) {
      const subscriptionStartDate = new Date(subscriptionStartDateStr);
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      if (subscriptionStartDate >= threeDaysAgo) {
        try {
          const refund = await refundPayment(paymentId);
          refundMessage = "سيتم استرداد المبلغ قريبا";
          console.log("Refund processed: ", refund.id || refund);
        } catch (refundError) {
          console.error(
            "Moyasar refund failed:",
            refundError?.response?.data || refundError.message,
          );
          refundMessage =
            "حدث خطأ في استرداد المبلغ لدى بوابة الدفع، يرجى التواصل مع الدعم.";
        }
      } else {
        refundMessage = "لا يمكن استرداد المبلغ لأنه بعد 3 أيام من الاشتراك";
      }
    } else {
      refundMessage = "لم يتم العثور على تفاصيل الدفع الخاصة بهذا الاشتراك.";
    }

    if (subscription.type === "general") {
      req.user.isSubscribed = false;
      req.user.subscriptionStartDate = null;
      req.user.subscriptionEndDate = null;
      await req.user.save();
    } else if (subscription.type === "bootcamp") {
      req.user.bootcamps = req.user.bootcamps.filter(
        (bootcamp) => bootcamp.toString() !== subscription.bootcamp.toString(),
      );
      await req.user.save();
    }

    subscription.isActive = false;
    subscription.canceled = true;
    subscription.canceledAt = Date.now();
    await subscription.save();

    // send email to user
    try {
      await sendEmail({
        email: req.user.email,
        subject: "تم إلغاء الاشتراك بنجاح",
        message: `مرحبا ${req.user.name},\n\nتم إلغاء اشتراكك بنجاح في هاش بلس. ${refundMessage}`,
      });
    } catch (error) {
      console.error("Error sending email:", error);
    }

    res.status(200).json({
      success: true,
      message: "تم إلغاء الاشتراك بنجاح",
    });
  } catch (error) {
    next(error);
  }
};
