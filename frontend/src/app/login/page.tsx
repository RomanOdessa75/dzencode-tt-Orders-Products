"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const schema = z.object({
  email: z.string().email("Некорректный email").min(1, "Email обязателен"),
  password: z
    .string()
    .min(6, "Пароль должен быть не менее 6 символов")
    .regex(/[A-Za-z]/, "Пароль должен содержать буквы")
    .regex(/[0-9]/, "Пароль должен содержать цифры")
    .min(1, "Пароль обязателен"),
});

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const result = schema.safeParse({ email, password });
    if (!result.success) {
      const errors: { email?: string; password?: string } = {};
      for (const issue of result.error.issues) {
        if (issue.path[0] === "email") errors.email = issue.message;
        if (issue.path[0] === "password") errors.password = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Ошибка авторизации");
        return;
      }
      if (data.token) {
        localStorage.setItem("token", data.token);
        document.cookie = `token=${data.token}; path=/; max-age=${
          7 * 24 * 60 * 60
        }`;
      }
      toast.success("Успешный вход!", { toastId: "login-success" });
      setTimeout(() => router.push("/orders"), 500);
    } catch (e) {
      toast.error("Ошибка сети");
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "80px auto",
        padding: 24,
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <ToastContainer />
      <h2 style={{ marginBottom: 24 }}>Вход</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            autoComplete="username"
          />
          <div
            style={{
              minHeight: 18,
              color: "red",
              fontSize: 13,
              marginTop: 2,
              transition: "min-height 0.2s",
            }}
          >
            {fieldErrors.email || ""}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            autoComplete="current-password"
          />
          <div
            style={{
              minHeight: 18,
              color: "red",
              fontSize: 13,
              marginTop: 2,
              transition: "min-height 0.2s",
            }}
          >
            {fieldErrors.password || ""}
          </div>
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            background: "#198754",
            color: "#fff",
            border: "none",
            borderRadius: 4,
          }}
        >
          Войти
        </button>
      </form>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <a
          href="/register"
          style={{ color: "#198754", textDecoration: "underline" }}
        >
          Регистрация
        </a>
      </div>
    </div>
  );
}
