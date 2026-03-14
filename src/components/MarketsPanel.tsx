import { useState, type FC } from "react";
import { MARKETS } from "@/data/markets";
import { fP, sign } from "@/lib/utils";
import type { Market } from "@/types";

interface MarketsPanelProps {
  active: Market;
  onChange: (m: Market) => void;
  markets: Market[];
}

type SortKey = "pair" | "price" | "ch" | "vol" | "oi" | "fund";

const EXTENDED_MARKETS = [
  ...MARKETS,
  {
    id: "BONK",
    pair: "BONK-PERP",
    price: 0.0000182,
    ch: +8.44,
    vol: "44M",
    oi: "12M",
    fund: "+0.0300%",
  },
  {
    id: "PYTH",
    pair: "PYTH-PERP",
    price: 0.3841,
    ch: -2.11,
    vol: "28M",
    oi: "8M",
    fund: "-0.0080%",
  },
  {
    id: "RAY",
    pair: "RAY-PERP",
    price: 4.821,
    ch: +1.88,
    vol: "62M",
    oi: "18M",
    fund: "+0.0120%",
  },
  {
    id: "ORCA",
    pair: "ORCA-PERP",
    price: 3.142,
    ch: -0.55,
    vol: "19M",
    oi: "5M",
    fund: "-0.0040%",
  },
  {
    id: "MNGO",
    pair: "MNGO-PERP",
    price: 0.0281,
    ch: +3.22,
    vol: "8M",
    oi: "2M",
    fund: "+0.0200%",
  },
];

const MarketsPanel: FC<MarketsPanelProps> = ({ active, onChange, markets }) => {
  const [sortKey, setSortKey] = useState<SortKey>("vol");
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState("");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const sorted = [...EXTENDED_MARKETS]
    .filter((m) => m.pair.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av =
        sortKey === "pair"
          ? a.pair
          : sortKey === "fund"
            ? parseFloat(a.fund ?? "0")
            : (a as any)[sortKey];
      const bv =
        sortKey === "pair"
          ? b.pair
          : sortKey === "fund"
            ? parseFloat(b.fund ?? "0")
            : (b as any)[sortKey];
      return sortAsc ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });

  const colHdr = (label: string, key: SortKey) => (
    <div
      key={key}
      onClick={() => handleSort(key)}
      style={{
        fontSize: "8.5px",
        color: sortKey === key ? "#f5a623" : "#323d54",
        letterSpacing: "0.10em",
        cursor: "pointer",
        userSelect: "none",
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {label} {sortKey === key ? (sortAsc ? "↑" : "↓") : ""}
    </div>
  );

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search markets..."
          style={{
            backgroundColor: "#0b0e18",
            border: "1px solid #243050",
            borderRadius: "3px",
            padding: "7px 12px",
            color: "#d8e2f0",
            fontFamily: "IBM Plex Mono",
            fontSize: "11px",
            width: "200px",
          }}
        />
        <div
          style={{
            fontSize: "9px",
            color: "#323d54",
            fontFamily: "IBM Plex Mono",
          }}
        >
          {sorted.length} MARKETS · SOLANA · ARCIUM PRIVATE
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "16px" }}>
          {[
            { label: "24H VOLUME", value: "$25.4B" },
            { label: "OPEN INTEREST", value: "$13.1B" },
            { label: "ACTIVE TRADERS", value: "48,291" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "8.5px",
                  color: "#323d54",
                  letterSpacing: "0.10em",
                  marginBottom: "2px",
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono",
                  fontSize: "13px",
                  color: "#d8e2f0",
                  fontWeight: 600,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: "#0b0e18",
          border: "1px solid #182030",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 120px 90px 100px 100px 90px 1fr",
            gap: "0",
            padding: "8px 16px",
            borderBottom: "1px solid #182030",
            backgroundColor: "#0e1220",
          }}
        >
          {colHdr("MARKET", "pair")}
          {colHdr("PRICE", "price")}
          {colHdr("24H CHG", "ch")}
          {colHdr("VOLUME", "vol")}
          {colHdr("OPEN INT.", "oi")}
          {colHdr("FUNDING", "fund")}
          <div
            style={{
              fontSize: "8.5px",
              color: "#323d54",
              letterSpacing: "0.10em",
            }}
          >
            ACTION
          </div>
        </div>

        {sorted.map((m) => {
          const isActive = m.id === active.id;
          return (
            <div
              key={m.id}
              onClick={() => {
                const full =
                  markets.find((x) => x.id === m.id) ??
                  EXTENDED_MARKETS.find((x) => x.id === m.id);
                if (full) onChange(full);
              }}
              style={{
                display: "grid",
                gridTemplateColumns: "160px 120px 90px 100px 100px 90px 1fr",
                padding: "10px 16px",
                borderBottom: "1px solid #0e1220",
                backgroundColor: isActive ? "#0e1220" : "transparent",
                transition: "background 75ms",
                cursor: "pointer",
                borderLeft: isActive
                  ? "2px solid #f5a623"
                  : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.backgroundColor = "#0b0f1a";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: isActive ? "#f5a623" : "#182030",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "IBM Plex Mono",
                    fontSize: "11px",
                    color: isActive ? "#f5a623" : "#d8e2f0",
                    fontWeight: isActive ? 700 : 400,
                  }}
                >
                  {m.pair}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono",
                  fontSize: "11px",
                  color: "#d8e2f0",
                }}
              >
                ${fP(m.price)}
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: m.ch >= 0 ? "#00e676" : "#ff1744",
                }}
              >
                {sign(m.ch)}
                {m.ch}%
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono",
                  fontSize: "11px",
                  color: "#6a7a9a",
                }}
              >
                ${m.vol}
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono",
                  fontSize: "11px",
                  color: "#6a7a9a",
                }}
              >
                ${m.oi ?? "—"}
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono",
                  fontSize: "11px",
                  color: parseFloat(m.fund ?? "0") >= 0 ? "#00e676" : "#ff1744",
                }}
              >
                {m.fund ?? "—"}
              </div>
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const full =
                      markets.find((x) => x.id === m.id) ??
                      EXTENDED_MARKETS.find((x) => x.id === m.id);
                    if (full) onChange(full);
                  }}
                  style={{
                    padding: "3px 12px",
                    fontSize: "9px",
                    fontFamily: "IBM Plex Mono",
                    letterSpacing: "0.08em",
                    borderRadius: "3px",
                    cursor: "pointer",
                    backgroundColor: isActive ? "#f5a62320" : "transparent",
                    border: `1px solid ${isActive ? "#f5a623" : "#243050"}`,
                    color: isActive ? "#f5a623" : "#6a7a9a",
                  }}
                >
                  {isActive ? "TRADING" : "TRADE"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketsPanel;
