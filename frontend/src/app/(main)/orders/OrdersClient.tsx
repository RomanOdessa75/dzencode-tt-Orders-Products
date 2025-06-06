"use client";

import React, { useState, useEffect } from "react";
import OrderList from "@/components/OrderList";
import OrderDetails from "@/components/OrderDetails";
import { apiFetch } from "@/lib/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/i18n/i18n";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const OrdersClient = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [formError, setFormError] = useState("");
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    title: "",
    type: "",
    serialNumber: "",
    priceUSD: "",
    priceUAH: "",
    guaranteeStart: "",
    guaranteeEnd: "",
  });
  const [productFormError, setProductFormError] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleteModalAnimating, setIsDeleteModalAnimating] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).i18next?.isInitialized)
      setReady(true);
    else if ((window as any).i18next)
      (window as any).i18next.on("initialized", () => setReady(true));
    else setReady(true);
  }, []);

  useEffect(() => {
    setLoading(true);
    apiFetch(`${API_URL}/api/orders`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
        toast.success(t("ordersPage.loaded", "Приходы загружены"), {
          toastId: "orders-loaded",
        });
      })
      .catch(() => {
        toast.error(t("ordersPage.loadError", "Ошибка загрузки приходов"), {
          toastId: "orders-load-error",
        });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (orderToDelete && !deleteModalVisible) {
      setDeleteModalVisible(true);
      setIsDeleteModalAnimating(true);
      setTimeout(() => {
        setIsDeleteModalAnimating(false);
      }, 50);
    } else if (!orderToDelete && deleteModalVisible) {
      setIsDeleteModalAnimating(true);
      setTimeout(() => {
        setDeleteModalVisible(false);
        setIsDeleteModalAnimating(false);
      }, 300);
    }
  }, [orderToDelete, deleteModalVisible]);

  const handleCloseDeleteModal = () => {
    setOrderToDelete(null);
  };

  const handleDelete = async (order: any) => {
    const prevOrders = orders;
    setOrders(orders.filter((o) => o.id !== order.id));
    if (selected?.id === order.id) setSelected(null);
    try {
      const res = await apiFetch(`${API_URL}/api/orders/${order.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success(t("ordersPage.deleteSuccess", "Приход успешно удален"), {
        toastId: "orders-delete-success",
      });
    } catch {
      setOrders(prevOrders);
      toast.error(t("ordersPage.deleteError", "Ошибка удаления прихода"), {
        toastId: "orders-delete-error",
      });
    }
    setOrderToDelete(null);
  };

  const handleAdd = async (orderData: any) => {
    try {
      const res = await apiFetch(`${API_URL}/api/orders`, {
        method: "POST",
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("ordersPage.addError"));
      setOrders([data, ...orders]);
      setSelected(data);
      toast.success(t("ordersPage.addSuccess", "Приход успешно добавлен"), {
        toastId: "orders-add-success",
      });
      setShowModal(false);
      setForm({ title: "", description: "" });
      setFormError("");
    } catch (e: any) {
      setFormError(
        e.message || t("ordersPage.addError", "Ошибка добавления прихода")
      );
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.title || form.title.length < 2) {
      setFormError(
        t(
          "ordersPage.titleRequired",
          "Название прихода обязательно (мин. 2 символа)"
        )
      );
      return;
    }
    handleAdd({ ...form, orderDate: new Date().toISOString() });
  };

  const handleAddProduct = async (productData: any) => {
    try {
      const newProduct = {
        title: productData.title,
        type: productData.type,
        serialNumber: Number(productData.serialNumber),
        isNew: true,
        specification: "",
        orderId: selected.id,
        productDate: new Date().toISOString(),
        guarantee:
          productData.guaranteeStart && productData.guaranteeEnd
            ? {
                startDate: productData.guaranteeStart,
                endDate: productData.guaranteeEnd,
              }
            : undefined,
        prices: [
          {
            value: Number(productData.priceUSD),
            symbol: "USD",
            isDefault: true,
          },
          {
            value: Number(productData.priceUAH),
            symbol: "UAH",
            isDefault: false,
          },
        ],
      };
      const tempProduct = { ...newProduct, id: Math.random() * 100000 };
      setOrders(
        orders.map((o) =>
          o.id === selected.id
            ? { ...o, products: [tempProduct, ...(o.products || [])] }
            : o
        )
      );
      setSelected((s: any) =>
        s && s.id === selected.id
          ? { ...s, products: [tempProduct, ...(s.products || [])] }
          : s
      );
      setShowProductModal(false);
      setProductForm({
        title: "",
        type: "",
        serialNumber: "",
        priceUSD: "",
        priceUAH: "",
        guaranteeStart: "",
        guaranteeEnd: "",
      });
      setProductFormError("");
      const res = await apiFetch(`${API_URL}/api/products`, {
        method: "POST",
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("productsPage.addError"));
      setOrders(
        orders.map((o) =>
          o.id === selected.id
            ? {
                ...o,
                products: [
                  data,
                  ...o.products.filter((p: any) => p.id !== tempProduct.id),
                ],
              }
            : o
        )
      );
      setSelected((s: any) =>
        s && s.id === selected.id
          ? {
              ...s,
              products: [
                data,
                ...s.products.filter((p: any) => p.id !== tempProduct.id),
              ],
            }
          : s
      );
      toast.success(t("productsPage.addSuccess", "Продукт успешно добавлен"), {
        toastId: "orders-product-add-success",
      });
    } catch (e: any) {
      setProductFormError(
        e.message || t("productsPage.addError", "Ошибка добавления продукта")
      );
    }
  };

  const handleDeleteProduct = async (product: any) => {
    const prevOrders = orders;
    setOrders(
      orders.map((o) =>
        o.id === selected.id
          ? {
              ...o,
              products: o.products.filter((p: any) => p.id !== product.id),
            }
          : o
      )
    );
    setSelected((s: any) =>
      s && s.id === selected.id
        ? { ...s, products: s.products.filter((p: any) => p.id !== product.id) }
        : s
    );
    try {
      const res = await apiFetch(`${API_URL}/api/products/${product.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success(t("productsPage.deleteSuccess", "Продукт успешно удален"), {
        toastId: "orders-product-delete-success",
      });
    } catch {
      setOrders(prevOrders);
      toast.error(t("productsPage.deleteError", "Ошибка удаления продукта"), {
        toastId: "orders-product-delete-error",
      });
    }
  };

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <style jsx>{`
        .delete-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(40, 40, 40, 0.18);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .delete-modal-backdrop.entering {
          opacity: 0;
        }

        .delete-modal-backdrop.entered {
          opacity: 1;
        }

        .delete-modal-backdrop.exiting {
          opacity: 0;
        }

        .delete-modal-content {
          background: #fff;
          border-radius: 18px;
          min-width: 420px;
          max-width: 520px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
          position: relative;
          overflow: hidden;
          padding: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center center;
        }

        .delete-modal-content.entering {
          opacity: 0;
          transform: scale(0.9) translateY(-20px);
        }

        .delete-modal-content.entered {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .delete-modal-content.exiting {
          opacity: 0;
          transform: scale(0.95) translateY(10px);
        }
      `}</style>

      <div className="d-flex gap-4">
        <div
          style={{
            minWidth: 350,
            maxWidth: selected ? 480 : 1200,
            width: selected ? "33%" : "100%",
            transition:
              "width 0.4s cubic-bezier(.4,0,.2,1), max-width 0.4s cubic-bezier(.4,0,.2,1)",
          }}
        >
          <div className="d-flex align-items-center mb-4">
            <Button
              variant="success"
              className="rounded-circle me-3 d-flex align-items-center justify-content-center"
              style={{
                width: 48,
                height: 48,
                fontSize: 32,
                padding: 0,
                lineHeight: 1,
              }}
              onClick={() => setShowModal(true)}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="14" cy="14" r="14" fill="none" />
                <path
                  d="M14 7V21"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M7 14H21"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </Button>
            <h2 className="mb-0" style={{ fontWeight: 700 }}>
              {t("ordersPage.title")} / {orders.length}
            </h2>
          </div>
          {loading ? (
            <div>Загрузка...</div>
          ) : (
            <OrderList
              orders={orders}
              onSelect={setSelected}
              onDelete={(order) => setOrderToDelete(order)}
              selectedOrderId={selected?.id}
              narrowList={!!selected}
            />
          )}
        </div>
        <div className="flex-grow-1" style={{ transition: "opacity 0.3s" }}>
          {selected && (
            <OrderDetails
              order={selected}
              onClose={() => setSelected(null)}
              onAddProduct={() => setShowProductModal(true)}
              onDeleteProduct={handleDeleteProduct}
            />
          )}
        </div>

        {deleteModalVisible && (
          <div
            className={`delete-modal-backdrop ${
              isDeleteModalAnimating ? "entering" : "entered"
            } ${!orderToDelete ? "exiting" : ""}`}
            onClick={handleCloseDeleteModal}
          >
            <div
              className={`delete-modal-content ${
                isDeleteModalAnimating ? "entering" : "entered"
              } ${!orderToDelete ? "exiting" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseDeleteModal}
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
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.18)";
                }}
                aria-label="Закрыть"
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
              <div style={{ padding: "38px 32px 0 32px" }}>
                <div
                  style={{ fontWeight: 700, fontSize: 24, marginBottom: 18 }}
                >
                  {t(
                    "ordersPage.deleteConfirmTitle",
                    "Вы уверены, что хотите удалить этот приход?"
                  )}
                </div>
                <div
                  style={{
                    color: "#888",
                    fontSize: 18,
                    textDecoration: "underline",
                    marginBottom: 0,
                    wordBreak: "break-word",
                  }}
                >
                  {orderToDelete?.title}
                </div>
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(90deg, #a8e063 0%, #56ab2f 100%)",
                  marginTop: 32,
                  padding: "24px 32px",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="light"
                  style={{
                    minWidth: 120,
                    marginRight: 18,
                    fontWeight: 500,
                    border: "none",
                    background: "#fff",
                    color: "#222",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onClick={handleCloseDeleteModal}
                >
                  {t("ordersPage.cancel", "Отменить")}
                </Button>
                <Button
                  variant="danger"
                  style={{
                    minWidth: 140,
                    fontWeight: 500,
                    background: "#ff4d4f",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.background = "#ff3333";
                    e.currentTarget.style.boxShadow =
                      "0 6px 12px rgba(255,77,79,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.background = "#ff4d4f";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onClick={() => handleDelete(orderToDelete)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    style={{ marginRight: 8 }}
                  >
                    <path
                      stroke="#fff"
                      strokeWidth="2"
                      d="M7 6V4.8A1.8 1.8 0 0 1 8.8 3h6.4A1.8 1.8 0 0 1 17 4.8V6m2.5 0h-15M19 6v12.2A1.8 1.8 0 0 1 17.2 20H6.8A1.8 1.8 0 0 1 5 18.2V6m3 4v6m4-6v6"
                    />
                  </svg>
                  {t("ordersPage.delete", "Удалить")}
                </Button>
              </div>
            </div>
          </div>
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {t("ordersPage.addOrder", "Добавить приход")}
            </Modal.Title>
          </Modal.Header>
          <form onSubmit={handleFormSubmit}>
            <Modal.Body>
              <div className="mb-3">
                <label className="form-label fw-bold">
                  {t("ordersPage.title", "Название прихода")}
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  minLength={2}
                  required
                  placeholder={t(
                    "ordersPage.titlePlaceholder",
                    "Введите название прихода"
                  )}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  {t("ordersPage.description", "Описание (необязательно)")}
                </label>
                <textarea
                  className="form-control"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder={t(
                    "ordersPage.descriptionPlaceholder",
                    "Описание прихода"
                  )}
                />
              </div>
              {formError && (
                <div className="alert alert-danger">{formError}</div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                {t("ordersPage.cancel", "Отмена")}
              </Button>
              <Button variant="success" type="submit">
                {t("ordersPage.save", "Сохранить")}
              </Button>
            </Modal.Footer>
          </form>
        </Modal>

        {showProductModal && (
          <Modal
            show={showProductModal}
            onHide={() => setShowProductModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {t("productsPage.addProduct", "Добавить продукт")}
              </Modal.Title>
            </Modal.Header>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setProductFormError("");
                if (!productForm.title || productForm.title.length < 2) {
                  setProductFormError(
                    t(
                      "productsPage.titleRequired",
                      "Название продукта обязательно (мин. 2 символа)"
                    )
                  );
                  return;
                }
                if (!productForm.type || productForm.type.length < 2) {
                  setProductFormError(
                    t(
                      "productsPage.typeRequired",
                      "Тип продукта обязателен (мин. 2 символа)"
                    )
                  );
                  return;
                }
                if (
                  !productForm.priceUSD ||
                  isNaN(Number(productForm.priceUSD)) ||
                  Number(productForm.priceUSD) <= 0 ||
                  !productForm.priceUAH ||
                  isNaN(Number(productForm.priceUAH)) ||
                  Number(productForm.priceUAH) <= 0
                ) {
                  setProductFormError(
                    t(
                      "productsPage.priceRequired",
                      "Цена должна быть положительным числом"
                    )
                  );
                  return;
                }
                handleAddProduct(productForm);
              }}
            >
              <Modal.Body>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    {t("productsPage.title", "Название продукта")}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={productForm.title}
                    onChange={(e) =>
                      setProductForm({ ...productForm, title: e.target.value })
                    }
                    minLength={2}
                    required
                    placeholder={t(
                      "productsPage.titlePlaceholder",
                      "Введите название продукта"
                    )}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    {t("productsPage.type", "Тип продукта")}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={productForm.type}
                    onChange={(e) =>
                      setProductForm({ ...productForm, type: e.target.value })
                    }
                    minLength={2}
                    required
                    placeholder={t(
                      "productsPage.typePlaceholder",
                      "Введите тип продукта"
                    )}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    {t("productsPage.serialNumber", "Серийный номер")}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={productForm.serialNumber}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        serialNumber: e.target.value,
                      })
                    }
                    placeholder={t(
                      "productsPage.serialNumberPlaceholder",
                      "Введите серийный номер"
                    )}
                  />
                </div>
                <div className="mb-3 row" style={{ gap: 0 }}>
                  <div
                    className="col"
                    style={{ position: "relative", minWidth: 180 }}
                  >
                    <label
                      className="form-label fw-bold"
                      style={{ fontSize: 16, marginBottom: 6 }}
                    >
                      {t("productsPage.priceUSD", "Цена (USD)")}
                    </label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#bbb",
                          fontSize: 18,
                          pointerEvents: "none",
                        }}
                      >
                        $
                      </span>
                      <input
                        type="number"
                        className="form-control"
                        style={{ paddingLeft: 32, height: 44, fontSize: 16 }}
                        value={productForm.priceUSD}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            priceUSD: e.target.value,
                          })
                        }
                        min={0}
                        required
                        placeholder={t(
                          "productsPage.priceUSDPlaceholder",
                          "Введите цену в USD"
                        )}
                      />
                    </div>
                  </div>
                  <div
                    className="col"
                    style={{ position: "relative", minWidth: 180 }}
                  >
                    <label
                      className="form-label fw-bold"
                      style={{ fontSize: 16, marginBottom: 6 }}
                    >
                      {t("productsPage.priceUAH", "Цена (UAH)")}
                    </label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#bbb",
                          fontSize: 18,
                          pointerEvents: "none",
                        }}
                      >
                        ₴
                      </span>
                      <input
                        type="number"
                        className="form-control"
                        style={{ paddingLeft: 32, height: 44, fontSize: 16 }}
                        value={productForm.priceUAH}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            priceUAH: e.target.value,
                          })
                        }
                        min={0}
                        required
                        placeholder={t(
                          "productsPage.priceUAHPlaceholder",
                          "Введите цену в UAH"
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-3 row">
                  <div className="col">
                    <label className="form-label fw-bold">
                      {t("productsPage.guaranteeStart", "Гарантия с")}
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={productForm.guaranteeStart}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          guaranteeStart: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col">
                    <label className="form-label fw-bold">
                      {t("productsPage.guaranteeEnd", "Гарантия по")}
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={productForm.guaranteeEnd}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          guaranteeEnd: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                {productFormError && (
                  <div className="text-danger mb-2">{productFormError}</div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowProductModal(false)}
                >
                  {t("productsPage.cancel", "Отмена")}
                </Button>
                <Button variant="success" type="submit">
                  {t("productsPage.save", "Сохранить")}
                </Button>
              </Modal.Footer>
            </form>
          </Modal>
        )}
      </div>
    </>
  );
};

export default OrdersClient;
