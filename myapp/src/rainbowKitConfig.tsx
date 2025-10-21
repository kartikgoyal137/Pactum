"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { arbitrum, base, mainnet, anvil, zksync, sepolia, zksyncSepoliaTestnet} from "wagmi/chains"


export default getDefaultConfig({
    appName: "Pactum",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [mainnet, arbitrum, base, zksync, sepolia, anvil, zksyncSepoliaTestnet],
    ssr: false,
})