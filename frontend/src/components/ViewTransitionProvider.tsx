"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function ViewTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname && "startViewTransition" in document) {
      (document as any).startViewTransition(() => {});
    }
    prevPath.current = pathname;
  }, [pathname]);

  return <>{children}</>;
}
