import axios from "axios";
import { MOYASAR_SECRET_KEY } from "../config/env.js";

const refundPayment = async (paymentId, amount = null) => {
  try {
    const payload = amount ? { amount } : {};

    const response = await axios.post(
      `https://api.moyasar.com/v1/payments/${paymentId}/refund`,
      payload,
      {
        auth: {
          username: MOYASAR_SECRET_KEY,
          password: "",
        },
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error refunding payment:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export { refundPayment };
