import { useState, type FC } from "react";
import { f2, fP, sign } from "@/lib/utils";
import { EncVal, PanelHeader, StatCell, MxeDot } from "./Primitives";
import type { PositionsPanelProps, Position } from "@/types";

const PositionCard: FC<{
  pos: Position;
  onReveal: (id: number) => void;
  onClose: (id: number) => void;
}> = ({ pos, onReveal, onClose }) => {
  const [hov, setHov] = useState(false);
  const isLong = pos.side === "LONG";
  const isProfit = pos.pnl >= 0;
  const health = Math.min(100, 62 + Math.abs(pos.id % 23));

  const sideCls = isLong
    ? "text-long border-long-ring bg-long-subtle"
    : "text-short border-short-ring bg-short-subtle";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`border rounded-md bg-surface-2 overflow-hidden mb-2 transition-colors duration-200
        ${hov ? "border-bright" : "border-dim"}`}
    >
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
        <span className="font-display text-lg font-bold text-primary">
          {pos.market}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs tracking-label px-2 py-px rounded-sm border ${sideCls}`}
          >
            {pos.side} {pos.lev}×
          </span>
          <button
            onClick={() => onClose(pos.id)}
            className="text-xs text-mid border border-dim px-2 py-px rounded-sm
                       tracking-badge hover:text-primary hover:border-bright transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2col px-3 gap-x-3 gap-y-1.5 pb-2">
        {[
          { label: "Size", value: <EncVal>● ● ● ● ●</EncVal> },
          { label: "Entry", value: `$${fP(pos.entry)}` },
          { label: "Mark", value: `$${fP(pos.mark)}` },
          { label: "Liq. Price", value: <EncVal>SHIELDED</EncVal> },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-muted tracking-label uppercase mb-0.5">
              {label}
            </p>
            <p className="text-md text-mid font-mono">{value}</p>
          </div>
        ))}
      </div>

      {(pos.tp || pos.sl) && (
        <div className="flex items-center gap-2 px-3 pb-2">
          {pos.tp && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "rgba(52,211,153,0.08)",
                border: "1px solid rgba(52,211,153,0.25)",
                borderRadius: "6px",
                padding: "3px 8px",
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  color: "#34d399",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                }}
              >
                TP
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "#34d399",
                  fontFamily: "IBM Plex Mono",
                }}
              >
                ${fP(pos.tp)}
              </span>
            </div>
          )}
          {pos.sl && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.25)",
                borderRadius: "6px",
                padding: "3px 8px",
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  color: "#f43f5e",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                }}
              >
                SL
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "#f43f5e",
                  fontFamily: "IBM Plex Mono",
                }}
              >
                ${fP(pos.sl)}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="px-3 pb-2.5">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-muted tracking-label uppercase">
            Margin Health
          </span>
          <span
            className={`text-xs ${health > 60 ? "text-long" : "text-amber"}`}
          >
            {health > 60 ? "HEALTHY" : "CAUTION"}
          </span>
        </div>
        <div className="h-0.5 bg-dim rounded-full overflow-hidden">
          <div
            className="h-full health-gradient rounded-full transition-all duration-700"
            style={{ width: `${health}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-2 border-t border-dim bg-surface">
        <span className="text-xs text-muted tracking-label uppercase">
          Unrealized PnL
        </span>
        {pos.shown ? (
          <span
            className={`text-lg font-semibold font-mono ${isProfit ? "text-long" : "text-short"}`}
          >
            {sign(pos.pnl)}${f2(Math.abs(pos.pnl))}
            <span className="text-xs ml-1 opacity-70">
              ({sign(pos.pct)}
              {pos.pct.toFixed(2)}%)
            </span>
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            <EncVal variant="amber">SEALED</EncVal>
            <button
              onClick={() => onReveal(pos.id)}
              className="text-xs text-amber bg-amber-subtle border border-amber-dim
                         px-2 py-px rounded-sm tracking-label uppercase hover:bg-amber-glow transition-colors"
            >
              REVEAL
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1.5 border-t border-dim bg-mxe-subtle">
        <span className="w-1 h-1 rounded-full bg-mxe-dim flex-shrink-0" />
        <span className="text-xs text-mxe-dim tracking-badge">
          Liquidation check sealed — price unknown to validators
        </span>
      </div>
    </div>
  );
};

const PositionsPanel: FC<PositionsPanelProps> = ({
  positions,
  onReveal,
  onClose,
}) => {
  const shownPnl = positions
    .filter((p: any) => p.shown)
    .reduce((s: number, p: any) => s + p.pnl, 0);

  return (
    <div className="border-l border-dim flex flex-col overflow-hidden h-full">
      <PanelHeader title={`Positions (${positions.length})`} badge="SHIELDED" />

      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        {positions.length === 0 ? (
          <p className="text-center text-muted text-md pt-10 font-mono">
            No open positions
          </p>
        ) : (
          positions.map((p) => (
            <PositionCard
              key={p.id}
              pos={p}
              onReveal={onReveal}
              onClose={onClose}
            />
          ))
        )}
      </div>

      <div className="px-3 py-2.5 border-t border-dim bg-surface flex-shrink-0">
        <div className="grid grid-cols-2col gap-2 mb-2">
          <StatCell
            label="Unrealized PnL"
            value={
              shownPnl !== 0
                ? `${sign(shownPnl)}$${f2(Math.abs(shownPnl))}`
                : "⊘ SEALED"
            }
            color={shownPnl >= 0 ? "text-long" : "text-short"}
          />
          <StatCell label="Available" value="$12,341.00" />
          <StatCell label="Margin" value={<EncVal>SEALED</EncVal>} />
          <StatCell label="Active" value={`${positions.length} pos`} />
        </div>
        <div className="flex items-center gap-1.5 pt-2 border-t border-dim">
          <MxeDot />
          <span className="text-xs text-mxe-dim tracking-badge">
            Secured by Arcium · Solana Mainnet
          </span>
        </div>
      </div>
    </div>
  );
};

export default PositionsPanel;
