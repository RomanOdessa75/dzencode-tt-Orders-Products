"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { lazy } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ProductList from "@/components/ProductList";
import { apiFetch } from "@/lib/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/i18n/i18n";

const ProductTypeChart = lazy(() => import("@/components/ProductTypeChart"));

const ProductsClient = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "",
    serialNumber: "",
    priceUSD: "",
    priceUAH: "",
    guaranteeStart: "",
    guaranteeEnd: "",
    orderId: "",
  });
  const [formError, setFormError] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [ready, setReady] = useState(false);
  const productTypes = Array.from(
    new Set(products.map((p) => p.type).filter(Boolean))
  );
  const filteredProducts = selectedType
    ? products.filter((p) => p.type === selectedType)
    : products;
  const [typeStats, setTypeStats] = useState<Record<string, number>>({});
  const workerRef = useRef<Worker | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).i18next?.isInitialized)
      setReady(true);
    else if ((window as any).i18next)
      (window as any).i18next.on("initialized", () => setReady(true));
    else setReady(true);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setLoading(true);
    apiFetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error(t("productsPage.loadError", "Ошибка загрузки продуктов"), {
          toastId: "products-load-error",
        });
      });
    apiFetch(`${API_URL}/api/orders`)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL("@/lib/productStats.worker.ts", import.meta.url),
        { type: "module" }
      );
    }
    const worker = workerRef.current;
    worker.onmessage = (e: MessageEvent) => {
      setTypeStats(e.data.typeCounts || {});
    };
    worker.postMessage({ products: filteredProducts });
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [filteredProducts]);

  const handleAdd = async (productData: any) => {
    try {
      const newProduct = {
        title: productData.title,
        type: productData.type,
        serialNumber: Number(productData.serialNumber),
        isNew: true,
        specification: "",
        orderId: Number(productData.orderId),
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
      const res = await apiFetch(`${API_URL}/api/products`, {
        method: "POST",
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("productsPage.addError"));
      setProducts([data, ...products]);
      toast.success(t("productsPage.addSuccess", "Продукт успешно добавлен"), {
        toastId: "products-add-success",
      });
      setShowModal(false);
      setForm({
        title: "",
        type: "",
        serialNumber: "",
        priceUSD: "",
        priceUAH: "",
        guaranteeStart: "",
        guaranteeEnd: "",
        orderId: "",
      });
      setFormError("");
    } catch (e: any) {
      setFormError(
        e.message || t("productsPage.addError", "Ошибка добавления продукта")
      );
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.title || form.title.length < 2) {
      setFormError(
        t(
          "productsPage.titleRequired",
          "Название продукта обязательно (мин. 2 символа)"
        )
      );
      return;
    }
    if (!form.type || form.type.length < 2) {
      setFormError(
        t(
          "productsPage.typeRequired",
          "Тип продукта обязателен (мин. 2 символа)"
        )
      );
      return;
    }
    if (
      !form.priceUSD ||
      isNaN(Number(form.priceUSD)) ||
      Number(form.priceUSD) <= 0 ||
      !form.priceUAH ||
      isNaN(Number(form.priceUAH)) ||
      Number(form.priceUAH) <= 0
    ) {
      setFormError(
        t("productsPage.priceRequired", "Цена должна быть положительным числом")
      );
      return;
    }
    handleAdd(form);
  };

  const handleDelete = async (product: any) => {
    const prevProducts = products;
    setProducts(products.filter((p) => p.id !== product.id));
    try {
      const res = await apiFetch(`${API_URL}/api/products/${product.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success(t("productsPage.deleteSuccess", "Продукт успешно удален"), {
        toastId: "products-delete-success",
      });
    } catch {
      setProducts(prevProducts);
      toast.error(t("productsPage.deleteError", "Ошибка удаления продукта"), {
        toastId: "products-delete-error",
      });
    }
  };

  return (
    <div>
      {!ready ? (
        <div>Loading...</div>
      ) : (
        <div>
          <div className="d-flex align-items-center mb-4 ps-4">
            <h2 className="mb-0" style={{ fontWeight: 700 }}>
              {t("productsPage.title")} / {filteredProducts.length}
            </h2>
            <select
              className="form-select ms-5"
              style={{ width: 180, maxWidth: 220 }}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">{t("productsPage.allTypes", "Все типы")}</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <Suspense fallback={<div>Загрузка графика...</div>}>
              <ProductTypeChart
                products={filteredProducts}
                typeStats={typeStats}
              />
            </Suspense>
          </div>
          {loading ? (
            <div>Загрузка...</div>
          ) : (
            <ProductList products={filteredProducts} onDelete={handleDelete} />
          )}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>
                {t("productsPage.addProduct", "Добавить продукт")}
              </Modal.Title>
            </Modal.Header>
            <form onSubmit={handleFormSubmit}>
              <Modal.Body>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    {t("productsPage.title", "Название продукта")}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
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
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
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
                    value={form.serialNumber}
                    onChange={(e) =>
                      setForm({ ...form, serialNumber: e.target.value })
                    }
                    placeholder={t(
                      "productsPage.serialNumberPlaceholder",
                      "Введите серийный номер"
                    )}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    {t("productsPage.order", "Приход")}
                  </label>
                  <select
                    className="form-select"
                    value={form.orderId}
                    onChange={(e) =>
                      setForm({ ...form, orderId: e.target.value })
                    }
                    required
                  >
                    <option value="">
                      {t("productsPage.selectOrder", "Выберите приход")}
                    </option>
                    {orders.map((order: any) => (
                      <option key={order.id} value={order.id}>
                        {order.title}
                      </option>
                    ))}
                  </select>
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
                        value={form.priceUSD}
                        onChange={(e) =>
                          setForm({ ...form, priceUSD: e.target.value })
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
                        value={form.priceUAH}
                        onChange={(e) =>
                          setForm({ ...form, priceUAH: e.target.value })
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
                      value={form.guaranteeStart}
                      onChange={(e) =>
                        setForm({ ...form, guaranteeStart: e.target.value })
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
                      value={form.guaranteeEnd}
                      onChange={(e) =>
                        setForm({ ...form, guaranteeEnd: e.target.value })
                      }
                    />
                  </div>
                </div>
                {formError && (
                  <div className="text-danger mb-2">{formError}</div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  {t("productsPage.cancel", "Отмена")}
                </Button>
                <Button variant="success" type="submit">
                  {t("productsPage.save", "Сохранить")}
                </Button>
              </Modal.Footer>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default ProductsClient;
