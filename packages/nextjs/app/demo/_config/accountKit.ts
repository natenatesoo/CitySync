import { cookieStorage, createConfig } from "@account-kit/react";
import { alchemy, baseSepolia } from "@account-kit/infra";

export const accountKitConfig = createConfig(
  {
    transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
    chain: baseSepolia,
    ssr: true,
    storage: cookieStorage,
    enablePopupOauth: true,
    policyId: process.env.NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID,
  },
  {
    auth: {
      sections: [[{ type: "email" as const }], [{ type: "passkey" as const }, { type: "social" as const }]],
      addPasskeyOnSignup: false,
    },
  },
);
