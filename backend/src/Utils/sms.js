import env from "../Config/env.js";
import logger from "../Config/logger.js";
import ApiError from "./ApiError.js";

export async function sendOtpSms(phone, code) {
  if (!env.KAVENEGAR_API_KEY || !env.KAVENEGAR_OTP_TEMPLATE) {
    if (env.NODE_ENV === "production") {
      logger.error("سرویس پیامک تنظیم نشده است");
      throw new ApiError(503, "سرویس پیامک در دسترس نیست");
    }
    console.log(`📱 [DEV OTP] ${phone}: ${code}`); 
    return;
  }

  const params = new URLSearchParams({
    receptor: phone,
    token: code,
    template: env.KAVENEGAR_OTP_TEMPLATE,
  });

  let json;
  try {
    const response = await fetch(
      `https://api.kavenegar.com/v1/${env.KAVENEGAR_API_KEY}/verify/lookup.json?${params}`,
      { signal: AbortSignal.timeout(10000) }
    );
    json = await response.json();
  } catch (err) {
    logger.error(`ارسال پیامک ناموفق بود: ${err.message}`);
    throw new ApiError(502, "ارسال پیامک با خطا مواجه شد، دوباره تلاش کنید");
  }

  if (json?.return?.status !== 200) {
    logger.error(`پیامک رد شد: ${JSON.stringify(json?.return)}`);
    throw new ApiError(502, "ارسال پیامک با خطا مواجه شد، دوباره تلاش کنید");
  }
}