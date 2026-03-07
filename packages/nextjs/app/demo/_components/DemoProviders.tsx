"use client";

import "@account-kit/react/styles.css";
import { AlchemyAccountProvider } from "@account-kit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { accountKitConfig } from "../_config/accountKit";
import { DemoProvider } from "../_context/DemoContext";

// Separate QueryClient scoped to the demo — avoids conflicts with Scaffold-ETH's QueryClient
const demoQueryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

export function DemoProviders({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: Parameters<typeof AlchemyAccountProvider>[0]["initialState"];
}) {
  return (
    <QueryClientProvider client={demoQueryClient}>
      <AlchemyAccountProvider config={accountKitConfig} initialState={initialState} queryClient={demoQueryClient}>
        <DemoProvider>{children}</DemoProvider>
      </AlchemyAccountProvider>
    </QueryClientProvider>
  );
}
