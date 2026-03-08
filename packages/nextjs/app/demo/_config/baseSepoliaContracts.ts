import deployedContracts from "~~/contracts/deployedContracts";

const localAbis = deployedContracts[31337];

export const BASE_SEPOLIA_CONTRACTS = {
  CityToken: {
    address: "0xA1526B32AF6aA6CE824F8734E967aD410192b05c" as const,
    abi: localAbis.CityToken.abi,
  },
  VoteToken: {
    address: "0xEEa4fBc7a74504A3095AF042D487cFFf2ebff1eC" as const,
    abi: localAbis.VoteToken.abi,
  },
  MCECredit: {
    address: "0x0f62c344264eDBCDFcDF55579191557259D6Ef0D" as const,
    // Minimal ABI needed for wallet balance sync.
    abi: [
      {
        type: "function",
        name: "balanceOf",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      },
    ] as const,
  },
  OpportunityManager: {
    address: "0x613b383907275871171A8cEBD8273D965582a2ac" as const,
    abi: localAbis.OpportunityManager.abi,
  },
  RedeemerRegistry: {
    address: "0xc0DD5364670f25066f0ABEC353a9b84Bda6221d1" as const,
    abi: localAbis.RedeemerRegistry.abi,
  },
  IssuerRegistryDemo: {
    address: "0x513c1e9c303Ed184D7eed07e48555DAaCE5CEbD2" as const,
    abi: [
      {
        type: "function",
        name: "register",
        stateMutability: "nonpayable",
        inputs: [],
        outputs: [{ name: "orgName", type: "string", internalType: "string" }],
      },
      {
        type: "function",
        name: "isActiveIssuer",
        stateMutability: "view",
        inputs: [{ name: "issuer", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
      },
    ] as const,
  },
  DemoRedeemerRegistry: {
    address: "0xB9d731DE9fbe753b707ACe82E9A6C4061522240E" as const,
    abi: [
      {
        type: "function",
        name: "register",
        stateMutability: "nonpayable",
        inputs: [],
        outputs: [{ name: "orgName", type: "string", internalType: "string" }],
      },
      {
        type: "function",
        name: "setMCEOptIn",
        stateMutability: "nonpayable",
        inputs: [{ name: "accepts", type: "bool", internalType: "bool" }],
        outputs: [],
      },
      {
        type: "function",
        name: "createOffer",
        stateMutability: "nonpayable",
        inputs: [
          { name: "name", type: "string", internalType: "string" },
          { name: "description", type: "string", internalType: "string" },
          { name: "costCity", type: "uint256", internalType: "uint256" },
          { name: "mceOnly", type: "bool", internalType: "bool" },
        ],
        outputs: [{ name: "offerId", type: "uint256", internalType: "uint256" }],
      },
      {
        type: "function",
        name: "removeOffer",
        stateMutability: "nonpayable",
        inputs: [{ name: "offerId", type: "uint256", internalType: "uint256" }],
        outputs: [],
      },
      {
        type: "function",
        name: "isActiveRedeemer",
        stateMutability: "view",
        inputs: [{ name: "redeemer", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
      },
      {
        type: "function",
        name: "getAllRedeemers",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
      },
      {
        type: "function",
        name: "nextOfferId",
        stateMutability: "view",
        inputs: [{ name: "", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      },
      {
        type: "function",
        name: "getOffer",
        stateMutability: "view",
        inputs: [
          { name: "redeemer", type: "address", internalType: "address" },
          { name: "offerId", type: "uint256", internalType: "uint256" },
        ],
        outputs: [
          {
            name: "",
            type: "tuple",
            internalType: "struct DemoRedeemerRegistry.Offer",
            components: [
              { name: "name", type: "string", internalType: "string" },
              { name: "description", type: "string", internalType: "string" },
              { name: "costCity", type: "uint256", internalType: "uint256" },
              { name: "active", type: "bool", internalType: "bool" },
              { name: "mceOnly", type: "bool", internalType: "bool" },
            ],
          },
        ],
      },
      {
        type: "function",
        name: "getProfile",
        stateMutability: "view",
        inputs: [{ name: "redeemer", type: "address", internalType: "address" }],
        outputs: [
          {
            name: "",
            type: "tuple",
            internalType: "struct DemoRedeemerRegistry.RedeemerProfile",
            components: [
              { name: "orgName", type: "string", internalType: "string" },
              { name: "registeredAt", type: "uint64", internalType: "uint64" },
              { name: "active", type: "bool", internalType: "bool" },
              { name: "acceptsMCECredits", type: "bool", internalType: "bool" },
            ],
          },
        ],
      },
    ] as const,
  },
  MCERedemption: {
    address: "0xdf218F9963a53A26a75e7E78E6D657030cda71CD" as const,
    abi: [
      {
        type: "function",
        name: "purchaseOffer",
        stateMutability: "nonpayable",
        inputs: [
          { name: "redeemer", type: "address", internalType: "address" },
          { name: "offerId", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "receiptId", type: "uint256", internalType: "uint256" }],
      },
    ] as const,
  },
  Redemption: {
    address: "0xc7C285d9454251896c4F11C075D7A0Bcc3910C6D" as const,
    abi: [
      {
        type: "function",
        name: "purchaseOffer",
        stateMutability: "nonpayable",
        inputs: [
          { name: "redeemer", type: "address", internalType: "address" },
          { name: "offerId", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "receiptId", type: "uint256", internalType: "uint256" }],
      },
    ] as const,
  },
} as const;

export type DemoOfferRoute = {
  redeemer: `0x${string}`;
  offerId: bigint;
  mode: "city" | "mce";
};

/**
 * Optional mapping for participant redemption routing:
 * key = mock offer id (e.g. "offer-1"), value = onchain redeemer + offer id.
 *
 * Set via env as JSON:
 * NEXT_PUBLIC_DEMO_OFFER_ROUTES='{"offer-1":{"redeemer":"0x...","offerId":"1","mode":"city"}}'
 */
export const DEMO_OFFER_ROUTES: Record<string, DemoOfferRoute> = (() => {
  const raw = process.env.NEXT_PUBLIC_DEMO_OFFER_ROUTES;
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<
      string,
      { redeemer: `0x${string}`; offerId: string | number; mode: "city" | "mce" }
    >;
    const routes: Record<string, DemoOfferRoute> = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (!value?.redeemer || !value?.offerId || !value?.mode) continue;
      routes[key] = {
        redeemer: value.redeemer,
        offerId: BigInt(value.offerId),
        mode: value.mode,
      };
    }

    return routes;
  } catch {
    return {};
  }
})();
