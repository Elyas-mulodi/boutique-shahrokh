const API_ORIGIN = (() => {
  try {
    return new URL(
      import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
    ).origin;
  } catch {
    return "";
  }
})();

export const resolveImage = (src) =>
  src && src.startsWith("/") ? `${API_ORIGIN}${src}` : src;
