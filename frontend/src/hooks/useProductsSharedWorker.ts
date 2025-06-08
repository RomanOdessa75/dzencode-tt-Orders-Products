import { useEffect, useRef } from "react";

export function useProductsSharedWorker(
  onProductAdded: (product: any) => void
) {
  const workerRef = useRef<SharedWorker | null>(null);

  useEffect(() => {
    // @ts-ignore
    workerRef.current = new SharedWorker(
      new URL("../shared/ProductsSharedWorker.js", import.meta.url),
      { type: "module" }
    );
    const port = workerRef.current.port;

    port.onmessage = (event) => {
      if (event.data?.type === "PRODUCT_ADDED") {
        onProductAdded(event.data.product);
      }
    };

    port.start();

    return () => {
      port.close();
    };
  }, [onProductAdded]);

  const notifyProductAdded = (product: any) => {
    workerRef.current?.port.postMessage({ type: "PRODUCT_ADDED", product });
  };

  return { notifyProductAdded };
}
