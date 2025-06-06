"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";

interface Product {
  id: number;
  title: string;
  serialNumber: string;
  isNew: boolean;
  type: string;
  specification: string;
  guarantee?: {
    start?: string;
    end?: string;
    startDate?: string;
    endDate?: string;
  };
  prices?: { value: number; symbol: string }[];
  date: string;
  order?: number | string | { id: number; title: string };
  orderName?: string;
}

interface ProductListProps {
  products: Product[];
  onDelete?: (product: Product) => void;
  hideOrderTitle?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({
  products = [],
  onDelete,
  hideOrderTitle,
}) => {
  const { t, i18n } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (i18n.isInitialized) setReady(true);
    else i18n.on("initialized", () => setReady(true));
    // eslint-disable-next-line
  }, []);

  if (!ready) return null;

  const getLocale = () => (i18n.language === "ru" ? "ru-RU" : "en-US");
  return (
    <div className="product-list">
      {(products || []).map((product) => (
        <div
          key={product.id}
          className="product-card mb-3 shadow-sm"
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 28,
            display: "flex",
            alignItems: "center",
            minHeight: 110,
            marginBottom: 20,
            transition: "box-shadow 0.25s cubic-bezier(.4,0,.2,1)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            width: "100%",
            maxWidth: 1200,
            boxSizing: "border-box",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.14)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)")
          }
        >
          <div style={{ flex: 2, minWidth: 0, overflow: "hidden" }}>
            <div
              className="fw-bold text-black text-decoration-underline"
              style={{
                fontSize: 20,
                wordBreak: "break-word",
                lineHeight: 1.22,
                maxWidth: 400,
                overflowWrap: "break-word",
                whiteSpace: "pre-line",
              }}
            >
              {product.title}
            </div>
            <div
              className="text-muted small"
              style={{ fontSize: 14, marginTop: 4, wordBreak: "break-word" }}
            >
              sn-{String(product.serialNumber)}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 90 }} className="text-muted ms-3">
            {String(product.type)}
          </div>
          <div
            style={{ flex: 1, minWidth: 110 }}
            className="text-muted ms-3 small d-flex flex-column align-items-end"
          >
            <div>
              <span className="me-1">{t("productsPage.from", "с")}</span>
              {(product.guarantee?.start || product.guarantee?.startDate) &&
                new Date(
                  product.guarantee?.start ?? product.guarantee?.startDate ?? ""
                ).toLocaleDateString(getLocale())}
            </div>
            <div>
              <span className="me-1">{t("productsPage.to", "по")}</span>
              {(product.guarantee?.end || product.guarantee?.endDate) &&
                new Date(
                  product.guarantee?.end ?? product.guarantee?.endDate ?? ""
                ).toLocaleDateString(getLocale())}
            </div>
          </div>
          <div
            style={{ flex: 1, minWidth: 110 }}
            className="ms-3 d-flex flex-column align-items-end"
          >
            <div className="text-secondary small" style={{ fontSize: 13 }}>
              {
                (Array.isArray(product.prices) ? product.prices : []).find(
                  (p: any) => p.symbol === "USD"
                )?.value
              }{" "}
              $
            </div>
            <div className="text-muted" style={{ fontSize: 16 }}>
              {
                (Array.isArray(product.prices) ? product.prices : []).find(
                  (p: any) => p.symbol === "UAH"
                )?.value
              }{" "}
              UAH
            </div>
          </div>
          {!hideOrderTitle && (
            <div
              style={{ flex: 2, minWidth: 0, overflow: "hidden" }}
              className="ms-3"
            >
              <div
                className="text-muted text-decoration-underline"
                style={{
                  wordBreak: "break-word",
                  maxWidth: 400,
                  overflowWrap: "break-word",
                  whiteSpace: "pre-line",
                }}
              >
                {typeof product.order === "object" &&
                product.order &&
                "title" in product.order
                  ? (product.order as { title: string }).title
                  : product.orderName
                  ? String(product.orderName)
                  : product.order
                  ? String(product.order)
                  : "-"}
              </div>
            </div>
          )}
          {onDelete && (
            <button
              className="btn btn-link p-0 ms-3"
              style={{ color: "#888" }}
              title={t("productsPage.delete", "Удалить")}
              onClick={() => onDelete(product)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="#888"
                  strokeWidth="2"
                  d="M7 6V4.8A1.8 1.8 0 0 1 8.8 3h6.4A1.8 1.8 0 0 1 17 4.8V6m2.5 0h-15M19 6v12.2A1.8 1.8 0 0 1 17.2 20H6.8A1.8 1.8 0 0 1 5 18.2V6m3 4v6m4-6v6"
                />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductList;
