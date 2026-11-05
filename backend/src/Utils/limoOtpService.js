const LIMO_BASE = "https://api.limosms.com/api";

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  ApiKey: process.env.LIMOSMS_API_KEY,
};

export const requestLimoOtp = async (phone) => {
  try {
    const response = await fetch(`${LIMO_BASE}/sendcode`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        Mobile: phone,
        Footer: "بوتیک شاهرخ",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("LimoSMS send error:", data);
      throw new Error(data.message || "ارسال OTP ناموفق بود");
    }

    return true;
  } catch (error) {
    console.error("LimoSMS OTP request error:", error.message);
    throw new Error("خطا در ارسال کد تایید");
  }
};

export const verifyLimoOtp = async (phone, code) => {
  try {
    const response = await fetch(`${LIMO_BASE}/checkcode`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        Mobile: phone,
        Code: String(code),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("LimoSMS verify error:", data);
      return false;
    }

    return Boolean(data.success);
  } catch (error) {
    console.error("LimoSMS OTP verify error:", error.message);
    return false;
  }
};