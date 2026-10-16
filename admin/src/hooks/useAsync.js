import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../utils/error";

/**
 * اجرای یک درخواست async با وضعیت loading/error و reload.
 * - با تغییر deps دوباره اجرا میشه
 * - داده‌ی قبلی تا رسیدن داده‌ی جدید نگه داشته میشه
 * - پاسخ‌های کهنه نادیده گرفته میشن
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null, errorStatus: null });
  const fnRef = useRef(fn);
  const requestId = useRef(0);
  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    fnRef.current = fn;
  });

  const run = useCallback(async () => {
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: null, errorStatus: null }));
    try {
      const data = await fnRef.current();
      if (id !== requestId.current) return;
      setState({ data, loading: false, error: null, errorStatus: null });
    } catch (err) {
      if (id !== requestId.current) return;
      setState((s) => ({
        ...s,
        loading: false,
        error: getErrorMessage(err, "خطا در دریافت اطلاعات"),
        errorStatus: err?.response?.status ?? null,
      }));
    }
  }, []);

  useEffect(() => {
    run();
    return () => {
      requestId.current += 1;
    };
  }, [run, depsKey]);

  return { ...state, reload: run };
}