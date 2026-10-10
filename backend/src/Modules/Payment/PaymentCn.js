import asyncHandler from "../../Utils/asyncHandler.js";
import ApiError from "../../Utils/ApiError.js";
import env from "../../Config/env.js";
import OrderMd from "../Order/OrderMd.js";
import { markOrderPaidAndDeductStock } from "../Order/OrderCn.js";

const BASE_URL = env.ZARINPAL_SANDBOX ? "https://sandbox.zarinpal.com" : "https://api.zarinpal.com";
const STARTPAY_URL = env.ZARINPAL_SANDBOX
  ? "https://sandbox.zarinpal.com/pg/StartPay"
  : "https://www.zarinpal.com/pg/StartPay";

/**
 * درخواست پرداخت از زرین‌پال و دریافت Authority
 */
export async function requestZarinpalPayment({ amount, description, mobile }) {
  const response = await fetch(`${BASE_URL}/pg/v4/payment/request.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: env.ZARINPAL_MERCHANT_ID,
      amount, // به تومان یا ریال - بسته به قرارداد حساب زرین‌پالت، هماهنگ کن
      description,
      callback_url: env.ZARINPAL_CALLBACK_URL,
      metadata: { mobile },
    }),
  });

  const data = await response.json();

  if (data?.data?.code !== 100) {
    console.error("Zarinpal request failed:", data?.errors);
    throw ApiError.internal("خطا در اتصال به درگاه پرداخت");
  }

  const authority = data.data.authority;
  return { authority, paymentUrl: `${STARTPAY_URL}/${authority}` };
}

/**
 * تایید پرداخت با زرین‌پال
 */
async function verifyZarinpalPayment({ authority, amount }) {
  const response = await fetch(`${BASE_URL}/pg/v4/payment/verify.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: env.ZARINPAL_MERCHANT_ID,
      authority,
      amount,
    }),
  });

  return response.json();
}

/**
 * Callback عمومی که زرین‌پال بعد از پرداخت کاربر رو بهش ریدایرکت می‌کنه.
 * این روت باید بدون auth باشه چون درخواست از سمت مرورگر کاربر (بعد از ریدایرکت زرین‌پال) میاد.
 */
export const verifyCallback = asyncHandler(async (req, res) => {
  const { Authority, Status } = req.query;

  const order = await OrderMd.findOne({ paymentAuthority: Authority });
  if (!order) {
    return res.redirect(`${process.env.FRONTEND_URL || ""}/payment/failed?reason=order_not_found`);
  }

  // جلوگیری از verify دوباره روی سفارشی که قبلاً پرداختش نهایی شده
  if (order.paymentStatus === "paid") {
    return res.redirect(`${process.env.FRONTEND_URL || ""}/payment/success?orderId=${order._id}`);
  }

  if (Status !== "OK") {
    order.paymentStatus = "failed";
    order.status = "canceled";
    await order.save();
    return res.redirect(`${process.env.FRONTEND_URL || ""}/payment/failed?orderId=${order._id}`);
  }

  const result = await verifyZarinpalPayment({ authority: Authority, amount: order.totalAmount });

  if (result?.data?.code === 100 || result?.data?.code === 101) {
    await markOrderPaidAndDeductStock(order, String(result.data.ref_id || ""));
    return res.redirect(`${process.env.FRONTEND_URL || ""}/payment/success?orderId=${order._id}`);
  }

  order.paymentStatus = "failed";
  order.status = "canceled";
  await order.save();
  return res.redirect(`${process.env.FRONTEND_URL || ""}/payment/failed?orderId=${order._id}`);
});
