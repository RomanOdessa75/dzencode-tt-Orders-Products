"use client";

import NavigationMenu from "@/components/NavigationMenu";
import TopMenu from "@/components/TopMenu";
import React from "react";
import ViewTransitionProvider from "@/components/ViewTransitionProvider";

export default function ClientLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitionProvider>
      <div className="d-flex vh-100">
        <div
          style={{
            position: "sticky",
            top: 0,
            alignSelf: "flex-start",
            zIndex: 100,
          }}
        >
          <NavigationMenu />
        </div>
        <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
          <div style={{ position: "sticky", top: 0, zIndex: 101 }}>
            <TopMenu />
          </div>
          <main
            className="flex-grow-1 p-3"
            style={{
              backgroundColor: "#f0f2f5",
              overflowY: "auto",
              minHeight: 0,
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </ViewTransitionProvider>
  );
}
