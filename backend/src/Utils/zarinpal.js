import env from "../Config/env.js";
import logger from "../Config/logger.js";
import ApiError from "./ApiError.js";

const BASE_URL = env.ZARINPAL_SANDBOX ? "https://sandbox.zarinpal.com" : "https://api.zarinpal.com";
const START_PAY_URL = env.ZARINPAL_SANDBOX
  ? "https://sandbox.zarinpal.com/pg/StartPay"
  : "https://www.zarinpal.com/pg/StartPay";

// مبلغ‌های سایت همیشه تومانه؛ تبدیل به واحد درگاه فقط همین‌جا انجام میشه
export const toGatewayAmount = (toman) => (env.ZARINPAL_AMOUNT_UNIT === "rial" ? toman * 10 : toman);
export const fromGatewayAmount = (value) =>
  env.ZARINPAL_AMOUNT_UNIT === "rial" ? Math.round(Number(value) / 10) : Number(value);

async function post(endpoint, body) {
  let response;
  try {
    response = await fetch(`${BASE_URL}/pg/v4/payment/${endpoint}.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ merchant_id: env.ZARINPAL_MERCHANT_ID, ...body }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    throw new Error(`NETWORK:${err.message}`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error("BAD_RESPONSE");
  }
}

export async function requestZarinpalPayment({ amount, description, mobile }) {
  let json;
  try {
    json = await post("request", {
      amount: toGatewayAmount(amount),
      description,
      callback_url: env.ZARINPAL_CALLBACK_URL,
      metadata: mobile ? { mobile } : {},
    });
  } catch (err) {
    logger.error(`Zarinpal request failed: ${err.message}`);
    throw new ApiError(502, "ارتباط با درگاه پرداخت برقرار نشد، لطفاً دوباره تلاش کنید");
  }

  if (json?.data?.code !== 100 || !json.data.authority) {
    logger.error(`Zarinpal request rejected: ${JSON.stringify(json?.errors || json?.data)}`);
    throw new ApiError(502, "خطا در اتصال به درگاه پرداخت");
  }

  return { authority: json.data.authority, paymentUrl: `${START_PAY_URL}/${json.data.authority}` };
}

export async function verifyZarinpalPayment({ authority, amount }) {
  let json;
  try {
    json = await post("verify", { authority, amount: toGatewayAmount(amount) });
  } catch (err) {
    logger.warn(`Zarinpal verify unreachable: ${err.message}`);
    return { ok: false, networkError: true };
  }

  const code = json?.data?.code;
  if (code === 100 || code === 101) {
    return {
      ok: true,
      alreadyVerified: code === 101,
      refId: json.data.ref_id ? String(json.data.ref_id) : null,
    };
  }

  return { ok: false, networkError: false, code: code ?? json?.errors?.code ?? null };
}

export async function listUnverifiedPayments() {
  const json = await post("unVerified", {});
  const code = json?.data?.code;

  if (code === 100 || code === 101) {
    return Array.isArray(json.data.authorities) ? json.data.authorities : [];
  }
  throw new Error(`UNVERIFIED_FAILED:${JSON.stringify(json?.errors || code)}`);
}