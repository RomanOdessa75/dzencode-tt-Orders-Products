"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { io, Socket } from "socket.io-client";
import { useTranslation } from "react-i18next";
import { Search, Users, LogOut } from "lucide-react";
import "@/i18n/i18n";

interface TopMenuProps {
  onLogout?: () => void;
}

const TopMenu: React.FC<TopMenuProps> = ({ onLogout }) => {
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeConnections, setActiveConnections] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [ready, setReady] = useState(false);

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

  useEffect(() => {
    if (i18n.isInitialized) setReady(true);
    else i18n.on("initialized", () => setReady(true));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const newSocket = io(WS_URL || "http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    newSocket.on("active_connections", (data: { count: number }) => {
      setActiveConnections(data.count);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    newSocket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err);
    });

    return () => {
      clearInterval(timerId);
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [ready]);

  if (!ready) return null;

  const formattedDate = format(currentTime, "dd MMM, yyyy");
  const formattedTime = format(currentTime, "HH:mm");

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    document.cookie = "token=; Max-Age=0; path=/;";
    window.location.href = "/login";
  };

  return (
    <header
      className="d-flex justify-content-between align-items-center p-3 bg-white shadow-sm"
      style={{ height: "70px", borderBottom: "1px solid #dee2e6" }}
    >
      <div className="input-group" style={{ maxWidth: "400px" }}>
        <span className="input-group-text bg-light border-0">
          <Search size={20} className="text-muted" />
        </span>
        <input
          type="text"
          className="form-control bg-light border-0"
          placeholder={t("topMenu.searchPlaceholder")}
        />
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="me-3 text-muted">
          <span>{formattedDate}</span>
          <span className="mx-1">|</span>
          <span>{formattedTime}</span>
        </div>
        <div
          className="d-flex align-items-center text-muted"
          title={t("topMenu.activeSessions")}
        >
          <Users size={20} className="me-1" />
          <span>{activeConnections}</span>
        </div>
        <select
          className="form-select form-select-sm w-auto ms-3"
          style={{ minWidth: 80 }}
          value={i18n.language}
          onChange={handleLangChange}
        >
          <option value="ru">RU</option>
          <option value="en">EN</option>
        </select>
        {onLogout ? (
          <button
            className="btn btn-outline-secondary btn-sm ms-3"
            onClick={onLogout}
            title={t("logout") || "Выйти"}
          >
            <LogOut size={18} className="me-1" /> {t("logout") || "Выйти"}
          </button>
        ) : (
          <button
            className="btn btn-outline-secondary btn-sm ms-3"
            onClick={handleLogout}
            title={t("logout") || "Выйти"}
          >
            <LogOut size={18} className="me-1" /> {t("logout") || "Выйти"}
          </button>
        )}
      </div>
    </header>
  );
};

export default TopMenu;
