import { headers } from "next/headers";
import { cookieToInitialState } from "@account-kit/core";
import { accountKitConfig } from "./_config/accountKit";
import { DemoProviders } from "./_components/DemoProviders";

export const metadata = {
  title: "City/Sync Demo",
  description: "Explore the City/Sync civic participation protocol — choose a role and try it live.",
};

export default async function DemoLayout({ children }: { children: React.ReactNode }) {
  const initialState = cookieToInitialState(accountKitConfig, (await headers()).get("cookie") ?? undefined);

  return <DemoProviders initialState={initialState}>{children}</DemoProviders>;
}
