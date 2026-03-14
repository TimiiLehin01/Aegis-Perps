import type { FC } from "react";
import type { MobileNavProps, MobilePanel } from "@/types";
import {
  ChartIcon,
  MarketsIcon,
  WalletIcon,
  HistoryIcon,
  PortfolioIcon,
} from "./Primitives";

interface NavItem {
  id: MobilePanel;
  label: string;
  Icon: FC;
}

const ITEMS: NavItem[] = [
  { id: "chart", label: "Chart", Icon: ChartIcon },
  { id: "markets", label: "Markets", Icon: MarketsIcon },
  { id: "positions", label: "Positions", Icon: WalletIcon },
  { id: "portfolio", label: "Portfolio", Icon: PortfolioIcon },
  { id: "history", label: "History", Icon: HistoryIcon },
];

const MobileNav: FC<MobileNavProps> = ({ panel, onChange, positions }) => (
  <nav className="lg:hidden flex border-t border-dim bg-surface flex-shrink-0 h-mobile pb-safe">
    {ITEMS.map(({ id, label, Icon }) => {
      const active = panel === id;
      return (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5
                      py-1.5 text-2xs tracking-label uppercase transition-colors duration-150
                      ${active ? "text-amber" : "text-muted"}`}
        >
          <span className="relative">
            <Icon />
            {id === "positions" && positions > 0 && (
              <span
                className="absolute -top-1 -right-2 w-3 h-3 rounded-full bg-amber
                               text-void text-[7px] font-bold flex items-center justify-center"
              >
                {positions}
              </span>
            )}
          </span>
          <span>{label}</span>
        </button>
      );
    })}
  </nav>
);

export default MobileNav;
