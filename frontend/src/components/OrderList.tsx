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
  guarantee: { start: string; end: string };
  prices?: { value: number; symbol: string }[];
  date: string;
  order?: number;
}

interface Order {
  id: number;
  title: string;
  date: string;
  orderDate: string;
  description: string;
  products: Product[];
}

interface OrderListProps {
  orders: Order[];
  onSelect: (order: Order) => void;
  onDelete: (order: Order) => void;
  selectedOrderId?: number;
  narrowList?: boolean;
}

const getProductWord = (count: number, lang: string) => {
  if (lang === "ru") {
    if (count % 10 === 1 && count % 100 !== 11) return "Продукт";
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100))
      return "Продукта";
    return "Продуктов";
  }
  return count === 1 ? "Product" : "Products";
};

const formatMMDD = (date: string) => {
  const d = new Date(date);
  return d
    .toLocaleDateString("ru-RU", { month: "2-digit", day: "2-digit" })
    .replace(/\./g, "/");
};

const formatDDMonYYYY = (date: string) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const monthNames = [
    "Янв",
    "Фев",
    "Мар",
    "Апр",
    "Мая",
    "Июн",
    "Июл",
    "Авг",
    "Сен",
    "Окт",
    "Ноя",
    "Дек",
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} / ${month} / ${year}`;
};

const OrderList: React.FC<OrderListProps> = ({
  orders,
  onSelect,
  onDelete,
  selectedOrderId,
  narrowList = false,
}) => {
  const { t, i18n } = useTranslation();
  const getLocale = () => (i18n.language === "ru" ? "ru-RU" : "en-US");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (i18n.isInitialized) setReady(true);
    else i18n.on("initialized", () => setReady(true));
    // eslint-disable-next-line
  }, []);

  if (!ready) return null;

  return (
    <div className="order-list">
      {orders.map((order) => {
        const productsArr = Array.isArray(order.products) ? order.products : [];
        const productCount = productsArr.length;
        const amountUSD = productsArr.reduce(
          (sum, p) =>
            sum +
            Number(
              (Array.isArray(p.prices) ? p.prices : []).find(
                (pr: any) => pr.symbol === "USD"
              )?.value || 0
            ),
          0
        );
        const amountUAH = productsArr.reduce(
          (sum, p) =>
            sum +
            Number(
              (Array.isArray(p.prices) ? p.prices : []).find(
                (pr: any) => pr.symbol === "UAH"
              )?.value || 0
            ),
          0
        );
        const isActive = selectedOrderId === order.id;
        return (
          <div
            key={order.id}
            className={`order-card mb-3 shadow-sm${
              isActive ? " order-card--active" : ""
            }`}
            style={{
              background: isActive ? "#f8f9fa" : "#fff",
              borderRadius: 16,
              padding: 28,
              display: "flex",
              alignItems: "center",
              minHeight: 110,
              marginBottom: 20,
              transition:
                "box-shadow 0.25s cubic-bezier(.4,0,.2,1), background 0.2s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              width: "100%",
              maxWidth: 1200,
              boxSizing: "border-box",
              cursor: "pointer",
              position: "relative",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.14)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)")
            }
            onClick={() => onSelect(order)}
          >
            {!narrowList && (
              <>
                <div style={{ flex: 2, minWidth: 0, overflow: "hidden" }}>
                  <div
                    className="fw-bold text-secondary text-decoration-underline"
                    style={{
                      fontSize: 20,
                      wordBreak: "break-word",
                      lineHeight: 1.22,
                      maxWidth: 400,
                      overflowWrap: "break-word",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {order.title}
                  </div>
                </div>
                <div
                  style={{ flex: 1, minWidth: 90 }}
                  className="text-muted ms-3 d-flex flex-column align-items-center"
                >
                  <div style={{ fontSize: 25 }}>{String(productCount)}</div>
                  <div style={{ fontSize: 13 }}>
                    {getProductWord(productCount, i18n.language)}
                  </div>
                </div>
                <div
                  style={{ flex: 1, minWidth: 110 }}
                  className="text-muted ms-3 small d-flex flex-column align-items-start"
                >
                  <div
                    className="text-secondary small"
                    style={{ fontSize: 12 }}
                  >
                    {order.orderDate && formatMMDD(order.orderDate)}
                  </div>
                  <div style={{ fontSize: 15 }}>
                    {order.orderDate && formatDDMonYYYY(order.orderDate)}
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    minWidth: 110,
                    marginRight: isActive ? 0 : 12,
                  }}
                  className="ms-3 d-flex flex-column align-items-end"
                >
                  <div
                    className="text-secondary small"
                    style={{ fontSize: 13 }}
                  >
                    {amountUSD} $
                  </div>
                  <div className="text-muted" style={{ fontSize: 16 }}>
                    {amountUAH} UAH
                  </div>
                </div>
                {!isActive && (
                  <button
                    className="absolute btn btn-link p-0 ms-3"
                    style={{ color: "#888" }}
                    title={t("ordersPage.delete", "Удалить")}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(order);
                    }}
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
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: 48,
                      background: "#d3d8dd",
                      borderRadius: "0 12px 12px 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 8L14 12L10 16"
                        stroke="#fff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </>
            )}
            {narrowList && (
              <>
                <div
                  style={{ flex: 1, minWidth: 90 }}
                  className="text-muted ms-3 d-flex flex-column align-items-center"
                >
                  <div style={{ fontSize: 25 }}>{String(productCount)}</div>
                  <div style={{ fontSize: 13 }}>
                    {getProductWord(productCount, i18n.language)}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 110,
                    marginRight: isActive ? 48 : 0,
                  }}
                  className="text-muted ms-3 small d-flex flex-column align-items-start"
                >
                  <div
                    className="text-secondary small"
                    style={{ fontSize: 12 }}
                  >
                    {order.orderDate && formatMMDD(order.orderDate)}
                  </div>
                  <div style={{ fontSize: 15 }}>
                    {order.orderDate && formatDDMonYYYY(order.orderDate)}
                  </div>
                </div>

                {isActive ? (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: 48,
                      background: "#d3d8dd",
                      borderRadius: "0 12px 12px 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 8L14 12L10 16"
                        stroke="#fff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ) : (
                  <button
                    className="btn btn-link p-0 ms-3"
                    style={{ color: "#888" }}
                    title={t("ordersPage.delete", "Удалить")}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(order);
                    }}
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
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderList;
