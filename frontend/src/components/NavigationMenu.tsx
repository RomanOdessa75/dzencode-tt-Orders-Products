"use client";

import "@/i18n/i18n";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Boxes,
  Users,
  Settings,
  CircleUserRound,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { href: "/orders", labelKey: "nav.orders", icon: LayoutDashboard },
  { href: "/products", labelKey: "nav.products", icon: Boxes },
  { href: "/users", labelKey: "nav.users", icon: Users },
  { href: "/settings", labelKey: "nav.settings", icon: Settings },
];

const NavigationMenu: React.FC = () => {
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const [appTitle, setAppTitle] = useState<string>("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (i18n.isInitialized) setReady(true);
    else i18n.on("initialized", () => setReady(true));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (ready) setAppTitle(t("appTitle").toUpperCase());
  }, [t, ready]);

  const filteredNavItems = navItems.filter(
    (item) => item.labelKey === "nav.orders" || item.labelKey === "nav.products"
  );

  if (!ready) return null;

  return (
    <nav
      className="side-nav d-flex flex-column vh-100 p-3 bg-dark text-white"
      style={{ width: "280px", flexShrink: 0, viewTransitionName: "side-nav" }}
    >
      <div className="d-flex align-items-center mb-4">
        <ShieldCheck size={32} className="me-2 text-success" />
        <span className="fs-4 fw-bold">{appTitle}</span>
      </div>

      <div className="d-flex flex-column align-items-center mb-4">
        <div
          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-2"
          style={{ width: "80px", height: "80px" }}
        >
          <CircleUserRound size={48} color="white" />
        </div>
      </div>

      <ul className="nav nav-pills flex-column mb-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <li className="nav-item mb-1" key={item.labelKey}>
              <Link
                href={item.href}
                className={`nav-link text-white d-flex align-items-center ${
                  isActive ? "active bg-success" : ""
                }`}
                style={{ padding: "0.75rem 1rem" }}
              >
                <Icon size={20} className="me-3" />
                {t(item.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavigationMenu;
