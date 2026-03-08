import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const rpcUrl = alchemyApiKey
  ? `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
  : baseSepolia.rpcUrls.default.http[0];

export const baseSepoliaPublicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(rpcUrl),
});
