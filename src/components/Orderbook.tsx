import type { FC } from "react";
import { fP, f2 } from "@/lib/utils";
import { LockIcon, PanelHeader } from "./Primitives";
import { useOrderbook } from "@/hooks";
import type { OrderbookProps } from "@/types";

interface BookLevel {
  price: number;
  size: number;
  cum: number;
}

const DepthRow: FC<{ row: BookLevel; side: "ask" | "bid"; maxCum: number }> = ({
  row,
  side,
  maxCum,
}) => {
  const pct = Math.min(100, (row.cum / maxCum) * 100);
  return (
    <div className="depth-row">
      <div
        className={`absolute top-0 bottom-0 right-0 opacity-[0.07] ${side === "ask" ? "bg-short" : "bg-long"}`}
        style={{ width: `${pct}%` }}
      />
      <span className={`z-10 ${side === "ask" ? "text-short" : "text-long"}`}>
        {fP(row.price)}
      </span>
      <span className="text-mid z-10">{f2(row.size)}</span>
      <span className="text-muted text-right z-10">{f2(row.cum / 1000)}k</span>
    </div>
  );
};

const Orderbook: FC<OrderbookProps> = ({ market }) => {
  const book = useOrderbook(market);
  const maxCum = Math.max(book.asks[0]?.cum ?? 0, book.bids.at(-1)?.cum ?? 0);

  const asks: BookLevel[] = book.asks.map((r) => ({ ...r, cum: r.cum ?? 0 }));
  const bids: BookLevel[] = book.bids.map((r) => ({ ...r, cum: r.cum ?? 0 }));

  return (
    <div className="border-r border-dim flex flex-col overflow-hidden h-full">
      <PanelHeader title="Order Book" badge="PRIVATE DEPTH" />

      <div
        className="grid grid-cols-ob-row px-3 py-1.5 border-b border-dim
                      text-xs text-muted tracking-label uppercase flex-shrink-0"
      >
        <span>Price</span>
        <span>Size</span>
        <span className="text-right">Cum.</span>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col justify-end min-h-0">
        {asks.map((r, i) => (
          <DepthRow key={i} row={r} side="ask" maxCum={maxCum} />
        ))}
      </div>

      <div
        className="flex items-center justify-between px-3 py-1.5
                      bg-surface-2 border-y border-dim flex-shrink-0"
      >
        <span className="font-mono text-xl font-semibold text-primary">
          {fP(market.price)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted tracking-badge">SPREAD</span>
          <span
            className={`text-sm ${market.ch >= 0 ? "text-long" : "text-short"}`}
          >
            {market.ch >= 0 ? "+" : ""}
            {market.ch}%
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {bids.map((r, i) => (
          <DepthRow key={i} row={r} side="bid" maxCum={maxCum} />
        ))}
      </div>

      <div className="px-3 py-1.5 border-t border-dim flex items-center gap-1.5 bg-surface flex-shrink-0">
        <LockIcon size={9} className="text-mxe-dim" />
        <span className="text-xs text-mxe-dim tracking-badge">
          Individual orders protected by Arcium MXE
        </span>
      </div>
    </div>
  );
};

export default Orderbook;
