export function getErrorMessage(err, fallback = "خطایی رخ داد") {
  const data = err?.response?.data;
  if (data?.errors?.[0]?.message) return data.errors[0].message;
  if (data?.message) return data.message;
  if (err?.code === "ECONNABORTED") return "پاسخ سرور بیش از حد طول کشید";
  if (err?.request && !err?.response) return "ارتباط با سرور برقرار نشد";
  return fallback;
}