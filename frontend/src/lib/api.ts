export async function apiFetch(url: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }
  return res;
}
