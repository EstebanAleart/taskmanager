"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store/store";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  // Keep a stable store reference across re-renders
  const storeRef = useRef(store);
  return <Provider store={storeRef.current}>{children}</Provider>;
}
