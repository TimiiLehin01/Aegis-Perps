import type { FC } from "react";
import { fP, sign } from "@/lib/utils";
import type { Market, MarketBarProps } from "@/types";

interface TickerProps {
  markets: Market[];
}

export const Ticker: FC<TickerProps> = ({ markets }) => {
  const items = [...markets, ...markets, ...markets, ...markets];
  return (
    <div className="h-ticker border-b border-dim bg-surface flex-shrink-0 overflow-hidden flex items-center">
      <div className="flex animate-ticker whitespace-nowrap">
        {items.map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-4 sm:px-[18px] border-r border-dim h-ticker"
          >
            <span className="text-mid text-[9.5px] font-mono">{m.pair}</span>
            <span className="text-primary text-[9.5px] font-mono">
              ${fP(m.price)}
            </span>
            <span
              className={`text-[9.5px] font-mono ${m.ch >= 0 ? "text-long" : "text-short"}`}
            >
              {sign(m.ch)}
              {m.ch}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface MarketBarPropsExtended extends MarketBarProps {
  markets: Market[];
}

export const MarketBar: FC<MarketBarPropsExtended> = ({
  markets,
  active,
  onChange,
}) => (
  <div
    className="flex items-center gap-0.5 px-2 sm:px-3.5 border-b border-dim bg-surface flex-shrink-0 h-mbar overflow-x-auto"
    style={{ scrollbarWidth: "none" }}
  >
    {markets.map((m) => {
      const on = active.id === m.id;
      return (
        <button
          key={m.id}
          onClick={() => onChange(m)}
          className={`px-2.5 sm:px-3 py-1 text-md whitespace-nowrap rounded flex-shrink-0 transition-all duration-150
            ${
              on
                ? "bg-surface-2 border border-bright text-primary font-semibold"
                : "border border-transparent text-mid hover:text-primary"
            }`}
        >
          {m.pair}
          <span
            className={`ml-1 text-xs ${m.ch >= 0 ? "text-long" : "text-short"}`}
          >
            {sign(m.ch)}
            {m.ch}%
          </span>
        </button>
      );
    })}

    <div className="hidden lg:flex ml-auto gap-5 flex-shrink-0">
      {[
        { label: "24H VOL", value: `$${active.vol}` },
        { label: "OPEN INT", value: `$${active.oi}` },
        {
          label: "FUNDING",
          value: active.fund,
          cls: active.fund?.startsWith("+") ? "text-long" : "text-short",
        },
      ].map(({ label, value, cls }) => (
        <div key={label} className="text-right">
          <p className="text-2xs text-muted tracking-label uppercase">
            {label}
          </p>
          <p className={`text-[10.5px] font-mono ${cls ?? "text-mid"}`}>
            {value}
          </p>
        </div>
      ))}
    </div>
  </div>
);
