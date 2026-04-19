import { sendEmail } from "../utils/sendEmail.js";
import User from "../models/user.model.js";
import { MOYASAR_WEBHOOK_SECRET, EMAIL_USER } from "../config/env.js";
import crypto from "crypto";
import Subscription from "../models/subscription.model.js";
import { Bootcamp } from "../models/content.model.js";
import {
  activateGeneralSubscription,
  activateBootcampSubscription,
} from "../utils/syncSubscription.js";

// handle general subscription payment
const handleGeneralSubscriptionPayment = async (user, payment) => {
  try {
    const { plan_months, plan_amount } = payment?.metadata || {};

    // Note: Moyasar amounts are in Halalas (100 = 1 SAR). Ensure plan_amount matches this unit.
    if (plan_amount && Number(payment.amount) !== Number(plan_amount)) {
      console.error("Amount mismatch detected!");
      throw new Error("Payment amount mismatch");
    }

    if (!plan_months || isNaN(Number(plan_months))) {
      throw new Error("Invalid plan_months in metadata");
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + Number(plan_months));

    const subscription = await Subscription.findOne({
      user: user._id,
      type: "general",
      isActive: true,
    });

    if (subscription) {
      throw new Error("User already subscribed to this general subscription");
    }

    await Subscription.create({
      type: "general",
      user: user._id,
      subscriptionDetails: {
        subscriptionName: payment?.metadata?.subscriptionName,
        subscriptionDescription: payment?.metadata?.subscriptionDescription,
        subscriptionType: payment?.metadata?.subscriptionType,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
      },
      paymentDetails: {
        paymentId: payment.id,
        paymentStatus: payment.status,
        paymentDate: payment.created_at,
        paymentMethod: payment.payment_method,
        paymentAmount: payment.amount,
        paymentCurrency: payment.currency,
      },
      isActive: true,
    });

    // activate general subscription
    await activateGeneralSubscription(user._id, { startDate, endDate });

    return { startDate, endDate };
  } catch (err) {
    console.error("Error handling general subscription payment:", err);
    throw err;
  }
};

// handle bootcamp subscription payment
const handleBootcampSubscriptionPayment = async (user, payment) => {
  try {
    const { bootcampId } = payment?.metadata || {};

    if (!bootcampId) {
      throw new Error("Invalid bootcampId in metadata");
    }

    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) {
      throw new Error("Bootcamp not found");
    }

    const subscription = await Subscription.findOne({
      user: user._id,
      type: "bootcamp",
      bootcamp: bootcampId,
      isActive: true,
    });

    if (subscription) {
      throw new Error("User already subscribed to this bootcamp");
    }

    await Subscription.create({
      type: "bootcamp",
      user: user._id,
      bootcamp: bootcamp._id,
      paymentDetails: {
        paymentId: payment.id,
        paymentStatus: payment.status,
        paymentDate: payment.created_at,
        paymentMethod: payment.payment_method,
        paymentAmount: payment.amount,
        paymentCurrency: payment.currency,
      },
      isActive: true,
    });

    // activate bootcamp subscription
    await activateBootcampSubscription(user._id, bootcampId);

    return { bootcamp };
  } catch (err) {
    console.error("Error handling bootcamp subscription payment:", err);
    throw err;
  }
};

