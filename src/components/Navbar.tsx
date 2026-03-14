import type { FC } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

import type { NavbarProps, ActiveTab } from "@/types";
import { ArciumLogo, MxeDot } from "./Primitives";

const TABS: ActiveTab[] = ["TRADE", "PORTFOLIO", "HISTORY", "MARKETS"];

const Navbar: FC<NavbarProps> = ({ activeTab, onTabChange, mxeNodes }) => {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const shortAddress = publicKey
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : null;

  const handleWalletClick = () => {
    if (connected) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  return (
    <nav
      className="h-nav flex items-center justify-between
      px-3 sm:px-[18px] border-b border-dim bg-surface flex-shrink-0 z-10"
    >
      <div className="flex items-center gap-2">
        <ArciumLogo size={24} />
        <span className="font-display text-[18px] font-extrabold tracking-hero text-primary">
          AEGIS
          <span className="text-amber font-mono text-[9px] font-normal tracking-widest ml-2">
            perps
          </span>
        </span>
      </div>

      <div className="hidden lg:flex gap-0.5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            className={`px-3 py-1.5 text-xs tracking-label uppercase rounded transition-all duration-150
            ${
              activeTab === t
                ? "bg-amber-subtle border border-amber-dim text-amber"
                : "border border-transparent text-mid hover:text-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 bg-enc border border-enc-border rounded">
          <MxeDot />
          <span className="text-xs text-mxe tracking-label hidden sm:inline">
            ARCIUM MXE · {mxeNodes} NODES
          </span>
          <span className="text-xs text-mxe tracking-label sm:hidden">MXE</span>
        </div>

        <button
          onClick={handleWalletClick}
          className={`px-2 sm:px-3 py-1.5 text-xs tracking-label uppercase rounded
          transition-all duration-150 whitespace-nowrap
          ${
            connected
              ? "bg-long-subtle border border-long-ring text-long hover:bg-long-subtle/80"
              : "border border-amber text-amber hover:bg-amber-subtle"
          }`}
        >
          <span className="hidden sm:inline">
            {connected ? `◉ ${shortAddress}` : "Connect Wallet"}
          </span>
          <span className="sm:hidden">{connected ? "◉" : "Connect"}</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
