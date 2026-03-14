import type { FC } from "react";
import type { Position } from "@/types";
import { f2, sign } from "@/lib/utils";

interface PortfolioPanelProps {
  positions: Position[];
}

const EQUITY_POINTS = Array.from({ length: 30 }, (_, i) => {
  const base = 10000;
  const noise = (Math.random() - 0.4) * 400;
  return base + i * 95 + noise;
});

const W = 600,
  H = 80;
const minE = Math.min(...EQUITY_POINTS);
const maxE = Math.max(...EQUITY_POINTS);
const toX = (i: number) => (i / (EQUITY_POINTS.length - 1)) * W;
const toY = (v: number) => H - ((v - minE) / (maxE - minE)) * H;
const pathD = EQUITY_POINTS.map(
  (v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`,
).join(" ");
const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`;

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

const Card: FC<{
  label: string;
  children: React.ReactNode;
  cyan?: boolean;
}> = ({ label, children, cyan }) => (
  <div
    style={{
      backgroundColor: cyan ? "#090f1e" : "#0b0e18",
      border: `1px solid ${cyan ? "#112038" : "#182030"}`,
      borderRadius: "6px",
      padding: "14px 16px",
    }}
  >
    <div
      style={{
        fontSize: "8.5px",
        color: "#323d54",
        letterSpacing: "0.10em",
        textTransform: "uppercase",
        marginBottom: "8px",
      }}
    >
      {label}
    </div>
    {children}
  </div>
);

const BigVal: FC<{ value: string; color?: string }> = ({
  value,
  color = "#d8e2f0",
}) => (
  <div
    style={{
      fontFamily: "IBM Plex Mono",
      fontSize: "20px",
      fontWeight: 700,
      color,
    }}
  >
    {value}
  </div>
);

const PortfolioPanel: FC<PortfolioPanelProps> = ({ positions }) => {
  const revealedPnl = positions
    .filter((p) => p.shown)
    .reduce((s: number, p) => s + p.pnl, 0);
  const sealedCount = positions.filter((p) => !p.shown).length;
  const totalEquity = 12910 + revealedPnl;
  const margin = positions.reduce((s, p) => s + p.entry * p.size, 0);
  const marginPct = totalEquity > 0 ? (margin / totalEquity) * 100 : 0;

  const allSealed = sealedCount === positions.length && positions.length > 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}
      >
        <Card label="Net Equity">
          <BigVal value={`$${f2(totalEquity)}`} />
          {sealedCount > 0 && (
            <div
              style={{ fontSize: "8px", color: "#00e5ff", marginTop: "4px" }}
            >
              +{sealedCount} sealed excluded
            </div>
          )}
        </Card>

        <Card label="Unrealized PnL" cyan>
          {allSealed ? (
            <>
              <Sealed />
              <div
                style={{ fontSize: "8px", color: "#323d54", marginTop: "6px" }}
              >
                Reveal in Positions
              </div>
            </>
          ) : (
            <>
              <BigVal
                value={`${sign(revealedPnl)}$${f2(Math.abs(revealedPnl))}`}
                color={revealedPnl >= 0 ? "#00e676" : "#ff1744"}
              />
              {sealedCount > 0 && (
                <div
                  style={{
                    fontSize: "8px",
                    color: "#00e5ff",
                    marginTop: "4px",
                  }}
                >
                  +{sealedCount} still sealed
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}
      >
        <Card label="Margin Used">
          <BigVal value={`$${f2(margin)}`} color="#f5a623" />
        </Card>
        <Card label="Margin Ratio">
          <BigVal
            value={`${marginPct.toFixed(1)}%`}
            color={marginPct > 70 ? "#ff1744" : "#00e676"}
          />
        </Card>
      </div>

      <Card label="Equity Curve · 30D · Realized Only">
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: "8px",
              color: "#00e5ff",
              fontFamily: "IBM Plex Mono",
            }}
          >
            Arcium MXE protected
          </span>
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="64"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="eq-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e676" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#00e676" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#eq-grad)" />
          <path d={pathD} fill="none" stroke="#00e676" strokeWidth="1.5" />
        </svg>
      </Card>

      <Card label="Open Positions">
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {positions.length === 0 ? (
            <div
              style={{
                fontSize: "10px",
                color: "#323d54",
                textAlign: "center",
                padding: "12px 0",
              }}
            >
              No open positions
            </div>
          ) : (
            positions.map((p) => (
              <div key={p.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#6a7a9a",
                      fontFamily: "IBM Plex Mono",
                    }}
                  >
                    {p.market}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: "IBM Plex Mono",
                      color: p.side === "LONG" ? "#00e676" : "#ff1744",
                    }}
                  >
                    {p.side} {p.lev}x
                  </span>
                  {p.shown ? (
                    <span
                      style={{
                        fontSize: "10px",
                        fontFamily: "IBM Plex Mono",
                        color: p.pnl >= 0 ? "#00e676" : "#ff1744",
                      }}
                    >
                      {sign(p.pnl)}${f2(Math.abs(p.pnl))}
                    </span>
                  ) : (
                    <Sealed />
                  )}
                </div>
                <div
                  style={{
                    height: "2px",
                    backgroundColor: "#182030",
                    borderRadius: "1px",
                  }}
                >
                  {p.shown ? (
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(100, Math.abs(p.pnl) / 20)}%`,
                        backgroundColor: p.pnl >= 0 ? "#00e676" : "#ff1744",
                        borderRadius: "1px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        width: "100%",
                        background:
                          "repeating-linear-gradient(90deg,#00e5ff10 0px,#00e5ff10 4px,transparent 4px,transparent 8px)",
                        borderRadius: "1px",
                      }}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default PortfolioPanel;