// handle moyasar webhook
const moyasarWebhook = async (req, res) => {
  try {
    console.log("Moyasar webhook received");

    // 1. Verify Secret Token securely
    const payload = req.body.toString("utf-8");
    const event = JSON.parse(payload);

    // Timing-safe comparison to prevent timing attacks
    const receivedToken = Buffer.from(event.secret_token || "");
    const expectedToken = Buffer.from(MOYASAR_WEBHOOK_SECRET);

    const isSecretValid =
      receivedToken.length === expectedToken.length &&
      crypto.timingSafeEqual(receivedToken, expectedToken);

    if (!isSecretValid) {
      console.error("Invalid webhook secret");
      return res.status(401).json({ message: "Invalid webhook secret" });
    }

    // Immediately return 200 OK to prevent timeouts and retries from Moyasar
    res.status(200).json({ message: "Webhook received" });

    // Process the heavy logic asynchronously in the background
    (async () => {
      try {
        const payment = event.data;

        const { customer_id, type, subscriptionName, plan_months } =
          payment?.metadata || {};

        // 2. Look up User
        const user = await User.findById(customer_id);
        if (!user) {
          console.error(
            `User ${customer_id} not found for payment ${payment.id}`,
          );
          return;
        }

        // 3. Handle Specific Event Types
        if (event.type === "payment_failed") {
          await sendEmail({
            email: user.email,
            subject: "فشل الدفع في هاش بلس",
            message: `مرحبا ${user.name},\n\nنود إعلامك بأن محاولتك للاشتراك لم تكتمل بنجاح...`,
          });
          return;
        }

        if (event.type === "payment_refunded") {
          const subscription = await Subscription.findOne({
            "paymentDetails.paymentId": payment.id,
          });

          if (!subscription) {
            console.error(`Subscription not found for payment ${payment.id}`);
            return;
          }

          if (subscription.paymentDetails?.refunded) {
            console.error(
              `Subscription already refunded for payment ${payment.id}`,
            );
            return;
          }

          subscription.paymentDetails.refunded = true;
          subscription.paymentDetails.refundDate = Date.now();
          await subscription.save();

          console.log("sending email after payment refund from webhook...");

          await sendEmail({
            email: user.email,
            subject: "تم استرداد الدفعة في هاش بلس",
            message: `مرحبا ${user.name},\n\nتم استرداد دفعتك في منصة هاش بلس بنجاح.`,
          });
          return;
        }

        if (event.type !== "payment_paid") {
          return;
        }

        let options = {};
        let adminOptions = {};

        // 6. Create subscription record
        let subscriptionRecord = await Subscription.findOne({
          "paymentDetails.paymentId": payment.id,
        });

        if (!subscriptionRecord) {
          if (type === "general") {
            const { startDate, endDate } =
              await handleGeneralSubscriptionPayment(user, payment);

            // Email options to notify user about new payment
            options = {
              email: user.email,
              subject: "تم الاشتراك بنجاح",
              message: `مرحبا ${user.name},\n\nتم تفعيل اشتراكك في منصة هاش بلس بنجاح حتى ${endDate.toDateString()}.`,
            };

            // Email options to notify admin about new payment
            adminOptions = {
              email: EMAIL_USER,
              subject: "مشترك جديد في منصة هاش بلس!",
              message: `
      قام ${user.name} بالاشتراك في باقة ${subscriptionName} المميزة.

      تفاصيل الاشتراك:
      - الاسم: ${user.name}
      - البريد الإلكتروني: ${user.email}
      - تاريخ الاشتراك: ${startDate.toDateString()}
      - تاريخ الانتهاء: ${endDate.toDateString()}
      - المبلغ: ${payment.amount / 100} ريال
      - مدة الاشتراك: ${Number(plan_months)} شهر
      - معرّف الدفعة: ${payment.id}
      - رابط الدفعة: ${payment.receipt_url}
      `,
            };
          } else if (type === "bootcamp") {
            const { bootcamp } = await handleBootcampSubscriptionPayment(
              user,
              payment,
            );

            // Email options to notify user about new payment
            options = {
              email: user.email,
              subject: "تم الاشتراك بنجاح",
              message: `مرحبا ${user.name},\n\nتم تفعيل اشتراكك في بوتكامب "${bootcamp.title || subscriptionName}" بنجاح.`,
            };

            // Email options to notify admin about new payment
            adminOptions = {
              email: EMAIL_USER,
              subject: "مشترك جديد في منصة هاش بلس!",
              message: `
      قام ${user.name} بالاشتراك في بوتكامب ${bootcamp.title || subscriptionName}.

      تفاصيل الاشتراك:
      - الاسم: ${user.name}
      - البريد الإلكتروني: ${user.email}
      - المبلغ: ${payment.amount / 100} ريال
      - معرّف الدفعة: ${payment.id}
      - رابط الدفعة: ${payment.receipt_url}
      `,
            };
          } else {
            console.error("Invalid subscription type");
            return;
          }

          // 7. send email to user and admin
          try {
            console.log("sending email after payment success from webhook...");
            // send email to user
            await sendEmail(options);
            // send email to admin
            await sendEmail(adminOptions);
          } catch (err) {
            console.error("Email send error:", err);
          }
        }
      } catch (backgroundErr) {
        console.error("Moyasar background processing error:", backgroundErr);
      }
    })();
  } catch (err) {
    console.error("Moyasar webhook initial error:", err);
    if (!res.headersSent) {
      return res.status(400).json({ message: "Webhook error" });
    }
  }
};

export { moyasarWebhook };
