"use client";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ProductList from "./ProductList";
import "@/i18n/i18n";

interface Product {
  id: number;
  title: string;
  serialNumber: string;
  isNew: boolean;
  type: string;
  specification: string;
  guarantee: { start: string; end: string };
  price: { value: number; symbol: string; isDefault: boolean }[];
  date: string;
  prices?: { value: number; symbol: string }[];
}

interface Order {
  id: number;
  title: string;
  date: string;
  description: string;
  products: Product[];
}

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onAddProduct: () => void;
  onDeleteProduct: (product: any) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  onClose,
  onAddProduct,
  onDeleteProduct,
}) => {
  const { t, i18n } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (i18n.isInitialized) setReady(true);
    else i18n.on("initialized", () => setReady(true));
    // eslint-disable-next-line
  }, []);

  if (!ready) return null;
  if (!order) return null;

  console.log("приход:", order);

  return (
    <div
      className="order-details"
      style={{
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        padding: "38px",
        minWidth: 600,
        maxWidth: 900,
        position: "relative",
        margin: "0 auto",
        marginTop: 70,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "#fff",
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
        }}
        aria-label={t("orderDetails.close", "Закрыть")}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="9" cy="9" r="8.5" fill="#fff" stroke="#e0e0e0" />
          <path
            d="M6 6L12 12M12 6L6 12"
            stroke="#888"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <div
        className="fw-bold text-secondary text-decoration-underline"
        style={{
          fontSize: 22,
          wordBreak: "break-word",
          lineHeight: 1.22,
          maxWidth: 520,
          overflowWrap: "break-word",
          whiteSpace: "pre-line",
          marginBottom: 8,
        }}
      >
        {order.title}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          margin: "18px 0 24px 0",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={onAddProduct}
      >
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(90deg, #a8e063 0%, #56ab2f 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 5V15"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M5 10H15"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span style={{ color: "#56ab2f", fontWeight: 500, fontSize: 18 }}>
          {t("orderDetails.addProduct", "Добавить продукт")}
        </span>
      </div>
      <ProductList
        products={order.products || []}
        onDelete={onDeleteProduct}
        hideOrderTitle={true}
      />
    </div>
  );
};

export default OrderDetails;
