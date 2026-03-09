import deployedContracts from "~~/contracts/deployedContracts";

const localAbis = deployedContracts[31337];

export const BASE_SEPOLIA_CONTRACTS = {
  CityToken: {
    address: "0x64C31DC314b9c711e0ea3453593b7d052863dBd2" as const,
    abi: localAbis.CityToken.abi,
  },
  VoteToken: {
    address: "0xEB1fd5daf0a9900759B35103a063d783662E8412" as const,
    abi: localAbis.VoteToken.abi,
  },
  MCECredit: {
    address: "0x92f1B2B61b59235e7530F5B9Ff5f57Bec1A76BEa" as const,
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
    address: "0x173d7Af66242F474634aF126e12bB0619C3Cfda3" as const,
    abi: localAbis.OpportunityManager.abi,
  },
  RedeemerRegistry: {
    address: "0xD0aE57cf025d507907c3Fde280ADF3da73655F2e" as const,
    abi: localAbis.RedeemerRegistry.abi,
  },
  IssuerRegistryDemo: {
    address: "0x01268481C3324b7759D6A82594428c9bDe5C3645" as const,
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
    address: "0x8dA2A729772d86BF102E52c78d0e2B94035971F5" as const,
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
    address: "0x0046D2fFb701c728a24D90074F408dB87Bba2188" as const,
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
    address: "0x65f3586c7FeB476812738BF9c76A9EE558624B65" as const,
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
