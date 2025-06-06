import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) {
    redirect("/login");
  }
  return <ProductsClient />;
}
