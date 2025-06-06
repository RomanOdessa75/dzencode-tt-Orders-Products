"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const schema = z
  .object({
    email: z.string().email("Некорректный email").min(1, "Email обязателен"),
    password: z
      .string()
      .min(6, "Пароль должен быть не менее 6 символов")
      .regex(/[A-Za-z]/, "Пароль должен содержать буквы")
      .regex(/[0-9]/, "Пароль должен содержать цифры")
      .min(1, "Пароль обязателен"),
    password2: z.string().min(1, "Повтор пароля обязателен"),
  })
  .refine((data) => data.password === data.password2, {
    message: "Пароли не совпадают",
    path: ["password2"],
  });

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    password2?: string;
  }>({});
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const result = schema.safeParse({ email, password, password2 });
    if (!result.success) {
      const errors: { email?: string; password?: string; password2?: string } =
        {};
      for (const issue of result.error.issues) {
        if (issue.path[0] === "email") errors.email = issue.message;
        if (issue.path[0] === "password") errors.password = issue.message;
        if (issue.path[0] === "password2") errors.password2 = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Ошибка регистрации");
        return;
      }
      toast.success("Успешная регистрация!", { toastId: "register-success" });
      setTimeout(() => router.push("/login"), 1000);
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
      <h2 style={{ marginBottom: 24 }}>Регистрация</h2>
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
            autoComplete="new-password"
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
        <div style={{ marginBottom: 16 }}>
          <label>Повторите пароль</label>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            autoComplete="new-password"
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
            {fieldErrors.password2 || ""}
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
          Зарегистрироваться
        </button>
      </form>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <a
          href="/login"
          style={{ color: "#198754", textDecoration: "underline" }}
        >
          Войти
        </a>
      </div>
    </div>
  );
}
