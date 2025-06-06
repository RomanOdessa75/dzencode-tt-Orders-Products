import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OrdersClient from "./OrdersClient";

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) {
    redirect("/login");
  }
  return <OrdersClient />;
}
