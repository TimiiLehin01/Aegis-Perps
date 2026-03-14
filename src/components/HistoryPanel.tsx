import { useState, type FC } from "react";
import { f2, fP, sign } from "@/lib/utils";
import type { ClosedTrade } from "@/types";

interface HistoryPanelProps {
  closedTrades: ClosedTrade[];
}

interface Trade {
  id: number;
  time: string;
  market: string;
  side: "LONG" | "SHORT";
  size: number;
  lev: number;
  entry: number;
  exit: number;
  pnl: number;
  pct: number;
  fee: number;
  status: "SEALED" | "REVEALED";
}

const MARKETS = [
  "ALL",
  "SOL-PERP",
  "ETH-PERP",
  "BTC-PERP",
  "JUP-PERP",
  "WIF-PERP",
];
const SIDES = ["ALL", "LONG", "SHORT"];

const Sealed = () => (
  <span
    style={{
      fontSize: "9px",
      fontFamily: "IBM Plex Mono",
      color: "#00e5ff",
      backgroundColor: "#090f1e",
      border: "1px solid #112038",
      borderRadius: "2px",
      padding: "1px 8px",
      letterSpacing: "0.08em",
    }}
  >
    ⊘ SEALED
  </span>
);

const HistoryPanel: FC<HistoryPanelProps> = ({ closedTrades }) => {
  const [marketFilter, setMarketFilter] = useState("ALL");
  const [sideFilter, setSideFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"time" | "pnl">("time");

  const closed: Trade[] = closedTrades.map((t) => ({
    id: t.id,
    time: t.time,
    market: t.market,
    side: t.side,
    size: t.size,
    lev: t.lev,
    entry: t.entry,
    exit: t.exit,
    pnl: t.pnl,
    pct: t.pct,
    fee: t.fee,
    status: t.status,
  }));

  const allTrades = [...closed];

  const filtered = allTrades
    .filter((t) => marketFilter === "ALL" || t.market === marketFilter)
    .filter((t) => sideFilter === "ALL" || t.side === sideFilter)
    .sort((a, b) => {
      if (sortBy === "pnl") {
        if (a.status === "SEALED" && b.status !== "SEALED") return 1;
        if (b.status === "SEALED" && a.status !== "SEALED") return -1;
        return b.pnl - a.pnl;
      }
      return b.id - a.id;
    });

  const revealed = filtered.filter((t) => t.status === "REVEALED");
  const totalPnl = revealed.reduce((s, t) => s + t.pnl, 0);
  const totalFees = revealed.reduce((s, t) => s + t.fee, 0);
  const winRate = revealed.length
    ? (
        (revealed.filter((t) => t.pnl > 0).length / revealed.length) *
        100
      ).toFixed(0)
    : "0";
  const sealedCount = filtered.filter((t) => t.status === "SEALED").length;

  const filterBtn = (active: boolean) => ({
    padding: "3px 10px",
    fontSize: "9px",
    fontFamily: "IBM Plex Mono",
    borderRadius: "3px",
    letterSpacing: "0.08em",
    cursor: "pointer",
    border: "none",
    backgroundColor: active ? "#182030" : "transparent",
    color: active ? "#f5a623" : "#323d54",
  });

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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
        }}
      >
        <div
          style={{
            backgroundColor: "#0b0e18",
            border: "1px solid #182030",
            borderRadius: "4px",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: "8.5px",
              color: "#323d54",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            TOTAL TRADES
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Mono",
              fontSize: "18px",
              color: "#d8e2f0",
              fontWeight: 700,
            }}
          >
            {filtered.length}
          </div>
          {sealedCount > 0 && (
            <div
              style={{ fontSize: "8.5px", color: "#00e5ff", marginTop: "4px" }}
            >
              {sealedCount} sealed
            </div>
          )}
        </div>

        <div
          style={{
            backgroundColor: "#0b0e18",
            border: "1px solid #182030",
            borderRadius: "4px",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: "8.5px",
              color: "#323d54",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            REALIZED PNL
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Mono",
              fontSize: "18px",
              color: totalPnl >= 0 ? "#00e676" : "#ff1744",
              fontWeight: 700,
            }}
          >
            {sign(totalPnl)}${f2(Math.abs(totalPnl))}
          </div>
          {sealedCount > 0 && (
            <div
              style={{ fontSize: "8.5px", color: "#323d54", marginTop: "4px" }}
            >
              Revealed trades only
            </div>
          )}
        </div>

        <div
          style={{
            backgroundColor: "#0b0e18",
            border: "1px solid #182030",
            borderRadius: "4px",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: "8.5px",
              color: "#323d54",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            TOTAL FEES
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Mono",
              fontSize: "18px",
              color: "#f5a623",
              fontWeight: 700,
            }}
          >
            ${f2(totalFees)}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#0b0e18",
            border: "1px solid #182030",
            borderRadius: "4px",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: "8.5px",
              color: "#323d54",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            WIN RATE
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Mono",
              fontSize: "18px",
              color: Number(winRate) >= 50 ? "#00e676" : "#ff1744",
              fontWeight: 700,
            }}
          >
            {winRate}%
          </div>
          {sealedCount > 0 && (
            <div
              style={{ fontSize: "8.5px", color: "#323d54", marginTop: "4px" }}
            >
              Revealed trades only
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "2px",
            backgroundColor: "#0e1220",
            border: "1px solid #182030",
            borderRadius: "4px",
            padding: "2px",
          }}
        >
          {MARKETS.map((m) => (
            <button
              key={m}
              style={filterBtn(marketFilter === m)}
              onClick={() => setMarketFilter(m)}
            >
              {m}
            </button>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            gap: "2px",
            backgroundColor: "#0e1220",
            border: "1px solid #182030",
            borderRadius: "4px",
            padding: "2px",
          }}
        >
          {SIDES.map((s) => (
            <button
              key={s}
              style={filterBtn(sideFilter === s)}
              onClick={() => setSideFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: "2px",
            backgroundColor: "#0e1220",
            border: "1px solid #182030",
            borderRadius: "4px",
            padding: "2px",
          }}
        >
          {(["time", "pnl"] as const).map((s) => (
            <button
              key={s}
              style={filterBtn(sortBy === s)}
              onClick={() => setSortBy(s)}
            >
              SORT: {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

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
            gridTemplateColumns:
              "140px 100px 60px 90px 100px 100px 110px 70px 80px",
            padding: "8px 16px",
            borderBottom: "1px solid #182030",
            backgroundColor: "#0e1220",
          }}
        >
          {[
            "TIME",
            "MARKET",
            "SIDE",
            "SIZE",
            "ENTRY",
            "EXIT",
            "PNL",
            "FEE",
            "STATUS",
          ].map((h) => (
            <div
              key={h}
              style={{
                fontSize: "8.5px",
                color: "#323d54",
                letterSpacing: "0.10em",
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div
            style={{
              padding: "32px 0",
              textAlign: "center",
              fontSize: "10px",
              color: "#323d54",
            }}
          >
            No trades yet — open a position to get started
          </div>
        )}

        {filtered.map((t) => (
          <div
            key={t.id}
            style={{
              display: "grid",
              gridTemplateColumns:
                "140px 100px 60px 90px 100px 100px 110px 70px 80px",
              padding: "7px 16px",
              borderBottom: "1px solid #0e1220",
              transition: "background 75ms",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#0e1220")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <div
              style={{
                fontSize: "10px",
                color: "#323d54",
                fontFamily: "IBM Plex Mono",
              }}
            >
              {t.time}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#6a7a9a",
                fontFamily: "IBM Plex Mono",
              }}
            >
              {t.market}
            </div>
            <div
              style={{
                fontSize: "10px",
                fontFamily: "IBM Plex Mono",
                color: t.side === "LONG" ? "#00e676" : "#ff1744",
              }}
            >
              {t.side}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#d8e2f0",
                fontFamily: "IBM Plex Mono",
              }}
            >
              {t.size} <span style={{ color: "#323d54" }}>{t.lev}×</span>
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#6a7a9a",
                fontFamily: "IBM Plex Mono",
              }}
            >
              ${fP(t.entry)}
            </div>

            <div
              style={{
                fontSize: "10px",
                color: "#6a7a9a",
                fontFamily: "IBM Plex Mono",
              }}
            >
              {t.status === "SEALED" ? <Sealed /> : `$${fP(t.exit)}`}
            </div>

            <div
              style={{
                fontSize: "10px",
                fontFamily: "IBM Plex Mono",
                fontWeight: 600,
              }}
            >
              {t.status === "SEALED" ? (
                <Sealed />
              ) : (
                <span style={{ color: t.pnl >= 0 ? "#00e676" : "#ff1744" }}>
                  {sign(t.pnl)}${f2(Math.abs(t.pnl))}
                  <span
                    style={{ fontSize: "9px", opacity: 0.6, marginLeft: "4px" }}
                  >
                    ({sign(t.pct)}
                    {Math.abs(t.pct).toFixed(1)}%)
                  </span>
                </span>
              )}
            </div>

            <div
              style={{
                fontSize: "10px",
                color: "#323d54",
                fontFamily: "IBM Plex Mono",
              }}
            >
              {t.status === "SEALED" ? "—" : `$${f2(t.fee)}`}
            </div>

            <div
              style={{
                fontSize: "9px",
                fontFamily: "IBM Plex Mono",
                color: t.status === "SEALED" ? "#00e5ff" : "#323d54",
                backgroundColor:
                  t.status === "SEALED" ? "#090f1e" : "transparent",
                border:
                  t.status === "SEALED"
                    ? "1px solid #112038"
                    : "1px solid transparent",
                borderRadius: "2px",
                padding: "1px 6px",
                width: "fit-content",
              }}
            >
              {t.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
