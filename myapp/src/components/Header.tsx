"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import "../app/globals.css"

export default function Header() {
    return (
        <nav className="px-8 py-4.5 border-b-[1px] border-zinc-100 flex flex-row justify-between items-center bg-black xl:min-h-[77px]">
            <div className="flex items-center gap-4">
                <ConnectButton />
            </div>
        </nav>
    )
}