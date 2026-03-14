import type { FC } from "react";
import { f2 } from "@/lib/utils";
import { EncVal } from "./Primitives";
import type { StatsBarProps } from "@/types";

const StatsBar: FC<StatsBarProps> = ({ positions }) => {
  const shownPnl = positions
    .filter((p: any) => p.shown)
    .reduce((s: number, p: any) => s + p.pnl, 0);
  const equity = 12341 + shownPnl;

  const cells: Array<{
    label: string;
    value: React.ReactNode;
    color?: string;
  }> = [
    { label: "NET EQUITY", value: `$${f2(equity)}` },
    { label: "MARGIN", value: <EncVal>SEALED</EncVal> },
    { label: "POSITIONS", value: String(positions.length) },
    { label: "NETWORK", value: "Solana", color: "text-long" },
    { label: "PRIVACY", value: "Arcium MXE", color: "text-mxe" },
    { label: "CLUSTER", value: "Mainnet-Beta" },
  ];

  return (
    <div
      className="h-stats border-t border-dim bg-surface flex items-center
                    px-3 sm:px-[18px] gap-4 sm:gap-6 flex-shrink-0 overflow-x-auto"
      style={{ scrollbarWidth: "none" }}
    >
      {cells.map(({ label, value, color }) => (
        <div key={label} className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-2xs text-muted tracking-label uppercase hidden sm:inline">
            {label}
          </span>
          <span className={`text-[10.5px] font-mono ${color ?? "text-mid"}`}>
            {value}
          </span>
        </div>
      ))}

      <div className="ml-auto flex items-center gap-2 flex-shrink-0">
        <span className="text-2xs text-mxe-dim tracking-badge hidden sm:inline">
          MPC COMPUTE
        </span>
        <div className="w-16 sm:w-24 h-0.5 bg-enc rounded-full overflow-hidden">
          <div className="h-full bg-mxe rounded-full animate-mpc-bar" />
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
