// src/components/StoreProvider.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const storeRef = useRef(store);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render until client-side hydration complete
  if (!isMounted) {
    return null; // Or a skeleton/loader matching your canvas layout
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
